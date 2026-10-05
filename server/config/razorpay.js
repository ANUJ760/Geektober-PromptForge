import Razorpay from 'razorpay';
import crypto from 'crypto';

const key_id = process.env.RAZORPAY_KEY_ID || '';
const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

const isConfigured = Boolean(
  key_id &&
  key_secret &&
  !key_id.includes('yourKeyId') &&
  !key_secret.includes('yourKeySecret')
);

let razorpayInstance = null;

if (isConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
    console.log('Razorpay SDK initialized successfully with live/test API keys.');
  } catch (err) {
    console.warn('Razorpay SDK initialization failed:', err.message);
  }
} else {
  console.log('Razorpay keys not configured; running in Mock/Simulation mode for local development.');
}

/**
 * Creates an order either via Razorpay API or local mock simulator.
 */
export async function createRazorpayOrder({ amountPaise, currency = 'INR', receipt }) {
  if (razorpayInstance) {
    const options = {
      amount: amountPaise,
      currency,
      receipt,
      payment_capture: 1,
    };
    return await razorpayInstance.orders.create(options);
  }

  // Fallback Simulator for local development / testing without live keys
  const mockOrderId = `order_sim_${crypto.randomBytes(8).toString('hex')}`;
  return {
    id: mockOrderId,
    entity: 'order',
    amount: amountPaise,
    amount_paid: 0,
    amount_due: amountPaise,
    currency,
    receipt,
    status: 'created',
    attempts: 0,
    created_at: Math.floor(Date.now() / 1000),
    isSimulation: true,
  };
}

/**
 * Validates HMAC-SHA256 signature for a payment or simulation.
 */
export function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  // Handle simulation tokens
  if (razorpay_order_id.startsWith('order_sim_') && razorpay_payment_id.startsWith('pay_sim_')) {
    const expectedSim = crypto
      .createHmac('sha256', 'mock_secret_key')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    return razorpay_signature === expectedSim || razorpay_signature === 'valid_mock_signature';
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, 'utf-8'),
    Buffer.from(razorpay_signature, 'utf-8')
  );
}

export function isRazorpayConfigured() {
  return isConfigured;
}

export default razorpayInstance;
