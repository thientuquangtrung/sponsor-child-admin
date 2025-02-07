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
import { ToolbarForParticipantsList } from '@/components/datatable/ToolbarForParticipantsList';
import { visitRegistrationStatus } from '@/config/combobox';
import { useNavigate } from 'react-router-dom';
import { vietnameseFilter } from '@/lib/utils';

const statusColors = {
    0: 'bg-blue-100 text-blue-600',
    1: 'bg-green-100 text-green-600',
    2: 'bg-yellow-100 text-yellow-600',
    3: 'bg-red-100 text-red-600',
    5: 'bg-orange-100 text-orange-600',
};

const getStatusDisplay = (status) => {
    const statusItem = visitRegistrationStatus.find(item => item.value === status);
    return {
        displayStatus: statusItem?.label || 'Chưa rõ',
        colorClass: statusColors[status],
    };
};

const ActionMenu = ({ row }) => {
    const navigate = useNavigate();

    const handleRefund = async () => {
        navigate(`/visit-refund/${row.original.userID}/${row.original.visitID}`);
    };
    const handleViewTransferProof = async () => {
        navigate(`/transfer-proof/${row.original.id}`);
    };
    if (row.original.status === 2 || row.original.status === 5 ||
        (row.original.status === 3 && row.original.transferProofImageUrl)) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-normal">
                        <span className="sr-only">Mở menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {row.original.status === 2 && (
                        <DropdownMenuItem onClick={handleRefund}>
                            Hoàn tiền
                        </DropdownMenuItem>
                    )}
                    {row.original.status === 5 && (
                        <DropdownMenuItem onClick={handleViewTransferProof}>
                            Xem minh chứng
                        </DropdownMenuItem>
                    )}
                    {row.original.status === 3 && row.original.transferProofImageUrl && (
                        <DropdownMenuItem onClick={handleViewTransferProof}>
                            Xem minh chứng
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return null;
};


const columns = [
    {
        accessorKey: 'userName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên người dùng" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('userName')}</div>,
        filterFn: vietnameseFilter
    },
    {
        accessorKey: 'phoneNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số điện thoại" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('phoneNumber')}</div>,
    },
    {
        accessorKey: 'visitTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên chuyến thăm" />,
        cell: ({ row }) => <div className='max-w-[200px] truncate'>{row.getValue('visitTitle')}</div>,
    },
    {
        id: 'cost',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Chi phí" />,
        cell: ({ table }) => (
            <div className="font-medium">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(table.options.meta?.cost || 0)}
            </div>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày đăng ký" />,
        cell: ({ row }) => (
            <div>{format(new Date(row.getValue('createdAt')), 'dd/MM/yyyy HH:mm')}</div>
        ),
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => {
            const { displayStatus, colorClass } = getStatusDisplay(row.getValue('status'));
            return <Badge className={colorClass}>{displayStatus}</Badge>;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id).toString());
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionMenu row={row} />,
    },
];

export const ParticipantsList = ({ registrations, cost }) => {
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data: registrations || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        meta: {
            cost,
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });



    return (
        <div className="w-full space-y-4">

            <ToolbarForParticipantsList table={table} />
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

export default ParticipantsList;