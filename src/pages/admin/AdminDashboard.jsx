import React from 'react';
import { Users, ClipboardList, PiggyBank, Target } from 'lucide-react';
import CardDataStats from '@/pages/admin/CardDataStats';
import FundChart from '@/pages/admin/charts/FundChart';
import DisbursementChart from '@/pages/admin/charts/DisbursementChart';
import ActivityChart from './charts/ActivityChart';
import DateRangePicker from '@/components/ui/date-range-picker';
import { useGetAdminDashboardQuery } from '@/redux/admin/adminApi';
import { formatCurrency } from '@/lib/utils';
import LoadingScreen from '@/components/common/LoadingScreen';

const AdminDashboard = () => {
    const { data: dashboardData, isLoading, isError } = useGetAdminDashboardQuery();

    const handleDateRangeChange = (range) => {
    };

    if (isLoading) return <div><LoadingScreen /></div>;
    if (isError) return <div>Có lỗi xảy ra</div>;



    return (
        <>
            <div className="flex justify-end mb-4">
                <DateRangePicker onRangeChange={handleDateRangeChange} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7">
                <CardDataStats
                    title="Tổng số người dùng"
                    total={dashboardData.totalUsers.toString()}
                // rate="0.95%"
                // levelDown
                >
                    <Users className="text-indigo-700 dark:fill-white" size={22} />
                </CardDataStats>
                <CardDataStats
                    title="Số lượng chiến dịch"
                    total={dashboardData.totalCampaigns.toString()}
                // rate="5.00%"
                // levelUp
                >
                    <ClipboardList className="text-green-600 dark:fill-white" size={22} />
                </CardDataStats>
                <CardDataStats
                    title="Tổng số tiền đã gây quỹ"
                    total={formatCurrency(dashboardData.totalRaisedAmount)}
                // rate="4.35%"
                // levelUp
                >
                    <PiggyBank className="fill-yellow-300 dark:fill-white" size={22} />
                </CardDataStats>
                <CardDataStats
                    title="Chiến dịch đang hoạt động"
                    total={dashboardData.totalActiveCampaigns.toString()}
                // rate="2.59%"
                // levelDown
                >
                    <Target className="text-red-500 dark:fill-white" size={22} />
                </CardDataStats>
            </div>

            <div className="mt-4 grid grid-cols-12 gap-4">
                <div className="col-span-12 xl:col-span-8">
                    <FundChart />
                </div>
                <div className="col-span-12 xl:col-span-4">
                    <DisbursementChart />
                </div>
            </div>

            <div className="mt-4">
                <ActivityChart />
            </div>
        </>
    );
};

export default AdminDashboard;