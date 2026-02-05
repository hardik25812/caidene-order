'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  RefreshCw, 
  Save, 
  DollarSign,
  Home,
  Package,
  Settings,
  BarChart3,
  Users,
  Activity,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function PricingManagement() {
  const [pricing, setPricing] = useState({
    smtp: {
      pricePerInbox: 1,
      description: 'SMTP inboxes - flat rate'
    },
    basic: {
      threshold: 250,
      pricePerInbox: 3.5,
      description: 'For orders under 250 accounts'
    },
    intermediate: {
      threshold: 500,
      pricePerInbox: 3.25,
      description: 'For orders 250-499 accounts'
    },
    pro: {
      threshold: null,
      pricePerInbox: 2.8,
      description: 'For orders 500+ accounts'
    }
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving pricing:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const response = await fetch('/api/admin/pricing');
      const data = await response.json();
      if (data.pricing) {
        setPricing(data.pricing);
      }
    } catch (err) {
      console.error('Error fetching pricing:', err);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

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
            <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#151515]">
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">Orders</span>
            </Link>
            <Link href="/admin/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
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
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Pricing Management</h1>
                  <p className="text-sm text-gray-500">Configure tiered pricing for inbox orders</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="border-[#2a2a2a] bg-transparent text-gray-300 hover:text-white hover:bg-[#151515]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-teal-500 hover:bg-teal-600 text-black font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* SMTP Tier */}
            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">SMTP Tier</h3>
                    <p className="text-sm text-gray-500 mt-1">Flat rate for all SMTP orders</p>
                  </div>
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">SMTP</Badge>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Price per Inbox ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pricing.smtp.pricePerInbox}
                      onChange={(e) => setPricing({
                        ...pricing,
                        smtp: { ...pricing.smtp, pricePerInbox: parseFloat(e.target.value) }
                      })}
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white focus:border-teal-500"
                    />
                    <p className="text-xs text-gray-600 mt-2">Flat rate for all SMTP inboxes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Description</label>
                    <Input
                      value={pricing.smtp.description}
                      onChange={(e) => setPricing({
                        ...pricing,
                        smtp: { ...pricing.smtp, description: e.target.value }
                      })}
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white focus:border-teal-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Tier */}
            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">BASIC Tier</h3>
                    <p className="text-sm text-gray-500 mt-1">For orders under the threshold</p>
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">BASIC</Badge>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Threshold</label>
                    <Input
                      type="number"
                      value={pricing.basic.threshold}
                      onChange={(e) => setPricing({
                        ...pricing,
                        basic: { ...pricing.basic, threshold: parseInt(e.target.value) }
                      })}
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white focus:border-teal-500"
                    />
                    <p className="text-xs text-gray-600 mt-2">Orders below this count</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Price per Inbox ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pricing.basic.pricePerInbox}
                      onChange={(e) => setPricing({
                        ...pricing,
                        basic: { ...pricing.basic, pricePerInbox: parseFloat(e.target.value) }
                      })}
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Description</label>
                    <Input
                      value={pricing.basic.description}
                      onChange={(e) => setPricing({
                        ...pricing,
                        basic: { ...pricing.basic, description: e.target.value }
                      })}
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white focus:border-teal-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intermediate Tier */}
            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">INTERMEDIATE Tier</h3>
                    <p className="text-sm text-gray-500 mt-1">For orders between thresholds</p>
                  </div>
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">INTERMEDIATE</Badge>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Threshold</label>
                    <Input
                      type="number"
                      value={pricing.intermediate.threshold}
                      onChange={(e) => setPricing({
                        ...pricing,
                        intermediate: { ...pricing.intermediate, threshold: parseInt(e.target.value) }
                      })}
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white focus:border-teal-500"
                    />
                    <p className="text-xs text-gray-600 mt-2">Orders below this count</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Price per Inbox ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pricing.intermediate.pricePerInbox}
                      onChange={(e) => setPricing({
                        ...pricing,
                        intermediate: { ...pricing.intermediate, pricePerInbox: parseFloat(e.target.value) }
                      })}
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Description</label>
                    <Input
                      value={pricing.intermediate.description}
                      onChange={(e) => setPricing({
                        ...pricing,
                        intermediate: { ...pricing.intermediate, description: e.target.value }
                      })}
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white focus:border-teal-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="bg-[#111111] border-[#1a1a1a]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">PRO Tier</h3>
                    <p className="text-sm text-gray-500 mt-1">For orders above the threshold</p>
                  </div>
                  <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20">PRO</Badge>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Threshold</label>
                    <Input
                      type="text"
                      value="No limit (+)"
                      disabled
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Price per Inbox ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pricing.pro.pricePerInbox}
                      onChange={(e) => setPricing({
                        ...pricing,
                        pro: { ...pricing.pro, pricePerInbox: parseFloat(e.target.value) }
                      })}
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Description</label>
                    <Input
                      value={pricing.pro.description}
                      onChange={(e) => setPricing({
                        ...pricing,
                        pro: { ...pricing.pro, description: e.target.value }
                      })}
                      className="bg-[#0a0a0a] border-[#2a2a2a] text-white focus:border-teal-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
