import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from 'sonner';
import { useGetCampaignEstimatedDisbursementPlanQuery, useCreateCampaignDisbursementPlanMutation } from '@/redux/campaign/campaignApi';
import { formatNumber, parseNumber } from '@/lib/utils';
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
import * as z from 'zod';
const adjustDate = (date) => {
    if (!date) return null;
    const newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
    return newDate;
};
const CampaignSuspended = ({ onCancel, onSuccess, id, userID }) => {
    const { data: estimatedPlan, isLoading: isLoadingPlan } = useGetCampaignEstimatedDisbursementPlanQuery(id);
    const [createPlan] = useCreateCampaignDisbursementPlanMutation();
    const [isValidForm, setIsValidForm] = React.useState(false);

    const createDisbursementSchema = React.useMemo(() => {
        const totalPlannedAmount = estimatedPlan?.totalPlannedAmount || 0;
        return z.object({
            plannedStartDate: z.date({
                required_error: "Vui lòng chọn ngày bắt đầu",
            }),
            plannedEndDate: z.date({
                required_error: "Vui lòng chọn ngày kết thúc",
            }),
            totalPlannedAmount: z.number().optional(),
            stages: z.array(
                z.object({
                    stageNumber: z.number(),
                    disbursementAmount: z.number()
                        .min(1, "Số tiền giải ngân phải lớn hơn 0")
                        .max(totalPlannedAmount * 0.5, "Số tiền giải ngân của một giai đoạn không được vượt quá 50% tổng số tiền dự kiến"),
                    scheduledDate: z.date(),
                    description: z.string().min(1, "Vui lòng nhập hoạt động")
                })
            )
        }).refine(
            (data) => data.plannedEndDate > data.plannedStartDate,
            {
                message: "Ngày kết thúc phải lớn hơn ngày bắt đầu",
                path: ["plannedEndDate"]
            }
        ).superRefine((data, ctx) => {
            const totalDisbursementAmount = data.stages.reduce((sum, stage) => sum + stage.disbursementAmount, 0);
            if (Math.abs(totalDisbursementAmount - totalPlannedAmount) > 0.01) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Tổng số tiền giải ngân phải bằng tổng số tiền dự kiến",
                    path: ["stages"]
                });
            }

            for (let i = 1; i < data.stages.length; i++) {
                const prevDate = data.stages[i - 1].scheduledDate;
                const currentDate = data.stages[i].scheduledDate;

                const daysDifference = Math.floor(
                    (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysDifference < 30) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Khoảng cách giữa  ngày giải ngân sau phải lớn hơn ngày giải ngân trước 30 ngày ",
                        path: ["stages", i, "scheduledDate"]
                    });
                }

                if (currentDate <= prevDate) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Ngày giải ngân sau phải lớn hơn ngày giải ngân trước",
                        path: ["stages", i, "scheduledDate"]
                    });
                }
            }
        });
    }, [estimatedPlan?.totalPlannedAmount]);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        trigger
    } = useForm({
        resolver: zodResolver(createDisbursementSchema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            plannedStartDate: adjustDate(new Date()),
            plannedEndDate: adjustDate(new Date()),
            totalPlannedAmount: 0,
            stages: []
        }
    });

    const checkFormValidity = React.useCallback(async () => {
        const isValid = await trigger();
        setIsValidForm(isValid);
    }, [trigger]);

    React.useEffect(() => {
        if (estimatedPlan) {
            reset({
                plannedStartDate: adjustDate(new Date(estimatedPlan.plannedStartDate)),
                plannedEndDate: adjustDate(new Date(estimatedPlan.plannedEndDate)),
                totalPlannedAmount: estimatedPlan.totalPlannedAmount,
                stages: estimatedPlan.simplifiedStages.map(stage => ({
                    stageNumber: stage.stageNumber,
                    disbursementAmount: stage.disbursementAmount,
                    scheduledDate: adjustDate(new Date(stage.scheduledDate)),
                    description: stage.description || ''
                }))
            });
        }
    }, [estimatedPlan, reset]);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            checkFormValidity();
            if (name === 'plannedStartDate') {
                const stages = value.stages;
                if (stages && stages.length > 0) {
                    const updatedStages = [...stages];
                    updatedStages[0] = {
                        ...updatedStages[0],
                        scheduledDate: adjustDate(value.plannedStartDate)
                    };
                    reset({ ...value, stages: updatedStages }, { keepDefaultValues: true });
                }
            }
            if (name === 'plannedEndDate') {
                const stages = value.stages;
                if (stages && stages.length > 0) {
                    const updatedStages = [...stages];
                    updatedStages[stages.length - 1] = {
                        ...updatedStages[stages.length - 1],
                        scheduledDate: adjustDate(value.plannedEndDate)
                    };
                    reset({ ...value, stages: updatedStages }, { keepDefaultValues: true });
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, reset, checkFormValidity]);
    const calculateTotalDisbursement = React.useMemo(() => {
        return (stages) => {
            return stages.reduce((sum, stage) => sum + (stage.disbursementAmount || 0), 0);
        };
    }, []);
    const onSubmitForm = async (data) => {
        try {
            const formattedData = {
                campaignId: id,
                plannedStartDate: adjustDate(data.plannedStartDate).toISOString(),
                plannedEndDate: adjustDate(data.plannedEndDate).toISOString(),
                disbursementStages: data.stages.map(stage => ({
                    disbursementAmount: stage.disbursementAmount,
                    scheduledDate: adjustDate(stage.scheduledDate).toISOString(),
                    description: stage.description
                })),
                campaignStatus: 9,
                userID: userID
            };
            await createPlan(formattedData).unwrap();
            toast.success('Kế hoạch giải ngân đã được cập nhật thành công');
            onSuccess();
        } catch (error) {
            if (error.status === 400) {
                toast.error('Bạn không thể tạm ngưng chiến dịch vì Yêu cầu giải ngân chưa được giải quyết');
            } else {
                toast.error('Có lỗi xảy ra khi cập nhật kế hoạch giải ngân');
            }
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
                <CardHeader className="bg-yellow-600 text-white">
                    <CardTitle className="text-2xl font-semibold">Tạm Ngưng Chiến Dịch</CardTitle>
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
                            <div className="text-lg font-medium">
                                Tổng số tiền:
                                <span className={`ml-2 ${calculateTotalDisbursement(watch('stages')) !== watch('totalPlannedAmount') ? 'text-red-500' : 'text-green-600'}`}>
                                    {formatNumber(calculateTotalDisbursement(watch('stages')))} / {formatNumber(watch('totalPlannedAmount'))}
                                </span>
                            </div>
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
                                                                    }}
                                                                    variant="outline"
                                                                    disablePastDates={true}
                                                                    disabled={index === 0 || index === watch('stages').length - 1}
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
                                                    <Controller
                                                        name={`stages.${index}.description`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input
                                                                {...field}
                                                                placeholder="Mô tả giai đoạn"
                                                                className="h-10"
                                                            />
                                                        )}
                                                    />
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

                            {isValidForm ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            type="button"
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white h-12"
                                        >
                                            Tạm Ngưng
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white p-6 rounded-lg shadow-lg">
                                        <AlertDialogHeader className="border-b pb-2 mb-4">
                                            <AlertDialogTitle className="text-xl font-semibold text-gray-800">
                                                Xác nhận Tạm Ngưng Chiến Dịch
                                            </AlertDialogTitle>
                                        </AlertDialogHeader>
                                        <AlertDialogDescription className="space-y-4">
                                            <p className="text-gray-700">
                                                - Hành động này sẽ tạm ngưng chiến dịch.
                                            </p>
                                            <p className="text-gray-700">
                                                - Chiến dịch này sẽ tạm thời không có người bảo lãnh cho đến khi có người bảo lãnh mới.
                                            </p>
                                        </AlertDialogDescription>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleSubmit(onSubmitForm)}
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Đang xử lý
                                                    </>
                                                ) : (
                                                    'Xác nhận Tạm Ngưng'
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <Button
                                    type="button"
                                    disabled
                                    className="bg-gray-400 text-white h-12 cursor-not-allowed"
                                >
                                    Tạm ngưng
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CampaignSuspended;