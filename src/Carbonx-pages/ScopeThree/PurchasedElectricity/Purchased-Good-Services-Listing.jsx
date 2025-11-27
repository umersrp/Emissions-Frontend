import React, { useState, useEffect, useMemo } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import { useTable, useSortBy, useRowSelect } from "react-table";
import GlobalFilter from "@/pages/table/react-tables/GlobalFilter";
import Logo from "@/assets/images/logo/SrpLogo.png";
import Modal from "@/components/ui/Modal";

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;
  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);
  return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
});

const PurchasedGoodServicesListing = () => {
  const navigate = useNavigate();

  //  States
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  //  Pagination states
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);

  
  // ✅ Fetch Fugitive Records with Pagination + Search
const fetchFugitiveRecords = async (page = 1, limit = 10, search = "") => {
  setLoading(true);
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_BASE_URL}/Fugitive/get-All?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = Array.isArray(res.data?.data) ? res.data.data : [];
    const meta = res.data?.meta || {};

    setRecords(data);
    setPageIndex(meta.currentPage || 1);
    setTotalPages(meta.totalPages || 1);
    setTotalRecords(meta.totalRecords || 0);
    setPageSize(meta.limit || 10);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch records");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchFugitiveRecords(pageIndex, pageSize, globalFilterValue);
  }, [pageIndex, pageSize, globalFilterValue]);

  //  Delete Record
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/Fugitive/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Record deleted successfully");
      fetchFugitiveRecords(pageIndex, pageSize);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete record");
    }
  };

  //  Table Columns
  const COLUMNS = useMemo(
    () => [
      {  Header: "Sr.No", id: "serialNo", Cell: ({ row }) => <span>{row.index + 1 + (pageIndex - 1) * pageSize}</span> },
      { Header: "Building", accessor: "buildingId.buildingName" },
      { Header: "Stakeholder", accessor: "stakeholder" },
      { Header: "Equipment Type", accessor: "equipmentType" },
      { Header: "Material / Refrigerant", accessor: "materialRefrigerant" },
      { Header: "Leakage Value / Recharge Value", accessor: "leakageValue" },
      { Header: "Consumption Unit", accessor: "consumptionUnit" },
      { Header: "Quality Control", accessor: "qualityControl" },
      { Header: "Calculated Emissions (kgCO₂e)", accessor: "calculatedEmissionKgCo2e",},
      { Header: "Calculated Emissions (tCO₂e)", accessor: "calculatedEmissionTCo2e",},
      { Header: "Remarks", accessor: "remarks" },
      { Header: "Created By", accessor: "createdBy.name", Cell: ({ cell }) => cell.value || "-" },
      { Header: "Updated By", accessor: "updatedBy.name", Cell: ({ cell }) => cell.value || "-" },
      { Header: "Created At", accessor: "createdAt", Cell: ({ cell }) => (cell.value ? new Date(cell.value).toLocaleDateString() : "-") },
      {
        Header: "Actions",
        accessor: "_id",
        Cell: ({ cell }) => (
          <div className="flex space-x-3 rtl:space-x-reverse">
            <Tippy content="View">
              <button
                className="action-btn"
                onClick={() =>
                  navigate(`/Fugitive-Emissions-Form/${cell.value}`, { state: { mode: "view" } })
                }
              >
                <Icon icon="heroicons:eye" className="text-green-600" />
              </button>
            </Tippy>
            <Tippy content="Edit">
              <button
                className="action-btn"
                onClick={() =>
                  navigate(`/Fugitive-Emissions-Form/${cell.value}`, { state: { mode: "edit" } })
                }
              >
                <Icon icon="heroicons:pencil-square" className="text-blue-600" />
              </button>
            </Tippy>
            <Tippy content="Delete">
              <button
                className="action-btn"
                onClick={() => {
                  setSelectedBuildingId(cell.value);
                  setDeleteModalOpen(true);
                }}
              >
                <Icon icon="heroicons:trash" className="text-red-600" />
              </button>
            </Tippy>
          </div>
        ),
      },
    ],
    [pageIndex, pageSize]
  );

  const columns = useMemo(() => COLUMNS, [COLUMNS]);
  const tableInstance = useTable({ columns, data: records }, useSortBy, useRowSelect);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  //  Pagination Handlers
  const handleNextPage = () => {
    if (pageIndex < totalPages) setPageIndex((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (pageIndex > 1) setPageIndex((prev) => prev - 1);
  };
  const handleGoToPage = (page) => {
    if (page >= 1 && page <= totalPages) setPageIndex(page);
  };

  return (
    <>
      <Card noborder>
        {/* Header */}
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0">Purchased Good & Services Records</h6>
          <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
            <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />
            <Button
              icon="heroicons-outline:plus-sm"
              text="Add Record"
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
              onClick={() => navigate("/Purchased-Good-Services-Form/add")}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <img src={Logo} alt="Loading..." className="w-52 h-24" />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-100 table-fixed" {...getTableProps()}>
                  <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] sticky top-0 z-10">
                    {headerGroups.map((headerGroup, index) => (
                      <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            className="table-th text-white whitespace-nowrap"
                            key={column.id}
                          >
                            {column.render("Header")}
                            <span>
                              {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                            </span>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>

                  <tbody {...getTableBodyProps()}>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 1}>
                          <div className="flex justify-center items-center py-16">
                            <span className="text-gray-500 text-lg font-medium">
                              No data available.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => {
                        prepareRow(row);
                        return (
                          <tr {...row.getRowProps()} className="even:bg-gray-50">
                            {row.cells.map((cell) => (
                              <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap">
                                {cell.render("Cell")}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/*  Server-side Pagination UI */}
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="flex space-x-2 items-center">
              <span className="text-sm font-medium text-slate-600">Go</span>
              <input
                type="number"
                className="form-control py-2"
                value={pageIndex}
                onChange={(e) => handleGoToPage(Number(e.target.value))}
                style={{ width: "50px" }}
              />
            </span>
            <span className="text-sm font-medium text-slate-600">
              Page {pageIndex} of {totalPages}
            </span>
          </div>

          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            <li>
              <button
                onClick={() => handleGoToPage(1)}
                disabled={pageIndex === 1}
                className={`${pageIndex === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>
            <li>
              <button
                onClick={handlePrevPage}
                disabled={pageIndex === 1}
                className={`${pageIndex === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Prev
              </button>
            </li>

            {[...Array(totalPages)].map((_, idx) => (
              <li key={idx}>
                <button
                  className={`${
                    idx + 1 === pageIndex
                      ? "bg-slate-900 text-white font-medium"
                      : "bg-slate-100 text-slate-900 font-normal"
                  } text-sm rounded h-6 w-6 flex items-center justify-center`}
                  onClick={() => handleGoToPage(idx + 1)}
                >
                  {idx + 1}
                </button>
              </li>
            ))}

            <li>
              <button
                onClick={handleNextPage}
                disabled={pageIndex === totalPages}
                className={`${pageIndex === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Next
              </button>
            </li>
            <li>
              <button
                onClick={() => handleGoToPage(totalPages)}
                disabled={pageIndex === totalPages}
                className={`${pageIndex === totalPages ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-600">Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="form-select py-2"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/*  Delete Confirmation Modal */}
      <Modal
        activeModal={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
        centered
        footerContent={
          <>
            <Button text="Cancel" className="btn-light" onClick={() => setDeleteModalOpen(false)} />
            <Button
              text="Delete"
              className="btn-danger"
              onClick={async () => {
                await handleDelete(selectedBuildingId);
                setDeleteModalOpen(false);
              }}
            />
          </>
        }
      >
        <p className="text-gray-700 text-center">
          Are you sure you want to delete this Fugitive? This action cannot be undone.
        </p>
      </Modal>
    </>
  );
};

export default PurchasedGoodServicesListing;
