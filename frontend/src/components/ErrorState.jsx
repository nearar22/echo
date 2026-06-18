import { Component } from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { addressUrl, CONTRACT_ADDRESS } from '../lib/contract.js';

// Inline error panel with a Retry action and an explorer link. Used when a read
// fails so the surface degrades gracefully instead of going blank.
export function ErrorState({ message, onRetry }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border-2 border-ink/80 bg-cream-panel p-8 text-center shadow-block-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink/80 bg-sunflower">
        <AlertTriangle size={26} className="text-ink" />
      </span>
      <h2 className="mt-4 font-display text-2xl font-extrabold text-ink">The read stumbled</h2>
      <p className="mt-2 text-sm text-ink-soft">
        {message || 'The table could not be read from the chain right now.'}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink/90 bg-magenta px-5 py-2.5 text-sm font-bold text-cream-panel transition hover:bg-magenta-soft"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        )}
        <a
          href={addressUrl(CONTRACT_ADDRESS)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink/80 bg-cream px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-cream-deep"
        >
          <ExternalLink size={15} />
          View contract
        </a>
      </div>
    </div>
  );
}

// A class error boundary so a render-time exception in the table does not take
// the whole app down. Offers a reload path and an explorer link.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-5 py-10">
          <ErrorState
            message="Something broke while rendering the table. Try again, or inspect the contract on the explorer."
            onRetry={this.handleReset}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
