import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateCampaignDisbursementPlanMutation, useGetCampaignEstimatedDisbursementPlanQuery } from '@/redux/campaign/campaignApi';
import { createDisbursementSchema } from '@/components/schema/disbursementSchema';
import { formatNumber, parseNumber } from '@/lib/utils';

const CampaignSuspended = ({ onCancel, onSuccess, id, userID }) => {
    const { data: estimatedPlan, isLoading: isLoadingPlan } = useGetCampaignEstimatedDisbursementPlanQuery(id);
    const [createPlan] = useCreateCampaignDisbursementPlanMutation();

    const formSchema = React.useMemo(() => {
        return createDisbursementSchema(estimatedPlan?.totalPlannedAmount || 0);
    }, [estimatedPlan?.totalPlannedAmount]);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        trigger
    } = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',

        defaultValues: {
            plannedStartDate: new Date(),
            plannedEndDate: new Date(),
            totalPlannedAmount: 0,
            stages: []
        }
    });

    React.useEffect(() => {
        if (estimatedPlan) {
            reset({
                plannedStartDate: new Date(estimatedPlan.plannedStartDate),
                plannedEndDate: new Date(estimatedPlan.plannedEndDate),
                totalPlannedAmount: estimatedPlan.totalPlannedAmount,
                stages: estimatedPlan.simplifiedStages.map(stage => ({
                    stageNumber: stage.stageNumber,
                    disbursementAmount: stage.disbursementAmount,
                    scheduledDate: new Date(stage.scheduledDate),
                    description: stage.description || ''
                }))
            });
        }
    }, [estimatedPlan, reset]);

    const onSubmitForm = async (data) => {
        try {
            const formattedData = {
                campaignId: id,
                plannedStartDate: data.plannedStartDate.toISOString(),
                plannedEndDate: data.plannedEndDate.toISOString(),
                disbursementStages: data.stages.map(stage => ({
                    disbursementAmount: stage.disbursementAmount,
                    scheduledDate: stage.scheduledDate.toISOString(),
                    description: stage.description
                })),
                campaignStatus: 9,
                userID: userID
            };
            await createPlan(formattedData).unwrap();
            toast.success('Kế hoạch giải ngân đã được cập nhật thành công');
            onSuccess();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Có lỗi xảy ra khi cập nhật kế hoạch giải ngân');
        }
    };

    if (isLoadingPlan) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    return (
        <div className="mt-6">
            <Card className="shadow-lg border-0">
                <CardHeader className="bg-teal-600 text-white">
                    <CardTitle className="text-2xl font-semibold">Cập Nhật Kế Hoạch Giải Ngân</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">
                                    Ngày bắt đầu<span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="plannedStartDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value}
                                            onDateSelect={field.onChange}
                                            variant="outline"
                                            disablePastDates={true}
                                            className={errors.plannedStartDate ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {errors.plannedStartDate && (
                                    <p className="text-red-500 text-sm">{errors.plannedStartDate.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">
                                    Ngày kết thúc<span className="text-red-500">*</span>
                                </Label>
                                <Controller
                                    name="plannedEndDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value}
                                            onDateSelect={field.onChange}
                                            variant="outline"
                                            disablePastDates={true}
                                            className={errors.plannedEndDate ? 'border-red-500' : ''}
                                        />
                                    )}
                                />
                                {errors.plannedEndDate && (
                                    <p className="text-red-500 text-sm">{errors.plannedEndDate.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">
                                    Tổng số tiền dự kiến
                                </Label>
                                <Input
                                    value={formatNumber(watch('totalPlannedAmount'))}
                                    className="h-12 text-lg"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold">Các giai đoạn giải ngân</h3>
                            {errors.stages && (
                                <p className="text-red-500 text-sm">{errors.stages.message}</p>
                            )}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Giai đoạn</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Số tiền giải ngân</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ngày giải ngân</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mô tả</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {watch('stages').map((stage, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <span className="font-medium">Giai đoạn {stage.stageNumber}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="space-y-1">
                                                        <Controller
                                                            name={`stages.${index}.disbursementAmount`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Input
                                                                    value={formatNumber(field.value)}
                                                                    onChange={(e) => {
                                                                        const value = parseNumber(e.target.value);
                                                                        field.onChange(value);
                                                                        trigger(`stages.${index}.disbursementAmount`);
                                                                        trigger('stages');
                                                                    }}
                                                                    className={`h-10 ${errors.stages?.[index]?.disbursementAmount ? 'border-red-500' : ''}`}
                                                                />
                                                            )}
                                                        />
                                                        {errors.stages?.[index]?.disbursementAmount && (
                                                            <p className="text-red-500 text-xs">
                                                                {errors.stages[index].disbursementAmount.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="space-y-1">
                                                        <Controller
                                                            name={`stages.${index}.scheduledDate`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <DatePicker
                                                                    date={field.value}
                                                                    onDateSelect={(date) => {
                                                                        field.onChange(date);
                                                                        trigger(`stages.${index}.scheduledDate`);
                                                                        trigger('stages');
                                                                    }} variant="outline"
                                                                    disablePastDates={true}
                                                                    className={errors.stages?.[index]?.scheduledDate ? 'border-red-500' : ''}
                                                                />
                                                            )}
                                                        />
                                                        {errors.stages?.[index]?.scheduledDate && (
                                                            <p className="text-red-500 text-xs">
                                                                {errors.stages[index].scheduledDate.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="space-y-1">
                                                        <Controller
                                                            name={`stages.${index}.description`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Textarea
                                                                    {...field}
                                                                    className={`min-h-[80px] ${errors.stages?.[index]?.description ? 'border-red-500' : ''}`}
                                                                />
                                                            )}
                                                        />
                                                        {errors.stages?.[index]?.description && (
                                                            <p className="text-red-500 text-xs">
                                                                {errors.stages[index].description.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="h-12"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="bg-yellow-600 hover:bg-yellow-700 text-white h-12"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý
                                    </>
                                ) : (
                                    'Xác nhận'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CampaignSuspended;