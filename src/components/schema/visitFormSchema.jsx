import * as z from 'zod';

export const visitFormSchema = z.object({
    title: z.string().min(1, "Bạn vui lòng nhập Tiêu đề chyến thăm"),
    description: z.string().min(1, "Bạn vui lòng nhập thông tin chi tiết về chuyến thăm"),
    visitCost: z.string()
        .refine((val) => {
            const numericValue = parseFloat(val.replace(/,/g, ''));
            return !isNaN(numericValue) && numericValue >= 10000;
        }, { message: "Chi phí dự kiến tối thiểu là 10,000" })
        .refine((val) => {
            const numericValue = parseFloat(val.replace(/,/g, ''));
            return !isNaN(numericValue) && numericValue <= 5000000;
        }, { message: "Chi phí dự kiến tối đa là 5,000,000" })
        .refine((val) => {
            const numericValue = parseFloat(val.replace(/,/g, ''));
            return !isNaN(numericValue) && numericValue % 1000 === 0;
        }, { message: "Chi phí phải là bội số của 1,000" }),
    province: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
    startDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    endDate: z.date({
        required_error: "Vui lòng chọn ngày kết thúc",
    }),
    maxParticipants: z.string()
        .min(1, "Vui lòng nhập số lượng người tham gia")
        .refine((val) => !isNaN(val) && parseInt(val) > 0, {
            message: "Số lượng người tham gia phải là số dương",
        }),
    travelItineraryDetails: z.array(z.object({
        date: z.date({
            required_error: "Vui lòng chọn ngày",
        }),
        activities: z.array(z.object({
            startTime: z.string(),
            endTime: z.string(),
            description: z.string().min(1, "Vui lòng nhập mô tả hoạt động")
        }))
    })),
    giftRequestDetails: z.array(z.object({
        giftType: z.string().min(1, "Vui lòng nhập loại quà"),
        amount: z.string().min(1, "Số lượng phải lớn hơn 0"),
        unit: z.string().min(1, "Vui lòng nhập đơn vị")
    })),
    thumbnailUrl: z.any().refine((val) => val !== null, "Bạn vui lòng tải lên hình ảnh cho chiến dịch")
        .refine((val) => val && val.size <= 10 * 1024 * 1024, "Kích thước tệp không được vượt quá 10MB"),
    imagesFolderUrl: z.array(z.any()).optional(),
}).refine((data) => {
    return new Date(data.endDate) > new Date(data.startDate);
}, {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["endDate"],
});