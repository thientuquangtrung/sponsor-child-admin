import React, { useState } from 'react';
import { Users, ClipboardList, PiggyBank, Target } from 'lucide-react';
import CardDataStats from '@/pages/admin/CardDataStats';
import DisbursementChart from '@/pages/admin/charts/DisbursementChart';
import ActivityChart from './charts/ActivityChart';
import DateRangePicker from '@/components/ui/date-range-picker';
import { useGetAdminDashboardQuery } from '@/redux/admin/adminApi';
import { formatCurrency } from '@/lib/utils';
import LoadingScreen from '@/components/common/LoadingScreen';
import FundLineChart from '@/pages/admin/charts/FundLineChart';

const AdminDashboard = () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const [dateRange, setDateRange] = useState({
        from: oneYearAgo,
        to: today
    });

    const { data: dashboardData, isLoading, isError } = useGetAdminDashboardQuery({
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0]
    });

    const handleDateRangeChange = (newRange) => {
        if (newRange.from && newRange.to) {
            setDateRange(newRange);
        }
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
                    title="Số người dùng đăng kí mới"
                    total={dashboardData.totalUsers.toString()}
                >
                    <Users className="text-indigo-700 dark:fill-white" size={22} />
                </CardDataStats>
                <CardDataStats
                    title="Số lượng chiến dịch"
                    total={dashboardData.totalCampaigns.toString()}
                >
                    <ClipboardList className="text-green-600 dark:fill-white" size={22} />
                </CardDataStats>
                <CardDataStats
                    title="Tổng số tiền đã gây quỹ"
                    total={formatCurrency(dashboardData.totalRaisedAmount)}
                >
                    <PiggyBank className="fill-yellow-300 dark:fill-white" size={22} />
                </CardDataStats>
                <CardDataStats
                    title="Chiến dịch đang hoạt động"
                    total={dashboardData.totalActiveCampaigns.toString()}
                >
                    <Target className="text-red-500 dark:fill-white" size={22} />
                </CardDataStats>
            </div>
            <div className="mt-4 grid grid-cols-12 gap-4">
                <div className="col-span-12 xl:col-span-8">
                    <DisbursementChart disbursementData={dashboardData.disbursementSummaryList} />
                </div>
                <div className="col-span-12 xl:col-span-4">
                    <ActivityChart
                        emergencyFundraisingCampaigns={dashboardData.totalEmergencyFundraisingCampaigns}
                        longTermChildSponsorshipCampaigns={dashboardData.totalLongTermChildSponsorshipCampaigns}
                    />
                </div>
            </div>

            <div className="mt-4">
                <FundLineChart campaignsPerYearList={dashboardData.campaignsPerYearList} />
            </div>
        </>
    );
};

export default AdminDashboard;