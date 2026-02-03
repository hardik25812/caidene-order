'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Inbox, LogOut, Loader2, Copy, Check, Globe, Server, Clock, CheckCircle2, AlertCircle, Plus, ArrowRight, Package } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">DeliverOn</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/order">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                <Plus className="w-4 h-4 mr-2" />
                New Order
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage your orders and DNS configuration</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Account</p>
                  <p className="text-white mt-1 font-medium truncate max-w-[180px]">{user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Orders</p>
                  <p className="text-2xl text-white mt-1 font-bold">{orders.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Domains</p>
                  <p className="text-2xl text-white mt-1 font-bold">{orders.reduce((acc, o) => acc + (o.domain_count || 0), 0)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Your Orders</h2>
            {orders.length > 0 && (
              <Link href="/order">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800/50">
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </Button>
              </Link>
            )}
          </div>
          
          {orders.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
                  <Inbox className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
                <p className="text-slate-400 mb-6 max-w-sm mx-auto">Get started by placing your first order for enterprise email infrastructure.</p>
                <Link href="/order">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                    Place Your First Order
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm hover:border-slate-700/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base text-white font-medium">
                            Order #{order.id?.slice(0, 8)}
                          </CardTitle>
                          <CardDescription className="text-slate-500 text-sm">
                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getFulfillmentStatusBadge(order.fulfillment_status)}
                        <span className="text-white font-semibold">${order.total_amount}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    {/* Domains List */}
                    {order.domains && order.domains.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Domains ({order.domain_count})</p>
                        <div className="flex flex-wrap gap-2">
                          {order.domains.map((d, i) => (
                            <Badge key={i} variant="outline" className="border-slate-700/50 bg-slate-800/30 text-slate-300 font-normal">
                              <Globe className="w-3 h-3 mr-1.5 text-indigo-400" />
                              {d.domain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nameservers Section */}
                    {order.nameservers && order.nameservers.length > 0 && (
                      <div className="bg-slate-800/30 rounded-xl p-5 space-y-4 border border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Server className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm">DNS Configuration Required</h4>
                            <p className="text-slate-500 text-xs">Update your nameservers to complete setup</p>
                          </div>
                        </div>
                        
                        {order.nameservers.map((ns, nsIndex) => (
                          <div key={nsIndex} className="bg-slate-900/50 rounded-lg p-4 space-y-3 border border-slate-800/50">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-indigo-400" />
                              <span className="text-indigo-300 font-medium text-sm">{ns.domain}</span>
                            </div>
                            
                            {Array.isArray(ns.nameservers) ? (
                              <div className="space-y-2">
                                {ns.nameservers.map((nameserver, i) => (
                                  <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2.5 group">
                                    <code className="text-emerald-400 font-mono text-sm">{nameserver}</code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(nameserver, `${order.id}-${nsIndex}-${i}`)}
                                      className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                                    >
                                      {copiedNs === `${order.id}-${nsIndex}-${i}` ? (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-2.5 group">
                                <code className="text-emerald-400 font-mono text-sm">{JSON.stringify(ns.nameservers)}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(JSON.stringify(ns.nameservers), `${order.id}-${nsIndex}`)}
                                  className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                                >
                                  {copiedNs === `${order.id}-${nsIndex}` ? (
                                    <Check className="w-4 h-4 text-emerald-400" />
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
                              className="w-full border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                            >
                              {copiedNs === `${order.id}-${nsIndex}-all` ? (
                                <>
                                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
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

                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                          <p className="text-indigo-300 text-sm">
                            <strong className="font-medium">How to update:</strong> Log into your domain registrar (GoDaddy, Namecheap, Porkbun, etc.), 
                            find DNS settings, and replace the existing nameservers with the ones above.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pending nameservers message */}
                    {order.fulfillment_status === 'pending' || order.fulfillment_status === 'processing' ? (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <p className="text-amber-300 text-sm font-medium">Order in Progress</p>
                            <p className="text-amber-300/70 text-xs">Nameserver information will appear here once ready.</p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* Error message */}
                    {order.fulfillment_error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          </div>
                          <p className="text-red-300 text-sm">{order.fulfillment_error}</p>
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
        <Card className="bg-gradient-to-br from-indigo-500/10 to-slate-900/50 border-indigo-500/20 backdrop-blur-sm">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Need help with DNS setup?</h3>
                  <p className="text-slate-400 text-sm">Our team is available 24/7 via WhatsApp</p>
                </div>
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
