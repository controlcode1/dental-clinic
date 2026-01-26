export const Select = ({
    label,
    error,
    options = [],
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
            <select
                className={`input-field ${error ? 'border-red-500' : ''} ${className}`}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    )
}
