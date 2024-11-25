import { Suspense, lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

// layouts
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';

// config
// import { DEFAULT_PATH } from '../config/app';
import LoadingScreen from '@/components/common/LoadingScreen';
import UserDetail from '@/pages/admin/UserDetail';
import FundSourceDetail from '@/pages/admin/fund/FundSourceDetail';
import FundUsageDetail from '@/pages/admin/fund/FundUsageDetail';
import UpdateVisitForm from '@/pages/children-manager/visitTrip/UpdateVisitForm';
import VisitRefundProof from '@/pages/children-manager/visitTrip/VisitRefundProof';
import SettingsPage from '@/pages/admin/Setting';
import PhysicalDonationDetail from '@/pages/children-manager/visitTrip/PhysicalDonationDetail';
import { useSelector } from 'react-redux';

const Loadable = (Component) => {
    const LoadableComponent = (props) => {
        return (
            <Suspense fallback={<LoadingScreen />}>
                <Component {...props} />
            </Suspense>
        );
    };

    LoadableComponent.displayName = `Loadable(${Component.displayName || Component.name})`;

    return LoadableComponent;
};

// "/app"

export default function Router() {
    const { user } = useSelector((state) => state.auth);
    const allowedChildManagerRoutes = [
        { element: <Navigate to="/home" replace />, index: true },
        { element: <AdminDashboard />, path: '/home' },
        { element: <AdminCampaign />, path: 'campaigns' },
        { element: <CampaignInfo />, path: 'create-campaign' },
        { element: <DetailCampaign />, path: 'campaign/:id' },
        { element: <UpdateCampaign />, path: 'campaign/edit/:id' },
        { element: <Visit />, path: 'visits' },
        { element: <VisitDetail />, path: 'visit/:id' },
        { element: <VisitForm />, path: 'visit/create-visit-trip' },
        { element: <VisitRefundProof />, path: 'visit-refund/:id' },
        { element: <UpdateVisitForm />, path: 'visit/edit/:id' },



    ];
    return useRoutes([
        {
            path: '/auth',
            element: <AuthLayout />,
            children: [
                { element: <LoginPage />, path: 'login' },
                { element: <RegisterPage />, path: 'register' },
                { element: <ResetPasswordPage />, path: 'reset-password' },
                { element: <NewPasswordPage />, path: 'new-password' },
            ],
        },
        {
            path: '/',
            element: <AdminLayout />,
            children: [
                ...(user?.role.toLowerCase() === 'childmanager'
                    ? allowedChildManagerRoutes
                    : [
                        { element: <Navigate to="/home" replace />, index: true },
                        { element: <AdminDashboard />, path: '/home' },
                        { element: <UserManagement />, path: 'users' },
                        { element: <UserDetail />, path: 'users/:id' },
                        { element: <SettingsPage />, path: 'settings' },
                        { element: <AdminCampaign />, path: 'campaigns' },
                        { element: <DetailCampaign />, path: 'campaign/:id' },
                        { element: <UpdateCampaign />, path: 'campaign/edit/:id' },
                        { element: <AddFundrasing />, path: 'fundrasings/add' },
                        { element: <FinanceTransaction />, path: 'finance/transactions' },
                        { element: <FinanceReport />, path: 'finance/reports' },
                        { element: <FundDisbursement />, path: 'finance/disbursement' },
                        { element: <Visit />, path: 'visits' },
                        { element: <VisitDetail />, path: 'visit/:id' },
                        { element: <VisitForm />, path: 'visit/create-visit-trip' },
                        { element: <AdminCenter />, path: 'center' },
                        { element: <GuaranteeRequests />, path: 'center/guarantee-requests' },
                        { element: <GuaranteeRequestsDetail />, path: 'center/guarantee-requests/:id' },
                        { element: <ContractManagement />, path: 'center/contracts' },
                        { element: <ContractDetail />, path: 'center/contracts/:id' },
                        { element: <CampaignInfo />, path: 'create-campaign' },
                        { element: <DisbursementRequests />, path: 'disbursement-requests' },
                        { element: <DisbursementRequestDetail />, path: 'disbursement-requests/:id' },
                        { element: <AdminFund />, path: 'funds' },
                        { element: <FundSourceDetail />, path: 'fund/source/:id' },
                        { element: <FundUsageDetail />, path: 'fund/usage/:id' },
                        { element: <UpdateVisitForm />, path: 'visit/edit/:id' },
                        { element: <VisitRefundProof />, path: 'visit-refund/:id' },
                        { element: <PhysicalDonationDetail />, path: 'physical-donation/:id' },
                        { path: '404', element: <Page404 /> },
                    ]),
            ],
        },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" replace /> },
    ]);
}

const Page404 = Loadable(lazy(() => import('../pages/NoMatch')));

const LoginPage = Loadable(lazy(() => import('../pages/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('../pages/auth/Register')));
const ResetPasswordPage = Loadable(lazy(() => import('../pages/auth/ResetPassword')));
const NewPasswordPage = Loadable(lazy(() => import('../pages/auth/NewPassword')));

//admin
const AdminDashboard = Loadable(lazy(() => import('@/pages/admin/AdminDashboard')));
const UserManagement = Loadable(lazy(() => import('@/pages/admin/UserManagement')));
const AdminCampaign = Loadable(lazy(() => import('@/pages/admin/campaign/AdminCampaign')));
const FinanceTransaction = Loadable(lazy(() => import('@/pages/admin/finance/FinanceTransaction')));
const FinanceReport = Loadable(lazy(() => import('@/pages/admin/finance/FinanceReport')));
const FundDisbursement = Loadable(lazy(() => import('@/pages/admin/finance/FundDisbursement')));
const AdminCenter = Loadable(lazy(() => import('@/pages/admin/center/AdminCenter')));
const GuaranteeRequests = Loadable(lazy(() => import('@/pages/admin/center/GuaranteeRequests')));
const GuaranteeRequestsDetail = Loadable(lazy(() => import('@/pages/admin/center/GuaranteeRequestsDetail')));
const ContractManagement = Loadable(lazy(() => import('@/pages/admin/center/ContractManagement')));
const ContractDetail = Loadable(lazy(() => import('@/pages/admin/center/ContractDetail')));
const DetailCampaign = Loadable(lazy(() => import('@/pages/admin/campaign/DetailCampaign')));
const UpdateCampaign = Loadable(lazy(() => import('@/pages/admin/campaign/UpdateCampaign')));
const DisbursementRequests = Loadable(lazy(() => import('@/pages/admin/disbursement/DisbursementRequest')));
const DisbursementRequestDetail = Loadable(lazy(() => import('@/pages/admin/disbursement/DisbursementRequestDetail')));
const CampaignInfo = Loadable(lazy(() => import('@/pages/children-manager/campaign/CampaignInfo')));
const AdminFund = Loadable(lazy(() => import('@/pages/admin/fund/AdminFund')));

//children-manager
const Visit = Loadable(lazy(() => import('@/pages/children-manager/visitTrip/Visit')));
const VisitForm = Loadable(lazy(() => import('@/pages/children-manager/visitTrip/VisitForm')));
const VisitDetail = Loadable(lazy(() => import('@/pages/children-manager/visitTrip/VisitDetail')));
