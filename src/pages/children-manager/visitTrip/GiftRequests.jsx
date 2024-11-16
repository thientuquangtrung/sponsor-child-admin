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
                    className="hover:bg-teal-500 transition-colors bg-[#2fabab] text-white"
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
                                    <Input type="number" min="1" {...field} />
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
                        className="w-8 h-8 hover:bg-red-300 transition-colors text-white bg-red-500"
                        onClick={() => remove(index)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ))}
        </div>
    );
};