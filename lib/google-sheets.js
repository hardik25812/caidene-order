/**
 * Google Sheets Inventory Management
 * Manages Microsoft 365 account inventory stored in Google Sheets
 * 
 * Sheet Structure:
 * - Column A: Microsoft Account Email
 * - Column B: Microsoft Account Password
 * - Column C: Status (Available/Assigned/Depleted)
 * - Column D: Date Added
 * - Column E: Order ID (assigned when used)
 * - Column F: Customer Name (assigned when used)
 * - Column G: Domain (assigned when used)
 * - Column H: Assigned Date
 */

const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID || '';
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';

// Low inventory threshold - send alert when below this number
const LOW_INVENTORY_THRESHOLD = parseInt(process.env.LOW_INVENTORY_THRESHOLD || '10');

class GoogleSheetsInventory {
  constructor() {
    this.sheetsId = GOOGLE_SHEETS_ID;EGEG
    this.sheetName = process.env.GOOGLE_SHEET_NAME || 'Inventory';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth2 access token using service account
   */
  async getAccessToken() {
    // Check if we have a valid cached token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      throw new Error('Google service account credentials not configured');
    }

    // Create JWT for service account authentication
    const jwt = await this.createJWT();
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to get access token: ${data.error_description || data.error}`);
    }

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Refresh 1 min before expiry
    
    return this.accessToken;
  }

  /**
   * Create JWT for Google OAuth2
   */
  async createJWT() {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    // Base64url encode
    const base64UrlEncode = (obj) => {
      const json = JSON.stringify(obj);
      const base64 = Buffer.from(json).toString('base64');
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    const headerEncoded = base64UrlEncode(header);
    const payloadEncoded = base64UrlEncode(payload);
    const signatureInput = `${headerEncoded}.${payloadEncoded}`;

    // Sign with private key
    const crypto = await import('crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(GOOGLE_PRIVATE_KEY, 'base64');
    const signatureEncoded = signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return `${signatureInput}.${signatureEncoded}`;
  }

  /**
   * Make authenticated request to Google Sheets API
   */
  async request(method, endpoint, data = null) {
    const token = await this.getAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetsId}${endpoint}`;

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error?.message || `Sheets API Error: ${response.status}`);
    }

    return responseData;
  }

  /**
   * Get all inventory data
   */
  async getAllInventory() {
    const range = `${this.sheetName}!A:H`;
    const data = await this.request('GET', `/values/${encodeURIComponent(range)}`);
    
    if (!data.values || data.values.length <= 1) {
      return [];
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    return rows.map((row, index) => ({
      rowIndex: index + 2, // 1-indexed, skip header
      email: row[0] || '',
      password: row[1] || '',
      status: row[2] || 'Available',
      dateAdded: row[3] || '',
      orderId: row[4] || '',
      customerName: row[5] || '',
      domain: row[6] || '',
      assignedDate: row[7] || '',
    }));
  }

  /**
   * Get available accounts (not yet assigned)
   */
  async getAvailableAccounts(count = 1) {
    const inventory = await this.getAllInventory();
    const available = inventory.filter(item => 
      item.status === 'Available' && item.email && item.password
    );

    return available.slice(0, count);
  }

  /**
   * Get available account count
   */
  async getAvailableCount() {
    const inventory = await this.getAllInventory();
    return inventory.filter(item => item.status === 'Available').length;
  }

  /**
   * Check if inventory is low
   */
  async isInventoryLow() {
    const count = await this.getAvailableCount();
    return {
      isLow: count < LOW_INVENTORY_THRESHOLD,
      count,
      threshold: LOW_INVENTORY_THRESHOLD,
    };
  }

  /**
   * Mark accounts as assigned to an order
   */
  async assignAccounts(accounts, orderId, customerName, domain) {
    const updates = [];
    const now = new Date().toISOString();

    for (const account of accounts) {
      const range = `${this.sheetName}!C${account.rowIndex}:H${account.rowIndex}`;
      updates.push({
        range,
        values: [['Assigned', account.dateAdded, orderId, customerName, domain, now]],
      });
    }

    if (updates.length === 0) return;

    await this.request('POST', '/values:batchUpdate', {
      valueInputOption: 'RAW',
      data: updates,
    });

    return accounts;
  }

  /**
   * Reserve accounts (mark as pending before final assignment)
   */
  async reserveAccounts(accounts, orderId) {
    const updates = [];

    for (const account of accounts) {
      const range = `${this.sheetName}!C${account.rowIndex}:E${account.rowIndex}`;
      updates.push({
        range,
        values: [['Reserved', account.dateAdded, orderId]],
      });
    }

    if (updates.length === 0) return;

    await this.request('POST', '/values:batchUpdate', {
      valueInputOption: 'RAW',
      data: updates,
    });

    return accounts;
  }

  /**
   * Release reserved accounts (if order fails)
   */
  async releaseAccounts(orderId) {
    const inventory = await this.getAllInventory();
    const reserved = inventory.filter(item => 
      item.status === 'Reserved' && item.orderId === orderId
    );

    const updates = [];

    for (const account of reserved) {
      const range = `${this.sheetName}!C${account.rowIndex}:H${account.rowIndex}`;
      updates.push({
        range,
        values: [['Available', account.dateAdded, '', '', '', '']],
      });
    }

    if (updates.length === 0) return;

    await this.request('POST', '/values:batchUpdate', {
      valueInputOption: 'RAW',
      data: updates,
    });
  }

  /**
   * Add new accounts to inventory
   */
  async addAccounts(accounts) {
    const now = new Date().toISOString().split('T')[0];
    const values = accounts.map(acc => [
      acc.email,
      acc.password,
      'Available',
      now,
      '',
      '',
      '',
      '',
    ]);

    const range = `${this.sheetName}!A:H`;
    await this.request('POST', `/values/${encodeURIComponent(range)}:append?valueInputOption=RAW`, {
      values,
    });

    return accounts.length;
  }

  /**
   * Get accounts assigned to a specific order
   */
  async getAccountsByOrder(orderId) {
    const inventory = await this.getAllInventory();
    return inventory.filter(item => item.orderId === orderId);
  }

  /**
   * Get inventory statistics
   */
  async getStats() {
    const inventory = await this.getAllInventory();
    
    const stats = {
      total: inventory.length,
      available: 0,
      assigned: 0,
      reserved: 0,
      depleted: 0,
    };

    for (const item of inventory) {
      switch (item.status) {
        case 'Available':
          stats.available++;
          break;
        case 'Assigned':
          stats.assigned++;
          break;
        case 'Reserved':
          stats.reserved++;
          break;
        case 'Depleted':
          stats.depleted++;
          break;
      }
    }

    stats.isLow = stats.available < LOW_INVENTORY_THRESHOLD;
    stats.threshold = LOW_INVENTORY_THRESHOLD;

    return stats;
  }
}

// Export singleton instance
export const sheetsInventory = new GoogleSheetsInventory();

// Export class for testing
export { GoogleSheetsInventory };
