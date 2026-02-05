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
  BarChart3,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  Filter,
  RefreshCw,
  Mail,
  Zap,
  Sparkles,
  Bell,
  HelpCircle,
  MoreHorizontal,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
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
      if (data.orders?.length > 0) {
        setSelectedOrder(data.orders[0]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const handleMarkComplete = async (orderId) => {
    try {
      await fetch('/api/admin/orders/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      fetchOrders();
    } catch (err) {
      console.error('Error completing order:', err);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="flex h-screen bg-[#0d0d0d]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col">
        <div className="p-4 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-semibold text-white">DeliverOn</span>
          </div>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a]">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </Link>

            <div className="pt-4">
              <button 
                onClick={() => toggleSection('orders')}
                className="flex items-center justify-between w-full px-3 py-2 text-white"
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
                  <Link href="/admin/orders" className="block px-3 py-2 text-sm text-white bg-[#1a1a1a] rounded-lg">
                    Manage Orders
                  </Link>
                </div>
              )}
            </div>

            <Link href="/admin/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a]">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Pricing</span>
            </Link>

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
            </div>

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
            </div>
          </nav>
        </ScrollArea>

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
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Orders Management</h1>
              <p className="text-sm text-gray-500">View and manage all customer orders</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={fetchOrders}
                className="border-gray-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by order ID, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-gray-900 text-white' : 'border-gray-200'}
                size="sm"
              >
                All Orders
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                className={statusFilter === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'border-gray-200'}
                size="sm"
              >
                <Clock className="w-3 h-3 mr-1" />
                Awaiting
              </Button>
              <Button
                variant={statusFilter === 'fulfilled' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('fulfilled')}
                className={statusFilter === 'fulfilled' ? 'bg-green-500 text-white hover:bg-green-600' : 'border-gray-200'}
                size="sm"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="col-span-2">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin text-gray-300 mb-3" />
                      <p>Loading orders...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>No orders found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredOrders.map((order) => (
                        <div 
                          key={order.id} 
                          className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedOrder?.id === order.id 
                              ? order.status === 'fulfilled' 
                                ? 'bg-green-50 border-l-2 border-green-500' 
                                : 'bg-yellow-50 border-l-2 border-yellow-500' 
                              : ''
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                order.status === 'fulfilled' ? 'bg-green-100' : 'bg-yellow-100'
                              }`}>
                                {order.status === 'fulfilled' 
                                  ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  : <Clock className="w-5 h-5 text-yellow-600" />
                                }
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{getOrderNumber(order.id)}</span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[10px] px-1.5 py-0 h-5 ${
                                      order.status === 'fulfilled'
                                        ? 'border-green-300 text-green-700 bg-green-50'
                                        : 'border-yellow-300 text-yellow-700 bg-yellow-50'
                                    }`}
                                  >
                                    {order.status === 'fulfilled' ? 'Completed' : 'Awaiting'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">{order.email}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(order.created_at)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{(order.inbox_count || 1) * 100} inboxes</p>
                              <p className="text-sm text-green-600 font-medium">${(order.inbox_count || 1) * 49}/mo</p>
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

                    {selectedOrder.stripe_customer_id && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Stripe Info</h4>
                        <p className="text-xs text-gray-600 font-mono break-all">Customer: {selectedOrder.stripe_customer_id}</p>
                      </div>
                    )}

                    {selectedOrder.status === 'pending' && (
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleMarkComplete(selectedOrder.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}

                    {selectedOrder.status === 'fulfilled' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-700">Order Fulfilled</p>
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
