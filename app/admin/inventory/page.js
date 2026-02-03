'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, RefreshCw, Search, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function InventoryPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [csvText, setCsvText] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    checkAuth();
    fetchInventory();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/admin/inventory');
      const data = await response.json();
      
      if (data.inventory) {
        setInventory(data.inventory);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
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

      // Skip header row if it exists
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
        setUploadMessage(`✅ Successfully added ${data.added} accounts!`);
        setCsvText('');
        fetchInventory();
      } else {
        setUploadMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setUploadMessage(`❌ Error processing CSV: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleManualAdd = async () => {
    if (!csvText.trim()) return;
    await processCSV(csvText);
  };

  const getStatusBadge = (status) => {
    const config = {
      available: { label: 'Available', className: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle2 },
      reserved: { label: 'Reserved', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
      assigned: { label: 'Assigned', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle2 },
      depleted: { label: 'Depleted', className: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
    };

    const { label, className, icon: Icon } = config[status] || config.available;
    return (
      <Badge variant="outline" className={`${className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const filteredInventory = inventory.filter(item =>
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadTemplate = () => {
    const template = 'email,password,notes\naccount1@outlook.com,password123,Optional notes\naccount2@outlook.com,password456,';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-template.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Inventory Management</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/orders')}
              className="border-zinc-700"
            >
              Orders
            </Button>
            <Button
              variant="outline"
              onClick={fetchInventory}
              className="border-zinc-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-zinc-400">Total</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-400">{stats.available}</div>
                <div className="text-sm text-zinc-400">Available</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-400">{stats.reserved}</div>
                <div className="text-sm text-zinc-400">Reserved</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-400">{stats.assigned}</div>
                <div className="text-sm text-zinc-400">Assigned</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-400">{stats.depleted}</div>
                <div className="text-sm text-zinc-400">Depleted</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Low Inventory Alert */}
        {stats?.isLow && (
          <Card className="bg-yellow-500/10 border-yellow-500/30 mb-6">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-300 font-medium">Low Inventory Warning</p>
                  <p className="text-yellow-400/80 text-sm">
                    Only {stats.available} accounts available (threshold: {stats.threshold})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Add Microsoft 365 Accounts
            </CardTitle>
            <CardDescription>
              Upload CSV file or paste accounts manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CSV Upload */}
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                disabled={uploading}
                className="bg-zinc-800 border-zinc-700"
              />
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="border-zinc-700 whitespace-nowrap"
              >
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>

            {/* Manual Entry */}
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Or paste CSV data (email,password,notes):
              </label>
              <Textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="account1@outlook.com,password123,notes&#10;account2@outlook.com,password456,"
                className="bg-zinc-800 border-zinc-700 font-mono text-sm"
                rows={5}
                disabled={uploading}
              />
              <Button
                onClick={handleManualAdd}
                disabled={uploading || !csvText.trim()}
                className="mt-2 bg-purple-600 hover:bg-purple-700"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Add Accounts
                  </>
                )}
              </Button>
            </div>

            {/* Upload Message */}
            {uploadMessage && (
              <div className={`p-3 rounded-lg ${uploadMessage.includes('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {uploadMessage}
              </div>
            )}

            {/* Format Info */}
            <div className="bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-400">
              <p className="font-medium text-white mb-1">CSV Format:</p>
              <code className="text-xs">email,password,notes</code>
              <p className="mt-2">Example:</p>
              <code className="text-xs">account@outlook.com,MyPassword123,Optional notes</code>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inventory ({filteredInventory.length})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Domain</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Date Added</th>
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Assigned Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-zinc-500">
                        No inventory found. Upload CSV to add accounts.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                        <td className="py-3 px-4">
                          <code className="text-sm text-purple-400">{item.email}</code>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-300">
                          {item.customer_email || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-300">
                          {item.domain || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-400">
                          {item.date_added ? new Date(item.date_added).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-zinc-400">
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
      </main>
    </div>
  );
}
