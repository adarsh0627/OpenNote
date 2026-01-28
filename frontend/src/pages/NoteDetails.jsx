import React from "react";
import Navbar from "../components/layout/Navbar";
import { ShoppingCart, Tags, ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { notes } from "../mock/notes";

const NoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const note = notes.find((n) => n.id === id);

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Note not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <ChevronLeft
            size={26}
            onClick={() => navigate(-1)}
            className="cursor-pointer bg-gray-200 p-1 rounded-lg hover:bg-gray-300"
          />
          <h4 className="text-2xl font-semibold text-gray-900">
            Note Detail Page
          </h4>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-[420px] w-full">
            <img
              src={note.thumbnail}
              alt={note.title}
              className="h-[400px] md:h-[500px] w-full object-cover rounded-lg border"
            />
          </div>
          <div className="flex-1 p-6 border-2 border-dashed rounded-lg flex flex-col gap-4 bg-white">
            <h1 className="text-3xl font-semibold text-gray-900">
              {note.title}
            </h1>

            <p className="text-gray-600">
              {note.description}
            </p>

            <div className="flex items-center gap-2 text-gray-700">
              <Tags size={16} />
              <span>{note.subject}</span>
            </div>

            <div className="flex justify-between items-center mt-6">
              <span className="text-2xl font-bold text-gray-900">
                ₹{note.price}
              </span>

              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition">
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              * Preview not available in this version.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetails;
