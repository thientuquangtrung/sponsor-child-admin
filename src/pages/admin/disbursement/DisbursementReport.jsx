import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const DisbursementReport = ({ disbursementReports }) => {
    const sortedReports = [...(disbursementReports || [])].sort((a, b) => {
        if (a.isCurrent) return -1;
        if (b.isCurrent) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const defaultTab = sortedReports?.find(report => report.isCurrent)?.id || sortedReports?.[0]?.id;
    const [activeTab, setActiveTab] = useState(defaultTab);

    const formatTabDate = (dateString) => {
        const date = new Date(dateString);
        return `KH_${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}_${date.getHours()}_${date.getMinutes()}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    };

    const calculateTotal = (details) => {
        return details.reduce((sum, detail) => sum + detail.amountSpent, 0);
    };

    if (!disbursementReports?.length) {
        return (
            <div className="text-center py-4 text-gray-500">
                Không có báo cáo giải ngân
            </div>
        );
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full max-w-[800px] bg-transparent">
                {sortedReports.map((report) => (
                    <TabsTrigger
                        key={report.id}
                        value={report.id}
                        className="relative px-4 py-2 rounded-none transition-colors duration-200
                        data-[state=active]:bg-transparent 
                        data-[state=active]:text-teal-500
                        hover:text-teal-500
                        after:content-['']
                        after:absolute
                        after:bottom-0
                        after:left-0
                        after:w-full
                        after:h-0.5
                        after:bg-teal-500
                        after:scale-x-0
                        data-[state=active]:after:scale-x-100
                        after:transition-transform
                        after:duration-300
                        whitespace-nowrap"
                    >
                        <div className="flex items-center">
                            <span>{formatTabDate(report.createdAt)}</span>
                            {report.isCurrent && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                                    Hiện tại
                                </span>
                            )}
                        </div>
                    </TabsTrigger>
                ))}
            </TabsList>

            {sortedReports.map((report) => (
                <TabsContent key={report.id} value={report.id}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm font-bold text-gray-500">
                                        Ngày tạo: {formatDate(report.createdAt)}
                                    </div>
                                    <div className="text-lg font-semibold">
                                        Tổng: {formatCurrency(calculateTotal(report.disbursementReportDetails))}
                                    </div>
                                </div>
                            </div>

                            <Table className="border border-gray-300">
                                <TableHeader>
                                    <TableRow className="border-b border-gray-300">
                                        <TableHead className="w-[50px] border border-gray-300">STT</TableHead>
                                        <TableHead className="border border-gray-300">Mô tả chi tiêu</TableHead>
                                        <TableHead className="text-right border border-gray-300">Số tiền dự kiến</TableHead>
                                        <TableHead className="text-right border border-gray-300">Số tiền thực tế</TableHead>
                                        <TableHead className="border border-gray-300">Hóa đơn</TableHead>
                                        <TableHead className="border border-gray-300">Ghi chú</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {report.disbursementReportDetails.map((detail, index) => (
                                        <TableRow key={detail.id} className="border-b border-gray-300">
                                            <TableCell className="border border-gray-300">{index + 1}</TableCell>
                                            <TableCell className="border border-gray-300">{detail.itemDescription}</TableCell>
                                            <TableCell className="text-right border border-gray-300">
                                                {formatCurrency(detail.amountSpent)}
                                            </TableCell>
                                            <TableCell className="text-right border border-gray-300">
                                                {detail.actualAmountSpent ? formatCurrency(detail.actualAmountSpent) : 'Chưa có'}
                                            </TableCell>
                                            <TableCell className="border border-gray-300">
                                                {detail.receiptUrl && (
                                                    <a href={detail.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">
                                                        Xem hóa đơn
                                                    </a>
                                                )}
                                            </TableCell>
                                            <TableCell className="border border-gray-300">
                                                {detail.comments}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-medium border-t border-gray-300">
                                        <TableCell colSpan={2} className="border border-gray-300">Tổng cộng</TableCell>
                                        <TableCell className="text-right border border-gray-300">
                                            {formatCurrency(calculateTotal(report.disbursementReportDetails))}
                                        </TableCell>
                                        <TableCell className="text-right border border-gray-300">
                                            {formatCurrency(report.disbursementReportDetails.reduce(
                                                (sum, detail) => sum + (detail.actualAmountSpent || 0),
                                                0
                                            ))}
                                        </TableCell>
                                        <TableCell colSpan={2} className="border border-gray-300"></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>

                            {report.rejectionReason && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertDescription>
                                        Lý do từ chối: {report.rejectionReason}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            ))}
        </Tabs>
    );
};

export default DisbursementReport;