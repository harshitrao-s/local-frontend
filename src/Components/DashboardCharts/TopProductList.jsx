import React from 'react';
import { ArrowUpRight, Box, Users } from 'lucide-react';


const ListCard = ({ title, data, type }) => {
  return (
    <div 
      className="flex flex-col w-full  min-h-[100px] rounded-[20px] p-[16px] border border-gray-200 bg-white"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[16px] font-semibold text-[#454545]">{title}</h3>
        <button className="flex items-center gap-1 text-[12px] text-[#3D3D3D] hover:text-gray-800 transition-colors">
          Show All <ArrowUpRight size={16} />
        </button>
      </div>

      {/* List Body */}
      <div className="flex flex-col gap-2 overflow-hidden">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-gray-400">
                {type === "product" ? <Box size={18} /> : <Users size={18} />}
              </div>
              <span className="text-[12px] text-[#737373] font-400">
                {item.name}
              </span>
            </div>
            <span className="text-[12px] font-bold text-[#101011]">
              {item.count.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

  const TopProductList = () => {
    const topProducts = [
      { name: "Vitamin C 500mg", count: 1200 },
      { name: "Organic Protein Power", count: 850 },
      { name: "Organic Protein Power", count: 850 },
      { name: "Organic Protein Power", count: 850 },
    ];
  
    const topVendors = [
      { name: "GreenLeaf Supplies", count: 287 },
      { name: "Wellness International", count: 198 }, 
      { name: "Wellness International", count: 198 },
      { name: "Wellness International", count: 198 },
    ];
  
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4'>
        <ListCard title="Top Products" data={topProducts} type="product" />
        <ListCard title="Top Vendors" data={topVendors} type="vendor" />
        </div>
    );
  };
  
  export default TopProductList;