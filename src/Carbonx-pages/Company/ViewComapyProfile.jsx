import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const ViewCompanyProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [company, setCompany] = useState(null);
    const [sectors, setSectors] = useState([]);
    const [industries, setIndustries] = useState([]);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/company/company-profile/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setCompany(response.data.data);
            } catch (error) {
                console.error("Failed to fetch company profile", error);
                toast.error("Failed to load company profile");
            }
        };
        fetchCompany();
    }, [id]);

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/sector/Get-All`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setSectors(response.data.data || []);
            } catch (error) {
                toast.error("Failed to load sectors");
            }
        };
        fetchSectors();
    }, []);

    useEffect(() => {
        const fetchIndustries = async () => {
            if (!company?.sectorId) return;
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/industry/get-All-Industry`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        params: { sectorId: company.sectorId, page: 1, limit: 100 },
                    }
                );
                setIndustries(response.data.data || []);
            } catch (error) {
                toast.error("Failed to load industries");
            }
        };
        fetchIndustries();
    }, [company?.sectorId]);

    const handleBack = () => navigate("/Company");

    if (!company)
        return (
            <div className="text-center py-10 text-gray-600 text-lg">
                Loading company details...
            </div>
        );

    const getSectorName = (id) =>
        sectors.find((s) => s._id === id)?.name || "N/A";
    const getIndustryName = (id) =>
        industries.find((i) => i._id === id)?.name || "N/A";

    return (
        <Card title="Company Profile Details">
            <div className="w-full mx-auto p-6">
                <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
                    {Object.entries({
                        "Company Name": company.companyName,
                        "Reporting Year": company.reportingYear,
                        Boundary: company.boundary,
                        Country: company.country,
                        Province: company.province,
                        "Base Year": company.baseyear,
                        "Calendar Year": company.Calendaryear,
                        "Fiscal Year": company.fiscalyear,
                        "Custom Year": company.customyear,
                        Address: company.address,
                        "Total Employees": company.totalEmployees,
                        Currency: company.currency,
                        "Headquarter Location": company.headquarterLocation,
                        "Total Sites": company.totalSites,
                        "Total Area (Sq M)": company.totalAreaSqM,
                        "Units Manufactured (Monthly)": company.unitsManufacturedPerMonth,
                        "Units Manufactured (Yearly)": company.unitsManufacturedPerAnnum,
                        "Production Volume (Tonne/Annum)": company.productionVolumeTonnePerAnnum,
                        "Units Sold Per Annum": company.unitsSoldPerAnnum,
                        "Electricity Generated (MWh/Annum)": company.electricityGeneratedMWhPerAnnum,
                        "Energy Generated (GJ/Annum)": company.energyGeneratedGJPerAnnum,
                        "Revenue Per Annum": company.revenuePerAnnum,
                        "Total Man Hours (Annum)": company.totalManHoursPerAnnum,
                        Sector: getSectorName(company.sectorId),
                        Industry: getIndustryName(company.industryId),
                    }).map(([label, value]) => {
                        // Handle date fields to show only YYYY-MM-DD
                        const isDateField =
                            label.includes("Year") && typeof value === "string" && value.includes("T");
                        const formattedValue = isDateField
                            ? new Date(value).toISOString().split("T")[0]
                            : value;

                        return (
                            <div key={label}>
                                <p className="font-semibold">{label}</p>
                                {label === "Base Year" ? (
                                    <input
                                        type="checkbox"
                                        checked={!!value}
                                        disabled
                                        className="w-5 h-5 cursor-not-allowed"
                                    />
                                ) : (
                                    // Show formatted or regular text
                                    <p className="border p-2 rounded bg-gray-50">{formattedValue || "N/A"}</p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-right">
                    <Button text="Back" className="btn-light" onClick={handleBack} />
                </div>
            </div>
        </Card>
    );
};

export default ViewCompanyProfile;
