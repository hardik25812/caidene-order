'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import {
  Search,
  Home,
  Package,
  DollarSign,
  Settings,
  Users,
  Mail,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  Monitor,
  Sparkles,
  Bell,
  LogOut,
  BarChart3,
  Layers,
  Zap,
  ArrowUpRight,
  MoreHorizontal,
  Rocket,
  Download,
  Activity,
  RefreshCw,
  ExternalLink,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    awaiting: 0,
    completed: 0,
    totalInvoices: 0,
    totalInboxes: 0
  });
  const [expandedSections, setExpandedSections] = useState({
    orders: true,
    analytics: false,
    settings: false
  });

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [sentMagicLink, setSentMagicLink] = useState(false);

  // Admin emails whitelist
  const ADMIN_EMAILS = [
    'admin@deliveron.com',
    'hardik25812@gmail.com',
    'pandeyhardik258@gmail.com',
    // Add more admin emails here
  ];

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && ADMIN_EMAILS.includes(session.user.email)) {
        setUser(session.user);
        setIsAuthenticated(true);
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && ADMIN_EMAILS.includes(session.user.email)) {
        setUser(session.user);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setSigningIn(true);
    setAuthError('');

    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      setAuthError('Access denied. This email is not authorized as an admin.');
      setSigningIn(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) throw error;

      setAuthError('');
      setSentMagicLink(true);
    } catch (err) {
      setAuthError(err.message || 'Failed to send magic link');
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    setAuthError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setAuthError(err.message || 'Failed to sign in with Google');
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      setOrders(data.orders || []);
      setStats(data.stats || { awaiting: 0, completed: 0, totalInvoices: 0, totalInboxes: 0 });
      if (data.orders?.length > 0) {
        setSelectedOrder(data.orders[0]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const awaitingOrders = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'fulfilled');

  const filteredAwaitingOrders = awaitingOrders.filter(o =>
    o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompletedOrders = completedOrders.filter(o =>
    o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getOrderNumber = (id) => {
    if (!id) return '#00000';
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `#${(95500 + (hash % 500)).toString()}`;
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#111111] border-[#1a1a1a]">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-teal-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Access</h1>
              <p className="text-gray-500 mt-2">Sign in to access the admin dashboard</p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <Label className="text-gray-400">Email</Label>
                <Input
                  type="email"
                  placeholder="admin@deliveron.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-teal-500"
                  required
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{authError}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={signingIn}
                className="w-full bg-teal-500 hover:bg-teal-600 text-black font-medium py-5"
              >
                {signingIn ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </form>

            {sentMagicLink && (
              <div className="mt-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                <p className="text-teal-400 text-sm text-center">Magic link sent! Check your email to sign in.</p>
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2a2a2a]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#111111] text-gray-500">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={signingIn}
              className="w-full border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            <p className="text-center text-gray-600 text-xs mt-6">
              Only authorized admin accounts can access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col">
        <div className="p-5 border-b border-[#1a1a1a]">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">DELIVERON</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
            <Package className="w-4 h-4" />
            <span className="text-sm font-medium">Orders</span>
          </Link>
          <Link href="/admin/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Pricing</span>
          </Link>
          <Link href="/order" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
            <Rocket className="w-4 h-4" />
            <span className="text-sm font-medium">New Order</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
              <span className="text-teal-400 text-sm font-medium">{user?.email?.[0]?.toUpperCase() || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@deliveron.com'}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-[#0a0a0a] border-b border-[#1a1a1a] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Dashboard</h1>
              <p className="text-sm text-gray-500">Manage orders and track performance</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#151515]" onClick={fetchOrders}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Awaiting</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.awaiting}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Completed</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.completed}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Invoices</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalInvoices}</p>
                  </div>
                  <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-teal-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Inboxes</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalInboxes}</p>
                  </div>
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search orders by ID, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-[#111111] border-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Orders Lists */}
            <div className="col-span-2 space-y-6">
              {/* Awaiting Orders */}
              <Card className="bg-[#111111] border-[#1a1a1a]">
                <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-white">Awaiting Orders</h3>
                    <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">{filteredAwaitingOrders.length}</Badge>
                  </div>
                </div>
                <CardContent className="p-0">
                  {filteredAwaitingOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Clock className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                      <p>No awaiting orders</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#1a1a1a]">
                      {filteredAwaitingOrders.map((order) => (
                        <div
                          key={order.id}
                          className={`px-5 py-4 cursor-pointer hover:bg-[#151515] transition-colors ${
                            selectedOrder?.id === order.id ? 'bg-orange-500/5 border-l-2 border-orange-500' : ''
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-white">{getOrderNumber(order.id)}</span>
                                  <Badge className="text-[10px] px-1.5 py-0 h-5 bg-orange-500/10 text-orange-400 border-orange-500/20">
                                    Awaiting
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">{order.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-white">{(order.inbox_count || 1) * 100} inboxes</p>
                              <p className="text-xs text-gray-600">{formatTimeAgo(order.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed Orders */}
              <Card className="bg-[#111111] border-[#1a1a1a]">
                <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-white">Completed Orders</h3>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">{filteredCompletedOrders.length}</Badge>
                  </div>
                </div>
                <CardContent className="p-0">
                  {filteredCompletedOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <CheckCircle2 className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                      <p>No completed orders yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#1a1a1a]">
                      {filteredCompletedOrders.slice(0, 4).map((order) => (
                        <div
                          key={order.id}
                          className={`px-5 py-4 cursor-pointer hover:bg-[#151515] transition-colors ${
                            selectedOrder?.id === order.id ? 'bg-green-500/5 border-l-2 border-green-500' : ''
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-white">{getOrderNumber(order.id)}</span>
                                  <Badge className="text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-400 border-green-500/20">
                                    Completed
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">{order.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-white">{(order.inbox_count || 1) * 100} inboxes</p>
                              <p className="text-xs text-gray-600">{formatTimeAgo(order.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Detail Panel */}
            <div className="col-span-1">
              {selectedOrder ? (
                <Card className="bg-[#111111] border-[#1a1a1a] sticky top-6">
                  <div className="px-5 py-4 border-b border-[#1a1a1a]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">Order Details</h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                        <span className="text-sm text-gray-500">Order ID</span>
                        <span className="text-sm font-medium text-white font-mono">{getOrderNumber(selectedOrder.id)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                        <span className="text-sm text-gray-500">Customer</span>
                        <span className="text-sm font-medium text-white">{selectedOrder.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                        <span className="text-sm text-gray-500">Plan</span>
                        <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20">{selectedOrder.plan_name || 'Growth'}</Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                        <span className="text-sm text-gray-500">Domains</span>
                        <span className="text-sm font-medium text-white">{selectedOrder.inbox_count || 1}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                        <span className="text-sm text-gray-500">Inboxes</span>
                        <span className="text-sm font-bold text-white">{(selectedOrder.inbox_count || 1) * 100}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                        <span className="text-sm text-gray-500">Monthly Value</span>
                        <span className="text-sm font-bold text-teal-400">${(selectedOrder.inbox_count || 1) * 49}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-500">Status</span>
                        <Badge className={selectedOrder.status === 'fulfilled'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}>
                          {selectedOrder.status === 'fulfilled' ? 'Completed' : 'Awaiting'}
                        </Badge>
                      </div>
                    </div>

                    {selectedOrder.stripe_customer_id && (
                      <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#1a1a1a]">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Stripe Info</h4>
                        <p className="text-xs text-gray-400 font-mono break-all">Customer: {selectedOrder.stripe_customer_id}</p>
                        {selectedOrder.stripe_subscription_id && (
                          <p className="text-xs text-gray-400 font-mono break-all mt-1">Sub: {selectedOrder.stripe_subscription_id}</p>
                        )}
                      </div>
                    )}

                    {selectedOrder.status === 'pending' && (
                      <Button
                        className="w-full bg-teal-500 hover:bg-teal-600 text-black font-medium"
                        onClick={async () => {
                          await fetch('/api/admin/orders/complete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderId: selectedOrder.id })
                          });
                          fetchOrders();
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}

                    {selectedOrder.status === 'fulfilled' && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-400">Order Fulfilled</p>
                        <p className="text-xs text-green-500/70 mt-1">This order has been completed</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-[#111111] border-[#1a1a1a]">
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                    <p className="text-gray-500">Select an order to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
