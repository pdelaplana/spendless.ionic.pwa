/**
 * Spendless - Email Capture Form Handler
 * Handles form validation, submission, and user feedback
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    // Replace with your actual endpoint (Mailchimp, ConvertKit, custom API, etc.)
    API_ENDPOINT: 'YOUR_EMAIL_SERVICE_ENDPOINT',
    // Email validation regex
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  };

  // DOM Elements
  const form = document.getElementById('emailForm');
  const emailInput = document.getElementById('email');
  const submitButton = form?.querySelector('button[type="submit"]');

  // Initialize
  if (form && emailInput && submitButton) {
    initializeForm();
  }

  /**
   * Initialize form event listeners
   */
  function initializeForm() {
    // Form submission
    form.addEventListener('submit', handleSubmit);

    // Real-time validation
    emailInput.addEventListener('input', handleInputValidation);
    emailInput.addEventListener('blur', handleInputValidation);
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const email = emailInput.value.trim();

    // Validate email
    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }

    // Show loading state
    setLoadingState(true);

    try {
      // Submit email to backend
      const response = await submitEmail(email);

      if (response.success) {
        showSuccess('Success! Check your email to get started.');
        form.reset();

        // Track conversion event
        trackConversion(email);
      } else {
        showError(response.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Email submission error:', error);
      showError('Unable to connect. Please check your connection and try again.');
    } finally {
      setLoadingState(false);
    }
  }

  /**
   * Handle real-time input validation
   */
  function handleInputValidation() {
    const email = emailInput.value.trim();

    // Clear previous states
    clearFormState();

    // Only validate if user has started typing
    if (email.length === 0) {
      return;
    }

    // Show validation feedback after 2 characters
    if (email.length >= 2) {
      if (isValidEmail(email)) {
        emailInput.style.borderColor = 'var(--color-success)';
      } else {
        emailInput.style.borderColor = 'var(--color-error)';
      }
    }
  }

  /**
   * Submit email to backend service
   */
  async function submitEmail(email) {
    // For demo purposes, simulate API call
    // Replace this with your actual API endpoint

    if (CONFIG.API_ENDPOINT === 'YOUR_EMAIL_SERVICE_ENDPOINT') {
      // Simulated response for demo
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Demo mode: Email captured -', email);
          resolve({ success: true });
        }, 1000);
      });
    }

    // Real API call example (uncomment and configure):
    /*
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
    */
  }

  /**
   * Validate email format
   */
  function isValidEmail(email) {
    return CONFIG.EMAIL_REGEX.test(email);
  }

  /**
   * Show success message
   */
  function showSuccess(message) {
    clearFormState();
    form.classList.add('form-success');

    const messageEl = createMessageElement(message, 'success');
    form.appendChild(messageEl);

    // Add checkmark animation
    emailInput.classList.add('checkmark-animation');

    // Remove success state after 5 seconds
    setTimeout(() => {
      clearFormState();
    }, 5000);
  }

  /**
   * Show error message
   */
  function showError(message) {
    clearFormState();
    form.classList.add('form-error');

    const messageEl = createMessageElement(message, 'error');
    form.appendChild(messageEl);

    // Shake animation
    emailInput.style.animation = 'shake 0.3s';
    setTimeout(() => {
      emailInput.style.animation = '';
    }, 300);
  }

  /**
   * Create message element
   */
  function createMessageElement(message, type) {
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `form-message ${type}`;
    messageEl.textContent = message;
    messageEl.setAttribute('role', type === 'error' ? 'alert' : 'status');
    return messageEl;
  }

  /**
   * Clear form state
   */
  function clearFormState() {
    form.classList.remove('form-success', 'form-error');
    emailInput.style.borderColor = '';

    const messageEl = form.querySelector('.form-message');
    if (messageEl) {
      messageEl.remove();
    }
  }

  /**
   * Set loading state
   */
  function setLoadingState(isLoading) {
    if (isLoading) {
      submitButton.classList.add('loading');
      submitButton.disabled = true;
      emailInput.disabled = true;
    } else {
      submitButton.classList.remove('loading');
      submitButton.disabled = false;
      emailInput.disabled = false;
    }
  }

  /**
   * Track conversion event in analytics
   */
  function trackConversion(email) {
    // Google Analytics 4
    if (typeof gtag === 'function') {
      gtag('event', 'email_signup', {
        event_category: 'engagement',
        event_label: 'landing_page',
        value: 1
      });
    }

    // Facebook Pixel
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        content_name: 'Email Signup',
        content_category: 'Landing Page'
      });
    }

    // Console log for debugging
    console.log('Conversion tracked:', email);
  }

  // Add shake animation to CSS (if not already present)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
  `;
  document.head.appendChild(style);

})();
