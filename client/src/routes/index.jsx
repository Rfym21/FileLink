import Index from '@/views/Index'
import Login from '@/views/Login'
import Register from '@/views/Register'
import Dashboard from '@/views/Dashboard'
import Documents from '@/views/Documents'
import Setting from '@/views/Setting'
import Manager from '@/views/Manager'
import DocumentView from '@/views/DocumentView'

import { createBrowserRouter } from 'react-router-dom'
import React from 'react'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />
  }, {
    path: '/dashboard',
    element: <Dashboard />,
    children: [
      {
        path: 'documents',
        element: <Documents />
      },
      {
        path: 'setting',
        element: <Setting />
      },
      {
        path: 'manager',
        element: <Manager />
      },
      {
        path: ':id',
        element: <DocumentView />
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/*',
    element: <Index />
  }
])

export default router