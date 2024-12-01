"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useState } from 'react'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useGetIncomeExpenseByDateRangeQuery } from "@/redux/fund/fundApi"
import DateRangePicker from "@/components/ui/date-range-picker"
import LoadingScreen from "@/components/common/LoadingScreen"

const chartConfig = {
    fund: {
        label: "Tổng quan quỹ",
    },
    income: {
        label: "Thu nhập",
        color: "#10B981",
    },
    expense: {
        label: "Chi tiêu",
        color: "#2196F3",
    },
};

const customStyles = {
    '--color-income': '#10B981',
    '--color-expense': '#2196F3',
};

export function ChartFund() {
    const [dateRange, setDateRange] = useState({
        from: new Date(2024, 0, 1),
        to: new Date()
    });

    const { data: chartData, isLoading, isError } = useGetIncomeExpenseByDateRangeQuery({
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0]
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const handleRangeChange = (newRange) => {
        if (newRange.from && newRange.to) {
            setDateRange(newRange);
        }
    };

    const transformedData = React.useMemo(() => {
        if (!chartData) return [];

        return chartData.flatMap(yearData =>
            yearData.monthlyData.map(monthData => ({
                date: `${monthData.month}/${yearData.year}`,
                income: parseInt(monthData.totalIncome),
                expense: parseInt(monthData.totalExpense)
            }))
        ).sort((a, b) => {
            const [aMonth, aYear] = a.date.split('/').map(Number);
            const [bMonth, bYear] = b.date.split('/').map(Number);
            return (aYear * 12 + aMonth) - (bYear * 12 + bMonth);
        });
    }, [chartData]);

    const yAxisDomain = React.useMemo(() => {
        if (!transformedData.length) return [0, 0];

        const allValues = transformedData.flatMap(item => [item.income, item.expense]);
        const maxValue = Math.max(...allValues);
        const roundedMax = Math.ceil(maxValue / 1000000) * 1000000;

        return [0, roundedMax];
    }, [transformedData]);

    if (isLoading) return <div><LoadingScreen /></div>;
    if (isError) return <div>Có lỗi xảy ra khi tải dữ liệu</div>;

    return (
        <Card className="w-full" style={customStyles}>
            <CardHeader className="flex items-center gap-4 space-y-0 border-b py-5 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>Tổng quan</CardTitle>
                    <CardDescription>
                        Phân tích thu nhập và chi tiêu
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <DateRangePicker
                        onRangeChange={handleRangeChange}
                    />
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[300px] w-full"
                >
                    <AreaChart
                        data={transformedData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                        />
                        <YAxis
                            domain={yAxisDomain}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={formatCurrency}
                            width={100}
                        />
                        <ChartTooltip
                            cursor={{ stroke: '#666666', strokeWidth: 1 }}
                            content={
                                <ChartTooltipContent
                                    valueFormatter={formatCurrency}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="income"
                            type="monotone"
                            fill="url(#fillIncome)"
                            stroke="var(--color-income)"
                            strokeWidth={2}
                        />
                        <Area
                            dataKey="expense"
                            type="monotone"
                            fill="url(#fillExpense)"
                            stroke="var(--color-expense)"
                            strokeWidth={2}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}