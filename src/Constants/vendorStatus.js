export const VENDOR_STATUS = [
  { id: 0, name: "Pending", color: "secondary" },
  { id: 1, name: "In Process", color: "info" },
  { id: 2, name: "Active", color: "success" },
  { id: 3, name: "Reject", color: "danger" },
  { id: 4, name: "On Hold", color: "warning" },
];

export const getVendorStatus = (id) => {
  return VENDOR_STATUS.find(s => s.id === Number(id));
};