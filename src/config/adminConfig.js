const FETCH_ADMIN_CONFIGS =
    [
        {
            "id": "0ba1c177-5ea0-42b7-bb5b-08c5dd92c699",
            "configKey": "Disbursement_MaxStagePercentage",
            "configValue": "50",
            "defaultValue": "50",
            "unit": "%",
            "configCategory": 3,
            "description": "Mỗi giai đoạn không quá 50% tổng số tiền."
        },
        {
            "id": "fed8f62e-a639-4583-bf0d-0ed1dee037d5",
            "configKey": "Visit_RefundPercentage_ClosedRegistration",
            "configValue": "65",
            "defaultValue": "65",
            "unit": "%",
            "configCategory": 5,
            "description": "Hoàn lại 65% nếu chuyến thăm đã đóng đơn đăng ký."
        },
        {
            "id": "1307b49b-281a-4e65-a6e5-24b7b5eb33fe",
            "configKey": "Donation_MinimumAmount",
            "configValue": "10000",
            "defaultValue": "10000",
            "unit": "VND",
            "configCategory": 7,
            "description": "Số tiền tối thiểu người dùng phải đóng góp."
        },
        {
            "id": "f0c630d4-8114-4c4d-afee-2ab450d2ae86",
            "configKey": "Disbursement_StageCompletionDays",
            "configValue": "7",
            "defaultValue": "7",
            "unit": "ngày",
            "configCategory": 3,
            "description": "Giai đoạn quá 7 ngày chưa hoàn thành sẽ thay thế."
        },
        {
            "id": "da0e87b0-cadb-4f78-ab7b-370cc2e0c287",
            "configKey": "Campaign_MaximumTargetAmount",
            "configValue": "50000000000",
            "defaultValue": "50000000000",
            "unit": "VND",
            "configCategory": 1,
            "description": "Số tiền tối đa để kêu gọi cho một chiến dịch."
        },
        {
            "id": "a17b31bc-ab16-47e3-a057-41410a603b9c",
            "configKey": "Donation_MaximumAmount",
            "configValue": "500000000",
            "defaultValue": "500000000",
            "unit": "VND",
            "configCategory": 7,
            "description": "Số tiền tối đa người dùng được phép đóng góp trong một giao dịch."
        },
        {
            "id": "7a80ed1c-73db-43e8-af42-4deee4871699",
            "configKey": "Campaign_ChildAgeLimit",
            "configValue": "16",
            "defaultValue": "16",
            "unit": "tuổi",
            "configCategory": 1,
            "description": "Trẻ trong chiến dịch phải dưới 16 tuổi."
        },
        {
            "id": "9fba41a8-0ddb-419b-8293-50056398cdcf",
            "configKey": "Transaction_CompletionDays",
            "configValue": "7",
            "defaultValue": "7",
            "unit": "ngày",
            "configCategory": 4,
            "description": "Giao dịch quá 7 ngày sẽ tự động hủy."
        },
        {
            "id": "8a6c6b8e-05cb-4528-bf21-557039c9b4b3",
            "configKey": "Notification_MaxRetries",
            "configValue": "3",
            "defaultValue": "3",
            "unit": "lần",
            "configCategory": 6,
            "description": "Số lần tối đa gửi lại thông báo nếu không thành công."
        },
        {
            "id": "f48949aa-5e57-48ba-a774-71f6c757a412",
            "configKey": "Email_SenderName",
            "configValue": "Sponsor Child Vietnam",
            "defaultValue": "Sponsor Child Vietnam",
            "unit": "Tên email",
            "configCategory": 10,
            "description": "Địa chỉ email mặc định để gửi email hệ thống."
        },
        {
            "id": "28181ad7-8ab5-498d-a33a-73ba9c88c685",
            "configKey": "Disbursement_MinStages",
            "configValue": "2",
            "defaultValue": "2",
            "unit": "giai đoạn",
            "configCategory": 3,
            "description": "Chiến dịch nuôi trẻ phải có ít nhất 2 giai đoạn."
        },
        {
            "id": "d0ed9dd4-289c-44e5-8633-7b165268c793",
            "configKey": "Disbursement_StageMinGapDays",
            "configValue": "30",
            "defaultValue": "30",
            "unit": "ngày",
            "configCategory": 3,
            "description": "Khoảng cách giữa các giai đoạn ít nhất 30 ngày."
        },
        {
            "id": "b7f59361-0c2e-45b0-bca3-7eeaa1d74f00",
            "configKey": "Visit_RegistrationCloseMinDays",
            "configValue": "7",
            "defaultValue": "7",
            "unit": "ngày",
            "configCategory": 5,
            "description": "Ngày đóng form đăng ký phải trước ngày bắt đầu chuyến thăm ít nhất 7 ngày."
        },
        {
            "id": "39637a24-53a2-436f-8029-841a5c68e768",
            "configKey": "Contract_SigningDeadline",
            "configValue": "7",
            "defaultValue": "7",
            "unit": "ngày",
            "configCategory": 2,
            "description": "Hợp đồng phải ký trong vòng 7 ngày sau khi tạo."
        },
        {
            "id": "c79e3841-43ec-4322-adf3-898a28c2101c",
            "configKey": "Admin_MaxSessionDuration",
            "configValue": "120",
            "defaultValue": "120",
            "unit": "phút",
            "configCategory": 9,
            "description": "Thời gian tối đa (phút) phiên làm việc của admin."
        },
        {
            "id": "917ebf68-bc7e-4be3-ad91-8e58cb62bfe8",
            "configKey": "Disbursement_EmergencyStageCount",
            "configValue": "1",
            "defaultValue": "1",
            "unit": "giai đoạn",
            "configCategory": 3,
            "description": "Chiến dịch khẩn cấp chỉ có 1 giai đoạn giải ngân."
        },
        {
            "id": "5504c089-6e02-4637-b362-8e7ffde5657f",
            "configKey": "Notification_DeliveryInterval",
            "configValue": "15",
            "defaultValue": "15",
            "unit": "phút",
            "configCategory": 6,
            "description": "Khoảng thời gian (phút) để gửi thông báo lại nếu chưa được đọc."
        },
        {
            "id": "30c3107f-620f-43ed-944b-9463bc852af9",
            "configKey": "Email_SenderAddress",
            "configValue": "sponsorchildvn@gmail.com",
            "defaultValue": "sponsorchildvn@gmail.com",
            "unit": "email",
            "configCategory": 10,
            "description": "Địa chỉ email mặc định để gửi email hệ thống."
        },
        {
            "id": "b2381aaa-9f37-41f3-b804-9b16a4ac9827",
            "configKey": "Admin_PasswordExpiryDays",
            "configValue": "90",
            "defaultValue": "90",
            "unit": "ngày",
            "configCategory": 9,
            "description": "Số ngày tối đa trước khi mật khẩu admin hết hạn và cần đổi."
        },
        {
            "id": "5d434da3-5e64-4bce-ac5a-b07fd15911c6",
            "configKey": "UserVerification_MaxAttempts",
            "configValue": "5",
            "defaultValue": "5",
            "unit": "lần",
            "configCategory": 0,
            "description": "Số lần tối đa người dùng có thể nhập sai mã xác minh."
        },
        {
            "id": "406b709b-9ae2-41ab-bf56-bdf5b31742a6",
            "configKey": "UserVerification_TokenExpiryHours",
            "configValue": "24",
            "defaultValue": "24",
            "unit": "giờ",
            "configCategory": 0,
            "description": "Thời gian hiệu lực (giờ) của mã xác minh tài khoản qua email."
        },
        {
            "id": "d1754382-4f93-402d-9a17-c26c86605478",
            "configKey": "Visit_RefundPercentage_Cancelled",
            "configValue": "100",
            "defaultValue": "100",
            "unit": "%",
            "configCategory": 5,
            "description": "Hoàn lại 100% nếu chuyến thăm bị hủy."
        },
        {
            "id": "5b8188a7-4ec5-4ff7-8f6b-f681b8338834",
            "configKey": "Campaign_MinimumTargetAmount",
            "configValue": "10000000",
            "defaultValue": "10000000",
            "unit": "VND",
            "configCategory": 1,
            "description": "Số tiền tối thiểu để kêu gọi cho một chiến dịch."
        },
        {
            "id": "91ff2fb6-0099-466a-ad87-fcd87965eef9",
            "configKey": "Visit_RefundPercentage_OpenRegistration",
            "configValue": "85",
            "defaultValue": "85",
            "unit": "%",
            "configCategory": 5,
            "description": "Hoàn lại 85% nếu chuyến thăm còn mở đăng ký."
        }
    ]
export default FETCH_ADMIN_CONFIGS;