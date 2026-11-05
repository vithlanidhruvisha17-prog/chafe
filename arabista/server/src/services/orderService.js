const prisma = require('../config/prisma');
const { generateOrderNumber } = require('../utils/orderNumber');
const sseManager = require('../utils/sseManager');

// Allowed status transitions
const VALID_TRANSITIONS = {
  PLACED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Creates an order validating item prices from DB and calculating server-side total
 */
const createOrder = async ({ type, tableNumber, customerName, phone, items }) => {
  if (!items || items.length === 0) {
    const error = new Error('Order must contain at least one item.');
    error.statusCode = 400;
    throw error;
  }

  // Extract menu item IDs
  const menuItemIds = items.map((i) => i.menuItemId);

  // Fetch verified items directly from DB
  const dbItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
    },
  });

  const dbItemMap = new Map();
  for (const item of dbItems) {
    dbItemMap.set(item.id, item);
  }

  // Verify all requested items exist and are available
  for (const item of items) {
    const dbItem = dbItemMap.get(item.menuItemId);
    if (!dbItem) {
      const error = new Error(`Menu item with ID '${item.menuItemId}' does not exist.`);
      error.statusCode = 400;
      throw error;
    }
    if (!dbItem.isAvailable) {
      const error = new Error(`Menu item '${dbItem.name}' is currently unavailable.`);
      error.statusCode = 400;
      throw error;
    }
  }

  // Calculate order items with database verified prices
  let grandTotal = 0;
  const verifiedOrderItems = items.map((item) => {
    const dbItem = dbItemMap.get(item.menuItemId);
    const quantity = Math.max(1, parseInt(item.quantity, 10));
    const price = dbItem.price;
    const itemTotal = price * quantity;
    grandTotal += itemTotal;

    return {
      menuItemId: dbItem.id,
      name: dbItem.name,
      quantity,
      price,
      itemTotal,
    };
  });

  // Ensure unique readable orderNumber
  let orderNumber = generateOrderNumber();
  let existing = await prisma.order.findUnique({ where: { orderNumber } });
  let attempts = 0;
  while (existing && attempts < 5) {
    orderNumber = generateOrderNumber();
    existing = await prisma.order.findUnique({ where: { orderNumber } });
    attempts++;
  }

  // Create Order and nested OrderItems in a transaction
  const order = await prisma.$transaction(async (tx) => {
    return await tx.order.create({
      data: {
        orderNumber,
        type,
        tableNumber: type === 'DINE_IN' ? tableNumber.trim() : null,
        customerName: customerName.trim(),
        phone: phone.trim(),
        status: 'PLACED',
        total: grandTotal,
        items: {
          create: verifiedOrderItems,
        },
      },
      include: {
        items: true,
      },
    });
  });

  return order;
};

/**
 * Returns tracking details for an order
 */
const getOrderByNumber = async (orderNumber) => {
  const order = await prisma.order.findFirst({
    where: {
      orderNumber: {
        equals: orderNumber.trim(),
        mode: 'insensitive',
      },
    },
    include: {
      items: {
        select: {
          id: true,
          name: true,
          quantity: true,
          price: true,
          itemTotal: true,
        },
      },
    },
  });

  if (!order) {
    const error = new Error(`Order '${orderNumber}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  return order;
};

/**
 * Admin: Get orders with status/date filters and pagination
 */
const getAdminOrders = async ({ status, date, type, search, page = 1, limit = 10 }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * take;

  const where = {};

  if (status && status.trim()) {
    where.status = status.trim().toUpperCase();
  }

  if (type && type.trim()) {
    where.type = type.trim().toUpperCase();
  }

  if (date && date.trim()) {
    const parsedDate = new Date(date.trim());
    if (!isNaN(parsedDate.getTime())) {
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { orderNumber: { contains: term, mode: 'insensitive' } },
      { customerName: { contains: term, mode: 'insensitive' } },
      { phone: { contains: term, mode: 'insensitive' } },
    ];
  }

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page: pageNum,
      limit: take,
      totalOrders,
      totalPages: Math.ceil(totalOrders / take) || 1,
    },
  };
};

/**
 * Admin: Updates order status with strict flow validation and SSE notification
 */
const updateOrderStatus = async (id, newStatus) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    const error = new Error(`Order with ID '${id}' not found.`);
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = order.status;
  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowedNext.includes(newStatus)) {
    let message = `Invalid status transition from '${currentStatus}' to '${newStatus}'.`;
    if (newStatus === 'CANCELLED' && (currentStatus === 'READY' || currentStatus === 'COMPLETED')) {
      message = `Orders cannot be cancelled once they are '${currentStatus}'. Cancellation is only allowed before 'READY'.`;
    } else if (allowedNext.length > 0) {
      message += ` Allowed transitions from '${currentStatus}': ${allowedNext.join(', ')}.`;
    } else {
      message += ` '${currentStatus}' is a terminal state and cannot be modified.`;
    }

    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status: newStatus },
    include: { items: true },
  });

  // Notify active live tracking listeners via Server-Sent Events
  sseManager.broadcastOrderUpdate(updatedOrder.orderNumber, updatedOrder);

  return updatedOrder;
};

/**
 * Admin: Live statistics for today
 */
const getAdminStats = async () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [todayOrders, pendingOrdersCount, allStatusGroups] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      select: {
        id: true,
        status: true,
        total: true,
      },
    }),
    prisma.order.count({
      where: {
        status: { in: ['PLACED', 'PREPARING', 'READY'] },
      },
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      _count: {
        status: true,
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  const todayOrdersCount = todayOrders.length;

  // Total revenue today from non-cancelled orders
  const todayRevenue = todayOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  const statusBreakdown = {
    PLACED: 0,
    PREPARING: 0,
    READY: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  allStatusGroups.forEach((group) => {
    if (statusBreakdown[group.status] !== undefined) {
      statusBreakdown[group.status] = group._count.status;
    }
  });

  return {
    todayOrders: todayOrdersCount,
    todayRevenue,
    pendingOrders: pendingOrdersCount,
    statusBreakdown,
  };
};

module.exports = {
  createOrder,
  getOrderByNumber,
  getAdminOrders,
  updateOrderStatus,
  getAdminStats,
};
