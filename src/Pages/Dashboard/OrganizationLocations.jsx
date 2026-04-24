import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import LocationModal from "./LocationModal"; // New component below
import { useMasterData } from "../../Context/MasterDataProvider";
import { API_BASE } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";
import CmnTable from "../../Components/Common/CmnTable";
import { SbAdminSvg } from "../../Components/Common/Svgs/ActionsSvg";


const OrganizationLocations = ({ locations }) => {
  const { countries } = useMasterData(); // Fetch global country list
  const [modal, setModal] = useState({ show: false, mode: 'add', id: null });
  const [locationsData, setLocationsData] = useState([]);

  useEffect(() => {
    setLocationsData(locations || []);
  }, [locations]);

  const handleEdit = (id) => {
    setModal({ show: true, mode: 'edit', id: id });
  };

  const handleDelete = (id, locationName) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "swal2-compact-design" },
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await apiFetch(
          `${API_BASE}api/organizations/locations/delete/${id}`,
          { method: "DELETE" }
        );

        if (res.status) {
          Swal.fire("Deleted!", `${locationName} has been deleted.`, "success");

          setTimeout(() => {
            window.location.reload()
          }, 600)
          // OR remove locally:
          // setLocations(prev => prev.filter(l => l.id !== id));
        } else {
          Swal.fire("Error", res.message || "Delete failed", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Something went wrong", "error");
      }
    });
  };

  useEffect(() => {
    setLocationsData(locations || []);
    console.log("locationsData:", locations);   // 👈 add here
  }, [locations]);

  const tableConfig = [
    {
      field: "name",
      title: "Name",
    },
    {
      field: "address",
      title: "Address",
    },
    {
      field: "city",
      title: "City",
    },
    // {
    //   field: "state_name",  
    //   title: "State",
    // },

    {
      title: "Actions",
      field: "actions",
      render: (val, row) => (
        <div className="d-flex gap-2">
          <div onClick={() => {
            handleEdit(row.id)
          }} className="cursor-pointer" >{SbAdminSvg.edit}</div>
          <div className="cursor-pointer" onClick={() => {
            handleDelete(row.id, row.name)
          }}>{SbAdminSvg.delete}</div>
        </div>
      ),
    },

  ];

  return (
    <div className="card shadow-sm border-0 mt-1">
      <div className="card-header border-bottom">
        <h6 className="card-title font-weight-bold">Locations</h6>
        <div className="card-tools">
          <button className="btn btn-primary btn-sm px-3" onClick={() => setModal({ show: true, mode: 'add', id: null })}>
            <i className="fas fa-plus me-1"></i> Add New
          </button></div>
      </div>



      <CmnTable
        config={tableConfig}
        data={locationsData}
        isSearchable={false}
      />

      {modal.show && (
        <LocationModal
          mode={modal.mode}
          locationId={modal.id}
          countries={countries}
          onClose={() => setModal({ ...modal, show: false })}
        />
      )}
    </div>
  );
};

export default OrganizationLocations;