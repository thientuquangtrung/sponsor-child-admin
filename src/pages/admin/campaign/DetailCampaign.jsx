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

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import FileViewer from '@/pages/admin/campaign/FileViewer';
import { useSelector } from 'react-redux';

const DetailCampaign = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const { data: campaignData, isLoading: campaignLoading, isError: campaignError } = useGetCampaignByIdQuery(id);
    const [updateStatus] = useUpdateCampaignMutation();
    const { user } = useSelector((state) => state.auth);

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
    console.log(campaignData);


    const updateCampaignStatus = async (newStatus, reason = '') => {
        try {
            setIsLoading(true);
            const response = await updateStatus({
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

    const handleAccept = async () => {
        try {
            setIsLoading(true);
            await updateCampaignStatus(1);
        } catch (error) {
            toast.error('Không thể chấp nhận đơn. Vui lòng thử lại sau.');
        }
    };



    const handleReject = async () => {
        try {
            setIsLoading(true);
            await updateCampaignStatus(3, rejectionReason);
        } catch (error) {
            toast.error('Không thể từ chối chiến dịch. Vui lòng thử lại sau.');
        }
    };

    const handleCancel = async () => {
        try {
            setIsLoading(true);
            await updateCampaignStatus(6, rejectionReason);
        } catch (error) {
            toast.error('Không thể hủy chiến dịch. Vui lòng thử lại sau.');
        }
    };

    const handlePause = async () => {
        try {
            setIsLoading(true);
            await updateCampaignStatus(9);
        } catch (error) {
            toast.error('Không thể tạm ngưng chiến dịch. Vui lòng thử lại sau.');
        }
    };


    const showAcceptButton = campaignData.status === 0;
    const showRejectButton = campaignData.status === 0;
    const showCancelButton = [0, 1, 2, 4].includes(campaignData.status);
    const showPauseButton = campaignData.status === 8;

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="min-h-screen bg-gray-50">
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
                        <Card className="shadow-lg border-0 overflow-hidden">

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
                                <div className="space-y-2  md:col-span-2">
                                    <Label htmlFor="title" className="text-lg font-medium text-gray-700">Tiêu đề:</Label>
                                    <Input id="title" value={campaignData.title} readOnly className="h-12 text-lg bg-gray-50" />
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
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl font-semibold">Câu chuyện</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div
                                    className="prose max-w-none text-lg bg-white rounded-lg p-6"
                                    dangerouslySetInnerHTML={{ __html: campaignData.story }}
                                />
                            </CardContent>
                        </Card>



                        <Card className="shadow-lg border-0 mb-6">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl font-semibold">Kế hoạch giải ngân</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {disbursementPlans.map((plan, index) => (
                                    <div key={index} className="mb-8">
                                        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-teal-50 p-4 rounded-lg">
                                                <p className="text-sm text-teal-600 font-medium">Ngày bắt đầu</p>
                                                <p className="text-lg font-semibold">
                                                    {new Date(plan.plannedStartDate).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <div className="bg-teal-50 p-4 rounded-lg">
                                                <p className="text-sm text-teal-600 font-medium">Ngày kết thúc dự kiến</p>
                                                <p className="text-lg font-semibold">
                                                    {new Date(plan.plannedEndDate).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <div className="bg-teal-50 p-4 rounded-lg">
                                                <p className="text-sm text-teal-600 font-medium">Ngày kết thúc thực tế</p>
                                                <p className="text-lg font-semibold">
                                                    {plan.actualEndDate ? new Date(plan.actualEndDate).toLocaleDateString('vi-VN') : '---'}
                                                </p>
                                            </div>
                                            <div className="bg-teal-50 p-4 rounded-lg">
                                                <p className="text-sm text-teal-600 font-medium">Tổng số tiền</p>
                                                <p className="text-lg font-semibold">
                                                    {plan.totalPlannedAmount.toLocaleString()} VNĐ
                                                </p>
                                            </div>
                                        </div>

                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Giai đoạn</TableHead>
                                                    <TableHead>Số tiền giải ngân</TableHead>
                                                    <TableHead>Ngày dự kiến</TableHead>
                                                    <TableHead>Ngày giải ngân thực tế</TableHead>
                                                    <TableHead>Trạng thái</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {[...plan.stages]
                                                    .sort((a, b) => a.stageNumber - b.stageNumber)
                                                    .map((stage) => (
                                                        <TableRow key={stage.stageNumber}>
                                                            <TableCell>Giai đoạn {stage.stageNumber}</TableCell>
                                                            <TableCell>{stage.disbursementAmount.toLocaleString()} VNĐ</TableCell>
                                                            <TableCell>
                                                                {new Date(stage.scheduledDate).toLocaleDateString('vi-VN')}
                                                            </TableCell>
                                                            <TableCell>
                                                                {stage.actualDisbursementDate
                                                                    ? new Date(stage.actualDisbursementDate).toLocaleDateString('vi-VN')
                                                                    : '---'
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold
                                                                    ${stage.status === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                                        stage.status === 1 ? 'bg-green-100 text-green-800' :
                                                                            'bg-red-100 text-red-800'}`}>
                                                                    {stage.status === 0 ? 'Chờ giải ngân' :
                                                                        stage.status === 1 ? 'Đã giải ngân' : 'Đã hủy'}
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <div className="mt-6 flex justify-end space-x-4">
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
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                                            Hủy chiến dịch
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Xác nhận hủy chiến dịch</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Vui lòng nhập lý do hủy chiến dịch này.
                                                Hành động này sẽ thay đổi trạng thái chiến dịch.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="my-4">
                                            <Textarea
                                                placeholder="Nhập lý do hủy..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Không</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleCancel}
                                                disabled={isLoading || !rejectionReason.trim()}
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

                            {showPauseButton && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                            Tạm Ngưng
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Xác nhận tạm ngưng</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Bạn có chắc chắn muốn tạm ngưng chiến dịch này?
                                                Chiến dịch sẽ được chuyển sang trạng thái tạm ngưng.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Không</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handlePause}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Đang xử lý
                                                    </>
                                                ) : (
                                                    'Xác nhận tạm ngưng'
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DetailCampaign;