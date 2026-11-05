/**
 * Server-Sent Events (SSE) Manager for live order tracking
 * Maintains active HTTP response streams mapped by orderNumber.
 */

class SSEManager {
  constructor() {
    // Map<orderNumber, Set<res>>
    this.orderSubscribers = new Map();
  }

  /**
   * Subscribes a client HTTP response to real-time status changes of an order
   * @param {string} orderNumber
   * @param {import('express').Response} res
   * @param {Object} initialOrder
   */
  subscribeOrder(orderNumber, req, res, initialOrder) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Send immediate initial order snapshot
    res.write(`event: initial_state\ndata: ${JSON.stringify(initialOrder)}\n\n`);

    if (!this.orderSubscribers.has(orderNumber)) {
      this.orderSubscribers.set(orderNumber, new Set());
    }

    const subscribers = this.orderSubscribers.get(orderNumber);
    subscribers.add(res);

    // Keep connection alive with comment heartbeats every 25 seconds
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeatInterval);
      const activeSubs = this.orderSubscribers.get(orderNumber);
      if (activeSubs) {
        activeSubs.delete(res);
        if (activeSubs.size === 0) {
          this.orderSubscribers.delete(orderNumber);
        }
      }
    });
  }

  /**
   * Broadcasts an updated order object to all clients listening to this order
   * @param {string} orderNumber
   * @param {Object} updatedOrder
   */
  broadcastOrderUpdate(orderNumber, updatedOrder) {
    const subscribers = this.orderSubscribers.get(orderNumber);
    if (!subscribers || subscribers.size === 0) return;

    const payload = `event: status_update\ndata: ${JSON.stringify(updatedOrder)}\n\n`;

    for (const res of subscribers) {
      try {
        res.write(payload);
      } catch (err) {
        subscribers.delete(res);
      }
    }
  }
}

const sseManager = new SSEManager();

module.exports = sseManager;
