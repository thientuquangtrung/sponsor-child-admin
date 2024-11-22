import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RefreshCcw, SlidersHorizontal } from 'lucide-react';
import { configCategory } from '@/config/combobox';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useGetAdminConfigQuery } from '@/redux/adminConfig/adminConfigApi';

export default function SettingsPage() {
    const { data: configData, isLoading } = useGetAdminConfigQuery();
    const [groupedConfigs, setGroupedConfigs] = useState({});

    // Group the configurations by category when data is fetched
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
        console.log(`Changed ${category} - ${key} to: ${value}`);
    };

    const handleSetDefault = (category) => {
        console.log(`Resetting values for category: ${category}`);
    };

    const handleUpdate = (category) => {
        console.log(`Updating values for category: ${category}`);
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
                    const categoryLabel = configCategory.find((item) => item.value === parseInt(categoryId))?.label || `Unknown Category (${categoryId})`;

                    return (
                        <Card key={categoryId} className="p-6 space-y-4">
                            <CardHeader>
                                <CardTitle>{`Cài đặt ${categoryLabel}`}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
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
                                                    defaultValue={config.configValue}
                                                    className="border-gray-300 w-[50%]"
                                                    onBlur={(e) =>
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
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleSetDefault(categoryId)}
                                            className="flex items-center gap-2"
                                        >
                                            <RefreshCcw className="w-4 h-4" />
                                            Set Default
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Xác nhận đặt lại</DialogTitle>
                                        </DialogHeader>
                                        <p className="text-sm text-gray-600">
                                            Bạn có chắc chắn muốn đặt lại tất cả giá trị trong danh mục <b>{categoryLabel}</b> về
                                            mặc định không?
                                        </p>
                                        <DialogFooter>
                                            <Button
                                                variant="secondary"
                                                onClick={() => setPendingAction({ category: null, type: null })}
                                            >
                                                Hủy
                                            </Button>
                                            <Button variant="destructive" onClick={() => handleSetDefault(categoryId)}>
                                                Đồng ý
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="primary" onClick={() => handleUpdate(categoryId)}>
                                            Cập nhật
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
                                            <Button
                                                variant="secondary"
                                                onClick={() => setPendingAction({ category: null, type: null })}
                                            >
                                                Hủy
                                            </Button>
                                            <Button variant="primary" onClick={() => handleUpdate(categoryId)}>
                                                Đồng ý
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
