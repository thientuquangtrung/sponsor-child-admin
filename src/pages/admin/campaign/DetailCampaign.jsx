import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2 } from "lucide-react";
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
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { useGetCampaignByIdQuery, useUpdateCampaignMutation } from '@/redux/campaign/campaignApi';
import { campaignStatus, campaignTypes, guaranteeTypes } from '@/config/combobox';
import LoadingScreen from '@/components/common/LoadingScreen';
import { toast } from 'sonner';
import FileViewer from '@/pages/admin/campaign/FileViewer';
import { useSelector } from 'react-redux';
import ImageGallery from '@/pages/admin/campaign/ImageGallery';
import ChildSearch from '@/pages/admin/campaign/ChildSearch';
import DetailDisbursementPlan from '@/pages/admin/campaign/DetailDisbursementPlan';
import CampaignSuspended from '@/pages/admin/campaign/CampaignSuspended';
import CancelCampaign from '@/pages/admin/campaign/CancelCampaign';
import DonateFromFund from './DonateFromFund';

const DetailCampaign = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const { data: campaignData, isLoading: campaignLoading, isError: campaignError, refetch } = useGetCampaignByIdQuery(id);
    const [updateStatus] = useUpdateCampaignMutation();
    const { user } = useSelector((state) => state.auth);
    const [showSuspendForm, setShowSuspendForm] = useState(false);

    if (campaignLoading) {
        return <LoadingScreen />;
    }

    if (campaignError) {
        return <div>Error fetching data.</div>;
    }

    if (!campaignData) {
        return null;
    }

    const { disbursementPlans } = campaignData;
    const campaignStatusObj = campaignStatus.find((status) => status.value === campaignData.status);
    const campaignTypeObj = campaignTypes.find((type) => type.value === campaignData.campaignType);
    const guaranteeTypeObj = guaranteeTypes.find((type) => type.value === campaignData.guaranteeType);
    const breadcrumbs = [
        { name: 'Chiến dịch', path: '/campaigns' },
        { name: 'Chi tiết chiến dịch', path: null },
    ];

    const updateCampaignStatus = async (newStatus, reason = '') => {
        try {
            setIsLoading(true);
            await updateStatus({
                id,
                guaranteeID: campaignData.guaranteeID,
                title: campaignData.title,
                story: campaignData.story,
                status: newStatus,
                raisedAmount: campaignData.raisedAmount,
                thumbnailUrl: campaignData.thumbnailUrl,
                imagesFolderUrl: campaignData.imagesFolderUrl,
                rejectionReason: reason,
                userID: user.userID,
            }).unwrap();
            toast.success('Cập nhật chiến dịch thành công');
            navigate('/campaigns');
        } catch (error) {
            console.error('Error updating campaign status:', error);
            toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái chiến dịch');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = () => updateCampaignStatus(1);
    const handleReject = () => updateCampaignStatus(3, rejectionReason);


    const showAcceptButton = campaignData.status === 0;
    const showRejectButton = campaignData.status === 0;
    const showCancelButton = [7, 8, 9].includes(campaignData.status);
    const showPauseButton = campaignData.status === 8;

    return (
        <div className="min-h-screen bg-gray-50">
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="p-6">
                <div className="flex justify-end items-center mb-6">
                    <Button
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => navigate(`/campaign/edit/${id}`)}
                    >
                        <Pencil className="w-4 h-4 mr-2" />
                        Cập nhật Chiến dịch
                    </Button>
                </div>

                <div className="space-y-6 max-w-7xl mx-auto">
                    <ChildSearch />
                    <Card className="shadow-lg border-0 overflow-hidden">
                        <CardContent className="p-0">
                            <ImageGallery
                                thumbnailUrl={campaignData.thumbnailUrl}
                                imagesFolderUrl={campaignData.imagesFolderUrl}
                            />
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 mb-6">
                        <CardHeader className="bg-teal-600 text-white">
                            <CardTitle className="text-2xl font-semibold">Thông tin trẻ em</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            <div className="md:col-span-2 flex justify-center mb-4">
                                <FileViewer fileUrl={campaignData.childIdentificationInformationFile} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Họ và tên:</Label>
                                <Input value={campaignData.childName} readOnly className="h-12 text-lg bg-gray-50" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Năm sinh:</Label>
                                <Input value={campaignData.childBirthYear} readOnly className="h-12 text-lg bg-gray-50" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Giới tính:</Label>
                                <Input
                                    value={campaignData.childGender === 0 ? "Nam" : "Nữ"}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Địa chỉ:</Label>
                                <Input
                                    value={`${campaignData.childLocation}, ${campaignData.childWard}, ${campaignData.childDistrict}, ${campaignData.childProvince}`}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-teal-600 text-white">
                            <CardTitle className="text-2xl font-semibold">Thông tin chiến dịch</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="title" className="text-lg font-medium text-gray-700">Tiêu đề:</Label>
                                <Input id="title" value={campaignData.title} readOnly className="h-12 text-lg bg-gray-50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="targetAmount" className="text-lg font-medium text-gray-700">
                                    Số tiền kêu gọi:
                                </Label>
                                <Input
                                    id="targetAmount"
                                    value={`${campaignData.targetAmount.toLocaleString()} VNĐ`}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="raisedAmount" className="text-lg font-medium text-gray-700">
                                    Số tiền đã kêu gọi:
                                </Label>
                                <Input
                                    id="raisedAmount"
                                    value={`${campaignData.raisedAmount.toLocaleString()} VNĐ`}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="campaignType" className="text-lg font-medium text-gray-700">
                                    Loại chiến dịch:
                                </Label>
                                <Input
                                    id="campaignType"
                                    value={campaignTypeObj?.label || ''}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-lg font-medium text-gray-700">Trạng thái:</Label>
                                <div className="flex items-center h-12">
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold
                                        ${campaignData.status === 0 ? 'bg-blue-300 text-blue-800' :
                                            campaignData.status === 1 ? 'bg-yellow-300 text-yellow-800' :
                                                campaignData.status === 2 ? 'bg-teal-300 text-teal-800' :
                                                    campaignData.status === 3 ? 'bg-red-300 text-red-800' :
                                                        campaignData.status === 4 ? 'bg-green-300 text-green-800' :
                                                            'bg-rose-100 text-rose-800'}`}>
                                        {campaignStatusObj?.label || ''}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startDate" className="text-lg font-medium text-gray-700">
                                    Ngày bắt đầu:
                                </Label>
                                <Input
                                    id="startDate"
                                    value={new Date(campaignData.startDate).toLocaleDateString('vi-VN')}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate" className="text-lg font-medium text-gray-700">
                                    Ngày kết thúc:
                                </Label>
                                <Input
                                    id="endDate"
                                    value={new Date(campaignData.endDate).toLocaleDateString('vi-VN')}
                                    readOnly
                                    className="h-12 text-lg bg-gray-50"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-teal-600 text-white">
                            <CardTitle className="text-2xl font-semibold">Thông tin bảo lãnh</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {campaignData.guaranteeName ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="guaranteeName" className="text-lg font-medium text-gray-700">
                                            Tên đơn vị bảo lãnh:
                                        </Label>
                                        <Input
                                            id="guaranteeName"
                                            value={campaignData.guaranteeName}
                                            readOnly
                                            className="h-12 text-lg bg-gray-50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guaranteeType" className="text-lg font-medium text-gray-700">
                                            Loại đơn vị bảo lãnh:
                                        </Label>
                                        <Input
                                            id="guaranteeType"
                                            value={guaranteeTypeObj?.label || ''}
                                            readOnly
                                            className="h-12 text-lg bg-gray-50"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-lg text-gray-600">Chưa có Bảo Lãnh</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg border-0">
                        <CardHeader className="bg-teal-600 text-white">
                            <CardTitle className="text-2xl font-semibold">Câu chuyện</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div
                                className="prose max-w-none text-lg bg-white rounded-lg p-6"
                                dangerouslySetInnerHTML={{ __html: campaignData.story }}
                            />
                        </CardContent>
                    </Card>

                    <DetailDisbursementPlan disbursementPlans={disbursementPlans} />

                    {campaignData.rejectionReason && (
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl font-semibold">Lý do từ chối</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="bg-red-50 text-red-800 p-4 rounded-lg whitespace-pre-line">
                                    {campaignData.rejectionReason}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {showSuspendForm ? (
                        <CampaignSuspended
                            id={id}
                            userID={user.userID}
                            onCancel={() => setShowSuspendForm(false)}
                            onSuccess={() => {
                                setShowSuspendForm(false);
                                refetch();
                            }}
                        />
                    ) : (
                        <div className="mt-6 flex justify-end space-x-4">
                            {campaignData?.guaranteeName && (
                                <>
                                    {showAcceptButton && (
                                        <Button
                                            onClick={handleAccept}
                                            className="bg-teal-600 hover:bg-green-700 text-white"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Đang xử lý
                                                </>
                                            ) : (
                                                'Chấp nhận đơn'
                                            )}
                                        </Button>
                                    )}

                                    {showRejectButton && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button className="bg-gray-800 hover:bg-gray-900 text-white">
                                                    Từ chối yêu cầu
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Xác nhận từ chối</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Vui lòng nhập lý do từ chối chiến dịch này.
                                                        Hành động này không thể hoàn tác.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="my-4">
                                                    <Textarea
                                                        placeholder="Nhập lý do từ chối..."
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        className="min-h-[100px]"
                                                    />
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleReject}
                                                        disabled={isLoading || !rejectionReason.trim()}
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Đang xử lý
                                                            </>
                                                        ) : (
                                                            'Xác nhận từ chối'
                                                        )}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}

                                    {showCancelButton && (
                                        <CancelCampaign
                                            campaignId={id}
                                            userId={user.userID}
                                            onSuccess={() => {
                                                refetch();
                                                navigate('/campaigns');
                                            }}
                                        />
                                    )}
                                    {campaignData.status === 7 && (
                                        <DonateFromFund
                                            campaignId={id}
                                            userId={user.userID}
                                            targetAmount={campaignData.targetAmount}
                                            raisedAmount={campaignData.raisedAmount}
                                            onSuccess={refetch}
                                        />
                                    )}
                                    {showPauseButton && (
                                        <Button
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                            onClick={() => setShowSuspendForm(true)}
                                        >
                                            Tạm ngưng chiến dịch
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailCampaign;