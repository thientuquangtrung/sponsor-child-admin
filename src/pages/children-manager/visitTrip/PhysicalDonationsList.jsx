import * as React from 'react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import { format } from 'date-fns';
import { ToolbarForPhysicalDonationsList } from '@/components/datatable/ToolbarForPhysicalDonationsList';
import { giftDeliveryMethod, giftStatus, giftType } from '@/config/combobox';
import { useNavigate } from 'react-router-dom';
import { vietnameseFilter } from '@/lib/utils';

const getMethodDisplay = (method) => {
    const methodItem = giftDeliveryMethod.find(item => item.value === method);
    return {
        displayMethod: methodItem?.label || 'Unknown',
        colorClass: 'bg-blue-100 text-blue-600',
    };
};

const getStatusDisplay = (status) => {
    const statusItem = giftStatus.find(item => item.value === status);
    const colorClasses = {
        0: 'bg-gray-100 text-gray-600',
        1: 'bg-yellow-100 text-yellow-600',
        2: 'bg-green-100 text-green-600',
        3: 'bg-red-100 text-red-600',
        4: 'bg-purple-100 text-purple-600',
        5: 'bg-orange-100 text-orange-600',
    };
    return {
        displayStatus: statusItem?.label || 'Unknown',
        colorClass: colorClasses[status],
    };
};

const getGiftTypeDisplay = (type) => {
    const typeItem = giftType.find(item => item.value === type);
    return typeItem?.label || type;
};

const ActionMenu = ({ row }) => {
    const navigate = useNavigate();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-normal">
                    <span className="sr-only">Mở menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/physical-donation/${row.original.id}`)}>
                    Xem chi tiết
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const columns = [
    {
        accessorKey: 'userName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người quyên góp" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('userName')}</div>,
        filterFn: vietnameseFilter
    },
    {
        accessorKey: 'visitTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Chuyến thăm" />,
        cell: ({ row }) => <div className='max-w-[200px] truncate'>{row.getValue('visitTitle')}</div>,
    },
    {
        accessorKey: 'giftType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại quà tặng" />,
        cell: ({ row }) => <div>{getGiftTypeDisplay(row.getValue('giftType'))}</div>,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id).toString());
        },
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số lượng" />,
        cell: ({ row }) => <div>{`${row.getValue('amount')} ${row.original.unit}`}</div>,
    },
    {
        accessorKey: 'giftDeliveryMethod',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phương thức giao" />,
        cell: ({ row }) => {
            const { displayMethod, colorClass } = getMethodDisplay(row.getValue('giftDeliveryMethod'));
            return <Badge className={colorClass}>{displayMethod}</Badge>;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id).toString());
        },
    },
    {
        accessorKey: 'giftStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => {
            const { displayStatus, colorClass } = getStatusDisplay(row.getValue('giftStatus'));
            return <Badge className={colorClass}>{displayStatus}</Badge>;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id).toString());
        },
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
        cell: ({ row }) => (
            <div>{format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy HH:mm')}</div>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionMenu row={row} />,
    },
];

export const PhysicalDonationsList = ({ donations }) => {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data: donations || [],
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
        <div className="w-full space-y-4">

            <ToolbarForPhysicalDonationsList table={table} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-gradient-to-l from-rose-100 to-teal-100 hover:bg-normal">
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
    );
};

export default PhysicalDonationsList;