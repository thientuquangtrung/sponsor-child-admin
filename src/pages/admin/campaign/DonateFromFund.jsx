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
import { useDonateFromCommonFundMutation } from '@/redux/campaign/campaignApi';

const DonateFromFund = ({ campaignId, targetAmount, raisedAmount, userId, onSuccess }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [purpose, setPurpose] = React.useState('');
    const { data: commonFund, isLoading: fundLoading } = useGetCommonFundsQuery();
    const [donateFromCommonFund] = useDonateFromCommonFundMutation();

    const remainingAmount = targetAmount - raisedAmount;
    const canDonate = commonFund?.totalAmount >= remainingAmount;

    const handleDonate = async () => {
        if (!purpose.trim()) {
            toast.error('Vui lòng nhập mục đích chuyển tiền');
            return;
        }

        try {
            setIsLoading(true);
            await donateFromCommonFund({
                campaignId,
                userID: userId,
                purpose: purpose.trim()
            }).unwrap();

            toast.success('Chuyển tiền từ quỹ chung thành công');
            onSuccess?.();
        } catch (error) {
            console.error('Error donating from common fund:', error);
            toast.error(error.data?.message || 'Có lỗi xảy ra khi chuyển tiền từ quỹ chung');
        } finally {
            setIsLoading(false);
        }
    };

    if (fundLoading) {
        return null;
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Chuyển tiền từ quỹ chung
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Chuyển tiền từ quỹ chung</AlertDialogTitle>
                    <AlertDialogDescription>
                        <div className="space-y-4 mt-4">
                            <div>
                                <p className="font-medium">Số tiền quỹ chung hiện có:</p>
                                <p className="text-lg text-teal-600 font-semibold">
                                    {commonFund?.totalAmount?.toLocaleString() || 0} VNĐ
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">Số tiền cần chuyển:</p>
                                <p className="text-lg text-teal-600 font-semibold">
                                    {remainingAmount.toLocaleString()} VNĐ
                                </p>
                            </div>
                            {!canDonate && (
                                <div className="text-red-500">
                                    Số tiền trong quỹ chung không đủ để thực hiện
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="purpose">Mục đích:</Label>
                                <Textarea
                                    id="purpose"
                                    placeholder="Nhập mục đích chuyển tiền..."
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
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
                            'Xác nhận chuyển tiền'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DonateFromFund;