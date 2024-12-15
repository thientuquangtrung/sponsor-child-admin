import * as z from 'zod';

const getAddCampaignSchema = () => {
    const adminConfig = JSON.parse(localStorage.getItem('adminConfigs'))
    const addCampaignSchema = z.object({
        childName: z.string().min(1, "Vui lòng nhập tên trẻ."),
        childBirthYear: z.number({
            required_error: "Vui lòng nhập năm sinh",
            invalid_type_error: "Năm sinh không hợp lệ"
        })
            .min(new Date().getFullYear() - adminConfig.Campaign_ChildAgeLimit, `Trẻ phải dưới ${adminConfig.Campaign_ChildAgeLimit} tuổi`)
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
                return !isNaN(numericValue) && numericValue >= adminConfig.Campaign_MinimumTargetAmount;
            }, { message: `Số tiền mục tiêu tối thiểu là ${adminConfig.Campaign_MinimumTargetAmount}đ` })
            .refine((val) => {
                const numericValue = parseFloat(val.replace(/,/g, ''));
                return !isNaN(numericValue) && numericValue <= adminConfig.Campaign_MaximumTargetAmount;
            }, { message: `Số tiền mục tiêu tối đa là ${adminConfig.Campaign_MaximumTargetAmount}đ` }),
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
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const startDate = new Date(data.startDate);
        startDate.setHours(0, 0, 0, 0);

        if (startDate <= currentDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ngày bắt đầu chiến dịch phải sau ngày hiện tại ít nhất 1 ngày",
                path: ["startDate"]
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

        if (data.campaignType === 0) {
            const targetAmount = parseFloat(data.targetAmount.replace(/,/g, ''));
            stages.forEach((stage, index) => {
                const stagePercentage = (stage.disbursementAmount / targetAmount) * 100;
                if (stagePercentage > adminConfig.Disbursement_MaxStagePercentage) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Giai đoạn ${index + 1} không được vượt quá ${adminConfig.Disbursement_MaxStagePercentage}% tổng số tiền`,
                        path: ["disbursementStages", index, "disbursementAmount"],
                    });
                }
            });
        }

        if (data.campaignType === 1 && stages.length !== adminConfig.Disbursement_EmergencyStageCount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Chiến dịch khẩn cấp phải có ${adminConfig.Disbursement_EmergencyStageCount} giai đoạn giải ngân`,
                path: ["disbursementStages"],
            });
        }
        if (data.campaignType === 0 && stages.length < adminConfig.Disbursement_MinStages) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Chiến dịch nuôi trẻ phải có ít nhất ${adminConfig.Disbursement_MinStages} giai đoạn giải ngân`,
                path: ["disbursementStages"],
            });
        }

        for (let i = 1; i < stages.length; i++) {
            const daysDifference = (stages[i].scheduledDate.getTime() - stages[i - 1].scheduledDate.getTime()) / (1000 * 3600 * 24);
            if (daysDifference < adminConfig.Disbursement_StageMinGapDays) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Khoảng cách giữa các ngày giải ngân phải ít nhất ${adminConfig.Disbursement_StageMinGapDays} ngày`,
                    path: ["disbursementStages", i, "scheduledDate"],
                });
            }
        }
    });

    return addCampaignSchema;
}


export default getAddCampaignSchema;