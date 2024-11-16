import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

import Breadcrumb from '@/pages/admin/Breadcrumb';
import { useGetCampaignByIdQuery } from '@/redux/campaign/campaignApi';
import { campaignStatus, campaignTypes, guaranteeTypes } from '@/config/combobox';
import LoadingScreen from '@/components/common/LoadingScreen';

const DetailCampaignChildrenManager = () => {
    const { id } = useParams();
    const { data: campaignData, isLoading, isError } = useGetCampaignByIdQuery(id);
    const navigate = useNavigate();


    if (isLoading) {
        return <LoadingScreen />;
    }

    if (isError) {
        return <div>Error fetching campaign data.</div>;
    }

    if (!campaignData) {
        return null;
    }


    console.log(campaignData);

    const campaignStatusObj = campaignStatus.find((status) => status.value === campaignData.status);
    const campaignTypeObj = campaignTypes.find((type) => type.value === campaignData.campaignType);
    const guaranteeTypeObj = guaranteeTypes.find((type) => type.value === campaignData.guaranteeType);
    const breadcrumbs = [
        { name: 'Chiến dịch', path: '/cm-campaigns' },
        { name: 'Chi tiết chiến dịch', path: null },
    ];




    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    <div className="flex justify-end items-center mb-6">
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => navigate(`/cm-campaign/edit/${id}`)}
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Cập nhật Chiến dịch
                        </Button>
                    </div>

                    <div className="space-y-6 max-w-7xl mx-auto">
                        <Card className="shadow-lg border-0 overflow-hidden">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl font-semibold">Hình ảnh chiến dịch</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="w-full h-[600px] relative">
                                    <img
                                        src={campaignData.thumbnailUrl}
                                        alt="Campaign Thumbnail"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl font-semibold">Thông tin chiến dịch</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-lg font-medium text-gray-700">Tiêu đề:</Label>
                                    <Input id="title" value={campaignData.title} readOnly className="h-12 text-lg bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-lg font-medium text-gray-700">Trạng thái:</Label>
                                    <div className="flex items-center h-12">
                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold
                                        ${campaignData.status === 0 ? 'bg-green-100 text-green-800' :
                                                campaignData.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                    campaignData.status === 2 ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {campaignStatusObj?.label || ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="targetAmount" className="text-lg font-medium text-gray-700">Số tiền kêu gọi:</Label>
                                    <Input id="targetAmount" value={`${campaignData.targetAmount.toLocaleString()} VNĐ`} readOnly className="h-12 text-lg bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="raisedAmount" className="text-lg font-medium text-gray-700">Số tiền đã kêu gọi:</Label>
                                    <Input id="raisedAmount" value={`${campaignData.raisedAmount.toLocaleString()} VNĐ`} readOnly className="h-12 text-lg bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="campaignType" className="text-lg font-medium text-gray-700">Loại chiến dịch:</Label>
                                    <Input id="campaignType" value={campaignTypeObj?.label || ''} readOnly className="h-12 text-lg bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="province" className="text-lg font-medium text-gray-700">Tỉnh/Thành phố:</Label>
                                    <Input id="province" value={campaignData.provinceName} readOnly className="h-12 text-lg bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="text-lg font-medium text-gray-700">Ngày bắt đầu:</Label>
                                    <Input id="startDate" value={new Date(campaignData.startDate).toLocaleDateString('vi-VN')} readOnly className="h-12 text-lg bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="text-lg font-medium text-gray-700">Ngày kết thúc:</Label>
                                    <Input id="endDate" value={new Date(campaignData.endDate).toLocaleDateString('vi-VN')} readOnly className="h-12 text-lg bg-gray-50" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl font-semibold">Mô tả chiến dịch</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div
                                    className="prose max-w-none text-lg bg-white rounded-lg p-6"
                                    dangerouslySetInnerHTML={{ __html: campaignData.story }}
                                />
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl font-semibold">Thông tin bảo lãnh</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="guaranteeName" className="text-lg font-medium text-gray-700">Tên đơn vị bảo lãnh:</Label>
                                    <Input id="guaranteeName" value={campaignData.guaranteeName} readOnly className="h-12 text-lg bg-gray-50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="guaranteeType" className="text-lg font-medium text-gray-700">Loại đơn vị bảo lãnh:</Label>
                                    <Input id="guaranteeType" value={guaranteeTypeObj?.label || ''} readOnly className="h-12 text-lg bg-gray-50" />
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </>
    );
};

export default DetailCampaignChildrenManager;