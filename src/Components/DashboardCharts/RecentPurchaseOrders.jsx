import React from 'react'
const FONT = "'Inter', system-ui, sans-serif";

import CommonTable from '../Common/CmnTable';

const tableConfig = [
    {
        title: "Order #",
        field: "id",
    },
    {
        title: "Vendor",
        field: "vendor",
    },
    {
        title: "Order Date",
        field: "date",
    },
    {
        title: "Status",
        field: "status",
        render: (val, row) =>
        <span className={`new_badge bg-${row.statusColor} w-[120px] text-center text-[12px] font-medium`}>{val}</span>
    },

];

const recentOrders = [
    { id: "PO0319", vendor: "GreenLeaf Supplies", date: "16 Apr 2024", status: "Partially Received", statusColor: "warning", },
    { id: "PO0318", vendor: "HealthFirst Ltd.", date: "16 Apr 2024", status: "Placed", statusColor: "primary", },
    { id: "PO0317", vendor: "GreenLeaf Supplies", date: "16 Apr 2024", status: "Completed", statusColor: "success", },
    { id: "PO0316", vendor: "GreenLeaf Supplies", date: "15 Apr 2024", status: "Cancelled", statusColor: "danger", },
    { id: "PO0316", vendor: "GreenLeaf Supplies", date: "15 Apr 2024", status: "On Hold", statusColor: "primary", },
];
const RecentPurchaseOrders = () => {
    return (
        <div>
            <div className="bg-white border h-full d-flex flex-column rounded-[20px]">
                <div className="">
                    <h6 className='font-semibold text-[13px] px-4 py-3'>Recent Purchase Orders</h6>
                </div>

                <CommonTable
                    config={tableConfig}
                    data={recentOrders}
                    isSearchable={false}
                    MainContainerCssClases={"pt-0  rounded-[20px]"}
                />
            </div>
        </div>
    )
}


export default RecentPurchaseOrders
