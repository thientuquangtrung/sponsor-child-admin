import React from 'react';
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
import { ToolbarForGuarantee } from '@/components/datatable/ToolbarForGuarantee';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { useGetPendingApprovalGuaranteesQuery } from '@/redux/guarantee/guaranteeApi';
import { guaranteeTypes, organizationTypes, guaranteeStatus } from '@/config/combobox';
import LoadingScreen from '@/components/common/LoadingScreen';

export function GuaranteeRequests() {
    const navigate = useNavigate();
    const {
        data: requests,
        isLoading,
        error,
    } = useGetPendingApprovalGuaranteesQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    console.log(requests);

    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Trung tâm Quản trị', path: '/center' },
        { name: 'Danh sách đăng ký bảo lãnh', path: null },
    ];

    const columns = [
        {
            accessorKey: 'fullname',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Họ tên" />,
            cell: ({ row }) => <div className="font-medium">{row.getValue('fullname')}</div>,
        },
        {
            accessorKey: 'guaranteeType',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Loại đăng kí" />,
            cell: ({ row }) => {
                const typeValue = row.getValue('guaranteeType');
                const type = guaranteeTypes.find((t) => t.value === parseInt(typeValue));
                return (
                    <div
                        className={`font-bold ${type && type.value === 0
                            ? 'text-green-600'
                            : type && type.value === 1
                                ? 'text-orange-600'
                                : 'text-gray-600'
                            }`}
                    >
                        {type ? type.label : 'Không xác định'}
                    </div>
                );
            },
        },
        {
            accessorKey: 'registrationDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày đăng kí" />,
            //convert to human readable date dd/mm/yyyy
            cell: ({ row }) => <div>{new Date(row.getValue('registrationDate')).toLocaleDateString('vi-VN')}</div>,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
            cell: ({ row }) => {
                const status = row.getValue('status');
                const statusObj = guaranteeStatus.find((s) => s.value === status);
                return (
                    <div
                        className={`font-medium ${statusObj?.value === "1"
                            ? 'text-green-600'
                            : statusObj?.value === 2
                                ? 'text-red-600'
                                : 'text-blue-600'
                            }`}
                    >
                        {statusObj ? statusObj.label : 'Không xác định'}
                    </div>
                );
            },
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
                        <DropdownMenuItem onClick={() => navigate(`/center/guarantee-requests/${row.original.userID}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const table = useReactTable({
        data: requests || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (isLoading) return <LoadingScreen />;
    if (error) return <div>Đã xảy ra lỗi: {error.message}</div>;

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="w-full space-y-4 mx-3">
                <ToolbarForGuarantee table={table} type="GuaranteeRequests" />
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
