import axios from 'axios';
import ShippingProvider from './shipping.provider.js';
import delhiveryConfig from '../config/delhivery.config.js';

class DelhiveryProvider extends ShippingProvider {
  constructor() {
    super();
    this.baseUrl = delhiveryConfig.baseUrl;
    this.token = delhiveryConfig.apiToken;
  }

  getHeaders() {
    if (!this.token || this.token === 'YOUR_MAXGLOW_DELHIVERY_TOKEN') {
      throw new Error('Delhivery API token is missing or set to placeholder in configuration.');
    }
    return {
      'Authorization': `Token ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Create a shipment in Delhivery
   * @param {Object} payload Data formatted specifically for Delhivery
   */
  async createShipment(payload) {
    try {
      if (!this.token || this.token === 'YOUR_MAXGLOW_DELHIVERY_TOKEN') {
        throw new Error('Delhivery API token is missing or set to placeholder in configuration.');
      }
      const params = new URLSearchParams();
      params.append('format', 'json');
      params.append('data', JSON.stringify(payload));

      const response = await axios.post(`${this.baseUrl}/api/cmu/create.json`, params.toString(), {
        headers: {
          'Authorization': `Token ${this.token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.success && response.data.packages?.[0]?.waybill) {
        return {
          success: true,
          waybill: response.data.packages[0].waybill,
          raw: response.data
        };
      } else {
        const pkg = response.data?.packages?.[0];
        let errorMsg = response.data?.error || response.data?.rmk;
        if (pkg?.remarks && Array.isArray(pkg.remarks) && pkg.remarks.length > 0) {
          errorMsg = pkg.remarks.join(' | ');
        }
        if (!errorMsg && pkg?.status === 'Fail') {
          errorMsg = 'Delhivery rejected package manifest.';
        }
        throw new Error(errorMsg || 'Failed to create Delhivery shipment');
      }
    } catch (error) {
      console.error('DelhiveryProvider - createShipment Error:', error.response?.data || error.message);
      const backendErr = error.response?.data;
      let detailedMsg = error.message;
      if (backendErr?.packages?.[0]?.remarks?.length) {
        detailedMsg = backendErr.packages[0].remarks.join(' | ');
      } else if (backendErr?.error) {
        detailedMsg = backendErr.error;
      } else if (backendErr?.rmk) {
        detailedMsg = backendErr.rmk;
      }
      throw new Error(detailedMsg);
    }
  }

  /**
   * Track a shipment by Waybill
   * @param {String} waybill
   */
  async trackShipment(waybill) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v1/packages/json/?waybill=${waybill}`, {
        headers: this.getHeaders(),
        timeout: 8000
      });
      return response.data;
    } catch (error) {
      console.error('DelhiveryProvider - trackShipment Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  /**
   * Cancel a shipment
   * @param {String} waybill
   */
  async cancelShipment(waybill) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/p/edit`, {
        waybill: waybill,
        cancellation: true
      }, {
        headers: this.getHeaders(),
        timeout: 8000
      });

      return {
        success: true,
        raw: response.data
      };
    } catch (error) {
      console.error('DelhiveryProvider - cancelShipment Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  /**
   * Generate Shipping Label
   * @param {String} waybill
   */
  async generateLabel(waybill) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/p/packing_slip?wbns=${waybill}`, {
        headers: this.getHeaders(),
        timeout: 10000
      });
      
      const pkg = response.data?.packages?.[0];
      const labelUrl = pkg?.pdf_download_link || pkg?.html_link;
      
      return {
        success: !!labelUrl,
        labelUrl: labelUrl,
        raw: response.data
      };
    } catch (error) {
      console.error('DelhiveryProvider - generateLabel Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  /**
   * Generate Manifest
   * @param {String} waybill
   */
  async generateManifest(waybill) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/p/pack/update/`, {
        waybills: waybill
      }, {
        headers: this.getHeaders(),
        timeout: 10000
      });
      
      return {
        success: true,
        raw: response.data
      };
    } catch (error) {
      console.error('DelhiveryProvider - generateManifest Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  /**
   * Check Pincode Serviceability
   * @param {String} pincode
   */
  async checkServiceability(pincode) {
    try {
      const response = await axios.get(`${this.baseUrl}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
        headers: this.getHeaders(),
        timeout: 5000
      });
      // Delhivery returns an array of pincodes if serviceable
      return response.data && response.data.delivery_codes && response.data.delivery_codes.length > 0;
    } catch (error) {
      console.error('DelhiveryProvider - checkServiceability Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  /**
   * Create or Register a Warehouse / Pickup Location in Delhivery
   * @param {Object} warehouse 
   */
  async createWarehouse(warehouse) {
    try {
      const payload = {
        name: warehouse.delhiveryPickupLocationName || warehouse.name,
        registered_name: warehouse.name || 'MS JAINSONS HERBO B2C',
        phone: warehouse.contactPhone,
        email: warehouse.email || '',
        address: warehouse.address,
        city: warehouse.city,
        pin: warehouse.pincode,
        country: 'India',
        contact_person: warehouse.contactPersonName || warehouse.name,
        return_address: warehouse.returnSameAsPickup ? warehouse.address : (warehouse.returnAddressLine || warehouse.address),
        return_city: warehouse.returnSameAsPickup ? warehouse.city : (warehouse.returnCity || warehouse.city),
        return_state: warehouse.returnSameAsPickup ? warehouse.state : (warehouse.returnState || warehouse.state),
        return_pin: warehouse.returnSameAsPickup ? warehouse.pincode : (warehouse.returnPincode || warehouse.pincode),
        return_country: 'India'
      };

      const response = await axios.post(`${this.baseUrl}/api/backend/clientwarehouse/create.json`, payload, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('DelhiveryProvider - createWarehouse Error:', error.response?.data || error.message);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message;
      return {
        success: false,
        error: msg
      };
    }
  }

  /**
   * Update Warehouse in Delhivery
   * @param {Object} warehouse 
   */
  async updateWarehouse(warehouse) {
    try {
      const payload = {
        name: warehouse.delhiveryPickupLocationName || warehouse.name,
        registered_name: warehouse.name || 'MS JAINSONS HERBO B2C',
        phone: warehouse.contactPhone,
        email: warehouse.email || '',
        address: warehouse.address,
        city: warehouse.city,
        pin: warehouse.pincode,
        country: 'India',
        contact_person: warehouse.contactPersonName || warehouse.name,
        return_address: warehouse.returnSameAsPickup ? warehouse.address : (warehouse.returnAddressLine || warehouse.address),
        return_city: warehouse.returnSameAsPickup ? warehouse.city : (warehouse.returnCity || warehouse.city),
        return_state: warehouse.returnSameAsPickup ? warehouse.state : (warehouse.returnState || warehouse.state),
        return_pin: warehouse.returnSameAsPickup ? warehouse.pincode : (warehouse.returnPincode || warehouse.pincode),
        return_country: 'India',
        active: warehouse.isActive !== undefined ? warehouse.isActive : true
      };

      const response = await axios.post(`${this.baseUrl}/api/backend/clientwarehouse/edit.json`, payload, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('DelhiveryProvider - updateWarehouse Error:', error.response?.data || error.message);
      const msg = error.response?.data?.message || error.response?.data?.error || error.message;
      return {
        success: false,
        error: msg
      };
    }
  }
}

export default new DelhiveryProvider();
