import React, { useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import NoteCard from "../components/cards/NoteCard";
import { getAllNotes, getMyPurchases } from "../api/apis";
import { useAuth } from "../context/AuthContext";


const Home = () => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [purchasedNoteIds, setPurchasedNoteIds] = useState(new Set());

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await getAllNotes();
      setNotes(data.notes);
    };
    fetchNotes();
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setPurchasedNoteIds(new Set());
      return;
    }
    const fetchPurchases = async () => {
      try {
        const data = await getMyPurchases();
        const ids = (data.purchases || []).map((p) => p.note?._id || p.note);
        setPurchasedNoteIds(new Set(ids));
      } catch {
        setPurchasedNoteIds(new Set());
      }
    };
    fetchPurchases();
  }, [isAuthenticated])

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="px-8 py-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Available Notes & Books
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              purchasedNoteIds={purchasedNoteIds}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;