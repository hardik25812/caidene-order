'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  Globe,
  Server,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedNs, setCopiedNs] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const revealRefs = useRef([]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Try to get user name from Supabase user metadata first, then from users table
      const metaName = session.user.user_metadata?.full_name;
      if (metaName) {
        setUserName(metaName);
      } else {
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('name')
            .eq('id', session.user.id)
            .single();
          if (userData?.name) setUserName(userData.name);
        } catch (e) {
          // Name not available, that's fine
        }
      }

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

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

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
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(33,122,255,0.1)] border border-[rgba(33,122,255,0.15)] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#217aff]/30 border-t-[#217aff] rounded-full animate-spin" />
          </div>
          <p className="font-body text-sm font-medium text-[#727272]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202]">
      {/* Header — fixed, frosted glass */}
      <header className="fixed top-0 left-0 right-0 h-[72px] z-50 do-header-glass border-b border-[#363636]">
        <div className="flex items-center justify-between h-full max-w-[1200px] mx-auto px-6">
          <Link href="/order" aria-label="DeliverOn home">
            <img
              src="https://framerusercontent.com/images/4xMhy82Xz334ZgDkWW9tGUV0iI.png?scale-down-to=512"
              alt="DeliverOn logo"
              className="h-9 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/order" className="do-btn do-btn--primary">
              <span className="material-symbols-outlined text-base">add</span>
              New Order
            </Link>
            <button onClick={handleLogout} className="do-btn do-btn--ghost">
              <span className="material-symbols-outlined text-base">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[calc(72px+3rem)] max-w-[1200px] mx-auto px-6 pb-16 min-h-screen">
        {/* Welcome */}
        <div ref={(el) => (revealRefs.current[0] = el)} className="do-reveal mb-12">
          <h1 className="font-heading text-[clamp(1.5rem,3vw,1.875rem)] font-bold tracking-[-0.03em] text-[#f2f2f2] mb-2">
            Welcome back{userName ? `, ${userName}` : ''}!
          </h1>
          <p className="font-body text-[clamp(0.875rem,1.5vw,1.125rem)] text-[#969696]">
            Manage your orders and DNS configuration
          </p>
        </div>

        {/* Stats Grid — 4 columns with colored inset glows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Account */}
          <div
            ref={(el) => (revealRefs.current[1] = el)}
            className="do-reveal do-reveal-delay-1 bg-[#020202] border border-[#363636] rounded-2xl p-6 flex items-start justify-between shadow-glow-blue transition-all hover:-translate-y-0.5 hover:border-[#217aff]"
          >
            <div className="flex flex-col gap-1">
              <span className="font-body text-[0.8125rem] text-[#969696]">Account</span>
              <span className="font-mono text-[0.8125rem] text-[#f2f2f2] leading-[1.4] mt-0.5 truncate max-w-[180px]">{user?.email}</span>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(33,122,255,0.1)] border border-[rgba(33,122,255,0.15)] flex items-center justify-center shrink-0">
              <span className="material-symbols-filled text-2xl text-[#217aff]">account_circle</span>
            </div>
          </div>

          {/* Total Orders */}
          <div
            ref={(el) => (revealRefs.current[2] = el)}
            className="do-reveal do-reveal-delay-2 bg-[#020202] border border-[#363636] rounded-2xl p-6 flex items-start justify-between shadow-glow-orange transition-all hover:-translate-y-0.5 hover:border-[#ff733a]"
          >
            <div className="flex flex-col gap-1">
              <span className="font-body text-[0.8125rem] text-[#969696]">Total Orders</span>
              <span className="font-mono text-[1.75rem] font-medium text-[#f2f2f2] leading-none">{orders.length}</span>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(255,115,58,0.1)] border border-[rgba(255,115,58,0.15)] flex items-center justify-center shrink-0">
              <span className="material-symbols-filled text-2xl text-[#ff733a]">receipt_long</span>
            </div>
          </div>

          {/* Total Domains */}
          <div
            ref={(el) => (revealRefs.current[3] = el)}
            className="do-reveal do-reveal-delay-3 bg-[#020202] border border-[#363636] rounded-2xl p-6 flex items-start justify-between shadow-glow-teal transition-all hover:-translate-y-0.5 hover:border-[#00a3e0]"
          >
            <div className="flex flex-col gap-1">
              <span className="font-body text-[0.8125rem] text-[#969696]">Total Domains</span>
              <span className="font-mono text-[1.75rem] font-medium text-[#f2f2f2] leading-none">{totalDomains}</span>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,163,224,0.1)] border border-[rgba(0,163,224,0.15)] flex items-center justify-center shrink-0">
              <span className="material-symbols-filled text-2xl text-[#00a3e0]">dns</span>
            </div>
          </div>

          {/* Completed */}
          <div
            ref={(el) => (revealRefs.current[4] = el)}
            className="do-reveal do-reveal-delay-4 bg-[#020202] border border-[#363636] rounded-2xl p-6 flex items-start justify-between shadow-glow-green transition-all hover:-translate-y-0.5 hover:border-[#34d399]"
          >
            <div className="flex flex-col gap-1">
              <span className="font-body text-[0.8125rem] text-[#969696]">Completed</span>
              <span className="font-mono text-[1.75rem] font-medium text-[#f2f2f2] leading-none">{completedOrders}</span>
            </div>
            <div className="w-10 h-10 rounded-[10px] bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.15)] flex items-center justify-center shrink-0">
              <span className="material-symbols-filled text-2xl text-[#34d399]">task_alt</span>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div ref={(el) => (revealRefs.current[5] = el)} className="do-reveal mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-heading text-[1.125rem] font-bold tracking-[-0.03em] text-[#f2f2f2]">Your Orders</h2>
            <span className="font-mono text-[12px] font-medium tracking-[0.1em] text-[#969696] bg-[rgba(255,255,255,0.06)] border border-[#363636] px-3 py-1 rounded-full">
              {orders.length} total
            </span>
          </div>

          {orders.length === 0 ? (
            /* Empty State */
            <div className="bg-[#020202] border border-[#363636] rounded-[20px] py-16 px-8 text-center shadow-glow-white">
              <div className="w-16 h-16 flex items-center justify-center bg-[rgba(0,163,224,0.06)] border border-[rgba(0,163,224,0.12)] rounded-2xl mx-auto mb-6">
                <span className="material-symbols-filled text-[2rem] text-[#00a3e0]">inbox</span>
              </div>
              <h3 className="font-heading text-[1.125rem] font-bold tracking-[-0.03em] text-[#f2f2f2] mb-2">No orders yet</h3>
              <p className="font-body text-[0.9375rem] text-[#969696] mb-8 max-w-[400px] mx-auto leading-[1.6]">
                Get started by placing your first order for enterprise email infrastructure.
              </p>
              <Link href="/order" className="do-btn do-btn--primary">
                Place Your First Order
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
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
                    className="bg-[#020202] border border-[#363636] rounded-2xl overflow-hidden shadow-glow-blue hover:border-[rgba(33,122,255,0.3)] transition-colors"
                  >
                    {/* Order Header */}
                    <div
                      className="px-5 py-4 flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[rgba(33,122,255,0.1)] border border-[rgba(33,122,255,0.15)] flex items-center justify-center">
                          <span className="material-symbols-filled text-xl text-[#217aff]">receipt_long</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-body text-sm font-semibold text-[#f2f2f2]">Order #{order.id?.slice(0, 8)}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-xs text-[#727272] mt-0.5 font-body">
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
                        <span className="font-mono text-lg font-bold text-[#f2f2f2]">${order.total_amount}</span>
                        <ChevronRight
                          className={`w-5 h-5 text-[#727272] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-5 pb-5 space-y-5 border-t border-[#363636] pt-4 animate-fade-in">
                        {/* Domains List */}
                        {order.domains && order.domains.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-[#969696] uppercase tracking-wider mb-3 font-body">
                              Domains ({order.domain_count})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {order.domains.map((d, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#020202] border border-[#363636] text-sm text-[#f2f2f2] font-mono"
                                >
                                  <Globe className="w-3.5 h-3.5 text-[#217aff]" />
                                  {d.domain}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nameservers Section */}
                        {order.nameservers && order.nameservers.length > 0 && (
                          <div className="rounded-xl bg-[#020202] border border-[#363636] p-5 space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[rgba(255,115,58,0.1)] border border-[rgba(255,115,58,0.15)] flex items-center justify-center">
                                <Server className="w-4 h-4 text-[#ff733a]" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-[#f2f2f2] font-body">DNS Configuration Required</h4>
                                <p className="text-xs text-[#969696] font-body">Update your nameservers to complete setup</p>
                              </div>
                            </div>

                            {order.nameservers.map((ns, nsIndex) => (
                              <div key={nsIndex} className="rounded-lg bg-[#161616] border border-[#363636] p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-[#217aff]" />
                                  <span className="text-sm font-medium text-[#217aff] font-mono">{ns.domain}</span>
                                </div>

                                {Array.isArray(ns.nameservers) ? (
                                  <div className="space-y-2">
                                    {ns.nameservers.map((nameserver, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between bg-[#020202] border border-[#363636] rounded-lg px-4 py-3 group"
                                      >
                                        <code className="text-sm text-[#34d399] font-mono">{nameserver}</code>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyToClipboard(nameserver, `${order.id}-${nsIndex}-${i}`)}
                                          className="h-7 w-7 p-0 text-[#727272] hover:text-[#f2f2f2] opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          {copiedNs === `${order.id}-${nsIndex}-${i}` ? (
                                            <Check className="w-4 h-4 text-[#34d399]" />
                                          ) : (
                                            <Copy className="w-4 h-4" />
                                          )}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between bg-[#020202] border border-[#363636] rounded-lg px-4 py-3 group">
                                    <code className="text-sm text-[#34d399] font-mono">
                                      {JSON.stringify(ns.nameservers)}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(JSON.stringify(ns.nameservers), `${order.id}-${nsIndex}`)}
                                      className="h-7 w-7 p-0 text-[#727272] hover:text-[#f2f2f2] opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      {copiedNs === `${order.id}-${nsIndex}` ? (
                                        <Check className="w-4 h-4 text-[#34d399]" />
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
                                  className="w-full h-9 border-[#363636] text-[#969696] hover:text-[#f2f2f2] hover:bg-[#161616]"
                                >
                                  {copiedNs === `${order.id}-${nsIndex}-all` ? (
                                    <>
                                      <Check className="w-4 h-4 mr-2 text-[#34d399]" />
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

                            <div className="rounded-lg bg-[rgba(33,122,255,0.1)] border border-[rgba(33,122,255,0.2)] p-3">
                              <p className="text-sm text-[#217aff] font-body">
                                <strong className="font-medium">How to update:</strong> Log into your domain registrar (GoDaddy, Namecheap, Porkbun, etc.),
                                find DNS settings, and replace the existing nameservers with the ones above.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Pending Message */}
                        {(order.fulfillment_status === 'pending' || order.fulfillment_status === 'processing') && (
                          <div className="rounded-lg bg-[rgba(255,115,58,0.1)] border border-[rgba(255,115,58,0.2)] p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[rgba(255,115,58,0.15)] flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4 text-[#ff733a]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#ff733a] font-body">Order in Progress</p>
                              <p className="text-xs text-[#ff733a]/70 font-body">Nameserver information will appear here once ready.</p>
                            </div>
                          </div>
                        )}

                        {/* Error Message */}
                        {order.fulfillment_error && (
                          <div className="rounded-lg bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[rgba(255,77,77,0.15)] flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="w-4 h-4 text-[#ff4d4d]" />
                            </div>
                            <p className="text-sm text-[#ff4d4d] font-body">{order.fulfillment_error}</p>
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

        {/* Support Bar */}
        <div
          ref={(el) => (revealRefs.current[6] = el)}
          className="do-reveal bg-[#020202] border border-[#363636] rounded-2xl p-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-glow-teal hover:border-[rgba(0,163,224,0.3)] transition-colors"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-11 h-11 rounded-[10px] bg-[rgba(33,122,255,0.1)] border border-[rgba(33,122,255,0.15)] flex items-center justify-center shrink-0">
              <span className="material-symbols-filled text-2xl text-[#217aff]">support_agent</span>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-heading text-[0.9375rem] font-bold tracking-[-0.03em] text-[#f2f2f2]">Need help with DNS setup?</h4>
              <p className="font-body text-[0.8125rem] text-[#969696]">Our team is available 24/7 via WhatsApp</p>
            </div>
          </div>
          <a href="https://wa.me/917678072806?text=Hi%2C%20I%20need%20help%20with%20my%20DNS%20setup" target="_blank" rel="noopener noreferrer" className="do-btn do-btn--secondary shrink-0">
            Contact Support
            <span className="material-symbols-outlined text-base">open_in_new</span>
          </a>
        </div>
      </main>
    </div>
  );
}
