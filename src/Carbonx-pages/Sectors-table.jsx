// import React from 'react'

// function Discounttable() {
//   return (
//     <div>Discount-table</div>
//   )
// }

// export default Discounttable


import React, { useState, useMemo, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logo/SrpLogo.png"

import Tippy from '@tippyjs/react';

import {
    useTable,
    useRowSelect,
    useSortBy,
    useGlobalFilter,
    usePagination,
} from "react-table";
import { Menu } from "@headlessui/react";
import { useSelector } from "react-redux";
import Icons from "@/components/ui/Icon";
import Header from "@/components/partials/header";
import GlobalFilter from "@/pages/table/react-tables/GlobalFilter";

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



const SectorTable = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const user = useSelector((state) => state.auth.user);


    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/sector/Get-All`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: {
                    page: pageIndex + 1,
                    limit: pageSize,
                },
            });

            await new Promise(resolve => setTimeout(resolve, 600)); // Add small delay


            setUserData(response.data.data);
            setTotalPages(response.data.meta?.totalPages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pageIndex, pageSize]);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/sector/Delete/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            toast.success("Sector deleted successfully");
            fetchData(pageIndex, pageSize);
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete Sector");
        }
    };
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
            accessor: "name",
            Cell: (row) => <span>{row?.cell?.value}</span>,
        },
        {
            Header: "description",
            accessor: "description"
        },
        {
            Header: "updatedBy",
            accessor: "updatedBy.name",
            Cell: (row) => <span>{row?.cell?.value}</span>,
        },
        {
            Header: "createdBy",
            accessor: "createdBy.name",
            Cell: (row) => <span>{row?.cell?.value}</span>,
        },
        {
            Header: "createdAt",
            accessor: "createdAt",
            Cell: (row) => <span>{new Date(row?.cell?.value).toLocaleDateString()}</span>,
        },
        {
            Header: "updatedBy",
            accessor: "updatedAt",
            Cell: (row) => <span>{new Date(row?.cell?.value).toLocaleDateString()}</span>,
        },
        {
            Header: "action",
            accessor: "_id",
            Cell: ({ cell }) => (
                <div className="flex space-x-3 rtl:space-x-reverse">
                    <Tippy content="View">

                        <button className="action-btn" onClick={() => navigate(`/Sector-View/${cell.value}`)}>
                            <Icon className="text-green-600" icon="heroicons:eye" />
                        </button>
                    </Tippy>
                    <Tippy content="Edit">

                        <button className="action-btn" onClick={() => navigate(`/Add-Sector-Edit/${cell.value}`)}>
                            <Icon className="text-blue-600" icon="heroicons:pencil-square" />
                        </button>
                    </Tippy>

                    <Tippy content="Delete">
                        <button className="action-btn" onClick={() => handleDelete(cell.value)}>
                            <Icon className="text-red-700" icon="heroicons:trash" />
                        </button>
                    </Tippy>
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
        canNextPage,
        canPreviousPage,
        pageOptions,
        state,
        gotoPage,
        pageCount: controlledPageCount,
        setGlobalFilter,
        prepareRow,
    } = tableInstance;

    const { globalFilter, pageIndex: currentPageIndex } = state;
    const handlePageChange = (pageIndex) => {
        gotoPage(pageIndex);
        setPageIndex(pageIndex);
    };

    const handlePageSizeChange = (pageSize) => {
        setPageSize(pageSize);
    };

    return (
        <>
            <Card noborder>
                <div className="md:flex pb-6 items-center">
                    <h6 className="flex-1 md:mb-0 mb-3">Sector</h6>
                    <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
                        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />

                        <Button
                            icon="heroicons-outline:plus-sm"
                            text="Add Sector"
                            className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
                            iconClass="text-lg"
                            onClick={() => {
                                navigate("/Add-Sector-Form");
                            }}
                        />

                    </div>
                </div>
                <div className="overflow-x-auto -mx-6">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden">
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <img src={Logo} alt="Loading..." className="w-52 h-24" />
                                </div>) : (
                                <table
                                    className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
                                    {...getTableProps()}
                                >
                                    <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] dark:bg-slate-700">
                                        {headerGroups.map((headerGroup, index) => (
                                            <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                                                {headerGroup.headers.map((column) => (
                                                    <th
                                                        {...column.getHeaderProps(column.getSortByToggleProps())}
                                                        scope="col"
                                                        className="table-th text-white"
                                                        key={column.id}
                                                    >
                                                        {column.render("Header")}
                                                        <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
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
                                                    <tr {...row.getRowProps()} className="even:bg-gray-50 dark:even:bg-slate-800">
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
                    <ul className="flex items-center  space-x-3  rtl:space-x-reverse">
                        <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
                            <button
                                className={` ${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                onClick={() => gotoPage(0)}
                                disabled={!canPreviousPage}
                            >
                                <Icons icon="heroicons:chevron-double-left-solid" />
                            </button>
                        </li>
                        <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
                            <button
                                className={` ${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                onClick={() => previousPage()}
                                disabled={!canPreviousPage}
                            >
                                Prev
                            </button>
                        </li>
                        {pageOptions.map((page, pageIdx) => (
                            <li key={pageIdx}>
                                <button
                                    href="#"
                                    aria-current="page"
                                    className={` ${pageIdx === pageIndex
                                        ? "bg-slate-900 dark:bg-slate-600  dark:text-slate-200 text-white font-medium "
                                        : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900  font-normal  "
                                        }    text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                                    onClick={() => gotoPage(pageIdx)}
                                >
                                    {page + 1}
                                </button>
                            </li>
                        ))}
                        <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
                            <button
                                className={` ${!canNextPage ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                onClick={() => nextPage()}
                                disabled={!canNextPage}
                            >
                                Next
                            </button>
                        </li>
                        <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
                            <button
                                onClick={() => gotoPage(pageCount - 1)}
                                disabled={!canNextPage}
                                className={` ${!canNextPage ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                            >
                                <Icon icon="heroicons:chevron-double-right-solid" />
                            </button>
                        </li>
                    </ul>
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
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

export default SectorTable;
