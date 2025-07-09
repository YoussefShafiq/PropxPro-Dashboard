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
import Features from './Components/Pages/Features'
import Plans from './Components/Pages/Plans'
import { FcPrivacy } from 'react-icons/fc'
import PrivacyPolicy from './Components/Pages/PrivacyPolicy'
import TermsOfServices from './Components/Pages/TermsOfServices'
import Test from './Components/Pages/Test'

function App() {

  const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    {
      path: '/', element: <ProtectedRoute><Layout /></ProtectedRoute>, children: [
        { index: true, element: <ProtectedRoute><Home /></ProtectedRoute> },
        { path: '/home', element: <ProtectedRoute><Home /></ProtectedRoute> },
        { path: '/integrations', element: <ProtectedRoute><Integrations /></ProtectedRoute> },
        { path: '/admins', element: <ProtectedRoute><Admins /></ProtectedRoute> },
        { path: '/features', element: <ProtectedRoute><Features /></ProtectedRoute> },
        { path: '/plans', element: <ProtectedRoute><Plans /></ProtectedRoute> },
        { path: '/privacy-Policy', element: <ProtectedRoute><PrivacyPolicy /></ProtectedRoute> },
        { path: '/terms-of-services', element: <ProtectedRoute><TermsOfServices /></ProtectedRoute> },
        { path: '/test', element: <ProtectedRoute><Test /></ProtectedRoute> },
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
