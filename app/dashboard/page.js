'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Inbox,
  LogOut,
  Loader2,
  Copy,
  Check,
  Globe,
  Server,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Package,
  Zap,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedNs, setCopiedNs] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

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

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'Pending',
        className: 'badge-warning',
        icon: Clock,
      },
      processing: {
        label: 'Processing',
        className: 'badge-info',
        icon: RefreshCw,
      },
      completed: {
        label: 'Completed',
        className: 'badge-success',
        icon: CheckCircle2,
      },
      partial: {
        label: 'Partial',
        className: 'badge-warning',
        icon: AlertCircle,
      },
      failed: {
        label: 'Failed',
        className: 'badge-error',
        icon: AlertCircle,
      },
      queued: {
        label: 'Queued',
        className: 'badge-neutral',
        icon: Clock,
      },
    };
    return configs[status] || { label: status || 'Unknown', className: 'badge-neutral', icon: Clock };
  };

  const totalDomains = orders.reduce((acc, o) => acc + (o.domain_count || 0), 0);
  const completedOrders = orders.filter(o => o.fulfillment_status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
          <p className="text-[hsl(215,20%,55%)] text-sm font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-[hsl(222,47%,12%)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">DeliverOn</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/order">
              <Button className="h-9 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 font-medium">
                <Plus className="w-4 h-4 mr-2" />
                New Order
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-9 text-[hsl(215,20%,55%)] hover:text-white hover:bg-[hsl(222,47%,12%)]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-[hsl(215,20%,55%)] mt-1">Manage your orders and DNS configuration</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Account</p>
                <p className="text-white text-sm font-medium truncate mt-1 max-w-[180px]">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Total Orders</p>
                <p className="stat-value">{orders.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Total Domains</p>
                <p className="stat-value">{totalDomains}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Completed</p>
                <p className="stat-value">{completedOrders}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Your Orders</h2>
              <span className="text-xs font-medium text-[hsl(215,20%,50%)] bg-[hsl(222,47%,12%)] px-2.5 py-1 rounded-full">
                {orders.length} total
              </span>
            </div>
            {orders.length > 0 && (
              <Link href="/order">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-[hsl(222,47%,18%)] text-[hsl(215,20%,60%)] hover:text-white hover:bg-[hsl(222,47%,12%)]"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  New Order
                </Button>
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="card-elevated rounded-xl">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Inbox className="w-8 h-8 text-[hsl(215,20%,45%)]" />
                </div>
                <h3 className="empty-state-title">No orders yet</h3>
                <p className="empty-state-description">
                  Get started by placing your first order for enterprise email infrastructure.
                </p>
                <Link href="/order" className="mt-6">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20">
                    Place Your First Order
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.fulfillment_status);
                const StatusIcon = statusConfig.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <div
                    key={order.id}
                    className="card-elevated rounded-xl overflow-hidden hover:border-[hsl(222,47%,18%)] transition-colors"
                  >
                    {/* Order Header */}
                    <div
                      className="px-5 py-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">Order #{order.id?.slice(0, 8)}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-xs text-[hsl(215,20%,50%)] mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                            {' · '}
                            {order.domain_count || 0} domain{(order.domain_count || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-white">${order.total_amount}</span>
                        <ChevronRight
                          className={`w-5 h-5 text-[hsl(215,20%,45%)] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 space-y-5 border-t border-[hsl(222,47%,12%)] pt-4 animate-fade-in">
                        {/* Domains List */}
                        {order.domains && order.domains.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-[hsl(215,20%,50%)] uppercase tracking-wider mb-3">
                              Domains ({order.domain_count})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {order.domains.map((d, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(222,47%,10%)] border border-[hsl(222,47%,14%)] text-sm text-white"
                                >
                                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                                  {d.domain}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nameservers Section */}
                        {order.nameservers && order.nameservers.length > 0 && (
                          <div className="rounded-xl bg-[hsl(222,47%,9%)] border border-[hsl(222,47%,14%)] p-5 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                                <Server className="w-4 h-4 text-amber-400" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-white">DNS Configuration Required</h4>
                                <p className="text-xs text-[hsl(215,20%,50%)]">Update your nameservers to complete setup</p>
                              </div>
                            </div>

                            {order.nameservers.map((ns, nsIndex) => (
                              <div key={nsIndex} className="rounded-lg bg-[hsl(222,47%,7%)] border border-[hsl(222,47%,12%)] p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm font-medium text-blue-300">{ns.domain}</span>
                                </div>

                                {Array.isArray(ns.nameservers) ? (
                                  <div className="space-y-2">
                                    {ns.nameservers.map((nameserver, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between bg-[hsl(222,47%,9%)] rounded-lg px-4 py-3 group"
                                      >
                                        <code className="text-sm text-emerald-400 font-mono">{nameserver}</code>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyToClipboard(nameserver, `${order.id}-${nsIndex}-${i}`)}
                                          className="h-7 w-7 p-0 text-[hsl(215,20%,45%)] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
                                  <div className="flex items-center justify-between bg-[hsl(222,47%,9%)] rounded-lg px-4 py-3 group">
                                    <code className="text-sm text-emerald-400 font-mono">
                                      {JSON.stringify(ns.nameservers)}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(JSON.stringify(ns.nameservers), `${order.id}-${nsIndex}`)}
                                      className="h-7 w-7 p-0 text-[hsl(215,20%,45%)] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
                                  className="w-full h-9 border-[hsl(222,47%,14%)] text-[hsl(215,20%,55%)] hover:text-white hover:bg-[hsl(222,47%,12%)]"
                                >
                                  {copiedNs === `${order.id}-${nsIndex}-all` ? (
                                    <>
                                      <Check className="w-4 h-4 mr-2 text-emerald-400" />
                                      Copied All
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

                            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                              <p className="text-sm text-blue-300">
                                <strong className="font-medium">How to update:</strong> Log into your domain registrar (GoDaddy, Namecheap, Porkbun, etc.),
                                find DNS settings, and replace the existing nameservers with the ones above.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Pending Message */}
                        {(order.fulfillment_status === 'pending' || order.fulfillment_status === 'processing') && (
                          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-amber-300">Order in Progress</p>
                              <p className="text-xs text-amber-300/70">Nameserver information will appear here once ready.</p>
                            </div>
                          </div>
                        )}

                        {/* Error Message */}
                        {order.fulfillment_error && (
                          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            </div>
                            <p className="text-sm text-red-300">{order.fulfillment_error}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="rounded-xl bg-gradient-to-r from-blue-600/10 to-[hsl(222,47%,8%)] border border-blue-500/20 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Need help with DNS setup?</h3>
                <p className="text-[hsl(215,20%,55%)] text-sm">Our team is available 24/7 via WhatsApp</p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 font-medium">
              Contact Support
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
