'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, Loader2, TestTube } from 'lucide-react';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: 'test@example.com',
    phone: '+1234567890',
    domain: 'testdomain.com',
    forwardingUrl: 'https://example.com',
    firstName: 'John',
    lastName: 'Doe',
  });

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const testOrder = {
        email: formData.email,
        phone: formData.phone,
        domains: [
          {
            domain: formData.domain,
            forwardingUrl: formData.forwardingUrl,
            names: [
              {
                firstName: formData.firstName,
                lastName: formData.lastName,
              }
            ]
          }
        ]
      };

      const response = await fetch('/api/test/fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrder),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Test failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <TestTube className="w-8 h-8 text-purple-400" />
            Test Fulfillment (No Payment)
          </h1>
          <p className="text-zinc-400">
            Test the automated fulfillment flow without making a real payment
          </p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle>Test Order Details</CardTitle>
            <CardDescription>
              Fill in the details below to simulate an order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Domain</Label>
                <Input
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label>Forwarding URL</Label>
                <Input
                  value={formData.forwardingUrl}
                  onChange={(e) => setFormData({ ...formData, forwardingUrl: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            <Button
              onClick={runTest}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Run Test Fulfillment
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Success Result */}
        {result && (
          <Card className="bg-green-500/10 border-green-500/30 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                Test Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Order ID:</p>
                <code className="text-green-400 font-mono">{result.orderId}</code>
              </div>

              <div>
                <p className="text-sm text-zinc-400 mb-2">Fulfillment Results:</p>
                <div className="bg-zinc-900 rounded-lg p-4">
                  <pre className="text-xs text-zinc-300 overflow-x-auto">
                    {JSON.stringify(result.fulfillmentResults, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  View in Dashboard
                </Button>
                <Button
                  onClick={() => window.location.href = '/admin/inventory'}
                  variant="outline"
                  className="border-zinc-700"
                >
                  Check Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Result */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                Test Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-300">{error}</p>
              <p className="text-sm text-zinc-400 mt-4">
                Make sure you have:
              </p>
              <ul className="list-disc list-inside text-sm text-zinc-400 mt-2 space-y-1">
                <li>Run the inventory schema in Supabase</li>
                <li>Added Microsoft 365 accounts to inventory</li>
                <li>Configured PlugSaaS API key in .env</li>
                <li>Server is running (npm run dev)</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Setup Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300">
              <li>Run <code className="bg-zinc-800 px-2 py-1 rounded">supabase-inventory-schema.sql</code> in Supabase</li>
              <li>Add Microsoft 365 accounts via <a href="/admin/inventory" className="text-purple-400 hover:underline">/admin/inventory</a></li>
              <li>Configure <code className="bg-zinc-800 px-2 py-1 rounded">PLUGSAAS_API_KEY</code> in .env</li>
              <li>Click "Run Test Fulfillment" above</li>
              <li>Check results in Dashboard or Admin panel</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
