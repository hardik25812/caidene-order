'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Mail, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-white">Payment Successful!</CardTitle>
          <CardDescription className="text-zinc-400">
            Thank you for your order. We're getting things ready for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-pulse text-zinc-400">Loading order details...</div>
            </div>
          ) : sessionData ? (
            <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Email</span>
                <span className="text-white">{sessionData.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Plan</span>
                <span className="text-white">Growth</span>
              </div>
              {sessionData.inbox_count && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Domains</span>
                  <span className="text-white">{sessionData.inbox_count}</span>
                </div>
              )}
            </div>
          ) : null}

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-white font-medium">What happens next?</h4>
                <p className="text-zinc-400 text-sm mt-1">
                  Our team will provision your domains and inboxes within 48 hours. You'll receive an email with setup instructions once everything is ready.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              Next Steps
            </h4>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-xs text-purple-400">1</span>
                Check your email for a confirmation receipt
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-xs text-purple-400">2</span>
                Our team will provision your infrastructure
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-xs text-purple-400">3</span>
                Receive setup instructions within 48 hours
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center text-xs text-purple-400">4</span>
                Start sending at scale!
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                Sign in to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/order">
              <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                Order More Domains
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
