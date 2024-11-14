import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { useGetFundUsageHistoryByIdQuery } from '@/redux/fund/fundApi';
import LoadingScreen from '@/components/common/LoadingScreen';

const FundUsageDetail = () => {
    const { id } = useParams();
    const { data: usageData, isLoading, error } = useGetFundUsageHistoryByIdQuery(id);

    if (isLoading) return <div><LoadingScreen /></div>;
    if (error) return <div className="p-6">Đã xảy ra lỗi</div>;
    if (!usageData) return <div className="p-6">Không có dữ liệu</div>;

    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Quản lý quỹ', path: '/funds' },
        { name: "Chi tiết sử dụng quỹ", path: "#" },

    ];


    return (
        <div className="min-h-screen bg-gray-50">
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="p-6">
                <div className="space-y-6 max-w-7xl mx-auto">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-teal-600 text-white">
                            <CardTitle className="text-2xl font-semibold">Thông tin sử dụng quỹ</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">

                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Tên chiến dịch:</Label>
                                <Input value={usageData.campaignTitle} readOnly className="h-12 text-lg bg-gray-50" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Số tiền sử dụng:</Label>
                                <Input
                                    value={`${usageData.amountUsed.toLocaleString()} VNĐ`}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Ngày sử dụng:</Label>
                                <Input
                                    value={new Date(usageData.dateUsed).toLocaleDateString('vi-VN')}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Người duyệt:</Label>
                                <Input value={usageData.adminName} readOnly className="h-12 text-lg bg-gray-50" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-lg font-medium text-gray-700">Mục đích sử dụng:</Label>
                                <Input value={usageData.purpose} readOnly className="h-12 text-lg bg-gray-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FundUsageDetail;