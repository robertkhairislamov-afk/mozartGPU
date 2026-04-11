import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import Instances from '@/pages/Instances'
import NewInstance from '@/pages/NewInstance'
import InstanceDetail from '@/pages/InstanceDetail'
import Billing from '@/pages/Billing'
import SshKeys from '@/pages/SshKeys'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/*
        Protected shell:
        ProtectedRoute checks auth (redirects to /login if not),
        then renders <Outlet /> which resolves to Layout.
        Layout in turn renders its own <Outlet /> for page content.
      */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/instances" element={<Instances />} />
          <Route path="/instances/new" element={<NewInstance />} />
          {/* Alias from landing page deep-links: /console/#/new-instance?plan=...&gpu=... */}
          <Route path="/new-instance" element={<NewInstance />} />
          <Route path="/instances/:id" element={<InstanceDetail />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/ssh-keys" element={<SshKeys />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 — must come last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
