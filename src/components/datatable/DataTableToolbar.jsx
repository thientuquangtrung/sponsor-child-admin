import { Cross2Icon } from '@radix-ui/react-icons';
import SearchIcon from '@/assets/icons/SearchIcon';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from '@/components/datatable/DataTableViewOptions';

// import { priorities, statuses } from '../data/data';
import { DataTableFacetedFilter } from '@/components/datatable/DataTableFacetedFilter';

export function DataTableToolbar({
    table,
    filters = [
        {
            name: 'type',
            options: [
                { value: '3dt', label: '3DT' },
                { value: 'clip', label: 'CLIP' },
            ],
        },
    ],
}) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex flex-1 flex-col sm:flex-row gap-y-4 items-center space-x-2 w-full">
                <Input
                    placeholder="Search for..."
                    value={table.getColumn('name')?.getFilterValue() ?? ''}
                    onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                    endIcon={<SearchIcon />}
                />
                <div className="flex space-x-2 w-full overflow-auto no-scrollbar">
                    {filters?.length > 0 &&
                        filters.map((f, i) => (
                            <DataTableFacetedFilter
                                key={i}
                                column={table.getColumn(f.name)}
                                title={f.name}
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
