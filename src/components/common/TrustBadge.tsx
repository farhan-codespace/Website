import React, { useState } from 'react';
import { ShieldCheck, Lock, Cpu, EyeOff, CheckCircle2, X, ChevronRight, Info } from 'lucide-react';

interface TrustBadgeProps {
  className?: string;
  variant?: 'prominent' | 'compact' | 'hero';
}

export function TrustBadge({ className = '', variant = 'prominent' }: TrustBadgeProps) {
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>100% Client-Side & Secure • Files Never Leave Your Device</span>
      </div>
    );
  }

  return (
    <>
      <div
        className={`w-full rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 p-4 sm:p-5 shadow-xl backdrop-blur-md transition-all hover:border-emerald-500/50 ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-extrabold text-white tracking-wide uppercase">
                  100% Client-Side & Secure — Files Never Leave Your Device
                </span>
              </div>
              <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed">
                All document processing, merging, and compression executes strictly in your local browser RAM via WebAssembly. Zero files or telemetry uploaded.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSecurityModal(true)}
            className="self-start sm:self-center shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 group cursor-pointer"
          >
            <span>Verify Security</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Security Verification Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Client-Side Architecture Guarantee</h3>
                  <p className="text-xs text-slate-400">Zero backend storage • Strict privacy by design</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Local WebAssembly & Canvas Engine</h4>
                  <p className="text-slate-400 mt-0.5">
                    Your PDF files are converted, merged, and compressed directly on your CPU/GPU using in-browser WebAssembly and HTML5 Canvas APIs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <EyeOff className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Zero Server Ingestion or Transit</h4>
                  <p className="text-slate-400 mt-0.5">
                    Open your browser DevTools (F12) Network tab. When you process a file, zero bytes are transmitted to any remote cloud API.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">GDPR, HIPAA & CCPA Friendly</h4>
                  <p className="text-slate-400 mt-0.5">
                    Because sensitive data never leaves your device sandbox, you can safely process financial records, legal contracts, and medical IDs without compliance risk.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSecurityModal(false)}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/25"
              >
                Understood & Verified
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
