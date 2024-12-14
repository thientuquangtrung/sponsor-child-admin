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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, MoreHorizontal, Search } from 'lucide-react';
import { DataTableViewOptions } from '@/components/datatable/DataTableViewOptions';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { formatNumber } from '@/lib/utils';
import useDebounce from '@/hooks/useDebounce';
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
    },
    {
        accessorKey: 'campaignTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên chiến dịch" />,
        cell: ({ row }) => <div className="font-medium max-w-[400px] truncate">{row.getValue('campaignTitle')}</div>,
    },
    {
        accessorKey: 'visitTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên chuyến thăm" />,
        cell: ({ row }) => <div className="font-medium max-w-[400px] truncate">{row.getValue('visitTitle')}</div>,
    },
    {
        accessorKey: 'amountUsed',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số tiền" className="justify-end" />,
        cell: ({ row }) => <div className="text-right font-medium">{row.getValue('amountUsed').toLocaleString('vi-VN')} ₫</div>,
    },
    {
        accessorKey: 'commonFundTotal',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ST Quỹ chung" className="justify-end" />,
        cell: ({ row }) => <div className="text-right font-medium">{row.getValue('commonFundTotal').toLocaleString('vi-VN')} ₫</div>,
    },
    {
        accessorKey: 'dateUsed',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue('dateUsed'));
            return <div className="whitespace-nowrap w-32 text-center">{format(date, 'dd/MM/yyyy HH:mm')}</div>;
        },
    },
    {
        accessorKey: 'purpose',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mục đích" />,
        cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('purpose')}</div>,
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
    const [selectedDate, setSelectedDate] = React.useState(null);
    const [formattedAmount, setFormattedAmount] = React.useState('');
    const [purposeSearch, setPurposeSearch] = React.useState('');
    const isFiltered = selectedDate || formattedAmount || purposeSearch;
    const debouncedPurposeSearch = useDebounce(purposeSearch, 500);
    React.useEffect(() => {
        const filters = {};

        if (debouncedPurposeSearch) {
            filters.purpose = debouncedPurposeSearch;
        }

        if (selectedDate) {
            filters.dateUsed = format(selectedDate, 'yyyy-MM-dd');
        }

        if (formattedAmount) {
            filters.amountUsed = parseInt(formattedAmount.replace(/,/g, ''), 10);
        }

        onFilterChange(filters);
    }, [debouncedPurposeSearch, selectedDate, formattedAmount, onFilterChange]);

    const handlePurposeInputChange = (e) => {
        setPurposeSearch(e.target.value);
    };
    const unformatNumber = (value) => value.replace(/,/g, '');
    const handleAmountChange = (e) => {
        const value = unformatNumber(e.target.value);
        if (value === '' || /^\d+$/.test(value)) {
            setFormattedAmount(formatNumber(value));
        }
    };
    const handleDateChange = (value) => {
        setSelectedDate(value);
    };
    const handleResetFilters = () => {
        setSelectedDate(null);
        setPurposeSearch('');
        setFormattedAmount('');
        onFilterChange({});
        table.resetColumnFilters();
    };

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex flex-1 flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Input
                    placeholder="Tìm theo mục đích..."
                    value={purposeSearch}
                    onChange={handlePurposeInputChange}
                    className="max-w-sm"
                    endIcon={<Search className="h-4 w-4" />}
                />
                <Input
                    placeholder="Lọc theo số tiền..."
                    value={formattedAmount}
                    onChange={handleAmountChange}
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
    const [sorting, setSorting] = React.useState([{ id: 'dateUsed', desc: true }]);
    const [rowSelection, setRowSelection] = React.useState({});
    const [filteredData, setFilteredData] = React.useState(data);
    const table = useReactTable({
        data: filteredData || [],
        columns,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            rowSelection,
        },
    });
    React.useEffect(() => {
        let result = [...data];
        const currentFilters = table.getState().columnFilters;

        currentFilters.forEach(filter => {
            if (filter.id === 'purpose') {
                result = result.filter(row =>
                    row.purpose.toLowerCase().includes(filter.value.toLowerCase())
                );
            }
            if (filter.id === 'dateUsed') {
                result = result.filter(row =>
                    row.dateUsed.startsWith(filter.value)
                );
            }
            if (filter.id === 'amountUsed') {
                result = result.filter(row =>
                    row.amountUsed === filter.value
                );
            }
        });

        setFilteredData(result);
    }, [data, table?.getState().columnFilters]);
    return (
        <div className="space-y-4">
            <Toolbar table={table} onFilterChange={onFilterChange} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-slate-50 hover:bg-slate-50">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-10 text-slate-600">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="hover:bg-slate-50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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