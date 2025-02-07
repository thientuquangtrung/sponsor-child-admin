import * as React from 'react';
import { toast } from "sonner";
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import Breadcrumb from '@/pages/admin/Breadcrumb';

import { useGetAllCampaignsQuery, useDeleteCampaignMutation, useFilterAdminCampaignsQuery } from '@/redux/campaign/campaignApi';
import { campaignTypes, campaignStatus, guaranteeTypes } from '@/config/combobox';
import { ToolbarForCampaign } from '@/components/datatable/ToolbarForCampaign';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { vietnameseFilter } from '@/lib/utils';

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
        enableSorting: true,
        enableFiltering: true,
        filterFn: vietnameseFilter
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
    const [deleteCampaign] = useDeleteCampaignMutation();
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
                <DropdownMenuItem onClick={() => navigate(`/campaign/${row.original.campaignID}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export function AdminCampaign() {
    const [isFiltering, setIsFiltering] = React.useState(false);
    const [hasGuaranteeFilter, setHasGuaranteeFilter] = React.useState(null);
    const filterParams = hasGuaranteeFilter !== null ? { hasGuarantee: hasGuaranteeFilter } : {};
    const navigate = useNavigate();
    const {
        data: allCampaigns,
        isLoading: isLoadingAll,
        isError: isErrorAll
    } = useGetAllCampaignsQuery();

    const {
        data: filteredCampaigns,
        isLoading: isLoadingFiltered,
        isError: isErrorFiltered
    } = useFilterAdminCampaignsQuery(filterParams, {
        skip: !isFiltering
    });



    const handleDeleteSuccess = React.useCallback((deletedId) => {
        setLocalData(prev => prev.filter(campaign => campaign.campaignID !== deletedId));
    }, []);
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
    const isLoading = isFiltering ? isLoadingFiltered : isLoadingAll;
    const isError = isFiltering ? isErrorFiltered : isErrorAll;

    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Chiến dịch gây quỹ', path: null },
    ];

    const {
        data: guaranteedCampaigns,
        isLoading: isLoadingGuaranteed,
        isError: isErrorGuaranteed
    } = useFilterAdminCampaignsQuery({ hasGuarantee: true });

    const {
        data: nonGuaranteedCampaigns,
        isLoading: isLoadingNonGuaranteed,
        isError: isErrorNonGuaranteed
    } = useFilterAdminCampaignsQuery({ hasGuarantee: false });
    const createTable = (data) => {
        return useReactTable({
            data: data || [],
            columns: React.useMemo(
                () => columns.map(col =>
                    col.id === 'actions'
                        ? {
                            ...col,
                            cell: ({ row }) => <ActionMenu row={row} onDeleteSuccess={handleDeleteSuccess} />
                        }
                        : col
                ),
                [handleDeleteSuccess]
            ),
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
    };

    const guaranteedTable = createTable(guaranteedCampaigns);
    const nonGuaranteedTable = createTable(nonGuaranteedCampaigns);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (isError) {
        return <div>Error loading campaigns</div>;
    }

    const renderTable = (table) => (
        <>
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
        </>
    );

    return (
        <>
            <div className="grid grid-cols-1 gap-4">
                <Breadcrumb breadcrumbs={breadcrumbs} />
                <div className="flex justify-end  items-center">
                    <Button
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={() => navigate(`/create-campaign`)}
                    >
                        <BadgePlus className="w-4 h-4 mr-2" />
                        Tạo Chiến dịch
                    </Button>
                </div>
                <Tabs defaultValue="guaranteed" className="w-full">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-transparent">
                        <TabsTrigger value="guaranteed" className="relative px-4 py-2 rounded-none transition-colors duration-200
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
                            Có Bảo lãnh
                        </TabsTrigger>
                        <TabsTrigger value="non-guaranteed" className="relative px-4 py-2 rounded-none transition-colors duration-200
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
                            Chưa có Bảo lãnh
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="guaranteed" className="space-y-4">
                        {renderTable(guaranteedTable)}
                    </TabsContent>
                    <TabsContent value="non-guaranteed" className="space-y-4">
                        {renderTable(nonGuaranteedTable)}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

export default AdminCampaign;