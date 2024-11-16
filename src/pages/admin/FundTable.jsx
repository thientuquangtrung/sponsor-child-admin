import React from 'react';

const campaignData = [
    {
        image: 'https://static.thiennguyen.app/public/donate-target/photo/2024/9/19/31752ee5-d3ff-4e41-9789-efb054c347d9.jpg',
        name: 'Gieo mầm Thiện tâm',
        fundsRaised: 15000000,
        participants: 250,
        goal: 20000000,
        status: 'Đang diễn ra',
    },
    {
        image: 'https://static.thiennguyen.app/public/donate-target/photo/2024/9/19/31752ee5-d3ff-4e41-9789-efb054c347d9.jpg',
        name: 'Gieo mầm Thiện tâm',
        fundsRaised: 8000000,
        participants: 120,
        goal: 10000000,
        status: 'Đang diễn ra',
    },
    {
        image: 'https://static.thiennguyen.app/public/donate-target/photo/2024/9/19/31752ee5-d3ff-4e41-9789-efb054c347d9.jpg',
        name: 'Gieo mầm Thiện tâm',
        fundsRaised: 12000000,
        participants: 180,
        goal: 15000000,
        status: 'Hoàn thành',
    },
    {
        image: 'https://static.thiennguyen.app/public/donate-target/photo/2024/9/19/31752ee5-d3ff-4e41-9789-efb054c347d9.jpg',
        name: 'Gieo mầm Thiện tâm',
        fundsRaised: 12000000,
        participants: 180,
        goal: 15000000,
        status: 'Hoàn thành',
    },
];

const FundTable = () => {
    return (
        <div className="rounded-sm border border-[#e2e8f0] bg-white px-5 pt-6 pb-2 shadow-lg dark:border-[#2e3a47] dark:bg-[#24303f] sm:px-7 xl:pb-1">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
                Danh sách Chiến dịch Gây Quỹ
            </h4>

            <div className="flex flex-col">
                <div className="grid grid-cols-3 rounded-sm bg-[#2ca57d] dark:bg-gray-700 sm:grid-cols-5">
                    <div className="p-2 xl:p-5">
                        <h5 className="text-sm font-medium uppercase">Chiến dịch</h5>
                    </div>
                    <div className="p-2 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase">Số tiền quyên góp</h5>
                    </div>
                    <div className="p-2 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase">Số người tham gia</h5>
                    </div>
                    <div className="p-2 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase">Mục tiêu</h5>
                    </div>
                    <div className="p-2 text-center xl:p-5">
                        <h5 className="text-sm font-medium uppercase">Trạng thái</h5>
                    </div>
                </div>

                {campaignData.map((campaign, key) => (
                    <div
                        className={`grid grid-cols-3 sm:grid-cols-5 ${key === campaignData.length - 1 ? '' : 'border-b border-[#24303f] dark:border-[#2e3a47]'
                            }`}
                        key={key}
                    >
                        <div className="flex items-center gap-3 p-2 xl:p-5">
                            <div className="flex-shrink-0">
                                <img src={campaign.image} alt="Chiến dịch" className="w-12 h-12" />
                            </div>
                            <p className="hidden text-black dark:text-white sm:block">{campaign.name}</p>
                        </div>

                        <div className="flex items-center justify-center p-2 xl:p-5">
                            <p className="text-black dark:text-white">{campaign.fundsRaised.toLocaleString()} VND</p>
                        </div>

                        <div className="flex items-center justify-center p-2 xl:p-5">
                            <p className="text-black dark:text-white">{campaign.participants}</p>
                        </div>

                        <div className="flex items-center justify-center p-2 xl:p-5">
                            <p className="text-black dark:text-white">{campaign.goal.toLocaleString()} VND</p>
                        </div>


                        <div className="flex items-center justify-center p-2 xl:p-5 font-medium">
                            <p className={campaign.status === 'Đang diễn ra' ? 'text-blue-500' : 'text-green-500'}>
                                {campaign.status}
                            </p>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default FundTable;
