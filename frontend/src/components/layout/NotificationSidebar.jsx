import { Bell, X } from 'lucide-react'
import React from 'react'

const NotificationSidebar = (props) => {

  return (
    <div className='bg-white fixed right-0 border lg:h-screen rounded-l-lg lg:w-[420px] w-full px-4 py-2 z-50'>
        <div className='flex items-center justify-between mt-2'>
            <div className='flex items-center gap-2'>
                <span className='text-orange-500 bg-gray-100 rounded-lg p-1 border'><Bell size={20}/></span>
                <h1 className='text-gray-900 font-semibold text-xl'>Notifications</h1>
            </div>
            <X 
                className='cursor-pointer'
                onClick={props.closePanelHandler}
            />
        </div>
        <ul className='flex flex-col gap-2 mt-5'>
            {props.notifications.map((notification) => (
                <li 
                    key={notification.id}
                    className='text-gray-700 text-base bg-gray-50 py-1 px-2 border rounded-lg'
                >
                    {notification.message}
                </li>
            ))}
        </ul>
    </div>
  )
}

export default NotificationSidebar