import React, { useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Trash2 } from 'lucide-react';

const DisbursementInfo = ({ campaignType }) => {
    const { control, watch, formState: { errors } } = useFormContext();
    const targetAmount = parseFloat(watch('targetAmount')?.replace(/,/g, '') || '0');

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'disbursementStages',
    });

    const totalDisbursement = fields.reduce((sum, field, index) => {
        const amount = watch(`disbursementStages.${index}.disbursementAmount`) || 0;
        return sum + parseFloat(amount);
    }, 0);

    const handleRemove = (index) => {
        if (index > 0) {
            remove(index);
        }
    };

    useEffect(() => {
        if (fields.length === 0) {
            append({
                disbursementAmount: 0,
                scheduledDate: null,
                description: '',
            });
        }
    }, [append, fields.length]);

    const formatCurrency = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Kế hoạch dự kiến giải ngân</h2>
            <div className="flex justify-between">
                <FormField
                    control={control}
                    name="plannedStartDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ngày Bắt Đầu Dự Kiến Giải Ngân</FormLabel>
                            <FormControl>
                                <DatePicker
                                    date={field.value}
                                    onDateSelect={(date) => field.onChange(date)}
                                    variant="outline"
                                    disablePastDates={true}
                                    className={`ml-2 ${errors.plannedStartDate ? 'border-red-500' : ''}`}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="plannedEndDate"
                    render={({ field }) => (
                        <FormItem className="text-right">
                            <FormLabel>Ngày Kết Thúc Dự Kiến Giải Ngân</FormLabel>
                            <FormControl>
                                <DatePicker
                                    date={field.value}
                                    onDateSelect={(date) => field.onChange(date)}
                                    variant="outline"
                                    disablePastDates={true}
                                    className={`ml-2 ${errors.plannedEndDate ? 'border-red-500' : ''}`}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="overflow-x-auto">
                <Table className="border-collapse border border-slate-400">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="border border-slate-300 font-semibold text-center">
                                Giai đoạn
                            </TableHead>
                            <TableHead className="border border-slate-300 font-semibold">
                                Số tiền giải ngân
                            </TableHead>
                            <TableHead className="border border-slate-300 font-semibold text-center">
                                Tỷ lệ
                            </TableHead>
                            <TableHead className="border border-slate-300 font-semibold">
                                Ngày giải ngân
                            </TableHead>
                            <TableHead className="border border-slate-300 font-semibold">
                                Mô tả hoạt động
                            </TableHead>
                            <TableHead className="border border-slate-300 w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {fields.map((field, index) => {
                            const amount = watch(`disbursementStages.${index}.disbursementAmount`) || 0;
                            const percentage = targetAmount > 0
                                ? ((amount / targetAmount) * 100).toFixed(2)
                                : '0.00';

                            return (
                                <TableRow key={field.id}>
                                    <TableCell className="text-center font-medium">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <FormField
                                            control={control}
                                            name={`disbursementStages.${index}.disbursementAmount`}
                                            render={({ field: inputField }) => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <Input
                                                            type="text"
                                                            placeholder="Nhập số tiền"
                                                            value={formatCurrency(inputField.value)}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/[^\d]/g, '');
                                                                const numericValue = parseFloat(value) || 0;

                                                                if (numericValue <= 1000000000) {
                                                                    inputField.onChange(numericValue);
                                                                }
                                                            }}
                                                            className={`text-right ${errors.disbursementStages?.[index]?.disbursementAmount
                                                                ? 'border-red-500'
                                                                : ''
                                                                }`}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                    </TableCell>
                                    <TableCell className="text-center font-medium text-blue-600">
                                        {Math.round(percentage)}%
                                    </TableCell>

                                    <TableCell>
                                        <FormField
                                            control={control}
                                            name={`disbursementStages.${index}.scheduledDate`}
                                            render={({ field: dateField }) => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <DatePicker
                                                            date={dateField.value}
                                                            onDateSelect={(date) => dateField.onChange(date)}
                                                            variant="outline"
                                                            disablePastDates={true}
                                                            className={`w-full ${errors.disbursementStages?.[index]?.scheduledDate
                                                                ? 'border-red-500'
                                                                : ''
                                                                }`}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <FormField
                                            control={control}
                                            name={`disbursementStages.${index}.description`}
                                            render={({ field: descField }) => (
                                                <FormItem className="space-y-0">
                                                    <FormControl>
                                                        <Textarea
                                                            {...descField}
                                                            placeholder="Nhập mô tả hoạt động"
                                                            className={`min-h-[60px] ${errors.disbursementStages?.[index]?.description
                                                                ? 'border-red-500'
                                                                : ''
                                                                }`}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {index > 0 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleRemove(index)}
                                                disabled={campaignType === 0 && fields.length <= 2}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>


                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm">
                        <span className="font-medium">Tổng số tiền giải ngân: </span>
                        <span className={`font-bold ${totalDisbursement !== targetAmount ? 'text-red-500' : 'text-green-600'}`}>
                            {formatCurrency(totalDisbursement)} VNĐ
                        </span>
                        {totalDisbursement !== targetAmount && (
                            <span className="text-red-500 ml-2">
                                (Chênh lệch: {formatCurrency(Math.abs(targetAmount - totalDisbursement))} VNĐ)
                            </span>
                        )}
                    </div>

                    {campaignType === 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const lastStage = fields[fields.length - 1];
                                const newDate = lastStage?.scheduledDate
                                    ? new Date(lastStage.scheduledDate)
                                    : new Date();
                                newDate.setMonth(newDate.getMonth() + 1);
                                append({
                                    disbursementAmount: 0,
                                    scheduledDate: newDate,
                                    description: '',
                                });
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Thêm Giai Đoạn
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DisbursementInfo;