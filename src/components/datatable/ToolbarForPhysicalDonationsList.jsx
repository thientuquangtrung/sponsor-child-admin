import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { DataTableViewOptions } from "@/components/datatable/DataTableViewOptions";
import { DataTableFacetedFilter } from "@/components/datatable/DataTableFacetedFilter";
import { giftDeliveryMethod, giftStatus } from "@/config/combobox";

export function ToolbarForPhysicalDonationsList({ table }) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const filters = [
        {
            name: "giftDeliveryMethod",
            title: "Phương thức giao",
            options: giftDeliveryMethod.map((method) => ({
                value: method.value.toString(),
                label: method.label,
            })),
        },
        {
            name: "giftStatus",
            title: "Trạng thái",
            options: giftStatus.map((status) => ({
                value: status.value.toString(),
                label: status.label,
            })),
        },
    ];

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex flex-1 flex-col sm:flex-row gap-y-4 items-center space-x-2 w-full">
                <Input
                    placeholder="Tìm theo tên người quyên góp..."
                    value={table.getColumn("userName")?.getFilterValue() ?? ""}
                    onChange={(event) =>
                        table.getColumn("userName")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />

                <div className="flex space-x-2 w-full overflow-auto no-scrollbar">
                    {filters.map((f, i) => (
                        table.getColumn(f.name) && (
                            <DataTableFacetedFilter
                                key={i}
                                column={table.getColumn(f.name)}
                                title={f.title}
                                options={f.options}
                            />
                        )
                    ))}

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            onClick={() => table.resetColumnFilters()}
                            className="h-8 px-2 lg:px-3 hidden lg:flex"
                        >
                            Đặt lại
                            <Cross2Icon className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
            <DataTableViewOptions table={table} />
        </div>
    );
}
