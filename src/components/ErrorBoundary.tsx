import React from 'react';
import { MINISTRY_IDENTITY } from '@/src/constants/ministry';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      let friendlyMessage =
        'Something went wrong while loading this section. Please refresh or return to the home screen.';
      if (this.state.message.includes('permission') || this.state.message.includes('PERMISSION_DENIED')) {
        friendlyMessage =
          'You do not have permission to access this protected ministry record. Please sign in with an authorized account.';
      }

      return (
        <div className="min-h-screen bg-[#F0F0EE] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#151515]/15 rounded-[2px] p-8 text-center space-y-5">
            <div className="w-20 h-20 mx-auto bg-[#151515] p-2 flex items-center justify-center">
              <img
                src={MINISTRY_IDENTITY.logoUrl}
                alt="Bornfree Global Ministry Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-light text-[#151515]">
              Unable to Complete Request
            </h1>
            <p className="text-sm text-[#6B6A67] leading-relaxed">{friendlyMessage}</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.href = '/';
              }}
              className="btn-press inline-flex items-center justify-center px-6 py-2.5 rounded-[2px] bg-[#FCDC00] text-[#151515] text-sm font-semibold hover:bg-[#e8ca00] min-h-[44px]"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
