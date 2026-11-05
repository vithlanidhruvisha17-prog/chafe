const orderService = require('../services/orderService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const sseManager = require('../utils/sseManager');

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body);
  successResponse(res, 201, order, 'Order placed successfully');
});

const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  const order = await orderService.getOrderByNumber(orderNumber);
  successResponse(res, 200, order, 'Order tracking details retrieved');
});

const trackOrderLive = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  const initialOrder = await orderService.getOrderByNumber(orderNumber);

  // Subscribe client connection to live SSE events for this order
  sseManager.subscribeOrder(orderNumber.trim().toUpperCase(), req, res, initialOrder);
});

const getAdminOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAdminOrders(req.query);
  successResponse(res, 200, result, 'Orders fetched successfully');
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(id, status);
  successResponse(res, 200, order, `Order status updated to ${status}`);
});

const getAdminStats = asyncHandler(async (req, res) => {
  const stats = await orderService.getAdminStats();
  successResponse(res, 200, stats, "Today's statistics fetched successfully");
});

module.exports = {
  createOrder,
  trackOrder,
  trackOrderLive,
  getAdminOrders,
  updateOrderStatus,
  getAdminStats,
};
