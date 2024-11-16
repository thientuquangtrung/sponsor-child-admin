import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle, RotateCcw, ChevronUp, ChevronDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { YearPicker } from '@/components/ui/year-picker';
import { useSearchCampaignsQuery } from '@/redux/campaign/campaignApi';

const ChildSearch = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        childName: '',
        childBirthYear: '',
        childLocation: ''
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
        if (!searchParams.childName && !searchParams.childBirthYear && !searchParams.childLocation) {
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
            childLocation: ''
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

    // const handleViewDetails = (campaignID) => {
    //     navigate(`/campaign/${campaignID}`, {
    //         state: {
    //             fromSearch: true,
    //             campaignData: searchResults.find(result => result.campaignID === campaignID)
    //         },
    //         replace: true
    //     });
    // };
    const handleViewDetails = (campaignID) => {
        const campaignData = searchResults.find(result => result.campaignID === campaignID);
        window.location.href = `/campaign/${campaignID}`;
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
                            <Label htmlFor="childName" className="text-gray-700">
                                Họ và tên
                            </Label>
                            <Input
                                id="childName"
                                name="childName"
                                placeholder="Nhập họ và tên"
                                value={searchParams.childName}
                                onChange={handleInputChange}
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="childBirthYear" className="text-gray-700">
                                Năm sinh
                            </Label>
                            <YearPicker
                                date={selectedYear ? new Date(selectedYear, 0, 1) : undefined}
                                onYearSelect={handleYearChange}
                                fromYear={new Date().getFullYear() - 16}
                                toYear={new Date().getFullYear()}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="childLocation" className="text-gray-700">
                                Địa chỉ
                            </Label>
                            <Input
                                id="childLocation"
                                name="childLocation"
                                placeholder="Nhập địa chỉ"
                                value={searchParams.childLocation}
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

                    {showResults && searchResults && searchResults.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">Kết quả tìm kiếm:</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Họ và tên</TableHead>
                                        <TableHead>Năm sinh</TableHead>
                                        <TableHead>Địa chỉ</TableHead>
                                        <TableHead>Tiêu đề chiến dịch</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {searchResults.map((result) => (
                                        <TableRow key={result.campaignID}>
                                            <TableCell>{result.childName}</TableCell>
                                            <TableCell>{result.childBirthYear}</TableCell>
                                            <TableCell>{result.childLocation}</TableCell>
                                            <TableCell>{result.title}</TableCell>
                                            <TableCell>
                                                <Button
                                                    onClick={() => handleViewDetails(result.campaignID)}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white"
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