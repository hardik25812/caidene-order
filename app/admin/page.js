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
  HelpCircle,
  LogOut,
  BarChart3,
  Layers,
  Zap,
  ArrowUpRight,
  MoreHorizontal
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

  return (
    <div className="flex h-screen bg-[#0d0d0d]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-semibold text-white">DeliverOn</span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {/* Home */}
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1a1a1a] text-white">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </Link>

            {/* Orders Section */}
            <div className="pt-4">
              <button 
                onClick={() => toggleSection('orders')}
                className="flex items-center justify-between w-full px-3 py-2 text-gray-400 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">Orders</span>
                </div>
                {expandedSections.orders ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {expandedSections.orders && (
                <div className="ml-7 mt-1 space-y-1">
                  <Link href="/admin" className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg">
                    All Orders
                  </Link>
                  <Link href="/admin/orders" className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg">
                    Manage Orders
                  </Link>
                </div>
              )}
            </div>

            {/* Pricing */}
            <Link href="/admin/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a]">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Pricing</span>
            </Link>

            {/* Analytics Section */}
            <div className="pt-2">
              <button 
                onClick={() => toggleSection('analytics')}
                className="flex items-center justify-between w-full px-3 py-2 text-gray-400 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Analytics</span>
                </div>
                {expandedSections.analytics ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {expandedSections.analytics && (
                <div className="ml-7 mt-1 space-y-1">
                  <Link href="#" className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg">
                    Revenue
                  </Link>
                  <Link href="#" className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg">
                    Customers
                  </Link>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="pt-2">
              <button 
                onClick={() => toggleSection('settings')}
                className="flex items-center justify-between w-full px-3 py-2 text-gray-400 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Settings</span>
                </div>
                {expandedSections.settings ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {expandedSections.settings && (
                <div className="ml-7 mt-1 space-y-1">
                  <Link href="#" className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg">
                    General
                  </Link>
                  <Link href="#" className="block px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg">
                    Webhooks
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </ScrollArea>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#1a1a1a] space-y-2">
          <Link href="/order" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a]">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">View Store</span>
          </Link>
          <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium hover:from-yellow-500 hover:to-yellow-600">
            Upgrade
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#fafafa] overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search across orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">K</kbd>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-6">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <HelpCircle className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                HP
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening with your orders.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Awaiting</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.awaiting}</p>
                    <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pending fulfillment
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completed}</p>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Successfully fulfilled
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalInvoices}</p>
                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> All time
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Inboxes</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalInboxes.toLocaleString()}</p>
                    <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Provisioned
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Section */}
          <div className="grid grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="col-span-2 space-y-6">
              {/* Awaiting Orders */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Awaiting Orders</h3>
                      <p className="text-xs text-gray-500">{filteredAwaitingOrders.length} orders pending</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Awaiting
                  </Badge>
                </div>
                <CardContent className="p-0">
                  {filteredAwaitingOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>No awaiting orders</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredAwaitingOrders.slice(0, 5).map((order) => (
                        <div 
                          key={order.id} 
                          className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedOrder?.id === order.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Mail className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{getOrderNumber(order.id)}</span>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-yellow-300 text-yellow-700 bg-yellow-50">
                                    {order.plan_name || 'Growth'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">{order.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{(order.inbox_count || 1) * 100} inboxes</p>
                              <p className="text-xs text-gray-400">{formatTimeAgo(order.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed Orders */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Completed Orders</h3>
                      <p className="text-xs text-gray-500">{filteredCompletedOrders.length} orders fulfilled</p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    Completed
                  </Badge>
                </div>
                <CardContent className="p-0">
                  {filteredCompletedOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <CheckCircle2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>No completed orders yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredCompletedOrders.slice(0, 5).map((order) => (
                        <div 
                          key={order.id} 
                          className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedOrder?.id === order.id ? 'bg-green-50 border-l-2 border-green-500' : ''
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{getOrderNumber(order.id)}</span>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-green-300 text-green-700 bg-green-50">
                                    Fulfilled
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">{order.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{(order.inbox_count || 1) * 100} inboxes</p>
                              <p className="text-xs text-gray-400">{formatTimeAgo(order.created_at)}</p>
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
                <Card className="bg-white border-gray-200 shadow-sm sticky top-6">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Order Details</h3>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-5">
                    {/* Order Info */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Order ID</span>
                        <span className="text-sm font-medium text-gray-900 font-mono">{getOrderNumber(selectedOrder.id)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Customer</span>
                        <span className="text-sm font-medium text-gray-900">{selectedOrder.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Plan</span>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">{selectedOrder.plan_name || 'Growth'}</Badge>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Domains</span>
                        <span className="text-sm font-medium text-gray-900">{selectedOrder.inbox_count || 1}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Inboxes</span>
                        <span className="text-sm font-bold text-gray-900">{(selectedOrder.inbox_count || 1) * 100}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Monthly Value</span>
                        <span className="text-sm font-bold text-green-600">${(selectedOrder.inbox_count || 1) * 49}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-500">Status</span>
                        <Badge className={selectedOrder.status === 'fulfilled' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'}>
                          {selectedOrder.status === 'fulfilled' ? 'Completed' : 'Awaiting'}
                        </Badge>
                      </div>
                    </div>

                    {/* Stripe Info */}
                    {selectedOrder.stripe_customer_id && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Stripe Info</h4>
                        <p className="text-xs text-gray-600 font-mono break-all">Customer: {selectedOrder.stripe_customer_id}</p>
                        {selectedOrder.stripe_subscription_id && (
                          <p className="text-xs text-gray-600 font-mono break-all mt-1">Sub: {selectedOrder.stripe_subscription_id}</p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {selectedOrder.status === 'pending' && (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
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
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-700">Order Fulfilled</p>
                        <p className="text-xs text-green-600 mt-1">This order has been completed</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
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
