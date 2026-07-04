// Tracks the current browser's own orders so we can show a "Track Order"
// link only after the customer has purchased. Stored as a list of IDs.

const KEY = 'myOrders';

export function getMyOrders() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveOrderId(id) {
  if (!id) return;
  const ids = getMyOrders().filter((x) => x !== id);
  ids.unshift(id); // most recent first
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function getLastOrderId() {
  return getMyOrders()[0] || null;
}
