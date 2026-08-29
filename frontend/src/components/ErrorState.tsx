export default function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="state-container state-error">
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
