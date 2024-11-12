import * as z from 'zod';

export const createDisbursementSchema = (totalPlannedAmount) => z.object({
    plannedStartDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    plannedEndDate: z.date({
        required_error: "Vui lòng chọn ngày kết thúc",
    }),
    totalPlannedAmount: z.number(),
    stages: z.array(z.object({
        disbursementAmount: z.number().min(1, 'Số tiền giải ngân phải lớn hơn 0'),
        scheduledDate: z.date({
            required_error: "Vui lòng chọn ngày giải ngân",
        }),
        description: z.string().min(1, 'Vui lòng nhập mô tả'),
        stageNumber: z.number()
    }))
}).refine((data) => {
    return data.plannedEndDate > data.plannedStartDate;
}, {
    message: "Ngày kết thúc phải lớn hơn ngày bắt đầu",
    path: ["plannedEndDate"]
}).refine((data) => {
    const totalStageAmount = data.stages.reduce((sum, stage) => sum + stage.disbursementAmount, 0);
    return totalStageAmount === totalPlannedAmount;
}, {
    message: "Tổng số tiền các giai đoạn phải bằng tổng số tiền dự kiến",
    path: ["stages"]
}).refine((data) => {
    return data.stages.every(stage =>
        stage.scheduledDate >= data.plannedStartDate &&
        stage.scheduledDate <= data.plannedEndDate
    );
}, {
    message: "Ngày giải ngân phải nằm trong khoảng từ ngày bắt đầu đến ngày kết thúc",
    path: ["stages"]
}).refine((data) => {
    for (let i = 1; i < data.stages.length; i++) {
        if (data.stages[i].scheduledDate <= data.stages[i - 1].scheduledDate) {
            return false;
        }
    }
    return true;
}, {
    message: "Ngày giải ngân của giai đoạn sau phải lớn hơn giai đoạn trước",
    path: ["stages"]
});