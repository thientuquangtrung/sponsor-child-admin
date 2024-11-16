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
import { useDeleteUserMutation, useGetUserQuery, useReactivateUserMutation } from '@/redux/user/userApi';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import LoadingScreen from '@/components/common/LoadingScreen';

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
        },
    },
    {
        accessorKey: 'isActive',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => {
            const isActive = row.getValue('isActive');
            return (
                <Badge
                    className={
                        isActive
                            ? 'bg-green-100 text-green-600 hover:bg-normal'
                            : 'bg-red-100 text-red-600 hover:bg-normal'
                    }
                >
                    {isActive ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                </Badge>
            );
        },
        filterFn: (row, id, value) => {
            const isActive = row.getValue(id);
            return value.includes(isActive ? 'Đang hoạt động' : 'Vô hiệu hóa');
        },

        enableSorting: false,
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionMenu row={row} />,
    },
];

const ActionMenu = ({ row }) => {
    const navigate = useNavigate();
    const [deleteReason, setDeleteReason] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
    const [deleteUser] = useDeleteUserMutation();
    const [reactivateUser] = useReactivateUserMutation();
    const isActive = row.original.isActive;

    const handleDelete = async () => {
        if (row.original.role === 'Admin') {
            toast.warning('Không thể vô hiệu hóa tài khoản Admin.');
            setIsDeleteDialogOpen(false);
            return;
        }

        try {
            await deleteUser({ id: row.original.userID, rejectionReason: deleteReason });
            setIsDeleteDialogOpen(false);
            toast.success('Tài khoản đã bị vô hiệu hóa!');
        } catch (error) {
            console.error('Error disabling user:', error);
            toast.error('Vô hiệu hóa tài khoản thất bại!');
        }
    };

    const handleActivate = async () => {
        try {
            await reactivateUser(row.original.userID).unwrap();
            setIsActivateDialogOpen(false);
            toast.success('Tài khoản đã được kích hoạt lại!');
        } catch (error) {
            console.error('Error reactivating user:', error);
            toast.error('Kích hoạt tài khoản thất bại!');
        }
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
                {isActive ? (
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive"
                            >
                                Xóa tài khoản
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Bạn muốn xóa người dùng?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Hành động này sẽ vô hiệu hóa người dùng. Vui lòng cung cấp lý do vô hiệu hóa tài
                                    khoản này.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Textarea
                                className="w-full p-2 border rounded"
                                placeholder="Nhập lý do vô hiệu hóa"
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                            />
                            <AlertDialogFooter>
                                <AlertDialogCancel
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    className="hover:bg-gray-200"
                                >
                                    Trở lại
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-500 text-white hover:bg-red-600"
                                >
                                    Xóa
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <AlertDialog open={isActivateDialogOpen} onOpenChange={setIsActivateDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-teal-500 focus:text-teal-500"
                            >
                                Kích hoạt tài khoản
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Bạn muốn kích hoạt lại tài khoản?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Hành động này sẽ kích hoạt lại tài khoản người dùng.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                    className="hover:bg-gray-200"
                                >
                                    Trở lại
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleActivate}
                                    className="bg-teal-500 text-white hover:bg-teal-600"
                                >
                                    Kích hoạt
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export function UserManagement() {
    const { data: users, isLoading, error, refetch } = useGetUserQuery();
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

    if (isLoading) return <LoadingScreen />;

    if (error) {
        return <div>Error: {error.message}</div>;
    }

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
