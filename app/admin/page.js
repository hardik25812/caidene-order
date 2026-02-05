'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

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

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Recent activity mock data
  const recentActivity = [
    { icon: Download, text: 'Exported 1,234 leads to CSV', time: '1 hour ago', color: 'text-teal-400' },
    { icon: CheckCircle2, text: 'Order #95915 completed', time: '3 hours ago', color: 'text-green-400' },
    { icon: Package, text: 'New order received', time: '6 hours ago', color: 'text-orange-400' },
    { icon: Users, text: 'New customer signup', time: '8 hours ago', color: 'text-blue-400' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">DELIVERON</span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {/* Dashboard */}
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>

            {/* Orders */}
            <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">Orders</span>
            </Link>

            {/* Pricing */}
            <Link href="/admin/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Pricing</span>
            </Link>

            {/* Customers */}
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Customers</span>
            </Link>

            {/* Analytics */}
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Analytics</span>
            </Link>

            {/* Settings */}
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </nav>
        </ScrollArea>

        {/* Bottom User Section */}
        <div className="p-4 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <span className="text-sm font-semibold text-black">HP</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@deliveron.org</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#0a0a0a] overflow-auto">
        {/* Header */}
        <header className="px-6 py-5 border-b border-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Welcome back, Admin</h1>
              <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your orders today</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-[#151515]">
                <Bell className="w-5 h-5" />
              </Button>
              <Button 
                onClick={fetchOrders}
                variant="outline" 
                size="sm"
                className="border-[#2a2a2a] bg-transparent text-gray-300 hover:text-white hover:bg-[#151515]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="bg-[#111111] border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Orders</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalInvoices.toLocaleString()}</p>
                    <p className="text-xs text-teal-400 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +12%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-teal-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Awaiting</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.awaiting}</p>
                    <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Completed</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.completed}</p>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Fulfilled
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Inboxes</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.totalInboxes.toLocaleString()}</p>
                    <p className="text-xs text-cyan-400 mt-2 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Provisioned
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Banner + Recent Activity */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* CTA Banner */}
            <Card className="col-span-2 bg-gradient-to-br from-[#111111] to-[#0a1a1a] border-[#1a3a3a] overflow-hidden relative">
              <CardContent className="p-8">
                <div className="relative z-10 max-w-md">
                  <h2 className="text-2xl font-bold text-white mb-3">Manage Your Orders</h2>
                  <p className="text-gray-400 mb-6">
                    View and fulfill customer orders in seconds. Track pending orders and manage your delivery pipeline efficiently.
                  </p>
                  <Link href="/admin/orders">
                    <Button className="bg-teal-500 hover:bg-teal-600 text-black font-medium">
                      <Search className="w-4 h-4 mr-2" />
                      View All Orders
                    </Button>
                  </Link>
                </div>
                {/* Rocket Illustration */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
                  <Rocket className="w-48 h-48 text-teal-400" strokeWidth={0.5} />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-5">
                <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0`}>
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 truncate">{item.text}</p>
                        <p className="text-xs text-gray-600">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Section */}
          <div className="grid grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="col-span-2 space-y-4">
              {/* Awaiting Orders */}
              <Card className="bg-[#111111] border-[#1a1a1a]">
                <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Awaiting Orders</h3>
                      <p className="text-xs text-gray-500">{filteredAwaitingOrders.length} orders pending</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                    Awaiting
                  </Badge>
                </div>
                <CardContent className="p-0">
                  {filteredAwaitingOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                      <p>No awaiting orders</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#1a1a1a]">
                      {filteredAwaitingOrders.slice(0, 4).map((order) => (
                        <div 
                          key={order.id} 
                          className={`px-5 py-4 cursor-pointer hover:bg-[#151515] transition-colors ${
                            selectedOrder?.id === order.id ? 'bg-teal-500/5 border-l-2 border-teal-500' : ''
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                                <Mail className="w-5 h-5 text-gray-500" />
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
                    <div>
                      <h3 className="font-semibold text-white">Completed Orders</h3>
                      <p className="text-xs text-gray-500">{filteredCompletedOrders.length} orders fulfilled</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                    Completed
                  </Badge>
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
