import { Navigate, Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useSelector } from 'react-redux';

export function Applayout() {
    const { user } = useSelector((state) => state.auth);

    // if (!user) return <Navigate to="/auth/login" replace />;

    return (
        <>
            <Header />

            <div className="flex-grow flex flex-col">
                <div className="container px-4 md:px-8 flex-grow flex flex-col">
                    <Outlet />
                </div>
            </div>
            <Footer />
        </>
    );
}
