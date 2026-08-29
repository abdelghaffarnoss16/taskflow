export default function EmptyState({
  title = 'Nothing here yet',
  message,
}: {
  title?: string
  message?: string
}) {
  return (
    <div className="state-container state-empty">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  )
}
