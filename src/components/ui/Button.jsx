export const Button = ({
    children,
    variant = 'primary',
    loading = false,
    disabled = false,
    type = 'button',
    onClick,
    className = '',
    ...props
}) => {
    const baseClasses = 'btn'

    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger',
    }

    const variantClass = variants[variant] || variants.primary

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClass} ${className} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            {...props}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>جاري المعالجة...</span>
                </div>
            ) : (
                children
            )}
        </button>
    )
}
