
// guarantee

export const guaranteeTypes = [
    { label: 'Cá nhân', value: 0 },
    { label: 'Tổ chức', value: 1 },
];

export const organizationTypes = [
    { label: 'Chính trị xã hội', value: 0 },
    { label: 'Xã hội', value: 1 },
    { label: 'Xã hội nghề nghiệp', value: 2 },
    { label: 'Tôn giáo', value: 3 },
    { label: 'Kinh tế', value: 4 },
];

export const guaranteeStatus = [
    { label: 'Đang chờ', value: 0 },
    { label: 'Đang ký hợp đồng', value: 1 },
    { label: 'Đã duyệt', value: 2 },
    { label: 'Từ chối', value: 3 },

];

//contract
export const contractStatus = [
    { label: 'Đang chờ', value: 0 },
    { label: 'Đang chờ Quản trị viên', value: 1 },
    { label: 'Đã duyệt', value: 2 },
    { label: 'Từ chối bởi Bảo lãnh', value: 3 },
    { label: 'Từ chối bởi Quản trị viên', value: 4 },
    { label: 'Đã hủy', value: 5 },
    { label: 'Chờ tải bản cứng', value: 6 },

];

export const contractPartyType = [
    { label: 'Quản trị viên', value: 0 },
    { label: 'Bảo lãnh', value: 1 },
];

export const contractType = [
    { label: 'Đăng ký Bảo lãnh', value: 0 },
    { label: 'Chiến dịch gây quỹ', value: 1 },
];


//campaign
export const campaignStatus = [
    { label: 'Đợi duyệt', value: 0 },
    { label: 'Chờ ký hợp đồng', value: 1 },
    { label: 'Đã duyệt', value: 2 },
    { label: 'Từ chối', value: 3 },
    { label: 'Hoạt động', value: 4 },
    { label: 'Đã kết thúc', value: 5 },
    { label: 'Đã hủy', value: 6 },
    { label: 'Quá hạn', value: 7 },
    { label: 'Đang giải ngân', value: 8 },
    { label: 'Đã ngưng', value: 9 },


];


export const campaignTypes = [
    { label: 'Nuôi em', value: 0 },
    { label: 'Khẩn cấp', value: 1 },
];
//childProfile


export const guaranteeRelation = [
    { value: 0, label: 'Cha mẹ' },
    { value: 1, label: 'Chú' },
    { value: 2, label: 'Anh/chị họ' },
    { value: 3, label: 'Chị' },
    { value: 4, label: 'Anh' },
    { value: 5, label: 'Dì' },
    { value: 6, label: 'Ông bà' },

];


// bank names

export const bankName = [
    { label: 'Vietcombank', value: 0 },
    { label: 'Techcombank', value: 1 },
    { label: 'VietinBank', value: 2 },
    { label: 'BIDV', value: 3 },
    { label: 'Agribank', value: 4 },
    { label: 'Sacombank', value: 5 },
    { label: 'MB', value: 6 },
    { label: 'ACB', value: 7 },
    { label: 'VPBank', value: 8 },
    { label: 'HDBank', value: 9 },
    { label: 'TPBank', value: 10 },
    { label: 'VIB', value: 11 },
    { label: 'SHB', value: 12 },
    { label: 'Eximbank', value: 13 },
    { label: 'OceanBank', value: 14 },
];
//disbursement

export const disbursementStageStatus = [
    { label: 'Đã lên lịch', value: 0 },
    { label: 'Đang tiến hành', value: 1 },
    { label: 'Đã hoàn thành', value: 2 },
    { label: 'Thất bại', value: 3 },
    { label: 'Đã hủy', value: 4 },
    { label: 'Đã thay thế', value: 5 },
];
export const disbursementRequestStatus = [
    { label: 'Đã yêu cầu', value: 0 },
    { label: 'Đã duyệt', value: 1 },
    { label: 'Từ chối', value: 2 },
    { label: 'Yêu cầu chỉnh sửa', value: 3 },
    { label: 'Yêu cầu báo cáo', value: 4 },
    { label: 'Hoàn thành', value: 5 },
];
//activity 
export const activityStatus = [
    { label: 'Đã lên lịch', value: 0 },
    { label: 'Đang tiến hành', value: 1 },
    { label: 'Đã hoàn thành', value: 2 },
    { label: 'Đã hủy', value: 3 },
];

//event-visit
export const visitStatus = [
    { label: 'Đã lên kế hoạch', value: 0 },
    { label: 'Đang mở đăng ký', value: 1 },
    { label: 'Đã đóng đăng ký', value: 2 },
    { label: 'Đang chờ', value: 3 },
    { label: 'Đã hoàn thành', value: 4 },
    { label: 'Đã hủy', value: 5 },
    { label: 'Đã hoãn', value: 6 },
];


export const transactionStatus = [
    { label: 'Đang chờ', value: 0 },
    { label: 'Thành công', value: 1 },
    { label: 'Thất bại', value: 2 },
    { label: 'Đã hủy', value: 3 },
];

export const transactionType = [
    { label: 'Thu tiền', value: 0 },
    { label: 'Chi tiền', value: 1 },
    { label: 'Hoàn tiền', value: 2 },
];


export const fundSourceType = [
    { label: 'Cá nhân', value: 0 },
    { label: 'Chiến dịch', value: 1 },
    { label: 'Khác', value: 2 },
];
