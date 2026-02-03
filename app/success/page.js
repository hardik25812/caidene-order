'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Mail, Clock, ArrowRight, Sparkles, Globe, Package } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <Link href="/order" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-semibold text-white tracking-tight">DeliverOn</span>
        </Link>

        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm card-glow">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl text-white font-semibold">Payment Successful!</CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              Thank you for your order. We're getting things ready for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {loading ? (
              <div className="text-center py-6">
                <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Loading order details...</p>
              </div>
            ) : sessionData ? (
              <div className="bg-slate-800/30 rounded-xl p-5 space-y-4 border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400 text-sm">Email</span>
                  </div>
                  <span className="text-white font-medium">{sessionData.customer_email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400 text-sm">Plan</span>
                  </div>
                  <span className="text-white font-medium">Growth</span>
                </div>
                {sessionData.inbox_count && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-400 text-sm">Domains</span>
                    </div>
                    <span className="text-white font-medium">{sessionData.inbox_count}</span>
                  </div>
                )}
              </div>
            ) : null}

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">What happens next?</h4>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                    Our team will provision your domains and inboxes within 48 hours. You'll receive an email with setup instructions once everything is ready.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-xl p-5 space-y-4 border border-slate-700/50">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Next Steps
              </h4>
              <ul className="space-y-3 text-sm stagger-children">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center text-xs font-semibold text-indigo-400">1</span>
                  <span className="text-slate-300">Check your email for a confirmation receipt</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center text-xs font-semibold text-indigo-400">2</span>
                  <span className="text-slate-300">Our team will provision your infrastructure</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center text-xs font-semibold text-indigo-400">3</span>
                  <span className="text-slate-300">Receive setup instructions within 48 hours</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center text-xs font-semibold text-emerald-400">4</span>
                  <span className="text-slate-300">Start sending at scale!</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white py-5 font-medium btn-glow shadow-lg shadow-indigo-500/20">
                  Sign in to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/order">
                <Button variant="outline" className="w-full border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors py-5">
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
