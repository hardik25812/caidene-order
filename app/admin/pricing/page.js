'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Save, DollarSign } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-white flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-teal-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Pricing Management</h1>
                <p className="text-gray-500 text-sm">Configure tiered pricing for inbox orders</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-500 hover:bg-teal-600 text-black"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* SMTP Tier */}
          <Card className="bg-[#111111] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">SMTP Tier</h3>
                  <p className="text-gray-500 text-sm mt-1">Flat rate for all SMTP orders</p>
                </div>
                <Badge className="bg-orange-500 text-white">SMTP</Badge>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Price per Inbox ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricing.smtp.pricePerInbox}
                    onChange={(e) => setPricing({
                      ...pricing,
                      smtp: { ...pricing.smtp, pricePerInbox: parseFloat(e.target.value) }
                    })}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  />
                  <p className="text-gray-600 text-xs mt-2">Flat rate for all SMTP inboxes</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Description</label>
                  <Input
                    value={pricing.smtp.description}
                    onChange={(e) => setPricing({
                      ...pricing,
                      smtp: { ...pricing.smtp, description: e.target.value }
                    })}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
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
                  <h3 className="text-xl font-bold text-white">BASIC Tier</h3>
                  <p className="text-gray-500 text-sm mt-1">For orders under the threshold</p>
                </div>
                <Badge className="bg-teal-500 text-black">BASIC</Badge>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Threshold</label>
                  <Input
                    type="number"
                    value={pricing.basic.threshold}
                    onChange={(e) => setPricing({
                      ...pricing,
                      basic: { ...pricing.basic, threshold: parseInt(e.target.value) }
                    })}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  />
                  <p className="text-gray-600 text-xs mt-2">Orders below this count</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Price per Inbox ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricing.basic.pricePerInbox}
                    onChange={(e) => setPricing({
                      ...pricing,
                      basic: { ...pricing.basic, pricePerInbox: parseFloat(e.target.value) }
                    })}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Description</label>
                  <Input
                    value={pricing.basic.description}
                    onChange={(e) => setPricing({
                      ...pricing,
                      basic: { ...pricing.basic, description: e.target.value }
                    })}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
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
                  <h3 className="text-xl font-bold text-white">INTERMEDIATE Tier</h3>
                  <p className="text-gray-500 text-sm mt-1">For orders between thresholds</p>
                </div>
                <Badge className="bg-cyan-500 text-black">INTERMEDIATE</Badge>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Threshold</label>
                  <Input
                    type="number"
                    value={pricing.intermediate.threshold}
                    onChange={(e) => setPricing({
                      ...pricing,
                      intermediate: { ...pricing.intermediate, threshold: parseInt(e.target.value) }
                    })}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  />
                  <p className="text-gray-600 text-xs mt-2">Orders below this count</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Price per Inbox ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricing.intermediate.pricePerInbox}
                    onChange={(e) => setPricing({
                      ...pricing,
                      intermediate: { ...pricing.intermediate, pricePerInbox: parseFloat(e.target.value) }
                    })}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Description</label>
                  <Input
                    value={pricing.intermediate.description}
                    onChange={(e) => setPricing({
                      ...pricing,
                      intermediate: { ...pricing.intermediate, description: e.target.value }
                    })}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
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
                  <h3 className="text-xl font-bold text-white">PRO Tier</h3>
                  <p className="text-gray-500 text-sm mt-1">For orders above the threshold</p>
                </div>
                <Badge className="bg-purple-500 text-white">PRO</Badge>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Threshold</label>
                  <Input
                    type="text"
                    value="No limit (+)"
                    disabled
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Price per Inbox ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricing.pro.pricePerInbox}
                    onChange={(e) => setPricing({
                      ...pricing,
                      pro: { ...pricing.pro, pricePerInbox: parseFloat(e.target.value) }
                    })}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Description</label>
                  <Input
                    value={pricing.pro.description}
                    onChange={(e) => setPricing({
                      ...pricing,
                      pro: { ...pricing.pro, description: e.target.value }
                    })}
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
