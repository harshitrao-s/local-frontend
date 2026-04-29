import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Button, Col, FormGroup, FormLabel } from 'react-bootstrap';
import { toast } from "react-hot-toast";

import ProductAutoComplete from "../../../Components/ProductAutoComplete";
import InlineEditableNumber from "../../../Components/Common/InlineEditableNumber";
import { useMasterData } from "../../../Context/MasterDataProvider";
import { API_BASE } from "../../../Config/api";
import apiFetch from "../../../Utils/apiFetch";

import formatCurrency, { formatAUD, formattedDate } from "../../../Utils/utilFunctions";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faTableColumns, faListUl } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Popover } from "react-bootstrap";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "../../../Components/Common/CommonTable.css"

const LineItemsTable = ({ lineItems, updateLineItem, deleteLineItem, isPlaced = false }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [editingComment, setEditingComment] = useState("");

  return (
    <div className="mainTable" style={{
        padding: "0px"
    }}>
      <div className="mainTable__container">
        <div
          className="thin-scroll mainTable__container"
          style={{
            maxHeight: "calc(100vh - 350px)",
            overflowY: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            
            {/* HEADER */}
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Item Details</th>
                <th>Delivery Date</th>
                <th>Qty Ordered</th>
                <th>Unit Price</th>
                <th>Dist (%)</th>
                <th>Sub Total</th>
                <th>GST Rate</th>
                <th>GST Amount</th>
                <th>Landed Cost</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan="11" className="mainTable__empty">
                    No data found
                  </td>
                </tr>
              ) : (
                lineItems.map((item, i) => (
                  <React.Fragment key={item.product_id}>
                    
                    <tr className="desktopRow">
                      
                      <td
                        onClick={() => {
                          if (isPlaced) return;
                          setExpandedRow(item.product_id);
                          setEditingComment(item.comment || "");
                        }}
                      >
                        <Tippy
                          content={
                            <div style={{ maxWidth: "300px" }}>
                              <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                                {item.comment || "No comment"}
                              </div>
                            </div>
                          }
                        >
                          <div className="d-flex gap-3">
                            <img
                              src={
                                item.po_image_url?.startsWith("http")
                                  ? item.po_image_url
                                  : `${API_BASE}api/${item.po_image_url}`
                              }
                              alt=""
                              style={{ width: "50px", height: "50px", objectFit: "cover" }}
                            />

                            <div>
                              <div className="fw-bold">{item.title}</div>
                              <div className="text-muted">
                                SKU: {item.sku} | ASIN: {item.asin}
                              </div>
                            </div>
                          </div>
                        </Tippy>
                      </td>

                      <td>
                        {isPlaced ? (
                          formattedDate(item.delivery_date)
                        ) : (
                          <DatePicker
                            selected={item.delivery_date ? new Date(item.delivery_date) : null}
                            onChange={(date) =>
                              !isPlaced && updateLineItem(i, "delivery_date", date)
                            }
                            dateFormat="dd-MM-yyyy"
                            customInput={<input className="date-display" readOnly />}
                          />
                        )}
                      </td>

                      <td>
                        {isPlaced ? (
                          item.quantity
                        ) : (
                          <InlineEditableNumber
                            value={item.quantity}
                            precision={0}
                            onChange={(v) =>
                              !isPlaced && updateLineItem(i, "quantity", v)
                            }
                          />
                        )}
                      </td>

                      <td>
                        {isPlaced ? (
                          formatAUD(item.price)
                        ) : (
                          <InlineEditableNumber
                            value={item.price}
                            onChange={(v) =>
                              !isPlaced && updateLineItem(i, "price", v)
                            }
                          />
                        )}
                      </td>

                      <td>
                        {isPlaced ? (
                          `${item.discount}%`
                        ) : (
                          <InlineEditableNumber
                            format="percent"
                            value={item.discount}
                            onChange={(v) =>
                              !isPlaced && updateLineItem(i, "discount", v)
                            }
                          />
                        )}
                      </td>

                      <td>{formatCurrency(item.sub_total)}</td>

                      <td>
                        {isPlaced ? (
                          `${item.gst_percent}%`
                        ) : (
                          <InlineEditableNumber
                            format="percent"
                            value={item.gst_percent}
                            onChange={(v) =>
                              !isPlaced && updateLineItem(i, "gst_percent", v)
                            }
                          />
                        )}
                      </td>

                      <td>{formatCurrency(item.gst_amount)}</td>
                      <td>{formatCurrency(item.cost_per_item)}</td>
                      <td>{formatCurrency(item.total)}</td>

                      <td>
                        <button
                          disabled={isPlaced}
                          style={isPlaced ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                          onClick={() => !isPlaced && deleteLineItem(i)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                    </tr>

                    {expandedRow === item.product_id && !isPlaced && (
                      <tr>
                        <td colSpan="11">
                          <textarea
                            className="form-control"
                            value={editingComment || ""}
                            autoFocus
                            onChange={(e) => setEditingComment(e.target.value)}
                            onBlur={() => {
                              updateLineItem(i, "comment", editingComment);
                              setExpandedRow(null);
                            }}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LineItemsTable;