import React, { useEffect, useState, useRef } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { API_BASE, API_ENDPOINTS } from "../../Config/api";
import AttributeModal from "./AttributeModal";
import Swal from "sweetalert2";
import { apiFetch } from "../../Utils/apiFetch";

const AttributeManagement = () => {
  const tableRef = useRef(null);
  const tabulatorRef = useRef(null);
  const [modalConfig, setModalConfig] = useState({
    show: false,
    mode: 'add',
    initialData: null
  });

  const openModal = (mode, data = null) => {
    setModalConfig({ show: true, mode, initialData: data });
  };

  const closeModal = () => {
    setModalConfig({ show: false, mode: 'add', initialData: null });
  };

  const refreshTable = () => {
    if (tabulatorRef.current) tabulatorRef.current.setData();
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Attribute?",
      text: "Products using this attribute may be affected.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      const response = await apiFetch(`${API_ENDPOINTS.DELETE_PRODUCT_ATTRIBUTE}${id}`, { method: "DELETE" });
      if (response.status) {
        Swal.fire("Deleted!", "Attribute has been removed.", "success");
        refreshTable();
      }
    }
  };

  const columns = [
    { title: "Name", field: "attribute_name", minWidth: 200, formatter: (cell) => `<span class="fw-bold">${cell.getValue()}</span>` },
    { title: "Type", field: "attribute_type", width: 200, hozAlign: "center", headerHozAlign: "center", },
    { title: "Default Value", field: "default_value", width: 200, headerHozAlign: "center",  hozAlign: "center", },
    { title: "Created", field: "created_at", width: 200, hozAlign: "center", headerHozAlign: "center", },
    {
      title: "Actions",
      width: 200,
      headerSort: false,
      headerHozAlign: "center", 
      hozAlign: "center",
      formatter: function (cell) {
        const d = cell.getRow().getData();
        const container = document.createElement("div");
        container.className = "d-flex gap-2 justify-content-center";

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-outline-primary";
        editBtn.innerHTML = `<i class="fas fa-pen"></i>`;
        editBtn.onclick = () => openModal('edit', d);

        const delBtn = document.createElement("button");
        delBtn.className = "btn btn-sm btn-outline-danger";
        delBtn.innerHTML = `<i class="fas fa-trash"></i>`;
        delBtn.onclick = () => handleDelete(d.attribute_id);

        container.appendChild(editBtn);
        container.appendChild(delBtn);
        return container;
      }
    }
  ];

  useEffect(() => {
    tabulatorRef.current = new Tabulator(tableRef.current, {
      layout: "fitColumns",
      height: "600px",
      pagination: true,
      paginationMode: "remote",
      paginationSize: 20,
      ajaxURL: API_ENDPOINTS.LIST_PRODUCT_ATTRIBUTES,
      ajaxRequestFunc: async (url, config, params) => {
        const query = new URLSearchParams({ ...params, q: document.getElementById("search_attr")?.value || "" }).toString();
        return await apiFetch(`${url}?${query}`, { credentials: "include" });
      },
      ajaxResponse: (url, params, response) => ({
        data: response.data || [],
        last_page: response.last_page || 1,
      }),
      columns: columns,
    });
    return () => tabulatorRef.current?.destroy();
  }, []);

  return (
    <div className="p-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0 fw-bold">Attributes</h3>
        <button className="btn btn-dark" onClick={() => openModal('add')}>
          <i className="fas fa-plus me-2"></i>Add New
        </button>
      </div>

      <div className="card mb-3 border-0 shadow-sm">
        <div className="card-body">
          <div className="input-group" style={{ maxWidth: '400px' }}>
            <input id="search_attr" className="form-control" placeholder="Search name..." />
            <button className="btn btn-primary" onClick={() => tabulatorRef.current.setPage(1)}>
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div ref={tableRef} />
      </div>

      {modalConfig.show && (
        <AttributeModal
          mode={modalConfig.mode}
          initialData={modalConfig.initialData}
          onClose={closeModal}
          onRefresh={refreshTable}
        />
      )}
    </div>
  );
};

export default AttributeManagement;