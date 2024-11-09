import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DatePicker } from '@/components/ui/date-picker';

export const Schedule = ({ form }) => {
    return (
        <div className="flex justify-between">
            <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ngày Bắt Đầu</FormLabel>
                        <FormControl>
                            <DatePicker
                                date={field.value}
                                onDateSelect={(date) => field.onChange(date)}
                                variant="outline"
                                disablePastDates={true}
                                className="ml-2"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                    <FormItem className="text-right">
                        <FormLabel>Ngày Kết Thúc</FormLabel>
                        <FormControl>
                            <DatePicker
                                date={field.value}
                                onDateSelect={(date) => field.onChange(date)}
                                variant="outline"
                                disablePastDates={true}
                                className="ml-2"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};