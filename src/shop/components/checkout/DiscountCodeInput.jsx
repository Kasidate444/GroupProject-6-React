import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { validateDiscountCodeFormat } from './validation.js';
import { ERROR_MESSAGES } from './constants.js';

/**
 * DiscountCodeInput component
 * Allows users to enter and apply discount codes to their order
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onApply - Callback when discount code is applied successfully
 * @param {Function} props.onRemove - Callback when discount code is removed
 * @param {number} props.discountAmount - Current discount amount (0 if none applied)
 * @param {string} props.appliedCode - Currently applied discount code (empty if none)
 * @returns {JSX.Element} DiscountCodeInput component
 */
export default function DiscountCodeInput({
  onApply,
  onRemove,
  discountAmount = 0,
  appliedCode = '',
}) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles discount code input change
   */
  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  }, [error]);

  /**
   * Handles applying the discount code
   */
  const handleApply = useCallback(async () => {
    // Validate format
    const formatValidation = validateDiscountCodeFormat(inputValue);
    if (!formatValidation.isValid) {
      setError(formatValidation.error);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call to validate and apply discount code
      // In a real application, this would call a backend API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock discount database - in real app, this comes from backend
      const mockDiscounts = {
        'SAVE10': { type: 'percentage', value: 10 },
        'SAVE20': { type: 'percentage', value: 20 },
        'FLAT5': { type: 'fixed', value: 5 },
        'FLAT10': { type: 'fixed', value: 10 },
      };

      const code = inputValue.trim().toUpperCase();
      const discount = mockDiscounts[code];

      if (!discount) {
        setError(ERROR_MESSAGES.DISCOUNT_CODE_NOT_FOUND);
        setIsLoading(false);
        return;
      }

      // Call the onApply callback with discount details
      onApply(code, discount.type, discount.value);
      setInputValue('');
      setError('');
    } catch {
      setError(ERROR_MESSAGES.ORDER_SUBMISSION_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, onApply]);

  /**
   * Handles removing the applied discount code
   */
  const handleRemove = useCallback(() => {
    setInputValue('');
    setError('');
    onRemove();
  }, [onRemove]);

  /**
   * Handles Enter key press in input field
   */
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleApply();
    }
  }, [handleApply, isLoading]);

  return (
    <div className="space-y-3">
      {/* Discount Code Input Section */}
      {!appliedCode ? (
        <div className="space-y-2">
          <label htmlFor="discount-code" className="block text-sm font-medium text-white/90">
            Discount Code
          </label>
          <div className="flex gap-2">
            <input
              id="discount-code"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter discount code"
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/35 disabled:bg-white/5 disabled:cursor-not-allowed text-sm bg-white/5 text-white placeholder:text-white/30"
              aria-label="Discount code input"
              aria-describedby={error ? 'discount-error' : undefined}
            />
            <button
              onClick={handleApply}
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2 bg-white text-[#0c1428] rounded-md hover:bg-white/90 disabled:bg-white/20 disabled:cursor-not-allowed font-medium text-sm transition-colors"
              aria-label="Apply discount code"
            >
              {isLoading ? 'Applying...' : 'Apply'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              id="discount-error"
              className="text-red-400 text-sm flex items-center gap-1"
              role="alert"
            >
              <span className="font-medium">✕</span>
              {error}
            </div>
          )}
        </div>
      ) : (
        /* Applied Discount Display */
        <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-medium">✓</span>
              <div>
                <p className="text-sm font-medium text-white">
                  Discount Code Applied
                </p>
                <p className="text-xs text-white/60">
                  Code: <span className="font-mono font-semibold">{appliedCode}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="text-white/40 hover:text-white/70 font-medium text-sm"
              aria-label="Remove discount code"
            >
              Remove
            </button>
          </div>
          {discountAmount > 0 && (
            <div className="text-sm text-green-300 font-medium">
              Discount: -${discountAmount.toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

DiscountCodeInput.propTypes = {
  onApply: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  discountAmount: PropTypes.number,
  appliedCode: PropTypes.string,
};
