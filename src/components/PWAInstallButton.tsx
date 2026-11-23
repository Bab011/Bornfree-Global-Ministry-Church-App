import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '@/src/hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean; onDark?: boolean }> = ({
  compact = false,
  onDark = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
          onDark
            ? 'bg-[#1D2939] border border-white/15 text-white hover:bg-[#1D2939]/80'
            : 'bg-[#26364A] text-white hover:bg-[#1D2939]'
        }`}
      >
        <Download className="w-3.5 h-3.5 text-[#B99A55]" />
        <span>{compact ? 'Install' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
            onDark
              ? 'border border-white/15 bg-[#1D2939] text-white hover:bg-[#1D2939]/80'
              : 'border border-[#E5E7EB] bg-white text-[#252B33] hover:bg-[#E5E7EB]/50'
          }`}
        >
          <Share className="w-3.5 h-3.5 text-[#B99A55]" />
          <span>{compact ? 'Install' : 'Add to Home'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D2939]/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-[#26364A]">Install on iPhone or iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close installation guide"
                  className="p-2 -m-2 text-[#68717D] hover:text-[#252B33]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-2.5 text-sm text-[#252B33] list-decimal list-inside">
                <li>
                  Tap the <strong>Share</strong> button in your Safari toolbar.
                </li>
                <li>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </li>
                <li>
                  Tap <strong>Add</strong> to keep Bornfree Global Ministry on your home screen.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-[#B99A55] py-2.5 text-sm font-semibold text-[#1D2939] hover:bg-[#c5a764] transition-colors min-h-[44px]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
