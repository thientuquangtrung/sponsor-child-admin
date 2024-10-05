import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarAdmin from '@/components/navigation/SidebarAdmin';
import HeaderSidebar from '@/components/navigation/HeaderSidebar';

export function AdminLayout() {
    return (
        <div className="dark:bg-[#1a222c] dark:text-white">

            <div className="flex flex-col h-screen">
                <HeaderSidebar className="z-30" />
                <div className="flex flex-1 overflow-hidden">
                    <SidebarAdmin className="z-40 h-[calc(100vh-64px)] fixed top-16 left-0" />
                    <main className="flex-1 overflow-y-auto bg-[#f3f4f6] dark:bg-gray-700 p-6 md:mt-16 ml-0 md:ml-64">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;