import React, { useState, useMemo, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "../table/react-tables/GlobalFilter";
import { Menu } from "@headlessui/react";
import { useSelector } from "react-redux";
import Icons from "@/components/ui/Icon";
import Header from "@/components/partials/header";
import DatePicker from "react-flatpickr";
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <>
        <input
          type="checkbox"
          ref={resolvedRef}
          {...rest}
          className="table-checkbox"
        />
      </>
    );
  }
);

const Attendence = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedSchedule, setSelectedSchedule] = useState(null); // State for selected schedule
  const [schedules, setSchedules] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");


  const exportToExcel = () => {
    if (userData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const exportData = userData.map((item, index) => {
      const attendance = item.attendance?.[item.attendance.length - 1] || {};
      return {
        "Sr No": index + 1,
        Name: item.user?.name || "N/A",
        Email: item.user?.email || "N/A",
        Group: item.schedules?.group || "N/A",
        Status: attendance.status || "N/A",
        "Created At": attendance.date ? new Date(attendance.date).toLocaleString() : "N/A",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, "attendance.xlsx");
  };



  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/${user.type}/schedule/get-schedule`, {
          params: {
            limit: 1000000000

          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSchedules(response.data.schedule);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch schedules");
      }
    };

    fetchSchedules();
  }, []);

  const fetchData = async (pageIndex, pageSize) => {
    try {

      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/${user.type}/attendence/get-attendence`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          page: pageIndex + 1,
          limit: pageSize,
          scheduleId: selectedSchedule,
          fromDate: fromDate,  // New fromDate
          toDate: toDate,      // New toDate
        },
      });
      setUserData(response.data);
      setTotal(response.data.pagination.total);
      setHasNextPage(response.data.pagination.hasNextPage);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData(pageIndex, pageSize);
  }, [pageIndex, pageSize, selectedSchedule, fromDate, toDate]);


  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BASE_URL}/${user.type}/user/delete-user/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("User deleted successfully");
      fetchData(pageIndex, pageSize);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete user");
    }
  };







  const handleChangeStatus = async (userId, scheduleId, currentStatus) => {
    if (!userId || !scheduleId) {
      toast.error("Invalid user or schedule");
      return;
    }

    const newStatus = currentStatus === "absent" ? "present" : "absent";

    // Optimistically update the UI
    setUserData((prevUsers) =>
      prevUsers.map((user) =>
        user.user?._id === userId && user.schedules?._id === scheduleId
          ? {
            ...user,
            attendance: user.attendance.map((attendanceItem) =>
              attendanceItem.scheduleId === scheduleId
                ? { ...attendanceItem, status: newStatus }
                : attendanceItem
            ),
          }
          : user
      )
    );

    try {
      setLoading(true);

      console.log("Making API call with:", {
        userId,
        scheduleId,
        newStatus
      });

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/admin/attendence/change-attendance-status`, // Hardcoded admin for testing
        {
          userId,
          scheduleId,
          status: newStatus

        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("API Response:", response);

      if (response.status === 200) {
        toast.success("Attendance status updated");
      } else {
        toast.error("Failed to update attendance status");
        revertStatus(userId, scheduleId, currentStatus);
      }
    } catch (error) {
      console.error("Error updating attendance status:", error);
      toast.error("Error updating attendance status");
      revertStatus(userId, scheduleId, currentStatus);
    } finally {
      setLoading(false);
    }
  };


  const revertStatus = (userId, scheduleId, originalStatus) => {
    console.log(`Reverting status to ${originalStatus} for user ${userId}, schedule ${scheduleId}`);
    setUserData((prevUsers) =>
      prevUsers.map((user) =>
        user.user?._id === userId && user.schedules?._id === scheduleId
          ? {
            ...user,
            attendance: user.attendance.map((attendanceItem) =>
              attendanceItem.scheduleId === scheduleId
                ? { ...attendanceItem, status: originalStatus }
                : attendanceItem
            ),
          }
          : user
      )
    );
  };



  const handleTest = (test) => {
    console.log(test)
  }



  const actions = [
    {
      name: "edit",
      icon: "heroicons:pencil-square",
      doit: (id) => {
        navigate(`/role-edit?id=${id}`);
      },
    },
    {
      name: "delete",
      icon: "heroicons-outline:trash",
      doit: (id) => {
        handleDelete(id);
      },
    },
    // {
    //   name: "view",
    //   icon: "heroicons-outline:eye",
    //   doit: (id) => {
    //     navigate(`/customer-view?id=${id}`);
    //   },
    // },
    {
      name: "change status",
      icon: "heroicons-outline:refresh",
      doit: (userId, scheduleId, currentStatus) => {
        handleChangeStatus(userId, scheduleId, currentStatus);
      },
    }


  ];


  const COLUMNS = [
    {
      Header: "Sr no",
      accessor: "id",
      Cell: ({ row, flatRows }) => {
        return <span>{flatRows.indexOf(row) + 1}</span>;
      },
    },

    {
      Header: "Name",
      accessor: "user.name",
      Cell: (row) => <span>{row?.cell?.value || "N/A"}</span>,
    },


    {
      Header: "Email",
      accessor: "user.email",
      Cell: (row) => <span className="lowercase">{row?.cell?.value || "N/A"}</span>,
    },
    {
      Header: "Group",
      accessor: "schedules.group",
      Cell: (row) => <span className="lowercase">{row?.cell?.value || "N/A"}</span>,

    },


    {
      Header: "Status",
      accessor: (row) => row.attendance?.[row.attendance.length - 1]?.status || "N/A",
      Cell: ({ cell: { value } }) => (
        <span className="block w-full">
          <span
            className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${value.toLowerCase() === "present"
              ? "text-success-500 bg-success-500"
              : value.toLowerCase() === "absent"
                ? "text-warning-500 bg-warning-500"
                : "text-gray-500 bg-gray-300"
              }`}
          >
            {value}
          </span>
        </span>
      ),
    }
    ,


    {
      Header: "Created-At",
      accessor: (row) => row.attendance?.[row.attendance.length - 1]?.date || "N/A",
      Cell: ({ value }) => <span>{new Date(value).toLocaleDateString()}</span>,
    },

    {
      Header: "Action",
      accessor: "action",
      Cell: ({ row }) => {
        const userId = row.original?.user?._id;
        const scheduleId = row.original?.schedules?._id;
        const attendanceStatus = row.original?.attendance?.[0]?.status;

        if (!userId || !scheduleId) return null;

        return (
          <Dropdown
            classMenuItems="right-0 w-[140px] top-[110%]"
            label={
              <span className="text-xl text-center block w-full">
                <Icon icon="heroicons-outline:dots-vertical" />
              </span>
            }
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {actions.map((item, i) => (
                <Menu.Item key={i}>
                  <div
                    className={`${item.name === "delete"
                      ? "bg-danger-500 text-danger-500 bg-opacity-30 hover:bg-opacity-100 hover:text-white"
                      : "hover:bg-slate-900 hover:text-white dark:hover:bg-slate-600 dark:hover:bg-opacity-50"
                      } w-full border-b border-b-gray-500 border-opacity-10 px-4 py-2 text-sm last:mb-0 cursor-pointer first:rounded-t last:rounded-b flex space-x-2 items-center rtl:space-x-reverse`}
                    onClick={() =>
                      item.name === "change status"
                        ? item.doit(userId, scheduleId, attendanceStatus)
                        : item.doit(userId)
                    }
                  >
                    <span className="text-base">
                      <Icon icon={item.icon} />
                    </span>
                    <span>
                      {item.name === "change status"
                        ? attendanceStatus === "present"
                          ? "Mark Absent"
                          : "Mark Present"
                        : item.name}
                    </span>
                  </div>
                </Menu.Item>
              ))}
            </div>
          </Dropdown>
        );
      },
    }



    ,

  ];

  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => userData, [userData]);

  const tableInstance = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount: Math.ceil(total / pageSize),
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
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
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
    canPreviousPage,
    canNextPage,
    pageOptions,
    state,
    gotoPage,
    setGlobalFilter,
    prepareRow,
  } = tableInstance;

  const { globalFilter, pageIndex: currentPageIndex, pageSize: currentPageSize } = state;

  const handlePageChange = (pageIndex) => {
    setPageIndex(pageIndex);
  };

  const handlePageSizeChange = (pageSize) => {
    setPageSize(pageSize);
    setPageIndex(0); // Reset to first page whenever page size changes
  };
  if (loading) {
    return <div>Loading Attendence...</div>; // Show loading indicator
  }

  return (
    <>
      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0 mb-3">Players-Attendence</h6>
          <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
            <Button
              text="Export to Excel"
              icon="heroicons-outline:document-arrow-down"
              className="btn-dark font-normal btn-sm"
              onClick={exportToExcel}
            />
            <select
              value={selectedSchedule || ""}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              className="form-select py-2"
            >
              <option value="">All Schedules</option>
              {schedules.map((schedule) => (
                <option key={schedule._id} value={schedule._id}>
                  {schedule.group}
                </option>
              ))}
            </select>
            <DatePicker
              value={fromDate}
              onChange={(date) => setFromDate(date)}
              className="form-control py-2"
              placeholder="From Date"
            />

            <DatePicker
              value={toDate}
              onChange={(date) => setToDate(date)}
              className="form-control py-2"
              placeholder="To Date"
            />

            {/* <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} /> */}
            {/* <Button
              icon="heroicons-outline:calendar"
              text="Select date"
              className="btn-outline-secondary dark:border-slate-700 text-slate-600 btn-sm font-normal dark:text-slate-300"
              iconClass="text-lg"
            /> */}
            {/* <Button
              icon="heroicons-outline:filter"
              text="Filter"
              className="btn-outline-secondary dark:border-slate-700 text-slate-600 btn-sm font-normal dark:text-slate-300"
              iconClass="text-lg"
            /> */}
            {/* <Button
              icon="heroicons:plus"
              text="Add attendence"
              className="btn-dark font-normal btn-sm"
              iconClass="text-lg"
              onClick={() => {
                navigate("/");
              }}
            /> */}
          </div>
        </div>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                {...getTableProps()}
              >
                <thead className="bg-gradient-to-r from-[#304352] to-[#d7d2cc] dark:bg-slate-800">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
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
                <tbody
                  className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700"
                  {...getTableBodyProps()}
                >
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()} className="table-td">
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="flex space-x-2 rtl:space-x-reverse items-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Go</span>
              <span>
                <input
                  type="number"
                  className="form-control py-2"
                  defaultValue={currentPageIndex + 1}
                  onChange={(e) => {
                    const pageNumber = e.target.value ? Number(e.target.value) - 1 : 0;
                    handlePageChange(pageNumber);
                  }}
                  style={{ width: "50px" }}
                />
              </span>
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Page <span>{currentPageIndex + 1} of {pageOptions.length}</span>
            </span>
          </div>

          <Pagination
            count={pageOptions.length} // The number of pages
            page={currentPageIndex + 1} // Pass 1-based page number to Pagination
            color="primary"
            onChange={(event, value) => handlePageChange(value - 1)} // Update 0-based page index in state
            renderItem={(item) => (
              <PaginationItem
                slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                {...item}
              />
            )}
            className="flex items-center space-x-3 rtl:space-x-reverse"
          />

          <div className="flex items-center space-x-3/> rtl:space-x-reverse">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Show</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="form-select py-2"
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
    </>
  );
};

export default Attendence;
