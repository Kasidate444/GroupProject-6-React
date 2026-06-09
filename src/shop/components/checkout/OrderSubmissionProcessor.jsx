import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { deductStock } from '../../data/stockService.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, PAYMENT_METHODS, ORDER_STATUS } from './constants.js';
import { validateShippingInformation, validateCreditCardDetails } from './validation.js';
import { calculateCartSubtotal, calculateDiscountAmount, calculateOrderTotal, roundToTwoDecimals } from './calculations.js';

/**
 * OrderSubmissionProcessor Component
 *
 * Manages the complete order submission flow including form validation,
 * submit button state, submission handling, success/error states,
 * and recovery.
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */
export default function OrderSubmissionProcessor({
  cartItems,
  shippingInformation,
  paymentDetails,
  discountCode,
  discountAmount,
  shippingFee = 0,
  requiresShipping = false,
  onSubmitSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

  /**
   * Check if all required fields are complete for submission
   */
  const getMissingFields = useCallback(() => {
    const missing = [];

    // Check cart
    if (!cartItems || cartItems.length === 0) {
      missing.push('Cart is empty');
    }

    // Check out-of-stock items
    const outOfStockItems = cartItems?.filter((item) => item.isOutOfStock) || [];
    if (outOfStockItems.length > 0) {
      missing.push(`Remove out-of-stock item${outOfStockItems.length > 1 ? 's' : ''}: ${outOfStockItems.map((i) => i.name).join(', ')}`);
    }

    // Check shipping (only required when cart has physical merch)
    if (requiresShipping) {
      if (!shippingInformation) {
        missing.push('Shipping information');
      } else {
        const shippingValidation = validateShippingInformation(shippingInformation);
        if (!shippingValidation.isValid) {
          missing.push('Valid shipping information');
        }
      }
    }

    // Check payment method
    if (!paymentDetails || !paymentDetails.method) {
      missing.push('Payment method');
    } else if (paymentDetails.method === PAYMENT_METHODS.CREDIT_CARD) {
      const ccValidation = validateCreditCardDetails(paymentDetails);
      if (!ccValidation.isValid) {
        missing.push('Valid credit card details');
      }
    }

    return missing;
  }, [cartItems, shippingInformation, paymentDetails, requiresShipping]);

  const missingFields = getMissingFields();
  const isFormComplete = missingFields.length === 0;

  /**
   * Validate all form data before submission
   */
  const validateAll = useCallback(() => {
    const errors = [];

    // Cart validation
    if (!cartItems || cartItems.length === 0) {
      errors.push(ERROR_MESSAGES.EMPTY_CART);
    }

    // Shipping validation (only when cart has physical merch)
    if (requiresShipping) {
      if (shippingInformation) {
        const shippingValidation = validateShippingInformation(shippingInformation);
        if (!shippingValidation.isValid) {
          Object.values(shippingValidation.errors).forEach((error) => errors.push(error));
        }
      } else {
        errors.push('Shipping information is required');
      }
    }

    // Payment validation
    if (!paymentDetails || !paymentDetails.method) {
      errors.push(ERROR_MESSAGES.PAYMENT_METHOD_REQUIRED);
    } else if (paymentDetails.method === PAYMENT_METHODS.CREDIT_CARD) {
      const ccValidation = validateCreditCardDetails(paymentDetails);
      if (!ccValidation.isValid) {
        Object.values(ccValidation.errors).forEach((error) => errors.push(error));
      }
    }

    return errors;
  }, [cartItems, shippingInformation, paymentDetails, requiresShipping]);

  /**
   * Handle order submission
   */
  const handleSubmit = useCallback(async () => {
    // Validate all data
    const validationErrors = validateAll();
    if (validationErrors.length > 0) {
      setSubmitError(validationErrors.join('. '));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Calculate order totals
      const subtotal = roundToTwoDecimals(calculateCartSubtotal(cartItems));
      const total = roundToTwoDecimals(calculateOrderTotal(subtotal, discountAmount) + shippingFee);

      // Build order object
      const order = {
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        items: cartItems,
        shipping: shippingInformation,
        payment: paymentDetails,
        subtotal,
        discountCode: discountCode || null,
        discountAmount,
        total,
        status: ORDER_STATUS.PENDING,
        createdAt: Date.now(),
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      deductStock(cartItems);

      // Simulate successful order creation
      const submittedOrder = {
        ...order,
        status: ORDER_STATUS.PROCESSING,
      };

      setOrderId(submittedOrder.id);
      setOrderComplete(true);
      setIsSubmitting(false);

      if (onSubmitSuccess) {
        onSubmitSuccess(submittedOrder);
      }
    } catch (error) {
      setSubmitError(ERROR_MESSAGES.ORDER_SUBMISSION_ERROR);
      setIsSubmitting(false);
    }
  }, [cartItems, shippingInformation, paymentDetails, discountCode, discountAmount, shippingFee, validateAll, onSubmitSuccess]);

  // Success state
  if (orderComplete) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 text-center">
        <div className="text-green-400 text-4xl mb-4">✓</div>
        <h3 className="text-xl font-bold text-green-800 mb-2">
          {SUCCESS_MESSAGES.ORDER_SUBMITTED}
        </h3>
        <p className="text-green-300 mb-2">Order ID: <strong>{orderId}</strong></p>
        <p className="text-sm text-green-400">
          You will receive a confirmation email shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Missing fields message */}
      {!isFormComplete && missingFields.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-medium text-yellow-300 mb-2">
            Please complete the following to place your order:
          </p>
          <ul className="text-sm text-white/60 list-disc list-inside space-y-1">
            {missingFields.map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Error message */}
      {submitError && (
        <div className="bg-red-500/10 border border-red-200 rounded-lg p-4" role="alert">
          <p className="text-sm text-red-300">
            <strong>Error:</strong> {submitError}
          </p>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!isFormComplete || isSubmitting}
        className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors min-h-[44px] ${
          isFormComplete && !isSubmitting
            ? 'bg-accent text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 cursor-pointer'
            : 'bg-white/20 text-white/40 cursor-not-allowed'
        }`}
        aria-label={isSubmitting ? 'Submitting order...' : 'Place order'}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          'Place Order'
        )}
      </button>
    </div>
  );
}

OrderSubmissionProcessor.propTypes = {
  cartItems: PropTypes.array.isRequired,
  shippingInformation: PropTypes.object,
  paymentDetails: PropTypes.object,
  discountCode: PropTypes.string,
  discountAmount: PropTypes.number,
  shippingFee: PropTypes.number,
  requiresShipping: PropTypes.bool,
  onSubmitSuccess: PropTypes.func,
};

OrderSubmissionProcessor.defaultProps = {
  shippingInformation: null,
  paymentDetails: null,
  discountCode: '',
  discountAmount: 0,
  shippingFee: 0,
  requiresShipping: false,
  onSubmitSuccess: null,
};
