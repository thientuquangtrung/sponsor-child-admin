import * as React from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';

import { MoreHorizontal, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import { DataTableToolbarAdmin } from '@/components/datatable/DataTableToolbarAdmin';
import Breadcrumb from '@/pages/admin/Breadcrumb';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const data = [
    {
        id: 'ct001',
        name: 'Chiến dịch A',
        status: 'Đang hoạt động',
        join: 5,
        budget: 200,
        startDate: new Date(2024, 5, 1).toISOString(),
        endDate: new Date(2025, 7, 31).toISOString(),
        guaranteeId: 'Nguyễn A',
        targetAmount: 5000,
        raisedAmount: 1500,
        thumbnailUrl: 'https://image.nhandan.vn/w800/Uploaded/2024/vowsxrdrei/2023_12_25/z5008015677689-d8950e8f203de9ef9dab802edd72b70b-1-3956.jpg.webp',
    },
    {
        id: 'ct002',
        name: 'Chiến dịch B',
        status: 'Lên kế hoạch',
        join: 75,
        budget: 30,
        startDate: new Date(2024, 8, 1).toISOString(),
        endDate: new Date(2024, 8, 30).toISOString(),
        guaranteeId: null,
        targetAmount: 3000,
        raisedAmount: 0,
        thumbnailUrl: 'https://image.nhandan.vn/w800/Uploaded/2024/vowsxrdrei/2023_12_25/z5008015677689-d8950e8f203de9ef9dab802edd72b70b-1-3956.jpg.webp',
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
        accessorKey: 'thumbnailUrl',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ảnh " />,
        cell: ({ row }) => (
            <img src={row.getValue('thumbnailUrl')} alt="Thumbnail" className="w-16 h-16 object-cover" />
        ),
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên quỹ" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => (
            <Badge variant={row.getValue('status') === 'Đang hoạt động' ? 'default' : 'secondary'}>
                {row.getValue('status')}
            </Badge>
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'join',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người tham gia" className="justify-end" />,
        cell: ({ row }) => <div className="text-right">{row.getValue('join').toLocaleString('vi-VN')}</div>,
    },
    {
        accessorKey: 'budget',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngân sách" className="justify-end" />,
        cell: ({ row }) => (
            <div className="text-right font-medium">
                {row.getValue('budget').toLocaleString('vi-VN')} ₫
            </div>
        ),
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
        accessorKey: 'targetAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số tiền mục tiêu" />,
        cell: ({ row }) => <div>{row.getValue('targetAmount').toLocaleString('vi-VN')} ₫</div>,
    },
    {
        accessorKey: 'raisedAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số tiền quyên góp" />,
        cell: ({ row }) => <div>{row.getValue('raisedAmount').toLocaleString('vi-VN')} ₫</div>,
    },
    {
        accessorKey: 'guaranteeId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người bảo lãnh" />,
        cell: ({ row }) => (
            row.getValue('status') === 'Đang hoạt động' || row.getValue('status') === 'Dã kết thúc'
                ? <div>{row.getValue('guaranteeId') || 'Chưa có'}</div>
                : <div>Chưa có</div>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionMenu row={row} />,
    },
];

const ActionMenu = ({ row }) => {
    const handleDelete = () => {
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
                <DropdownMenuItem>Cập nhật chiến dịch</DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                            Xóa chiến dịch
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Chiến dịch sẽ bị xóa vĩnh viễn.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Tiếp tục xóa</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export function AdminFundrasing() {
    const navigate = useNavigate();
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

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
        <>      <Breadcrumb pageName="Chiến dịch gây quỹ" />

            <div className="w-full space-y-4 mx-3">

                <DataTableToolbarAdmin table={table} type="Fundraising" />
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

export default AdminFundrasing;