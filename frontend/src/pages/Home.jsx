import React from "react";
import Navbar from "../components/layout/Navbar";
import { notes } from "../mock/notes";
import NoteCard from "../components/cards/NoteCard";


const Home = () => {
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
              key={note.id} 
              note={note} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
