import React, { useContext } from 'react'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'
import { SidebarContext } from '../../Contexts/SidebarContext'

export default function Layout() {
    const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext)

    return <>
        <div className="flex bg-base min-h-screen">
            <div className={`${sidebarOpen ? 'md:w-56' : 'w-0'} transition-all duration-500`}>
                <Sidebar />
            </div>
            <div className={`${sidebarOpen ? 'w-full md:w-[calc(100%-224px)] ps-0' : 'w-full'} md:p-5  text-black transition-all duration-500 bg-background`}>
                <Outlet />
            </div>
        </div>
    </>
}
