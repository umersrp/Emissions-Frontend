import React, { useState, useEffect, useMemo } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Tippy from "@tippyjs/react";
import {
  useTable,
  useRowSelect,
  useSortBy,
  usePagination,
} from "react-table";
import GlobalFilter from "@/pages/table/react-tables/GlobalFilter";
import Logo from "../../assets/images/logo/SrpLogo.png";
import Modal from "@/components/ui/Modal";

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
});

const FugitiveCombustionListing = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);

  // ✅ Fetch All Fugitive Emission Records (once)
  const fetchStationaryRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/Fugitive/get-All`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = res.data?.data?.records || res.data?.data || [];
      setRecords(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationaryRecords();
  }, []);

  // ✅ Client-side filtering
  const filteredRecords = useMemo(() => {
    if (!globalFilterValue.trim()) return records;
    const search = globalFilterValue.toLowerCase();

    return records.filter((item) => {
      return (
        item?.buildingId?.buildingName?.toLowerCase().includes(search) ||
        item?.stakeholder?.toLowerCase().includes(search) ||
        item?.equipmentType?.toLowerCase().includes(search) ||
        item?.materialRefrigerant?.toLowerCase().includes(search) ||
        item?.remarks?.toLowerCase().includes(search)
      );
    });
  }, [records, globalFilterValue]);

  // ✅ Delete Record
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/Fugitive/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Record deleted successfully");
      fetchStationaryRecords();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete record");
    }
  };

  // ✅ Table Columns
  const COLUMNS = useMemo(
    () => [
      {
        Header: "Sr No",
        id: "serialNo",
        Cell: ({ row }) => <span>{row.index + 1 + pageIndex * pageSize}</span>,
      },
      { Header: "Building", accessor: "buildingId.buildingName" },
      { Header: "Stakeholder", accessor: "stakeholder" },
      { Header: "Equipment Type", accessor: "equipmentType" },
      { Header: "Material / Refrigerant", accessor: "materialRefrigerant" },
      { Header: "Leakage Value", accessor: "leakageValue" },
      { Header: "Consumption Unit", accessor: "consumptionUnit" },
      { Header: "Quality Control", accessor: "qualityControl" },
      { Header: "Remarks", accessor: "remarks" },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: ({ cell }) =>
          cell.value ? new Date(cell.value).toLocaleDateString() : "-",
      },
      {
        Header: "Actions",
        accessor: "_id",
        Cell: ({ cell }) => (
          <div className="flex space-x-3 rtl:space-x-reverse">
            <Tippy content="View">
              <button
                className="action-btn"
                onClick={() =>
                  navigate(`/Fugitive-Emissions-Form/${cell.value}`, {
                    state: { mode: "view" },
                  })
                }
              >
                <Icon icon="heroicons:eye" className="text-green-600" />
              </button>
            </Tippy>
            <Tippy content="Edit">
              <button
                className="action-btn"
                onClick={() =>
                  navigate(`/Fugitive-Emissions-Form/${cell.value}`, {
                    state: { mode: "edit" },
                  })
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
  const data = useMemo(() => filteredRecords, [filteredRecords]);

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
        },
        ...columns,
      ]);
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    state,
  } = tableInstance;

  const { pageIndex: currentPageIndex } = state;

  return (
    <>
      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0 ">Fugitive Emissions Records</h6>
          <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
            <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />
            <Button
              icon="heroicons-outline:plus-sm"
              text="Add Record"
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
              iconClass="text-lg"
              onClick={() => navigate("/Fugitive-Emissions-Form/add")}
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <img src={Logo} alt="Loading..." className="w-52 h-24" />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-slate-100 table-fixed" {...getTableProps()}>
                  <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
                    {headerGroups.map((headerGroup, index) => (
                      <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                        {headerGroup.headers.map((column) => (
                          <th {...column.getHeaderProps(column.getSortByToggleProps())} className="table-th text-white" key={column.id}>
                            {column.render("Header")}
                            <span>
                              {column.isSorted
                                ? column.isSortedDesc
                                  ? " 🔽"
                                  : " 🔼"
                                : ""}
                            </span>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {page.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + 1} className="text-center py-4">
                          No data available.
                        </td>
                      </tr>
                    ) : (
                      page.map((row) => {
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

        {/* ✅ Pagination */}
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="text-sm font-medium text-slate-600">
              Page {currentPageIndex + 1} of {pageOptions.length || 1}
            </span>
          </div>
          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            <li>
              <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                Prev
              </button>
            </li>
            <li>
              <button onClick={() => nextPage()} disabled={!canNextPage}>
                Next
              </button>
            </li>
          </ul>
        </div>
      </Card>

      {/* ✅ Delete Confirmation Modal */}
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

export default FugitiveCombustionListing;
