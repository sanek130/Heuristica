import { Component } from 'react';

/** Перехватывает ошибки рендера и показывает заглушку вместо белого экрана. */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI error:', error, errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
          Произошла ошибка интерфейса. Обновите страницу.
        </div>
      );
    }
    return this.props.children;
  }
}
