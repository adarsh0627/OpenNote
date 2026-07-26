import { useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { getNoteFileUrl } from "../../api/apis";
import toast from "react-hot-toast";

const PurchasedNoteCard = ({ note }) => {
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    if (!note?._id) return;
    setLoading(true);
    try {
      const data = await getNoteFileUrl(note._id);
      const response = await fetch(data.url);
      if (!response.ok) {
        toast.error("File not found. The uploader may need to re-upload this note.");
        return;
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      toast.error("Could not open file. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!note) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col shadow-sm">
      <img
        src={note.thumbnail}
        alt={note.title}
        className="h-[180px] w-full object-cover rounded-t-xl"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/260x180?text=No+Preview";
        }}
      />

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex flex-wrap gap-1">
          {(note.tags || []).slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
              {tag}
            </span>
          ))}
        </div>

        <h4 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {note.title}
        </h4>

        {note.uploadedBy?.userName && (
          <p className="text-xs text-gray-400">by {note.uploadedBy.userName}</p>
        )}

        <button
          onClick={handleOpen}
          disabled={loading}
          className="mt-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-60"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ExternalLink size={14} />
              Open Note
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          Secure access · non-shareable
        </p>
      </div>
    </div>
  );
};

export default PurchasedNoteCard;