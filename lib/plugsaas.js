/**
 * PlugSaaS API Client
 * Base URL: https://cloud-api.plugsaas.com
 * Customer ID: 68b9e6fc203a7d59914a42d6
 */

const PLUGSAAS_BASE_URL = process.env.PLUGSAAS_BASE_URL || 'https://cloud-api.plugsaas.com';
const PLUGSAAS_CUSTOMER_ID = process.env.PLUGSAAS_CUSTOMER_ID || '68b9e6fc203a7d59914a42d6';
const PLUGSAAS_API_KEY = process.env.PLUGSAAS_API_KEY || '';

class PlugSaaSClient {
  constructor() {
    this.baseUrl = PLUGSAAS_BASE_URL;
    this.customerId = PLUGSAAS_CUSTOMER_ID;
    this.apiKey = PLUGSAAS_API_KEY;
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add API key if available
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const options = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `API Error: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error(`PlugSaaS API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== Order Management ====================

  /**
   * Add a new order
   * POST /api/v1/simple/customers/{customer_id}/orders/add/
   */
  async addOrder(orderData) {
    return this.request(
      'POST',
      `/api/v1/simple/customers/${this.customerId}/orders/add/`,
      orderData
    );
  }

  /**
   * List all orders
   * GET /api/v1/simple/customers/{customer_id}/orders/
   */
  async listOrders() {
    return this.request(
      'GET',
      `/api/v1/simple/customers/${this.customerId}/orders/`
    );
  }

  /**
   * Get order status
   * GET /api/v1/simple/customers/{customer_id}/orders/{order_id}/status/
   */
  async getOrderStatus(orderId) {
    return this.request(
      'GET',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/status/`
    );
  }

  /**
   * Setup order
   * POST /api/v1/simple/customers/{customer_id}/orders/{order_id}/setup/
   */
  async setupOrder(orderId, setupData) {
    return this.request(
      'POST',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/setup/`,
      setupData
    );
  }

  /**
   * Onboard order
   * POST /api/v1/simple/customers/{customer_id}/orders/{order_id}/onboard/
   */
  async onboardOrder(orderId, onboardData) {
    return this.request(
      'POST',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/onboard/`,
      onboardData
    );
  }

  /**
   * Remove order
   * POST /api/v1/simple/customers/{customer_id}/orders/{order_id}/remove/
   */
  async removeOrder(orderId) {
    return this.request(
      'POST',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/remove/`
    );
  }

  // ==================== Nameserver Management ====================

  /**
   * Get nameservers for an order
   * GET /api/v1/simple/customers/{customer_id}/orders/{order_id}/nameservers/
   */
  async getNameservers(orderId) {
    return this.request(
      'GET',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/nameservers/`
    );
  }

  /**
   * Set master domain
   * POST /api/v1/simple/customers/{customer_id}/orders/{order_id}/set-master-domain/
   */
  async setMasterDomain(orderId, domainData) {
    return this.request(
      'POST',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/set-master-domain/`,
      domainData
    );
  }

  // ==================== Domain Management ====================

  /**
   * Switch domain
   * POST /api/v1/simple/customers/{customer_id}/orders/{order_id}/switch-domain/
   */
  async switchDomain(orderId, domainData) {
    return this.request(
      'POST',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/switch-domain/`,
      domainData
    );
  }

  // ==================== Inbox Provider Management ====================

  /**
   * Add inbox provider to order
   * POST /api/v1/simple/customers/{customer_id}/orders/{order_id}/inbox-providers/add/
   */
  async addInboxProvider(orderId, providerData) {
    return this.request(
      'POST',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/inbox-providers/add/`,
      providerData
    );
  }

  /**
   * List inbox providers for order
   * GET /api/v1/simple/customers/{customer_id}/orders/{order_id}/inbox-providers/get/
   */
  async listInboxProviders(orderId) {
    return this.request(
      'GET',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/inbox-providers/get/`
    );
  }

  /**
   * Update inbox provider
   * PUT /api/v1/simple/customers/{customer_id}/orders/{order_id}/inbox-providers/update/
   */
  async updateInboxProvider(orderId, providerData) {
    return this.request(
      'PUT',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/inbox-providers/update/`,
      providerData
    );
  }

  /**
   * Remove inbox provider
   * DELETE /api/v1/simple/customers/{customer_id}/orders/{order_id}/inbox-providers/remove/
   */
  async removeInboxProvider(orderId, providerData) {
    return this.request(
      'DELETE',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/inbox-providers/remove/`,
      providerData
    );
  }

  /**
   * Get inbox provider upload status
   * GET /api/v1/simple/customers/{customer_id}/orders/{order_id}/inbox-provider-status/
   */
  async getInboxProviderStatus(orderId) {
    return this.request(
      'GET',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/inbox-provider-status/`
    );
  }

  /**
   * Trigger inbox provider re-upload
   * PATCH /api/v1/simple/customers/{customer_id}/orders/{order_id}/trigger-reupload/
   */
  async triggerReupload(orderId) {
    return this.request(
      'PATCH',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/trigger-reupload/`
    );
  }

  // ==================== Troubleshooting ====================

  /**
   * Resolve bad password
   * PATCH /api/v1/simple/customers/{customer_id}/orders/{order_id}/change-bad-pass/
   */
  async resolveBadPassword(orderId, passwordData) {
    return this.request(
      'PATCH',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/change-bad-pass/`,
      passwordData
    );
  }

  /**
   * Resolve used tenant
   * POST /api/v1/simple/customers/{customer_id}/orders/{order_id}/resolve-used-tenant/
   */
  async resolveUsedTenant(orderId) {
    return this.request(
      'POST',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/resolve-used-tenant/`
    );
  }

  /**
   * Resolve inbox provider tag
   * POST /api/v1/simple/customers/{customer_id}/orders/{order_id}/resolve-inbox-provider-tag/
   */
  async resolveInboxProviderTag(orderId, tagData) {
    return this.request(
      'POST',
      `/api/v1/simple/customers/${this.customerId}/orders/${orderId}/resolve-inbox-provider-tag/`,
      tagData
    );
  }

  // ==================== Bulk Operations ====================

  /**
   * Bulk get order mailboxes
   * POST /api/v1/simple/customers/{customer_id}/orders/bulk-mailboxes/
   */
  async bulkGetMailboxes(orderIds) {
    return this.request(
      'POST',
      `/api/v1/simple/customers/${this.customerId}/orders/bulk-mailboxes/`,
      { order_ids: orderIds }
    );
  }

  /**
   * Get ready orders
   * GET /api/v1/simple/customers/{customer_id}/orders/ready/
   */
  async getReadyOrders() {
    return this.request(
      'GET',
      `/api/v1/simple/customers/${this.customerId}/orders/ready/`
    );
  }

  /**
   * Magic search orders
   * GET /api/v1/simple/customers/{customer_id}/orders/magic-search/
   */
  async magicSearchOrders(query) {
    return this.request(
      'GET',
      `/api/v1/simple/customers/${this.customerId}/orders/magic-search/?q=${encodeURIComponent(query)}`
    );
  }

  /**
   * Get order provider stats
   * GET /api/v1/simple/customers/{customer_id}/orders/provider-stats/
   */
  async getProviderStats() {
    return this.request(
      'GET',
      `/api/v1/simple/customers/${this.customerId}/orders/provider-stats/`
    );
  }
}

// Export singleton instance
export const plugsaas = new PlugSaaSClient();

// Export class for testing
export { PlugSaaSClient };
