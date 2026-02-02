'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Mail, Shield, Zap, Clock, Users, Plus, Trash2, Upload, FileSpreadsheet } from 'lucide-react';

export default function OrderPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [domainCount, setDomainCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderMode, setOrderMode] = useState('single'); // 'single' or 'bulk'
  const fileInputRef = useRef(null);
  
  // Domain entries - each domain has its own names and forwarding
  const [domainEntries, setDomainEntries] = useState([
    {
      domain: '',
      forwardingUrl: '',
      names: [{ firstName: '', lastName: '' }]
    }
  ]);

  // Bulk CSV data
  const [csvData, setCsvData] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');

  const pricePerDomain = 49;
  const totalPrice = pricePerDomain * (orderMode === 'bulk' && csvData ? csvData.length : domainEntries.length);

  // Helper functions for domain entries
  const addDomainEntry = () => {
    setDomainEntries([...domainEntries, {
      domain: '',
      forwardingUrl: '',
      names: [{ firstName: '', lastName: '' }]
    }]);
  };

  const removeDomainEntry = (index) => {
    if (domainEntries.length > 1) {
      setDomainEntries(domainEntries.filter((_, i) => i !== index));
    }
  };

  const updateDomainEntry = (index, field, value) => {
    const updated = [...domainEntries];
    updated[index][field] = value;
    setDomainEntries(updated);
  };

  const addName = (domainIndex) => {
    if (domainEntries[domainIndex].names.length < 3) {
      const updated = [...domainEntries];
      updated[domainIndex].names.push({ firstName: '', lastName: '' });
      setDomainEntries(updated);
    }
  };

  const removeName = (domainIndex, nameIndex) => {
    if (domainEntries[domainIndex].names.length > 1) {
      const updated = [...domainEntries];
      updated[domainIndex].names = updated[domainIndex].names.filter((_, i) => i !== nameIndex);
      setDomainEntries(updated);
    }
  };

  const updateName = (domainIndex, nameIndex, field, value) => {
    const updated = [...domainEntries];
    updated[domainIndex].names[nameIndex][field] = value;
    setDomainEntries(updated);
  };

  // CSV parsing
  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const entry = {};
          headers.forEach((header, i) => {
            entry[header] = values[i] || '';
          });
          return {
            domain: entry.domain || entry.domainname || '',
            forwardingUrl: entry.forwarding || entry.forwardingurl || entry.redirect || '',
            names: [
              { firstName: entry.firstname1 || entry.first1 || '', lastName: entry.lastname1 || entry.last1 || '' },
              { firstName: entry.firstname2 || entry.first2 || '', lastName: entry.lastname2 || entry.last2 || '' },
              { firstName: entry.firstname3 || entry.first3 || '', lastName: entry.lastname3 || entry.last3 || '' }
            ].filter(n => n.firstName || n.lastName)
          };
        }).filter(entry => entry.domain);

        setCsvData(data);
      }
    };
    reader.readAsText(file);
  };

  const clearCsv = () => {
    setCsvData(null);
    setCsvFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validation
  const validateOrder = () => {
    if (!email || !email.includes('@')) {
      return 'Please enter a valid email address';
    }

    if (orderMode === 'single') {
      for (let i = 0; i < domainEntries.length; i++) {
        const entry = domainEntries[i];
        if (!entry.domain) {
          return `Please enter a domain name for domain ${i + 1}`;
        }
        if (!entry.forwardingUrl) {
          return `Please enter a forwarding URL for domain ${i + 1}`;
        }
        const hasValidName = entry.names.some(n => n.firstName && n.lastName);
        if (!hasValidName) {
          return `Please enter at least one complete name (first and last) for domain ${i + 1}`;
        }
      }
    } else if (orderMode === 'bulk') {
      if (!csvData || csvData.length === 0) {
        return 'Please upload a valid CSV file with domain data';
      }
    }

    return null;
  };

  const handleCheckout = async () => {
    const validationError = validateOrder();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = orderMode === 'bulk' ? csvData : domainEntries;
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          domains: orderData,
          domainCount: orderData.length,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    '100 Microsoft inboxes per domain',
    '15,000 emails per domain monthly',
    'Full DNS authentication (SPF, DKIM, DMARC)',
    'Custom tracking domains',
    'Sequencer integration included',
    'Warmup and sending settings configured',
    '24/7 WhatsApp support',
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DeliverOn</span>
          </div>
          <a href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Sign In
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full text-sm text-zinc-400 mb-6">
          <Zap className="w-4 h-4 text-purple-500" />
          ENTERPRISE GRADE INFRASTRUCTURE
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Cold Emails
          <br />
          <span className="gradient-text">Do At Scale</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Dedicated Microsoft inboxes built for volume. 100 per domain, fully authenticated, warming and ready to send in 48 hours.
        </p>
      </section>

      {/* Order Form Section */}
      <section className="container mx-auto px-4 py-8" id="order">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Place Your Order</h2>
        <p className="text-zinc-400 text-center mb-8">Fill in your details to get started</p>

        <div className="max-w-3xl mx-auto">
          <Card className="bg-zinc-900 border-purple-500/50 card-glow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white">Order Details</CardTitle>
                  <CardDescription className="text-zinc-400">
                    ${pricePerDomain} per domain
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={orderMode === 'single' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrderMode('single')}
                    className={orderMode === 'single' ? 'bg-purple-600' : 'border-zinc-700 text-zinc-300'}
                  >
                    Single Entry
                  </Button>
                  <Button
                    variant={orderMode === 'bulk' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOrderMode('bulk')}
                    className={orderMode === 'bulk' ? 'bg-purple-600' : 'border-zinc-700 text-zinc-300'}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Bulk CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {orderMode === 'single' ? (
                <>
                  {/* Domain Entries */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white text-lg">Domains ({domainEntries.length})</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addDomainEntry}
                        className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Domain
                      </Button>
                    </div>

                    {domainEntries.map((entry, domainIndex) => (
                      <div key={domainIndex} className="bg-zinc-800/50 rounded-xl p-4 space-y-4 border border-zinc-700">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">Domain {domainIndex + 1}</span>
                          {domainEntries.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDomainEntry(domainIndex)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-zinc-300">Domain Name *</Label>
                            <Input
                              placeholder="example.com"
                              value={entry.domain}
                              onChange={(e) => updateDomainEntry(domainIndex, 'domain', e.target.value)}
                              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-zinc-300">Domain Forwarding URL *</Label>
                            <Input
                              placeholder="https://yourwebsite.com"
                              value={entry.forwardingUrl}
                              onChange={(e) => updateDomainEntry(domainIndex, 'forwardingUrl', e.target.value)}
                              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                          </div>
                        </div>

                        {/* Names for this domain */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-zinc-300">Inbox Names (1-3 required)</Label>
                            {entry.names.length < 3 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addName(domainIndex)}
                                className="text-purple-400 hover:text-purple-300"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Name
                              </Button>
                            )}
                          </div>
                          {entry.names.map((name, nameIndex) => (
                            <div key={nameIndex} className="flex gap-2 items-center">
                              <Input
                                placeholder="First Name"
                                value={name.firstName}
                                onChange={(e) => updateName(domainIndex, nameIndex, 'firstName', e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                              />
                              <Input
                                placeholder="Last Name"
                                value={name.lastName}
                                onChange={(e) => updateName(domainIndex, nameIndex, 'lastName', e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                              />
                              {entry.names.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeName(domainIndex, nameIndex)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 px-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Bulk CSV Upload */
                <div className="space-y-4">
                  <div className="bg-zinc-800/50 rounded-xl p-6 border-2 border-dashed border-zinc-600 text-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      ref={fileInputRef}
                      className="hidden"
                      id="csv-upload"
                    />
                    {!csvData ? (
                      <label htmlFor="csv-upload" className="cursor-pointer">
                        <FileSpreadsheet className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
                        <p className="text-white font-medium">Upload CSV File</p>
                        <p className="text-zinc-400 text-sm mt-1">
                          Columns: domain, forwarding, firstname1, lastname1, firstname2, lastname2, firstname3, lastname3
                        </p>
                      </label>
                    ) : (
                      <div>
                        <FileSpreadsheet className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-white font-medium">{csvFileName}</p>
                        <p className="text-green-400 text-sm mt-1">{csvData.length} domains loaded</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearCsv}
                          className="mt-3 border-red-500 text-red-400 hover:bg-red-500/20"
                        >
                          Remove File
                        </Button>
                      </div>
                    )}
                  </div>

                  {csvData && csvData.length > 0 && (
                    <div className="bg-zinc-800/50 rounded-xl p-4 max-h-48 overflow-y-auto">
                      <p className="text-zinc-400 text-sm mb-2">Preview (first 5 entries):</p>
                      {csvData.slice(0, 5).map((entry, i) => (
                        <div key={i} className="text-sm text-zinc-300 py-1 border-b border-zinc-700 last:border-0">
                          <span className="text-purple-400">{entry.domain}</span>
                          {' → '}
                          <span className="text-zinc-500">{entry.forwardingUrl || 'No forwarding'}</span>
                          {' | '}
                          <span>{entry.names.map(n => `${n.firstName} ${n.lastName}`).join(', ')}</span>
                        </div>
                      ))}
                      {csvData.length > 5 && (
                        <p className="text-zinc-500 text-sm mt-2">...and {csvData.length - 5} more</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-zinc-300">Total</span>
                    <p className="text-zinc-500 text-sm">
                      {orderMode === 'bulk' && csvData ? csvData.length : domainEntries.length} domain(s) × ${pricePerDomain}
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-white">${totalPrice}</span>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              {/* CTA Button */}
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold btn-glow transition-all"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </Button>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-zinc-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          <div className="flex items-center gap-2 text-zinc-400">
            <Shield className="w-5 h-5 text-purple-500" />
            <span className="text-sm">Secure Payment via Stripe</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-sm">48-Hour Setup</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Users className="w-5 h-5 text-purple-500" />
            <span className="text-sm">24/7 Support</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-zinc-500 text-sm">
          © {new Date().getFullYear()} DeliverOn. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
