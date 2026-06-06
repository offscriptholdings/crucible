export default function App() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--sans)',
      }}
    >
      <p
        data-testid="shell-loaded"
        className="serif"
        style={{ fontSize: 36, color: 'var(--ink)', margin: 0, fontStyle: 'italic' }}
      >
        Crucible
      </p>
    </div>
  )
}
