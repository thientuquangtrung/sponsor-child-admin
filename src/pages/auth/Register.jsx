import logo from '@/assets/images/logo-short.png';
import login3d from '@/assets/images/login-1.png';
import { Link } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
    return (
        <div className="h-full w-full bg-custom-image flex flex-col md:flex-row items-center relative">
            <div className="flex-[1] p-8 h-full">
                {/* <img className="w-12 h-auto" src={logo} alt="sponsor-child" /> */}
                {/* <h1 className="mt-8 md:mt-16 text-white text-lg">
                    Streamline Your Workflow with Powerful 3D Asset Management and Interactive Visualization
                </h1> */}
                <img
                    className="hidden md:block w-1/2 max-h-[600px] object-cover absolute bottom-1/2 translate-y-2/3 left-0 pointer-events-none user-select-none"
                    src={login3d}
                    alt="sponsor-child"
                />
            </div>
            <div className="h-full w-full md:flex-[2] bg-white rounded-tl-[32px] rounded-tr-[32px] md:rounded-tr-none md:rounded-bl-[32px] flex flex-col items-center justify-center">
                <div className="md:w-[500px] md:px-0 w-full px-4">
                    <h1 className="text-3xl font-semibold mb-8">Đăng ký tài khoản</h1>
                    <RegisterForm />
                    <p className="mt-8 text-muted-foreground">
                        Bạn đã có tài khoản?{' '}
                        <Link className="text-lg text-primary font-bold" to="/auth/login">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
