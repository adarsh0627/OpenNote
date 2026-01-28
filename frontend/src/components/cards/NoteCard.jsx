import React from "react";
import { ShoppingCart, Heart, Eye, Tags } from "lucide-react";
import { Link } from "react-router-dom";

const NoteCard = ({ note }) => {

  return (
    <div 
        className="bg-white border border-gray-200 relative w-[260px] rounded-xl flex flex-col"
    >
      
      <Link to={`/note/${note.id}`}>
        <img
          src={note.thumbnail}
          alt={note.title}
          className="h-[180px] w-full object-cover rounded-t-xl"
        />
      </Link>

      <Heart className="absolute right-2 top-2 text-red-400 bg-white p-1 rounded-full shadow" />

      <div className="p-3 flex flex-col gap-2">
        <h4 className="text-base font-semibold text-gray-900">
          {note.title}
        </h4>

        <p className="text-gray-600 text-xs">
          {note.description}
        </p>

        <div className="flex gap-1 items-center text-xs text-gray-700">
          <Tags size={14} />
          <span>{note.subject}</span>
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className="text-lg font-semibold text-gray-900">
            ₹{note.price}
          </span>

          <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <ShoppingCart size={18} className="text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
