const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { event } = req.body;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'sar',
            product_data: {
              name: event.title,
            },
            unit_amount: event.price * 100, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // التعديل هنا يا سمسم: ضفنا {CHECKOUT_SESSION_ID}
      // Stripe هيدور على الكلمة دي ويبدلها أوتوماتيك برقم الجلسة
      success_url: `${process.env.FRONTEND_URL}/payment-success?eventId=${event._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/event-details/${event._id}`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    res.status(500).json({ message: "Failed to create payment session" });
  }
});

module.exports = router;