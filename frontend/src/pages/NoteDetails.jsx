import { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import { ShoppingCart, Tags, ChevronLeft, BookOpen, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getNoteById, createOrder, verifyPayment, claimFreeNote, checkPurchase, getNoteFileUrl } from "../api/apis";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const NoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isOwned, setIsOwned] = useState(false);
  const [openingFile, setOpeningFile] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      setFetching(true);
      try {
        const data = await getNoteById(id);
        setNote(data.note);

        if (isAuthenticated) {
          try {
            const res = await checkPurchase(id);
            setIsOwned(res.hasPurchased);
          } catch {
            setIsOwned(false);
          }
        }
      } catch {
        toast.error("Failed to load note");
      } finally {
        setFetching(false);
      }
    };
    fetchNote();
  }, [id, isAuthenticated]);

  const isFree = note?.price === 0;
  const isOwnNote = user && note?.uploadedBy?._id === user._id;

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
        setIsOwned(true);
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
            setIsOwned(true);
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
      if (msg.toLowerCase().includes("already")) {
        setIsOwned(true);
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

  const handleOpenNote = async () => {
    setOpeningFile(true);
    try {
      const data = await getNoteFileUrl(note._id);
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not open file");
    } finally {
      setOpeningFile(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <span className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-gray-500">Note not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ChevronLeft
            size={26}
            onClick={() => navigate(-1)}
            className="cursor-pointer bg-gray-200 p-1 rounded-lg hover:bg-gray-300"
          />
          <h4 className="text-xl md:text-2xl font-semibold text-gray-900">
            Note Details
          </h4>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          {/* Thumbnail */}
          <div className="md:w-[420px] w-full shrink-0">
            <img
              src={note.thumbnail}
              alt={note.title}
              className="h-[250px] md:h-[500px] w-full object-cover rounded-lg border"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/420x500?text=No+Preview";
              }}
            />
          </div>

          {/* Details */}
          <div className="flex-1 p-6 border-2 border-dashed rounded-lg flex flex-col gap-4 bg-white">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              {note.title}
            </h1>

            {note.uploadedBy?.userName && (
              <p className="text-sm text-gray-400">by {note.uploadedBy.userName}</p>
            )}

            <p className="text-gray-600">{note.description}</p>

            <div className="flex flex-wrap gap-1">
              {(note.tags || []).map((tag) => (
                <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {note.subject && (
              <div className="flex items-center gap-2 text-gray-700">
                <Tags size={16} />
                <span>{note.subject}</span>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <span className="text-2xl font-bold text-gray-900">
                {isFree ? <span className="text-green-600">Free</span> : `₹${note.price}`}
              </span>

              {isOwnNote ? (
                <span className="text-sm text-gray-400 italic px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  Your note
                </span>
              ) : isOwned ? (
                <button
                  onClick={handleOpenNote}
                  disabled={openingFile}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-60"
                >
                  {openingFile ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ExternalLink size={16} />
                  )}
                  Open Note
                </button>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg transition disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart size={16} />
                  )}
                  {isFree ? "Get Free" : "Buy Now"}
                </button>
              )}
            </div>

            {isOwned && (
              <p className="text-xs text-gray-400 text-right">
                Link expires after 5 min · non-shareable
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetails;