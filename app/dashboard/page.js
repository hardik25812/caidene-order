'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  CreditCard, 
  Calendar, 
  Inbox, 
  LogOut, 
  ExternalLink, 
  Loader2,
  Package,
  TrendingUp,
  Settings,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
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
      active: { label: 'Active', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
      canceled: { label: 'Canceled', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
      past_due: { label: 'Past Due', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
      trialing: { label: 'Trial', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      incomplete: { label: 'Incomplete', className: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">DELIVERON</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/order">
              <Button variant="outline" size="sm" className="border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#151515]">
                <Package className="w-4 h-4 mr-2" />
                Order More
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
          <p className="text-gray-500 mt-1">Manage your subscription and account settings</p>
        </div>

        {/* Quick Stats */}
        {subscription && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Domains</p>
                    <p className="text-3xl font-bold text-white mt-1">{subscription.inbox_count || 1}</p>
                  </div>
                  <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-teal-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Inboxes</p>
                    <p className="text-3xl font-bold text-white mt-1">{(subscription.inbox_count || 1) * 100}</p>
                  </div>
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <Inbox className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Monthly Emails</p>
                    <p className="text-3xl font-bold text-white mt-1">{((subscription.inbox_count || 1) * 15000).toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Info */}
          <Card className="bg-[#111111] border-[#1a1a1a]">
            <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-teal-400" />
              </div>
              <h3 className="font-semibold text-white">Account</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                  <span className="text-gray-500">Email</span>
                  <span className="text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Account ID</span>
                  <span className="text-gray-400 text-sm font-mono">{user?.id?.slice(0, 8)}...</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card className="bg-[#111111] border-[#1a1a1a]">
            <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-green-400" />
              </div>
              <h3 className="font-semibold text-white">Subscription</h3>
            </div>
            <CardContent className="p-6">
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                    <span className="text-gray-500">Status</span>
                    {getStatusBadge(subscription.status)}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                    <span className="text-gray-500">Plan</span>
                    <span className="text-white">{subscription.plan_name || 'Growth'}</span>
                  </div>
                  {subscription.current_period_end && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500">Renews</span>
                      <span className="text-white">
                        {new Date(subscription.current_period_end).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-4">No active subscription</p>
                  <Link href="/order">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-black">
                      Get Started
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Management */}
          {subscription && subscription.stripe_customer_id && (
            <Card className="bg-[#111111] border-[#1a1a1a]">
              <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white">Billing</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-400 text-sm mb-4">
                  Manage your payment method, view invoices, and update your subscription.
                </p>
                <Button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-black"
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

          {/* Help */}
          <Card className="bg-[#111111] border-[#1a1a1a]">
            <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-orange-400" />
              </div>
              <h3 className="font-semibold text-white">Need Help?</h3>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-400 text-sm mb-4">
                Our team is available 24/7 via WhatsApp to help you with any questions.
              </p>
              <Button variant="outline" className="w-full border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1a1a1a]">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
