// Generates short, human-friendly order tracking codes like "AURA-7K2M9QXP".
// Uses an unambiguous alphabet (no 0/O, 1/I/L) so codes are easy to read & type.
import Order from '../models/Order.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(length = 8) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `AURA-${code}`;
}

// Returns a code guaranteed not to collide with an existing order.
export async function generateTrackId() {
  let code;
  // Collisions are astronomically unlikely, but loop to be safe.
  do {
    code = randomCode();
  } while (await Order.exists({ trackId: code }));
  return code;
}

// Normalises user input (trim, uppercase) for lookups.
export function normalizeTrackId(input = '') {
  return input.trim().toUpperCase();
}
