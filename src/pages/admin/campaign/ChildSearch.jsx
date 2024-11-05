import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, X, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const ChildSearch = ({ onProceed }) => {
    const [searchParams, setSearchParams] = useState({
        name: '',
        birthYear: '',
        address: ''
    });
    const [searchResults, setSearchResults] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleSearch = async () => {
        if (!searchParams.name && !searchParams.birthYear && !searchParams.address) {
            setShowWarning(true);
            return;
        }
        setShowWarning(false);
        setIsSearching(true);

        try {

            setSearchResults([
                {
                    id: 1,
                    name: "Nguyễn Văn A",
                    birthYear: "2015",
                    address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
                    existingCampaigns: 1
                }
            ]);
        } catch (error) {
            console.error('Error searching child info:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        setSearchParams({
            name: '',
            birthYear: '',
            address: ''
        });
        setSearchResults(null);
        setShowWarning(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
        setShowWarning(false);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Card className="shadow-lg border-0 mb-6">
            <CardHeader className="bg-teal-600 text-white cursor-pointer" onClick={toggleExpand}>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-semibold">Tìm kiếm thông tin trẻ em</CardTitle>
                    <Button
                        variant="ghost"
                        className="text-white hover:text-gray-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand();
                        }}
                    >
                        {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                    </Button>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700">
                                Họ và tên
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Nhập họ và tên"
                                value={searchParams.name}
                                onChange={handleInputChange}
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="birthYear" className="text-gray-700">
                                Năm sinh
                            </Label>
                            <Input
                                id="birthYear"
                                name="birthYear"
                                placeholder="Nhập năm sinh"
                                value={searchParams.birthYear}
                                onChange={handleInputChange}
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-gray-700">
                                Địa chỉ
                            </Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="Nhập địa chỉ"
                                value={searchParams.address}
                                onChange={handleInputChange}
                                className="h-10"
                            />
                        </div>
                    </div>

                    {showWarning && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Cảnh báo</AlertTitle>
                            <AlertDescription>
                                Vui lòng nhập ít nhất một thông tin để tìm kiếm
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-center gap-2">
                        <Button
                            onClick={handleSearch}
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            disabled={isSearching}
                        >
                            <Search className="w-4 h-4 mr-2" />
                            {isSearching ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="border-teal-600 text-teal-600 hover:bg-teal-50"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Đặt lại
                        </Button>
                    </div>

                    {searchResults && searchResults.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">Kết quả tìm kiếm:</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Họ và tên</TableHead>
                                        <TableHead>Năm sinh</TableHead>
                                        <TableHead>Địa chỉ</TableHead>
                                        <TableHead>Số chiến dịch hiện có</TableHead>
                                        <TableHead>Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {searchResults.map((result) => (
                                        <TableRow key={result.id}>
                                            <TableCell>{result.name}</TableCell>
                                            <TableCell>{result.birthYear}</TableCell>
                                            <TableCell>{result.address}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-sm ${result.existingCampaigns > 0
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {result.existingCampaigns}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    onClick={() => {
                                                        onProceed?.(result);
                                                        setIsExpanded(false);
                                                    }}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white"
                                                    disabled={result.existingCampaigns > 0}
                                                >
                                                    {result.existingCampaigns > 0
                                                        ? 'Đã có chiến dịch'
                                                        : 'Tiếp tục'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {searchResults && searchResults.length === 0 && (
                        <Alert className="mt-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Không tìm thấy kết quả</AlertTitle>
                            <AlertDescription>
                                Không tìm thấy thông tin trẻ em phù hợp với thông tin tìm kiếm
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            )}
        </Card>
    );
};

export default ChildSearch;