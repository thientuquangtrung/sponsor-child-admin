import * as React from 'react';
import {
    flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
    getSortedRowModel, useReactTable,
} from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { fundSourceType } from '@/config/combobox';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal, Search } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTableViewOptions } from '@/components/datatable/DataTableViewOptions';
import { Input } from '@/components/ui/input';
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
        accessorKey: 'sourceName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên nguồn" />,
        cell: ({ row }) => {
            const isAnonymous = row.original.isAnonymous;
            return (
                <div className={`font-medium max-w-[200px] truncate ${isAnonymous ? 'italic text-gray-500' : ''}`}>
                    {row.getValue('sourceName')}
                </div>
            );
        },
    },
    {
        accessorKey: 'fundSourceType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Loại nguồn" />,
        cell: ({ row }) => {
            const sourceType = row.getValue('fundSourceType');
            const source = fundSourceType.find(type => type.value === sourceType);

            const getBadgeStyle = (type) => {
                switch (type) {
                    case 0:
                        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
                    case 1:
                        return 'bg-green-100 text-green-800 hover:bg-green-100';
                    case 2:
                        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
                    default:
                        return '';
                }
            };

            return (
                <Badge className={getBadgeStyle(sourceType)}>
                    {source?.label || 'Không xác định'}
                </Badge>
            );
        },
    },

    {
        accessorKey: 'amountAdded',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số tiền" className="justify-end" />,
        cell: ({ row }) => <div className="font-medium text-right">{row.getValue('amountAdded').toLocaleString('vi-VN')} ₫</div>,
    },
    {
        accessorKey: 'commonFundTotal',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ST quỹ chung" className="justify-end" />,
        cell: ({ row }) => <div className="font-medium text-right">{row.getValue('commonFundTotal').toLocaleString('vi-VN')} ₫</div>,
    },
    {
        accessorKey: 'dateAdded',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày" />,
        cell: ({ row }) => {
            const date = new Date(row.getValue('dateAdded'));
            return <div className="whitespace-nowrap w-32 text-center">{format(date, 'dd/MM/yyyy HH:mm')}</div>;
        },
    },
    {
        accessorKey: 'description',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mô tả" />,
        cell: ({ row }) => <div className="font-medium max-w-[200px] truncate">{row.getValue('description')}</div>,
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
                <DropdownMenuItem onClick={() => navigate(`/fund/source/${row.original.id}`)}>
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
    const [searchTerm, setSearchTerm] = React.useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const isFiltered = selectedDate || formattedAmount || searchTerm ||
        table.getColumn('fundSourceType')?.getFilterValue() !== undefined;

    React.useEffect(() => {
        const filters = {};

        if (debouncedSearchTerm) {
            filters.description = debouncedSearchTerm;
        }

        if (selectedDate) {
            filters.dateAdded = format(selectedDate, 'yyyy-MM-dd');
        }

        if (formattedAmount) {
            filters.amountAdded = parseInt(formattedAmount.replace(/,/g, ''), 10);
        }

        const sourceType = table.getColumn('fundSourceType')?.getFilterValue();
        if (sourceType !== undefined) {
            filters.fundSourceType = sourceType;
        }

        onFilterChange(filters);
    }, [debouncedSearchTerm, selectedDate, formattedAmount, onFilterChange, table]);

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

    const handleSourceTypeChange = (value) => {
        if (value === "all") {
            table.getColumn('fundSourceType')?.setFilterValue(undefined);
        } else {
            const numericValue = parseInt(value, 10);
            table.getColumn('fundSourceType')?.setFilterValue(numericValue);
        }
    };

    const handleResetFilters = () => {
        setSelectedDate(null);
        setSearchTerm('');
        setFormattedAmount('');
        table.resetColumnFilters();
        onFilterChange({});
    };

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex flex-1 flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Input
                    placeholder="Tìm theo mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                <Select
                    onValueChange={handleSourceTypeChange}
                    value={table.getColumn('fundSourceType')?.getFilterValue()?.toString() ?? "all"}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Loại nguồn" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {fundSourceType.map((type) => (
                            <SelectItem key={type.value} value={type.value.toString()}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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

const FundSourceTable = ({ data, onFilterChange }) => {
    const [sorting, setSorting] = React.useState([{ id: 'dateAdded', desc: true }]);
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
            if (filter.id === 'description') {
                result = result.filter(row =>
                    row.description.toLowerCase().includes(filter.value.toLowerCase())
                );
            }
            if (filter.id === 'dateAdded') {
                result = result.filter(row =>
                    row.dateAdded.startsWith(filter.value)
                );
            }
            if (filter.id === 'amountAdded') {
                result = result.filter(row =>
                    row.amountAdded === filter.value
                );
            }
            if (filter.id === 'fundSourceType') {
                result = result.filter(row =>
                    row.fundSourceType === filter.value
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
                                    <TableHead key={header.id} className="h-10  text-slate-600">
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

export default FundSourceTable;