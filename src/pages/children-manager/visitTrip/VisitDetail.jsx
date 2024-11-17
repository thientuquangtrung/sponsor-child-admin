import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, ChevronDown } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import LoadingScreen from '@/components/common/LoadingScreen';
import { useGetChildrenVisitTripsByIdQuery } from '@/redux/childrenVisitTrips/childrenVisitTripsApi';
import ImageGallery from '@/pages/admin/campaign/ImageGallery';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { visitStatus } from '@/config/combobox';
import ParticipantsList from '@/pages/children-manager/visitTrip/ParticipantsList';
import PhysicalDonationsList from '@/pages/children-manager/visitTrip/PhysicalDonationsList';

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <Card className="shadow-lg border-0">
                <CollapsibleTrigger className="w-full">
                    <CardHeader className="bg-teal-600 text-white flex flex-row items-center justify-between cursor-pointer">
                        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
                        <ChevronDown
                            className={`w-6 h-6 transition-transform ${isOpen ? "transform rotate-180" : ""
                                }`}
                        />
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="p-6">{children}</CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
};

const VisitDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: visitData, isLoading, isError } = useGetChildrenVisitTripsByIdQuery(id);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (isError) {
        return <div>Đã xảy ra lỗi</div>;
    }

    if (!visitData) {
        return null;
    }

    const breadcrumbs = [
        { name: 'Chuyến thăm', path: '/visits' },
        { name: 'Chi tiết chuyến thăm', path: null },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 0: return 'bg-blue-100 text-blue-800';
            case 1: return 'bg-green-100 text-green-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            case 3: return 'bg-purple-100 text-purple-800';
            case 4: return 'bg-teal-100 text-teal-800';
            case 5: return 'bg-red-100 text-red-800';
            case 6: return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const statusObj = visitStatus.find(s => s.value === visitData.status);

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    <div className="flex justify-end items-center mb-6">
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => navigate(`/visit/edit/${id}`)}
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Cập nhật Chuyến thăm
                        </Button>
                    </div>
                    <div className="space-y-6 max-w-7xl mx-auto">
                        <CollapsibleSection title="Hình ảnh chuyến thăm" defaultOpen={true}>
                            <ImageGallery
                                thumbnailUrl={visitData.thumbnailUrl}
                                imagesFolderUrl={visitData.imagesFolderUrl}
                            />
                        </CollapsibleSection>

                        <CollapsibleSection title="Thông tin chuyến thăm" defaultOpen={true}>
                            <div className="space-y-6">
                                <div className="col-span-full space-y-2">
                                    <Label htmlFor="title" className="text-lg font-medium text-gray-700">Tiêu đề:</Label>
                                    <Input id="title" value={visitData.title} readOnly className="h-12 text-lg bg-gray-50" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-lg font-medium text-gray-700">Chi phí:</Label>
                                        <Input value={`${visitData.visitCost.toLocaleString()} VNĐ`} readOnly className="h-12 text-lg bg-gray-50" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-lg font-medium text-gray-700">Địa điểm:</Label>
                                        <Input value={visitData.province} readOnly className="h-12 text-lg bg-gray-50" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <span className="text-lg font-medium text-gray-700">Ngày bắt đầu đăng ký:</span>
                                            <Input value={formatDate(visitData.registrationStartDate)} readOnly className="h-12 text-lg bg-gray-50" />
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <span className="text-lg font-medium text-gray-700">Ngày kết thúc đăng ký:</span>
                                            <Input value={formatDate(visitData.registrationEndDate)} readOnly className="h-12 text-lg bg-gray-50" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-lg font-medium text-gray-700">Ngày bắt đầu:</Label>
                                            <Input value={formatDate(visitData.startDate)} readOnly className="h-12 text-lg bg-gray-50" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-lg font-medium text-gray-700">Ngày kết thúc:</Label>
                                            <Input value={formatDate(visitData.endDate)} readOnly className="h-12 text-lg bg-gray-50" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-lg font-medium text-gray-700">Số người tham gia:</Label>
                                        <Input value={`${visitData.participantsCount}/${visitData.maxParticipants}`} readOnly className="h-12 text-lg bg-gray-50" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-lg font-medium text-gray-700">Trạng thái:</Label>
                                        <div className="flex items-center h-12">
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(visitData.status)}`}>
                                                {statusObj?.label || 'Không xác định'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Mô tả" defaultOpen={true}>
                            <div
                                className="prose max-w-none text-lg bg-white rounded-lg p-6"
                                dangerouslySetInnerHTML={{ __html: visitData.description }}
                            />
                        </CollapsibleSection>

                        <CollapsibleSection title="Lịch Trình Chi Tiết" defaultOpen={false}>
                            {visitData.travelItineraryDetails && visitData.travelItineraryDetails.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {visitData.travelItineraryDetails.map((day, index) => (
                                        <div
                                            key={index}
                                            className={`bg-white rounded-lg shadow p-6 ${index % 2 === 0 ? 'md:mr-3' : 'md:ml-3'}`}
                                        >
                                            <h3 className="text-xl font-semibold mb-4 text-teal-600 border-b pb-2">
                                                Ngày {index + 1}: {formatDate(day.date)}
                                            </h3>
                                            <div className="space-y-4">
                                                {day.activities && day.activities.length > 0 ? (
                                                    day.activities.map((activity, actIndex) => (
                                                        <div
                                                            key={actIndex}
                                                            className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                                                        >
                                                            <div className="min-w-[120px] border-r pr-4">
                                                                <p className="font-medium text-teal-700">
                                                                    {activity.startTime} - {activity.endTime}
                                                                </p>
                                                            </div>
                                                            <p className="flex-1">{activity.description}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-center py-4">Chưa có lịch trình</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">Chưa có lịch trình</p>
                            )}
                        </CollapsibleSection>

                        <CollapsibleSection title="Danh sách quà tặng" defaultOpen={false}>
                            {visitData.giftRequestDetails.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {visitData.giftRequestDetails.map((gift, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center justify-between bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors ${index % 2 === 0 ? 'md:mr-3' : 'md:ml-3'}`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <span className="w-8 h-8 flex items-center justify-center bg-teal-100 text-teal-600 rounded-full font-semibold">
                                                    {index + 1}
                                                </span>
                                                <span className="font-medium text-gray-700">{gift.giftType}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block px-4 py-2 bg-teal-50 text-teal-700 rounded-full">
                                                    {gift.amount} {gift.unit}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">Không có quà tặng</p>
                            )}
                        </CollapsibleSection>

                        <CollapsibleSection title="Danh sách người tham gia" defaultOpen={false}>
                            <ParticipantsList registrations={visitData.visitRegistrations} />
                        </CollapsibleSection>

                        <CollapsibleSection title="Danh sách quyên góp" defaultOpen={false}>
                            <PhysicalDonationsList donations={visitData.physicalDonations} />
                        </CollapsibleSection>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VisitDetail;