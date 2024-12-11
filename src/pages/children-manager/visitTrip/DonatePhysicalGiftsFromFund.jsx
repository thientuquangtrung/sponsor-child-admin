import React from 'react';
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
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGetCommonFundsQuery } from '@/redux/fund/fundApi';
import { useDonatePhysicalDonationFromCommonFundMutation } from '@/redux/physicalDonations/physicalDonationApi';

const DonatePhysicalGiftsFromFund = ({ visitId, giftRequestDetails, userId, onSuccess }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [purpose, setPurpose] = React.useState('');
    const { data: commonFund, isLoading: fundLoading } = useGetCommonFundsQuery();
    const [donatePhysicalGiftsFromCommonFund] = useDonatePhysicalDonationFromCommonFundMutation();

    const missingGifts = giftRequestDetails.filter(gift => gift.currentAmount < gift.amount)
        .map(gift => ({
            ...gift,
            missingAmount: gift.amount - gift.currentAmount,
            missingCost: (gift.amount - gift.currentAmount) * gift.unitPrice
        }));

    const totalMissingCost = missingGifts.reduce((total, gift) => total + gift.missingCost, 0);
    const canDonate = commonFund?.totalAmount >= totalMissingCost;

    const handleDonate = async () => {
        if (!purpose.trim()) {
            toast.error('Vui lòng nhập nội dung chuyển quà');
            return;
        }

        try {
            setIsLoading(true);
            await donatePhysicalGiftsFromCommonFund({
                visitId,
                userID: userId,
                purpose: purpose.trim(),
                gifts: missingGifts.map(gift => ({
                    giftType: gift.giftType,
                    amount: gift.missingAmount,
                    unit: gift.unit
                }))
            }).unwrap();

            toast.success('Tặng quà từ quỹ chung thành công');
            onSuccess?.();
        } catch (error) {
            console.error('Error donating physical gifts from common fund:', error);
            toast.error('Có lỗi xảy ra khi chuyển quà từ quỹ chung');
        } finally {
            setIsLoading(false);
        }
    };

    if (fundLoading || missingGifts.length === 0) {
        return null;
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Tặng quà từ quỹ chung
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Chuyển quà từ quỹ chung</AlertDialogTitle>
                    <AlertDialogDescription>
                        <div className="space-y-4 mt-4">
                            <div>
                                <p className="font-medium">Số tiền quỹ chung hiện có:</p>
                                <p className="text-lg text-teal-600 font-semibold">
                                    {commonFund?.totalAmount?.toLocaleString() || 0} VNĐ
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">Danh sách quà còn thiếu:</p>
                                <div className="space-y-2 mt-2">
                                    {missingGifts.map((gift, index) => (
                                        <div key={index} className="flex justify-between">
                                            <span>{gift.giftType}</span>
                                            <span className="text-teal-600">
                                                {gift.missingAmount} {gift.unit}
                                                {` (${gift.missingCost.toLocaleString()} VNĐ)`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-2 font-semibold">
                                    Tổng giá trị: {totalMissingCost.toLocaleString()} VNĐ
                                </p>
                            </div>
                            {!canDonate && (
                                <div className="text-red-500">
                                    Số tiền trong quỹ chung không đủ để thực hiện
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="purpose">Nội dung:</Label>
                                <Textarea
                                    id="purpose"
                                    placeholder="Nhập mục đích chuyển quà..."
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="hover:bg-gray-200">
                        Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDonate}
                        className="bg-blue-500 hover:bg-blue-700 text-white"
                        disabled={isLoading || !canDonate || !purpose.trim()}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý
                            </>
                        ) : (
                            'Xác nhận tặng quà'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DonatePhysicalGiftsFromFund;