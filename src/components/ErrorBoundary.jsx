import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
          <p className="text-red-400 font-semibold text-sm">Something went wrong</p>
          <pre className="text-xs text-tac-400 bg-tac-800 border border-tac-700 rounded-xl p-4 max-w-xl w-full overflow-auto whitespace-pre-wrap">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="px-4 py-2 bg-flo text-tac-950 text-sm font-bold rounded-xl"
          >
            Dismiss
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
