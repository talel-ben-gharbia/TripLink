import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Users,
  MessageSquare,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Clock,
  ShieldCheck,
  Info,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import {
  createBooking,
  checkRouting,
  createCheckoutSession,
} from "../services/bookingService";
import ProgressIndicator from "./ProgressIndicator";
import { useErrorToast } from "./ErrorToast";

const BookingModal = ({ isOpen, onClose, destination, onBookingComplete }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Review, 3: Payment, 4: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routing, setRouting] = useState(null);
  const [booking, setBooking] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const { showToast, ToastContainer } = useErrorToast();

  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
    specialRequests: "",
    contactEmail: "",
    contactPhone: "",
    requestAgent: false,
  });

  useEffect(() => {
    if (isOpen && destination) {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setFormData((prev) => ({
            ...prev,
            contactEmail: user.email || "",
            contactPhone: user.phone || "",
          }));
        } catch (e) {}
      }
      // Reset state when modal opens
      setStep(1);
      setError(null);
      setRouting(null);
      setBooking(null);
    }
  }, [isOpen, destination]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckRouting = async () => {
    if (!formData.checkInDate) {
      setError("Please select a check-in date");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const routingData = await checkRouting(destination.id, {
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate || null,
        numberOfGuests: parseInt(formData.numberOfGuests) || 1,
        specialRequests: formData.specialRequests || null,
      });
      setRouting(routingData.routing);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to check routing");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const bookingData = await createBooking({
        destinationId: destination.id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate || null,
        numberOfGuests: parseInt(formData.numberOfGuests) || 1,
        specialRequests: formData.specialRequests || null,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || null,
        requestAgent: formData.requestAgent || routing?.type === "AGENT",
      });

      setBooking(bookingData.booking);

      // Only proceed to payment if it's a DIRECT booking that requires payment
      if (
        bookingData.requiresPayment &&
        bookingData.booking.bookingType === "DIRECT"
      ) {
        // Proceed to payment
        setStep(3);
        // Don't auto-call handlePayment here - let user click the button
      } else {
        // Agent booking - show success immediately (no payment needed)
        setStep(4);
        if (onBookingComplete) {
          onBookingComplete(bookingData.booking);
        }
      }
    } catch (err) {
      console.error('Booking creation error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Failed to create booking. Please try again.";
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    setLoading(true);
    setError(null);

    try {
      // Create Stripe Checkout Session and redirect
      const checkoutData = await createCheckoutSession(booking.id);

      if (checkoutData.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutData.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Payment failed");
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 4) {
      // If on success step, call onBookingComplete
      if (onBookingComplete) {
        onBookingComplete(booking);
      }
    }
    setStep(1);
    setError(null);
    setBooking(null);
    setRouting(null);
    setPaymentIntent(null);
    onClose();
  };

  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 0;
  };

  if (!isOpen || !destination) return null;

  return (
    <>
      <ToastContainer />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Book Your Trip</h2>
              <p className="text-sm text-white/90">
                Secure booking in just a few steps
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
          <ProgressIndicator
            steps={["Details", "Review", "Payment", "Confirm"]}
            currentStep={step - 1}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle
                className="text-red-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              {/* Destination Info */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-100">
                <div className="flex items-start gap-4">
                  {destination.image && (
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-20 h-20 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200";
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 flex items-center gap-1 mb-2">
                      <MapPin size={14} />
                      {destination.city}, {destination.country}
                    </p>
                    {destination.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="font-semibold text-gray-900 ml-1">
                            {destination.rating.toFixed(1)}
                          </span>
                        </div>
                        {destination.priceMin && (
                          <span className="text-purple-600 font-semibold">
                            From ${destination.priceMin}/night
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="text-purple-600" size={16} />
                    Check-in Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="text-purple-600" size={16} />
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleInputChange}
                    min={
                      formData.checkInDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white"
                  />
                  {formData.checkInDate && formData.checkOutDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {calculateNights()} night
                      {calculateNights() !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="text-purple-600" size={16} />
                  Number of Guests <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="numberOfGuests"
                  value={formData.numberOfGuests}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="text-purple-600" size={16} />
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white resize-none"
                  placeholder="Any special requirements, dietary restrictions, accessibility needs, or preferences..."
                />
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="requestAgent"
                    id="requestAgent"
                    checked={formData.requestAgent}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-0.5"
                  />
                  <label
                    htmlFor="requestAgent"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    <span className="font-semibold">
                      I need assistance from a travel agent
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      Our expert agents can help you plan the perfect trip with
                      personalized recommendations and support.
                    </p>
                  </label>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <ShieldCheck className="text-green-600" size={18} />
                <span>Your information is secure and encrypted</span>
              </div>
            </div>
          )}

          {step === 2 && routing && (
            <div className="space-y-6">
              {/* Routing Info */}
              <div
                className={`p-5 rounded-xl border-2 ${
                  routing.type === "DIRECT"
                    ? "bg-green-50 border-green-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {routing.type === "DIRECT" ? (
                    <CheckCircle className="text-green-600 mt-0.5" size={24} />
                  ) : (
                    <Info className="text-blue-600 mt-0.5" size={24} />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">
                      {routing.type === "DIRECT"
                        ? "Direct Booking Available"
                        : "Agent Assistance Recommended"}
                    </h4>
                    <p className="text-sm text-gray-700">{routing.reason}</p>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="text-purple-600" size={20} />
                  Booking Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-semibold text-gray-900">
                      {destination.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(formData.checkInDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  {formData.checkOutDate && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(formData.checkOutDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.numberOfGuests}{" "}
                      {formData.numberOfGuests === 1 ? "guest" : "guests"}
                    </span>
                  </div>
                  {formData.specialRequests && (
                    <div className="pt-2">
                      <span className="text-gray-600 text-sm">
                        Special Requests:
                      </span>
                      <p className="text-sm text-gray-700 mt-1 italic">
                        "{formData.specialRequests}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && booking && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="text-purple-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Complete Your Payment
                </h3>
                <p className="text-gray-600 mb-6">
                  Booking Reference:{" "}
                  <span className="font-mono font-semibold text-purple-600">
                    {booking.bookingReference}
                  </span>
                </p>
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-6">
                  <p className="text-sm opacity-90 mb-2">Total Amount</p>
                  <p className="text-4xl font-bold">${booking.totalPrice}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="text-yellow-600 mt-0.5" size={20} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">
                      Secure Payment Processing
                    </p>
                    <p>
                      You will be redirected to Stripe's secure payment page to
                      complete your transaction. All payments are encrypted and
                      secure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && booking && (
            <div className="text-center space-y-6 py-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Booking Confirmed!
              </h3>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-2">
                  Your Booking Reference
                </p>
                <p className="text-3xl font-bold text-purple-600 font-mono">
                  {booking.bookingReference}
                </p>
              </div>
              <p className="text-gray-600 max-w-md mx-auto">
                {booking.bookingType === "AGENT"
                  ? "Your booking has been submitted! An experienced travel agent will review your booking and confirm it. Once confirmed, you'll be able to complete the payment."
                  : "Your payment has been processed successfully. A confirmation email has been sent to your registered email address."}
              </p>
              {booking.bookingType === "AGENT" && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <Clock className="inline mr-2" size={16} />
                    Expected response time: Within 24 hours. You'll receive a
                    notification once your agent confirms the booking.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          {step > 1 && step < 4 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition font-semibold flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          {step === 1 && (
            <button
              onClick={handleClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition font-semibold"
            >
              Cancel
            </button>
          )}
          <div className="flex-1" />
          {step === 1 && (
            <button
              onClick={handleCheckRouting}
              disabled={loading || !formData.checkInDate}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          )}
          {step === 2 && (
            <button
              onClick={handleCreateBooking}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Booking
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handlePayment}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Proceed to Payment
                </>
              )}
            </button>
          )}
          {step === 4 && (
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition font-semibold shadow-lg"
            >
              View My Bookings
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default BookingModal;
