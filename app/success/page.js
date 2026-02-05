'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, ArrowRight, Package, Mail, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/order" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">DELIVERON</span>
          </Link>
        </div>

        <Card className="bg-[#111111] border-[#1a1a1a]">
          <CardContent className="p-8">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-teal-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
              <p className="text-gray-400 mt-2">Thank you for your order. We're getting things ready for you.</p>
            </div>

            {/* Order Details */}
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-pulse text-gray-500">Loading order details...</div>
              </div>
            ) : sessionData ? (
              <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#1a1a1a] mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-white">{sessionData.customer_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan</span>
                    <span className="text-white">Growth</span>
                  </div>
                  {sessionData.inbox_count && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Domains</span>
                      <span className="text-white">{sessionData.inbox_count}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* What's Next */}
            <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium">What happens next?</h4>
                  <p className="text-gray-400 text-sm mt-1">
                    Our team will provision your domains and inboxes within 48 hours. You'll receive an email with setup instructions once everything is ready.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
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
                    <span className="w-6 h-6 bg-teal-500/10 rounded-full flex items-center justify-center text-xs text-teal-400 font-medium">
                      {i + 1}
                    </span>
                    <span className="text-gray-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button className="w-full bg-teal-500 hover:bg-teal-600 text-black font-medium">
                  Sign in to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/order" className="block">
                <Button variant="outline" className="w-full border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1a1a1a]">
                  <Package className="w-4 h-4 mr-2" />
                  Order More Domains
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
