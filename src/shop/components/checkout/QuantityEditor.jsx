import PropTypes from 'prop-types';

const MAX_CART_QUANTITY = 9999;

/**
 * QuantityEditor Component
 * 
 * Provides increment and decrement buttons to adjust item quantity.
 * Automatically removes the item when quantity reaches 0.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.itemId - Unique identifier for the cart item
 * @param {number} props.currentQuantity - Current quantity of the item
 * @param {string} props.itemName - Name of the item (for accessibility labels)
 * @param {Function} props.onIncrement - Callback when increment button is clicked
 * @param {Function} props.onDecrement - Callback when decrement button is clicked
 * @param {Function} props.onRemove - Callback when item should be removed (quantity reaches 0)
 * @returns {React.ReactElement} The rendered quantity editor
 */
export default function QuantityEditor({
  itemId,
  currentQuantity,
  itemName,
  onIncrement,
  onDecrement,
  onRemove,
}) {
  const handleDecrement = () => {
    if (currentQuantity <= 1) {
      // Auto-remove item when quantity reaches 0
      onRemove?.(itemId);
    } else {
      onDecrement?.(itemId, currentQuantity - 1);
    }
  };

  const handleIncrement = () => {
    if (currentQuantity >= MAX_CART_QUANTITY) return;
    onIncrement?.(itemId, currentQuantity + 1);
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-md">
      <button
        onClick={handleDecrement}
        className="px-3 py-2 text-white/60 hover:bg-white/10 transition-colors"
        aria-label={`Decrease quantity for ${itemName}`}
        title="Decrease quantity"
      >
        −
      </button>
      <span className="px-4 py-2 text-center min-w-12 text-white font-medium">
        {currentQuantity}
      </span>
      <button
        onClick={handleIncrement}
        disabled={currentQuantity >= MAX_CART_QUANTITY}
        className="px-3 py-2 text-white/60 hover:bg-white/10 transition-colors disabled:cursor-not-allowed disabled:opacity-35"
        aria-label={`Increase quantity for ${itemName}`}
        title="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

QuantityEditor.propTypes = {
  itemId: PropTypes.string.isRequired,
  currentQuantity: PropTypes.number.isRequired,
  itemName: PropTypes.string.isRequired,
  onIncrement: PropTypes.func,
  onDecrement: PropTypes.func,
  onRemove: PropTypes.func,
};
