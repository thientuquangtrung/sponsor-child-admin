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

import { useGetAllCampaignsQuery } from '@/redux/campaign/campaignApi';
import { campaignTypes, campaignStatus, guaranteeTypes } from '@/config/combobox';
import { ToolbarForCampaign } from '@/components/datatable/ToolbarForCampaign';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useNavigate } from 'react-router-dom';

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
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên quỹ" />,
        cell: ({ row }) => {
            const campaignType = row.original.campaignType;
            const typeInfo = campaignTypes.find(type => type.value === campaignType);

            return (
                <div
                    className={`font-semibold text-ellipsis whitespace-nowrap overflow-hidden w-48 
                        ${campaignType === 0 ? 'text-green-600' : 'text-red-400'}`}
                    title={`Loại: ${typeInfo?.label || 'Không xác định'}`}
                >
                    {row.getValue('title')}
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => {
            const status = row.getValue('status');
            const statusText = campaignStatus.find(s => s.value === status)?.label || 'Không xác định';
            let statusColor;
            switch (status) {
                case 0:
                    statusColor = 'text-blue-500';
                    break;
                case 1:
                    statusColor = 'text-blue-700';
                    break;
                case 2:
                    statusColor = 'text-orange-500';
                    break;
                case 3:
                    statusColor = 'text-red-500';
                    break;
                case 4:
                    statusColor = 'text-green-500';
                    break;
                case 5:
                    statusColor = 'text-purple-500';
                    break;
                case 6:
                    statusColor = 'text-yellow-500';
                    break;
                default:
                    statusColor = 'text-gray-500';
            }
            return (
                <div className={`font-medium ${statusColor}`}>
                    {statusText}
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: 'targetAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mục tiêu" className="justify-end" />,
        cell: ({ row }) => <div className="text-right">{row.getValue('targetAmount').toLocaleString('vi-VN')} ₫</div>,
    },
    {
        accessorKey: 'raisedAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Đã quyên góp" className="justify-end" />,
        cell: ({ row }) => (
            <div className="text-right font-medium">
                {row.getValue('raisedAmount').toLocaleString('vi-VN')} ₫
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
        accessorKey: 'guaranteeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên bảo lãnh" />,
        cell: ({ row }) => {
            const guaranteeType = row.original.guaranteeType;
            const typeInfo = guaranteeTypes.find(type => type.value === guaranteeType);

            return (
                <div
                    className={`font-medium ${guaranteeType === 0 ? 'text-green-600' : 'text-purple-500'}`}
                    title={`Loại: ${typeInfo?.label || 'Không xác định'}`}
                >
                    {row.getValue('guaranteeName') || 'Chưa có'}
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
                <DropdownMenuItem onClick={() => navigate(`/cm-campaign/${row.original.campaignID}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                </DropdownMenuItem>                <DropdownMenuSeparator />

            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export function CampaignChildrenManager() {
    const { data: campaigns, isLoading, isError } = useGetAllCampaignsQuery();
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
    const navigate = useNavigate();


    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Danh sách chiến dịch', path: null },
    ];

    const table = useReactTable({
        data: campaigns || [],
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

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (isError) {
        return <div>Error loading campaigns</div>;
    }

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <div className="w-full space-y-4 mx-3">
                <div className="flex justify-end items-center mb-6">
                    <Button
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => navigate(`/create-campaign`)}
                    >
                        <BadgePlus className="w-4 h-4 mr-2" />
                        Tạo Chiến dịch
                    </Button>
                </div>
                <ToolbarForCampaign table={table} />
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

export default CampaignChildrenManager;