import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  /** Ixtiyoriy maxsus fallback UI */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global xato chegarasi (Error Boundary).
 * Post-render runtime xatoni ushlaydi va butun SPA "oq ekran"ga aylanishining oldini oladi.
 * Xato logger orqali yoziladi; foydalanuvchiga qayta yuklash imkoni beriladi.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Render xatosi (ErrorBoundary)', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  private handleReload = (): void => {
    // Holatni tozalab qayta ko'rsatishga urinamiz; muvaffaqiyatsiz bo'lsa — to'liq reload.
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-foreground">Nimadir xato ketdi</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Kutilmagan xatolik yuz berdi. Sahifani qayta yuklab ko'ring. Muammo takrorlansa,
            qo'llab-quvvatlash xizmatiga murojaat qiling.
          </p>
        </div>
        <button
          type="button"
          onClick={this.handleReload}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Sahifani qayta yuklash
        </button>
      </main>
    );
  }
}
