import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DatePicker } from '@/components/ui/date-picker';

const setLocalDateWithoutTime = (date) => {
    if (!date) return null;
    const localDate = new Date(date);
    localDate.setHours(0, 0, 0, 0);
    return localDate;
};

const formatDateForServer = (date) => {
    if (!date) return null;
    const localDate = new Date(date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000Z`;
};

export const Schedule = ({ form }) => {
    return (
        <div className="flex justify-between">
            <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <FormControl>
                            <DatePicker
                                date={setLocalDateWithoutTime(field.value)}
                                onDateSelect={(date) => {
                                    const formattedDate = formatDateForServer(date);
                                    field.onChange(new Date(formattedDate));
                                }}
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
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <FormControl>
                            <DatePicker
                                date={setLocalDateWithoutTime(field.value)}
                                onDateSelect={(date) => {
                                    const formattedDate = formatDateForServer(date);
                                    field.onChange(new Date(formattedDate));
                                }}
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

export const RegistrationDates = ({ form }) => {
    return (
        <div className="flex justify-between">
            <FormField
                control={form.control}
                name="registrationStartDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ngày mở đăng ký</FormLabel>
                        <FormControl>
                            <DatePicker
                                date={setLocalDateWithoutTime(field.value)}
                                onDateSelect={(date) => {
                                    const formattedDate = formatDateForServer(date);
                                    field.onChange(new Date(formattedDate));
                                }}
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
                name="registrationEndDate"
                render={({ field }) => (
                    <FormItem className="text-right">
                        <FormLabel>Ngày đóng đăng ký</FormLabel>
                        <FormControl>
                            <DatePicker
                                date={setLocalDateWithoutTime(field.value)}
                                onDateSelect={(date) => {
                                    const formattedDate = formatDateForServer(date);
                                    field.onChange(new Date(formattedDate));
                                }}
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