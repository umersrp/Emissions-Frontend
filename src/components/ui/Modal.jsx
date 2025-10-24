import React, { useState, useMemo, useEffect, Fragment } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Logo from "@/assets/images/logo/SrpLogo.png";
import Tippy from "@tippyjs/react";
import Modal from "@/components/ui/Modal";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "@/pages/table/react-tables/GlobalFilter";

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
});

const ClubTable = () => {
  const navigate = useNavigate();
  const [clubData, setClubData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ✅ Fetch Clubs with Server-side Pagination
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/club/get`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        params: { page: pageIndex + 1, limit: pageSize },
      });

      setClubData(response.data.data || []);
      setPageCount(response.data.meta?.totalPages || 1);
      setTotalRecords(response.data.meta?.totalRecords || response.data.data?.length || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  // ✅ Delete Function
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/club/delete-club/${deleteId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Club deleted successfully");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete club");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // ✅ Table Columns
  const COLUMNS = [
    {
      Header: "Sr no",
      accessor: "id",
      Cell: ({ row, flatRows }) => <span>{flatRows.indexOf(row) + 1}</span>,
    },
    { Header: "Club Name", accessor: "clubName" },
    { Header: "Category", accessor: "clubCategory" },
    { Header: "Target Gender", accessor: "targetGender" },
    {
      Header: "Target Major",
      accessor: "targetMajor",
      Cell: ({ cell }) =>
        Array.isArray(cell.value) && cell.value.length > 0
          ? cell.value.join(", ")
          : "-",
    },
    {
      Header: "Target Year",
      accessor: "targetYear",
      Cell: ({ cell }) =>
        Array.isArray(cell.value) && cell.value.length > 0
          ? cell.value.join(", ")
          : "-",
    },
    {
      Header: "Proposed Activities",
      accessor: "proposedActivities",
      Cell: ({ cell }) =>
        Array.isArray(cell.value) && cell.value.length > 0
          ? cell.value.join(", ")
          : "-",
    },
    {
      Header: "Social Links",
      accessor: "socialLinks",
      Cell: ({ cell }) =>
        Array.isArray(cell.value) && cell.value.length > 0 ? (
          <a
            href={cell.value[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {cell.value[0]}
          </a>
        ) : (
          "-"
        ),
    },
    { Header: "President", accessor: "presidentName" },
    { Header: "Vice President", accessor: "vicePresidentName" },
    {
      Header: "Expected Members",
      accessor: "expectedMembers",
      Cell: ({ cell }) => cell.value || "-",
    },
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
              onClick={() => navigate(`/club-view/${cell.value}`)}
            >
              <Icon className="text-green-600" icon="heroicons:eye" />
            </button>
          </Tippy>
          <Tippy content="Edit">
            <button
              className="action-btn"
              onClick={() => navigate(`/club-edit/${cell.value}`)}
            >
              <Icon className="text-blue-600" icon="heroicons:pencil-square" />
            </button>
          </Tippy>
          <Tippy content="Delete">
            <button
              className="action-btn"
              onClick={() => {
                setDeleteId(cell.value);
                setShowDeleteModal(true);
              }}
            >
              <Icon className="text-red-700" icon="heroicons:trash" />
            </button>
          </Tippy>
        </div>
      ),
    },
  ];

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => clubData, [clubData]);

  const tableInstance = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
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
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    setGlobalFilter,
    prepareRow,
    state,
  } = tableInstance;

  const { globalFilter } = state;

  return (
    <>
      <Card noborder>
        {/* Header Section */}
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0 mb-3">Club Listing</h6>
          <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              icon="heroicons-outline:plus-sm"
              text="Add Club"
              className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
              onClick={() => navigate("/club-add")}
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
                <table
                  className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                  {...getTableProps()}
                >
                  <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] dark:bg-slate-700">
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            scope="col"
                            className="table-th text-white"
                          >
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
                        <td
                          colSpan={columns.length + 1}
                          className="text-center py-4"
                        >
                          No data available.
                        </td>
                      </tr>
                    ) : (
                      page.map((row) => {
                        prepareRow(row);
                        return (
                          <tr
                            {...row.getRowProps()}
                            className="even:bg-gray-50 dark:even:bg-slate-800"
                          >
                            {row.cells.map((cell) => (
                              <td
                                {...cell.getCellProps()}
                                className="px-6 py-4 whitespace-nowrap"
                              >
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-600">
            Showing page <b>{pageIndex + 1}</b> of <b>{pageCount}</b> — Total Records:{" "}
            <b>{totalRecords}</b>
          </p>
          <div className="space-x-2 rtl:space-x-reverse">
            <Button
              text="Previous"
              disabled={!canPreviousPage}
              onClick={() => previousPage()}
              className="btn-outline btn-sm"
            />
            <Button
              text="Next"
              disabled={!canNextPage}
              onClick={() => nextPage()}
              className="btn-outline btn-sm"
            />
          </div>
        </div>
      </Card>

      {/* ✅ Delete Confirmation Modal */}
      <Modal
        activeModal={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
        footerContent={
          <div className="w-full flex justify-end space-x-3">
            <Button
              text="Cancel"
              className="btn btn-sm btn-outline"
              onClick={() => setShowDeleteModal(false)}
            />
            <Button
              text="Delete"
              className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
              onClick={handleDelete}
            />
          </div>
        }
      >
        <p>Are you sure you want to delete this club? This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default ClubTable;
