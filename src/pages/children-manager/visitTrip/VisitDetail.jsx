import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, ChevronDown, Loader2, AlertCircle, User, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import LoadingScreen from '@/components/common/LoadingScreen';
import { useGetChildrenVisitTripsByIdQuery, useUpdateChildrenVisitTripStatusMutation } from '@/redux/childrenVisitTrips/childrenVisitTripsApi';
import ImageGallery from '@/pages/admin/campaign/ImageGallery';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { visitStatus } from '@/config/combobox';
import ParticipantsList from '@/pages/children-manager/visitTrip/ParticipantsList';
import PhysicalDonationsList from '@/pages/children-manager/visitTrip/PhysicalDonationsList';
import { toast } from 'sonner';

const CollapsibleSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <Card className="shadow-lg border-0">
                <CollapsibleTrigger className="w-full">
                    <CardHeader className="bg-teal-600 text-white flex flex-row items-center justify-between cursor-pointer">
                        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
                        <ChevronDown
                            className={`w-6 h-6 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
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
    const [isLoading, setIsLoading] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [isParticipantAlertOpen, setIsParticipantAlertOpen] = useState(false);
    const { data: visitData, isLoading: visitLoading, isError, refetch } = useGetChildrenVisitTripsByIdQuery(id);
    const [updateVisitStatus] = useUpdateChildrenVisitTripStatusMutation();

    useEffect(() => {
        if (visitData && [1, 2].includes(visitData.status)) {
            const participationThreshold = visitData.maxParticipants * (2 / 3);
            if (visitData.participantsCount < participationThreshold) {
                setIsParticipantAlertOpen(true);
            }
        }
    }, [visitData]);
    if (visitLoading) {
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

    const handleStartVisit = async () => {
        try {
            setIsLoading(true);
            await updateVisitStatus({
                id,
                status: 3
            }).unwrap();
            toast.success('Bắt đầu chuyến thăm thành công');
            refetch();
        } catch (error) {
            console.error('Error starting visit:', error);
            toast.error('Có lỗi xảy ra khi bắt đầu chuyến thăm');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelVisit = async () => {
        try {
            setIsLoading(true);
            await updateVisitStatus({
                id,
                status: 5,
                cancellationReason: cancellationReason
            }).unwrap();
            toast.success('Hủy chuyến thăm thành công');
            navigate('/visits');
        } catch (error) {
            console.error('Error canceling visit:', error);
            toast.error('Có lỗi xảy ra khi hủy chuyến thăm');
        } finally {
            setIsLoading(false);
        }
    };

    const showStartButton = visitData.status === 2;
    const showCancelButton = [0, 1, 2].includes(visitData.status);

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
                <AlertDialog open={isParticipantAlertOpen} onOpenChange={setIsParticipantAlertOpen}>
                    <AlertDialogContent className="max-w-md overflow-hidden">
                        <AlertDialogCancel
                            className="absolute top-0 right-0 hover:bg-red-500 hover:text-white rounded-full p-2">
                            <X size={24} />
                        </AlertDialogCancel>
                        <AlertDialogHeader className="p-6 relative">
                            <div className="flex items-center justify-center mb-3">
                                <AlertDialogTitle className="text-xl text-teal-600 font-bold">
                                    Số lượng người tham gia chưa đủ
                                </AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="sr-only">
                                Hiện tại có {visitData.participantsCount} người tham gia, yêu cầu tối thiểu {visitData.maxParticipants} người.
                            </AlertDialogDescription>
                            <div className="text-teal-600">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold">{visitData.participantsCount}</div>
                                        <div className="text-sm text-teal-600">Hiện tại</div>
                                    </div>
                                    <div className="text-2xl">/</div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold">{visitData.maxParticipants}</div>
                                        <div className="text-sm text-teal-600">Yêu cầu</div>
                                    </div>
                                </div>
                            </div>
                        </AlertDialogHeader>
                    </AlertDialogContent>
                </AlertDialog>
                <div className="p-6">
                    <div className="flex justify-end items-center space-x-4 mb-6">

                        {visitData.status === 0 && (
                            <Button
                                className="bg-teal-600 hover:bg-teal-700 text-white"
                                onClick={() => navigate(`/visit/edit/${id}`)}
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Cập nhật Chuyến thăm
                            </Button>
                        )}

                    </div>
                    <div className="space-y-6 max-w-7xl mx-auto">
                        <CollapsibleSection title="Hình ảnh chuyến thăm">
                            <ImageGallery
                                thumbnailUrl={visitData.thumbnailUrl}
                                imagesFolderUrl={visitData.imagesFolderUrl}
                            />
                        </CollapsibleSection>
                        <CollapsibleSection title="Thông tin chuyến thăm" >
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
                                                    {gift.currentAmount}/{gift.amount} {gift.unit}
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

                        {visitData.cancellationReason && (
                            <CollapsibleSection title="Lý do từ chối" defaultOpen={false}>
                                {visitData.cancellationReason}
                            </CollapsibleSection>
                        )}
                    </div>

                </div>
                <div className="flex justify-end items-center space-x-4 mb-6">

                    {showStartButton && (
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleStartVisit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý
                                </>
                            ) : (
                                'Bắt đầu chuyến thăm'
                            )}
                        </Button>
                    )}


                    {showCancelButton && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="bg-red-600 hover:bg-red-700 text-white">
                                    Hủy chuyến thăm
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Xác nhận hủy chuyến thăm</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Vui lòng nhập lý do hủy chuyến thăm này.
                                        Hành động này không thể hoàn tác.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="my-4">
                                    <Textarea
                                        placeholder="Nhập lý do hủy..."
                                        value={cancellationReason}
                                        onChange={(e) => setCancellationReason(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleCancelVisit}
                                        disabled={isLoading || !cancellationReason.trim()}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Đang xử lý
                                            </>
                                        ) : (
                                            'Xác nhận hủy'
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
        </>
    );
};

export default VisitDetail;