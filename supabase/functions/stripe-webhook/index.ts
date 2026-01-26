import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2022-11-15',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)

        console.log(`Received event: ${event.type}`)

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object

                // Get clinic_id from metadata
                const clinicId = session.metadata?.clinic_id
                const plan = session.metadata?.plan

                if (!clinicId) {
                    throw new Error('Missing clinic_id in session metadata')
                }

                // Create subscription record
                const { error: subError } = await supabase
                    .from('subscriptions')
                    .insert([
                        {
                            clinic_id: clinicId,
                            stripe_subscription_id: session.subscription,
                            stripe_customer_id: session.customer,
                            plan: plan,
                            status: 'active',
                            current_period_start: new Date(session.subscription_data?.trial_end || Date.now()),
                            current_period_end: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
                        },
                    ])

                if (subError) throw subError

                // Update clinic subscription status
                const { error: clinicError } = await supabase
                    .from('clinics')
                    .update({
                        subscription_status: 'active',
                        subscription_plan: plan,
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription,
                        subscription_expires_at: new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
                    })
                    .eq('id', clinicId)

                if (clinicError) throw clinicError

                // Create payment record
                await supabase.from('payments').insert([
                    {
                        clinic_id: clinicId,
                        stripe_payment_intent_id: session.payment_intent,
                        amount: (session.amount_total || 0) / 100,
                        currency: session.currency?.toUpperCase() || 'USD',
                        status: 'paid',
                        payment_method: 'card',
                        description: `Subscription payment - ${plan}`,
                    },
                ])

                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object

                // Update subscription status
                await supabase
                    .from('subscriptions')
                    .update({
                        status: subscription.status,
                        current_period_start: new Date(subscription.current_period_start * 1000),
                        current_period_end: new Date(subscription.current_period_end * 1000),
                        cancel_at_period_end: subscription.cancel_at_period_end,
                    })
                    .eq('stripe_subscription_id', subscription.id)

                // Update clinic status if subscription cancelled or expired
                if (['canceled', 'past_due', 'unpaid'].includes(subscription.status)) {
                    await supabase
                        .from('clinics')
                        .update({
                            subscription_status: subscription.status === 'canceled' ? 'cancelled' : 'past_due',
                        })
                        .eq('stripe_subscription_id', subscription.id)
                }

                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object

                // Update subscription status
                await supabase
                    .from('subscriptions')
                    .update({ status: 'cancelled' })
                    .eq('stripe_subscription_id', subscription.id)

                // Update clinic status
                await supabase
                    .from('clinics')
                    .update({ subscription_status: 'inactive' })
                    .eq('stripe_subscription_id', subscription.id)

                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object

                // Update clinic status
                await supabase
                    .from('clinics')
                    .update({ subscription_status: 'past_due' })
                    .eq('stripe_customer_id', invoice.customer)

                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (err) {
        console.error('Webhook error:', err)
        return new Response(
            JSON.stringify({ error: err.message }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
