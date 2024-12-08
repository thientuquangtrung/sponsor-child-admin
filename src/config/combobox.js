
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
    { label: 'Đang diễn ra', value: 3 },
    { label: 'Đã hoàn thành', value: 4 },
    { label: 'Đã hủy', value: 5 },
    { label: 'Đã hoãn', value: 6 },
];
export const visitRegistrationStatus = [
    { label: 'Đang chờ thanh toán', value: 0 },
    { label: 'Đã đăng ký', value: 1 },
    { label: 'Đang chờ hoàn tiền', value: 2 },
    { label: 'Hủy đăng ký', value: 3 },
    { label: 'Góp vào quỹ chung', value: 4 },
    { label: 'Hoàn tiền do chuyến thăm bị hủy', value: 5 },
];
export const giftDeliveryMethod = [
    { label: 'Giao tận nơi', value: 0 },
    { label: 'Dịch vụ bưu chính', value: 1 },
    { label: 'Mua quà hộ', value: 2 },
];
export const giftStatus = [
    { label: 'Chờ xử lý', value: 0 },
    { label: 'Đang chờ mua quà', value: 1 },
    { label: 'Đã nhận quà', value: 2 },
    { label: 'Đã hủy', value: 3 },
    { label: 'Chờ hoàn tiền', value: 4 },
    { label: 'Góp vào quỹ chung', value: 5 },
    { label: 'Đã hoàn tiền', value: 6 },
];

export const giftType = [
    { label: 'Gạo', value: 0 },
    { label: 'Mì ăn liền', value: 1 },
    { label: 'Dầu ăn', value: 2 },
    { label: 'Muối và gia vị', value: 3 },
    { label: 'Đường', value: 4 },
    { label: 'Kem đánh răng và bàn chải', value: 5 },
    { label: 'Xà phòng và dầu gội', value: 6 },
    { label: 'Khẩu trang', value: 7 },
    { label: 'Bộ sơ cứu', value: 8 },
    { label: 'Quần áo', value: 9 },
    { label: 'Chăn', value: 10 },
    { label: 'Giày dép', value: 11 },
    { label: 'Sách và vở', value: 12 },
    { label: 'Bút viết', value: 13 },
    { label: 'Cặp sách', value: 14 },
    { label: 'Đồng phục', value: 15 },
    { label: 'Sữa và thực phẩm bổ sung', value: 16 },
    { label: 'Nước đóng chai', value: 17 },
    { label: 'Thực phẩm đóng hộp', value: 18 },
    { label: 'Quạt điện', value: 19 },
    { label: 'Xe đạp', value: 20 },
    { label: 'Mùng chống muỗi', value: 21 },
    { label: 'Bếp nấu', value: 22 },
    { label: 'Máy tính bảng', value: 23 },
    { label: 'Laptop', value: 24 },
    { label: 'Router WiFi', value: 25 },
];



// transaction
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
    { label: 'Sự kiện', value: 2 },
];

export const configCategory = [
    { label: 'Xác minh người dùng', value: 0 },
    { label: 'Chiến dịch', value: 1 },
    { label: 'Hợp đồng', value: 2 },
    { label: 'Giải ngân', value: 3 },
    { label: 'Giao dịch', value: 4 },
    { label: 'Chuyến thăm', value: 5 },
    { label: 'Thông báo', value: 6 },
    { label: 'Quyên góp', value: 7 },
    { label: 'Hệ thống', value: 8 },
    { label: 'Quản trị viên', value: 9 },
    { label: 'Email', value: 10 },
];