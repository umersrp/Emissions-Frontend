import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const EditCompanyProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [countries, setCountries] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFields, setShowFields] = useState({
        showCalendar: false,
        showFiscal: false,
        showCustom: false,
    });

    const [formData, setFormData] = useState({
        companyName: "",
        reportingYear: "",
        boundary: "",
        country: "",
        province: "",
        baseyear: false,
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

    const [errors, setErrors] = useState({});

    //  Fetch dropdown data
    // useEffect(() => {
    //     const fetchDropdowns = async () => {
    //         try {
    //             const [countryRes, currencyRes, sectorRes] = await Promise.all([
    //                 axios.get("https://restcountries.com/v3.1/all?fields=name"),
    //                 axios.get("https://open.er-api.com/v6/latest/USD"),
    //                 axios.get(`${process.env.REACT_APP_BASE_URL}/sector/Get-All`, {
    //                     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    //                 }),
    //             ]);

    //             const countryList = countryRes.data.map((c) => c.name.common).sort();
    //             setCountries(countryList);

    //             const currencyList = Object.entries(currencyRes.data.rates).map(([code, rate]) => ({
    //                 code,
    //                 rate,
    //             }));
    //             setCurrencies(currencyList);

    //             setSectors(sectorRes.data.data || []);
    //         } catch (error) {
    //             console.error("Dropdown data error:", error);
    //             toast.error("Failed to load dropdown data");
    //         }
    //     };
    //     fetchDropdowns();
    // }, []);

    //  Fetch industries when sectorId changes
    // useEffect(() => {
    //     if (!formData.sectorId) return;
    //     const fetchIndustries = async () => {
    //         try {
    //             const response = await axios.get(
    //                 `${process.env.REACT_APP_BASE_URL}/industry/get-All-Industry`,
    //                 {
    //                     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    //                     params: { sectorId: formData.sectorId, page: 1, limit: 100 },
    //                 }
    //             );
    //             setIndustries(response.data.data || []);
    //         } catch (error) {
    //             console.error("Industry fetch failed:", error);
    //             toast.error("Failed to load industries");
    //         }
    //     };
    //     fetchIndustries();
    // }, [formData.sectorId]);

    //  Fetch existing company data
    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/company/company-profile/${id}`,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    }
                );
                setFormData(res.data.data);
            } catch (error) {
                console.error("Error loading company:", error);
                toast.error("Failed to load company profile");
            }
        };

        fetchCompany();
    }, [id]);

    // Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setShowFields((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validate = () => {
        const errors = {};
        if (!formData.companyName) errors.companyName = "Company name is required";
        if (!formData.reportingYear) errors.reportingYear = "Reporting year is required";
        if (!formData.country) errors.country = "Country is required";
        if (!formData.currency) errors.currency = "Currency is required";
        // if (!formData.sectorId) errors.sectorId = "Sector is required";
        // if (!formData.industryId) errors.industryId = "Industry is required";
        return errors;
    };

    //  Submit (Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            await axios.put(
                `${process.env.REACT_APP_BASE_URL}/company/company-profile/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            toast.success("Company profile updated successfully!");
            navigate("/Company");
        } catch (error) {
            console.error("Update failed:", error);
            toast.error(error.response?.data?.message || "Failed to update company profile");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate("/Company");

    return (
        <Card title="Edit Company Profile">
            <div className="w-full mx-auto p-6">
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
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className={`border-[3px] h-10 w-full mb-3 p-2 ${errors.country ? "border-red-500" : ""}`}
                        >
                            <option value="">Select Country</option>
                            {countries.map((country, index) => (
                                <option key={index} value={country}>{country}</option>
                            ))}
                        </select>
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
                            type="checkbox"
                            name="baseyear"
                            checked={formData.baseyear}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="mb-2">
                        <label className="flex items-center gap-2 font-medium">
                            <input
                                type="checkbox"
                                name="showCalendar"
                                checked={showFields.showCalendar}
                                onChange={handleCheckboxChange}
                            />
                            Show Calendar Year
                        </label>
                    </div>

                    {/* Fiscal Year Checkbox */}
                    <div className="mb-2">
                        <label className="flex items-center gap-2 font-medium">
                            <input
                                type="checkbox"
                                name="showFiscal"
                                checked={showFields.showFiscal}
                                onChange={handleCheckboxChange}
                            />
                            Show Fiscal Year
                        </label>
                    </div>

                    {/* Custom Year Checkbox */}
                    <div className="mb-4">
                        <label className="flex items-center gap-2 font-medium">
                            <input
                                type="checkbox"
                                name="showCustom"
                                checked={showFields.showCustom}
                                onChange={handleCheckboxChange}
                            />
                            Show Custom Year
                        </label>
                    </div>

                    {/* Calendar Year Input */}
                    {showFields.showCalendar && (
                        <div className="mb-4">
                            <label className="block font-semibold mb-1">Calendar Year</label>
                            <select
                                name="Calendaryear"
                                value={formData.Calendaryear}
                                onChange={handleInputChange}
                                className="border-[3px] h-10 w-full mb-3 p-2"
                            >
                                <option value="">Select Year</option>
                                {Array.from({ length: 50 }, (_, i) => {
                                    const year = 2000 + i;
                                    return (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    {/* Fiscal Year Input */}
                    {showFields.showFiscal && (
                        <div className="mb-4">
                            <label className="block font-semibold mb-1">Fiscal Year</label>
                            <input
                                type="date"
                                name="fiscalyear"
                                value={formData.fiscalyear ? formData.fiscalyear.split("T")[0] : ""}
                                onChange={handleInputChange}
                                className="border-[3px] h-10 w-full mb-3 p-2"
                                placeholder="Enter fiscal year"
                            />
                        </div>
                    )}

                    {/* Custom Year Input */}
                    {showFields.showCustom && (
                        <div className="mb-4">
                            <label className="block font-semibold mb-1">Custom Year</label>
                            <input
                                type="date"
                                name="customyear"
                                value={formData.customyear ? formData.customyear.split("T")[0] : ""}
                                onChange={handleInputChange}
                                className="border-[3px] h-10 w-full mb-3 p-2"
                                placeholder="Enter custom year"
                            />
                        </div>
                    )}

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

                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className={`border-[3px] h-10 w-full mb-3 p-2 ${errors.currency ? "border-red-500" : ""
                                }`}
                        >
                            <option value="">Select Currency</option>
                            {currencies.map((item) => (
                                <option key={item.code} value={item.code}>
                                    {item.code} - {item.rate.toFixed(2)}
                                </option>
                            ))}
                        </select>

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
                    {/* <div className="mb-4">
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
                    </div> */}

                    {/* Industry Dropdown */}
                    {/* <div className="mb-4">
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
                    </div> */}

                    {/* Submit Button */}
                </form>
            </div>

            <div className="text-right space-x-3">
                <button className="btn btn-light" onClick={handleCancel} type="button">
                    Cancel
                </button>
                <Button text="Update" className="btn-dark" onClick={handleSubmit} isLoading={loading} />
            </div>
        </Card>
    );
};

export default EditCompanyProfile;
