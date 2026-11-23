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
        <div className="min-h-screen bg-[#F4F2EC] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-white p-1.5 border border-[#E5E7EB] flex items-center justify-center">
              <img
                src={MINISTRY_IDENTITY.logoUrl}
                alt="Bornfree Global Ministry Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold text-[#26364A]">
              Unable to Complete Request
            </h1>
            <p className="text-sm text-[#68717D] leading-relaxed">{friendlyMessage}</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.href = '/';
              }}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#B99A55] text-[#1D2939] text-sm font-semibold hover:bg-[#c5a764] transition-colors min-h-[44px]"
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
