export default function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="state-container">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  )
}
