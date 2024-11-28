import React from 'react'
import { Pie, PieChart, Sector, Cell } from "recharts"

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export default function ActivityChart({
    emergencyFundraisingCampaigns,
    longTermChildSponsorshipCampaigns
}) {
    const chartData = [
        {
            campaign: "Chiến dịch Khẩn cấp ",
            count: emergencyFundraisingCampaigns,
            fill: "var(--color-emergency)"
        },
        {
            campaign: "Chiến dịch Nuôi trẻ ",
            count: longTermChildSponsorshipCampaigns,
            fill: "var(--color-sponsorship)"
        }
    ]

    const chartConfig = {
        count: {
            label: "Số lượng Chiến dịch",
        },
        emergency: {
            label: "Chiến dịch Khẩn cấp",
            color: "#FF6B6B",
        },
        sponsorship: {
            label: "Chiến dịch Nuôi trẻ",
            color: "#4ECDC4",
        }
    }

    const totalCampaigns = emergencyFundraisingCampaigns + longTermChildSponsorshipCampaigns

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-bold text-sm"
            >
                {`${(percent * 100).toFixed(1)}%`}
            </text>
        );
    };

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-center">
                <CardTitle className="text-2xl font-semibold text-gray-800 mb-4">Phân bổ các chiến dịch</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="campaign"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={0}
                            label={renderCustomizedLabel}
                            activeShape={({ outerRadius = 0, ...props }) => (
                                <Sector {...props} outerRadius={outerRadius + 10} />
                            )}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm font-semibold">
                <div className="flex justify-center items-center space-x-4 mb-2">
                    {chartData.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <span
                                className={`font-semibold ${entry.campaign === "Chiến dịch Khẩn cấp "
                                    ? "text-[#FF6B6B]"
                                    : "text-[#4ECDC4]"
                                    }`}
                            >
                                {entry.campaign}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="leading-none text-muted-foreground text-teal-800">
                    Tổng số {totalCampaigns} chiến dịch
                </div>
            </CardFooter>


        </Card>
    )
}