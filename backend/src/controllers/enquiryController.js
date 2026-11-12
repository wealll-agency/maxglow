import Enquiry from '../models/Enquiry.js';
import { sendAdminNotification } from '../utils/firebaseHelper.js';

// POST /api/enquiries - Submit a new enquiry (public)
export const submitEnquiry = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, queryType, message } = req.body;
    if (!firstName || !lastName || !phone || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const enquiry = await Enquiry.create({ firstName, lastName, phone, email, queryType, message });

    // Send instant push notification to all logged-in admin machines
    const customerName = `${firstName || ''} ${lastName || ''}`.trim() || 'A customer';
    const previewMessage = message.length > 80 ? `${message.substring(0, 77)}...` : message;
    sendAdminNotification(
      '📩 New Customer Enquiry!',
      `${customerName} (${queryType || 'General'}): "${previewMessage}"`,
      '/admin/enquiries'
    ).catch(err => console.error('Enquiry notification failed:', err));

    res.status(201).json({ success: true, message: 'Enquiry submitted successfully!', enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/enquiries - Get all enquiries (admin)
export const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    const unreadCount = await Enquiry.countDocuments({ isRead: false });
    res.json({ success: true, enquiries, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/enquiries/:id/read - Mark enquiry as read (admin)
export const markAsRead = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    res.json({ success: true, enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/enquiries/:id - Delete an enquiry (admin)
export const deleteEnquiry = async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Enquiry deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
