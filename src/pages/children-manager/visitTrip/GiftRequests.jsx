import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from 'lucide-react';
import { useFieldArray } from "react-hook-form";
import { formatNumber } from '@/lib/utils';

export const GiftRequests = ({ form }) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "giftRequestDetails"
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Quà tặng phù hợp chuyến thăm</h3>
                {fields.length === 0 && (
                    <p className="text-gray-500 text-sm">
                        Chưa có quà tặng nào được thêm
                    </p>
                )}
                <Button
                    type="button"
                    className="transition-colors bg-gradient-to-t from-rose-100 to-teal-100 hover:bg-normal"
                    size="sm"
                    onClick={() => append({ giftType: "", amount: "", unit: "" })}
                >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Thêm quà tặng
                </Button>
            </div>

            {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-end">
                    <FormField
                        control={form.control}
                        name={`giftRequestDetails.${index}.giftType`}
                        render={({ field }) => (
                            <FormItem className="col-span-3">
                                <FormLabel>Loại quà</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ví dụ: Sách, Áo thun"
                                        {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`giftRequestDetails.${index}.amount`}
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Số lượng</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        placeholder="Nhập số lượng"
                                        min="1"
                                        onKeyDown={(e) => {
                                            if (e.key === '-') {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={(e) => {
                                            const value = Math.max(1, parseInt(e.target.value) || 1);
                                            field.onChange(value.toString());
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`giftRequestDetails.${index}.unit`}
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Đơn vị</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ví dụ: Quyển, Chiếc"
                                        {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`giftRequestDetails.${index}.unitPrice`}
                        render={({ field }) => (
                            <FormItem className="col-span-4">
                                <FormLabel>Đơn giá cho 1 món quà (VNĐ)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="Nhập đơn giá"
                                        {...field}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^\d]/g, '');
                                            field.onChange(formatNumber(value));
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="col-span-1 flex items-center justify-end">

                        <Button
                            type="button"
                            size="icon"
                            className="w-10 h-10 hover:bg-red-300 transition-colors text-red-500 bg-red-100 rounded-full"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};