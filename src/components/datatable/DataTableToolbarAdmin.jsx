import { Cross2Icon } from '@radix-ui/react-icons';
import SearchIcon from '@/assets/icons/SearchIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from '@/components/datatable/DataTableViewOptions';
import { DataTableFacetedFilter } from '@/components/datatable/DataTableFacetedFilter';

export function DataTableToolbarAdmin({
    table,
    type,
    userFilters = [
        {
            name: 'role',
            options: [
                { value: 'Donor', label: 'Donor' },
                { value: 'Guarantee', label: 'Guarantee' },
                { value: 'Children Manager', label: 'Children Manager' },
                { value: 'Admin', label: 'Admin' },
            ],
        },
        {
            name: 'isActive',
            options: [
                { value: 'Đang hoạt động', label: 'Đang hoạt động' },
                { value: 'Vô hiệu hóa', label: 'Vô hiệu hóa' },
            ],
        },
    ],
}) {
    const isFiltered = table.getState().columnFilters.length > 0;

    const filters = type === 'Fundraising' ? fundraisingFilters : userFilters;

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex flex-1 flex-col sm:flex-row gap-y-4 items-center space-x-2 w-full">
                <Input
                    placeholder={type === 'Fundraising' ? 'Tìm kiếm...' : 'Tìm kiếm tên...'}
                    value={table.getColumn(type === 'Fundraising' ? 'name' : 'fullname')?.getFilterValue() ?? ''}
                    onChange={(event) =>
                        table
                            .getColumn(type === 'Fundraising' ? 'name' : 'fullname')
                            ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                    endIcon={<SearchIcon />}
                />

                <div className="flex space-x-2 w-full overflow-auto no-scrollbar">
                    {filters.map((f, i) => (
                        <DataTableFacetedFilter
                            key={i}
                            column={table.getColumn(f.name)}
                            title={f.name === 'isActive' ? 'Trạng thái Hoạt động' : 'Vai trò'}
                            options={f.options}
                        />
                    ))}

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={() => table.resetColumnFilters()}
                            className="h-8 px-2 lg:px-3 hidden lg:flex"
                        >
                            Reset
                            <Cross2Icon className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            <DataTableViewOptions table={table} />
        </div>
    );
}
