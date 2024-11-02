import * as z from 'zod';

const addCampaignSchema = z.object({
    childName: z.string().min(1, "Vui lòng nhập tên trẻ."),
    childBirthYear: z.number({
        required_error: "Vui lòng nhập năm sinh",
        invalid_type_error: "Năm sinh không hợp lệ"
    })
        .min(new Date().getFullYear() - 17, "Trẻ phải dưới 17 tuổi")
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
    story: z.string().min(1, "Bạn vui lòng nhập thông tin chi tiết về chiến dịch"),
    targetAmount: z.string().refine((val) => {
        const numericValue = parseFloat(val.replace(/,/g, ''));
        return !isNaN(numericValue) && numericValue > 0;
    }, { message: "Bạn vui lòng nhập số tiền mục tiêu lớn hơn 0" }),
    startDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    endDate: z.date({
        required_error: "Vui lòng chọn ngày kết thúc",
        invalid_type_error: "Vui lòng chọn ngày kết thúc",
    }),
    thumbnailUrl: z.any().refine((val) => val !== null, "Bạn vui lòng tải lên hình ảnh cho chiến dịch")
        .refine((val) => val && val.size <= 10 * 1024 * 1024, "Kích thước tệp không được vượt quá 10MB"),

    imagesFolderUrl: z.array(z.any()).optional(),
    campaignType: z.number({
        required_error: "Vui lòng chọn loại chiến dịch",
    }),
    plannedStartDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu dự kiến",
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
        .min(1, "Phải có ít nhất một giai đoạn giải ngân")
        .refine((stages) => {
            for (let i = 1; i < stages.length; i++) {
                if (stages[i].scheduledDate <= stages[i - 1].scheduledDate) {
                    return false;
                }
            }
            return true;
        }, {
            message: "Ngày giải ngân của giai đoạn sau phải lớn hơn giai đoạn trước",
            path: ["disbursementStages"]
        })
}).superRefine((data, ctx) => {
    // Validate target amount is filled out before other checks
    const targetAmount = parseFloat(data.targetAmount.replace(/,/g, ''));
    if (isNaN(targetAmount) || targetAmount <= 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vui lòng nhập số tiền mục tiêu trước khi nhập các giai đoạn giải ngân",
            path: ["targetAmount"]
        });
        return; // Stop further validation if target amount is not valid
    }

    if (data.endDate && data.endDate <= data.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày kết thúc phải sau ngày bắt đầu",
            path: ["endDate"]
        });
    }

    // Validate plannedStartDate is after endDate
    if (data.plannedStartDate <= data.endDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày bắt đầu dự kiến phải sau ngày kết thúc chiến dịch",
            path: ["plannedStartDate"]
        });
    }

    // Validate plannedEndDate is after plannedStartDate
    if (data.plannedEndDate <= data.plannedStartDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày kết thúc dự kiến phải sau ngày bắt đầu dự kiến",
            path: ["plannedEndDate"]
        });
    }

    // Calculate total disbursement amount
    const totalDisbursement = data.disbursementStages.reduce(
        (sum, stage) => sum + stage.disbursementAmount,
        0
    );

    // Campaign type specific validations
    if (data.campaignType === 1) { // Emergency campaign
        if (data.disbursementStages.length !== 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Chiến dịch khẩn cấp chỉ được có một giai đoạn giải ngân",
                path: ["disbursementStages"]
            });
        }
        if (totalDisbursement !== targetAmount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Số tiền giải ngân phải bằng số tiền mục tiêu (${targetAmount.toLocaleString()} VNĐ)`,
                path: ["disbursementStages"]
            });
        }
    } else { // Regular campaign
        if (data.disbursementStages.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Chiến dịch nuôi em phải có ít nhất hai giai đoạn giải ngân",
                path: ["disbursementStages"]
            });
        }

        // Check each stage's amount doesn't exceed 50% of target
        data.disbursementStages.forEach((stage, index) => {
            if (stage.disbursementAmount > targetAmount * 0.5) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Mỗi giai đoạn không được vượt quá 50% tổng số tiền mục tiêu",
                    path: [`disbursementStages.${index}.disbursementAmount`]
                });
            }
        });

        // Validate total disbursement matches target amount
        if (totalDisbursement !== targetAmount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Tổng số tiền giải ngân (${totalDisbursement.toLocaleString()} VNĐ) phải bằng số tiền mục tiêu (${targetAmount.toLocaleString()} VNĐ)`,
                path: ["disbursementStages"]
            });
        }
    }

    // Validate disbursement dates are within planned period
    data.disbursementStages.forEach((stage, index) => {
        if (stage.scheduledDate < data.plannedStartDate || stage.scheduledDate > data.plannedEndDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ngày giải ngân phải nằm trong khoảng từ ngày bắt đầu đến ngày kết thúc dự kiến",
                path: [`disbursementStages.${index}.scheduledDate`]
            });
        }
    });

    // Validate minimum 1 month between disbursement stages
    for (let i = 1; i < data.disbursementStages.length; i++) {
        const prevDate = new Date(data.disbursementStages[i - 1].scheduledDate);
        const currentDate = new Date(data.disbursementStages[i].scheduledDate);
        const monthDiff = (currentDate.getFullYear() - prevDate.getFullYear()) * 12 +
            (currentDate.getMonth() - prevDate.getMonth());

        if (monthDiff < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Các giai đoạn giải ngân phải cách nhau ít nhất 1 tháng",
                path: [`disbursementStages.${i}.scheduledDate`]
            });
        }
    }
});

export default addCampaignSchema;