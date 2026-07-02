import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Что-то пошло не так</h2>
          <p style={{ color: '#e17055' }}>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '8px 24px' }}>
            Перезагрузить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
