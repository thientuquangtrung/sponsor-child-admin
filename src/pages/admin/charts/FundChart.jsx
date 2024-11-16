import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const options = {
    legend: {
        show: false,
        position: 'top',
        horizontalAlign: 'left',
    },
    colors: ['#2dd4bf', '#50c878'],
    chart: {
        fontFamily: 'Satoshi, sans-serif',
        height: 335,
        type: 'area',
        dropShadow: {
            enabled: true,
            color: '#623CEA14',
            top: 10,
            blur: 4,
            left: 0,
            opacity: 0.1,
        },
        toolbar: {
            show: false,
        },
    },
    responsive: [
        {
            breakpoint: 1024,
            options: {
                chart: {
                    height: 300,
                },
            },
        },
        {
            breakpoint: 1366,
            options: {
                chart: {
                    height: 350,
                },
            },
        },
    ],
    stroke: {
        width: [2, 2],
        curve: 'straight',
    },
    grid: {
        xaxis: {
            lines: {
                show: true,
            },
        },
        yaxis: {
            lines: {
                show: true,
            },
        },
    },
    dataLabels: {
        enabled: false,
    },
    markers: {
        size: 4,
        colors: '#fff',
        strokeColors: ['#2dd4bf', '#50c878'],
        strokeWidth: 3,
        strokeOpacity: 0.9,
        fillOpacity: 1,
        hover: {
            sizeOffset: 5,
        },
    },
    xaxis: {
        type: 'category',
        categories: [
            'Tháng 9',
            'Tháng 10',
            'Tháng 11',
            'Tháng 12',
            'Tháng 1',
            'Tháng 2',
            'Tháng 3',
            'Tháng 4',
            'Tháng 5',
            'Tháng 6',
            'Tháng 7',
            'Tháng 8',
        ],
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    yaxis: {
        title: {
            style: {
                fontSize: '0px',
            },
        },
        min: 0,
        max: 100,
    },
};

const FundChart = () => {
    const [state, setState] = useState({
        series: [
            {
                name: 'Tiến độ gây quỹ',
                data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
            },
            {
                name: 'Mục tiêu gây quỹ',
                data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
            },
        ],
    });
    // const handleReset = () => {
    //     setState((prevState) => ({
    //       ...prevState,
    //     }));
    //   };
    //   handleReset;

    return (
        <div className="col-span-12 rounded-sm border  bg-white px-5 pt-7 pb-5 shadow-lg dark:border-boxdark dark:bg-[#24303f] sm:px-7 xl:col-span-8">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
                <div className="flex w-full flex-wrap gap-3 sm:gap-5">
                    <div className="flex min-w-48">
                        <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                            <span className="block h-3 w-full max-w-3 rounded-full bg-[#2dd4bf] "></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold  text-[#2dd4bf]">Tiến độ gây quỹ</p>
                            {/* <p className="text-sm font-medium">12.10.2024 - 12.01.2025</p> */}
                        </div>
                    </div>
                    <div className="flex min-w-48">
                        <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                            <span className="block h-3 w-full max-w-3 rounded-full bg-[#50c878]"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-[#50c878] ">Mục tiêu gây quỹ</p>
                            {/* <p className="text-sm font-medium">12.10.2024 - 12.12.2024</p> */}
                        </div>
                    </div>
                </div>
                {/* <div className="flex w-full max-w-44 justify-end">
                    <div className="inline-flex items-center rounded-md bg-[#f5f7fd] p-1 dark:bg-[#313d4a]">
                        <button className="rounded bg-white py-1 px-3 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-[#24303f] dark:text-white dark:hover:bg-[#24303f]">
                            Ngày
                        </button>
                        <button className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-[#24303f]">
                            Tuần
                        </button>
                        <button className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-[#24303f]">
                            Tháng
                        </button>
                    </div>
                </div> */}
            </div>

            <div>
                <div id="fundChart" className="-ml-5">
                    <ReactApexChart
                        options={options}
                        series={state.series}
                        type="area"
                        height={350}
                    />
                </div>
            </div>
        </div>
    );
};

export default FundChart;
