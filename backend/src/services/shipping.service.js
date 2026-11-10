import Order from '../models/Order.js';
import delhiveryService from './delhivery.service.js';

// In the future, this can be dynamic based on a database config.
const ACTIVE_PROVIDER = process.env.ACTIVE_SHIPPING_PROVIDER || 'delhivery';

class ShippingService {
  /**
   * Get the active courier service implementation
   */
  getActiveService() {
    if (ACTIVE_PROVIDER === 'delhivery') {
      return delhiveryService;
    }
    throw new Error(`Shipping provider ${ACTIVE_PROVIDER} is not supported.`);
  }

  /**
   * Orchestrate shipment creation with multi-warehouse support
   * @param {Object} order The Mongoose order document
   */
  async createShipment(order) {
    if (order.shipments && order.shipments.length > 0) {
      throw new Error(`Shipments already created for order ${order._id}`);
    }

    // Fully populate order items with product and warehouse data
    const populatedOrder = await Order.findById(order._id)
      .populate({
        path: 'items.product',
        populate: { path: 'warehouse' }
      })
      .populate('user', 'name email');

    if (!populatedOrder) throw new Error('Order not found');

    const service = this.getActiveService();
    
    // Group items by warehouse
    const warehouseGroups = {};
    const defaultWarehouseId = 'default';

    populatedOrder.items.forEach(item => {
      // If product has a warehouse linked
      const w = item.product?.warehouse;
      const wId = w ? w._id.toString() : defaultWarehouseId;
      
      if (!warehouseGroups[wId]) {
        warehouseGroups[wId] = {
          warehouse: w,
          items: [],
          totalAmount: 0,
          totalQuantity: 0
        };
      }
      warehouseGroups[wId].items.push(item);
      warehouseGroups[wId].totalAmount += (item.price * item.quantity);
      warehouseGroups[wId].totalQuantity += item.quantity;
    });

    const results = [];
    populatedOrder.shipments = [];

    // For each warehouse group, create a distinct shipment
    for (const [wId, groupData] of Object.entries(warehouseGroups)) {
      if (wId === defaultWarehouseId) {
        throw new Error('Some products in this order are not assigned to a warehouse. Cannot generate shipment.');
      }

      // Create a specific payload subset for this shipment
      const shipmentSubset = {
        ...populatedOrder.toObject(), // Base order details
        items: groupData.items,       // Only items for this warehouse
        totalAmount: groupData.totalAmount, // Apportioned amount (simplified, taxes/shipping not deeply split here)
        warehouse: groupData.warehouse // The warehouse object with delhiveryPickupLocationName
      };

      // Call the provider service
      try {
        const result = await service.createShipment(shipmentSubset);
        results.push(result);

        // Store shipment tracking info
        populatedOrder.shipments.push({
          warehouse: groupData.warehouse._id,
          waybill: result.waybill,
          trackingId: result.waybill,
          status: 'Manifested',
          courierName: ACTIVE_PROVIDER,
          shippedAt: new Date()
        });
      } catch (err) {
        if (populatedOrder.shipments.length > 0) {
          await populatedOrder.save();
        }
        throw new Error(`Failed to create shipment for warehouse ${groupData.warehouse.name || wId}: ${err.message}`);
      }
    }

    populatedOrder.orderStatus = 'Shipped';
    await populatedOrder.save();

    return { success: true, shipments: populatedOrder.shipments, rawResults: results };
  }

  /**
   * Track shipment
   * @param {String} waybill
   */
  async trackShipment(waybill) {
    const service = this.getActiveService();
    return await service.trackShipment(waybill);
  }

  /**
   * Cancel shipment
   * @param {String} waybill
   */
  async cancelShipment(waybill) {
    const service = this.getActiveService();
    const result = await service.cancelShipment(waybill);

    // Update order status in database for the specific shipment
    const order = await Order.findOne({ 'shipments.waybill': waybill });
    if (order) {
      const shipment = order.shipments.find(s => s.waybill === waybill);
      if (shipment) {
        shipment.status = 'Cancelled';
      }
      
      // If all shipments are cancelled, mark the entire order cancelled
      if (order.shipments.every(s => s.status === 'Cancelled')) {
        order.orderStatus = 'Cancelled';
      }
      
      await order.save();
    }

    return result;
  }

  /**
   * Generate Label
   * @param {String} waybill
   */
  async getLabel(waybill) {
    const service = this.getActiveService();
    return await service.getLabel(waybill);
  }

  /**
   * Generate Manifest
   * @param {String} waybill
   */
  async generateManifest(waybill) {
    const service = this.getActiveService();
    return await service.generateManifest(waybill);
  }

  /**
   * Generate label
   * @param {String} waybill
   */
  async generateLabel(waybill) {
    const service = this.getActiveService();
    return await service.generateLabel(waybill);
  }

  /**
   * Schedule / Request Pickup
   * @param {Object} params
   */
  async requestPickup(params) {
    const service = this.getActiveService();
    return await service.requestPickup(params);
  }
}

export default new ShippingService();
