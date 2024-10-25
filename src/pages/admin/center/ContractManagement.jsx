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
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { useGetContractsByStatusQuery, useGetAllContractsQuery } from '@/redux/contract/contractApi';
import { contractStatus, contractType } from '@/config/combobox';
import { ToolbarForContract } from '@/components/datatable/ToolbarForContract';

export function ContractManagement() {
    const navigate = useNavigate();
    const [viewAll, setViewAll] = useState(false);
    const [sorting, setSorting] = useState([
        {
            id: 'startDate',
            desc: false
        }
    ]);

    const { data: pendingContracts, isLoading: isPendingLoading } = useGetContractsByStatusQuery(1);
    const { data: allContracts, isLoading: isAllLoading } = useGetAllContractsQuery();

    const contracts = viewAll ? allContracts : pendingContracts;
    const isLoading = viewAll ? isAllLoading : isPendingLoading;

    const breadcrumbs = [
        { name: 'Trung tâm Quản trị', path: '/center' },
        { name: 'Danh sách hợp đồng', path: null },
    ];

    const columns = [
        {
            accessorKey: 'contractType',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Loại hợp đồng" />,
            cell: ({ row }) => {
                const type = contractType.find(t => t.value === row.getValue('contractType'));
                return <div>{type ? type.label : 'Không xác định'}</div>;
            },
        },
        {
            accessorKey: 'partyBName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Bên B" />,
            cell: ({ row }) => <div>{row.getValue('partyBName')}</div>,
        },
        {
            accessorKey: 'startDate',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Ngày bắt đầu"
                />
            ),
            cell: ({ row }) => <div>{new Date(row.getValue('startDate')).toLocaleDateString('vi-VN')}</div>,
            sortingFn: (rowA, rowB) => {
                const b = new Date(rowA.getValue('startDate')).getTime();
                const a = new Date(rowB.getValue('startDate')).getTime();
                return a < b ? -1 : a > b ? 1 : 0;
            }
        },
        {
            accessorKey: 'endDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày kết thúc" />,
            cell: ({ row }) => <div>{new Date(row.getValue('endDate')).toLocaleDateString('vi-VN')}</div>,
        },
        {
            accessorKey: 'status',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
            cell: ({ row }) => {
                const status = contractStatus.find(s => s.value === row.getValue('status'));
                return <div className={`font-medium ${getStatusColor(status?.value)}`}>{status ? status.label : 'Không xác định'}</div>;
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
                        <DropdownMenuItem onClick={() => navigate(`/center/contracts/${row.original.contractID}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const table = useReactTable({
        data: contracts || [],
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 0: return 'text-purple-400';
            case 1: return 'text-blue-500';
            case 2: return 'text-green-600';
            case 3:
            case 4: return 'text-red-600';
            case 5: return 'text-gray-600';
            default: return 'text-black';
        }
    };

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="w-full space-y-4 mx-3">
                <div className="flex justify-between items-center">
                    <ToolbarForContract table={table} />
                    <Button onClick={() => setViewAll(!viewAll)}>
                        {viewAll ? 'Xem hợp đồng đang chờ' : 'Xem tất cả hợp đồng'}
                    </Button>
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
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