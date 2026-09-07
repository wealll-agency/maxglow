import CustomSection from '../models/CustomSection.js';

// @desc    Get all custom sections
// @route   GET /api/custom-sections
// @access  Public
export const getCustomSections = async (req, res) => {
  try {
    const query = req.query.isActive === 'true' ? { isActive: true } : {};
    const sections = await CustomSection.find(query)
      .populate('products')
      .sort({ sortOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: sections.length, sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a custom section
// @route   POST /api/custom-sections
// @access  Private/Admin
export const createCustomSection = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide a title' });
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const section = await CustomSection.create({ title, slug });
    res.status(201).json({ success: true, section });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Section already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a custom section's products
// @route   PUT /api/custom-sections/:id
// @access  Private/Admin
export const updateCustomSectionProducts = async (req, res) => {
  try {
    const { productIds } = req.body;
    const section = await CustomSection.findByIdAndUpdate(
      req.params.id,
      { products: productIds },
      { new: true }
    );
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    res.status(200).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a custom section
// @route   DELETE /api/custom-sections/:id
// @access  Private/Admin
export const deleteCustomSection = async (req, res) => {
  try {
    const section = await CustomSection.findByIdAndDelete(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    res.status(200).json({ success: true, message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
