'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/checkout/session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setSessionData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/order" aria-label="DeliverOn home">
            <img
              src="https://framerusercontent.com/images/4xMhy82Xz334ZgDkWW9tGUV0iI.png?scale-down-to=512"
              alt="DeliverOn logo"
              className="h-9 w-auto mx-auto"
            />
          </Link>
        </div>

        <div className="bg-[#020202] border border-[#363636] rounded-[20px] p-8 lg:p-12 shadow-glow-blue">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.15)] rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-filled text-[2.5rem] text-[#34d399]">check_circle</span>
            </div>
            <h1 className="font-heading text-[clamp(1.25rem,3vw,1.75rem)] font-bold tracking-[-0.03em] text-[#f2f2f2]">Payment Successful!</h1>
            <p className="font-body text-[0.9375rem] text-[#969696] mt-2">Thank you for your order. We&apos;re getting things ready for you.</p>
          </div>

          {/* Order Details */}
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-pulse font-body text-[#727272]">Loading order details...</div>
            </div>
          ) : sessionData ? (
            <div className="bg-[#020202] rounded-xl p-4 border border-[#363636] mb-6">
              <div className="space-y-3">
                <div className="flex justify-between font-body text-[0.875rem]">
                  <span className="text-[#969696]">Email</span>
                  <span className="text-[#f2f2f2] font-mono">{sessionData.customer_email}</span>
                </div>
                <div className="flex justify-between font-body text-[0.875rem]">
                  <span className="text-[#969696]">Plan</span>
                  <span className="text-[#f2f2f2]">Growth</span>
                </div>
                {sessionData.inbox_count && (
                  <div className="flex justify-between font-body text-[0.875rem]">
                    <span className="text-[#969696]">Domains</span>
                    <span className="text-[#f2f2f2] font-mono">{sessionData.inbox_count}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* What's Next */}
          <div className="bg-[rgba(33,122,255,0.06)] border border-[rgba(33,122,255,0.15)] rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-filled text-xl text-[#217aff] mt-0.5 flex-shrink-0">schedule</span>
              <div>
                <h4 className="font-body text-[0.9375rem] font-semibold text-[#f2f2f2]">What happens next?</h4>
                <p className="font-body text-[0.8125rem] text-[#969696] mt-1 leading-[1.6]">
                  Our team will provision your domains and inboxes within 48 hours. You&apos;ll receive an email with setup instructions once everything is ready.
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-8">
            <h4 className="font-body text-[0.9375rem] font-semibold text-[#f2f2f2] flex items-center gap-2">
              <span className="material-symbols-filled text-lg text-[#217aff]">auto_awesome</span>
              Next Steps
            </h4>
            <div className="space-y-2">
              {[
                'Check your email for a confirmation receipt',
                'Our team will provision your infrastructure',
                'Receive setup instructions within 48 hours',
                'Start sending at scale!'
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-[rgba(33,122,255,0.1)] border border-[rgba(33,122,255,0.15)] rounded-full flex items-center justify-center text-xs text-[#217aff] font-mono font-medium">
                    {i + 1}
                  </span>
                  <span className="font-body text-[0.8125rem] text-[#969696]">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/login" className="block">
              <button className="do-btn do-btn--primary w-full">
                Sign in to Dashboard
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </Link>
            <Link href="/order" className="block">
              <button className="do-btn do-btn--secondary w-full">
                <span className="material-symbols-outlined text-base">shopping_cart</span>
                Order More Domains
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="animate-pulse font-body text-[#727272]">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
