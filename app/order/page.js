'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Mail, Shield, Zap, Clock, Users } from 'lucide-react';

export default function OrderPage() {
  const [email, setEmail] = useState('');
  const [inboxCount, setInboxCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pricePerDomain = 49;
  const totalPrice = pricePerDomain * inboxCount;

  const handleCheckout = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          inboxCount,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    '100 Microsoft inboxes per domain',
    '15,000 emails per domain monthly',
    'Full DNS authentication (SPF, DKIM, DMARC)',
    'Custom tracking domains',
    'Sequencer integration included',
    'Warmup and sending settings configured',
    '24/7 WhatsApp support',
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DeliverOn</span>
          </div>
          <a href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign In
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full text-sm text-zinc-400 mb-6">
          <Zap className="w-4 h-4 text-purple-500" />
          ENTERPRISE GRADE INFRASTRUCTURE
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Cold Emails
          <br />
          <span className="gradient-text">Do At Scale</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Dedicated Microsoft inboxes built for volume. 100 per domain, fully authenticated, warming and ready to send in 48 hours.
        </p>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-8" id="pricing">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Transparent Pricing Built to Scale</h2>
        <p className="text-zinc-400 text-center mb-12">Start scaling your outbound today</p>

        <div className="max-w-lg mx-auto">
          <Card className="bg-zinc-900 border-purple-500/50 card-glow">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm mx-auto mb-4">
                <Zap className="w-3 h-3" />
                Popular
              </div>
              <CardTitle className="text-2xl text-white">Growth</CardTitle>
              <CardDescription className="text-zinc-400">
                For teams ready to scale outbound with dedicated infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white">${pricePerDomain}</span>
                  <span className="text-zinc-400">/domain/month</span>
                </div>
              </div>

              {/* Domain Selector */}
              <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
                <Label className="text-white">Number of Domains</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 border-zinc-700 text-white"
                    onClick={() => setInboxCount(Math.max(1, inboxCount - 1))}
                    disabled={inboxCount <= 1}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={inboxCount}
                    onChange={(e) => setInboxCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="text-center bg-zinc-800 border-zinc-700 text-white text-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 border-zinc-700 text-white"
                    onClick={() => setInboxCount(Math.min(100, inboxCount + 1))}
                    disabled={inboxCount >= 100}
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-zinc-400">
                  = {inboxCount * 100} total inboxes | {(inboxCount * 15000).toLocaleString()} emails/month
                </p>
              </div>

              {/* Total */}
              <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300">Monthly Total</span>
                  <span className="text-2xl font-bold text-white">${totalPrice}/mo</span>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              {/* CTA Button */}
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold btn-glow transition-all"
              >
                {loading ? 'Processing...' : 'Continue to Checkout'}
              </Button>

              {/* Features List */}
              <div className="space-y-3 pt-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          <div className="flex items-center gap-2 text-zinc-400">
            <Shield className="w-5 h-5 text-purple-500" />
            <span className="text-sm">Secure Payment via Stripe</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-sm">48-Hour Setup</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Users className="w-5 h-5 text-purple-500" />
            <span className="text-sm">24/7 Support</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-zinc-500 text-sm">
          © {new Date().getFullYear()} DeliverOn. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
