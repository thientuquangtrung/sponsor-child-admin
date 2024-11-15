import React from 'react';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Eye, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { transactionType, transactionStatus } from '@/config/combobox';
import { useGetTransactionQuery } from '@/redux/transaction/transactionApi';
import ToolbarForTransaction from '@/components/datatable/ToolbarForTransaction';

// Helper functions to get the label based on value
const getTransactionTypeLabel = (value) => {
    const type = transactionType.find((t) => t.value === value);
    return type ? type.label : 'Unknown';
};

const getTransactionStatusLabel = (value) => {
    const status = transactionStatus.find((s) => s.value === value);
    return status ? status.label : 'Unknown';
};

const columns = [
    {
        accessorKey: 'transactionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên giao dịch" />,
        cell: ({ row }) => <div>{row.getValue('transactionName')}</div>,
    },
    {
        accessorKey: 'transactionDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày giao dịch" />,
        cell: ({ row }) => <div>{new Date(row.getValue('transactionDate')).toLocaleDateString('vi-VN')}</div>,
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số tiền" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('amount').toLocaleString('vi-VN')}</div>,
    },
    {
        accessorKey: 'type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại giao dịch" />,
        cell: ({ row }) => {
            const typeValue = row.getValue('type');
            const label = getTransactionTypeLabel(typeValue);
            let bgColor = '';

            switch (typeValue) {
                case 0: // Thu tiền
                    bgColor = 'bg-yellow-500';
                    break;
                case 1: // Chi tiền
                    bgColor = 'bg-green-500';
                    break;
                case 2: // Hoàn tiền
                    bgColor = 'bg-sky-500';
                    break;
                default:
                    bgColor = 'bg-gray-500';
                    break;
            }

            return <Badge className={`${bgColor} text-white`}>{label}</Badge>;
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => {
            const statusValue = row.getValue('status');
            const label = getTransactionStatusLabel(statusValue);
            let bgColor = '';

            // Apply background color based on status
            switch (statusValue) {
                case 0: // Đang chờ
                    bgColor = 'bg-yellow-500';
                    break;
                case 1: // Thành công
                    bgColor = 'bg-teal-500';
                    break;
                case 2: // Thất bại
                    bgColor = 'bg-red-500';
                    break;
                case 3: // Đã hủy
                    bgColor = 'bg-gray-500';
                    break;
                default:
                    bgColor = 'bg-gray-500';
                    break;
            }

            return <Badge className={`${bgColor} text-white`}>{label}</Badge>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionMenu row={row} />,
    },
];

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
                <DropdownMenuItem onClick={() => navigate(`/disbursement-requests/${row.original.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export function FinanceTransaction() {
    const navigate = useNavigate();
    const { data: transactionData = [], isLoading } = useGetTransactionQuery();
    const [sorting, setSorting] = React.useState([{ id: 'transactionDate', desc: true }]); // Sắp xếp giảm dần theo ngày
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Giao dịch', path: null },
    ];

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

    if (isLoading) return <div>Loading...</div>;

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <div className="w-full space-y-4">
                <div className="flex justify-end">
                    <Button
                        className="mr-2 mt-3 border-2 border-[#25a5a7] bg-transparent text-[#25a5a7] hover:bg-[#25a5a7] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                        onClick={() => navigate('/admin/finance/export-transaction')}
                    >
                        Export Transaction
                    </Button>
                </div>
                <ToolbarForTransaction table={table} />
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-gradient-to-r from-rose-200 to-primary">
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

export default FinanceTransaction;
