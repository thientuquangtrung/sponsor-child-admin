
import React from 'react';
import { useFieldArray } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ActivitiesList = ({ form, dayIndex }) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: `travelItineraryDetails.${dayIndex}.activities`
    });

    return (
        <div className="space-y-4">
            <Button
                type="button"
                size="sm"
                className="hover:bg-normal transition-colors bg-teal-50 text-teal-600"
                onClick={() => append({ startTime: "", endTime: "", description: "" })}
            >
                <PlusCircle className="w-4 h-4 mr-2" />
                Thêm hoạt động
            </Button>

            {fields.length > 0 && (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader >
                            <TableRow className="bg-gradient-to-r from-rose-100 to-teal-100 hover:bg-normal">
                                <TableHead className="px-4 py-2 text-center text-black">Giờ bắt đầu</TableHead>
                                <TableHead className="px-4 py-2 text-center text-black">Giờ kết thúc</TableHead>
                                <TableHead className="px-4 py-2 text-center text-black">Mô tả hoạt động</TableHead>
                                <TableHead className="px-4 py-2 text-center text-black">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, activityIndex) => (
                                <TableRow key={field.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <TableCell className="px-4 py-2">
                                        <FormField
                                            control={form.control}
                                            name={`travelItineraryDetails.${dayIndex}.activities.${activityIndex}.startTime`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="time"
                                                            {...field}
                                                            className="border-gray-200 focus:border-blue-300 focus:ring-teal-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        <FormField
                                            control={form.control}
                                            name={`travelItineraryDetails.${dayIndex}.activities.${activityIndex}.endTime`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="time"
                                                            {...field}
                                                            className="border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell className="px-4 py-2">
                                        <FormField
                                            control={form.control}
                                            name={`travelItineraryDetails.${dayIndex}.activities.${activityIndex}.description`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            className="border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell className="px-4 py-2 text-center">
                                        <Button
                                            type="button"
                                            size="icon"
                                            className="hover:bg-red-300 transition-colors text-red-500 bg-red-100 rounded-full"
                                            onClick={() => remove(activityIndex)}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default ActivitiesList;
