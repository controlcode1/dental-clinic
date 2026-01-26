import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
    console.warn('Stripe publishable key is missing')
}

export const stripePromise = loadStripe(stripePublishableKey)

export const createCheckoutSession = async (clinicId, plan) => {
    const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clinicId, plan }),
    })

    const session = await response.json()
    return session
}
