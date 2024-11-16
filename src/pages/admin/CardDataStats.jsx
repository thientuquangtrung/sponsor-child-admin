import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const CardDataStats = ({ title, total, rate, levelUp, levelDown, children }) => {
    return (
        <div className="rounded-sm border border-[#e2e8f0] bg-white py-6 px-7 shadow-default dark:border-[#2e3a47] dark:bg-[#24303f]">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eff2f7] dark:bg-[#313d4a]">
                {children}
            </div>

            <div className="mt-4 flex items-end justify-between">
                <div>
                    <h4 className="text-2xl font-bold text-black dark:text-white font-sans ">
                        {total}
                    </h4>
                    <span className="text-sm font-medium text-gray-400">{title}</span>
                </div>

                <span
                    className={`flex items-center gap-1 text-sm font-medium ${levelUp ? 'text-[#10b981]' : ''
                        } ${levelDown ? 'text-[#e73737]' : ''}`}
                >
                    {rate}

                    {levelUp && <ArrowUp className="fill-[#10b981]" size={10} />}
                    {levelDown && <ArrowDown className="fill-[#e73737]]" size={10} />}
                </span>
            </div>
        </div>
    );
};

export default CardDataStats;