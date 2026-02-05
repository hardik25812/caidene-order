'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, Mail, Shield, Zap, Clock, Users, ChevronRight, Sparkles, ArrowRight, Globe, Server, Inbox, TrendingUp } from 'lucide-react';
import Link from 'next/link';

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
    { icon: Inbox, text: '100 Microsoft inboxes per domain' },
    { icon: Mail, text: '15,000 emails per domain monthly' },
    { icon: Shield, text: 'Full DNS authentication (SPF, DKIM, DMARC)' },
    { icon: Globe, text: 'Custom tracking domains' },
    { icon: Server, text: 'Sequencer integration included' },
    { icon: Zap, text: 'Warmup and sending configured' },
    { icon: Users, text: '24/7 WhatsApp support' },
  ];

  const stats = [
    { value: '10M+', label: 'Emails Sent' },
    { value: '99.2%', label: 'Deliverability' },
    { value: '500+', label: 'Happy Clients' },
    { value: '48hrs', label: 'Setup Time' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">DELIVERON</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#pricing" className="text-gray-400 hover:text-white text-sm">Pricing</a>
            <a href="#features" className="text-gray-400 hover:text-white text-sm">Features</a>
            <Link href="/login" className="text-gray-400 hover:text-white text-sm">Sign In</Link>
            <Link href="/login">
              <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-black font-medium">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Hero Content */}
          <div>
            <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20 mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              Enterprise Grade Infrastructure
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Scale Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                Cold Outreach
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Dedicated Microsoft inboxes built for volume. 100 per domain, fully authenticated, warming and ready to send in 48 hours.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {stats.map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a href="#pricing">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-black font-semibold px-8">
                  Start Scaling
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#151515]">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Right - Pricing Card */}
          <div id="pricing">
            <Card className="bg-[#111111] border-[#1a1a1a] overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 px-6 py-4 border-b border-[#1a1a1a]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-400 text-sm font-medium">Growth Plan</p>
                    <p className="text-gray-500 text-xs">Most popular for scaling teams</p>
                  </div>
                  <Badge className="bg-teal-500 text-black">Popular</Badge>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                {/* Price */}
                <div className="text-center py-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-white">${pricePerDomain}</span>
                    <span className="text-gray-500">/domain/month</span>
                  </div>
                </div>

                {/* Domain Selector */}
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#1a1a1a]">
                  <Label className="text-gray-400 text-sm">Number of Domains</Label>
                  <div className="flex items-center gap-4 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 border-[#2a2a2a] bg-transparent text-white hover:bg-[#1a1a1a]"
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
                      className="text-center bg-[#111111] border-[#2a2a2a] text-white text-lg font-semibold"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 border-[#2a2a2a] bg-transparent text-white hover:bg-[#1a1a1a]"
                      onClick={() => setInboxCount(Math.min(100, inboxCount + 1))}
                      disabled={inboxCount >= 100}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    = {inboxCount * 100} total inboxes • {(inboxCount * 15000).toLocaleString()} emails/month
                  </p>
                </div>

                {/* Total */}
                <div className="bg-teal-500/10 rounded-xl p-4 border border-teal-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Monthly Total</span>
                    <span className="text-3xl font-bold text-white">${totalPrice}<span className="text-sm text-gray-500">/mo</span></span>
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <Label className="text-gray-400 text-sm">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-teal-500"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                {/* CTA Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-black py-6 text-lg font-semibold"
                >
                  {loading ? 'Processing...' : 'Continue to Checkout'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-center text-xs text-gray-600">
                  Secure payment via Stripe • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-[#1a1a1a] py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Everything You Need to Scale</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Get enterprise-grade email infrastructure without the enterprise complexity.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="bg-[#111111] border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors">
                <CardContent className="p-5">
                  <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-teal-400" />
                  </div>
                  <p className="text-gray-300 text-sm">{feature.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-[#1a1a1a] py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 items-center">
            <div className="flex items-center gap-2 text-gray-500">
              <Shield className="w-5 h-5 text-teal-500" />
              <span className="text-sm">Secure Payment via Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-5 h-5 text-teal-500" />
              <span className="text-sm">48-Hour Setup</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="w-5 h-5 text-teal-500" />
              <span className="text-sm">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <TrendingUp className="w-5 h-5 text-teal-500" />
              <span className="text-sm">99.2% Deliverability</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600 text-sm">© {new Date().getFullYear()} DeliverOn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
