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
  ChevronDown,
  ChevronRight,
  Zap,
  Sparkles,
  Bell,
  HelpCircle,
  Search,
  Info
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
  const [expandedSections, setExpandedSections] = useState({
    orders: true,
    analytics: false,
    settings: false
  });

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
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a]">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </Link>

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

            <Link href="/admin/pricing" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1a1a1a] text-white">
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
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Pricing Management</h1>
                  <p className="text-sm text-gray-500">Configure tiered pricing for inbox orders</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="border-gray-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* SMTP Tier */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">SMTP Tier</h3>
                    <p className="text-sm text-gray-500 mt-1">Flat rate for all SMTP orders</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">SMTP</Badge>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Price per Inbox ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pricing.smtp.pricePerInbox}
                      onChange={(e) => setPricing({
                        ...pricing,
                        smtp: { ...pricing.smtp, pricePerInbox: parseFloat(e.target.value) }
                      })}
                      className="bg-gray-50 border-gray-200"
                    />
                    <p className="text-xs text-gray-400 mt-2">Flat rate for all SMTP inboxes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                    <Input
                      value={pricing.smtp.description}
                      onChange={(e) => setPricing({
                        ...pricing,
                        smtp: { ...pricing.smtp, description: e.target.value }
                      })}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Tier */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">BASIC Tier</h3>
                    <p className="text-sm text-gray-500 mt-1">For orders under the threshold</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">BASIC</Badge>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Threshold</label>
                    <Input
                      type="number"
                      value={pricing.basic.threshold}
                      onChange={(e) => setPricing({
                        ...pricing,
                        basic: { ...pricing.basic, threshold: parseInt(e.target.value) }
                      })}
                      className="bg-gray-50 border-gray-200"
                    />
                    <p className="text-xs text-gray-400 mt-2">Orders below this count</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Price per Inbox ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pricing.basic.pricePerInbox}
                      onChange={(e) => setPricing({
                        ...pricing,
                        basic: { ...pricing.basic, pricePerInbox: parseFloat(e.target.value) }
                      })}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                    <Input
                      value={pricing.basic.description}
                      onChange={(e) => setPricing({
                        ...pricing,
                        basic: { ...pricing.basic, description: e.target.value }
                      })}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Intermediate Tier */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">INTERMEDIATE Tier</h3>
                    <p className="text-sm text-gray-500 mt-1">For orders between thresholds</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">INTERMEDIATE</Badge>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Threshold</label>
                    <Input
                      type="number"
                      value={pricing.intermediate.threshold}
                      onChange={(e) => setPricing({
                        ...pricing,
                        intermediate: { ...pricing.intermediate, threshold: parseInt(e.target.value) }
                      })}
                      className="bg-gray-50 border-gray-200"
                    />
                    <p className="text-xs text-gray-400 mt-2">Orders below this count</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Price per Inbox ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pricing.intermediate.pricePerInbox}
                      onChange={(e) => setPricing({
                        ...pricing,
                        intermediate: { ...pricing.intermediate, pricePerInbox: parseFloat(e.target.value) }
                      })}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                    <Input
                      value={pricing.intermediate.description}
                      onChange={(e) => setPricing({
                        ...pricing,
                        intermediate: { ...pricing.intermediate, description: e.target.value }
                      })}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">PRO Tier</h3>
                    <p className="text-sm text-gray-500 mt-1">For orders above the threshold</p>
                  </div>
                  <Badge className="bg-violet-100 text-violet-700 border-violet-200">PRO</Badge>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Threshold</label>
                    <Input
                      type="text"
                      value="No limit (+)"
                      disabled
                      className="bg-gray-100 border-gray-200 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Price per Inbox ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={pricing.pro.pricePerInbox}
                      onChange={(e) => setPricing({
                        ...pricing,
                        pro: { ...pricing.pro, pricePerInbox: parseFloat(e.target.value) }
                      })}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Description</label>
                    <Input
                      value={pricing.pro.description}
                      onChange={(e) => setPricing({
                        ...pricing,
                        pro: { ...pricing.pro, description: e.target.value }
                      })}
                      className="bg-gray-50 border-gray-200"
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
