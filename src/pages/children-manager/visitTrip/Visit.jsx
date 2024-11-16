import * as React from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { BadgePlus, Eye, MoreHorizontal } from 'lucide-react';
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
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useNavigate } from 'react-router-dom';
import { useGetAllChildrenVisitTripsQuery } from '@/redux/childrenVisitTrips/childrenVisitTripsApi';
import { visitStatus } from '@/config/combobox';

const statusColors = {
    0: 'text-blue-400',
    1: 'text-green-500',
    2: 'text-yellow-500',
    3: 'text-orange-500',
    4: 'text-green-500',
    5: 'text-red-500',
    6: 'text-purple-500'
};

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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ảnh" />,
        cell: ({ row }) => (
            <img src={row.getValue('thumbnailUrl')} alt="Thumbnail" className="w-16 h-16 object-cover rounded-md" />
        ),
    },
    {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên chuyến thăm" />,
        cell: ({ row }) => (
            <div className="font-semibold text-ellipsis whitespace-nowrap overflow-hidden w-48">
                {row.getValue('title')}
            </div>
        ),
    },

    {
        accessorKey: 'province',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Địa điểm" />,
        cell: ({ row }) => <div>{row.getValue('province')}</div>,
    },
    {
        accessorKey: 'visitCost',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Chi phí dư kiến" className="justify-end" />,
        cell: ({ row }) => <div className="text-right">{row.getValue('visitCost').toLocaleString('vi-VN')} ₫</div>,
    },
    {
        accessorKey: 'participantsCount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số người tham gia" className="text-center" />,
        cell: ({ row }) => (
            <div className="text-center">
                {row.getValue('participantsCount')}/{row.original.maxParticipants}
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
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => {
            const status = row.getValue('status');
            const statusInfo = visitStatus.find(s => s.value === status);
            return (
                <div className={`font-medium ${statusColors[status] || 'text-gray-500'}`}>
                    {statusInfo?.label || 'Không xác định'}
                </div>
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
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Mở menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate(`/visit/${row.original.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuSeparator />

            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export function Visit() {
    const navigate = useNavigate();
    const { data: visitTrips, isLoading, isError } = useGetAllChildrenVisitTripsQuery();
    const [sorting, setSorting] = React.useState([{ id: 'startDate', desc: true }]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data: visitTrips || [],
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

    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Chuyến thăm', path: null },
    ];

    if (isLoading) return <LoadingScreen />;
    if (isError) return <div>Đã xảy ra lỗi</div>;

    return (
        <div className="grid grid-cols-1 gap-4">
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <div className="flex justify-end items-center">
                <Button
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => navigate('/visit/create-visit-trip')}
                >
                    <BadgePlus className="w-4 h-4 mr-2" />
                    Tạo chuyến thăm
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
}

export default Visit;