import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from 'lucide-react';
import { useFieldArray } from "react-hook-form";

export const GiftRequests = ({ form }) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "giftRequestDetails"
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Quà tặng phù hợp chuyến thăm</h3>
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
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <FormField
                        control={form.control}
                        name={`giftRequestDetails.${index}.giftType`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Loại quà</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`giftRequestDetails.${index}.amount`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số lượng</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
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
                            <FormItem>
                                <FormLabel>Đơn vị</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="button"
                        size="icon"
                        className="w-10 h-10 hover:bg-red-300 transition-colors text-red-500 bg-red-100 rounded-full"
                        onClick={() => remove(index)}
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            ))}
        </div>
    );
};