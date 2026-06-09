import { useState, useCallback } from "react";
import Footer from "../../components/common/Footer";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCollection } from "../context/CollectionContext";
import { PAYMENT_METHODS } from "../components/checkout/constants.js";
import { calculateDiscountAmount, roundToTwoDecimals } from "../components/checkout/calculations.js";
import { FIXED_SHIPPING_THB } from "../data/constants.js";
import { getMerchWithLiveStock } from "../data/stockService.js";
import CartDisplay from "../components/checkout/CartDisplay.jsx";
import ShippingForm from "../components/checkout/ShippingForm.jsx";
import PaymentMethodSelector from "../components/checkout/PaymentMethodSelector.jsx";
import CreditCardForm from "../components/checkout/CreditCardForm.jsx";
import QRPromptPayDisplay from "../components/checkout/QRPromptPayDisplay.jsx";
import DiscountCodeInput from "../components/checkout/DiscountCodeInput.jsx";
import OrderSummary from "../components/checkout/OrderSummary.jsx";
import OrderSubmissionProcessor from "../components/checkout/OrderSubmissionProcessor.jsx";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { addToCollection } = useCollection();
  const navigate = useNavigate();

  // แปลง cart items จาก CartContext format → checkout format
  const [cartItems, setCartItems] = useState(() =>
    items.map((item) => {
      let isOutOfStock = false;
      if (item.type === "merch") {
        const merchDetail = getMerchWithLiveStock(item.product_id);
        if (merchDetail) {
          if (item.variant_id) {
            const v = merchDetail.variants.find((v) => v.variant_id === item.variant_id);
            isOutOfStock = !v || v.stock_quantity === 0;
          } else {
            isOutOfStock = merchDetail.variants.every((v) => v.stock_quantity === 0);
          }
        }
      }
      return {
        id: item.key,
        productId: item.product_id,
        variantId: item.variant_id || null,
        name: item.title_snapshot,
        artist: item.artist_name_snapshot,
        image: item.cover_url || `https://via.placeholder.com/200x200/1a1a1a/ffffff?text=${encodeURIComponent(item.title_snapshot)}`,
        unitPrice: item.unit_price,
        quantity: item.quantity,
        type: item.type === "merch" ? "merchandise" : "digital",
        isOutOfStock,
      };
    })
  );

  const [shippingInfo, setShippingInfo] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS.CREDIT_CARD);
  const [creditCardDetails, setCreditCardDetails] = useState(null);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("");
  const [discountType, setDiscountType] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);

  const cartSubtotal = roundToTwoDecimals(
    cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  );
  const discountAmount = discountType
    ? roundToTwoDecimals(calculateDiscountAmount(cartSubtotal, discountType, discountValue))
    : 0;
  const hasMerch = cartItems.some((item) => item.type === "merchandise");
  const shippingFee = hasMerch ? FIXED_SHIPPING_THB : 0;

  const handleQuantityChange = useCallback((itemId, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) => item.id === itemId ? { ...item, quantity: newQuantity } : item)
    );
  }, []);

  const handleRemoveItem = useCallback((itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const handleShippingSubmit = useCallback((data) => {
    setShippingInfo(data);
  }, []);

  const handleDiscountApply = useCallback((code, type, value) => {
    setAppliedDiscountCode(code);
    setDiscountType(type);
    setDiscountValue(value);
  }, []);

  const handleDiscountRemove = useCallback(() => {
    setAppliedDiscountCode("");
    setDiscountType(null);
    setDiscountValue(0);
  }, []);

  const handleOrderSuccess = useCallback((submittedOrder) => {
    if (submittedOrder?.items) {
      addToCollection(submittedOrder.items.map((i) => i.productId));
    }
    const createdAt = new Date(submittedOrder.createdAt);
    const orderData = {
      orderId: submittedOrder.id,
      purchaseDate: createdAt.toISOString(),
      purchaseTime: createdAt.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      paymentMethod:
        selectedPaymentMethod === PAYMENT_METHODS.QR_PROMPTPAY
          ? "QR PromptPay"
          : "Credit Card",
      items: submittedOrder.items,
      shippingAddress: submittedOrder.shipping,
      subtotal: submittedOrder.subtotal,
      discountAmount: submittedOrder.discountAmount,
      shipping: shippingFee,
      tax: 0,
      total: submittedOrder.total,
      confirmationEmail: submittedOrder.shipping?.email,
    };
    clearCart();
    navigate("/order-confirmed", { state: { orderData } });
  }, [clearCart, navigate, addToCollection, selectedPaymentMethod, shippingFee]);

  const paymentDetails =
    selectedPaymentMethod === PAYMENT_METHODS.CREDIT_CARD
      ? creditCardDetails
      : { method: PAYMENT_METHODS.QR_PROMPTPAY };

  return (
    <div className="min-h-screen bg-[#0c1428] font-['Plus_Jakarta_Sans',sans-serif]">
      <main className="max-w-6xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
        <p className="text-white/40 text-sm">Complete your purchase</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          {/* Left: Cart + Shipping + Payment */}
          <div className="lg:col-span-2 space-y-5">
            <section aria-label="Shopping cart" className="rounded-2xl border border-white/10 bg-[#162040] p-6">
              <h2 className="text-[15px] font-semibold uppercase tracking-widest text-white/40 mb-5">Cart</h2>
              <CartDisplay
                cartItems={cartItems}
                onQuantityChange={handleQuantityChange}
                onRemoveItem={handleRemoveItem}
              />
            </section>

            {hasMerch && (
              <section className="rounded-2xl border border-white/10 bg-[#162040] p-6">
                <h2 className="text-[15px] font-semibold uppercase tracking-widest text-white/40 mb-5">Shipping</h2>
                <ShippingForm onSubmit={handleShippingSubmit} />
              </section>
            )}

            <section className="rounded-2xl border border-white/10 bg-[#162040] p-6">
              <h2 className="text-[15px] font-semibold uppercase tracking-widest text-white/40 mb-5">Payment</h2>
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={setSelectedPaymentMethod}
              />
              <CreditCardForm
                isVisible={selectedPaymentMethod === PAYMENT_METHODS.CREDIT_CARD}
                onPaymentDetailsChange={setCreditCardDetails}
              />
              <QRPromptPayDisplay
                isVisible={selectedPaymentMethod === PAYMENT_METHODS.QR_PROMPTPAY}
              />
            </section>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="space-y-5 lg:sticky lg:top-24">
              <section className="rounded-2xl border border-white/10 bg-[#162040] p-6">
                <h2 className="text-[15px] font-semibold uppercase tracking-widest text-white/40 mb-5">Discount</h2>
                <DiscountCodeInput
                  onApply={handleDiscountApply}
                  onRemove={handleDiscountRemove}
                  discountAmount={discountAmount}
                  appliedCode={appliedDiscountCode}
                />
              </section>

              <section className="rounded-2xl border border-white/10 bg-[#162040] p-6">
                <OrderSummary
                  cartItems={cartItems}
                  discountAmount={discountAmount}
                  selectedPaymentMethod={selectedPaymentMethod}
                  shippingFee={shippingFee}
                />
              </section>

              <section>
                <OrderSubmissionProcessor
                  cartItems={cartItems}
                  shippingInformation={shippingInfo}
                  paymentDetails={paymentDetails}
                  discountCode={appliedDiscountCode}
                  discountAmount={discountAmount}
                  shippingFee={shippingFee}
                  requiresShipping={hasMerch}
                  onSubmitSuccess={handleOrderSuccess}
                />
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer simple />
    </div>
  );
}
