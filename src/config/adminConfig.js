const FETCH_ADMIN_CONFIGS = [
    {
        "id": "17ab216b-9804-443d-8af1-020ef50ce00b",
        "configKey": "Admin_PasswordExpiryDays",
        "configValue": "90",
        "defaultValue": "90",
        "unit": "ngày",
        "configCategory": 9,
        "description": "Số ngày tối đa trước khi mật khẩu admin hết hạn và cần đổi."
    },
    {
        "id": "2fa511b0-3b08-4b3b-bfd8-1333253f2970",
        "configKey": "Donation_MaximumAmount",
        "configValue": "500000000",
        "defaultValue": "500000000",
        "unit": "VND",
        "configCategory": 7,
        "description": "Số tiền tối đa người dùng được phép đóng góp trong một giao dịch."
    },
    {
        "id": "7338a5f4-3aae-418d-ac2a-29b9935235dd",
        "configKey": "Visit_RegistrationCloseMinDays",
        "configValue": "7",
        "defaultValue": "7",
        "unit": "ngày",
        "configCategory": 5,
        "description": "Ngày đóng form đăng ký phải trước ngày bắt đầu chuyến thăm ít nhất 7 ngày."
    },
    {
        "id": "8b329402-0dc7-4b57-9ace-2ef37f4ce7cd",
        "configKey": "UserVerification_TokenExpiryHours",
        "configValue": "24",
        "defaultValue": "24",
        "unit": "giờ",
        "configCategory": 0,
        "description": "Thời gian hiệu lực (giờ) của mã xác minh tài khoản qua email."
    },
    {
        "id": "9be7d789-0540-4aa1-8f47-307e2dcc4925",
        "configKey": "Notification_MaxRetries",
        "configValue": "3",
        "defaultValue": "3",
        "unit": "lần",
        "configCategory": 6,
        "description": "Số lần tối đa gửi lại thông báo nếu không thành công."
    },
    {
        "id": "18e6ff40-d2eb-4bcb-b818-3ef94f918667",
        "configKey": "Email_SenderName",
        "configValue": "Sponsor Child Vietnam",
        "defaultValue": "Sponsor Child Vietnam",
        "unit": "Tên email",
        "configCategory": 10,
        "description": "Địa chỉ email mặc định để gửi email hệ thống."
    },
    {
        "id": "ad2f9f5b-5ed5-433e-8364-479660c77300",
        "configKey": "Visit_RefundPercentage_ClosedRegistration",
        "configValue": "65",
        "defaultValue": "65",
        "unit": "%",
        "configCategory": 5,
        "description": "Hoàn lại 65% nếu chuyến thăm đã đóng đơn đăng ký."
    },
    {
        "id": "28ccfd75-b9d3-4f10-a28c-4f7078057379",
        "configKey": "Donation_MinimumAmount",
        "configValue": "10000",
        "defaultValue": "10000",
        "unit": "VND",
        "configCategory": 7,
        "description": "Số tiền tối thiểu người dùng phải đóng góp."
    },
    {
        "id": "5aa5b6aa-c740-4dfe-9430-51d51907854f",
        "configKey": "Disbursement_StageMinGapDays",
        "configValue": "30",
        "defaultValue": "30",
        "unit": "ngày",
        "configCategory": 3,
        "description": "Khoảng cách giữa các giai đoạn ít nhất 30 ngày."
    },
    {
        "id": "dff06e31-438f-4e08-8dc7-5ec1ce85cd2f",
        "configKey": "Notification_DeliveryInterval",
        "configValue": "15",
        "defaultValue": "15",
        "unit": "phút",
        "configCategory": 6,
        "description": "Khoảng thời gian (phút) để gửi thông báo lại nếu chưa được đọc."
    },
    {
        "id": "ebe0057d-0803-4454-9be6-64e8ae9f60bf",
        "configKey": "Visit_RefundPercentage_Cancelled",
        "configValue": "100",
        "defaultValue": "100",
        "unit": "%",
        "configCategory": 5,
        "description": "Hoàn lại 100% nếu chuyến thăm bị hủy."
    },
    {
        "id": "0af0cac5-4993-4577-a087-7bdbef95f1f9",
        "configKey": "Disbursement_MinStages",
        "configValue": "2",
        "defaultValue": "2",
        "unit": "giai đoạn",
        "configCategory": 3,
        "description": "Chiến dịch nuôi trẻ phải có ít nhất 2 giai đoạn."
    },
    {
        "id": "f9e4b1cf-1adc-4bb1-ace6-8af9787c92f9",
        "configKey": "Disbursement_MaxStagePercentage",
        "configValue": "50",
        "defaultValue": "50",
        "unit": "%",
        "configCategory": 3,
        "description": "Mỗi giai đoạn không quá 50% tổng số tiền."
    },
    {
        "id": "185390db-d42f-40f9-a4fa-a21d9cea7100",
        "configKey": "Disbursement_StageCompletionDays",
        "configValue": "7",
        "defaultValue": "7",
        "unit": "ngày",
        "configCategory": 3,
        "description": "Giai đoạn quá 7 ngày chưa hoàn thành sẽ thay thế."
    },
    {
        "id": "5043b747-17ee-4cbd-81a5-ab7dc6a06974",
        "configKey": "UserVerification_MaxAttempts",
        "configValue": "5",
        "defaultValue": "5",
        "unit": "lần",
        "configCategory": 0,
        "description": "Số lần tối đa người dùng có thể nhập sai mã xác minh."
    },
    {
        "id": "2db8940c-506e-4633-9641-c341ca77a9d3",
        "configKey": "Contract_SigningDeadline",
        "configValue": "7",
        "defaultValue": "7",
        "unit": "ngày",
        "configCategory": 2,
        "description": "Hợp đồng phải ký trong vòng 7 ngày sau khi tạo."
    },
    {
        "id": "693db041-8bde-4eda-9639-d5a7033125ea",
        "configKey": "Email_SenderAddress",
        "configValue": "sponsorchildvn@gmail.com",
        "defaultValue": "sponsorchildvn@gmail.com",
        "unit": "email",
        "configCategory": 10,
        "description": "Địa chỉ email mặc định để gửi email hệ thống."
    },
    {
        "id": "a3eeec61-cd88-4276-a3b8-e012498de3bf",
        "configKey": "Disbursement_EmergencyStageCount",
        "configValue": "1",
        "defaultValue": "1",
        "unit": "giai đoạn",
        "configCategory": 3,
        "description": "Chiến dịch khẩn cấp chỉ có 1 giai đoạn giải ngân."
    },
    {
        "id": "ee2e988c-791b-472e-a680-e1e1c584463e",
        "configKey": "Visit_RefundPercentage_OpenRegistration",
        "configValue": "85",
        "defaultValue": "85",
        "unit": "%",
        "configCategory": 5,
        "description": "Hoàn lại 85% nếu chuyến thăm còn mở đăng ký."
    },
    {
        "id": "86a53b5e-b39a-4719-b0fb-e62dfe9cc8ec",
        "configKey": "Transaction_CompletionDays",
        "configValue": "7",
        "defaultValue": "7",
        "unit": "ngày",
        "configCategory": 4,
        "description": "Giao dịch quá 7 ngày sẽ tự động hủy."
    },
    {
        "id": "eead06aa-b371-4e66-aa52-ef94492a413a",
        "configKey": "Admin_MaxSessionDuration",
        "configValue": "120",
        "defaultValue": "120",
        "unit": "phút",
        "configCategory": 9,
        "description": "Thời gian tối đa (phút) phiên làm việc của admin."
    },
    {
        "id": "6ad27341-22ee-455b-9445-f91146fd187e",
        "configKey": "Campaign_ChildAgeLimit",
        "configValue": "16",
        "defaultValue": "16",
        "unit": "tuổi",
        "configCategory": 1,
        "description": "Trẻ trong chiến dịch phải dưới 16 tuổi."
    }
]
export default FETCH_ADMIN_CONFIGS;