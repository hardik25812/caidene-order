'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, Clock, ArrowRight, Sparkles, Globe, Package, Zap } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <Link href="/order" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-semibold text-white tracking-tight">DeliverOn</span>
        </Link>

        <div className="card-elevated rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-[hsl(222,47%,12%)]">
            <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
            <p className="text-[hsl(215,20%,55%)] mt-2">
              Thank you for your order. We're getting things ready for you.
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="text-center py-6">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[hsl(215,20%,55%)] text-sm">Loading order details...</p>
              </div>
            ) : sessionData ? (
              <div className="rounded-xl bg-[hsl(222,47%,9%)] border border-[hsl(222,47%,14%)] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[hsl(215,20%,50%)]" />
                    <span className="text-[hsl(215,20%,55%)] text-sm">Email</span>
                  </div>
                  <span className="text-white font-medium">{sessionData.customer_email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[hsl(215,20%,50%)]" />
                    <span className="text-[hsl(215,20%,55%)] text-sm">Plan</span>
                  </div>
                  <span className="text-white font-medium">Growth</span>
                </div>
                {sessionData.inbox_count && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[hsl(215,20%,50%)]" />
                      <span className="text-[hsl(215,20%,55%)] text-sm">Domains</span>
                    </div>
                    <span className="text-white font-medium">{sessionData.inbox_count}</span>
                  </div>
                )}
              </div>
            ) : null}

            {/* What happens next */}
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">What happens next?</h4>
                  <p className="text-[hsl(215,20%,55%)] text-sm mt-1 leading-relaxed">
                    Our team will provision your domains and inboxes within 48 hours. You'll receive an email with setup instructions once everything is ready.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="rounded-xl bg-[hsl(222,47%,9%)] border border-[hsl(222,47%,14%)] p-5 space-y-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Next Steps
              </h4>
              <ul className="space-y-3 text-sm">
                {[
                  { num: 1, text: 'Check your email for a confirmation receipt', color: 'blue' },
                  { num: 2, text: 'Our team will provision your infrastructure', color: 'blue' },
                  { num: 3, text: 'Receive setup instructions within 48 hours', color: 'blue' },
                  { num: 4, text: 'Start sending at scale!', color: 'emerald' },
                ].map((step) => (
                  <li key={step.num} className="flex items-center gap-3">
                    <span className={`w-6 h-6 ${step.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'} rounded-lg flex items-center justify-center text-xs font-semibold`}>
                      {step.num}
                    </span>
                    <span className="text-[hsl(215,20%,70%)]">{step.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/login">
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold btn-primary shadow-lg shadow-blue-600/20">
                  Sign in to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/order">
                <Button
                  variant="outline"
                  className="w-full h-12 border-[hsl(222,47%,18%)] text-[hsl(215,20%,60%)] hover:text-white hover:bg-[hsl(222,47%,12%)]"
                >
                  Order More Domains
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
