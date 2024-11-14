import * as React from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, MoreHorizontal, Search } from 'lucide-react';
import { DataTableViewOptions } from '@/components/datatable/DataTableViewOptions';
import { DatePicker } from '@/components/ui/date-picker';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatNumber } from '@/lib/utils';

const columns = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Chọn tất cả"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Chọn hàng"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'campaignTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên chiến dịch" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('campaignTitle')}</div>,
    },
    {
        accessorKey: 'amountUsed',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số tiền sử dụng" className="justify-end" />,
        cell: ({ row }) => (
            <div className="text-right">{row.getValue('amountUsed').toLocaleString('vi-VN')} ₫</div>
        ),
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true;
            const rowValue = row.getValue(columnId);
            const filterNumber = parseInt(filterValue, 10);
            return rowValue === filterNumber;
        }
    },
    {
        accessorKey: 'dateUsed',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày sử dụng" />,
        cell: ({ row }) => {
            const date = parseISO(row.getValue('dateUsed'));
            return (
                <div>{format(date, 'dd/MM/yyyy', { locale: vi })}</div>
            );
        },
        sortingFn: (rowA, rowB) => {
            const dateA = new Date(rowA.getValue('dateUsed'));
            const dateB = new Date(rowB.getValue('dateUsed'));
            return dateB.getTime() - dateA.getTime();
        },
    },
    {
        accessorKey: 'purpose',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mục đích" />,
        cell: ({ row }) => (
            <div className="max-w-[300px] truncate">{row.getValue('purpose')}</div>
        ),
        filterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true;
            const rowValue = row.getValue(columnId)?.toString().toLowerCase() || '';
            const searchValue = filterValue.toLowerCase();
            return rowValue.includes(searchValue);
        }
    },
    {
        accessorKey: 'adminName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người duyệt" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('adminName')}</div>,
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
                <DropdownMenuItem onClick={() => navigate(`/fund/usage/${row.original.id}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const Toolbar = ({ table, onFilterChange }) => {
    const isFiltered = table.getState().columnFilters.length > 0;
    const [selectedDate, setSelectedDate] = React.useState(null);
    const [formattedAmount, setFormattedAmount] = React.useState('');



    const unformatNumber = (value) => {
        if (!value) return '';
        return value.replace(/,/g, '');
    };
    const handlePurposeChange = React.useCallback((value) => {
        table.getColumn('purpose')?.setFilterValue(value);
        onFilterChange({
            purpose: value || undefined
        });
    }, [table, onFilterChange]);

    const handleAmountChange = React.useCallback((e) => {
        const value = unformatNumber(e.target.value);
        if (value === '' || /^\d+$/.test(value)) {
            setFormattedAmount(formatNumber(value));
            const numericValue = value ? parseInt(value, 10) : undefined;
            table.getColumn('amountUsed')?.setFilterValue(numericValue);
            onFilterChange({
                amountUsed: numericValue
            });
        }
    }, [table, onFilterChange]);
    const handleDateChange = (value) => {
        setSelectedDate(value);
        if (value) {
            const localDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
            const formattedDate = format(localDate, 'yyyy-MM-dd');
            table.getColumn('dateUsed')?.setFilterValue(formattedDate);
            onFilterChange({
                dateUsed: formattedDate
            });
        } else {
            table.getColumn('dateUsed')?.setFilterValue(undefined);
            onFilterChange({
                dateUsed: undefined
            });
        }
    };

    const handleResetFilters = () => {
        setSelectedDate(null);
        table.resetColumnFilters();
        onFilterChange({});
    };

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex flex-1 flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Input
                    placeholder="Tìm theo mục đích..."
                    value={table.getColumn('purpose')?.getFilterValue() ?? ''}
                    onChange={(e) => handlePurposeChange(e.target.value)}
                    className="max-w-sm"
                    endIcon={<Search className="h-4 w-4" />}
                />
                <Input
                    placeholder="Lọc theo số tiền..."
                    value={formattedAmount}
                    onChange={(e) => handleAmountChange(e)}
                    className="max-w-[200px]"
                />
                <DatePicker
                    date={selectedDate}
                    onDateSelect={handleDateChange}
                    className="max-w-[200px]"
                />
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={handleResetFilters}
                        className="h-8 px-2 lg:px-3"
                    >
                        Đặt lại
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    );
};

const FundUsageTable = ({ data, onFilterChange }) => {
    const [sorting, setSorting] = React.useState([
        { id: 'dateUsed', desc: false }
    ]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data: data || [],
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
        <div className="space-y-4">
            <Toolbar table={table} onFilterChange={onFilterChange} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-slate-50 hover:bg-slate-50">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-10 px-2 text-slate-600">
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
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="hover:bg-slate-50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-2 py-2">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
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

export default FundUsageTable;