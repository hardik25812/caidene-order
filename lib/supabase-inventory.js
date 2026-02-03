/**
 * Supabase Inventory Management
 * Alternative to Google Sheets - uses Supabase database for Microsoft 365 account inventory
 * No service account or external API keys needed
 */

import { createServerClient } from './supabase';

class SupabaseInventory {
  constructor() {
    this.supabase = createServerClient();
    this.lowInventoryThreshold = parseInt(process.env.LOW_INVENTORY_THRESHOLD || '10');
  }

  /**
   * Get available Microsoft 365 accounts from inventory
   * @param {number} count - Number of accounts needed
   * @returns {Promise<Array>} Array of available accounts
   */
  async getAvailableAccounts(count = 1) {
    try {
      const { data, error } = await this.supabase
        .from('inventory')
        .select('*')
        .eq('status', 'available')
        .order('date_added', { ascending: true })
        .limit(count);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting available accounts:', error);
      throw new Error(`Failed to get available accounts: ${error.message}`);
    }
  }

  /**
   * Reserve accounts for an order (temporary hold)
   * @param {Array} accounts - Accounts to reserve
   * @param {string} orderId - Order ID
   * @returns {Promise<void>}
   */
  async reserveAccounts(accounts, orderId) {
    try {
      const emails = accounts.map(acc => acc.email);
      
      const { error } = await this.supabase
        .from('inventory')
        .update({
          status: 'reserved',
          order_id: orderId,
          reserved_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('email', emails);

      if (error) throw error;

      console.log(`Reserved ${accounts.length} accounts for order ${orderId}`);
    } catch (error) {
      console.error('Error reserving accounts:', error);
      throw new Error(`Failed to reserve accounts: ${error.message}`);
    }
  }

  /**
   * Assign accounts to customer (final assignment)
   * @param {Array} accounts - Accounts to assign
   * @param {string} orderId - Order ID
   * @param {string} customerEmail - Customer email
   * @param {string} domain - Domain name
   * @returns {Promise<void>}
   */
  async assignAccounts(accounts, orderId, customerEmail, domain) {
    try {
      const emails = accounts.map(acc => acc.email);
      
      const { error } = await this.supabase
        .from('inventory')
        .update({
          status: 'assigned',
          order_id: orderId,
          customer_email: customerEmail,
          domain: domain,
          assigned_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('email', emails);

      if (error) throw error;

      console.log(`Assigned ${accounts.length} accounts for order ${orderId}`);
    } catch (error) {
      console.error('Error assigning accounts:', error);
      throw new Error(`Failed to assign accounts: ${error.message}`);
    }
  }

  /**
   * Release reserved accounts (rollback on failure)
   * @param {string} orderId - Order ID
   * @returns {Promise<void>}
   */
  async releaseAccounts(orderId) {
    try {
      const { error } = await this.supabase
        .from('inventory')
        .update({
          status: 'available',
          order_id: null,
          reserved_date: null,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .eq('status', 'reserved');

      if (error) throw error;

      console.log(`Released reserved accounts for order ${orderId}`);
    } catch (error) {
      console.error('Error releasing accounts:', error);
      throw new Error(`Failed to release accounts: ${error.message}`);
    }
  }

  /**
   * Mark accounts as depleted (unusable)
   * @param {Array} emails - Account emails to mark as depleted
   * @returns {Promise<void>}
   */
  async markAccountsDepleted(emails) {
    try {
      const { error } = await this.supabase
        .from('inventory')
        .update({
          status: 'depleted',
          updated_at: new Date().toISOString(),
        })
        .in('email', emails);

      if (error) throw error;

      console.log(`Marked ${emails.length} accounts as depleted`);
    } catch (error) {
      console.error('Error marking accounts as depleted:', error);
      throw new Error(`Failed to mark accounts as depleted: ${error.message}`);
    }
  }

  /**
   * Check if inventory is low
   * @returns {Promise<Object>} { isLow, count, threshold }
   */
  async isInventoryLow() {
    try {
      const { count, error } = await this.supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      if (error) throw error;

      return {
        isLow: count < this.lowInventoryThreshold,
        count: count || 0,
        threshold: this.lowInventoryThreshold,
      };
    } catch (error) {
      console.error('Error checking inventory levels:', error);
      return {
        isLow: true,
        count: 0,
        threshold: this.lowInventoryThreshold,
      };
    }
  }

  /**
   * Get inventory statistics
   * @returns {Promise<Object>} Inventory stats
   */
  async getStats() {
    try {
      const { data, error } = await this.supabase
        .from('inventory')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data.length,
        available: data.filter(i => i.status === 'available').length,
        reserved: data.filter(i => i.status === 'reserved').length,
        assigned: data.filter(i => i.status === 'assigned').length,
        depleted: data.filter(i => i.status === 'depleted').length,
      };

      stats.isLow = stats.available < this.lowInventoryThreshold;
      stats.threshold = this.lowInventoryThreshold;

      return stats;
    } catch (error) {
      console.error('Error getting inventory stats:', error);
      return {
        total: 0,
        available: 0,
        reserved: 0,
        assigned: 0,
        depleted: 0,
        isLow: true,
        threshold: this.lowInventoryThreshold,
      };
    }
  }

  /**
   * Get all inventory (for admin view)
   * @param {number} limit - Max records to return
   * @returns {Promise<Array>} Inventory records
   */
  async getAllInventory(limit = 100) {
    try {
      const { data, error } = await this.supabase
        .from('inventory')
        .select('*')
        .order('date_added', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting all inventory:', error);
      return [];
    }
  }

  /**
   * Add new accounts to inventory
   * @param {Array} accounts - Array of {email, password, notes?}
   * @returns {Promise<number>} Number of accounts added
   */
  async addAccounts(accounts) {
    try {
      const records = accounts.map(acc => ({
        email: acc.email,
        password: acc.password,
        status: 'available',
        notes: acc.notes || null,
        date_added: new Date().toISOString(),
      }));

      const { data, error } = await this.supabase
        .from('inventory')
        .insert(records)
        .select();

      if (error) throw error;

      console.log(`Added ${data.length} accounts to inventory`);
      return data.length;
    } catch (error) {
      console.error('Error adding accounts:', error);
      throw new Error(`Failed to add accounts: ${error.message}`);
    }
  }
}

// Export singleton instance
export const supabaseInventory = new SupabaseInventory();
