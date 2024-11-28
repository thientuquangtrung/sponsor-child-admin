"use client";

import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

export default function DisbursementChart({ disbursementData }) {
  const chartData = disbursementData.flatMap(yearData =>
    yearData.monthlyDisbursements.map(monthData => ({
      month: `Th${monthData.month}`,
      unDisbursed: monthData.unDisbursedAmount,
      disbursed: monthData.disbursedAmount
    }))
  );

  const chartConfig = {
    unDisbursed: {
      label: "Chưa giải ngân",
      color: "#3B82F6",
    },
    disbursed: {
      label: "Đã giải ngân",
      color: "#10B981",
    },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-bold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center mb-1">
              <div
                className="w-4 h-4 mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <div>
                <p className="text-sm">
                  {entry.dataKey === 'unDisbursed'
                    ? 'Chưa giải ngân'
                    : 'Đã giải ngân'}:
                  {formatCurrency(entry.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Báo cáo Giải Ngân</CardTitle>
        <CardDescription>Báo cáo chi tiết về các khoản giải ngân từng tháng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                payload={[
                  { value: 'Chưa giải ngân', type: 'rect', color: chartConfig.unDisbursed.color },
                  { value: 'Đã giải ngân', type: 'rect', color: chartConfig.disbursed.color }
                ]}
              />
              <Bar dataKey="unDisbursed" fill={chartConfig.unDisbursed.color} radius={4} />
              <Bar dataKey="disbursed" fill={chartConfig.disbursed.color} radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}