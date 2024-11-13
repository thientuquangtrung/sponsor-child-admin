import React from 'react';
import { format } from 'date-fns';
import { useGetGuaranteeProfileQuery } from '@/redux/guarantee/guaranteeApi';
import { useSelector } from 'react-redux';
import LoadingScreen from '@/components/common/LoadingScreen';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return '.....................';
    return format(new Date(dateString), 'dd/MM/yyyy');
};



const ContractCampaignContent = ({ signatureA, campaignDetails, contractDetails }) => {
    const disbursementPlan = campaignDetails?.disbursementPlans?.find(
        plan => plan.isCurrent === true) || {};

    const { user } = useSelector((state) => state.auth);
    const {
        data: guaranteeProfile,
        isLoading,
        error
    } = useGetGuaranteeProfileQuery(contractDetails?.partyBID, {
        skip: !contractDetails?.partyBID
    });
    if (isLoading) return <LoadingScreen />;



    if (error) {
        console.error('Error fetching guarantee profile:', error);
        return <div>Error loading profile</div>;
    }


    const formattedToday = contractDetails?.signDate
        ? format(new Date(contractDetails.signDate), "dd' tháng 'MM' năm 'yyyy")
        : '.....................';
    const renderPartyB = () => {
        if (!guaranteeProfile) {
            return {
                fullName: ".......................",
                citizenIdentification: ".......................",
                phoneNumber: ".......................",
                birthYear: ".......................",
                idIssueDate: ".......................",
                idIssuePlace: ".......................",
                address: "......................."
            };
        }

        if (guaranteeProfile.guaranteeType === "0") {
            return (
                <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p><span className="inline-block w-36">Họ tên:</span> {guaranteeProfile.fullname}</p>
                            <p><span className="inline-block w-36">Số CMND/CCCD:</span> {guaranteeProfile.citizenIdentification}</p>
                            <p><span className="inline-block w-36">Số điện thoại:</span> {guaranteeProfile.phoneNumber}</p>
                        </div>
                        <div className="space-y-2">
                            <p><span className="inline-block w-20">Năm sinh:</span> {formatDate(guaranteeProfile.dateOfBirth)}</p>
                            <div className="flex flex-wrap">
                                <p className="mr-4 mb-2"><span className="inline-block w-20">Cấp ngày:</span> {formatDate(guaranteeProfile.issueDate)}</p>
                                <p><span className="inline-block w-20">Nơi cấp:</span> {guaranteeProfile.issueLocation}</p>
                            </div>
                        </div>
                    </div>
                    <p className="mt-2"><span className="inline-block w-36">Địa chỉ thường trú:</span> {guaranteeProfile.permanentAddress}</p>
                </div>
            );
        } else {
            return (
                <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p><span className="inline-block w-36">Tên tổ chức:</span> {guaranteeProfile.organizationName}</p>
                            <p><span className="inline-block w-36">Người đại diện:</span> {guaranteeProfile.representativeName}</p>
                        </div>
                        <div className="space-y-2">
                            <p><span className="inline-block w-36">Số điện thoại:</span> {guaranteeProfile.organizationPhoneNumber}</p>
                            <p><span className="inline-block w-36">Chức vụ:</span> {guaranteeProfile.position}</p>

                        </div>
                    </div>
                    <p className="mt-2"><span className="inline-block w-36">Địa chỉ tổ chức:</span> {guaranteeProfile.organizationAddress}</p>
                </div>
            );
        }
    };


    return (

        <div className="p-8 bg-white text-black font-serif">
            <h1 className="text-2xl font-bold text-center">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
            <h2 className="text-xl font-semibold text-center mb-2 mt-2 italic">Độc lập – Tự do – Hạnh phúc</h2>
            <p className="mb-6 text-center">*****</p>

            <h3 className="text-lg font-semibold text-center mb-8">HỢP ĐỒNG THAM GIA BẢO LÃNH CHIẾN DỊCH HỖ TRỢ TRẺ EM </h3>
            <div className="ml-6 text-sm">
                <p className="mb-4">Số: 101/HĐ-BLCD</p>
                <p className="mb-6">Hôm nay, ngày {formattedToday}, tại TP. Hồ Chí Minh</p>

                <div className="mb-6">
                    <h4 className="font-semibold underline mb-2">1. BÊN QUẢN TRỊ NỀN TẢNG SPONSOR CHILD:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p><span className="inline-block w-36">Họ tên:</span> NGUYỄN VĂN A</p>
                            <p><span className="inline-block w-36">Số CMND/CCCD:</span> 001234567890</p>
                            <p><span className="inline-block w-36">Số điện thoại:</span> 0123456789</p>
                        </div>
                        <div className="space-y-2">
                            <p><span className="inline-block w-20">Năm sinh:</span> 20/10/2010</p>
                            <div className="flex flex-wrap">
                                <p className="mr-4 mb-2"><span className="inline-block w-20">Cấp ngày:</span> 01/01/2015</p>
                                <p><span className="inline-block w-20">Nơi cấp:</span> Bình Định</p>
                            </div>
                        </div>
                    </div>
                    <p className="mt-2"><span className="inline-block w-36">Địa chỉ thường trú:</span> 123 ABC</p>
                    <p className="font-semibold mt-2">Sau đây gọi là Bên A</p>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold underline mb-2">2. BÊN BẢO LÃNH:</h4>
                    {renderPartyB()}

                    <p className="font-semibold mt-2">Sau đây gọi là Bên B</p>
                </div>

                <div className="mb-4 mt-4">
                    <h4 className="font-semibold">ĐIỀU 2: THÔNG TIN CHIẾN DỊCH</h4>
                    <p>
                        2.1. Tên chiến dịch: {campaignDetails.title || ".........................."}
                        <br />
                        2.2. Số tiền cam kết bảo lãnh: {formatCurrency(disbursementPlan.totalPlannedAmount) || "................."}
                        <br />
                        2.3. Thời gian thực hiện:
                        <br />
                        - Ngày bắt đầu: {formatDate(disbursementPlan.plannedStartDate)}
                        <br />
                        - Ngày kết thúc: {formatDate(disbursementPlan.plannedEndDate)}
                        <br />
                    </p>
                </div>

                <div className="mb-4 mt-4">
                    <h4 className="font-semibold">ĐIỀU 3: KẾ HOẠCH GIẢI NGÂN</h4>
                    <p>
                        3.1. Thời gian giải ngân:
                        <br />
                        - Ngày bắt đầu dự kiến: {formatDate(disbursementPlan.plannedStartDate)}
                        <br />
                        - Ngày kết thúc dự kiến: {formatDate(disbursementPlan.plannedEndDate)}
                        <br />
                        3.2. Tổng số tiền giải ngân: {formatCurrency(disbursementPlan.totalPlannedAmount) || "................."}
                        <br />
                        3.3. Các giai đoạn giải ngân:
                        {disbursementPlan.simplifiedStages?.map((stage, index) => (
                            <React.Fragment key={index}>
                                <br />
                                Giai đoạn {index + 1}:
                                <br />
                                - Số tiền: {formatCurrency(stage.disbursementAmount) || "........................"}
                                <br />
                                - Ngày dự kiến: {formatDate(stage.scheduledDate)}
                                <br />
                                - Hoạt động: {stage.stageActivity?.description || "......................"}
                            </React.Fragment>
                        ))}
                    </p>
                </div>

                <div className="mb-4 mt-4">
                    <h4 className="font-semibold">ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CÁC BÊN</h4>
                    <p>
                        4.1. Quyền và nghĩa vụ của Bên A:
                        <br />
                        - Quản lý và giải ngân đúng mục đích, kế hoạch
                        <br />
                        - Báo cáo định kỳ cho Bên B về tiến độ thực hiện
                        <br />
                        - Đảm bảo tính minh bạch trong quá trình giải ngân
                        <br />
                        - Thông báo kịp thời cho Bên B về các thay đổi (nếu có)
                        <br />
                        <br />
                        4.2. Quyền và nghĩa vụ của Bên B:
                        <br />
                        - Thực hiện đúng cam kết về số tiền bảo lãnh
                        <br />
                        - Tuân thủ các quy định và quy trình của hệ thống
                        <br />
                        - Được nhận báo cáo định kỳ về tiến độ giải ngân
                        <br />
                        - Được quyền theo dõi quá trình thực hiện chiến dịch
                    </p>
                </div>

                <div className="mb-4 mt-4">
                    <h4 className="font-semibold">ĐIỀU 5: ĐIỀU KHOẢN CHUNG</h4>
                    <p>
                        5.1. Thời gian hiệu lực hợp đồng:
                        <br />
                        - Thời gian bắt đầu: {formatDate(disbursementPlan.plannedStartDate)}
                        <br />
                        - Thời gian kết thúc: {formatDate(disbursementPlan.plannedEndDate)}
                        <br />
                        5.2. Mọi thay đổi trong kế hoạch giải ngân phải được sự đồng ý của cả hai bên
                        <br />
                        5.3. Trường hợp có tranh chấp, hai bên sẽ giải quyết trên tinh thần hợp tác
                        <br />
                        5.4. Hợp đồng này được lập thành 03 bản, bên Bảo lãnh giữ 01 bản, bên Quản trị nền tảng SponsorChild giữ 02 bản và có giá trị pháp lý như nhau.
                    </p>
                </div>
                <div className="flex justify-between mt-12 mb-40">

                    <div className="text-center">
                        <p className="font-semibold">Đại diện Bên A</p>
                        <p>(Ký, ghi rõ họ tên)</p>
                        {signatureA && (
                            <img src={signatureA} alt="Chữ ký Bên A" className="mt-4" />
                        )}
                        <p className="mt-2">{user.fullname || user?.representativeName}</p>
                    </div>
                    <div className="text-center">
                        <p className="font-semibold">Đại diện Bên B</p>
                        <p>(Ký, ghi rõ họ tên)</p>
                        {contractDetails?.partyBSignatureUrl && (
                            <img
                                src={contractDetails.partyBSignatureUrl}
                                alt="Chữ ký Bên B"
                                className="mt-4"
                            />
                        )}
                        <p className="mt-2">{guaranteeProfile?.fullname || guaranteeProfile?.representativeName}</p>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractCampaignContent;