import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import SidebarAdmin from '@/components/navigation/SidebarAdmin';
import HeaderSidebar from '@/components/navigation/HeaderSidebar';
import { useSelector } from 'react-redux';
import { useGetAdminConfigQuery } from '@/redux/adminConfig/adminConfigApi';
import FETCH_ADMIN_CONFIGS from '@/config/adminConfig';

export function AdminLayout() {
    const { user } = useSelector((state) => state.auth);
    const { data } = useGetAdminConfigQuery();
    if (data && data.length > 0) {
        const adminConfigs = data.reduce((acc, val) => {
            return {
                ...acc,
                [val.configKey]: +val.configValue
            }
        }, {})
        localStorage.setItem("adminConfigs", JSON.stringify(adminConfigs));
    }
    else {
        const adminConfigs = FETCH_ADMIN_CONFIGS.reduce((acc, val) => {
            return {
                ...acc,
                [val.configKey]: +val.configValue
            }
        }, {})
        localStorage.setItem("adminConfigs", JSON.stringify(adminConfigs));
    }
    const allowedRoles = ['admin', 'childmanager'];
    if (!allowedRoles.includes(user?.role.toLowerCase())) {
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
}

export default AdminLayout;
