import React, { useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { users } from '../mock/users'

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [education, setEducation] = useState('');

  useEffect(() => {
    if(user) {
      setName(user.name || '');
      setMobileNo(user.mobileNo || '');
      setEducation(user.education || '');
    }
  }, [user])

  const profileFormHandler = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      name,
      mobileNo,
      education,
    };
    setUser(updatedUser);
    console.log("Profile Updated", updatedUser);
  }

  useEffect(() => {
    setUser(users[0])
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
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
            Your Dashboard
          </h4>
        </div>

        <div className='flex flex-col md:flex-row gap-10'>
          <fieldset className="fieldset bg-white border-dashed rounded-xl lg:w-1/2 w-full max-w-xl border-2 p-4 mb-6 self-start">
            <legend className='text-gray-900 text-xl font-semibold'>Profile Info</legend>
            <form onSubmit={profileFormHandler} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-gray-700 font-medium text-lg">Name : </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-700 font-medium text-lg">Email : </label>
                <input
                  type="email"
                  readOnly
                  value={user.email}
                  className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-700 font-medium text-lg">Mobile No : </label>
                <input
                  type="tel"
                  pattern="[0-9]{10}"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  placeholder="Enter your mobile no."
                  className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-700 font-medium text-lg">Education : </label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="Enter highest education"
                  className="bg-gray-50 border border-gray-200 p-2 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button type='submit' className="bg-indigo-600 hover:bg-indigo-700 transition p-3 rounded-lg text-lg font-semibold text-white">
                Save Changes
              </button>
            </form>
          </fieldset>
          <fieldset className="fieldset bg-white border-dashed rounded-xl lg:w-1/2 w-full max-w-xl border-2 p-4 flex flex-col gap-5 self-start">
            <legend className='text-gray-900 text-xl font-semibold'>Stats</legend>
            <div className="flex justify-between items-center border border-gray-200 rounded-lg p-3 bg-gray-50">
              <span className="text-gray-700 font-medium">Total Uploads</span>
              <span className="font-semibold">{user.totalUploads}</span>
            </div>

            <div className="flex justify-between items-center border border-gray-200 rounded-lg p-3 bg-gray-50">
              <span className="text-gray-700 font-medium">Total Earning</span>
              <span className="font-semibold text-indigo-600">₹{user.totalEarnings}</span>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  )
}

export default Dashboard