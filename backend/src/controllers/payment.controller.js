const {
  createOrder,
  verifyAndSavePurchase,
  claimFreeNote,
} = require("../services/payment.service");

const clientErrors = ["already purchased", "not found", "free notes", "already have", "not free", "signature mismatch"];

const isClientError = (msg) => msg && clientErrors.some((e) => msg.toLowerCase().includes(e));

exports.createOrderController = async (req, res, next) => {
  try {
    const { noteId } = req.body;
    if (!noteId) {
      return res.status(400).json({ success: false, message: "noteId is required" });
    }
    const data = await createOrder(noteId, req.user.id);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    const msg = error?.message || "Failed to create order";
    if (isClientError(msg)) {
      return res.status(400).json({ success: false, message: msg });
    }
    next(error);
  }
};

exports.verifyPaymentController = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, noteId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !noteId) {
      return res.status(400).json({ success: false, message: "Missing required payment fields" });
    }

    const purchase = await verifyAndSavePurchase({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      noteId,
      userId: req.user.id,
    });

    res.status(200).json({ success: true, message: "Payment verified successfully", purchase });
  } catch (error) {
    const msg = error?.message || "Payment verification failed";
    if (isClientError(msg)) {
      return res.status(400).json({ success: false, message: msg });
    }
    next(error);
  }
};

exports.claimFreeNoteController = async (req, res, next) => {
  try {
    const { noteId } = req.body;
    if (!noteId) {
      return res.status(400).json({ success: false, message: "noteId is required" });
    }
    const purchase = await claimFreeNote(noteId, req.user.id);
    res.status(201).json({ success: true, message: "Note added to your library", purchase });
  } catch (error) {
    const msg = error?.message || "Failed to claim note";
    if (isClientError(msg)) {
      return res.status(400).json({ success: false, message: msg });
    }
    next(error);
  }
};