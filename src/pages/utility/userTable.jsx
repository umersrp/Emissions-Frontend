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
import Tippy from "@tippyjs/react";

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

const UserPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true); // Loading state


  const fetchData = async (pageIndex, pageSize) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/auth/GetCompanyUsers`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params: {
            page: pageIndex + 1,
            limit: pageSize,
          },
        }
      );

      console.log("API RESPONSE:", response.data);

      // ✅ FIX HERE
      setUserData(response.data.data.users || []);
      setTotal(response.data.pagination?.total || 0);
      setHasNextPage(response.data.pagination?.hasNextPage || false);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData(pageIndex, pageSize);
  }, [pageIndex, pageSize]);

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




  const handleChangeStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/admin/user/change-status/${id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setUserData(prevUsers =>
          prevUsers.map(user =>
            user._id === id ? { ...user, status: newStatus } : user
          )
        );
        toast.success("User status updated");
      } else {
        console.error('Failed to update user status');
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Error updating user status');
    }
  };


  const actions = [
    {
      name: "edit",
      icon: "heroicons:pencil-square",
      doit: (id) => {
        navigate(`/Customer-edit?id=${id}`);
      },
    },
    {
      name: "delete",
      icon: "heroicons-outline:trash",
      doit: (id) => {
        handleDelete(id);
      },
    },
    {
      name: "view",
      icon: "heroicons-outline:eye",
      doit: (id) => {
        navigate(`/customer-view?id=${id}`);
      },
    },
    {
      name: "change status",
      icon: "heroicons-outline:refresh",
      doit: (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        handleChangeStatus(id, newStatus);
      },
    },
  ];

  const COLUMNS = [
    {
      Header: "Sr.No",
      accessor: "id",
      Cell: ({ row, flatRows }) => <span>{flatRows.indexOf(row) + 1}</span>,
    },
    {
      Header: "Username",
      accessor: "username",
      Cell: (row) => <span>{row?.cell?.value}</span>,
    },
    {
      Header: "Type",
      accessor: "type",
      Cell: (row) => <span>{row?.cell?.value}</span>,
    },
    {
      Header: "Name",
      accessor: "name",
      Cell: (row) => <span>{row?.cell?.value}</span>,
    },
    {
      Header: "Email",
      accessor: "email",
      Cell: (row) => <span className="lowercase">{row?.cell?.value}</span>,
    },
    {
      Header: "Active",
      accessor: "isActive",
      Cell: (row) => (
        <span className={`inline-block px-3 py-1 rounded-[999px] text-center ${row?.cell?.value ? "bg-success-500 text-white" : "bg-warning-500 text-white"
          }`}>
          {row?.cell?.value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      Header: "Email Verified",
      accessor: "isEmailValid",
      Cell: (row) => (
        <span className={`inline-block px-3 py-1 rounded-[999px] text-center ${row?.cell?.value ? "bg-success-500 text-white" : "bg-warning-500 text-white"
          }`}>
          {row?.cell?.value ? "Verified" : "Not Verified"}
        </span>
      ),
    },
    {
      Header: "Company",
      accessor: "companyId.companyName",
      Cell: (row) => <span>{row?.cell?.value || "-"}</span>,
    },
    // {
    //   Header: "Company Email",
    //   accessor: "companyId.email",
    //   Cell: (row) => <span>{row?.cell?.value || "-"}</span>,
    // },
    // {
    //   Header: "Image",
    //   accessor: "image",
    //   Cell: (row) => (
    //     row?.cell?.value ? (
    //       <img src={row.cell.value} alt="user" className="h-8 w-8 rounded-full" />
    //     ) : (
    //       <span>No Image</span>
    //     )
    //   ),
    // },
    {
      Header: "Created At",
      accessor: "createdAt",
      Cell: (row) => <span>{new Date(row?.cell?.value).toLocaleString()}</span>,
    },
    {
      Header: "Updated At",
      accessor: "updatedAt",
      Cell: (row) => <span>{new Date(row?.cell?.value).toLocaleString()}</span>,
    },
    {
      Header: "Version",
      accessor: "__v",
      Cell: (row) => <span>{row?.cell?.value}</span>,
    },
    // {
    //   Header: "Action",
    //   accessor: "action",
    //   Cell: (row) => {
    //     const userStatus = row.cell.row.original.isActive ? 'active' : 'inactive';
    //     const userId = row.cell.row.original._id;

    //     return (
    //       <div>
    //         <Dropdown
    //           classMenuItems="right-0 w-[140px] top-[110%]"
    //           label={
    //             <span className="text-xl text-center block w-full">
    //               <Icon icon="heroicons-outline:dots-vertical" />
    //             </span>
    //           }
    //         >
    //           <div className="divide-y divide-slate-100 dark:divide-slate-800">
    //             {actions.map((item, i) => (
    //               <Menu.Item key={i}>
    //                 <div
    //                   className={`${item.name === "delete"
    //                     ? "bg-danger-500 text-danger-500 bg-opacity-30 hover:bg-opacity-100 hover:text-white"
    //                     : "hover:bg-slate-900 hover:text-white dark:hover:bg-slate-600 dark:hover:bg-opacity-50"
    //                     } w-full border-b border-b-gray-500 border-opacity-10 px-4 py-2 text-sm last:mb-0 cursor-pointer first:rounded-t last:rounded-b flex space-x-2 items-center rtl:space-x-reverse`}
    //                   onClick={() => item.name === 'change status'
    //                     ? item.doit(userId, userStatus)
    //                     : item.doit(userId)
    //                   }
    //                 >
    //                   <span className="text-base">
    //                     <Icon icon={item.icon} />
    //                   </span>
    //                   <span>{item.name === 'change status' ? (userStatus === 'active' ? 'inactive' : 'active') : item.name}</span>
    //                 </div>
    //               </Menu.Item>
    //             ))}
    //           </div>
    //         </Dropdown>
    //       </div>
    //     );
    //   },
    // },
    {
      Header: "action",
      accessor: "_id",
      Cell: ({ cell }) => (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tippy content="View">

            <button className="action-btn" onClick={() => navigate(`/Employee-View/${cell.value}`)}>
              <Icon className="text-green-600" icon="heroicons:eye" />
            </button>
          </Tippy>
          <Tippy content="Edit">

            <button className="action-btn" onClick={() => navigate(`/Employee-edit/${cell.value}`)}>
              <Icon className="text-blue-600" icon="heroicons:pencil-square" />
            </button>
          </Tippy>

          {/* <Tippy content="Delete">
            <button className="action-btn" onClick={() => handleDelete(cell.value)}>
              <Icon className="text-red-700" icon="heroicons:trash" />
            </button>
          </Tippy> */}
        </div>
      ),
    },
  ];


  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => userData, [userData]);

  const tableInstance = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount: Math.ceil(total / pageSize),
      initialState: {
        pageIndex,
        pageSize,
      },
    },
    useGlobalFilter,
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
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
    pageOptions, // ✅ add this
    canPreviousPage,
    pageCount: totalPages, // ✅ add this
    rows,               // ⬅ use rows instead of page
    state,
    gotoPage,
    setGlobalFilter,
    prepareRow,
  } = tableInstance;

  const { globalFilter, pageIndex: currentPageIndex, pageSize: currentPageSize } = state;


  const handlePageChange = (pageIndex) => {
    gotoPage(pageIndex);
    setPageIndex(pageIndex);
  };

  const handlePageSizeChange = (pageSize) => {
    setPageSize(pageSize);
    setPageIndex(0); // Reset to first page whenever page size changes
  };
  if (loading) {
    return <div>Loading Customer...</div>; // Show loading indicator
  }

  return (
    <>
      <Card noborder>
        <div className="md:flex pb-6 items-center">
          <h6 className="flex-1 md:mb-0 ">Employee</h6>
          <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
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
            <Button
              icon="heroicons:plus"
              text="Add Employee"
              className="btn-dark font-normal btn-sm"
              iconClass="text-lg"
              onClick={() => {
                navigate("/Employee-add");
              }}
            />
          </div>
        </div>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                {...getTableProps()}
              >
                <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] dark:bg-slate-700">
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
                  {rows.map((row) => {
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
              Page <span>{currentPageIndex + 1} of {pageOptions?.length || 1}</span>
            </span>
          </div>
          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => handlePageChange(0)}
                disabled={!canPreviousPage}
              >
                <Icons icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>
            <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => handlePageChange(currentPageIndex - 1)}
                disabled={!canPreviousPage}
              >
                Prev
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, pageIdx) => (
              <li key={pageIdx}>
                <button
                  className={`${pageIdx === pageIndex
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-900"
                    } text-sm rounded h-6 w-6 flex items-center justify-center`}
                  onClick={() => handlePageChange(pageIdx)}
                >
                  {pageIdx + 1}
                </button>
              </li>
            ))}

            <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${!hasNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => handlePageChange(currentPageIndex + 1)}
                disabled={!hasNextPage}
              >
                Next
              </button>
            </li>
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                onClick={() => handlePageChange(Math.ceil(total / pageSize) - 1)}
                disabled={!hasNextPage}
                className={`${!hasNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Show</span>
            <select
              value={currentPageSize}
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

export default UserPage;
