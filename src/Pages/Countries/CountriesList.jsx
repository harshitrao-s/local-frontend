import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { API_BASE } from "../../Config/api";
import { apiFetch } from "../../Utils/apiFetch";
import CmnHeader from "../../Components/Common/CmnHeader";
import CommonTable from "../../Components/Common/CmnTable";
import { SbAdminSvg } from "../../Components/Common/Svgs/ActionsSvg";

const CountriesList = () => {
  const navigate = useNavigate();

  const [countriesdata, setCountriesdata] = useState([]);
  const [search, setSearch] = useState("");

  const fetchCountries = async (query = "") => {
    try {
      const q = new URLSearchParams({ q: query }).toString();
      const result = await apiFetch(`${API_BASE}api/countries?${q}`);
      setCountriesdata(result.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = useCallback(async (id) => {
    Swal.fire({
      title: "Delete Country?",
      text: "This will remove the country and its states.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f0f1a",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiFetch(`${API_BASE}api/countries/delete/${id}`, {
            method: "DELETE",
          });
          if (res.status) {
            Swal.fire("Deleted!", "Country removed.", "success");
            fetchCountries(search); // refresh
          }
        } catch (e) {
          Swal.fire("Error", e.message || "Failed", "error");
        }
      }
    });
  }, [search]);

  const tableConfig = [
    {
      title: "Name",
      field: "name",
    },
    {
      title: "ISO2",
      field: "iso2",
    },
    {
      title: "ISO3",
      field: "iso3",
    },
    {
      title: "# States",
      field: "num_states",
    },
    {
      title: "Actions",
      field: "created_at",
      render: (val, row) => (
        <div className="d-flex gap-2">
          <div onClick={() => {
            navigate(`/settings/countries/${row.id}/edit`)
          }} className="cursor-pointer" >{SbAdminSvg.edit}</div>
          <div className="cursor-pointer" onClick={() => {
            handleDelete(row.id)
          }}>{SbAdminSvg.delete}</div>
        </div>
      ),
    },

  ];

  // Initial load
  useEffect(() => {
    fetchCountries();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCountries(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <CmnHeader
        title={"Countries"}
        subtitle={"Manage countries"}
        icon1={"fas fa-globe"}
      />

      <div className="cl-search-wrap">
        <div className="cl-search-inner">
          <i className="fas fa-search cl-search-icon" />
          <input
            className="cl-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
          />
        </div>

        {search && (
          <button className="cl-clear-btn" onClick={() => setSearch("")}>
            Clear
          </button>
        )}
      </div>

      <CommonTable
        config={tableConfig}
        data={countriesdata}
        isSearchable={false}
      />
    </div>
  );
};

export default CountriesList;