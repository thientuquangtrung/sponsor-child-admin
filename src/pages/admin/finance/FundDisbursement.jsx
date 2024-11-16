import React, { useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import { DataTableToolbarAdmin } from '@/components/datatable/DataTableToolbarAdmin';
import Breadcrumb from '@/pages/admin/Breadcrumb';

const data = [
    {
        planId: 1,
        campaignId: 'CT001',
        organization: 'Tổ chức Từ thiện A',
        plannedStartDate: new Date('2024-06-01').toISOString(),
        plannedEndDate: new Date('2024-12-31').toISOString(),
        actualEndDate: null,
        totalPlannedAmount: 100000000,
        status: 'Chờ duyệt',
        amendmentAllowed: true,
        rejectionReason: null,
        approvedBy: null,
        stages: [
            { stageNumber: 1, disbursementAmount: 30000000, scheduledDate: new Date('2024-06-15').toISOString(), status: 'Yêu cầu' },
            { stageNumber: 2, disbursementAmount: 40000000, scheduledDate: new Date('2024-09-15').toISOString(), status: 'Chờ xử lý' },
            { stageNumber: 3, disbursementAmount: 30000000, scheduledDate: new Date('2024-12-15').toISOString(), status: 'Chờ xử lý' },
        ],
    },
];

const columns = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Chọn tất cả"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Chọn hàng"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'planId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mã kế hoạch" />,
        cell: ({ row }) => <div>{row.getValue('planId')}</div>,
    },
    {
        accessorKey: 'campaignId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mã chiến dịch" />,
        cell: ({ row }) => <div>{row.getValue('campaignId')}</div>,
    },
    {
        accessorKey: 'organization',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tổ chức nhận" />,
        cell: ({ row }) => <div>{row.getValue('organization')}</div>,
    },
    {
        accessorKey: 'plannedStartDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày bắt đầu" />,
        cell: ({ row }) => <div>{new Date(row.getValue('plannedStartDate')).toLocaleDateString('vi-VN')}</div>,
    },
    {
        accessorKey: 'plannedEndDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày kết thúc" />,
        cell: ({ row }) => <div>{new Date(row.getValue('plannedEndDate')).toLocaleDateString('vi-VN')}</div>,
    },
    {
        accessorKey: 'totalPlannedAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tổng số tiền" />,
        cell: ({ row }) => <div>{row.getValue('totalPlannedAmount').toLocaleString('vi-VN')} ₫</div>,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
            <Badge variant={getBadgeVariant(row.getValue('status'))}>
                {row.getValue('status')}
            </Badge>
        ),
    },
    {
        accessorKey: 'approvedBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người phê duyệt" />,
        cell: ({ row }) => <div>{row.getValue('approvedBy') || 'Chưa phê duyệt'}</div>,
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionMenu row={row} />,
    },
];

const getBadgeVariant = (status) => {
    switch (status) {
        case 'Chờ duyệt': return 'default';
        case 'Đã duyệt': return 'success';
        case 'Từ chối': return 'destructive';
        case 'Thay thế': return 'warning';
        case 'Yêu cầu sửa đổi': return 'secondary';
        default: return 'default';
    }
};

const ActionMenu = ({ row }) => {
    const handleViewDetails = () => {
    };

    const handleEdit = () => {
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Mở menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleViewDetails}>Xem chi tiết</DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>Chỉnh sửa</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export function FundDisbursement() {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Giải ngân', path: null },
    ];
    const table = useReactTable({
        data,
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
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />


            <div className="w-full space-y-4 mx-3">

                <DataTableToolbarAdmin table={table} type="FundDisbursement" />
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
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

export default FundDisbursement;