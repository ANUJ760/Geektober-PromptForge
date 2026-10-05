import toast from 'react-hot-toast';

const getBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Dynamically loads the Razorpay Checkout script if not already present.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Creates an order in the backend database and with Razorpay.
 */
export async function createOrder(promptId) {
  const response = await fetch(`${getBaseUrl()}/orders/create`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ promptId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create order');
  }
  return data;
}

/**
 * Sends client payment verification tokens to the backend for HMAC-SHA256 verification.
 */
export async function verifyPayment(paymentData) {
  const response = await fetch(`${getBaseUrl()}/orders/verify`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Payment signature verification failed');
  }
  return data;
}

/**
 * Launches the Razorpay payment modal or triggers simulated checkout for dev environments.
 */
export async function initiateCheckout({
  promptId,
  promptTitle,
  userEmail = '',
  userName = '',
  onSuccess,
  onFailure,
}) {
  try {
    toast.loading('Preparing secure checkout...', { id: 'checkout' });

    // Step 1: Create Order
    const orderData = await createOrder(promptId);

    // If prompt is free, it's instantly unlocked
    if (orderData.isFree) {
      toast.success('Prompt unlocked!', { id: 'checkout' });
      if (onSuccess) onSuccess(orderData);
      return;
    }

    // Step 2: Ensure Razorpay SDK loaded
    const isScriptLoaded = await loadRazorpayScript();

    // Check if running in simulated / mock mode
    if (!isScriptLoaded || orderData.razorpayOrderId.startsWith('order_sim_')) {
      toast.dismiss('checkout');
      // Simulated Payment Flow for Dev / Test mode
      const confirmSim = window.confirm(
        `[PromptForge Payment Simulation]\n\nAuthorize payment of ₹${(orderData.amount / 100).toFixed(0)} for "${promptTitle}"?\n\n(Click OK to simulate successful payment, Cancel to simulate abort)`
      );

      if (confirmSim) {
        toast.loading('Verifying cryptographic signature...', { id: 'verify' });
        const verifyData = await verifyPayment({
          orderId: orderData.orderId,
          razorpay_order_id: orderData.razorpayOrderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'valid_mock_signature',
        });
        toast.success('Payment authorized & prompt unlocked!', { id: 'verify' });
        if (onSuccess) onSuccess(verifyData);
      } else {
        toast.error('Payment cancelled');
        if (onFailure) onFailure(new Error('User cancelled'));
      }
      return;
    }

    toast.dismiss('checkout');

    // Step 3: Open Razorpay Live / Test Modal
    const options = {
      key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'PromptForge Marketplace',
      description: `Unlock prompt: ${promptTitle}`,
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: '#4F7FFF',
      },
      handler: async function (response) {
        try {
          toast.loading('Verifying payment signature with bank...', { id: 'verify' });
          const verifyData = await verifyPayment({
            orderId: orderData.orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast.success('Payment verified! Prompt unlocked.', { id: 'verify' });
          if (onSuccess) onSuccess(verifyData);
        } catch (err) {
          toast.error(err.message || 'Signature verification failed', { id: 'verify' });
          if (onFailure) onFailure(err);
        }
      },
      modal: {
        ondismiss: function () {
          toast('Payment window closed', { icon: 'ℹ️' });
          if (onFailure) onFailure(new Error('Modal closed by buyer'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    toast.error(err.message || 'Failed to initiate checkout', { id: 'checkout' });
    if (onFailure) onFailure(err);
  }
}
