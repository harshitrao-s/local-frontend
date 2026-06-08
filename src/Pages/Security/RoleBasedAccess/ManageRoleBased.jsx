import React, { useState } from "react";
import CommonTable from "../../../Components/Common/CmnTable";
import CmnHeader from "../../../Components/Common/CmnHeader";
import { Plus } from "lucide-react";

const ManageRoleBased = () => {
    const [editMode, setEditMode] = useState(false);

    const [tableData, setTableData] = useState([
        {
            id: 1,
            permission: "View Vendors",
            module: "Vendor Management",
            SA: true,
            AD: true,
            PM: true,
            FM: true,
            WM: true,
            VM: true,
            VW: true,
            AU: true,
        },
        {
            id: 2,
            permission: "Create Vendor",
            module: "Vendor Management",
            SA: true,
            AD: true,
            PM: true,
            FM: false,
            WM: false,
            VM: true,
            VW: false,
            AU: false,
        },
        {
            id: 3,
            permission: "Edit Vendor",
            module: "Vendor Management",
            SA: true,
            AD: true,
            PM: true,
            FM: false,
            WM: false,
            VM: true,
            VW: false,
            AU: false,
        },
        {
            id: 4,
            permission: "Delete Vendor",
            module: "Vendor Management",
            SA: true,
            AD: true,
            PM: false,
            FM: false,
            WM: false,
            VM: false,
            VW: false,
            AU: false,
        },
    ]);

    const handlePermissionChange = (rowId, role, checked) => {
        setTableData((prev) =>
            prev.map((row) =>
                row.id === rowId
                    ? {
                        ...row,
                        [role]: checked,
                    }
                    : row
            )
        );
    };

    const handleSave = async () => {
        console.log("Save Payload", tableData);

        // Later API
        // await apiFetch("/permissions/update", {
        //     method: "POST",
        //     body: JSON.stringify(tableData),
        // });

        alert("Permissions Saved");
        setEditMode(false);
    };

    const renderPermissionCell = (role) => (val, row) => {
        if (!editMode) {
            return (
                <i
                    className={`fas ${val
                            ? "fa-check text-success"
                            : "fa-times text-danger"
                        }`}
                />
            );
        }

        return (
            <input
                type="checkbox"
                checked={!!val}
                onChange={(e) =>
                    handlePermissionChange(
                        row.id,
                        role,
                        e.target.checked
                    )
                }
            />
        );
    };

    const tableConfig = [
        {
            title: "Permission / Module",
            field: "permission",
            render: (_, row) => (
                <div>
                    <div className="fw-bold">
                        {row.permission}
                    </div>

                    <div
                        className="small text-muted text-uppercase"
                    >
                        {row.module}
                    </div>
                </div>
            ),
        },

        {
            title: "SA",
            field: "SA",
            render: renderPermissionCell("SA"),
        },
        {
            title: "AD",
            field: "AD",
            render: renderPermissionCell("AD"),
        },
        {
            title: "PM",
            field: "PM",
            render: renderPermissionCell("PM"),
        },
        {
            title: "FM",
            field: "FM",
            render: renderPermissionCell("FM"),
        },
        {
            title: "WM",
            field: "WM",
            render: renderPermissionCell("WM"),
        },
        {
            title: "VM",
            field: "VM",
            render: renderPermissionCell("VM"),
        },
        {
            title: "VW",
            field: "VW",
            render: renderPermissionCell("VW"),
        },
        {
            title: "AU",
            field: "AU",
            render: renderPermissionCell("AU"),
        },
    ];

    return (
        <div className="pt-10">
                <CmnHeader
                    title="Permission Matrix"
                    subtitle="Manage role based permissions & access control"
                    icon1="fas fa-users-cog"
                    actions={
                        !editMode
                            ? [
                                {
                                    icon: <i className="fas fa-edit"></i>,
                                    name: "Edit Permissions",
                                    variant: "primary",
                                    onClick: () => setEditMode(true),
                                },
                            ]
                            : [
                                {
                                    icon: <i className="fas fa-save"></i>,
                                    name: "Save Changes",
                                    variant: "primary",
                                    onClick: handleSave,
                                },
                                {
                                    icon: <i className="fas fa-times"></i>,
                                    name: "Cancel",
                                    variant: "danger",
                                    onClick: () => setEditMode(false),
                                },
                            ]
                    }
                />

            <CommonTable
                config={tableConfig}
                data={tableData}
                isSearchable={true}
            />
        </div>
    );
};

export default ManageRoleBased;
