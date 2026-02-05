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
  DollarSign,
  Upload,
  Download,
  Package,
  AlertCircle,
  XCircle,
  Copy,
  ExternalLink,
  Server,
  Globe,
  RotateCcw
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Inventory state
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'inventory'
  const [inventory, setInventory] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchInventory();
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

  const handleRetryFulfillment = async (orderId) => {
    setRetrying(true);
    try {
      const response = await fetch('/api/admin/orders/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      if (data.success) {
        fetchOrders();
      } else {
        console.error('Retry failed:', data.error);
      }
    } catch (err) {
      console.error('Error retrying fulfillment:', err);
    } finally {
      setRetrying(false);
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const getFulfillmentStatusBadge = (status) => {
    const config = {
      completed: { label: 'Completed', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      partial: { label: 'Partial', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      failed: { label: 'Failed', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      pending: { label: 'Pending', className: 'bg-blue-500/20 text-teal-400 border-blue-500/30' },
      processing: { label: 'Processing', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      queued: { label: 'Queued', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    };
    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // Inventory functions
  const fetchInventory = async () => {
    setInventoryLoading(true);
    try {
      const response = await fetch('/api/admin/inventory');
      const data = await response.json();
      setInventory(data.inventory || []);
      setInventoryStats(data.stats);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      setCsvText(text);
      await processCSV(text);
    };
    reader.readAsText(file);
  };

  const processCSV = async (csvContent) => {
    setUploading(true);
    setUploadMessage('');
    try {
      const lines = csvContent.split('\n').filter(line => line.trim());
      const accounts = [];
      const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [email, password, notes] = line.split(',').map(s => s.trim());
        if (email && password) {
          accounts.push({ email, password, notes: notes || '' });
        }
      }
      if (accounts.length === 0) {
        setUploadMessage('No valid accounts found in CSV');
        setUploading(false);
        return;
      }
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts }),
      });
      const data = await response.json();
      if (data.success) {
        setUploadMessage(`✅ Added ${data.added} accounts!`);
        setCsvText('');
        fetchInventory();
      } else {
        setUploadMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setUploadMessage(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      available: { label: 'Available', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      reserved: { label: 'Reserved', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      assigned: { label: 'Assigned', className: 'bg-blue-500/20 text-teal-400 border-blue-500/30' },
      depleted: { label: 'Depleted', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    };
    const { label, className } = config[status] || config.available;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">DELIVERON</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-gray-400 hover:text-white">Dashboard</Link>
            <button 
              onClick={() => setActiveTab('orders')}
              className={activeTab === 'orders' ? 'text-teal-400 font-medium' : 'text-gray-400 hover:text-white'}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={activeTab === 'inventory' ? 'text-teal-400 font-medium flex items-center gap-1' : 'text-gray-400 hover:text-white flex items-center gap-1'}
            >
              <Package className="w-4 h-4" /> Inventory
              {inventoryStats?.isLow && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <Link href="/admin/pricing" className="text-gray-400 hover:text-white flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> Pricing
            </Link>
            <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-400" />
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {/* Page Title & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activeTab === 'orders' ? 'Orders Management' : 'Inventory Management'}
            </h1>
            <p className="text-gray-500">
              {activeTab === 'orders' ? 'View and manage all customer orders' : 'Manage Microsoft 365 accounts'}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={activeTab === 'orders' ? fetchOrders : fetchInventory}
            className="border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters - Only show for Orders tab */}
        {activeTab === 'orders' && (
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search by order ID, email, domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-5 bg-[#111111] border-[#1a1a1a] text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' 
                  ? 'bg-teal-500 text-black' 
                  : 'border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1a1a1a]'}
              >
                All Orders
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('pending')}
                className={statusFilter === 'pending' 
                  ? 'bg-yellow-500 text-black' 
                  : 'border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1a1a1a]'}
              >
                <Clock className="w-4 h-4 mr-2" />
                Awaiting
              </Button>
              <Button
                variant={statusFilter === 'fulfilled' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('fulfilled')}
                className={statusFilter === 'fulfilled' 
                  ? 'bg-green-500 text-black' 
                  : 'border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1a1a1a]'}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeTab === 'orders' ? (
        <div className="grid grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="col-span-2">
            <div className="space-y-3">
              {loading ? (
                <Card className="bg-[#111111] border-[#1a1a1a]">
                  <CardContent className="p-6 text-center text-gray-400">
                    Loading orders...
                  </CardContent>
                </Card>
              ) : filteredOrders.length === 0 ? (
                <Card className="bg-[#111111] border-[#1a1a1a]">
                  <CardContent className="p-6 text-center text-gray-400">
                    No orders found
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card 
                    key={order.id} 
                    className={`bg-[#111111] border-[#1a1a1a] cursor-pointer transition-all hover:border-teal-500/50 ${
                      selectedOrder?.id === order.id ? 'border-teal-500 ring-1 ring-teal-500/50' : ''
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
                            <p className="text-white font-semibold">{order.domain_count || order.domains?.length || 0} Domain{(order.domain_count || order.domains?.length || 0) !== 1 ? 's' : ''}</p>
                            {order.total_amount > 0 && (
                              <p className="text-gray-500 text-xs">${(order.total_amount / 100).toFixed(2)}</p>
                            )}
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
              <Card className="bg-[#111111] border-[#1a1a1a] sticky top-6">
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
                        {selectedOrder.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Phone</span>
                            <span className="text-white text-sm">{selectedOrder.phone}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Domains</span>
                          <span className="text-white">{selectedOrder.domain_count || selectedOrder.domains?.length || 0}</span>
                        </div>
                        {selectedOrder.total_amount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Amount Paid</span>
                            <span className="text-green-400 font-semibold">${(selectedOrder.total_amount / 100).toFixed(2)}</span>
                          </div>
                        )}
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

                    {/* Domains List */}
                    {selectedOrder.domains?.length > 0 && (
                      <div className="pt-4 border-t border-[#1f2937]">
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Domains</h4>
                        <div className="space-y-2">
                          {selectedOrder.domains.map((domain, idx) => {
                            const domainName = typeof domain === 'string' ? domain : domain?.domain;
                            const forwardingUrl = typeof domain === 'object' ? domain?.forwardingUrl : null;
                            return (
                              <div key={idx} className="bg-[#0a0a0a] p-2 rounded">
                                <code className="text-sm text-teal-400">{domainName}</code>
                                {forwardingUrl && (
                                  <div className="text-xs text-gray-500 mt-1">→ {forwardingUrl}</div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Fulfillment Status */}
                    <div className="pt-4 border-t border-[#1f2937]">
                      <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <Server className="w-4 h-4" /> Fulfillment Status
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Status</span>
                          {getFulfillmentStatusBadge(selectedOrder.fulfillment_status)}
                        </div>
                        {selectedOrder.fulfillment_error && (
                          <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                            {selectedOrder.fulfillment_error}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nameservers Section */}
                    {selectedOrder.nameservers?.length > 0 && (() => {
                      // Extract all unique nameserver strings from the nested structure
                      const allNameservers = [];
                      selectedOrder.nameservers.forEach(ns => {
                        if (typeof ns === 'string') {
                          allNameservers.push(ns);
                        } else if (ns?.nameservers && Array.isArray(ns.nameservers)) {
                          // Handle {domain, nameservers: [...], dns_verified} structure
                          ns.nameservers.forEach(innerNs => {
                            if (typeof innerNs === 'string' && !allNameservers.includes(innerNs)) {
                              allNameservers.push(innerNs);
                            }
                          });
                        } else if (ns?.nameserver) {
                          allNameservers.push(ns.nameserver);
                        }
                      });
                      
                      if (allNameservers.length === 0) return null;
                      
                      return (
                        <div className="pt-4 border-t border-[#1f2937]">
                          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Nameservers
                          </h4>
                          <div className="space-y-2">
                            {allNameservers.map((ns, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-[#0a0a0a] p-2 rounded">
                                <code className="text-sm text-teal-400">{ns}</code>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 border-[#1f2937] text-gray-300 hover:text-white"
                              onClick={() => copyToClipboard(allNameservers.join('\n'), 'nameservers')}
                            >
                              <Copy className="w-3 h-3 mr-2" />
                              {copySuccess === 'nameservers' ? 'Copied!' : 'Copy Nameservers'}
                            </Button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Fulfillment Results - Domain Mapping */}
                    {selectedOrder.fulfillment_results?.length > 0 && (
                      <div className="pt-4 border-t border-[#1f2937]">
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Domain Fulfillment</h4>
                        <div className="space-y-3">
                          {selectedOrder.fulfillment_results.map((result, idx) => (
                            <div key={idx} className="bg-[#0a0a0a] p-3 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium text-sm">{result.domain}</span>
                                <Badge 
                                  variant="outline"
                                  className={result.status === 'completed' 
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'}
                                >
                                  {result.status}
                                </Badge>
                              </div>
                              {result.msAccountEmail && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-500">MS Account:</span>
                                  <code className="text-teal-400">{result.msAccountEmail}</code>
                                  <button 
                                    onClick={() => copyToClipboard(result.msAccountEmail, `ms-${idx}`)}
                                    className="text-gray-500 hover:text-white"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  {copySuccess === `ms-${idx}` && <span className="text-green-400 text-xs">Copied!</span>}
                                </div>
                              )}
                              {result.plugsaasOrderId && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-500">Scalesends ID:</span>
                                  <code className="text-purple-400">{result.plugsaasOrderId}</code>
                                  <a 
                                    href={`https://cloud.infra.email/#/orders/${result.plugsaasOrderId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-white"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                              {result.dns_status && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-500">DNS:</span>
                                  <Badge 
                                    variant="outline" 
                                    className={result.dns_status === 'verified' 
                                      ? 'bg-green-500/20 text-green-400 border-green-500/30 text-xs' 
                                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs'}
                                  >
                                    {result.dns_status === 'verified' ? 'Verified' : 'Pending'}
                                  </Badge>
                                </div>
                              )}
                              {result.error && (
                                <div className="text-xs text-red-400 mt-1">{result.error}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedOrder.stripe_customer_id && (
                      <div className="pt-4 border-t border-[#1f2937]">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Stripe Info</h4>
                        <p className="text-gray-500 text-xs font-mono break-all">Customer: {selectedOrder.stripe_customer_id}</p>
                        {selectedOrder.stripe_subscription_id && (
                          <p className="text-gray-500 text-xs font-mono break-all mt-1">Sub: {selectedOrder.stripe_subscription_id}</p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-[#1f2937] space-y-2">
                      {(selectedOrder.fulfillment_status === 'failed' || selectedOrder.fulfillment_status === 'partial') && (
                        <Button 
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                          onClick={() => handleRetryFulfillment(selectedOrder.id)}
                          disabled={retrying}
                        >
                          <RotateCcw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                          {retrying ? 'Retrying...' : 'Retry Fulfillment'}
                        </Button>
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
                    </div>

                    {selectedOrder.fulfillment_status === 'completed' && (
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
              <Card className="bg-[#111111] border-[#1a1a1a]">
                <CardContent className="p-6 text-center text-gray-400">
                  Select an order to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        ) : (
          /* Inventory Tab Content */
          <div className="space-y-6">
            {/* Inventory Stats */}
            {inventoryStats && (
              <div className="grid grid-cols-5 gap-4">
                <Card className="bg-[#111827] border-[#1f2937]">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-white">{inventoryStats.total}</div>
                    <div className="text-sm text-gray-400">Total</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#111827] border-[#1f2937]">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-400">{inventoryStats.available}</div>
                    <div className="text-sm text-gray-400">Available</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#111827] border-[#1f2937]">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-400">{inventoryStats.reserved}</div>
                    <div className="text-sm text-gray-400">Reserved</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#111827] border-[#1f2937]">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-teal-400">{inventoryStats.assigned}</div>
                    <div className="text-sm text-gray-400">Assigned</div>
                  </CardContent>
                </Card>
                <Card className="bg-[#111827] border-[#1f2937]">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-400">{inventoryStats.depleted}</div>
                    <div className="text-sm text-gray-400">Depleted</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Low Inventory Alert */}
            {inventoryStats?.isLow && (
              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-yellow-300 font-medium">Low Inventory Warning</p>
                    <p className="text-yellow-400/80 text-sm">Only {inventoryStats.available} accounts available</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CSV Upload Section */}
            <Card className="bg-[#111827] border-[#1f2937]">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-teal-400" />
                  Add Microsoft 365 Accounts
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      disabled={uploading}
                      className="bg-[#0a0a0a] border-[#1f2937] text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        const template = 'email,password,notes\naccount1@outlook.com,password123,\naccount2@outlook.com,password456,';
                        const blob = new Blob([template], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'inventory-template.csv';
                        a.click();
                      }}
                      className="border-[#1f2937] text-gray-300 hover:text-white whitespace-nowrap"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Template
                    </Button>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Or paste CSV data:</p>
                    <Textarea
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder="email,password,notes&#10;account@outlook.com,password123,"
                      className="bg-[#0a0a0a] border-[#1f2937] text-white font-mono text-sm"
                      rows={4}
                      disabled={uploading}
                    />
                    <Button
                      onClick={() => processCSV(csvText)}
                      disabled={uploading || !csvText.trim()}
                      className="mt-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {uploading ? 'Processing...' : 'Add Accounts'}
                    </Button>
                  </div>
                  {uploadMessage && (
                    <div className={`p-3 rounded-lg text-sm ${uploadMessage.includes('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {uploadMessage}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card className="bg-[#111827] border-[#1f2937]">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Inventory ({inventory.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1f2937]">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Domain</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryLoading ? (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td>
                        </tr>
                      ) : inventory.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-500">No inventory. Upload CSV to add accounts.</td>
                        </tr>
                      ) : (
                        inventory.map((item) => (
                          <tr key={item.id} className="border-b border-[#1f2937]/50 hover:bg-[#1f2937]/30">
                            <td className="py-3 px-4">
                              <code className="text-sm text-teal-400">{item.email}</code>
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                            <td className="py-3 px-4 text-sm text-gray-300">{item.customer_email || '-'}</td>
                            <td className="py-3 px-4 text-sm text-gray-300">{item.domain || '-'}</td>
                            <td className="py-3 px-4 text-sm text-gray-400">
                              {item.assigned_date ? new Date(item.assigned_date).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
