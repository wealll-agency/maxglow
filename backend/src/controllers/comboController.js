import Combo from '../models/Combo.js';
import Product from '../models/Product.js';

// @desc    Get all active combos
// @route   GET /api/combos
// @access  Public
export const getCombos = async (req, res) => {
  try {
    const combos = await Combo.find({ status: 'Active' })
      .populate('components.product', 'name price stock images unit unitValue discount discountType packSizes isActive')
      .sort({ sortOrder: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: combos.length, combos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single combo by ID
// @route   GET /api/combos/:id
// @access  Public
export const getComboById = async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id)
      .populate('components.product', 'name price stock images unit unitValue discount discountType packSizes isActive');

    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }

    res.status(200).json({ success: true, combo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all combos (Admin)
// @route   GET /api/admin/combos
// @access  Private/Admin
export const getAdminCombos = async (req, res) => {
  try {
    const combos = await Combo.find({})
      .populate('components.product', 'name stock price')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: combos.length, combos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new combo
// @route   POST /api/admin/combos
// @access  Private/Admin
export const createCombo = async (req, res) => {
  try {
    const { name, description, benefits, shortDescription, sku, category, brand, comboPrice, image, images, status, isFeatured, sortOrder, components } = req.body;

    // Validate components
    if (!components || components.length === 0) {
      return res.status(400).json({ success: false, message: 'Combo must have at least one component' });
    }

    const imagesList = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
    const primaryImage = (imagesList.includes(image)) ? image : (imagesList[0] || '');

    const combo = await Combo.create({
      name, description, benefits, shortDescription, sku, category, brand, comboPrice, 
      image: primaryImage, 
      images: imagesList,
      status, isFeatured, sortOrder, components
    });

    res.status(201).json({ success: true, combo });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Combo SKU already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update combo
// @route   PUT /api/admin/combos/:id
// @access  Private/Admin
export const updateCombo = async (req, res) => {
  try {
    const { name, description, benefits, shortDescription, sku, category, brand, comboPrice, image, images, status, isFeatured, sortOrder, components } = req.body;

    if (components && components.length === 0) {
      return res.status(400).json({ success: false, message: 'Combo must have at least one component' });
    }

    let combo = await Combo.findById(req.params.id);
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }

    const imagesList = Array.isArray(images) && images.length > 0 
      ? images 
      : (image ? [image] : (combo.images && combo.images.length > 0 ? combo.images : (combo.image ? [combo.image] : [])));
    const primaryImage = (imagesList.includes(image)) ? image : (imagesList[0] || combo.image || '');

    combo = await Combo.findByIdAndUpdate(req.params.id, {
      name, description, benefits, shortDescription, sku, category, brand, comboPrice, 
      image: primaryImage, 
      images: imagesList,
      status, isFeatured, sortOrder, components
    }, {
      new: true,
      runValidators: true
    }).populate('components.product', 'name price stock images unit unitValue discount discountType packSizes isActive');

    res.status(200).json({ success: true, combo });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Combo SKU already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Archive/Soft Delete combo
// @route   DELETE /api/admin/combos/:id
// @access  Private/Admin
export const deleteCombo = async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id);
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }

    // We only archive it to protect historical orders
    combo.status = 'Archived';
    await combo.save();

    res.status(200).json({ success: true, message: 'Combo archived successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Duplicate combo
// @route   POST /api/admin/combos/:id/duplicate
// @access  Private/Admin
export const duplicateCombo = async (req, res) => {
  try {
    const combo = await Combo.findById(req.params.id);
    if (!combo) {
      return res.status(404).json({ success: false, message: 'Combo not found' });
    }

    const duplicatedCombo = await Combo.create({
      name: `${combo.name} (Copy)`,
      description: combo.description,
      shortDescription: combo.shortDescription,
      sku: `${combo.sku}-COPY-${Date.now()}`,
      category: combo.category,
      brand: combo.brand,
      comboPrice: combo.comboPrice,
      image: combo.image,
      status: 'Draft',
      isFeatured: false,
      sortOrder: combo.sortOrder,
      components: combo.components
    });

    res.status(201).json({ success: true, combo: duplicatedCombo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
