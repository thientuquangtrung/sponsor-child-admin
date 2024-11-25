

import React, { useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import ActivitiesList from '@/pages/children-manager/visitTrip/ActivitiesList';

export const Activities = ({ form }) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'travelItineraryDetails',
    });


    const [isExpanded, setIsExpanded] = useState(false);
    const toggleSection = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">Lịch trình chuyến thăm</h3>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="hover:bg-rose-50 transition-colors"
                        onClick={toggleSection}
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div>
                    <Button
                        type="button"
                        size="sm"
                        className="transition-colors bg-gradient-to-l from-rose-100 to-teal-100 hover:bg-normal"
                        onClick={() => append({ date: '', activities: [] })}
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Thêm ngày
                    </Button>
                    {fields.map((field, dayIndex) => (
                        <div key={field.id} className="p-4 bg-white transition-shadow rounded-lg">
                            <div className="flex justify-between items-center pb-4">
                                <FormField
                                    control={form.control}
                                    name={`travelItineraryDetails.${dayIndex}.date`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center">
                                            <FormLabel className="text-gray-700 mr-2">Ngày</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    onDateSelect={(date) => {
                                                        const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                                                        field.onChange(adjusted);
                                                    }}
                                                    variant="outline"
                                                    disablePastDates={true}
                                                    className="border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center space-x-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="hover:bg-red-600 transition-colors"
                                        onClick={() => remove(dayIndex)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <ActivitiesList form={form} dayIndex={dayIndex} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
