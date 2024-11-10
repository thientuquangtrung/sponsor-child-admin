import * as React from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Eye, MoreHorizontal, Plus } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/datatable/DataTablePagination';
import { DataTableColumnHeader } from '@/components/datatable/DataTableColumnHeader';
import { DataTableToolbarAdmin } from '@/components/datatable/DataTableToolbarAdmin';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { useGetUserQuery } from '@/redux/user/userApi';
import { useNavigate } from 'react-router-dom';

const roleColors = {
    Guarantee: 'bg-rose-100 text-rose-400',
    Donor: 'bg-sky-200 text-sky-600',
    'Children Manager': 'bg-amber-100 text-yellow-700',
    Admin: 'bg-emerald-100 text-emerald-600',
};

const getRoleDisplay = (role) => {
    const formattedRole = role === 'ChildManager' ? 'Children Manager' : role;
    return {
        displayRole: formattedRole,
        colorClass: roleColors[formattedRole] || 'bg-gray-200',
    };
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
        accessorKey: 'fullname',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tên người dùng" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue('fullname')}</div>,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => <div>{row.getValue('email')}</div>,
    },
    {
        accessorKey: 'phone',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Số điện thoại" />,
        cell: ({ row }) => <div>{row.getValue('phone')}</div>,
    },
    {
        accessorKey: 'address',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Địa chỉ" />,
        cell: ({ row }) => <div>{row.getValue('address')}</div>,
    },
    {
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Vai trò" />,
        cell: ({ row }) => {
            const { displayRole, colorClass } = getRoleDisplay(row.getValue('role'));
            return <Badge className={colorClass}>{displayRole}</Badge>;
        },
        filterFn: (row, id, value) => {
            const role = getRoleDisplay(row.getValue(id)).displayRole; 
            return value.includes(role);
        }
    },

    {
        id: 'actions',
        cell: ({ row }) => <ActionMenu row={row} />,
    },
];

const ActionMenu = ({ row }) => {
    const navigate = useNavigate();
    const handleDelete = (e) => {
        console.log(row);
    };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-normal">
                    <span className="sr-only">Mở menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/users/${row.original.userID}`)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive"
                            >
                                Delete asset
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your asset.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export function UserManagement() {
    const { data: users, isLoading, error } = useGetUserQuery();
    const [sorting, setSorting] = React.useState([]);
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Người dùng', path: null },
    ];

    const table = useReactTable({
        data: users || [],
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
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="w-full space-y-4 mx-3">
                <DataTableToolbarAdmin table={table} type="Users" />
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
        </>
    );
}

export default UserManagement;
