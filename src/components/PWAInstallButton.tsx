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
        className={`btn-press inline-flex items-center gap-2 rounded-[2px] px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 min-h-[40px] ${
          onDark
            ? 'bg-[#1F1D1C] border border-white/20 text-white hover:border-[#FCDC00]'
            : 'bg-[#151515] text-white hover:bg-[#1F1D1C]'
        }`}
      >
        <Download className="w-3.5 h-3.5 text-[#FCDC00]" strokeWidth={1.5} />
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
          className={`btn-press inline-flex items-center gap-1.5 rounded-[2px] px-3 py-2 text-xs font-medium whitespace-nowrap shrink-0 min-h-[40px] ${
            onDark
              ? 'border border-white/20 bg-[#1F1D1C] text-white hover:border-[#FCDC00]'
              : 'border border-[#151515]/20 bg-white text-[#151515] hover:border-[#151515]'
          }`}
        >
          <Share className="w-3.5 h-3.5 text-[#151515]" strokeWidth={1.5} />
          <span>{compact ? 'Install' : 'Add to Home'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#151515]/75 p-4">
            <div className="w-full max-w-sm rounded-[2px] bg-white border border-[#151515]/20 p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-light text-[#151515]">Install on iPhone or iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close installation guide"
                  className="p-2 -m-2 text-[#6B6A67] hover:text-[#151515]"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
              <ol className="mt-4 space-y-2.5 text-sm text-[#151515] list-decimal list-inside">
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
                className="btn-press mt-5 w-full rounded-[2px] bg-[#FCDC00] py-2.5 text-sm font-semibold text-[#151515] hover:bg-[#e8ca00] min-h-[44px]"
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
