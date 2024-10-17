import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const FinanceReport = () => {
    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Báo cáo tài chính', path: null }
    ];

    const [financeData] = useState([
        { month: 'T1', sponsorship: 30000000, disbursement: 20000000 },
        { month: 'T2', sponsorship: 40000000, disbursement: 35000000 },
        { month: 'T3', sponsorship: 35000000, disbursement: 25000000 },
        { month: 'T4', sponsorship: 50000000, disbursement: 40000000 },
        { month: 'T5', sponsorship: 49000000, disbursement: 45000000 },
        { month: 'T6', sponsorship: 60000000, disbursement: 50000000 },
        { month: 'T7', sponsorship: 70000000, disbursement: 60000000 },
        { month: 'T8', sponsorship: 91000000, disbursement: 75000000 },
        { month: 'T9', sponsorship: 125000000, disbursement: 100000000 },
        { month: 'T10', sponsorship: 150000000, disbursement: 120000000 },
        { month: 'T11', sponsorship: 180000000, disbursement: 150000000 },
        { month: 'T12', sponsorship: 210000000, disbursement: 180000000 },
    ]);

    const exportToExcel = () => {
        const excelData = financeData.map(row => ({
            'Tháng': row.month,
            'Quỹ Quyên góp (VNĐ)': row.sponsorship,
            'Giải ngân (VNĐ)': row.disbursement,
            'Chênh lệch (VNĐ)': row.sponsorship - row.disbursement
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo tài chính");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

        saveAs(data, 'bao_cao_tai_chinh.xlsx');
    };

    return (
        <div className="space-y-6">
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="flex justify-end">
                <Button
                    className="border-2 border-[#25a5a7] bg-transparent text-[#25a5a7] hover:bg-[#25a5a7] hover:text-white"
                    onClick={exportToExcel}
                >
                    <Download className="mr-2 h-4 w-4" /> Xuất Excel
                </Button>
            </div>

            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tháng</TableHead>
                                <TableHead>Quỹ Quyên góp (VNĐ)</TableHead>
                                <TableHead>Giải ngân (VNĐ)</TableHead>
                                <TableHead>Chênh lệch (VNĐ)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {financeData.map((row) => (
                                <TableRow key={row.month}>
                                    <TableCell>{row.month}</TableCell>
                                    <TableCell>{row.sponsorship.toLocaleString()}</TableCell>
                                    <TableCell>{row.disbursement.toLocaleString()}</TableCell>
                                    <TableCell>{(row.sponsorship - row.disbursement).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default FinanceReport;