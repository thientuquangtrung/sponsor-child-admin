import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import { useGetAllDisbursementRequestQuery } from '@/redux/guarantee/disbursementRequestApi';
import { Eye, MoreHorizontal } from 'lucide-react';

const getRequestStatusVariant = (status) => {
    switch (status) {
        case 0:
            return 'bg-yellow-500 text-yellow-100 hover:bg-normal';
        case 1:
            return 'bg-teal-500 text-white hover:bg-normal';
        case 2:
            return 'bg-secondary text-white hover:bg-normal';
        default:
            return 'bg-gray-200 text-gray-800 hover:bg-normal';
    }
};

const getRequestStatusLabel = (status) => {
    switch (status) {
        case 0:
            return 'Gửi yêu cầu';
        case 1:
            return 'Đã phê duyệt';
        case 2:
            return 'Đã từ chối';
        default:
            return 'Không xác định';
    }
};

export function DisbursementRequests() {
    const { data: disbursementRequests = [], isLoading, error } = useGetAllDisbursementRequestQuery();
    const [sorting, setSorting] = React.useState([{ id: 'requestDate', desc: true }]);

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
            accessorFn: (row) => row.campaign?.guaranteeName,
            id: 'guaranteeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên nhà bảo lãnh" />,
            cell: ({ row }) => <div>{row.getValue('guaranteeName')}</div>,
        },
        {
            accessorKey: 'bankAccountName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="TK ngân hàng" />,
            cell: ({ row }) => <div className="font-medium">{row.getValue('bankAccountName')}</div>,
        },
        {
            accessorKey: 'bankAccountNumber',
            header: ({ column }) => <DataTableColumnHeader column={column} title="STK ngân hàng" />,
            cell: ({ row }) => <div>{row.getValue('bankAccountNumber')}</div>,
        },
        {
            accessorKey: 'requestDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày yêu cầu" />,
            cell: ({ row }) => <div>{new Date(row.getValue('requestDate')).toLocaleDateString('vi-VN')}</div>,
        },
        {
            accessorFn: (row) => row.disbursementStage?.scheduledDate,
            id: 'customScheduledDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày dự kiến" />,
            cell: ({ row }) => {
                const date = row.getValue('customScheduledDate');
                return date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A';
            },
        },

        {
            accessorKey: 'bankName',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tên ngân hàng" />,
            cell: ({ row }) => <div>{row.getValue('bankName')}</div>,
        },
        {
            accessorKey: 'requestStatus',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
            cell: ({ row }) => {
                const statusValue = row.getValue('requestStatus');
                return (
                    <Badge className={getRequestStatusVariant(statusValue)}>{getRequestStatusLabel(statusValue)}</Badge>
                );
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

    const table = useReactTable({
        data: disbursementRequests,
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">Đã có lỗi khi tải dữ liệu</div>;
    }

    return (
        <div className="w-full space-y-4">
            <h1 className="text-4xl text-center font-bold py-8 bg-gradient-to-b from-teal-500 to-rose-300 text-transparent bg-clip-text">
                Danh sách yêu cầu giải ngân
            </h1>

            <div className="overflow-x-auto rounded-md border">
                <Table className="min-w-full">
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
                                <TableRow key={row.id} className="hover:cursor-pointer">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center italic">
                                    Không có yêu cầu giải ngân nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table} />
        </div>
    );
}

export default DisbursementRequests;
