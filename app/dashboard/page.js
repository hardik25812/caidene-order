'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, CreditCard, Calendar, Inbox, LogOut, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Fetch subscription data
      try {
        const response = await fetch(`/api/subscription?user_id=${session.user.id}`);
        const data = await response.json();
        if (data.subscription) {
          setSubscription(data.subscription);
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
      }

      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => authSubscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleManageBilling = async () => {
    if (!subscription?.stripe_customer_id) return;

    setPortalLoading(true);
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: subscription.stripe_customer_id,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error accessing billing portal:', err);
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      canceled: { label: 'Canceled', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      past_due: { label: 'Past Due', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      trialing: { label: 'Trial', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      incomplete: { label: 'Incomplete', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DeliverOn</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Manage your subscription and account</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Info */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-500">Email</p>
                  <p className="text-white">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Account ID</p>
                  <p className="text-zinc-400 text-sm font-mono">{user?.id?.slice(0, 8)}...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Status</span>
                    {getStatusBadge(subscription.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Plan</span>
                    <span className="text-white">{subscription.plan_name || 'Growth'}</span>
                  </div>
                  {subscription.current_period_end && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Renews</span>
                      <span className="text-white">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-zinc-400">No active subscription</p>
                  <Link href="/order">
                    <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inbox Info */}
          {subscription && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-purple-400" />
                  Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Domains</span>
                    <span className="text-white">{subscription.inbox_count || 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Total Inboxes</span>
                    <span className="text-white">{(subscription.inbox_count || 1) * 100}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Monthly Emails</span>
                    <span className="text-white">{((subscription.inbox_count || 1) * 15000).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Management */}
          {subscription && subscription.stripe_customer_id && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Billing
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Manage your payment method, view invoices, and update subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Manage Billing
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Help Section */}
        <Card className="mt-6 bg-zinc-900 border-zinc-800">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-medium">Need help?</h3>
                <p className="text-zinc-400 text-sm">Our team is available 24/7 via WhatsApp</p>
              </div>
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
