'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Monitor, 
  CheckCircle2, 
  FileText, 
  TrendingUp,
  Clock,
  ChevronRight,
  DollarSign,
  Settings,
  Users,
  Mail,
  Globe,
  Server,
  User
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
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getOrderNumber = (id) => {
    if (!id) return '#00000';
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `#${(95500 + (hash % 500)).toString()}`;
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
            <Link href="/admin" className="text-white font-medium">Dashboard</Link>
            <Link href="/admin/orders" className="text-gray-400 hover:text-white">Orders</Link>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#111827] border-[#1f2937]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Awaiting</p>
                  <p className="text-4xl font-bold text-white">{stats.awaiting}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-[#1f2937]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Completed</p>
                  <p className="text-4xl font-bold text-white">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-[#1f2937]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Invoices</p>
                  <p className="text-4xl font-bold text-white">{stats.totalInvoices}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border-[#1f2937]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Inboxes</p>
                  <p className="text-4xl font-bold text-white">{stats.totalInboxes}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search orders by ID, email, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-[#111827] border-[#1f2937] text-white placeholder:text-gray-500 text-base"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="col-span-2 space-y-6">
            {/* Awaiting Orders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">Awaiting Orders</h2>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Awaiting</Badge>
              </div>
              <div className="space-y-3">
                {filteredAwaitingOrders.length === 0 ? (
                  <Card className="bg-[#111827] border-[#1f2937]">
                    <CardContent className="p-6 text-center text-gray-400">
                      No awaiting orders
                    </CardContent>
                  </Card>
                ) : (
                  filteredAwaitingOrders.map((order) => (
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
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold">{getOrderNumber(order.id)}</span>
                                {order.plan_name && (
                                  <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                                    {order.plan_name}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm">{order.email || 'No email'}</p>
                              <p className="text-gray-500 text-xs mt-1">{formatTimeAgo(order.created_at)}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div>
                              <p className="text-white font-semibold">{(order.inbox_count || 1) * 100} Invoices</p>
                              <p className="text-gray-500 text-xs">{formatTimeAgo(order.created_at)}</p>
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

            {/* Completed Orders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-semibold text-white">Completed Orders</h2>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
              </div>
              <div className="space-y-3">
                {filteredCompletedOrders.length === 0 ? (
                  <Card className="bg-[#111827] border-[#1f2937]">
                    <CardContent className="p-6 text-center text-gray-400">
                      No completed orders yet
                    </CardContent>
                  </Card>
                ) : (
                  filteredCompletedOrders.map((order) => (
                    <Card 
                      key={order.id} 
                      className={`bg-[#111827] border-[#1f2937] cursor-pointer transition-all hover:border-green-500/50 ${
                        selectedOrder?.id === order.id ? 'border-green-500 ring-1 ring-green-500/50' : ''
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-semibold">{getOrderNumber(order.id)}</span>
                                <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                                  Completed
                                </Badge>
                              </div>
                              <p className="text-gray-400 text-sm">{order.email || 'No email'}</p>
                              <p className="text-gray-500 text-xs mt-1">Updated: {formatTimeAgo(order.updated_at || order.created_at)}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div>
                              <p className="text-white font-semibold">{(order.inbox_count || 1) * 100} Invoices</p>
                              <p className="text-gray-500 text-xs">{formatTimeAgo(order.created_at)}</p>
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
          </div>

          {/* Order Detail Panel */}
          <div className="col-span-1">
            {selectedOrder ? (
              <Card className="bg-[#111827] border-[#1f2937] sticky top-6">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Hosting Platform */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Server className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400 text-sm">Hosting Platform</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white">S</div>
                        <span className="text-white">Shipping</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-2">Datfort (Primary)</p>
                      <p className="text-orange-400 text-sm">infotechlab.com</p>
                    </div>

                    {/* Software */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Settings className="w-4 h-4 text-red-400" />
                        <span className="text-gray-400 text-sm">Software</span>
                      </div>
                      <p className="text-white">Platform: V</p>
                      <p className="text-gray-500 text-sm">Votiges: 9 Jan</p>
                      <p className="text-gray-400 text-sm">Key Software</p>
                      <p className="text-white font-semibold">inoredPort</p>
                    </div>

                    {/* Mail Service */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Mail Service</span>
                      </div>
                      <p className="text-gray-500">Gemail</p>
                      <p className="text-white font-semibold">Gmail</p>
                    </div>

                    {/* Personas */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Personas</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full" />
                          <div>
                            <p className="text-white text-sm">P</p>
                            <p className="text-gray-500 text-xs">Patrred R</p>
                            <p className="text-gray-500 text-xs">Service a...</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full" />
                          <div>
                            <p className="text-white text-sm">A</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="pt-4 border-t border-[#1f2937]">
                      <p className="text-gray-500 text-sm">Order ID: {selectedOrder.id?.slice(0, 8)}...</p>
                      <p className="text-gray-500 text-sm">Email: {selectedOrder.email}</p>
                      <p className="text-gray-500 text-sm">Inboxes: {(selectedOrder.inbox_count || 1) * 100}</p>
                      <p className="text-gray-500 text-sm">Status: {selectedOrder.status}</p>
                    </div>

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
