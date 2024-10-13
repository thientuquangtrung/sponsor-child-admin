import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, Download, User2, Wallet } from 'lucide-react';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import CardDataStats from '@/pages/admin/CardDataStats';

const FinanceReport = () => {
    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Báo cáo tài chính', path: null }
    ];
    const revenueData = {
        options: {
            chart: {
                id: 'revenue-chart'
            },
            xaxis: {
                categories: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
            },
            yaxis: {
                title: {
                    text: 'Số tiền (VNĐ)'
                }
            },
            colors: ['#25a5a7', '#f59e0b'],
            stroke: {
                curve: 'smooth'
            },
            title: {
                text: 'Biểu đồ Tài trợ - Giải ngân theo tháng',
                align: 'center'
            },
        },
        series: [
            {
                name: 'Tài trợ',
                data: [30000000, 40000000, 35000000, 50000000, 49000000, 60000000, 70000000, 91000000, 125000000, 150000000, 180000000, 210000000]
            },
            {
                name: 'Giải ngân',
                data: [20000000, 35000000, 25000000, 40000000, 45000000, 50000000, 60000000, 75000000, 100000000, 120000000, 150000000, 180000000]
            }
        ]
    };

    const donationDistribution = {
        options: {
            chart: {
                type: 'donut',
            },
            labels: ['Chiến dịch A', 'Chiến dịch B', 'Chiến dịch C', 'Chiến dịch D'],
            colors: ['#25a5a7', '#f59e0b', '#ef4444', '#8b5cf6'],
            title: {
                text: 'Phân bổ quyên góp theo chiến dịch',
                align: 'center'
            },
        },
        series: [44, 55, 41, 17],
    };

    const overviewData = [
        { title: 'Tổng tài trợ', value: '1,500,000,000 VNĐ', rate: '12.5%', levelUp: true, icon: <DollarSign size={22} className="text-[#25a5a7]" /> },
        { title: 'Tổng giải ngân', value: '1,200,000,000 VNĐ', rate: '8.2%', levelUp: true, icon: <CreditCard size={22} className="text-[#f59e0b]" /> },
        { title: 'Số dư', value: '300,000,000 VNĐ', rate: '4.3%', levelUp: true, icon: <Wallet size={22} className="text-[#ef4444]" /> },
        { title: 'Tổng số quyên góp', value: '1,000', rate: '2.5%', levelDown: true, icon: <User2 size={22} className="text-[#8b5cf6]" /> },
    ];

    return (
        <div className="space-y-6">
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="flex justify-end">
                <Button
                    className="border-2 border-[#25a5a7] bg-transparent text-[#25a5a7] hover:bg-[#25a5a7] hover:text-white"
                >
                    <Download className="mr-2 h-4 w-4" /> Tải xuống báo cáo
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {overviewData.map((item, index) => (
                    <CardDataStats
                        key={index}
                        title={item.title}
                        total={item.value}
                        rate={item.rate}
                        levelUp={item.levelUp}
                        levelDown={item.levelDown}
                    >
                        {item.icon}
                    </CardDataStats>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardContent>
                        <Chart
                            options={revenueData.options}
                            series={revenueData.series}
                            type="line"
                            height={350}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Chart
                            options={donationDistribution.options}
                            series={donationDistribution.series}
                            type="donut"
                            height={350}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FinanceReport;