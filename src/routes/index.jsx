import { Suspense, lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

// layouts
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';



// config
// import { DEFAULT_PATH } from '../config/app';
import LoadingScreen from '@/components/common/LoadingScreen';
import UpdateCampaign from '@/pages/admin/campaign/UpdateCampaign';



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
                { element: <AdminDashboard />, index: true },
                { element: <UserManagement />, path: 'users' },
                { element: <AdminCampaign />, path: 'campaigns' },
                { element: <DetailCampaign />, path: 'campaign/:id' },
                { element: <UpdateCampaign />, path: 'campaign/edit/:id' },
                { element: <AddFundrasing />, path: 'fundrasings/add' },
                { element: <FinanceTransaction />, path: 'finance/transactions' },
                { element: <FinanceReport />, path: 'finance/reports' },
                { element: <FundDisbursement />, path: 'finance/disbursement' },
                { element: <Visit />, path: 'visit' },
                { element: <VisitForm />, path: 'visit/add-visit-form' },
                { element: <AdminCenter />, path: 'center' },
                { element: <GuaranteeRequests />, path: 'center/guarantee-requests' },
                { element: <GuaranteeRequestsDetail />, path: 'center/guarantee-requests/:id' },
                { element: <ContractManagement />, path: 'center/contracts' },
                { element: <ContractDetail />, path: 'center/contracts/:id' },




            ],
        },

        // { path: '*', element: <Navigate to="/404" replace /> },
    ]);
}

const LoginPage = Loadable(lazy(() => import('../pages/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('../pages/auth/Register')));
const ResetPasswordPage = Loadable(lazy(() => import('../pages/auth/ResetPassword')));
const NewPasswordPage = Loadable(lazy(() => import('../pages/auth/NewPassword')));




//admin
const AdminDashboard = Loadable(lazy(() => import('@/pages/admin/AdminDashboard')));
const UserManagement = Loadable(lazy(() => import('@/pages/admin/UserManagement')));
const AdminCampaign = Loadable(lazy(() => import('@/pages/admin/campaign/AdminCampaign')));
const AddFundrasing = Loadable(lazy(() => import('@/pages/admin/AddFundrasing')));
const FinanceTransaction = Loadable(lazy(() => import('@/pages/admin/finance/FinanceTransaction')));
const FinanceReport = Loadable(lazy(() => import('@/pages/admin/finance/FinanceReport')));
const FundDisbursement = Loadable(lazy(() => import('@/pages/admin/finance/FundDisbursement')));
const AdminCenter = Loadable(lazy(() => import('@/pages/admin/center/AdminCenter')));
const GuaranteeRequests = Loadable(lazy(() => import('@/pages/admin/center/GuaranteeRequests')));
const GuaranteeRequestsDetail = Loadable(lazy(() => import('@/pages/admin/center/GuaranteeRequestsDetail')));
const ContractManagement = Loadable(lazy(() => import('@/pages/admin/center/ContractManagement')));
const ContractDetail = Loadable(lazy(() => import('@/pages/admin/center/ContractDetail')));
const DetailCampaign = Loadable(lazy(() => import('@/pages/admin/campaign/DetailCampaign')));






//children-manager
const Visit = Loadable(lazy(() => import('@/pages/children-manager/Visit')));
const VisitForm = Loadable(lazy(() => import('@/pages/children-manager/VisitForm')));





