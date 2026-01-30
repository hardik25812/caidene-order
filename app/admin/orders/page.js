'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Mail,
  RefreshCw,
  User,
  DollarSign
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
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
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
    <div className="min-h-screen bg-[#0a0e1a]">
      {/* Header */}
      <header className="border-b border-[#1a2235] bg-[#0d1321]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DeliverOn</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-gray-400 hover:text-white">Dashboard</Link>
            <Link href="/admin/orders" className="text-white font-medium">Orders</Link>
            <Link href="/admin/pricing" className="text-gray-400 hover:text-white flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> Pricing
            </Link>
            <Link href="/order" className="text-gray-400 hover:text-white">Leads</Link>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Page Title & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Orders Management</h1>
            <p className="text-gray-500">View and manage all customer orders</p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchOrders}
            className="border-[#1f2937] text-gray-300 hover:text-white hover:bg-[#1f2937]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search by order ID, email, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-5 bg-[#111827] border-[#1f2937] text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'border-[#1f2937] text-gray-300 hover:text-white hover:bg-[#1f2937]'}
            >
              All Orders
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
              className={statusFilter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'border-[#1f2937] text-gray-300 hover:text-white hover:bg-[#1f2937]'}
            >
              <Clock className="w-4 h-4 mr-2" />
              Awaiting
            </Button>
            <Button
              variant={statusFilter === 'fulfilled' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('fulfilled')}
              className={statusFilter === 'fulfilled' 
                ? 'bg-green-600 text-white' 
                : 'border-[#1f2937] text-gray-300 hover:text-white hover:bg-[#1f2937]'}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="col-span-2">
            <div className="space-y-3">
              {loading ? (
                <Card className="bg-[#111827] border-[#1f2937]">
                  <CardContent className="p-6 text-center text-gray-400">
                    Loading orders...
                  </CardContent>
                </Card>
              ) : filteredOrders.length === 0 ? (
                <Card className="bg-[#111827] border-[#1f2937]">
                  <CardContent className="p-6 text-center text-gray-400">
                    No orders found
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card 
                    key={order.id} 
                    className={`bg-[#111827] border-[#1f2937] cursor-pointer transition-all hover:border-blue-500/50 ${
                      selectedOrder?.id === order.id ? 'border-blue-500 ring-1 ring-blue-500/50' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            order.status === 'fulfilled' 
                              ? 'bg-green-500/20' 
                              : 'bg-yellow-500/20'
                          }`}>
                            {order.status === 'fulfilled' 
                              ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                              : <Clock className="w-4 h-4 text-yellow-400" />
                            }
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">{getOrderNumber(order.id)}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  order.status === 'fulfilled'
                                    ? 'border-green-500/50 text-green-400'
                                    : 'border-yellow-500/50 text-yellow-400'
                                }`}
                              >
                                {order.status === 'fulfilled' ? 'Completed' : 'Awaiting'}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm">{order.email || 'No email'}</p>
                            <p className="text-gray-500 text-xs mt-1">{formatTimeAgo(order.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="text-white font-semibold">{(order.inbox_count || 1) * 100} Inboxes</p>
                            <p className="text-gray-500 text-xs">${(order.inbox_count || 1) * 49}/mo</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Order Detail Panel */}
          <div className="col-span-1">
            {selectedOrder ? (
              <Card className="bg-[#111827] border-[#1f2937] sticky top-6">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Order Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Order ID</span>
                          <span className="text-white font-mono text-sm">{getOrderNumber(selectedOrder.id)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email</span>
                          <span className="text-white text-sm">{selectedOrder.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Plan</span>
                          <span className="text-white">{selectedOrder.plan_name || 'Growth'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Domains</span>
                          <span className="text-white">{selectedOrder.inbox_count || 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Inboxes</span>
                          <span className="text-white font-semibold">{(selectedOrder.inbox_count || 1) * 100}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Monthly Value</span>
                          <span className="text-green-400 font-semibold">${(selectedOrder.inbox_count || 1) * 49}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status</span>
                          <Badge 
                            className={selectedOrder.status === 'fulfilled' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'}
                          >
                            {selectedOrder.status === 'fulfilled' ? 'Completed' : 'Awaiting'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Created</span>
                          <span className="text-gray-300 text-sm">{formatTimeAgo(selectedOrder.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.stripe_customer_id && (
                      <div className="pt-4 border-t border-[#1f2937]">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Stripe Info</h4>
                        <p className="text-gray-500 text-xs font-mono break-all">Customer: {selectedOrder.stripe_customer_id}</p>
                        {selectedOrder.stripe_subscription_id && (
                          <p className="text-gray-500 text-xs font-mono break-all mt-1">Sub: {selectedOrder.stripe_subscription_id}</p>
                        )}
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
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Order Fulfilled</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#111827] border-[#1f2937]">
                <CardContent className="p-6 text-center text-gray-400">
                  Select an order to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
