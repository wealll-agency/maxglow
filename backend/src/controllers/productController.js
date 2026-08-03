import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import SystemSetting from '../models/SystemSetting.js';
import StockNotification from '../models/StockNotification.js';
import { logActivity } from '../middleware/logger.js';
import { uploadFile } from '../services/storageService.js';

// @desc    Get all products (with search, category filter, sorting, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, subCategory, subSubCategory, brand, minPrice, maxPrice, sort, page = 1, limit = 12, homepage, topSelling, newArrival, healthyProduct, featured, inStock, showInReels } = req.query;

    const query = {};

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    // Keyword Search
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Category Filter
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    
    // Sub Category Filter
    if (subCategory && subCategory !== 'All') {
      query.subCategory = subCategory;
    }

    // Sub Sub Category Filter
    if (subSubCategory && subSubCategory !== 'All') {
      query.subSubCategory = subSubCategory;
    }

    // Brand Filter
    if (brand && brand !== 'All Brands') {
      query.brand = brand;
    }

    // Price Range Filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Homepage Filters
    if (homepage === 'true') {
      query.showOnHomepage = true;
    }
    if (featured === 'true') {
      query.isFeatured = true;
    }
    if (newArrival === 'true') {
      query.newArrival = true;
    }
    if (healthyProduct === 'true') {
      query.healthyProduct = true;
    }
    if (showInReels === 'true') {
      query.showInReels = true;
    }

    // Top Selling Filter
    let sortBy = { createdAt: -1 };
    if (topSelling === 'true') {
      const topSellingSetting = await SystemSetting.findOne({ key: 'topSellingSource' });
      const source = topSellingSetting ? topSellingSetting.value : 'automatic';
      
      if (source === 'manual') {
        query.manualTopSelling = true;
      } else {
        sortBy = { totalSold: -1 };
      }
    }

    // Default sorting overrides
    if (sort) {
      if (sort === 'priceAsc') sortBy = { price: 1 };
      else if (sort === 'priceDesc') sortBy = { price: -1 };
      else if (sort === 'rating') sortBy = { rating: -1 };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (product) {
      res.json({ success: true, product });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  const { 
    name, category, subCategory, subSubCategory, brand, productType, sku, unit, unitValue, searchTags, 
    price, purchasePrice, minOrderQty, discount, discountType, taxAmount, taxCalculation, 
    shippingCost, shippingMultiplyWithQty, isFeatured, isActive, showOnHomepage, showInReels, manualTopSelling, newArrival,
    description, ingredients, benefits, images, videos, batchNumber, expiryDate, stock, packSizes, warehouse
  } = req.body;

  try {
    let finalImages = images ? (Array.isArray(images) ? images : [images]) : [];
    let finalVideos = videos ? (Array.isArray(videos) ? videos : [videos]) : [];

    // If an image file was uploaded, process it
    if (req.files && req.files.image) {
      const file = req.files.image[0];
      const s3Url = await uploadFile(file);
      finalImages.push(s3Url);
    }

    if (req.files && req.files.subImages) {
      for (const file of req.files.subImages) {
        const s3Url = await uploadFile(file);
        finalImages.push(s3Url);
      }
    }

    if (req.files && req.files.video) {
      const file = req.files.video[0];
      const s3Url = await uploadFile(file);
      finalVideos.push(s3Url);
    }

    const product = new Product({
      name,
      category,
      subCategory: subCategory || '',
      subSubCategory: subSubCategory || '',
      brand: brand || '',
      productType: productType || 'Physical',
      sku: sku || '',
      unit: unit || 'kg',
      unitValue: unitValue ? Number(unitValue) : 1,
      searchTags: searchTags || [],
      price,
      purchasePrice: purchasePrice || 0,
      minOrderQty: minOrderQty || 1,
      discount: discount || 0,
      discountType: discountType || 'Flat',
      taxAmount: taxAmount || 0,
      taxCalculation: taxCalculation || 'Include with product',
      shippingCost: shippingCost || 0,
      shippingMultiplyWithQty: shippingMultiplyWithQty || false,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isActive: isActive === 'false' || isActive === false ? false : true,
      showOnHomepage: showOnHomepage === 'false' || showOnHomepage === false ? false : true,
      showInReels: showInReels === 'true' || showInReels === true,
      manualTopSelling: manualTopSelling === 'true' || manualTopSelling === true,
      newArrival: newArrival === 'true' || newArrival === true,
      description,
      ingredients: typeof ingredients === 'string' ? ingredients.split(',').map(i => i.trim()).filter(Boolean) : (ingredients || []),
      benefits: typeof benefits === 'string' ? benefits.split(',').map(b => b.trim()).filter(Boolean) : (benefits || []),
      images: finalImages,
      videos: finalVideos,
      batchNumber,
      expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year expiry
      stock: Number(stock) || 0,
      packSizes: (typeof packSizes === 'string' ? JSON.parse(packSizes) : (packSizes || [])).filter(p => p.weight !== '' && p.weight !== null && p.weight !== undefined && p.price !== '' && p.price !== null && p.price !== undefined),
      warehouse: warehouse === '' ? null : warehouse
    });

    const createdProduct = await product.save();

    // Create Initial Inventory Record
    await Inventory.create({
      product: createdProduct._id,
      batchNumber: batchNumber || 'BATCH-001',
      expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      stockQuantity: stock || 0,
      adjustments: [{
        quantityChanged: stock || 0,
        type: 'Restock',
        reason: 'Initial Product Stock Seeding',
        adjustedBy: req.user._id
      }]
    });

    await logActivity(req.user._id, 'CREATE_PRODUCT', `Created product: ${name} (ID: ${createdProduct._id})`, req);

    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin/Manager
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.category = req.body.category || product.category;
      product.subCategory = req.body.subCategory !== undefined ? req.body.subCategory : product.subCategory;
      product.subSubCategory = req.body.subSubCategory !== undefined ? req.body.subSubCategory : product.subSubCategory;
      product.brand = req.body.brand !== undefined ? req.body.brand : product.brand;
      product.productType = req.body.productType || product.productType;
      product.sku = req.body.sku !== undefined ? req.body.sku : product.sku;
      product.unit = req.body.unit || product.unit;
      product.unitValue = req.body.unitValue !== undefined ? Number(req.body.unitValue) : product.unitValue;
      product.searchTags = req.body.searchTags || product.searchTags;
      
      product.price = req.body.price !== undefined ? req.body.price : product.price;
      product.purchasePrice = req.body.purchasePrice !== undefined ? req.body.purchasePrice : product.purchasePrice;
      product.minOrderQty = req.body.minOrderQty !== undefined ? req.body.minOrderQty : product.minOrderQty;
      product.discount = req.body.discount !== undefined ? req.body.discount : product.discount;
      product.discountType = req.body.discountType || product.discountType;
      product.taxAmount = req.body.taxAmount !== undefined ? req.body.taxAmount : product.taxAmount;
      product.taxCalculation = req.body.taxCalculation || product.taxCalculation;
      product.shippingCost = req.body.shippingCost !== undefined ? req.body.shippingCost : product.shippingCost;
      product.shippingMultiplyWithQty = req.body.shippingMultiplyWithQty !== undefined ? (req.body.shippingMultiplyWithQty === 'true' || req.body.shippingMultiplyWithQty === true) : product.shippingMultiplyWithQty;
      
      if (req.body.packSizes !== undefined) {
        let parsed = typeof req.body.packSizes === 'string' ? JSON.parse(req.body.packSizes) : req.body.packSizes;
        parsed = (parsed || []).filter(p => p.weight !== '' && p.weight !== null && p.weight !== undefined && p.price !== '' && p.price !== null && p.price !== undefined);
        product.packSizes = parsed;
        product.markModified('packSizes');
      }

      product.isFeatured = req.body.isFeatured !== undefined ? (req.body.isFeatured === 'true' || req.body.isFeatured === true) : product.isFeatured;
      product.isActive = req.body.isActive !== undefined ? (req.body.isActive !== 'false' && req.body.isActive !== false) : product.isActive;
      product.showOnHomepage = req.body.showOnHomepage !== undefined ? (req.body.showOnHomepage !== 'false' && req.body.showOnHomepage !== false) : product.showOnHomepage;
      product.showInReels = req.body.showInReels !== undefined ? (req.body.showInReels === 'true' || req.body.showInReels === true) : product.showInReels;
      product.manualTopSelling = req.body.manualTopSelling !== undefined ? (req.body.manualTopSelling === 'true' || req.body.manualTopSelling === true) : product.manualTopSelling;
      product.healthyProduct = req.body.healthyProduct !== undefined ? (req.body.healthyProduct === 'true' || req.body.healthyProduct === true) : product.healthyProduct;
      product.newArrival = req.body.newArrival !== undefined ? (req.body.newArrival === 'true' || req.body.newArrival === true) : product.newArrival;
      
      product.description = req.body.description || product.description;
      product.ingredients = typeof req.body.ingredients === 'string' ? req.body.ingredients.split(',').map(i => i.trim()).filter(Boolean) : (req.body.ingredients || product.ingredients);
      product.benefits = typeof req.body.benefits === 'string' ? req.body.benefits.split(',').map(b => b.trim()).filter(Boolean) : (req.body.benefits || product.benefits);
      
      let finalImages = req.body.images ? (Array.isArray(req.body.images) ? req.body.images : [req.body.images]) : product.images;
      let finalVideos = req.body.videos ? (Array.isArray(req.body.videos) ? req.body.videos : [req.body.videos]) : product.videos;
      
      if (req.files) {
        let newImages = [];
        if (req.files.image) {
          const file = req.files.image[0];
          const s3Url = await uploadFile(file);
          newImages.push(s3Url);
        }
        if (req.files.subImages) {
          for (const file of req.files.subImages) {
            const s3Url = await uploadFile(file);
            newImages.push(s3Url);
          }
        }
        if (newImages.length > 0) {
          // If a new main image is provided, replace images or append?
          // Since edit form only sends what exists or new files, we'll append.
          // Wait, if we send FormData, `req.body.images` could contain existing urls.
          // In frontend, `imagePreviewUrl` is sent in `images` array if no new file is selected.
          finalImages = [...finalImages, ...newImages];
          // Filter duplicates just in case
          finalImages = [...new Set(finalImages)];
        }
        if (req.files.video) {
          const file = req.files.video[0];
          const s3Url = await uploadFile(file);
          finalVideos = [s3Url]; // Override existing video with the new one
        }
      }
      
      product.images = finalImages;
      product.videos = finalVideos;
      
      const oldStock = product.stock;
      if (req.body.stock !== undefined) {
        product.stock = req.body.stock;
      }
      
      if (req.body.warehouse !== undefined) {
        product.warehouse = req.body.warehouse === '' ? null : req.body.warehouse;
      }

      const updatedProduct = await product.save();

      // Sync Stock with Inventory if changed
      if (req.body.stock !== undefined && req.body.stock !== oldStock) {
        const diff = req.body.stock - oldStock;
        await Inventory.findOneAndUpdate(
          { product: product._id },
          { 
            $set: { stockQuantity: req.body.stock },
            $push: { 
              adjustments: {
                quantityChanged: diff,
                type: 'AuditAdjustment',
                reason: 'Manual Product Update Adjustment',
                adjustedBy: req.user._id
              } 
            }
          },
          { upsert: true, new: true }
        );

        // Check for restock notification trigger
        if (oldStock <= 0 && req.body.stock > 0) {
          const pendingNotifications = await StockNotification.find({ product: product._id, status: 'Pending' }).populate('user', 'name email');
          
          if (pendingNotifications.length > 0) {
            console.log(`[RESTOCK NOTIFICATION] Triggering notifications for ${pendingNotifications.length} users for product ${product.name}`);
            
            // Here you would trigger an email/sms service for each pending user
            for (const notification of pendingNotifications) {
              console.log(`[EMAIL DISPATCH] Sending Restock Email to ${notification.email} (User: ${notification.user?.name}) for Product: ${product.name}`);
              
              notification.status = 'Completed';
              await notification.save();
            }
          }
        }
      }

      await logActivity(req.user._id, 'UPDATE_PRODUCT', `Updated product ID: ${req.params.id}`, req);
      res.json({ success: true, product: updatedProduct });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      // Remove corresponding inventory
      await Inventory.deleteMany({ product: req.params.id });

      await logActivity(req.user._id, 'DELETE_PRODUCT', `Deleted product ID: ${req.params.id}`, req);
      res.json({ success: true, message: 'Product removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product status (isFeatured or isActive)
// @route   PATCH /api/products/:id/toggle
// @access  Private/Admin/Manager
export const toggleProductStatus = async (req, res, next) => {
  try {
    const { field, value } = req.body; // field should be 'isFeatured', 'isActive', or 'newArrival'
    if (!['isFeatured', 'isActive', 'newArrival'].includes(field)) {
      return res.status(400).json({ success: false, message: 'Invalid toggle field' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product[field] = value;
    await product.save();
    
    await logActivity(req.user._id, 'UPDATE_PRODUCT', `Toggled ${field} to ${value} for product ID: ${product._id}`, req);
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update homepage visibility flags
// @route   PUT /api/products/bulk-flags
// @access  Private/Admin/Manager
export const bulkUpdateHomepageFlags = async (req, res, next) => {
  try {
    const { flag, productIds } = req.body; // flag: showOnHomepage, healthyProduct, newArrival, manualTopSelling

    if (!['showOnHomepage', 'newArrival', 'manualTopSelling', 'healthyProduct'].includes(flag)) {
      return res.status(400).json({ success: false, message: 'Invalid flag specified' });
    }
    
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ success: false, message: 'productIds must be an array' });
    }

    // Set flag to false for all products NOT in the array
    await Product.updateMany(
      { _id: { $nin: productIds } },
      { $set: { [flag]: false } }
    );

    // Set flag to true for all products IN the array
    if (productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: { [flag]: true } }
      );
    }

    await logActivity(req.user._id, 'UPDATE_PRODUCT', `Bulk updated ${flag} for ${productIds.length} products`, req);
    res.json({ success: true, message: `Successfully updated ${flag}` });
  } catch (error) {
    next(error);
  }
};
