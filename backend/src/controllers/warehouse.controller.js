import Warehouse from '../models/Warehouse.js';
import delhiveryProvider from '../providers/delhivery.provider.js';

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private/Admin
export const getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({}).sort({ createdAt: -1 });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get warehouse by ID
// @route   GET /api/warehouses/:id
// @access  Private/Admin
export const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (warehouse) {
      res.json(warehouse);
    } else {
      res.status(404).json({ message: 'Warehouse not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a warehouse
// @route   POST /api/warehouses
// @access  Private/Admin
export const createWarehouse = async (req, res) => {
  try {
    const { name, delhiveryPickupLocationName, address, city, state, pincode, contactPhone, contactPersonName, email, returnSameAsPickup, workingDays, returnAddressLine, returnCity, returnState, returnPincode, isActive } = req.body;
    
    const warehouse = new Warehouse({
      name,
      delhiveryPickupLocationName,
      address,
      city,
      state,
      pincode,
      contactPhone,
      contactPersonName,
      email,
      returnSameAsPickup: returnSameAsPickup !== undefined ? returnSameAsPickup : true,
      workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      returnAddressLine,
      returnCity,
      returnState,
      returnPincode,
      isActive: isActive !== undefined ? isActive : true
    });

    const createdWarehouse = await warehouse.save();

    // Realtime sync to Delhivery
    try {
      const delhiveryRes = await delhiveryProvider.createWarehouse(createdWarehouse);
      if (!delhiveryRes.success) {
        console.warn('Delhivery warehouse sync note:', delhiveryRes.error);
      }
    } catch (syncErr) {
      console.warn('Failed to sync warehouse to Delhivery:', syncErr.message);
    }

    res.status(201).json(createdWarehouse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a warehouse
// @route   PUT /api/warehouses/:id
// @access  Private/Admin
export const updateWarehouse = async (req, res) => {
  try {
    const { name, delhiveryPickupLocationName, address, city, state, pincode, contactPhone, contactPersonName, email, returnSameAsPickup, workingDays, returnAddressLine, returnCity, returnState, returnPincode, isActive } = req.body;
    
    const warehouse = await Warehouse.findById(req.params.id);

    if (warehouse) {
      warehouse.name = name || warehouse.name;
      warehouse.delhiveryPickupLocationName = delhiveryPickupLocationName || warehouse.delhiveryPickupLocationName;
      warehouse.address = address || warehouse.address;
      warehouse.city = city || warehouse.city;
      warehouse.state = state || warehouse.state;
      warehouse.pincode = pincode || warehouse.pincode;
      warehouse.contactPhone = contactPhone || warehouse.contactPhone;
      
      if (contactPersonName !== undefined) warehouse.contactPersonName = contactPersonName;
      if (email !== undefined) warehouse.email = email;
      if (returnSameAsPickup !== undefined) warehouse.returnSameAsPickup = returnSameAsPickup;
      if (workingDays !== undefined) warehouse.workingDays = workingDays;
      if (returnAddressLine !== undefined) warehouse.returnAddressLine = returnAddressLine;
      if (returnCity !== undefined) warehouse.returnCity = returnCity;
      if (returnState !== undefined) warehouse.returnState = returnState;
      if (returnPincode !== undefined) warehouse.returnPincode = returnPincode;
      if (isActive !== undefined) {
        warehouse.isActive = isActive;
      }

      const updatedWarehouse = await warehouse.save();

      // Realtime sync to Delhivery
      try {
        const delhiveryRes = await delhiveryProvider.updateWarehouse(updatedWarehouse);
        if (!delhiveryRes.success) {
          console.warn('Delhivery warehouse update note:', delhiveryRes.error);
        }
      } catch (syncErr) {
        console.warn('Failed to update warehouse in Delhivery:', syncErr.message);
      }

      res.json(updatedWarehouse);
    } else {
      res.status(404).json({ message: 'Warehouse not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a warehouse
// @route   DELETE /api/warehouses/:id
// @access  Private/Admin
export const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (warehouse) {
      // Inactivate in Delhivery realtime
      try {
        await delhiveryProvider.updateWarehouse({
          delhiveryPickupLocationName: warehouse.delhiveryPickupLocationName,
          name: warehouse.name,
          address: warehouse.address,
          city: warehouse.city,
          pincode: warehouse.pincode,
          contactPhone: warehouse.contactPhone,
          isActive: false
        });
      } catch (syncErr) {
        console.warn('Failed to inactivate warehouse in Delhivery:', syncErr.message);
      }

      await warehouse.deleteOne();
      res.json({ message: 'Warehouse removed' });
    } else {
      res.status(404).json({ message: 'Warehouse not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
