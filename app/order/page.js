'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Check,
  Mail,
  Shield,
  Zap,
  Clock,
  Users,
  Plus,
  Trash2,
  Upload,
  FileSpreadsheet,
  ArrowRight,
  Globe,
  Server,
  Sparkles,
  ChevronRight,
  Star,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function OrderPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderMode, setOrderMode] = useState('single');
  const fileInputRef = useRef(null);

  const [domainEntries, setDomainEntries] = useState([
    {
      domain: '',
      forwardingUrl: '',
      names: [{ firstName: '', lastName: '' }]
    }
  ]);

  const [csvData, setCsvData] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [pricePerDomain, setPricePerDomain] = useState(49);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/admin/pricing');
        const data = await res.json();
        if (data.pricing?.landingPagePrice) {
          setPricePerDomain(data.pricing.landingPagePrice);
        }
      } catch (err) {
        console.error('Error fetching pricing:', err);
      }
    };
    fetchPricing();
  }, []);

  const totalPrice = pricePerDomain * (orderMode === 'bulk' && csvData ? csvData.length : domainEntries.length);

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
    { text: '100 Microsoft inboxes per domain', icon: Mail },
    { text: '15,000 emails per domain monthly', icon: TrendingUp },
    { text: 'Full DNS authentication (SPF, DKIM, DMARC)', icon: Shield },
    { text: 'Custom tracking domains', icon: Globe },
    { text: 'Sequencer integration included', icon: Zap },
    { text: '24/7 WhatsApp support', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation Header */}
      <header className="bg-[#0a0a0a] border-b border-[#1a1a1a]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/order" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight">DELIVERON</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors font-medium px-3 py-2"
            >
              Sign In
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-[#2a2a2a] text-gray-300 hover:text-white hover:bg-[#151515]"
              >
                Dashboard
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 pt-16 pb-12">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-full text-sm text-teal-400 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Enterprise-Grade Infrastructure</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight animate-fade-in-up">
              Cold Email Infrastructure
              <br />
              <span className="gradient-text">Built for Scale</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up">
              Dedicated Microsoft inboxes with full DNS authentication. 100 inboxes per domain, warmed and ready to send.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto stagger-children">
              {[
                { value: '100', label: 'Inboxes/Domain' },
                { value: '15K', label: 'Monthly Emails' },
                { value: '48h', label: 'Setup Time' },
                { value: '24/7', label: 'Support' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Order Form Section */}
      <section className="container mx-auto max-w-4xl px-6 pb-20">
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-2xl overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Configure Your Order</h2>
              <p className="text-sm text-gray-500 mt-1">
                <span className="text-teal-400 font-semibold">${pricePerDomain}</span> per domain, full infrastructure included
              </p>
            </div>
            <div className="flex gap-1 p-1 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
              <button
                onClick={() => setOrderMode('single')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  orderMode === 'single'
                    ? 'bg-teal-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setOrderMode('bulk')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  orderMode === 'bulk'
                    ? 'bg-teal-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                Bulk CSV
              </button>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-8">
            {/* Step 1: Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">1</span>
                </div>
                <h3 className="text-sm font-semibold text-white">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-10">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-400">
                    Email Address <span className="text-teal-400">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-[#0a0a0a] border-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-teal-500 focus:ring-teal-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-400">
                    Phone Number <span className="text-gray-500">(optional)</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 bg-[#0a0a0a] border-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-teal-500 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Domain Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">2</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {orderMode === 'single' ? 'Domain Configuration' : 'Bulk Upload'}
                  </h3>
                  {orderMode === 'single' && (
                    <span className="text-xs text-gray-500 bg-[#111111] px-2 py-1 rounded-full">
                      {domainEntries.length} domain{domainEntries.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {orderMode === 'single' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addDomainEntry}
                    className="h-8 border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Domain
                  </Button>
                )}
              </div>

              <div className="pl-10">
                {orderMode === 'single' ? (
                  <div className="space-y-4">
                    {domainEntries.map((entry, domainIndex) => (
                      <div
                        key={domainIndex}
                        className="rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] p-5 space-y-5 hover:border-[#2a2a2a] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-teal-400" />
                            <span className="text-sm font-medium text-white">Domain {domainIndex + 1}</span>
                          </div>
                          {domainEntries.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDomainEntry(domainIndex)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-400">
                              Domain Name <span className="text-teal-400">*</span>
                            </Label>
                            <Input
                              placeholder="example.com"
                              value={entry.domain}
                              onChange={(e) => updateDomainEntry(domainIndex, 'domain', e.target.value)}
                              className="h-10 bg-[#080808] border-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-teal-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-gray-400">
                              Forwarding URL <span className="text-teal-400">*</span>
                            </Label>
                            <Input
                              placeholder="https://yourwebsite.com"
                              value={entry.forwardingUrl}
                              onChange={(e) => updateDomainEntry(domainIndex, 'forwardingUrl', e.target.value)}
                              className="h-10 bg-[#080808] border-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-teal-500"
                            />
                          </div>
                        </div>

                        {/* Names Section */}
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-gray-400">
                              Inbox Names <span className="text-gray-500">(1-3 required)</span>
                            </Label>
                            {entry.names.length < 3 && (
                              <button
                                onClick={() => addName(domainIndex)}
                                className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Add Name
                              </button>
                            )}
                          </div>
                          <div className="space-y-2">
                            {entry.names.map((name, nameIndex) => (
                              <div key={nameIndex} className="flex gap-3 items-center">
                                <Input
                                  placeholder="First Name"
                                  value={name.firstName}
                                  onChange={(e) => updateName(domainIndex, nameIndex, 'firstName', e.target.value)}
                                  className="h-9 bg-[#080808] border-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-teal-500 text-sm"
                                />
                                <Input
                                  placeholder="Last Name"
                                  value={name.lastName}
                                  onChange={(e) => updateName(domainIndex, nameIndex, 'lastName', e.target.value)}
                                  className="h-9 bg-[#080808] border-[#1a1a1a] text-white placeholder:text-gray-600 focus:border-teal-500 text-sm"
                                />
                                {entry.names.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeName(domainIndex, nameIndex)}
                                    className="h-9 w-9 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
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
                ) : (
                  /* Bulk CSV Upload */
                  <div className="space-y-4">
                    <div className="rounded-xl bg-[#0a0a0a] border-2 border-dashed border-[#1a1a1a] p-8 text-center hover:border-teal-500/40 transition-colors">
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
                          <div className="w-14 h-14 bg-[#111111] rounded-xl flex items-center justify-center mx-auto mb-4">
                            <FileSpreadsheet className="w-7 h-7 text-gray-500" />
                          </div>
                          <p className="text-white font-medium mb-1">Drop your CSV file here</p>
                          <p className="text-gray-500 text-sm mb-4">or click to browse</p>
                          <div className="inline-block p-3 bg-[#080808] rounded-lg border border-[#1a1a1a]">
                            <code className="text-gray-500 text-xs font-mono">
                              domain, forwarding, firstname1, lastname1, ...
                            </code>
                          </div>
                        </label>
                      ) : (
                        <div>
                          <div className="w-14 h-14 bg-emerald-500/15 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
                          </div>
                          <p className="text-white font-medium">{csvFileName}</p>
                          <p className="text-emerald-400 text-sm mt-1">{csvData.length} domains loaded</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearCsv}
                            className="mt-4 border-[#2a2a2a] text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove File
                          </Button>
                        </div>
                      )}
                    </div>

                    {csvData && csvData.length > 0 && (
                      <div className="rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] p-4 max-h-48 overflow-y-auto">
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Preview</p>
                        <div className="space-y-2">
                          {csvData.slice(0, 5).map((entry, i) => (
                            <div key={i} className="text-sm py-2 px-3 bg-[#080808] rounded-lg flex items-center gap-2">
                              <Globe className="w-4 h-4 text-teal-400 flex-shrink-0" />
                              <span className="text-teal-300 font-medium">{entry.domain}</span>
                              <span className="text-gray-700">→</span>
                              <span className="text-gray-500 truncate">{entry.forwardingUrl || 'No forwarding'}</span>
                            </div>
                          ))}
                        </div>
                        {csvData.length > 5 && (
                          <p className="text-gray-500 text-xs mt-3 text-center">+ {csvData.length - 5} more domains</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Order Summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
                <h3 className="text-sm font-semibold text-white">Order Summary</h3>
              </div>
              <div className="pl-10">
                <div className="rounded-xl bg-gradient-to-r from-teal-500/10 to-[#0a0a0a] border border-teal-500/20 p-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-400">
                        {orderMode === 'bulk' && csvData ? csvData.length : domainEntries.length} domain{(orderMode === 'bulk' && csvData ? csvData.length : domainEntries.length) > 1 ? 's' : ''} × ${pricePerDomain}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Full infrastructure included</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total</p>
                      <span className="text-3xl font-bold text-white">${totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 text-xs font-bold">!</span>
                </div>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* CTA Button */}
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-black text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="pt-6 border-t border-[#1a1a1a]">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4 text-center">What's Included</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-gray-400 text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 mt-10">
          {[
            { icon: Shield, text: 'Secure Stripe Payment' },
            { icon: Clock, text: '48-Hour Setup' },
            { icon: Users, text: '24/7 Support' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-gray-500">
              <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#1a1a1a] flex items-center justify-center">
                <item.icon className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a]">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-500">DELIVERON</span>
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} DeliverOn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
