export const Input = ({
    label,
    error,
    type = 'text',
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`input-field ${error ? 'border-red-500' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    )
}
