import React, { useContext, useEffect, useState } from 'react'
import logo from '../../assets/images/Logo.png'
import { NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { SidebarContext } from '../../Contexts/SidebarContext'
import { IoHomeOutline } from 'react-icons/io5'
import { GoSidebarExpand } from 'react-icons/go'
import { CiLogout } from 'react-icons/ci'
import { useQuery } from '@tanstack/react-query'

export default function Sidebar() {
    const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext)
    const [loggingOut, setloggingOut] = useState(false)

    const navigate = useNavigate()

    async function handleLogout() {
        setloggingOut(true)
        try {
            let resopnse = await axios.post('https://api.propxpro.com/api/auth/logout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } })
            localStorage.removeItem('userToken')
            navigate('/login')
            toast.success('logged Out Successfully', { duration: 2000 })
            setloggingOut(false)
        } catch (error) {
            if (error.status == 401) {
                localStorage.removeItem('userToken')
                navigate('/login')
                console.log('error to out');

            }
            console.log(error.status);

            setloggingOut(false)
            toast.error(error.response?.data?.message || 'something went wrong', { duration: 3000 });
            localStorage.removeItem('userToken')
            navigate('/login')
        }
    }

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

    const { data: currentUser, isLoading: isCurrentuserLoading, error, isError } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => {
            return axios.get('https://api.propxpro.com/api/auth/me',
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('userToken')}`
                    }
                })
        }
    })

    const sidebarPages = [
        {
            title: 'Home',
            path: '/',
            icon: <IoHomeOutline />,
            permission: ''
        },
        {
            title: 'Integrations',
            path: '/integrations',
            icon: <IoHomeOutline />,
            permission: "view_integrations"
        },
        {
            title: 'Admins',
            path: '/admins',
            icon: <IoHomeOutline />,
            permission: 'view_admins'
        },
        {
            title: 'Plans',
            path: '/plans',
            icon: <IoHomeOutline />,
            permission: 'view_plans'
        },
        {
            title: 'Privacy Policy',
            path: '/privacy-Policy',
            icon: <IoHomeOutline />,
            permission: ''
        },
        {
            title: 'Terms of Services',
            path: '/terms-of-Services',
            icon: <IoHomeOutline />,
            permission: ''
        },
        {
            title: 'Blogs',
            path: '/blogs',
            icon: <IoHomeOutline />,
            permission: 'view_blogs'
        },
        {
            title: 'Requested demos',
            path: '/requested-demos',
            icon: <IoHomeOutline />,
            permission: 'view_request_demos'
        },
    ]
    return <>
        <div className={`h-full bg-tramsparent p-5 fixed w-56 left-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-500 z-50`}>
            <div className={`absolute z-50 ${sidebarOpen ? 'top-5 right-5 -translate-x-1/2 translate-y-1/2 text-gray-400' : 'top-2 -right-2 translate-x-full p-1.5 flex justify-center items-center bg-white text-gray-700 bg-opacity-90 aspect-square rounded-full cursor-pointer'} transition-all duration-500`}>
                <button onClick={toggleSidebar} ><GoSidebarExpand className='text-2xl' /></button>
            </div>
            <div className="h-full bg-white rounded-2xl p-5 pt-10 flex flex-col justify-between overflow-y-auto shadow-xl">
                <div className="">
                    <div className="flex justify-center items-center overflow-hidden mb-2">
                        <img src={logo} alt="Logo" className="w-4/5" />
                    </div>
                    <div className="flex flex-col gap-1 text-gray-400 text-base">
                        {sidebarPages.map((p, i) => (
                            <>
                                {(currentUser?.data?.data?.permissions.includes(p.permission) || p.permission == '') && <NavLink key={i} className="px-4 py-2 rounded-xl flex items-center gap-2" to={p.path} ><div className="">{p.icon} </div>{p.title}</NavLink>}
                            </>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col">
                    <button onClick={handleLogout} disabled={loggingOut} className='bg-gray-400 flex justify-center items-center text-white p-2 rounded-xl mb-2 gap-2 disabled:cursor-not-allowed disabled:opacity-50 capitalize'>Logout <CiLogout className='text-2xl font-extrabold' /></button>
                </div>
            </div>
        </div>
    </>
}
