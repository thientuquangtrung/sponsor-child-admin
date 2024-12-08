import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLoginMutation } from '@/redux/auth/authApi';
import { UpdateAuthentication } from '@/redux/auth/authActionCreators';

const formSchema = z.object({
    email: z.string()
        .min(1, "Vui lòng nhập email.")
        .email({ message: "Email không hợp lệ" }),
    password: z.string()
        .min(6, { message: "Mật khẩu phải dài từ 6-32 ký tự" })
        .max(32, { message: "Mật khẩu phải dài từ 6-32 ký tự" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
            { message: "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt" }),
});

export default function LoginForm() {
    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useDispatch();
    const [showPassword, setShowPassword] = useState(false);
    // 1. Define your form.
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        login(values)
            .unwrap()
            .then((res) => {
                dispatch(UpdateAuthentication(res));
                toast.success('Đăng nhập thành công!');
            })
            .catch((err) => {
                console.log(err);
                toast.error(err.error || err.data?.error?.message || 'Email hoặc mật khẩu không đúng. Vui lòng thử lại!');
            });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Email</FormLabel>
                            <FormControl>
                                <Input className="text-lg h-12" placeholder="Nhập địa chỉ email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Mật khẩu</FormLabel>
                            <FormControl>
                                <Input
                                    endIcon={
                                        showPassword ? (
                                            <Eye
                                                className="cursor-pointer"
                                                onClick={() => setShowPassword(!showPassword)}
                                            />
                                        ) : (
                                            <EyeOff
                                                className="cursor-pointer"
                                                onClick={() => setShowPassword(!showPassword)}
                                            />
                                        )
                                    }
                                    className="text-lg h-12"
                                    placeholder={'Nhập mật khẩu'}
                                    type={showPassword ? 'text' : 'password'}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    className="w-full h-12 text-white text-2xl bg-gradient-to-r from-primary to-secondary"
                    type="submit"
                >
                    Đăng nhập
                </Button>
            </form>
        </Form>
    );
}
