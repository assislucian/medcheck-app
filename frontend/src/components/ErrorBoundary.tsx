import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error information for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo,
    });

    // You could also send error to a reporting service
    // reportError(error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
          <Alert variant="destructive" className="max-w-md mb-4">
            <AlertTitle>Ocorreu um erro inesperado</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'Algo deu errado ao carregar esta página.'}
            </AlertDescription>
          </Alert>

          <div className="mt-4 bg-muted/50 p-4 rounded-md max-w-md max-h-[200px] overflow-auto text-xs font-mono">
            <details>
              <summary className="cursor-pointer">Detalhes técnicos</summary>
              <p className="mt-2">
                {this.state.error?.stack || 'Nenhum detalhe disponível'}
              </p>
              {this.state.errorInfo && (
                <p className="mt-2">{this.state.errorInfo.componentStack}</p>
              )}
            </details>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              onClick={this.resetErrorBoundary}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>

            <Button asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Voltar ao Início
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC to wrap components with ErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
}
