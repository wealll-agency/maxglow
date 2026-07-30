import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private/Admin
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'This category is already added' });
    }

    const category = await Category.create({ name, subCategories: [] });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Add a sub-category to an existing category
// @route   POST /api/categories/:id/subcategories
// @access  Private/Admin
export const addSubCategory = async (req, res) => {
  try {
    const { subCategory } = req.body;
    
    if (!subCategory) {
      return res.status(400).json({ success: false, message: 'Sub-category name is required' });
    }

    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const subExists = category.subCategories.some(sub => sub.toLowerCase() === subCategory.toLowerCase());
    if (subExists) {
      return res.status(400).json({ success: false, message: 'This sub category is already added' });
    }

    category.subCategories.push(subCategory);
    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete a sub-category
// @route   DELETE /api/categories/:id/subcategories/:subCategoryName
// @access  Private/Admin
export const deleteSubCategory = async (req, res) => {
  try {
    const { id, subCategoryName } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.subCategories = category.subCategories.filter(
      (sub) => sub.toLowerCase() !== subCategoryName.toLowerCase()
    );

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

