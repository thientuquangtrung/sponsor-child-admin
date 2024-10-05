import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const PROVINCES = [
    { id: 1, name: "Hà Nội" },
    { id: 2, name: "TP.HCM" },
    { id: 3, name: "Đà Nẵng" },
];

const visitFormSchema = z.object({
    visitName: z.string()
        .min(1, "Vui lòng nhập tên chuyến thăm")
        .min(5, "Tên chuyến thăm cần ít nhất 5 ký tự"),
    provinceId: z.string({
        required_error: "Vui lòng chọn tỉnh/thành",
    }),
    visitDateStart: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    visitTimeStart: z.string({
        required_error: "Vui lòng chọn giờ bắt đầu",
    }),
    visitDateEnd: z.date({
        required_error: "Vui lòng chọn ngày kết thúc",
    }),
    visitTimeEnd: z.string({
        required_error: "Vui lòng chọn giờ kết thúc",
    }),
    numberOfVisitors: z.string()
        .min(1, "Vui lòng nhập số lượng người thăm")
        .refine((val) => !isNaN(val) && parseInt(val) > 0, {
            message: "Số lượng người thăm phải là số dương",
        }),
    visitCost: z.string()
        .min(1, "Vui lòng nhập chi phí")
        .refine((val) => !isNaN(val) && parseFloat(val) >= 0, {
            message: "Chi phí không được âm",
        }),
    description: z.string()
        .min(1, "Vui lòng nhập mô tả")
        .min(10, "Mô tả cần ít nhất 10 ký tự"),
}).refine((data) => {
    const startDate = new Date(
        data.visitDateStart.setHours(
            ...data.visitTimeStart.split(':').map(Number)
        )
    );
    const endDate = new Date(
        data.visitDateEnd.setHours(
            ...data.visitTimeEnd.split(':').map(Number)
        )
    );
    return endDate > startDate;
}, {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["visitDateEnd"],
});

const VisitForm = () => {
    const form = useForm({
        resolver: zodResolver(visitFormSchema),
        defaultValues: {
            visitName: "",
            provinceId: "",
            visitDateStart: undefined,
            visitTimeStart: "",
            visitDateEnd: undefined,
            visitTimeEnd: "",
            numberOfVisitors: "",
            visitCost: "",
            description: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            const formattedData = {
                ...data,
                provinceId: parseInt(data.provinceId),
                numberOfVisitors: parseInt(data.numberOfVisitors),
                visitCost: parseFloat(data.visitCost),
                startTime: new Date(
                    data.visitDateStart.setHours(
                        ...data.visitTimeStart.split(':').map(Number)
                    )
                ),
                endTime: new Date(
                    data.visitDateEnd.setHours(
                        ...data.visitTimeEnd.split(':').map(Number)
                    )
                ),
            };


            form.reset();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-6">
            <h1 className="text-3xl font-bold mb-6 text-center text-primary">TẠO CHUYẾN THĂM</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-2xl">
                    <FormField
                        control={form.control}
                        name="visitName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tên chuyến thăm</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nhập tên chuyến thăm" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="provinceId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tỉnh/Thành phố</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn tỉnh/thành" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {PROVINCES.map((province) => (
                                            <SelectItem key={province.id} value={province.id.toString()}>
                                                {province.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="visitDateStart"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Ngày bắt đầu</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Chọn ngày</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="visitTimeStart"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giờ bắt đầu</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="visitDateEnd"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Ngày kết thúc</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Chọn ngày</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date() ||
                                                        (form.getValues("visitDateStart") && date < form.getValues("visitDateStart"))
                                                    }
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="visitTimeEnd"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giờ kết thúc</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="numberOfVisitors"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số lượng người thăm</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="visitCost"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Chi phí (VNĐ)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1000"
                                            placeholder="0"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mô tả chi tiết</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Nhập mô tả chi tiết về chuyến thăm..."
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-center">

                        <Button className="w-2/4 bg-[#25a5a7] text-white" type="submit">Tạo chuyến thăm</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default VisitForm;