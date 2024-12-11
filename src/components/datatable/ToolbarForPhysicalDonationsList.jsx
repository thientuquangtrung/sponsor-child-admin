// ToolbarForPhysicalDonationsList.jsx
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { DataTableViewOptions } from "@/components/datatable/DataTableViewOptions";
import { DataTableFacetedFilter } from "@/components/datatable/DataTableFacetedFilter";
import { giftDeliveryMethod, giftStatus, giftType } from '@/config/combobox';

export function ToolbarForPhysicalDonationsList({ table }) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Tìm theo tên người quyên góp..."
                    value={(table.getColumn("userName")?.getFilterValue()) ?? ""}
                    onChange={(event) =>
                        table.getColumn("userName")?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("giftDeliveryMethod") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("giftDeliveryMethod")}
                        title="Phương thức giao"
                        options={giftDeliveryMethod}
                    />
                )}
                {table.getColumn("giftStatus") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("giftStatus")}
                        title="Trạng thái"
                        options={giftStatus}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
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
}