/**
 * Payment API client
 * Communicates with backend endpoints (/api/payment/*) to create orders
 * and verify payments securely without exposing payment secrets in frontend.
 */

/**
 * Dynamically load the Razorpay checkout script if not already present.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const paymentApi = {
  /**
   * Dynamically loads Razorpay SDK
   */
  loadScript: loadRazorpayScript,

  /**
   * Create a secure payment order.
   * The backend fetches the registrationFee directly from Firebase using eventId
   * and creates a Razorpay test order.
   */
  createOrder: async ({ eventId, registrationId, userId, participantName, email }) => {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId,
        registrationId,
        userId,
        participantName,
        email,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create payment order');
    }
    return data;
  },

  /**
   * Verify payment signature and confirm registration.
   */
  verifyPayment: async ({
    registrationId,
    eventId,
    orderId,
    paymentId,
    signature,
    signatureToken,
  }) => {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationId,
        eventId,
        orderId,
        paymentId,
        signature,
        signatureToken,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Payment verification failed');
    }
    return data;
  },

  /**
   * Report payment cancelled or failed.
   */
  cancelPayment: async ({ registrationId, reason }) => {
    try {
      const response = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationId,
          reason,
        }),
      });
      return await response.json();
    } catch {
      return { success: false };
    }
  },
};

export default paymentApi;
