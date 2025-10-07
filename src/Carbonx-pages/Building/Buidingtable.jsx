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

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
});

const BuildingTable = () => {
    const navigate = useNavigate();
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [pageCount, setPageCount] = useState(0);
    const [globalFilterValue, setGlobalFilterValue] = useState("");

    // Fetch building data
    const fetchBuildings = async (search = "") => {
        setLoading(true);
        try {
            const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/building/Get-All-Buildings`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                params: { page: pageIndex + 1, limit: pageSize, search },
            });

            const data = res.data.data?.buildings || [];
            const pagination = res.data.data?.pagination || {};
            setBuildings(data);
            setPageCount(pagination.totalPages || 1);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch buildings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchBuildings(globalFilterValue);
        }, 400);
        return () => clearTimeout(delay);
    }, [globalFilterValue, pageIndex, pageSize]);

    // Handle delete
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/building/building/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            toast.success("Building deleted successfully");
            fetchBuildings();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete building");
        }
    };

    // Table Columns
    const COLUMNS = useMemo(
        () => [
            {
                Header: "Sr No",
                id: "serialNo",
                Cell: ({ row }) => <span>{row.index + 1 + pageIndex * pageSize}</span>,
            },
            { Header: "Name", accessor: "buildingName" },
            { Header: "Country", accessor: "country" },
            { Header: "Location", accessor: "buildingLocation" },
            { Header: "Type", accessor: "buildingType" },
            { Header: "Area (m²)", accessor: "buildingArea" },
            { Header: "Employees", accessor: "numberOfEmployees" },
            { Header: "Cooling Type", accessor: "coolingType" },
            {
                Header: "Cooling Used",
                accessor: "coolingUsed",
                Cell: ({ cell }) => (cell.value ? "Yes" : "No"),
            },
            { Header: "Electricity Consumption", accessor: "electricityConsumption" },
            { Header: "Heating Type", accessor: "heatingType" },
            {
                Header: "Heating Used",
                accessor: "heatingUsed",
                Cell: ({ cell }) => (cell.value ? "Yes" : "No"),
            },
            { Header: "Opening Time", accessor: "operatingHours.opening" },
            { Header: "Closing Time", accessor: "operatingHours.closing" },
            {
                Header: "Created By",
                accessor: "createdBy.email",
                Cell: ({ cell }) => cell.value || "-",
            },
            {
                Header: "Created At",
                accessor: "createdAt",
                Cell: ({ cell }) =>
                    cell.value ? new Date(cell.value).toLocaleDateString() : "-",
            },
            {
                Header: "Updated At",
                accessor: "updatedAt",
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
                                    navigate(`/Building-Form/${cell.value}`, { state: { mode: "view" } })
                                }
                            >
                                <Icon icon="heroicons:eye" className="text-green-600" />
                            </button>
                        </Tippy>
                        <Tippy content="Edit">
                            <button
                                className="action-btn"
                                onClick={() =>
                                    navigate(`/Building-Form/${cell.value}`, { state: { mode: "edit" } })
                                }
                            >
                                <Icon icon="heroicons:pencil-square" className="text-blue-600" />
                            </button>
                        </Tippy>
                        <Tippy content="Delete">
                            <button className="action-btn" onClick={() => handleDelete(cell.value)}>
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
    const data = useMemo(() => buildings, [buildings]);

    const tableInstance = useTable(
        {
            columns,
            data,
            manualPagination: true,
            pageCount,
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
        gotoPage,
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
        pageOptions,
        state,
    } = tableInstance;

    const { pageIndex: currentPageIndex } = state;

    return (
        <Card noborder>
            <div className="md:flex pb-6 items-center">
                <h6 className="flex-1 md:mb-0 mb-3">Buildings</h6>
                <div className="md:flex md:space-x-3 items-center flex-none rtl:space-x-reverse">
                    <GlobalFilter filter={globalFilterValue} setFilter={setGlobalFilterValue} />
                    <Button
                        icon="heroicons-outline:plus-sm"
                        text="Add Building"
                        className="btn font-normal btn-sm bg-gradient-to-r from-[#3AB89D] to-[#3A90B8] text-white border-0 hover:opacity-90"
                        iconClass="text-lg"
                        onClick={() => navigate("/Building-Form/Add")}
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
                            <table
                                className="min-w-full divide-y divide-slate-100 table-fixed"
                                {...getTableProps()}
                            >
                                <thead className="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]">
                                    {headerGroups.map((headerGroup, index) => (
                                        <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                                            {headerGroup.headers.map((column) => (
                                                <th
                                                    {...column.getHeaderProps(column.getSortByToggleProps())}
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
                                                <tr {...row.getRowProps()} className="even:bg-gray-50">
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
            <div className="md:flex justify-between items-center mt-6">
                <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-slate-600">
                        Page <span>{currentPageIndex + 1} of {pageOptions.length}</span>
                    </span>
                </div>
                <ul className="flex items-center space-x-3">
                    <li>
                        <button
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                            className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            Prev
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                            className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            Next
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
                        {[10, 20, 30, 50].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </Card>
    );
};

export default BuildingTable;
