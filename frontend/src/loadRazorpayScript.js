// src/loadRazorpayScript.js
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    // Create a new script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay script.'));
    document.body.appendChild(script);
  });
};
