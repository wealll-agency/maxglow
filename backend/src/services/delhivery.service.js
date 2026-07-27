import delhiveryProvider from '../providers/delhivery.provider.js';

class DelhiveryService {
  /**
   * Format order and create a shipment in Delhivery
   * @param {Object} order - The MaxGlow order document
   */
  async createShipment(order) {
    // 1. Map business logic (Order model) to Delhivery-specific payload
    const payload = {
      shipments: [
        {
          name: order.deliveryAddress.name,
          add: `${order.deliveryAddress.street || order.deliveryAddress.address}, ${order.deliveryAddress.locality}`,
          pin: order.deliveryAddress.zipCode || order.deliveryAddress.pincode,
          city: order.deliveryAddress.city,
          state: order.deliveryAddress.state,
          country: order.deliveryAddress.country || 'India',
          phone: order.deliveryAddress.phone || '9999999999',
          order: order._id.toString(),
          payment_mode: order.paymentMode === 'COD' ? 'COD' : 'Pre-paid',
          return_pin: '',
          return_city: '',
          return_phone: '',
          return_add: '',
          return_state: '',
          return_country: '',
          products_desc: order.items.map(item => `${item.name} (x${item.quantity})`).join(', '),
          hsn_code: '', // Default or optional
          cod_amount: order.paymentMode === 'COD' ? order.totalAmount.toString() : '0',
          order_date: new Date(order.createdAt).toISOString(),
          total_amount: order.totalAmount.toString(),
          seller_add: '',
          seller_name: 'MaxGlow Enterprises',
          seller_inv: '',
          quantity: order.items.reduce((acc, item) => acc + item.quantity, 0).toString(),
          tax_value: order.tax ? order.tax.toString() : '0',
          shipment_weight: (order.items.reduce((acc, item) => acc + ((item.product?.weight || 1000) * item.quantity), 0)).toString() // Grams
        }
      ],
      pickup_location: {
        name: order.warehouse.delhiveryPickupLocationName || order.warehouse.name,
        add: order.warehouse.address,
        city: order.warehouse.city,
        pin: order.warehouse.pincode,
        country: 'India',
        phone: order.warehouse.contactPhone
      }
    };

    // Note: If returnSameAsPickup is false, we ideally want to specify a different return address.
    // However, for this MVP implementation, we assume return is the same, or we rely on Delhivery defaults.
    if (order.warehouse.returnSameAsPickup) {
      payload.shipments[0].return_add = order.warehouse.address;
      payload.shipments[0].return_city = order.warehouse.city;
      payload.shipments[0].return_pin = order.warehouse.pincode;
      payload.shipments[0].return_state = order.warehouse.state;
      payload.shipments[0].return_country = 'India';
      payload.shipments[0].return_phone = order.warehouse.contactPhone;
    }

    // 2. Call the provider to execute API request
    const response = await delhiveryProvider.createShipment(payload);

    // 3. Return standardized result to the shipping orchestration service
    return {
      success: true,
      waybill: response.waybill,
      provider: 'delhivery',
      rawResponse: response.raw
    };
  }

  /**
   * Track a shipment by Waybill
   * @param {String} waybill
   */
  async trackShipment(waybill) {
    const rawTracking = await delhiveryProvider.trackShipment(waybill);
    return {
      success: true,
      tracking: rawTracking
    };
  }

  /**
   * Cancel a shipment
   * @param {String} waybill
   */
  async cancelShipment(waybill) {
    const response = await delhiveryProvider.cancelShipment(waybill);
    return {
      success: true,
      rawResponse: response.raw
    };
  }

  /**
   * Generate Label
   */
  async getLabel(waybill) {
    return await delhiveryProvider.generateLabel(waybill);
  }

  /**
   * Generate Manifest
   */
  async generateManifest(waybill) {
    return await delhiveryProvider.generateManifest(waybill);
  }

  /**
   * Generate Shipping Label (Packing Slip)
   * @param {String} waybill
   */
  async generateLabel(waybill) {
    const response = await delhiveryProvider.generateLabel(waybill);
    return {
      success: response.success,
      labelUrl: response.labelUrl,
      rawResponse: response.raw
    };
  }
}

export default new DelhiveryService();
