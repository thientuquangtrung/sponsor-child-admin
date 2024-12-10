import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { YearPicker } from '@/components/ui/year-picker';
import { useSearchCampaignsQuery } from '@/redux/campaign/campaignApi';

const ChildSearch = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        childName: '',
        childBirthYear: '',
        childLocation: '',
        childIdentificationCode: ''
    });
    const [shouldSearch, setShouldSearch] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedYear, setSelectedYear] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const { data: searchResults, isLoading: isSearching } = useSearchCampaignsQuery(
        searchParams,
        { skip: !shouldSearch }
    );

    const handleSearch = () => {
        if (!searchParams.childName &&
            !searchParams.childBirthYear &&
            !searchParams.childLocation &&
            !searchParams.childIdentificationCode) {
            setShowWarning(true);
            return;
        }
        setShowWarning(false);
        setShouldSearch(true);
        setShowResults(true);
    };

    const handleReset = () => {
        setSearchParams({
            childName: '',
            childBirthYear: '',
            childLocation: '',
            childIdentificationCode: ''
        });
        setSelectedYear(null);
        setShouldSearch(false);
        setShowWarning(false);
        setShowResults(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
        setShowWarning(false);
    };

    const handleYearChange = (year) => {
        const selectedYear = year.getFullYear();
        setSelectedYear(selectedYear);
        setSearchParams(prev => ({
            ...prev,
            childBirthYear: selectedYear.toString()
        }));
    };

    const handleViewDetails = (campaignID) => {
        window.location.href = `/campaign/${campaignID}`;
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <Card className="max-w-7xl mx-auto shadow-xl rounded-lg overflow-hidden">
            <CardHeader
                className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 transition-all duration-300 ease-in-out cursor-pointer hover:bg-opacity-90"
                onClick={toggleExpand}
            >
                <div className="flex justify-between items-center">
                    <CardTitle className="text-2xl font-bold tracking-wide">
                        Tìm kiếm thông tin trẻ em
                    </CardTitle>
                    <Button
                        variant="ghost"
                        className="text-white rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand();
                        }}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-6 w-6 transition-transform" />
                        ) : (
                            <ChevronDown className="h-6 w-6 transition-transform" />
                        )}
                    </Button>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 space-y-4 md:space-y-0">
                        {[
                            {
                                label: 'Họ và tên',
                                name: 'childName',
                                placeholder: 'Nhập họ và tên'
                            },
                            {
                                label: 'Năm sinh',
                                type: 'year',
                                name: 'childBirthYear'
                            },
                            {
                                label: 'Địa chỉ',
                                name: 'childLocation',
                                placeholder: 'Nhập địa chỉ'
                            },
                            {
                                label: 'Mã định danh',
                                name: 'childIdentificationCode',
                                placeholder: 'Nhập mã định danh'
                            }
                        ].map((field) => (
                            <div key={field.name} className="space-y-2">
                                <Label htmlFor={field.name} className="text-gray-700 font-medium">
                                    {field.label}
                                </Label>
                                {field.type === 'year' ? (
                                    <YearPicker
                                        date={selectedYear ? new Date(selectedYear, 0, 1) : undefined}
                                        onYearSelect={handleYearChange}
                                        fromYear={new Date().getFullYear() - 16}
                                        toYear={new Date().getFullYear()}
                                        className="w-full"
                                    />
                                ) : (
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        placeholder={field.placeholder}
                                        value={searchParams[field.name]}
                                        onChange={handleInputChange}
                                        className="h-10 w-full border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {showWarning && (
                        <Alert
                            variant="destructive"
                            className="mb-4 bg-red-50 border-red-200 animate-pulse"
                        >
                            <AlertDescription className="text-red-600">
                                Vui lòng nhập ít nhất một thông tin để tìm kiếm
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-center space-x-4 mt-6">
                        <Button
                            onClick={handleSearch}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50"
                            disabled={isSearching}
                        >
                            <Search className="w-5 h-5 mr-2" />
                            {isSearching ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
                        </Button>
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="border-2 border-teal-600 text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-6 py-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                        >
                            <RotateCcw className="w-5 h-5 mr-2" />
                            Đặt lại
                        </Button>
                    </div>

                    {showResults && searchResults && searchResults.length > 0 && (
                        <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
                            <h3 className="text-xl font-semibold text-gray-800 p-4 bg-gray-100 border-b">
                                Kết quả tìm kiếm:
                            </h3>
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        {['Họ và tên', 'Năm sinh', 'Địa chỉ', 'Mã định danh', 'Tiêu đề chiến dịch', ''].map((header) => (
                                            <TableHead key={header} className="text-gray-700 font-bold">
                                                {header}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {searchResults.map((result) => (
                                        <TableRow
                                            key={result.campaignID}
                                            className="hover:bg-gray-100 transition-colors"
                                        >
                                            {[
                                                result.childName,
                                                result.childBirthYear,
                                                result.childLocation,
                                                result.childIdentificationCode,
                                                result.title
                                            ].map((cellData, index) => (
                                                <TableCell key={index} className="py-3 px-4">
                                                    {cellData}
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <Button
                                                    onClick={() => handleViewDetails(result.campaignID)}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md transition-all duration-300 ease-in-out transform hover:scale-105"
                                                >
                                                    Xem chi tiết
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {showResults && searchResults && searchResults.length === 0 && (
                        <Alert
                            className="mt-6 bg-teal-50 border-blue-200 text-center"
                        >
                            <AlertTitle className="text-teal-700">Không tìm thấy kết quả</AlertTitle>
                            <AlertDescription className="text-teal-600">
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