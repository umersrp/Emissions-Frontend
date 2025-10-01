import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const CompanyProfileForm = () => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        companyName: "",
        reportingYear: "",
        boundary: "",
        country: "",
        province: "",
        baseyear: "",
        Calendaryear: "",
        fiscalyear: "",
        customyear: "",
        address: "",
        totalEmployees: "",
        currency: "",
        headquarterLocation: "",
        totalSites: "",
        totalAreaSqM: "",
        unitsManufacturedPerMonth: "",
        unitsManufacturedPerAnnum: "",
        productionVolumeTonnePerAnnum: "",
        unitsSoldPerAnnum: "",
        electricityGeneratedMWhPerAnnum: "",
        energyGeneratedGJPerAnnum: "",
        revenuePerAnnum: "",
        totalManHoursPerAnnum: "",
        sectorId: "",
        industryId: "",
    });

    // Dropdown options
    const [sectors, setSectors] = useState([]);
    const [industries, setIndustries] = useState([]);

    // Loading state
    const [loading, setLoading] = useState(false);

    // Fetch sectors on mount
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
                console.error("Failed to fetch sectors", error);
                toast.error("Failed to load sectors");
            }
        };
        fetchSectors();
    }, []);

    // Fetch industries when sectorId changes
    useEffect(() => {
        if (!formData.sectorId) {
            setIndustries([]);
            setFormData(prev => ({ ...prev, industryId: "" }));
            return;
        }

        const fetchIndustries = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/industry/get-All-Industry`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        params: { sectorId: formData.sectorId, page: 1, limit: 100 }, // example

                    }
                );
                setIndustries(response.data.data || []);
            } catch (error) {
                console.error("Failed to fetch industries", error);
                toast.error("Failed to load industries");
            }
        };

        fetchIndustries();
    }, [formData.sectorId]);

    // Simple validation before submit
    const validate = () => {
        const errors = {};
        if (!formData.companyName) errors.companyName = "Company name is required";
        if (!formData.reportingYear) errors.reportingYear = "Reporting year is required";
        if (!formData.boundary) errors.boundary = "Boundary is required";
        if (!formData.country) errors.country = "Country is required";
        if (!formData.totalEmployees) errors.totalEmployees = "Total employees is required";
        if (!formData.currency) errors.currency = "Currency is required";
        if (!formData.sectorId) errors.sectorId = "Sector is required";
        if (!formData.industryId) errors.industryId = "Industry is required";
        return errors;
    };

    const [errors, setErrors] = useState({});

    // Submit form handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/company/company-profile`, // Adjust endpoint if needed
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            toast.success("Company profile created successfully!");
            navigate("/some-route"); // Redirect after success
        } catch (error) {
            console.error("Failed to create company profile", error);
            toast.error(error.response?.data?.message || "Failed to create company profile");
        } finally {
            setLoading(false);
        }
    };

    // Controlled input change handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({ ...prev, [name]: null }));
    };
    const handleCancel = () => {
        navigate("/Industry");
    };

    return (
        <Card title="Create Company Profile">

            <div className="w-full mx-auto p-6">
                {/* <h2 className="text-2xl font-bold mb-6">Create Company Profile</h2> */}
                <form className="lg:grid-cols-3 grid gap-8 grid-cols-1">

                    {/* Company Name */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Company Name *</label>
                        <input
                            type="text"
                            name="companyName"

                            value={formData.companyName}
                            onChange={handleChange}
                            className={`input ${errors.companyName ? "border-red-500" : "border-[3px] h-10 w-[100%] mb-3 p-2"}`}

                            placeholder="Enter company name"
                        />
                        {errors.companyName && <p className="text-red-500">{errors.companyName}</p>}
                    </div>

                    {/* Reporting Year */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Reporting Year *</label>
                        <input
                            type="number"
                            name="reportingYear"
                            value={formData.reportingYear}
                            onChange={handleChange}
                            className={`input ${errors.reportingYear ? "border-red-500" : "border-[3px] h-10 w-[100%] mb-3 p-2"}`}
                            placeholder="Enter reporting year"
                        />
                        {errors.reportingYear && <p className="text-red-500">{errors.reportingYear}</p>}
                    </div>

                    {/* Boundary */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Boundary *</label>
                        <input
                            type="text"
                            name="boundary"
                            value={formData.boundary}
                            onChange={handleChange}
                            className={`input ${errors.boundary ? "border-red-500" : "border-[3px] h-10 w-[100%] mb-3 p-2"}`}
                            placeholder="Enter boundary"
                        />
                        {errors.boundary && <p className="text-red-500">{errors.boundary}</p>}
                    </div>

                    {/* Country */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Country *</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className={`input ${errors.country ? "border-red-500" : "border-[3px] h-10 w-[100%] mb-3 p-2"}`}
                            placeholder="Enter country"
                        />
                        {errors.country && <p className="text-red-500">{errors.country}</p>}
                    </div>

                    {/* Province */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Province</label>
                        <input
                            type="text"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter province"
                        />
                    </div>

                    {/* Base Year */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Base Year</label>
                        <input
                            type="date"
                            name="baseyear"
                            value={formData.baseyear}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter base year"
                        />
                    </div>

                    {/* Calendar Year */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Calendar Year</label>
                        <input
                            type="date"
                            name="Calendaryear"
                            value={formData.Calendaryear}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter calendar year"
                        />
                    </div>

                    {/* Fiscal Year */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Fiscal Year</label>
                        <input
                            type="date"
                            name="fiscalyear"
                            value={formData.fiscalyear}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter fiscal year"
                        />
                    </div>

                    {/* Custom Year */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Custom Year</label>
                        <input
                            type="date"
                            name="customyear"
                            value={formData.customyear}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter custom year"
                        />
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter address"
                        />
                    </div>

                    {/* Total Employees */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Total Employees *</label>
                        <input
                            type="number"
                            name="totalEmployees"
                            value={formData.totalEmployees}
                            onChange={handleChange}
                            className={`input ${errors.totalEmployees ? "border-red-500" : "border-[3px] h-10 w-[100%] mb-3 p-2"}`}
                            placeholder="Enter total employees"
                        />
                        {errors.totalEmployees && <p className="text-red-500">{errors.totalEmployees}</p>}
                    </div>

                    {/* Currency */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Currency *</label>
                        <input
                            type="text"
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className={`input ${errors.currency ? "border-red-500" : "border-[3px] h-10 w-[100%] mb-3 p-2"}`}
                            placeholder="Enter currency"
                        />
                        {errors.currency && <p className="text-red-500">{errors.currency}</p>}
                    </div>

                    {/* Headquarter Location */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Headquarter Location</label>
                        <input
                            type="text"
                            name="headquarterLocation"
                            value={formData.headquarterLocation}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter headquarter location"
                        />
                    </div>

                    {/* Total Sites */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Total Sites</label>
                        <input
                            type="number"
                            name="totalSites"
                            value={formData.totalSites}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter total sites"
                        />
                    </div>

                    {/* Total Area Sq M */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Total Area (Sq M)</label>
                        <input
                            type="number"
                            name="totalAreaSqM"
                            value={formData.totalAreaSqM}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter total area in square meters"
                        />
                    </div>

                    {/* Units Manufactured Per Month */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Units Manufactured Per Month</label>
                        <input
                            type="number"
                            name="unitsManufacturedPerMonth"
                            value={formData.unitsManufacturedPerMonth}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter units manufactured per month"
                        />
                    </div>

                    {/* Units Manufactured Per Annum */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Units Manufactured Per Annum</label>
                        <input
                            type="number"
                            name="unitsManufacturedPerAnnum"
                            value={formData.unitsManufacturedPerAnnum}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter units manufactured per annum"
                        />
                    </div>

                    {/* Production Volume Tonne Per Annum */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Production Volume (Tonne Per Annum)</label>
                        <input
                            type="number"
                            name="productionVolumeTonnePerAnnum"
                            value={formData.productionVolumeTonnePerAnnum}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter production volume in tonnes per annum"
                        />
                    </div>

                    {/* Units Sold Per Annum */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Units Sold Per Annum</label>
                        <input
                            type="number"
                            name="unitsSoldPerAnnum"
                            value={formData.unitsSoldPerAnnum}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter units sold per annum"
                        />
                    </div>

                    {/* Electricity Generated MWh Per Annum */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Electricity Generated (MWh Per Annum)</label>
                        <input
                            type="number"
                            name="electricityGeneratedMWhPerAnnum"
                            value={formData.electricityGeneratedMWhPerAnnum}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter electricity generated in MWh per annum"
                        />
                    </div>

                    {/* Energy Generated GJ Per Annum */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Energy Generated (GJ Per Annum)</label>
                        <input
                            type="number"
                            name="energyGeneratedGJPerAnnum"
                            value={formData.energyGeneratedGJPerAnnum}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter energy generated in GJ per annum"
                        />
                    </div>

                    {/* Revenue Per Annum */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Revenue Per Annum</label>
                        <input
                            type="number"
                            name="revenuePerAnnum"
                            value={formData.revenuePerAnnum}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter revenue per annum"
                        />
                    </div>

                    {/* Total Man Hours Per Annum */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Total Man Hours Per Annum</label>
                        <input
                            type="number"
                            name="totalManHoursPerAnnum"
                            value={formData.totalManHoursPerAnnum}
                            onChange={handleChange}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            placeholder="Enter total man hours per annum"
                        />
                    </div>

                    {/* Sector Dropdown */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Sector *</label>
                        <select
                            value={formData.sectorId}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            onChange={(e) =>
                                setFormData({ ...formData, sectorId: e.target.value, industryId: "" })
                            }
                        >
                            <option value="">Select Sector</option>
                            {sectors.map((sector) => (
                                <option key={sector._id} value={sector._id}>
                                    {sector.name}
                                </option>
                            ))}
                        </select>
                        {errors.sectorId && <p className="text-red-500">{errors.sectorId}</p>}
                    </div>

                    {/* Industry Dropdown */}
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">Industry *</label>
                        <select
                            value={formData.industryId}
                            className="border-[3px] h-10 w-[100%] mb-3 p-2"
                            onChange={(e) => setFormData({ ...formData, industryId: e.target.value })}
                            disabled={!formData.sectorId || industries.length === 0}
                        >
                            <option value="">Select Industry</option>
                            {industries.map((industry) => (
                                <option key={industry._id} value={industry._id}>
                                    {industry.name}
                                </option>
                            ))}
                        </select>
                        {errors.industryId && <p className="text-red-500">{errors.industryId}</p>}
                    </div>

                    {/* Submit Button */}
                </form>
            </div>
            <div className="ltr:text-right rtl:text-left space-x-3 rtl:space-x-reverse">
                <button
                    className="btn btn-light text-center"
                    onClick={handleCancel}
                    type="button"
                >
                    Cancel
                </button>
                <Button
                    text="Save"
                    className="btn-dark"
                    onClick={handleSubmit}
                    isLoading={loading}
                />
            </div>
        </Card>
    );
};

export default CompanyProfileForm;
