'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Trash2,
  Globe,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function OrderPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderMode, setOrderMode] = useState('single');
  const fileInputRef = useRef(null);
  const revealRefs = useRef([]);

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
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      setEmail(session.user.email);
      setAuthLoading(false);
    };
    checkSession();
  }, [router]);

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

  useEffect(() => {
    if (authLoading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [authLoading]);

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
          user_id: user?.id || null,
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
    '24/7 WhatsApp support',
  ];

  const domainCount = orderMode === 'bulk' && csvData ? csvData.length : domainEntries.length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(33,122,255,0.1)] border border-[rgba(33,122,255,0.15)] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#217aff]/30 border-t-[#217aff] rounded-full animate-spin" />
          </div>
          <p className="font-body text-sm font-medium text-[#727272]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202]">
      {/* Header — fixed, frosted glass */}
      <header className="fixed top-0 left-0 right-0 h-[72px] z-50 do-header-glass border-b border-[#363636]">
        <div className="flex items-center justify-between h-full max-w-[1200px] mx-auto px-6">
          <Link href="/order" aria-label="DeliverOn home">
            <img src="https://framerusercontent.com/images/4xMhy82Xz334ZgDkWW9tGUV0iI.png?scale-down-to=512" alt="DeliverOn logo" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.75rem] text-[#969696] hidden sm:inline">{user?.email}</span>
            <Link href="/dashboard" className="do-btn do-btn--secondary do-btn--small">Dashboard</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[calc(72px+3rem)] max-w-[1200px] mx-auto px-6 pb-16">

        {/* Hero */}
        <div ref={(el) => (revealRefs.current[0] = el)} className="do-reveal text-center mb-12">
          <h1 className="font-heading text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.03em] text-[#f2f2f2] mb-4">
            Cold Email Infrastructure Built for Scale
          </h1>
          <p className="font-body text-[clamp(0.875rem,1.5vw,1.125rem)] text-[#969696] max-w-[600px] mx-auto leading-[1.7]">
            Dedicated Microsoft inboxes with full DNS authentication. 100 inboxes per domain, warmed and ready to send.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { value: '100', label: 'Inboxes/Domain' },
            { value: '15K', label: 'Monthly Emails' },
            { value: '48h', label: 'Setup Time' },
            { value: '24/7', label: 'Support' },
          ].map((stat, i) => (
            <div
              key={i}
              ref={(el) => (revealRefs.current[i + 1] = el)}
              className={`do-reveal do-reveal-delay-${i + 1} bg-[#020202] border border-[#363636] rounded-xl p-6 text-center shadow-glow-blue transition-all hover:border-[rgba(33,122,255,0.3)] hover:-translate-y-0.5`}
            >
              <div className="font-mono text-2xl font-semibold text-[#217aff] mb-1">{stat.value}</div>
              <div className="font-body text-[0.75rem] text-[#969696]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Two-Column Grid: Form + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* LEFT: Order Form Card */}
          <div ref={(el) => (revealRefs.current[5] = el)} className="do-reveal bg-[#020202] border border-[#363636] rounded-[20px] p-8 lg:p-12 shadow-glow-white">
            <h2 className="font-heading text-[1.25rem] font-bold tracking-[-0.03em] text-[#f2f2f2] mb-2">Configure Your Order</h2>
            <p className="font-body text-[0.8125rem] text-[#969696] mb-8">
              <strong className="text-[#217aff] font-semibold">${pricePerDomain}</strong> per domain, full infrastructure included
            </p>

            {/* Tabs */}
            <div className="do-tabs mb-8">
              <button className={`do-tab ${orderMode === 'single' ? 'active' : ''}`} onClick={() => setOrderMode('single')}>Manual Entry</button>
              <button className={`do-tab ${orderMode === 'bulk' ? 'active' : ''}`} onClick={() => setOrderMode('bulk')}>Bulk CSV</button>
            </div>

            {orderMode === 'single' ? (
              <>
                {/* Contact Information */}
                <div className="mb-8">
                  <h3 className="font-body text-[0.8125rem] font-semibold text-[#f2f2f2] uppercase tracking-[0.08em] mb-6 pb-3 border-b border-[#363636]">Contact Information</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block font-body text-[0.8125rem] font-medium text-[#969696] mb-2">Email Address <span className="text-[#217aff]">*</span></label>
                      <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="do-form-input" required />
                    </div>
                    <div>
                      <label className="block font-body text-[0.8125rem] font-medium text-[#969696] mb-2">Phone Number (optional)</label>
                      <input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="do-form-input" />
                    </div>
                  </div>
                </div>

                {/* Domain Configuration */}
                <div className="mb-8">
                  <h3 className="font-body text-[0.8125rem] font-semibold text-[#f2f2f2] uppercase tracking-[0.08em] mb-6 pb-3 border-b border-[#363636]">Domain Configuration</h3>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-[0.8125rem] font-medium text-[#969696]">{domainEntries.length} domain{domainEntries.length > 1 ? 's' : ''}</span>
                    <button onClick={addDomainEntry} className="do-btn do-btn--secondary do-btn--small">
                      <span className="material-symbols-outlined text-base">add</span>
                      Add Domain
                    </button>
                  </div>

                  <div className="space-y-4">
                    {domainEntries.map((entry, domainIndex) => (
                      <div key={domainIndex} className="bg-[#020202] border border-[#363636] rounded-xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="font-body text-[0.875rem] font-semibold text-[#f2f2f2]">Domain {domainIndex + 1}</span>
                          {domainEntries.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeDomainEntry(domainIndex)} className="h-8 w-8 p-0 text-[#727272] hover:text-[#ff4d4d] hover:bg-[rgba(255,77,77,0.1)]">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div>
                          <label className="block font-body text-[0.8125rem] font-medium text-[#969696] mb-2">Domain Name <span className="text-[#217aff]">*</span></label>
                          <input placeholder="yourdomain.com" value={entry.domain} onChange={(e) => updateDomainEntry(domainIndex, 'domain', e.target.value)} className="do-form-input" required />
                        </div>
                        <div>
                          <label className="block font-body text-[0.8125rem] font-medium text-[#969696] mb-2">Forwarding URL <span className="text-[#217aff]">*</span></label>
                          <input type="url" placeholder="https://yoursite.com" value={entry.forwardingUrl} onChange={(e) => updateDomainEntry(domainIndex, 'forwardingUrl', e.target.value)} className="do-form-input" required />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="font-body text-[0.8125rem] font-medium text-[#969696]">Inbox Names (1-3 required)</label>
                            {entry.names.length < 3 && (
                              <button onClick={() => addName(domainIndex)} className="do-btn do-btn--secondary do-btn--small">
                                <span className="material-symbols-outlined text-base">add</span>
                                Add Name
                              </button>
                            )}
                          </div>
                          <div className="space-y-2">
                            {entry.names.map((name, nameIndex) => (
                              <div key={nameIndex} className="flex gap-3 items-center">
                                <input placeholder="First Name" value={name.firstName} onChange={(e) => updateName(domainIndex, nameIndex, 'firstName', e.target.value)} className="do-form-input" />
                                <input placeholder="Last Name" value={name.lastName} onChange={(e) => updateName(domainIndex, nameIndex, 'lastName', e.target.value)} className="do-form-input" />
                                {entry.names.length > 1 && (
                                  <Button variant="ghost" size="sm" onClick={() => removeName(domainIndex, nameIndex)} className="h-[44px] w-[44px] p-0 text-[#727272] hover:text-[#ff4d4d] hover:bg-[rgba(255,77,77,0.1)] flex-shrink-0">
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
              <div className="mb-8">
                <h3 className="font-body text-[0.8125rem] font-semibold text-[#f2f2f2] uppercase tracking-[0.08em] mb-6 pb-3 border-b border-[#363636]">Upload CSV</h3>

                {/* Contact info for bulk too */}
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="block font-body text-[0.8125rem] font-medium text-[#969696] mb-2">Email Address <span className="text-[#217aff]">*</span></label>
                    <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="do-form-input" required />
                  </div>
                </div>

                <div className="border-2 border-dashed border-[#363636] rounded-xl p-12 text-center transition-colors hover:border-[#217aff]">
                  <input type="file" accept=".csv" onChange={handleCsvUpload} ref={fileInputRef} className="hidden" id="csv-upload" />
                  {!csvData ? (
                    <label htmlFor="csv-upload" className="cursor-pointer block">
                      <div className="w-14 h-14 bg-[rgba(33,122,255,0.1)] border border-[rgba(33,122,255,0.15)] rounded-[14px] flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-filled text-2xl text-[#217aff]">upload_file</span>
                      </div>
                      <p className="font-body text-[0.9375rem] font-semibold text-[#f2f2f2] mb-2">Drag and drop your CSV file here</p>
                      <p className="font-mono text-[0.75rem] text-[#727272]">or click to browse. Required columns: domain, forwarding_url, inbox_names</p>
                      <button className="do-btn do-btn--secondary do-btn--small mt-4">
                        <span className="material-symbols-outlined text-base">folder_open</span>
                        Browse Files
                      </button>
                    </label>
                  ) : (
                    <div>
                      <div className="w-14 h-14 bg-[rgba(52,211,153,0.15)] rounded-xl flex items-center justify-center mx-auto mb-4">
                        <FileSpreadsheet className="w-7 h-7 text-[#34d399]" />
                      </div>
                      <p className="font-body font-medium text-[#f2f2f2]">{csvFileName}</p>
                      <p className="text-[#34d399] text-sm mt-1 font-mono">{csvData.length} domains loaded</p>
                      <Button variant="outline" size="sm" onClick={clearCsv} className="mt-4 border-[#363636] text-[#727272] hover:text-[#ff4d4d] hover:border-[rgba(255,77,77,0.3)] hover:bg-[rgba(255,77,77,0.1)]">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove File
                      </Button>
                    </div>
                  )}
                </div>

                {csvData && csvData.length > 0 && (
                  <div className="rounded-xl bg-[#020202] border border-[#363636] p-4 max-h-48 overflow-y-auto mt-4">
                    <p className="font-body text-[#969696] text-xs font-semibold uppercase tracking-wider mb-3">Preview</p>
                    <div className="space-y-2">
                      {csvData.slice(0, 5).map((entry, i) => (
                        <div key={i} className="text-sm py-2 px-3 bg-[#161616] rounded-lg flex items-center gap-2 border border-[#363636]">
                          <Globe className="w-4 h-4 text-[#217aff] flex-shrink-0" />
                          <span className="text-[#217aff] font-mono font-medium">{entry.domain}</span>
                          <span className="text-[#363636]">→</span>
                          <span className="text-[#727272] truncate font-mono">{entry.forwardingUrl || 'No forwarding'}</span>
                        </div>
                      ))}
                    </div>
                    {csvData.length > 5 && (
                      <p className="text-[#727272] text-xs mt-3 text-center font-mono">+ {csvData.length - 5} more domains</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Sticky Sidebar */}
          <div className="lg:sticky lg:top-[calc(72px+2rem)]">
            {/* Order Summary */}
            <div ref={(el) => (revealRefs.current[6] = el)} className="do-reveal do-reveal-delay-1 bg-[#020202] border border-[#363636] rounded-[20px] p-8 shadow-glow-blue mb-6">
              <h3 className="font-heading text-[1.125rem] font-bold tracking-[-0.03em] text-[#f2f2f2] mb-6 pb-3 border-b border-[#363636]">Order Summary</h3>
              <div className="flex items-center justify-between py-3 font-body text-[0.875rem] text-[#969696]">
                <span>{domainCount} domain{domainCount > 1 ? 's' : ''} × ${pricePerDomain}</span>
              </div>
              <div className="flex items-center justify-between py-3 font-body text-[0.875rem] text-[#969696]">
                <span>Full infrastructure included</span>
              </div>
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#363636] font-body text-[#f2f2f2] font-semibold">
                <span>Total</span>
                <span className="font-mono text-[1.25rem] font-semibold text-[#217aff]">${totalPrice}</span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-[rgba(255,77,77,0.1)] border border-[rgba(255,77,77,0.2)] p-3 mt-4 flex items-center gap-2">
                  <span className="text-[#ff4d4d] text-xs font-bold">!</span>
                  <p className="text-[#ff4d4d] text-sm font-body">{error}</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="do-btn do-btn--primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    Continue to Payment
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>
            </div>

            {/* What's Included */}
            <div ref={(el) => (revealRefs.current[7] = el)} className="do-reveal do-reveal-delay-2 bg-[#020202] border border-[#363636] rounded-[20px] p-8 shadow-glow-white">
              <h3 className="font-heading text-[1rem] font-bold tracking-[-0.03em] text-[#f2f2f2] mb-6">What&apos;s Included</h3>
              {features.map((text, i) => (
                <div key={i} className="flex items-center gap-3 py-2 font-body text-[0.8125rem] text-[#969696]">
                  <span className="material-symbols-filled text-[1.25rem] text-[#217aff]">check_circle</span>
                  {text}
                </div>
              ))}
              <div className="flex items-center gap-3 py-2 font-body text-[0.8125rem] text-[#969696]">
                <span className="material-symbols-filled text-[1.25rem] text-[#217aff]">lock</span>
                Secure Stripe Payment
              </div>
              <div className="flex items-center gap-3 py-2 font-body text-[0.8125rem] text-[#969696]">
                <span className="material-symbols-filled text-[1.25rem] text-[#217aff]">schedule</span>
                48-Hour Setup
              </div>
              <div className="flex items-center gap-3 py-2 font-body text-[0.8125rem] text-[#969696]">
                <span className="material-symbols-filled text-[1.25rem] text-[#217aff]">support_agent</span>
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#363636] py-6 mt-16">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <p className="text-[0.75rem] text-[#727272]">© {new Date().getFullYear()} DeliverOn. All rights reserved.</p>
          <Link href="/order" aria-label="DeliverOn home">
            <img src="https://framerusercontent.com/images/4xMhy82Xz334ZgDkWW9tGUV0iI.png?scale-down-to=512" alt="DeliverOn logo" className="h-[26px] w-auto" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
