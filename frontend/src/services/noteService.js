import { notes } from "../mock/notes";

export const getAllNotes = async () => {
  return notes;
};

export const getNoteById = async (id) => {
  return notes.find((note) => note.id === id);
};
