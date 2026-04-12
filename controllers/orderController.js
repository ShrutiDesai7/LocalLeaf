const orderModel = require('../models/orderModel');
const nurseryModel = require('../models/nurseryModel');
const db = require('../models/db');

const allowedStatuses = ['accepted', 'rejected'];

const createOrder = async (req, res, next) => {
  try {
    const { plant_id, customer_name, phone, address } = req.body;

    if (!plant_id || !customer_name || !phone || !address) {
      return res.status(400).json({
        message: 'plant_id, customer_name, phone, and address are required'
      });
    }

    const newOrder = await orderModel.createOrder({
      plant_id,
      customer_name,
      phone,
      address
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);
    if (!nursery) {
      return res.status(400).json({ message: 'No nursery profile' });
    }
    const orders = await orderModel.getAllOrders({ ...req.query, nursery_id: nursery.id });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderModel.getAllOrders({ phone: req.user.phone });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, delivery_eta, delivery_partner_name, delivery_partner_phone } =
      req.body;

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'status must be one of: accepted, rejected'
      });
    }

    const nursery = await nurseryModel.getNurseryByOwnerUserId(req.user.id);
    if (!nursery) {
      return res.status(400).json({ message: 'No nursery profile' });
    }

    if (status === 'accepted') {
      if (!delivery_eta) {
        return res.status(400).json({
          message: 'delivery_eta is required when accepting an order'
        });
      }

      if (!delivery_partner_name && !delivery_partner_phone) {
        return res.status(400).json({
          message:
            'delivery_partner_name or delivery_partner_phone is required when accepting an order'
        });
      }

      // Guard against missing DB columns (prevents silently dropping fields).
      const [cols] = await db.query('SHOW COLUMNS FROM orders');
      const colSet = new Set(cols.map((c) => c.Field));
      const required = [
        'delivery_eta',
        'delivery_partner_name',
        'delivery_partner_phone'
      ];
      const missing = required.filter((c) => !colSet.has(c));
      if (missing.length) {
        return res.status(500).json({
          message: 'Database schema missing delivery fields',
          error: `Missing columns in orders: ${missing.join(', ')}`
        });
      }
    }

    const updatedOrder = await orderModel.updateOrderStatusByIdAndNurseryId(id, nursery.id, {
      status,
      delivery_eta: delivery_eta ? String(delivery_eta).trim() : null,
      delivery_partner_name: delivery_partner_name
        ? String(delivery_partner_name).trim()
        : null,
      delivery_partner_phone: delivery_partner_phone
        ? String(delivery_partner_phone).trim()
        : null
    });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  updateOrderStatus
};
