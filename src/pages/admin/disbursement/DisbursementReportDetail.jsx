import React, { useState } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    useGetDisbursementReportByReportIdQuery,
    useUpdateDisbursementReportMutation,
} from '@/redux/guarantee/disbursementReportApi';
import { useSelector } from 'react-redux';

export default function DisbursementReportDetail() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const {id: reportId} = useParams();

    const {
        data: report = {},
        error,
        isLoading,
    } = useGetDisbursementReportByReportIdQuery(reportId, {
        skip: !reportId,
    });

    const [reason, setReason] = useState('');
    const [isRequestEditDialogOpen, setIsRequestEditDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [updateDisbursementReport] = useUpdateDisbursementReportMutation();

    const formatAmount = (value) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };
    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error loading report: {error?.message}</p>;
    }

    const handleAction = async (actionType) => {
        try {
            const adminReviewID = user?.userID;
            const reportStatus = actionType === 'approve' ? 1 : 2;
            await updateDisbursementReport({
                id: reportId,
                body: {
                    reportStatus: reportStatus,
                    adminReviewID: adminReviewID,
                    rejectionReason: actionType === 'requestEdit' ? reason : '',
                },
            }).unwrap();
            toast.success(
                actionType === 'approve'
                    ? 'Báo cáo đã được phê duyệt!'
                    : 'Yêu cầu chỉnh sửa đã được gửi tới nhà bảo lãnh!',
            );
        } catch (error) {
            console.error('Lỗi khi cập nhật yêu cầu:', error);
            toast.error('Có lỗi xảy ra khi cập nhật yêu cầu.');
        }
    };

    return (
        <div className="bg-white shadow-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-center">Chi tiết báo cáo giải ngân</h2>
            <div className="space-y-4">
                <Label className="font-semibold">Tổng số tiền đã chi:</Label>
                <Input readOnly value={formatAmount(report?.totalAmountUsed?.toString() || '0') + ' VNĐ'} />

                <Label className="font-semibold">Ghi chú:</Label>
                <Textarea readOnly value={report?.comments || 'Không có ghi chú'} />

                <Label className="font-semibold">Ngày tạo:</Label>
                <Input readOnly value={new Date(report?.createdAt).toLocaleDateString('vi-VN')} />

                <Label className="font-semibold">Ngày cập nhật:</Label>
                <Input readOnly value={new Date(report?.updatedAt).toLocaleDateString('vi-VN')} />
            </div>

            <div className="overflow-x-auto mt-4">
                <Table className="border-collapse border border-slate-400">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="border border-slate-300 font-semibold text-center">
                                Mô tả hoạt động
                            </TableHead>
                            <TableHead className="border border-slate-300 font-semibold text-center">
                                Số tiền đã chi
                            </TableHead>
                            <TableHead className="border border-slate-300 font-semibold text-center">Hóa đơn</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {report?.disbursementReportDetails?.map((detail) => (
                            <TableRow key={detail.id}>
                                <TableCell className="border border-slate-300">{detail.itemDescription}</TableCell>
                                <TableCell className="border border-slate-300">
                                    {formatAmount(detail.amountSpent.toString())} VNĐ
                                </TableCell>
                                <TableCell className="border border-slate-300">
                                    {detail.receiptUrl ? (
                                        <a href={detail.receiptUrl} target="_blank" rel="noopener noreferrer">
                                            Xem hóa đơn
                                        </a>
                                    ) : (
                                        'Không có hóa đơn'
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex flex-row justify-between items-center">
                <Button
                    variant="outline"
                    onClick={() => navigate(`/disbursement-reports`)}
                    className="mt-4 text-teal-600 border-teal-600 hover:bg-normal hover:text-teal-600"
                >
                    <Undo2 className="mr-2 h-4 w-4" />
                    Trở lại
                </Button>
                <div className="flex space-x-4 justify-end">
                    <Button
                        variant="warning"
                        onClick={() => setIsRequestEditDialogOpen(true)}
                        className="bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                        Yêu cầu nhà bảo lãnh chỉnh sửa
                    </Button>
                    <Button
                        variant="success"
                        onClick={() => setIsApproveDialogOpen(true)}
                        className="bg-teal-500 text-white hover:bg-teal-600"
                    >
                        Đồng ý giải ngân
                    </Button>
                </div>
            </div>

            <Dialog open={isRequestEditDialogOpen} onOpenChange={setIsRequestEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lý do yêu cầu chỉnh sửa báo cáo</DialogTitle>
                        <DialogClose />
                    </DialogHeader>
                    <div>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Nhập lý do yêu cầu chỉnh sửa từ phía quản trị viên..."
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRequestEditDialogOpen(false)}
                            className="hover:bg-gray-100"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={async () => {
                                setIsRequestEditDialogOpen(false);
                                await handleAction('requestEdit');
                            }}
                            className="bg-yellow-500 text-white hover:bg-yellow-600"
                        >
                            Gửi yêu cầu chỉnh sửa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận giải ngân</DialogTitle>
                        <DialogClose />
                    </DialogHeader>
                    <div className="text-gray-600">
                        Bạn chắc chắn muốn phê duyệt báo cáo giải ngân này? Hành động này không thể hoàn tác.
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsApproveDialogOpen(false)}
                            className="hover:bg-gray-100"
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="success"
                            onClick={async () => {
                                setIsApproveDialogOpen(false);
                                await handleAction('approve');
                            }}
                            className="bg-teal-500 text-white hover:bg-teal-600"
                        >
                            Đồng ý
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
