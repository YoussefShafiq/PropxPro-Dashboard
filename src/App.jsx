import { useState } from 'react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './Components/Pages/Home'
import Login from './Components/Auth/Login'
import ProtectedRoute from './Components/Auth/ProtectedRoute'
import Layout from './Components/Layout/Layout'
import { Toaster } from 'react-hot-toast'
import SidebarContextProvider from './Contexts/SidebarContext'
import Integrations from './Components/Pages/Integrations'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Admins from './Components/Pages/Admins'

function App() {

  const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    {
      path: '/', element: <ProtectedRoute><Layout /></ProtectedRoute>, children: [
        { index: true, element: <ProtectedRoute><Home /></ProtectedRoute> },
        { path: '/home', element: <ProtectedRoute><Home /></ProtectedRoute> },
        { path: '/integrations', element: <ProtectedRoute><Integrations /></ProtectedRoute> },
        { path: '/admins', element: <ProtectedRoute><Admins /></ProtectedRoute> },
      ]
    },

  ])

  let query = new QueryClient();

  return (
    <>
      <SidebarContextProvider>
        <QueryClientProvider client={query}>
          <RouterProvider router={router} />
          <Toaster
            position='bottom-right'
            reverseOrder={false}
          />
        </QueryClientProvider>
      </SidebarContextProvider>
    </>
  )
}

export default App
