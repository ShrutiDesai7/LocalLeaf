const orderModel = require('../models/orderModel');
const nurseryModel = require('../models/nurseryModel');

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
    const { status } = req.body;

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'status must be one of: accepted, rejected'
      });
    }

    const updatedOrder = await orderModel.updateOrderStatus(id, status);

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
