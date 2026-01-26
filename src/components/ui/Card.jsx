export const Card = ({ children, hover = false, className = '', ...props }) => {
    return (
        <div
            className={`${hover ? 'card-hover' : 'card'} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}
