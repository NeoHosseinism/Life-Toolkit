import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center p-12 gap-4 text-muted-foreground">
          <AlertTriangle className="w-10 h-10 text-destructive opacity-60" />
          <p className="text-sm font-medium text-center">Something went wrong in this section.</p>
          {this.state.error && (
            <p className="text-xs text-muted-foreground/60 font-mono max-w-xs text-center break-all">
              {this.state.error.message}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={this.reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
