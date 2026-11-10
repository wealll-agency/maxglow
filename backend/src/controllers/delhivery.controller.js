import Order from '../models/Order.js';
import shippingService from '../services/shipping.service.js';

export const createShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const result = await shippingService.createShipment(order);
    
    res.status(200).json({ 
      success: true, 
      message: 'Shipment created successfully',
      shipments: result.shipments,
      result 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackShipment = async (req, res) => {
  try {
    const { waybill } = req.params;
    if (!waybill) {
      return res.status(400).json({ success: false, message: 'Waybill is required' });
    }

    const result = await shippingService.trackShipment(waybill);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelShipment = async (req, res) => {
  try {
    const { waybill } = req.params;
    if (!waybill) {
      return res.status(400).json({ success: false, message: 'Waybill is required' });
    }

    const result = await shippingService.cancelShipment(waybill);
    res.status(200).json({ success: true, message: 'Shipment cancelled', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateLabel = async (req, res) => {
  try {
    const { waybill } = req.params;
    if (!waybill) {
      return res.status(400).json({ success: false, message: 'Waybill is required' });
    }

    const result = await shippingService.getLabel(waybill);
    res.status(200).json({ success: true, label: result.raw }); 
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateManifest = async (req, res) => {
  try {
    const { waybill } = req.params;
    if (!waybill) {
      return res.status(400).json({ success: false, message: 'Waybill is required' });
    }

    const result = await shippingService.generateManifest(waybill);
    res.status(200).json({ success: true, message: 'Manifest generated', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestPickup = async (req, res) => {
  try {
    const { pickup_location, pickup_date, pickup_time, expected_package_count } = req.body;
    if (!pickup_location) {
      return res.status(400).json({ success: false, message: 'Pickup location is required' });
    }

    const result = await shippingService.requestPickup({
      pickup_location,
      pickup_date: pickup_date || new Date().toISOString().split('T')[0],
      pickup_time: pickup_time || '15:00:00',
      expected_package_count: Number(expected_package_count) || 1
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error || 'Pickup request failed' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Delhivery courier pickup requested successfully', 
      data: result.data 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
