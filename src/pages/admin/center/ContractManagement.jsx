import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { MoreHorizontal, Eye, Download } from 'lucide-react';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const data = [
    {
        id: 'contract001',
        contractNumber: 'CT001',
        contractType: 'disbursement',
        partyB: 'Nguyễn Văn A',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        signatureDate: '2023-12-15',
        amount: 100000000,
    },
    {
        id: 'contract002',
        contractNumber: 'CT002',
        contractType: 'guarantee',
        partyB: 'Trần Thị B',
        startDate: '2024-02-01',
        endDate: '2025-01-31',
        status: 'pending',
        signatureDate: '2024-01-20',
        guaranteeAmount: 50000000,
    },
];

export function ContractManagement() {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState(data);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedType, setSelectedType] = useState('all');

    const breadcrumbs = [
        { name: 'Trung tâm Quản trị', path: '/center' },
        { name: 'Danh sách hợp đồng', path: null },
    ];

    const filteredContracts = useMemo(() => {
        return contracts.filter(contract =>
            (selectedStatus === 'all' || contract.status === selectedStatus) &&
            (selectedType === 'all' || contract.contractType === selectedType)
        );
    }, [contracts, selectedStatus, selectedType]);

    const columns = [
        {
            accessorKey: 'contractNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Số hợp đồng" />,
            cell: ({ row }) => <div className="font-medium">{row.getValue('contractNumber')}</div>,
        },
        {
            accessorKey: 'contractType',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Loại hợp đồng" />,
            cell: ({ row }) => (
                <div>
                    {row.getValue('contractType') === 'disbursement' ? 'Giải ngân' : 'Tham gia bảo lãnh'}
                </div>
            ),
        },

        {
            accessorKey: 'partyB',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Bên B" />,
            cell: ({ row }) => <div>{row.getValue('partyB')}</div>,
        },
        {
            accessorKey: 'startDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày bắt đầu" />,
            cell: ({ row }) => <div>{new Date(row.getValue('startDate')).toLocaleDateString('vi-VN')}</div>,
        },
        {
            accessorKey: 'endDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày kết thúc" />,
            cell: ({ row }) => <div>{new Date(row.getValue('endDate')).toLocaleDateString('vi-VN')}</div>,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
            cell: ({ row }) => (
                <div className={`font-medium ${row.getValue('status') === 'active' ? 'text-green-600' :
                    row.getValue('status') === 'pending' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                    {row.getValue('status') === 'active' ? 'Đang hiệu lực' :
                        row.getValue('status') === 'pending' ? 'Chờ ký' : 'Hết hạn'}
                </div>
            ),
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Số tiền" />,
            cell: ({ row }) => {
                const amount = row.getValue('amount') || row.getValue('guaranteeAmount');
                return <div>{amount ? amount.toLocaleString('vi-VN') + ' VND' : 'N/A'}</div>;
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
                        <DropdownMenuItem onClick={() => navigate(`/center/contracts/${row.original.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadPDF(row.original.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            Tải PDF
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const table = useReactTable({
        data: filteredContracts,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const handleDownloadPDF = (contractId) => {
    };

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="w-full space-y-4 mx-3">
                <div className="flex justify-between items-center">
                    <DataTableToolbarAdmin table={table} type="Contracts" />
                    <div className="flex space-x-2">
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Chọn loại hợp đồng" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả loại hợp đồng</SelectItem>
                                <SelectItem value="disbursement">Hợp đồng giải ngân</SelectItem>
                                <SelectItem value="guarantee">Hợp đồng tham gia bảo lãnh</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="active">Đang hiệu lực</SelectItem>
                                <SelectItem value="pending">Chờ ký</SelectItem>
                                <SelectItem value="expired">Hết hạn</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
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

export default ContractManagement;