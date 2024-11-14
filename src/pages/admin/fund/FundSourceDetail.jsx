import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetFundSourceByIdQuery } from '@/redux/fund/fundApi';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import LoadingScreen from '@/components/common/LoadingScreen';

const FundSourceDetail = () => {
    const { id } = useParams();
    const { data: sourceData, isLoading, error } = useGetFundSourceByIdQuery(id);


    if (isLoading) return <div><LoadingScreen /></div>;
    if (error) return <div className="p-6">Đã xảy ra lỗi</div>;
    if (!sourceData) return <div className="p-6">Không có dữ liệu</div>;


    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Quản lý quỹ', path: '/funds' },
        { name: "Chi tiết nguồn quỹ", path: "#" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <div className="p-6">
                <div className="space-y-6 max-w-7xl mx-auto">
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-teal-600 text-white">
                            <CardTitle className="text-2xl font-semibold">Thông tin nguồn quỹ</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Tên:</Label>
                                <Input value={sourceData.sourceName} readOnly className="h-12 text-lg bg-gray-50" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Số tiền:</Label>
                                <Input
                                    value={`${sourceData.amountAdded.toLocaleString()} VNĐ`}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Ngày thêm:</Label>
                                <Input
                                    value={new Date(sourceData.dateAdded).toLocaleDateString('vi-VN')}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Nguồn:</Label>
                                <Input
                                    value={sourceData.fundSourceType === 1 ? "Từ chiến dịch" : "Khác"}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-lg font-medium text-gray-700">Mô tả:</Label>
                                <Input value={sourceData.description} readOnly className="h-12 text-lg bg-gray-50" />
                            </div>
                        </CardContent>
                    </Card>

                    {sourceData.evidenceImageUrl && (
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl font-semibold">Ảnh minh chứng</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex justify-center">
                                    <img
                                        src={sourceData?.evidenceImageUrl}
                                        alt="Evidence"
                                        className="max-w-full h-auto rounded-lg shadow-md"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FundSourceDetail;