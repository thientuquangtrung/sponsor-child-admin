import { Suspense, lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

// layouts
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';



// config
// import { DEFAULT_PATH } from '../config/app';
import LoadingScreen from '@/components/common/LoadingScreen';



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
                { element: <AdminFundrasing />, path: 'fundrasings' },
                { element: <AddFundrasing />, path: 'fundrasings/add' },
                { element: <FinanceTransaction />, path: 'finance/transactions' },
                { element: <FinanceReport />, path: 'finance/reports' },
                { element: <FundDisbursement />, path: 'finance/disbursement' },
                { element: <Visit />, path: 'visit' },
                { element: <VisitForm />, path: 'visit/add-visit-form' },
            ],
        },

        { path: '*', element: <Navigate to="/404" replace /> },
    ]);
}

const LoginPage = Loadable(lazy(() => import('../pages/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('../pages/auth/Register')));
const ResetPasswordPage = Loadable(lazy(() => import('../pages/auth/ResetPassword')));
const NewPasswordPage = Loadable(lazy(() => import('../pages/auth/NewPassword')));




//admin
const AdminDashboard = Loadable(lazy(() => import('@/pages/admin/AdminDashboard')));
const UserManagement = Loadable(lazy(() => import('@/pages/admin/UserManagement')));
const AdminFundrasing = Loadable(lazy(() => import('@/pages/admin/AdminFundrasing')));
const AddFundrasing = Loadable(lazy(() => import('@/pages/admin/AddFundrasing')));
const FinanceTransaction = Loadable(lazy(() => import('@/pages/admin/finance/FinanceTransaction')));
const FinanceReport = Loadable(lazy(() => import('@/pages/admin/finance/FinanceReport')));
const FundDisbursement = Loadable(lazy(() => import('@/pages/admin/finance/FundDisbursement')));
//children-manager
const Visit = Loadable(lazy(() => import('@/pages/children-manager/Visit')));
const VisitForm = Loadable(lazy(() => import('@/pages/children-manager/VisitForm')));





