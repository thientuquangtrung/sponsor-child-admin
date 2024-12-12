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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { useGetContractsByStatusQuery, useGetAllContractsQuery } from '@/redux/contract/contractApi';
import { contractStatus, contractType } from '@/config/combobox';
import { ToolbarForContract } from '@/components/datatable/ToolbarForContract';
import { vietnameseFilter } from '@/lib/utils';

export function ContractManagement() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("pending");
    const [sorting, setSorting] = useState([
        {
            id: 'startDate',
            desc: false
        }
    ]);

    const { data: pendingContracts, isLoading: isPendingLoading } = useGetContractsByStatusQuery(1);
    const { data: allContracts, isLoading: isAllLoading } = useGetAllContractsQuery();

    const contracts = activeTab === "all" ? allContracts : pendingContracts;
    const isLoading = activeTab === "all" ? isAllLoading : isPendingLoading;

    const breadcrumbs = [
        { name: 'Trung tâm Quản trị', path: '/center' },
        { name: 'Danh sách hợp đồng', path: null },
    ];

    const columns = [
        {
            accessorKey: 'contractType',
            filterFn: (row, id, filterValue) => {
                return filterValue.includes(row.getValue(id).toString())
            },
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
            filterFn: vietnameseFilter
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
            filterFn: (row, id, filterValue) => {
                return filterValue.includes(row.getValue(id).toString())
            },
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
                <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>

                    <div className="flex items-center gap-4 justify-between">
                        <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-transparent">
                            <TabsTrigger
                                value="pending"
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
                            after:duration-300"
                            >
                                Hợp đồng đang chờ
                            </TabsTrigger>
                            <TabsTrigger
                                value="all"
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
                            after:duration-300"
                            >
                                Tất cả hợp đồng
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="mt-4">
                        <ToolbarForContract table={table} />
                    </div>

                    <TabsContent value="pending">
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
                                    {isPendingLoading ? (
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
                    </TabsContent>

                    <TabsContent value="all">
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
                                    {isAllLoading ? (
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
                    </TabsContent>
                </Tabs>

                <DataTablePagination table={table} />
            </div>
        </>
    );



}

export default ContractManagement;