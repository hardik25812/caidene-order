'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, CreditCard, Calendar, Inbox, LogOut, ExternalLink, Loader2, Copy, Check, Globe, Server, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedNs, setCopiedNs] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Fetch orders data
      try {
        const response = await fetch(`/api/customer/orders?email=${encodeURIComponent(session.user.email)}`);
        const data = await response.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
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

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNs(id);
      setTimeout(() => setCopiedNs(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFulfillmentStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
      processing: { label: 'Processing', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Loader2 },
      completed: { label: 'Completed', className: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle2 },
      partial: { label: 'Partial', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertCircle },
      failed: { label: 'Failed', className: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle },
      queued: { label: 'Queued', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Clock },
    };

    const config = statusConfig[status] || { label: status || 'Unknown', className: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30', icon: Clock };
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
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
          <p className="text-zinc-400 mt-1">View your orders and DNS configuration</p>
        </div>

        {/* Account Info */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-400" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-sm text-zinc-500">Email</p>
                <p className="text-white">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Total Orders</p>
                <p className="text-white">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Orders</h2>
          
          {orders.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center">
                <Inbox className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">No orders yet</p>
                <Link href="/order">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Place Your First Order
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg text-white">
                          Order #{order.id?.slice(0, 8)}
                        </CardTitle>
                        {getFulfillmentStatusBadge(order.fulfillment_status)}
                      </div>
                      <span className="text-zinc-500 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <CardDescription className="text-zinc-400">
                      {order.domain_count} domain(s) • ${order.total_amount}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Domains List */}
                    {order.domains && order.domains.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-zinc-500">Domains</p>
                        <div className="flex flex-wrap gap-2">
                          {order.domains.map((d, i) => (
                            <Badge key={i} variant="outline" className="border-zinc-700 text-zinc-300">
                              <Globe className="w-3 h-3 mr-1" />
                              {d.domain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nameservers Section */}
                    {order.nameservers && order.nameservers.length > 0 && (
                      <div className="bg-zinc-800/50 rounded-xl p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <Server className="w-5 h-5 text-purple-400" />
                          <h4 className="text-white font-medium">DNS Configuration Required</h4>
                        </div>
                        <p className="text-zinc-400 text-sm">
                          Update your domain's nameservers to the values below. This is required to complete your inbox setup.
                        </p>
                        
                        {order.nameservers.map((ns, nsIndex) => (
                          <div key={nsIndex} className="bg-zinc-900 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-purple-400 font-medium">{ns.domain}</span>
                            </div>
                            
                            {Array.isArray(ns.nameservers) ? (
                              <div className="space-y-2">
                                {ns.nameservers.map((nameserver, i) => (
                                  <div key={i} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
                                    <code className="text-green-400 font-mono text-sm">{nameserver}</code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(nameserver, `${order.id}-${nsIndex}-${i}`)}
                                      className="text-zinc-400 hover:text-white"
                                    >
                                      {copiedNs === `${order.id}-${nsIndex}-${i}` ? (
                                        <Check className="w-4 h-4 text-green-400" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
                                <code className="text-green-400 font-mono text-sm">{JSON.stringify(ns.nameservers)}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(JSON.stringify(ns.nameservers), `${order.id}-${nsIndex}`)}
                                  className="text-zinc-400 hover:text-white"
                                >
                                  {copiedNs === `${order.id}-${nsIndex}` ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const allNs = Array.isArray(ns.nameservers) 
                                  ? ns.nameservers.join('\n') 
                                  : JSON.stringify(ns.nameservers);
                                copyToClipboard(allNs, `${order.id}-${nsIndex}-all`);
                              }}
                              className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                            >
                              {copiedNs === `${order.id}-${nsIndex}-all` ? (
                                <>
                                  <Check className="w-4 h-4 mr-2 text-green-400" />
                                  Copied All!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy All Nameservers
                                </>
                              )}
                            </Button>
                          </div>
                        ))}

                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                          <p className="text-purple-300 text-sm">
                            <strong>How to update nameservers:</strong> Log into your domain registrar (GoDaddy, Namecheap, Porkbun, etc.), 
                            find DNS settings, and replace the existing nameservers with the ones above.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pending nameservers message */}
                    {order.fulfillment_status === 'pending' || order.fulfillment_status === 'processing' ? (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-yellow-400" />
                          <p className="text-yellow-300 text-sm">
                            Your order is being processed. Nameserver information will appear here once ready.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {/* Error message */}
                    {order.fulfillment_error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <p className="text-red-300 text-sm">
                            {order.fulfillment_error}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-medium">Need help with DNS setup?</h3>
                <p className="text-zinc-400 text-sm">Our team is available 24/7 via WhatsApp to help you configure your domains</p>
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
