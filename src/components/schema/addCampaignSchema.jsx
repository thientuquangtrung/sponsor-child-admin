import * as z from 'zod';

const addCampaignSchema = z.object({
    childName: z.string().min(1, "Vui lòng nhập tên trẻ."),
    childBirthYear: z.number({
        required_error: "Vui lòng nhập năm sinh",
        invalid_type_error: "Năm sinh không hợp lệ"
    })
        .min(new Date().getFullYear() - 16, "Trẻ phải dưới 17 tuổi")
        .max(new Date().getFullYear(), "Năm sinh không hợp lệ"),
    childGender: z.number().min(0).max(1),
    childLocation: z.string().min(1, "Vui lòng nhập địa chỉ trẻ."),
    childIdentificationInformationFile: z
        .any()
        .refine((val) => val !== null, "Vui lòng tải thông tin định danh trẻ")
        .refine((val) => val && val.size <= 10 * 1024 * 1024, "Kích thước tệp không được vượt quá 10MB"),
    provinceId: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
    districtId: z.string().min(1, "Vui lòng chọn quận/huyện"),
    wardId: z.string().min(1, "Vui lòng chọn phường/xã"),
    title: z.string().min(1, "Bạn vui lòng nhập Tiêu Đề chiến dịch"),
    childIdentificationCode: z.string().optional(),
    story: z.string().min(1, "Bạn vui lòng nhập thông tin chi tiết về chiến dịch"),
    targetAmount: z.string()
        .refine((val) => {
            const numericValue = parseFloat(val.replace(/,/g, ''));
            return !isNaN(numericValue) && numericValue >= 10000000;
        }, { message: "Số tiền mục tiêu tối thiểu là 10,000,000đ" })
        .refine((val) => {
            const numericValue = parseFloat(val.replace(/,/g, ''));
            return !isNaN(numericValue) && numericValue <= 50000000000;
        }, { message: "Số tiền mục tiêu tối đa là 50,000,000,000đ" }),
    startDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    endDate: z.date().optional().nullable(),
    thumbnailUrl: z.any().refine((val) => val !== null, "Bạn vui lòng tải lên hình ảnh cho chiến dịch")
        .refine((val) => val && val.size <= 10 * 1024 * 1024, "Kích thước tệp không được vượt quá 10MB"),

    imagesFolderUrl: z.array(z.any()).optional(),
    campaignType: z.number({
        required_error: "Vui lòng chọn loại chiến dịnh",
    }),
    plannedStartDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu dự kiến",
        invalid_type_error: "Vui lòng chọn bắt đầu dự kiến",
    }),
    plannedEndDate: z.date({
        required_error: "Vui lòng chọn ngày kết thúc dự kiến",
        invalid_type_error: "Vui lòng chọn ngày kết thúc dự kiến",
    }),
    disbursementStages: z.array(z.object({
        disbursementAmount: z.number({
            required_error: "Vui lòng nhập số tiền giải ngân",
            invalid_type_error: "Số tiền giải ngân phải là số"
        }).refine((val) => val > 0, { message: "Số tiền giải ngân phải lớn hơn 0" }),
        scheduledDate: z.date({
            required_error: "Vui lòng chọn ngày giải ngân",
            invalid_type_error: "Ngày giải ngân không hợp lệ"
        }),
        description: z.string().min(1, "Vui lòng nhập hoạt động giải ngân"),
    }))
}).superRefine((data, ctx) => {
    // Validate target amount
    const targetAmount = parseFloat(data.targetAmount.replace(/,/g, ''));
    const isValidTargetAmount = !isNaN(targetAmount) && targetAmount > 0;

    if (!isValidTargetAmount) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vui lòng nhập số tiền mục tiêu trước khi nhập các giai đoạn giải ngân",
            path: ["targetAmount"]
        });
    }
    if (data.endDate && data.endDate <= data.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày kết thúc phải sau ngày bắt đầu",
            path: ["endDate"]
        });
    }
    if (data.plannedStartDate <= data.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày bắt đầu giải ngân dự kiến phải sau ngày bắt đầu chiến dịch",
            path: ["plannedStartDate"]
        });
    }
    const stages = data.disbursementStages;
    for (let i = 1; i < stages.length; i++) {
        const daysDifference = (stages[i].scheduledDate.getTime() - stages[i - 1].scheduledDate.getTime()) / (1000 * 3600 * 24);
        if (daysDifference < 30) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Khoảng cách giữa các ngày giải ngân phải ít nhất 30 ngày",
                path: ["disbursementStages", i, "scheduledDate"],
            });
        }
    }
});
export default addCampaignSchema;