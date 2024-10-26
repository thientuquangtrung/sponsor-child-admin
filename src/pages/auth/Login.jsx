import { Link } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { toast } from 'sonner';

import logo from '@/assets/images/logo-short.png';
import logoGoogle from '@/assets/images/login-google.png';
import login3d from '@/assets/images/login-1.png';
import LoginForm from '@/components/auth/LoginForm';
import { auth, provider } from '@/lib/firebase';
import { useAuthWithProviderMutation } from '@/redux/auth/authApi';
import { useDispatch } from 'react-redux';
import ButtonLoading from '@/components/ui/loading-button';
import { UpdateAuthentication } from '@/redux/auth/authActionCreators';

const Login = () => {
    const dispatch = useDispatch();
    const [authWithProvider, { isLoading }] = useAuthWithProviderMutation();

    const handleAuthGoogle = () => {
        signInWithPopup(auth, provider)
            .then(async (result) => {
                // // This gives you a Google Access Token. You can use it to access the Google API.
                // const credential = GoogleAuthProvider.credentialFromResult(result);
                // const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                // IdP data available using getAdditionalUserInfo(result)
                // ...

                const params = {
                    idToken: await user.getIdToken(),
                };

                // submit params to backend
                authWithProvider(params)
                    .unwrap()
                    .then((res) => {
                        dispatch(UpdateAuthentication(res));
                        toast.success('Logged in successfully!');
                    })
                    .catch((err) => {
                        console.log(err);
                        toast.error(err.error || err.data?.error?.message || 'Try again later!');
                    });
            })
            .catch((error) => {
                // Handle Errors here.
                // const errorCode = error.code;
                const errorMessage = error.message;
                // // The email of the user's account used.
                // const email = error.customData.email;
                // // The AuthCredential type that was used.
                // const credential = GoogleAuthProvider.credentialFromError(error);
                // // ...
                toast.error({ severity: 'error', message: errorMessage });
            });
    };

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
            <div className="h-full w-full md:flex-[2] bg-background rounded-tl-[32px] rounded-tr-[32px] md:rounded-tr-none md:rounded-bl-[32px] flex flex-col items-center justify-center">
                <div className="md:w-[500px] md:px-0 w-full px-4">
                    <h1 className="text-3xl font-semibold mb-8">Đăng nhập</h1>
                    <LoginForm />
                    {/* <div className="flex flex-col md:flex-row gap-1 justify-between mt-8 text-muted-foreground">
                        <p>
                            Bạn chưa có tài khoản?{' '}
                            <Link className="text-lg text-primary font-bold" to="/auth/register">
                                Đăng ký ngay
                            </Link>
                        </p>
                        <Link to={'/auth/reset-password'} className="underline text-secondary text-lg font-bold">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <div className="mt-8 flex items-center justify-center max-w-xs mx-auto">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-muted-foreground">hoặc tiếp tục với</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <ButtonLoading
                        isLoading={isLoading}
                        onClick={handleAuthGoogle}
                        className="mt-8 flex items-center justify-center mx-auto bg-white text-black py-2 px-4 rounded shadow hover:bg-gray-200"
                    >
                        <img className="w-6 h-auto" src={logoGoogle} alt="sponsor-child" />
                        <span className="ml-4 text-lg">Đăng nhập bằng Google</span>
                    </ButtonLoading> */}
                </div>
            </div>
        </div>
    );
};

export default Login;
