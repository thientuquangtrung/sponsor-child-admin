import * as React from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Undo2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadFile, UPLOAD_FOLDER, UPLOAD_NAME } from '@/lib/cloudinary';
import { useGetUserByIdQuery, useUpdateUserMutation } from '@/redux/user/userApi';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ButtonLoading from '@/components/ui/loading-button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const profileSchema = z.object({
    fullname: z.string().min(1, 'Tên tài khoản là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    dateOfBirth: z.string().optional(),
    phoneNumber: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số').optional(),
    address: z.string().min(1, 'Địa chỉ là bắt buộc'),
    bio: z.string().min(1, 'Giới thiệu bản thân là bắt buộc'),
    gender: z.enum(['Male', 'Female']).optional(),
});

function deepEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}
export default function UserDetail() {
    const { id } = useParams();
    const { data: user } = useGetUserByIdQuery(id);
    const navigate = useNavigate();
    const [initialValues, setInitialValues] = useState(null);
    const [isModified, setIsModified] = useState(false);
    const [avatarSrc, setAvatarSrc] = useState(user?.imageUrl || 'https://via.placeholder.com/150');
    const [newAvatarSrc, setNewAvatarSrc] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [isImgUploading, setIsImgUploading] = useState(false);
    const [gender, setGender] = useState(user?.gender === 'Female' ? 'Female' : 'Male');
    const [updateUser, { isLoading }] = useUpdateUserMutation();

    const roleColors = {
        Guarantee: 'bg-rose-100 text-rose-400',
        Donor: 'bg-sky-200 text-sky-600',
        'Children Manager': 'bg-amber-100 text-yellow-700',
        Admin: 'bg-emerald-100 text-emerald-600',
    };

    const displayRole = user?.role === 'ChildManager' ? 'Children Manager' : user?.role;
    const roleColorClass = displayRole ? roleColors[displayRole] || 'bg-gray-200 text-gray-600' : '';
    const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullname: '',
            email: '',
            dateOfBirth: '',
            phone: '',
            address: '',
            bio: '',
            gender: '',
        },
    });

    useEffect(() => {
        if (user) {
            const initialFormValues = {
                fullname: user.fullname,
                email: user.email,
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
                phoneNumber: user.phone,
                address: user.address,
                bio: user.bio,
                gender: user.gender || 'Male',
            };
            form.reset(initialFormValues);
            setInitialValues(initialFormValues);
            setGender(user.gender || 'Male');
            setAvatarSrc(user.imageUrl || 'https://via.placeholder.com/150');
        }
    }, [user, form]);

    useEffect(() => {
        const subscription = form.watch((values) => {
            if (initialValues) {
                setIsModified(!deepEqual(values, initialValues));
            }
        });
        return () => subscription.unsubscribe();
    }, [form, initialValues]);

    const handleGenderChange = (selectedGender) => {
        if (user?.isActive) {
            setGender(selectedGender);
            form.setValue('gender', selectedGender);
        }
    };

    const handleBack = () => navigate(-1);

    async function onSubmit(values) {
        if (!user?.isActive) return;

        try {
            const updateUserProfile = {
                id: user?.userID,
                fullname: values.fullname,
                dateOfBirth: values.dateOfBirth,
                address: values.address,
                bio: values.bio,
                phoneNumber: values.phoneNumber,
                gender: gender,
            };

            if (newAvatarSrc) {
                setIsImgUploading(true);

                const uploadResponse = await uploadFile({
                    file: newAvatarSrc,
                    folder: UPLOAD_FOLDER.getUserProfileFolder(user?.userID),
                    customFilename: UPLOAD_NAME.PROFILE_PICTURE,
                });

                updateUserProfile.imageUrl = uploadResponse.secure_url;
            }

            await updateUser(updateUserProfile)
                .unwrap()
                .then(() => {
                    toast.success('Cập nhật thông tin thành công');
                    setInitialValues(values);
                    setIsModified(false);
                })
                .catch((err) => {
                    toast.error('Cập nhật thông tin thất bại');
                    console.error('Failed to update user profile:', err);
                });
        } catch (error) {
            console.error('Failed to update user profile:', error);
        } finally {
            setIsImgUploading(false);
        }
    }

    const handleAvatarChange = (event) => {
        if (!user?.isActive) return;

        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewAvatarSrc(file);
                setAvatarSrc(reader.result);
                setIsModified(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragEnter = () => setDragging(true);
    const handleDragLeave = () => setDragging(false);

    return (
        <div className="container mx-auto px-4 md:px-16 py-12">
            <div className="flex flex-col items-center space-y-4">
                <h2 className="text-3xl font-semibold mb-8">Thông tin cá nhân</h2>
                <div
                    className="relative flex flex-col items-center space-y-4"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                >
                    <div
                        className={`relative border-4 border-dashed ${
                            dragging ? 'border-primary' : 'border-secondary'
                        } rounded-full p-4 cursor-pointer overflow-hidden`}
                    >
                        <Avatar className="h-40 w-40 border-4 border-white rounded-full shadow-lg">
                            <AvatarImage className="object-cover" src={avatarSrc} alt={user?.fullname} />
                            <AvatarFallback>{user?.fullname?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={!user?.isActive}
                        />
                    </div>
                </div>
                {displayRole && (
                    <div className="mt-2">
                        <Badge className={`${roleColorClass} px-3 py-1 rounded-full`}>{displayRole}</Badge>
                    </div>
                )}
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-12">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Form fields */}
                        <FormField
                            control={form.control}
                            name="fullname"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xl">Tên tài khoản</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="text-lg h-14 border-2 border-primary"
                                            {...field}
                                            disabled={!user?.isActive}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xl">Email</FormLabel>
                                    <FormControl>
                                        <Input className="text-lg h-14 border-2 border-primary" {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xl">Ngày sinh</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            className="text-lg h-14 border-2 border-primary"
                                            {...field}
                                            disabled={!user?.isActive}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormItem>
                            <FormLabel className="text-xl">Giới tính</FormLabel>
                            <FormControl>
                                <div className="flex space-x-4">
                                    <Label className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={gender === 'Male'}
                                            onCheckedChange={() => handleGenderChange('Male')}
                                            className="h-6 w-6"
                                            disabled={!user?.isActive}
                                        />
                                        <span className="text-lg">Nam</span>
                                    </Label>
                                    <Label className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={gender === 'Female'}
                                            onCheckedChange={() => handleGenderChange('Female')}
                                            className="h-6 w-6"
                                            disabled={!user?.isActive}
                                        />
                                        <span className="text-lg">Nữ</span>
                                    </Label>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xl">Số điện thoại</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="text-lg h-14 border-2 border-primary"
                                            {...field}
                                            disabled={!user?.isActive}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xl">Địa chỉ</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="text-lg h-14 border-2 border-primary"
                                            {...field}
                                            disabled={!user?.isActive}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel className="text-xl">Giới thiệu bản thân</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="text-lg h-20 border-2 border-primary"
                                            {...field}
                                            disabled={!user?.isActive}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-8">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={handleBack}
                            className="text-xl px-4 py-2 rounded-lg text-teal-600 border-teal-600 hover:bg-normal hover:text-teal-600"
                        >
                            <Undo2 className="mr-2 w-4 h-4" /> Trở lại
                        </Button>
                        {user?.isActive ? (
                            <ButtonLoading
                                className="w-full md:w-[40%] h-14 text-white text-2xl bg-gradient-to-r from-primary to-secondary"
                                type="submit"
                                disabled={!isModified || isLoading || isImgUploading}
                                isLoading={isLoading || isImgUploading}
                            >
                                Cập nhật
                            </ButtonLoading>
                        ) : (
                            <div className="p-4 bg-red-50 text-red-600 text-lg">
                                <p>
                                    Tài khoản này đã bị vô hiệu hóa. Lý do:{' '}
                                    <strong>{user?.rejectionReason || 'Không có lý do'}</strong>
                                </p>
                            </div>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}
