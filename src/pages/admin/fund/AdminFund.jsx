import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useGetAllFundSourcesQuery, useGetAllFundUsageHistoryQuery, useGetCommonFundsQuery } from '@/redux/fund/fundApi';
import FundSourceTable from '@/pages/admin/fund/FundSourceTable';
import FundUsageTable from '@/pages/admin/fund/FundUsageTable';
import { WalletIcon } from 'lucide-react';
import { ChartFund } from '@/pages/admin/fund/ChartFund';

export function AdminFund() {
    const [activeTab, setActiveTab] = React.useState('sources');
    const [filters, setFilters] = React.useState({});
    const {
        data: sourcesData,
        isLoading: isLoadingSources,
        isError: isErrorSources,
        refetch: refetchSources
    } = useGetAllFundSourcesQuery(filters);
    const {
        data: usageData,
        isLoading: isLoadingUsage,
        isError: isErrorUsage,
        refetch: refetchUsage
    } = useGetAllFundUsageHistoryQuery(filters);
    const {
        data: commonFundData,
        isLoading: isLoadingCommonFund,
        isError: isErrorCommonFund
    } = useGetCommonFundsQuery();

    const handleTabChange = (value) => {
        setActiveTab(value);
        setFilters({});
        if (value === 'sources') {
            refetchSources();
        } else {
            refetchUsage();
        }
    };
    const handleFilterChange = (newFilters) => {
        const combinedFilters = {
            ...filters,
            ...newFilters
        };
        setFilters(combinedFilters);
    };
    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Quản lý quỹ', path: null },
    ];

    if (isLoadingSources || isLoadingUsage || isLoadingCommonFund) {
        return <LoadingScreen />;
    }

    if (isErrorSources || isErrorUsage || isErrorCommonFund) {
        return <div>Lỗi khi tải dữ liệu</div>;
    }

    const totalFund = commonFundData?.totalAmount?.toLocaleString('vi-VN') || '0'

    return (
        <>
            <div className="grid grid-cols-1 gap-4">
                <Breadcrumb breadcrumbs={breadcrumbs} />
                <div className="flex justify-center items-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center gap-2">
                        <WalletIcon className="w-6 h-6 text-teal-500" />
                        <div className="text-2xl font-bold text-green-600 text-center">
                            Tổng quỹ: {totalFund} ₫
                        </div>
                    </div>
                </div>


                <Tabs defaultValue="sources" className="w-full" onValueChange={handleTabChange}>
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-transparent">
                        <TabsTrigger value="sources" className="relative px-4 py-2 rounded-none transition-colors duration-200
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
                            Nguồn thu ({sourcesData?.sources?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="usage" className="relative px-4 py-2 rounded-none transition-colors duration-200
                        data-[state=active]:bg-transparent 
                        data-[state=active]:text-blue-500
                        hover:text-blue-500
                        after:content-['']
                        after:absolute
                        after:bottom-0
                        after:left-0
                        after:w-full
                        after:h-0.5
                        after:bg-blue-500
                        after:scale-x-0
                        data-[state=active]:after:scale-x-100
                        after:transition-transform
                        after:duration-300"
                        >
                            Lịch sử chi ({usageData?.usageHistories?.length || 0})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="sources" className="space-y-4">
                        <div className="flex justify-between items-center">
                            {sourcesData?.totalAmountAdded ? (
                                <div className="text-lg font-semibold text-green-600">
                                    Tổng thu: {sourcesData.totalAmountAdded.toLocaleString('vi-VN')} ₫
                                </div>
                            ) : null}
                        </div>
                        <FundSourceTable
                            data={Array.isArray(sourcesData?.sources) ? sourcesData.sources : []}
                            onFilterChange={handleFilterChange}
                        />

                    </TabsContent>
                    <TabsContent value="usage" className="space-y-4">
                        <div className="flex justify-between items-center">
                            {usageData?.totalAmountUsed ? (
                                <div className="text-lg font-semibold text-blue-400">
                                    Tổng chi: {usageData.totalAmountUsed.toLocaleString('vi-VN')} ₫
                                </div>
                            ) : null}
                        </div>

                        <FundUsageTable
                            data={usageData?.usageHistories}
                            onFilterChange={setFilters}
                        />
                    </TabsContent>
                </Tabs>
                <div className='py-12'>
                    <ChartFund />
                </div>
            </div>
        </>
    );
}

export default AdminFund;