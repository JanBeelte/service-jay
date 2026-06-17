import { CheckCircle, X, Ban } from "lucide-react";
import { useOrderStore } from "../../store/orderStore";

export function FulfilledBanner() {
  const { orders, newlyFulfilledIds, dismissFulfilled } = useOrderStore();

  if (newlyFulfilledIds.length === 0) return null;

  const orderId = newlyFulfilledIds[0];
  const order = orders[orderId];
  if (!order) return null;

  const isUnavailable = order.status === "unavailable";

  function dismiss() {
    dismissFulfilled(orderId);
    if (typeof navigator !== "undefined" && "clearAppBadge" in navigator) {
      navigator.clearAppBadge?.();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-6 pointer-events-none">
      <div
        className={`pointer-events-auto w-full max-w-sm rounded-2xl p-5 shadow-2xl flex items-start gap-4 ${
          isUnavailable ? "bg-red-500" : "bg-green-500"
        }`}
      >
        {isUnavailable ? (
          <Ban className="w-7 h-7 text-white shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="w-7 h-7 text-white shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          {isUnavailable ? (
            <>
              <p className="font-bold text-white text-lg">Sorry, item unavailable</p>
              <p className="text-red-100 text-sm mt-0.5">
                {order.quantity}× {order.drinkName} is out of stock
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-white text-lg">Your order is ready! 🎉</p>
              <p className="text-green-100 text-sm mt-0.5">
                {order.quantity}× {order.drinkName} — please collect at the bar
              </p>
            </>
          )}
        </div>
        <button onClick={dismiss} className="text-white/70 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
