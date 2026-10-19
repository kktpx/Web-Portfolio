import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminTopbar from './AdminTopbar';
import '../../styles/admin.css';
import './AdminLayout.css';

const AdminLayout = () => (
  <div className="admin-layout">
    <AdminTopbar />
    <main className="admin-content">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
