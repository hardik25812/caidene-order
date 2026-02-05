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
  Users,
  Activity,
  Clock,
  CheckCircle2,
  RefreshCw,
  Mail,
  MoreHorizontal,
  ExternalLink,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col">
        <div className="p-5 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">DELIVERON</span>
          </div>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">Orders</span>
            </Link>
            <Link href="/admin/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Pricing</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Customers</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Analytics</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </nav>
        </ScrollArea>

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
        <header className="px-6 py-5 border-b border-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Orders Management</h1>
              <p className="text-sm text-gray-500">View and manage all customer orders</p>
            </div>
            <Button 
              onClick={fetchOrders}
              variant="outline" 
              className="border-[#2a2a2a] bg-transparent text-gray-300 hover:text-white hover:bg-[#151515]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-[#1a1a1a]">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by order ID, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#111111] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-teal-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' 
                  ? 'bg-teal-500 text-black hover:bg-teal-600' 
                  : 'border-[#2a2a2a] bg-transparent text-gray-400 hover:text-white hover:bg-[#151515]'}
                size="sm"
              >
                All Orders
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                className={statusFilter === 'pending' 
                  ? 'bg-orange-500 text-black hover:bg-orange-600' 
                  : 'border-[#2a2a2a] bg-transparent text-gray-400 hover:text-white hover:bg-[#151515]'}
                size="sm"
              >
                <Clock className="w-3 h-3 mr-1" />
                Awaiting
              </Button>
              <Button
                variant={statusFilter === 'fulfilled' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('fulfilled')}
                className={statusFilter === 'fulfilled' 
                  ? 'bg-green-500 text-black hover:bg-green-600' 
                  : 'border-[#2a2a2a] bg-transparent text-gray-400 hover:text-white hover:bg-[#151515]'}
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
              <Card className="bg-[#111111] border-[#1a1a1a]">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin text-teal-400 mb-3" />
                      <p>Loading orders...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Package className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                      <p>No orders found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#1a1a1a]">
                      {filteredOrders.map((order) => (
                        <div 
                          key={order.id} 
                          className={`px-5 py-4 cursor-pointer hover:bg-[#151515] transition-colors ${
                            selectedOrder?.id === order.id 
                              ? order.status === 'fulfilled' 
                                ? 'bg-green-500/5 border-l-2 border-green-500' 
                                : 'bg-teal-500/5 border-l-2 border-teal-500' 
                              : ''
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                order.status === 'fulfilled' ? 'bg-green-500/10' : 'bg-orange-500/10'
                              }`}>
                                {order.status === 'fulfilled' 
                                  ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                                  : <Clock className="w-5 h-5 text-orange-400" />
                                }
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-white">{getOrderNumber(order.id)}</span>
                                  <Badge 
                                    className={`text-[10px] px-1.5 py-0 h-5 ${
                                      order.status === 'fulfilled'
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    }`}
                                  >
                                    {order.status === 'fulfilled' ? 'Completed' : 'Awaiting'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">{order.email}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{formatTimeAgo(order.created_at)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-white">{(order.inbox_count || 1) * 100} inboxes</p>
                              <p className="text-sm text-teal-400 font-medium">${(order.inbox_count || 1) * 49}/mo</p>
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
                      </div>
                    )}

                    {selectedOrder.status === 'pending' && (
                      <Button 
                        className="w-full bg-teal-500 hover:bg-teal-600 text-black font-medium"
                        onClick={() => handleMarkComplete(selectedOrder.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}

                    {selectedOrder.status === 'fulfilled' && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-400">Order Fulfilled</p>
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
