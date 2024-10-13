import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { MoreHorizontal, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import { DataTableToolbarAdmin } from '@/components/datatable/DataTableToolbarAdmin';
import Breadcrumb from '@/pages/admin/Breadcrumb';





const data = [
    {
        id: 'gr001',
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        email: 'nguyenvana@gmail.com',
        logo: 'https://doanthanhnien.vn/Uploads/logo.jpg',
        groupName: 'CLB Tình Nguyện A',
        status: 'pending',
    },
    {
        id: 'gr002',
        name: 'Trần Thị B',
        phone: '0987654321',
        email: 'tranthib@gmail.com',
        logo: 'https://doanthanhnien.vn/Uploads/logo.jpg',
        groupName: 'Đội Thiện Nguyện B',
        status: 'pending',
    },
];

export function GuaranteeRequests() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState(data);

    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Trung tâm Quản trị', path: '/center' },
        { name: 'Đơn đăng ký bảo lãnh', path: null },

    ];


    const columns = [
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />,
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'phone',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Điện thoại" />,
            cell: ({ row }) => <div>{row.getValue('phone')}</div>,
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
            cell: ({ row }) => <div>{row.getValue('email')}</div>,
        },
        {
            accessorKey: 'logo',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Logo" />,
            cell: ({ row }) => <img src={row.getValue('logo')} alt="Logo" className="w-10 h-10 object-contain" />,
        },
        {
            accessorKey: 'groupName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên CLB/Đội/Nhóm" />,
            cell: ({ row }) => <div>{row.getValue('groupName')}</div>,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
            cell: ({ row }) => (
                <div className={`font-medium ${row.getValue('status') === 'approved' ? 'text-green-600' :
                    row.getValue('status') === 'rejected' ? 'text-red-600' : 'text-blue-600'
                    }`}>
                    {row.getValue('status') === 'approved' ? 'Đã duyệt' :
                        row.getValue('status') === 'rejected' ? 'Đã từ chối' : 'Đang chờ'}
                </div>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/center/guarantee-requests/${row.original.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>

                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const table = useReactTable({
        data: requests,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="w-full space-y-4 mx-3">
                <DataTableToolbarAdmin table={table} type="GuaranteeRequests" />
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

export default GuaranteeRequests;