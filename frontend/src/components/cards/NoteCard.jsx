import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, BookOpen } from "lucide-react";
import { createOrder, verifyPayment, claimFreeNote } from "../../api/apis";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const NoteCard = ({ note, purchasedNoteIds = new Set() }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const isFree = note.price === 0;
  const isOwned = purchasedNoteIds.has(note._id);
  const isOwnNote = user && note.uploadedBy?._id === user._id;

  const handleBuy = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to continue");
      navigate("/sign-in");
      return;
    }

    if (isOwnNote) {
      toast("You can't buy your own note", {
        icon: "🚫",
        style: { background: "#fef2f2", color: "#dc2626" },
      });
      return;
    }

    if (isOwned) {
      toast("You already own this note 📚", {
        icon: "📚",
        style: { background: "#eef2ff", color: "#4338ca" },
      });
      return;
    }

    setLoading(true);
    try {
      if (isFree) {
        await claimFreeNote(note._id);
        toast.success("Added to your library!");
        setLoading(false);
        return;
      }

      const { order, key } = await createOrder(note._id);

      const options = {
        key,
        amount: order.amount,
        currency: "INR",
        name: "OpenNote",
        description: note.title,
        order_id: order.id,
        theme: { color: "#4f46e5" },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              noteId: note._id,
            });
            toast.success("Purchase successful! Note unlocked 🎉");
            navigate("/purchases");
          } catch {
            toast.error("Payment verification failed. Contact support.");
          } finally {
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      if (
        msg.toLowerCase().includes("already purchased") ||
        msg.toLowerCase().includes("already have")
      ) {
        toast("You already own this note 📚", {
          icon: "📚",
          style: { background: "#eef2ff", color: "#4338ca" },
        });
      } else {
        toast.error(msg);
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow group">
      <Link to={`/note/${note._id}`} className="block overflow-hidden">
        <img
          src={note.thumbnail}
          alt={note.title}
          className="h-[180px] w-full object-cover rounded-t-xl"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/260x180?text=No+Preview";
          }}
        />
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex flex-wrap gap-1">
          {(note.tags || []).slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link to={`/note/${note._id}`}>
          <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-indigo-600 transition">
            {note.title}
          </h4>
        </Link>

        {note.uploadedBy?.userName && (
          <p className="text-xs text-gray-400">by {note.uploadedBy.userName}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <span className="text-base font-bold text-gray-900">
            {isFree ? (
              <span className="text-green-600">Free</span>
            ) : (
              `₹${note.price}`
            )}
          </span>

          {isOwnNote ? (
            <span className="text-xs text-gray-400 italic px-3 py-2 bg-gray-50 rounded-lg">
              Your note
            </span>
          ) : isOwned ? (
            <Link
              to="/purchases"
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition"
            >
              <BookOpen size={14} />
              Owned
            </Link>
          ) : (
            <button
              onClick={handleBuy}
              disabled={loading}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-60"
            >
              <ShoppingBag size={13} />
              {loading ? "..." : isFree ? "Get Free" : "Buy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;