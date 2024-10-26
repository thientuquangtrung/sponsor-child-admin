import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import SidebarAdmin from '@/components/navigation/SidebarAdmin';
import HeaderSidebar from '@/components/navigation/HeaderSidebar';
import { useSelector } from 'react-redux';

export function AdminLayout() {
    const { user } = useSelector((state) => state.auth);

    if (user?.role.toLowerCase() !== 'admin') {
        return <Navigate to="/auth/login" />;
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#1a222c] dark:text-white">
            <HeaderSidebar className="fixed top-0 left-0 right-0 h-16 z-50" />

            <div className="flex pt-16 min-h-screen">
                <SidebarAdmin />
                <main className="flex-1 ml-0 md:ml-64 min-h-[calc(100vh-64px)]">
                    <div className="container mx-auto p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;