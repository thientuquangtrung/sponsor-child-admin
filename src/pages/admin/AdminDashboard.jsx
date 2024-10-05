import React from 'react';
import CardDataStats from '@/pages/admin/CardDataStats';
import { Users, ClipboardList, PiggyBank, Target } from 'lucide-react';
import FundChart from '@/pages/admin/charts/FundChart';
import DisbursementChart from '@/pages/admin/charts/DisbursementChart';
import ActivityChart from './charts/ActivityChart';
import FundTable from '@/pages/admin/FundTable';

const AdminDashboard = () => {
    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7">
                <CardDataStats title="Tổng số người dùng" total="3,456" rate="0.95%" levelDown>
                    <Users className="text-indigo-700 dark:fill-white" size={22} />
                </CardDataStats>
                <CardDataStats title="Số lượng chiến dịch" total="120" rate="5.00%" levelUp>
                    <ClipboardList className="text-green-600 dark:fill-white" size={22} />
                </CardDataStats>
                <CardDataStats title="Tổng số tiền đã gây quỹ" total="45,200,000" rate="4.35%" levelUp>
                    <PiggyBank className="fill-yellow-300 dark:fill-white" size={22} />
                </CardDataStats>
                <CardDataStats title="Chiến dịch đang hoạt động" total="15" rate="2.59%" levelDown>
                    <Target className="text-red-500 dark:fill-white" size={22} />
                </CardDataStats>
            </div>

            <div className="mt-4 md:mt-6 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7">
                <FundChart />
                <DisbursementChart />
            </div>

            <div className="mt-4 md:mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4">
                    <div className="h-full">
                        <ActivityChart />
                    </div>
                </div>
                <div className="lg:col-span-8">
                    <div className="h-full">
                        <FundTable />
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;