import * as z from 'zod';

export const visitFormSchema = z.object({
    title: z.string().min(1, "Bạn vui lòng nhập Tiêu đề chuyến thăm"),
    description: z.string().min(1, "Bạn vui lòng nhập thông tin chi tiết về chuyến thăm"),
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
        invalid_type_error: "Vui lòng chọn ngày bắt đầu",
    }),
    endDate: z.date({
        required_error: "Vui lòng chọn ngày kết thúc",
        invalid_type_error: "Vui lòng chọn ngày kết thúc",
    }),
    registrationStartDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu nhận đăng ký",
        invalid_type_error: "Vui lòng chọn ngày bắt đầu nhận đăng ký",
    }),
    registrationEndDate: z.date({
        required_error: "Vui lòng chọn ngày kết thúc nhận đăng ký",
        invalid_type_error: "Vui lòng chọn ngày kết thúc nhận đăng ký",
    }),
    maxParticipants: z.string()
        .min(1, "Vui lòng nhập số lượng người tham gia")
        .refine((val) => !isNaN(val) && parseInt(val) > 0, {
            message: "Số lượng người tham gia phải là số dương",
        }),
    travelItineraryDetails: z.array(z.object({
        date: z.date({
            required_error: "Vui lòng chọn ngày",
            invalid_type_error: "Vui lòng chọn ngày",
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
        unit: z.string().min(1, "Vui lòng nhập đơn vị"),
        unitPrice: z.string()
            .refine((val) => {
                const numericValue = parseFloat(val.replace(/,/g, ''));
                return !isNaN(numericValue) && numericValue >= 0;
            }, { message: "Đơn giá phải lớn hơn 0" })
    })),
    thumbnailUrl: z.any().refine((val) => val !== null, "Bạn vui lòng tải lên hình ảnh cho chuyến thăm")
        .refine((val) => val && val.size <= 10 * 1024 * 1024, "Kích thước tệp không được vượt quá 10MB"),
    imagesFolderUrl: z.array(z.any()).optional(),
})
    .superRefine((data, ctx) => {
        if (data.registrationEndDate <= data.registrationStartDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký",
                path: ["registrationEndDate"]
            });
        }

        const registrationEndDate = new Date(data.registrationEndDate);
        const visitStartDate = new Date(data.startDate);
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        if (visitStartDate.getTime() - registrationEndDate.getTime() < sevenDaysInMs) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ngày bắt đầu chuyến thăm phải sau ngày đóng đăng ký ít nhất 7 ngày",
                path: ["startDate"]
            });
        }

        if (data.endDate <= data.startDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ngày kết thúc phải sau ngày bắt đầu",
                path: ["endDate"]
            });
        }

        data.travelItineraryDetails.forEach((itinerary, index) => {
            const itineraryDate = new Date(itinerary.date);
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);

            if (itineraryDate < startDate || itineraryDate > endDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Ngày trong lịch trình phải nằm trong khoảng từ ngày bắt đầu đến ngày kết thúc",
                    path: ["travelItineraryDetails", index, "date"]
                });
            }
        });
    });