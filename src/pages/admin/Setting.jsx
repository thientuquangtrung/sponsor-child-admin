import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RefreshCcw, Settings, SlidersHorizontal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";


const defaultConfigData = {
  UserVerification: [
    { key: "UserVerification_TokenExpiryHours", value: 24, description: "Thời gian hiệu lực (giờ) của mã xác minh tài khoản qua email." },
    { key: "UserVerification_MaxAttempts", value: 5, description: "Số lần tối đa người dùng có thể nhập sai mã xác minh." },
  ],
  Campaign: [
    { key: "Campaign_ChildAgeLimit", value: 16, description: "Trẻ trong chiến dịch phải dưới 16 tuổi." },
  ],
  Contract: [
    { key: "Contract_SigningDeadline", value: 7, description: "Hợp đồng phải ký trong vòng 7 ngày sau khi tạo." },
  ],
  Disbursement: [
    { key: "Disbursement_EmergencyStageCount", value: 1, description: "Chiến dịch khẩn cấp chỉ có 1 giai đoạn giải ngân." },
    { key: "Disbursement_MinStages", value: 2, description: "Chiến dịch nuôi trẻ phải có ít nhất 2 giai đoạn." },
    { key: "Disbursement_MaxStagePercentage", value: 50, description: "Mỗi giai đoạn không quá 50% tổng số tiền." },
    { key: "Disbursement_StageMinGapDays", value: 30, description: "Khoảng cách giữa các giai đoạn ít nhất 30 ngày." },
    { key: "Disbursement_StageCompletionDays", value: 7, description: "Giai đoạn quá 7 ngày chưa hoàn thành sẽ thay thế." },
  ],
  Transaction: [
    { key: "Transaction_CompletionDays", value: 7, description: "Giao dịch quá 7 ngày sẽ tự động hủy." },
  ],
  Visit: [
    { key: "Visit_RegistrationCloseMinDays", value: 7, description: "Ngày đóng form phải trước ngày bắt đầu chuyến thăm ít nhất 7 ngày." },
    { key: "Visit_RefundPercentage_OpenRegistration", value: 85, description: "Hoàn lại 85% nếu chuyến thăm còn mở đăng ký." },
    { key: "Visit_RefundPercentage_ClosedRegistration", value: 65, description: "Hoàn lại 65% nếu chuyến thăm đã đóng đơn đăng ký." },
  ],
  Notification: [
    { key: "Notification_DeliveryInterval", value: 15, description: "Khoảng thời gian (phút) để gửi thông báo lại nếu chưa được đọc." },
    { key: "Notification_MaxRetries", value: 3, description: "Số lần tối đa gửi lại thông báo nếu không thành công." },
  ],
  Donation: [
    { key: "Donation_MinimumAmount", value: 10000, description: "Số tiền tối thiểu người dùng phải đóng góp." },
    { key: "Donation_MaximumAmount", value: 500000000, description: "Số tiền tối đa người được phép đóng góp trong một giao dịch." },
  ],
  System: [
    { key: "System_Timezone", value: "SE Asia Standard Time", description: "Múi giờ mặc định của hệ thống." },
    { key: "System_MaintenanceMode", value: false, description: "Hệ thống có đang bảo trì hay không (TRUE/FALSE)." },
  ],
  Admin: [
    { key: "Admin_MaxSessionDuration", value: 120, description: "Thời gian tối đa (phút) phiên làm việc của admin." },
    { key: "Admin_PasswordExpiryDays", value: 90, description: "Số ngày tối đa trước khi mật khẩu admin hết hạn." },
  ],
  SystemEmail: [
    { key: "Email_SenderAddress", value: "sponsorchildvn@gmail.com", description: "Địa chỉ email mặc định để gửi email hệ thống." },
    { key: "Email_SenderName", value: "Sponsor Child Vietnam", description: "Tên người gửi mặc định cho email hệ thống." },
  ],
};

export default function SettingsPage() {
    const [configs, setConfigs] = useState(defaultConfigData);
    const [pendingAction, setPendingAction] = useState({ category: null, type: null });
  
    const handleUpdate = (category) => {
      alert(`Cập nhật thành công danh mục ${category}`);
      setPendingAction({ category: null, type: null }); // Clear pending action
    };
  
    const handleSetDefault = (category) => {
      setConfigs((prev) => ({
        ...prev,
        [category]: prev[category].map((config) => ({
          ...config,
          value: config.defaultValue, // Reset value to default
        })),
      }));
      alert(`Đặt lại danh mục ${category} về giá trị mặc định`);
      setPendingAction({ category: null, type: null }); // Clear pending action
    };
  
    const handleInputChange = (category, key, value) => {
      setConfigs((prev) => ({
        ...prev,
        [category]: prev[category].map((item) =>
          item.key === key ? { ...item, value } : item
        ),
      }));
    };
  
    return (
      <div className="container mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center space-x-4">
            <SlidersHorizontal className="w-8 h-8" />
            <h1 className="text-3xl font-bold text-gray-800">Cài đặt hệ thống</h1>
        </div>
        <div className="space-y-6">
          {Object.keys(configs).map((category) => (
            <Card key={category} className="p-6 space-y-4">
              <CardHeader>
                <CardTitle>{`Cài đặt ${category}`}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {configs[category].map((config) => (
                  <div key={config.key} className="grid grid-cols-2 gap-4 items-center">
                    <Label htmlFor={config.key} className="text-md">
                      {config.description}
                    </Label>
                    {typeof config.value === "boolean" ? (
                      <Switch
                        id={config.key}
                        checked={config.value}
                        onCheckedChange={(value) =>
                          handleInputChange(category, config.key, value)
                        }
                      />
                    ) : (
                      <Input
                        id={config.key}
                        type={typeof config.value === "number" ? "number" : "text"}
                        defaultValue={config.value}
                        className="border-gray-300"
                        onBlur={(e) => handleInputChange(category, config.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setPendingAction({ category, type: "setDefault" })
                      }
                      className="flex items-center gap-2"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Set Default
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Xác nhận đặt lại</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                      Bạn có chắc chắn muốn đặt lại tất cả giá trị trong danh mục{" "}
                      <b>{category}</b> về mặc định không?
                    </p>
                    <DialogFooter>
                      <Button
                        variant="secondary"
                        onClick={() => setPendingAction({ category: null, type: null })}
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleSetDefault(category)}
                      >
                        Đồng ý
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
  
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="primary"
                      onClick={() => setPendingAction({ category, type: "update" })}
                    >
                      Cập nhật
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Xác nhận cập nhật</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600">
                      Bạn có chắc chắn muốn cập nhật tất cả giá trị đã chỉnh sửa
                      trong danh mục <b>{category}</b> không?
                    </p>
                    <DialogFooter>
                      <Button
                        variant="secondary"
                        onClick={() => setPendingAction({ category: null, type: null })}
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleUpdate(category)}
                      >
                        Đồng ý
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
