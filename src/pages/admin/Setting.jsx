import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCcw, SlidersHorizontal, LoaderCircle } from 'lucide-react';
import { configCategory } from '@/config/combobox';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    useGetAdminConfigQuery,
    useSetDefaultCategoryConfigMutation,
    useUpdateAdminConfigMutation,
} from '@/redux/adminConfig/adminConfigApi';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

export default function SettingsPage() {
    const { user } = useSelector((state) => state.auth);
    const { data: configData, isLoading } = useGetAdminConfigQuery();
    const [setDefaultCategoryConfig] = useSetDefaultCategoryConfigMutation();
    const [groupedConfigs, setGroupedConfigs] = useState({});
    const [updateAdminConfig] = useUpdateAdminConfigMutation();
    const [modifiedConfigValues, setModifiedConfigValues] = useState({});
    const [openResetDialog, setOpenResetDialog] = useState(null);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(null);
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
    const [isLoadingSetDefault, setIsLoadingSetDefault] = useState(false);

    useEffect(() => {
        if (configData) {
            const grouped = configData.reduce((acc, config) => {
                const categoryId = config.configCategory;
                if (!acc[categoryId]) {
                    acc[categoryId] = [];
                }
                acc[categoryId].push(config);
                return acc;
            }, {});

            setGroupedConfigs(grouped);
        }
    }, [configData]);

    const handleInputChange = (category, key, value) => {
        setModifiedConfigValues((prevState) => ({
            ...prevState,
            [key]: value || '',
        }));
    };

    const isUpdateButtonEnabled = (category) => {
        return groupedConfigs[category].some((config) => {
            return (
                modifiedConfigValues[config.configKey] !== undefined &&
                modifiedConfigValues[config.configKey] !== config.configValue
            );
        });
    };

    const handleSetDefault = async (categoryId) => {
        console.log(`Resetting values for category: ${categoryId}`);
        setIsLoadingSetDefault(true);

        try {
            await setDefaultCategoryConfig({ categoryId }).unwrap();
            toast.success('Đặt lại mặc định thành công!');
        } catch (error) {
            console.error('Error resetting config:', error);
            toast.error('Có lỗi xảy ra khi đặt lại mặc định');
        }

        setIsLoadingSetDefault(false);
        setOpenResetDialog(null);
    };

    const handleUpdate = async (category) => {
        console.log(`Updating values for category: ${category}`);
        setIsLoadingUpdate(true);

        const configsToUpdate = groupedConfigs[category];

        for (const config of configsToUpdate) {
            const updatedConfig = {
                id: config.id,
                configuredByUserID: user.userID,
                configValue: modifiedConfigValues[config.configKey] || config.configValue,
                description: config.description,
            };

            try {
                await updateAdminConfig(updatedConfig).unwrap();
                toast.success('Cập nhật thành công!');
            } catch (error) {
                toast.error('Có lỗi xảy ra khi cập nhật');
            }
        }

        setIsLoadingUpdate(false);
        setOpenUpdateDialog(null);
    };

    if (isLoading) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-10 space-y-8">
            <div className="flex items-center space-x-4">
                <SlidersHorizontal className="w-8 h-8" />
                <h1 className="text-3xl font-bold text-gray-800">Cài đặt hệ thống</h1>
            </div>
            <div className="space-y-6">
                {Object.keys(groupedConfigs).map((categoryId) => {
                    const categoryLabel =
                        configCategory.find((item) => item.value === parseInt(categoryId))?.label ||
                        `Unknown Category (${categoryId})`;

                    return (
                        <Card key={categoryId} className="p-4 space-y-4">
                            <CardHeader>
                                <CardTitle>{`Cài đặt ${categoryLabel}`}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {groupedConfigs[categoryId].map((config) => (
                                    <div key={config.id} className="grid grid-cols-2 gap-4 items-center">
                                        <Label htmlFor={config.configKey} className="text-md">
                                            {config.description}
                                        </Label>
                                        {typeof config.configValue === 'boolean' ? (
                                            <Switch
                                                id={config.configKey}
                                                checked={config.configValue === 'true'}
                                                onCheckedChange={(value) =>
                                                    handleInputChange(categoryId, config.configKey, value)
                                                }
                                            />
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    id={config.configKey}
                                                    type={typeof config.configValue === 'number' ? 'number' : 'text'}
                                                    value={
                                                        modifiedConfigValues[config.configKey] !== undefined
                                                            ? modifiedConfigValues[config.configKey]
                                                            : config.configValue
                                                    }
                                                    className="border-gray-300 w-[50%]"
                                                    onChange={(e) =>
                                                        handleInputChange(categoryId, config.configKey, e.target.value)
                                                    }
                                                />

                                                <span className="text-sm text-gray-500">{config.unit}</span>
                                            </div>
                                        )}
                                        <div className="text-sm text-gray-500">
                                            <p>
                                                <strong>Mặc định:</strong> {config.defaultValue}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-4">
                                <Dialog
                                    open={openResetDialog === categoryId}
                                    onOpenChange={(isOpen) => {
                                        if (!isOpen) setOpenResetDialog(null);
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            onClick={() => setOpenResetDialog(categoryId)}
                                            className="flex items-center gap-2 bg-rose-100 hover:bg-rose-300"
                                        >
                                            <RefreshCcw className="w-4 h-4" />
                                            Đặt mặc định
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Xác nhận đặt lại</DialogTitle>
                                        </DialogHeader>
                                        <p className="text-sm text-gray-600">
                                            Bạn có chắc chắn muốn đặt lại tất cả giá trị trong danh mục{' '}
                                            <b>
                                                {configCategory.find((item) => item.value === parseInt(categoryId))
                                                    ?.label || 'Danh mục không xác định'}
                                            </b>{' '}
                                            về mặc định không?
                                        </p>
                                        <DialogFooter>
                                            <Button variant="primary" onClick={() => setOpenResetDialog(null)}>
                                                Hủy
                                            </Button>
                                            <Button
                                                className="bg-rose-100 hover:bg-rose-300"
                                                onClick={() => handleSetDefault(categoryId)}
                                                disabled={isLoadingSetDefault}
                                            >
                                                {isLoadingSetDefault ? (
                                                    <LoaderCircle className="animate-spin" size={18} />
                                                ) : (
                                                    'Đồng ý'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Dialog
                                    open={openUpdateDialog === categoryId}
                                    onOpenChange={(isOpen) => {
                                        if (!isOpen) setOpenUpdateDialog(null);
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            className="bg-teal-100"
                                            onClick={() => setOpenUpdateDialog(categoryId)}
                                            disabled={!isUpdateButtonEnabled(categoryId)}
                                        >
                                            {isLoadingUpdate ? (
                                                <LoaderCircle className="animate-spin" size={18} />
                                            ) : (
                                                'Cập nhật'
                                            )}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Xác nhận cập nhật</DialogTitle>
                                        </DialogHeader>
                                        <p className="text-sm text-gray-600">
                                            Bạn có chắc chắn muốn cập nhật tất cả giá trị đã chỉnh sửa trong danh mục{' '}
                                            <b>{categoryLabel}</b> không?
                                        </p>
                                        <DialogFooter>
                                            <Button variant="primary" onClick={() => setOpenUpdateDialog(null)}>
                                                Hủy
                                            </Button>
                                            <Button
                                                className="bg-teal-100"
                                                onClick={() => handleUpdate(categoryId)}
                                                disabled={!isUpdateButtonEnabled(categoryId) || isLoadingUpdate}
                                            >
                                                {isLoadingUpdate ? (
                                                    <LoaderCircle className="animate-spin" size={18} />
                                                ) : (
                                                    'Đồng ý'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
