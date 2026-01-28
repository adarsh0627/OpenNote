import React, { useRef, useState } from 'react'
import Navbar from '../components/layout/Navbar'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  const submitHandler = (e) => {
    e.preventDefault();

    console.log({
      title,
      description,
      tags,
      price,
      thumbnail,
      file,
    });

    setTitle('');
    setDescription('');
    setTags('');
    setPrice('');
    setThumbnail('');
    fileRef.current.value = null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar/>
      <div className="px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <ChevronLeft
            size={26}
            onClick={() => navigate(-1)}
            className="cursor-pointer bg-gray-200 p-1 rounded-lg hover:bg-gray-300"
          />
          <h4 className="text-2xl font-semibold text-gray-900">
            Upload Your Content
          </h4>
        </div>
        <div className='flex justify-center'>
          <form onSubmit={submitHandler} className="bg-white rounded-xl m-5 border-2 border-dashed flex flex-col  gap-3 p-5 w-full max-w-xl">
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-medium text-lg">Title : </label>
              <input
                type="text"
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter title here"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-medium text-lg">Description : </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this content covers"
                className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-medium text-lg">Tags : </label>
              <input
                type="text"
                required
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: engineering, medical, commerce etc."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-medium text-lg">Price : </label>
              <input
                type="number"
                value={price}
                required
                min={0}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter price in ₹"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-medium text-lg">Thumbnail : </label>
              <input
                type="url"
                required
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter thumbnail url here"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gray-700 font-medium text-lg">Select file : </label>
              <input
                type="file"
                ref={fileRef}
                required
                accept='.pdf'
                onChange={(e) => setFile(e.target.files[0])}
                className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter title here"
              />
            </div>
            <button type='submit' className="bg-indigo-600 hover:bg-indigo-700 transition p-3 rounded-lg text-lg font-semibold text-white">
              Upload
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Upload