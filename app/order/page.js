'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Mail, Shield, Zap, Clock, Users, Plus, Trash2, Upload, FileSpreadsheet, ArrowRight, Sparkles, Globe, Server } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/order" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">DeliverOn</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-slate-600">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-sm text-indigo-300 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">Enterprise-Grade Infrastructure</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight text-balance animate-fade-in">
          Cold Email Infrastructure
          <br />
          <span className="gradient-text">Built for Scale</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-6 leading-relaxed animate-fade-in">
          Dedicated Microsoft inboxes with full DNS authentication. 100 inboxes per domain, warmed and ready to send in 48 hours.
        </p>
        
        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-12 mb-8 stagger-children">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">100</div>
            <div className="text-sm text-slate-500 mt-1">Inboxes per Domain</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">15K</div>
            <div className="text-sm text-slate-500 mt-1">Emails Monthly</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">48h</div>
            <div className="text-sm text-slate-500 mt-1">Setup Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">24/7</div>
            <div className="text-sm text-slate-500 mt-1">Support</div>
          </div>
        </div>
      </section>

      {/* Order Form Section */}
      <section className="container mx-auto px-6 py-12" id="order">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Configure Your Order</h2>
            <p className="text-slate-400">Select your domains and we'll handle the rest</p>
          </div>

          <Card className="bg-slate-900/50 border-slate-800/50 card-glow backdrop-blur-sm">
            <CardHeader className="pb-6 border-b border-slate-800/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-white font-semibold">Order Details</CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    <span className="text-indigo-400 font-semibold">${pricePerDomain}</span> per domain • Full infrastructure included
                  </CardDescription>
                </div>
                <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOrderMode('single')}
                    className={`transition-all ${orderMode === 'single' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                  >
                    Manual Entry
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOrderMode('bulk')}
                    className={`transition-all ${orderMode === 'bulk' 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-600' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-400">1</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-300">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email Address <span className="text-indigo-400">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-colors h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-300 text-sm font-medium">Phone Number <span className="text-slate-500">(optional)</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-colors h-11"
                    />
                  </div>
                </div>
              </div>

              {orderMode === 'single' ? (
                <>
                  {/* Domain Entries */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-indigo-400">2</span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-300">Domain Configuration</h3>
                        <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">{domainEntries.length} domain{domainEntries.length > 1 ? 's' : ''}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addDomainEntry}
                        className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Add Domain
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {domainEntries.map((entry, domainIndex) => (
                        <div key={domainIndex} className="bg-slate-800/30 rounded-xl p-5 space-y-5 border border-slate-700/50 transition-all hover:border-slate-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-indigo-400" />
                              <span className="text-white font-medium">Domain {domainIndex + 1}</span>
                            </div>
                            {domainEntries.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDomainEntry(domainIndex)}
                                className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-slate-400 text-sm">Domain Name <span className="text-indigo-400">*</span></Label>
                              <Input
                                placeholder="example.com"
                                value={entry.domain}
                                onChange={(e) => updateDomainEntry(domainIndex, 'domain', e.target.value)}
                                className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-indigo-500/50 h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-slate-400 text-sm">Forwarding URL <span className="text-indigo-400">*</span></Label>
                              <Input
                                placeholder="https://yourwebsite.com"
                                value={entry.forwardingUrl}
                                onChange={(e) => updateDomainEntry(domainIndex, 'forwardingUrl', e.target.value)}
                                className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-indigo-500/50 h-11"
                              />
                            </div>
                          </div>

                          {/* Names for this domain */}
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-slate-400 text-sm">Inbox Names <span className="text-slate-500">(1-3 required)</span></Label>
                              {entry.names.length < 3 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addName(domainIndex)}
                                  className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-7 text-xs"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Name
                                </Button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {entry.names.map((name, nameIndex) => (
                                <div key={nameIndex} className="flex gap-3 items-center">
                                  <Input
                                    placeholder="First Name"
                                    value={name.firstName}
                                    onChange={(e) => updateName(domainIndex, nameIndex, 'firstName', e.target.value)}
                                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-indigo-500/50 h-10"
                                  />
                                  <Input
                                    placeholder="Last Name"
                                    value={name.lastName}
                                    onChange={(e) => updateName(domainIndex, nameIndex, 'lastName', e.target.value)}
                                    className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-indigo-500/50 h-10"
                                  />
                                  {entry.names.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeName(domainIndex, nameIndex)}
                                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0 flex-shrink-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Bulk CSV Upload */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span className="text-xs font-semibold text-indigo-400">2</span>
                    </div>
                    <h3 className="text-sm font-medium text-slate-300">Bulk Upload</h3>
                  </div>
                  
                  <div className="bg-slate-800/30 rounded-xl p-8 border-2 border-dashed border-slate-700/50 text-center hover:border-indigo-500/30 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      ref={fileInputRef}
                      className="hidden"
                      id="csv-upload"
                    />
                    {!csvData ? (
                      <label htmlFor="csv-upload" className="cursor-pointer block">
                        <div className="w-14 h-14 bg-slate-800/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <FileSpreadsheet className="w-7 h-7 text-slate-400" />
                        </div>
                        <p className="text-white font-medium mb-1">Drop your CSV file here</p>
                        <p className="text-slate-500 text-sm">or click to browse</p>
                        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg inline-block">
                          <p className="text-slate-400 text-xs font-mono">
                            domain, forwarding, firstname1, lastname1, firstname2, lastname2...
                          </p>
                        </div>
                      </label>
                    ) : (
                      <div>
                        <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
                        </div>
                        <p className="text-white font-medium">{csvFileName}</p>
                        <p className="text-emerald-400 text-sm mt-1">{csvData.length} domains loaded successfully</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearCsv}
                          className="mt-4 border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove File
                        </Button>
                      </div>
                    )}
                  </div>

                  {csvData && csvData.length > 0 && (
                    <div className="bg-slate-800/30 rounded-xl p-4 max-h-48 overflow-y-auto border border-slate-700/50">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Preview</p>
                      <div className="space-y-2">
                        {csvData.slice(0, 5).map((entry, i) => (
                          <div key={i} className="text-sm text-slate-300 py-2 px-3 bg-slate-800/50 rounded-lg flex items-center gap-2">
                            <Globe className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            <span className="text-indigo-300 font-medium">{entry.domain}</span>
                            <span className="text-slate-600">→</span>
                            <span className="text-slate-500 truncate">{entry.forwardingUrl || 'No forwarding'}</span>
                          </div>
                        ))}
                      </div>
                      {csvData.length > 5 && (
                        <p className="text-slate-500 text-xs mt-3 text-center">+ {csvData.length - 5} more domains</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-slate-800/50 rounded-xl p-6 border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-indigo-400">3</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-300">Order Summary</h3>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-slate-400 text-sm">
                      {orderMode === 'bulk' && csvData ? csvData.length : domainEntries.length} domain{(orderMode === 'bulk' && csvData ? csvData.length : domainEntries.length) > 1 ? 's' : ''} × ${pricePerDomain}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">Full infrastructure included</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
                    <span className="text-3xl font-bold text-white">${totalPrice}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-400 text-xs">!</span>
                  </div>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* CTA Button */}
              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white py-6 text-base font-semibold btn-glow transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue to Payment
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              {/* Features List */}
              <div className="pt-6 border-t border-slate-800/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-4 text-center">What's Included</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30 transition-colors">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-slate-400 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-10">
            <div className="flex items-center gap-2.5 text-slate-400">
              <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-sm font-medium">Secure Stripe Payment</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-400">
              <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-sm font-medium">48-Hour Setup</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-400">
              <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-400">DeliverOn</span>
            </div>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} DeliverOn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
