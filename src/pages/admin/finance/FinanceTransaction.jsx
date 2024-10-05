import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import Breadcrumb from '@/pages/admin/Breadcrumb';

const transactionData = [
    {
        id: 1,
        paymentMethodId: 1, // Ex: 1 for Bank name
        campaignId: 101,
        transactionDate: new Date(2024, 8, 15).toISOString(),
        amount: 5000000,
        transactionType: 1, // Ex: 1 for Donation
        status: 'Successful',
        transactionReference: 'ABC123456',
        bankAccountNumber: '0123456789',
        donationId: 11,
        disbursementStageId: null,
        visitRegistrationId: null,
    },
    {
        id: 2,
        paymentMethodId: 1,
        campaignId: 102,
        transactionDate: new Date(2024, 8, 10).toISOString(),
        amount: 300000,
        transactionType: 2, // Ex: 2 for Visit Payment
        status: 'Pending',
        transactionReference: 'BCD654321',
        bankAccountNumber: null,
        donationId: null,
        disbursementStageId: 3,
        visitRegistrationId: 25,
    },
];

const paymentMethods = {
    1: 'Bank Name',
};

const transactionTypes = {
    1: 'Donation',
    2: 'Visit Payment',
    3: 'Disbursement',
};

const columns = [
    {
        accessorKey: 'transactionDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày giao dịch" />,
        cell: ({ row }) => <div>{new Date(row.getValue('transactionDate')).toLocaleDateString('vi-VN')}</div>,
    },
    {
        accessorKey: 'campaignId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Chiến dịch" />,
        cell: ({ row }) => <div>{row.getValue('campaignId')}</div>,
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số tiền" />,
        cell: ({ row }) => (
            <div className="text-right font-medium">
                {row.getValue('amount').toLocaleString('vi-VN')} ₫
            </div>
        ),
    },
    {
        accessorKey: 'paymentMethodId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phương thức thanh toán" />,
        cell: ({ row }) => <div>{paymentMethods[row.getValue('paymentMethodId')]}</div>,
    },
    {
        accessorKey: 'transactionType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại giao dịch" />,
        cell: ({ row }) => <div>{transactionTypes[row.getValue('transactionType')]}</div>,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
            <Badge variant={row.getValue('status') === 'Successful' ? 'default' : 'secondary'}>
                {row.getValue('status')}
            </Badge>
        ),
    },
    {
        accessorKey: 'transactionReference',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mã giao dịch" />,
        cell: ({ row }) => <div>{row.getValue('transactionReference') || 'N/A'}</div>,
    },
    {
        accessorKey: 'bankAccountNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số tài khoản" />,
        cell: ({ row }) => <div>{row.getValue('bankAccountNumber') || 'N/A'}</div>,
    },
];

export function FinanceTransaction() {
    const navigate = useNavigate();

    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data: transactionData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <>      <Breadcrumb pageName="Giao dịch" />

            <div className="w-full space-y-4">
                <div className="flex justify-end">
                    <Button
                        className="mr-2 mt-3 border-2 border-[#25a5a7] bg-transparent text-[#25a5a7] hover:bg-[#25a5a7] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                        onClick={() => navigate('/admin/finance/export-transaction')}
                    >
                        Export Transaction
                    </Button>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Không có kết quả.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination table={table} />
            </div>
        </>
    );
}

export default FinanceTransaction;
