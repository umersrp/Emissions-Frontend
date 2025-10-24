import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

const EditCompanyProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [countries, setCountries] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sectors, setSectors] = useState([]);        
    const [industries, setIndustries] = useState([]);

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

    //Fetch dropdown data
    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [countryRes, currencyRes, sectorRes] = await Promise.all([
                    axios.get("https://restcountries.com/v3.1/all?fields=name"),
                    axios.get("https://open.er-api.com/v6/latest/USD"),
                    axios.get(`${process.env.REACT_APP_BASE_URL}/sector/Get-All`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    }),
                ]);

                const countryList = countryRes.data.map((c) => c.name.common).sort();
                setCountries(countryList);

                const currencyList = Object.entries(currencyRes.data.rates).map(([code, rate]) => ({
                    code,
                    rate,
                }));
                setCurrencies(currencyList);

                setSectors(sectorRes.data.data || []);
            } catch (error) {
                console.error("Dropdown data error:", error);
                toast.error("Failed to load dropdown data");
            }
        };
        fetchDropdowns();
    }, []);

    //Fetch industries when sectorId changes
    useEffect(() => {
        if (!formData.sectorId) return;
        const fetchIndustries = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/industry/get-All-Industry`,
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                        params: { sectorId: formData.sectorId, page: 1, limit: 100 },
                    }
                );
                setIndustries(response.data.data || []);
            } catch (error) {
                console.error("Industry fetch failed:", error);
                toast.error("Failed to load industries");
            }
        };
        fetchIndustries();
    }, [formData.sectorId]);

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

    const validate = () => {
        const errors = {};
        if (!formData.companyName) errors.companyName = "Company name is required";
        if (!formData.reportingYear) errors.reportingYear = "Reporting year is required";
        if (!formData.country) errors.country = "Country is required";
        if (!formData.currency) errors.currency = "Currency is required";
        if (!formData.sectorId) errors.sectorId = "Sector is required";
        if (!formData.industryId) errors.industryId = "Industry is required";
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
                    <div className="">
                        <label className="field-label">Company Name *</label>
                        <input
                            type="text"
                            name="companyName"

                            value={formData.companyName}
                            onChange={handleChange}
                            className={"input-field"}

                            placeholder="Enter company name"
                        />
                        {errors.companyName && <p className="text-red-500">{errors.companyName}</p>}
                    </div>

                    {/* Reporting Year Type */}
                    <div className="flex-1 mb-4">
                        <label className="field-label">Reporting Year Type *</label>
                        <Select
                            options={[
                                { value: "calendar", label: "Calendar Year" },
                                { value: "fiscal", label: "Fiscal Year" },
                                { value: "custom", label: "Custom Year" },
                            ]}
                            value={
                                formData.reportingYear
                                    ? {
                                        value: formData.reportingYear,
                                        label:
                                            formData.reportingYear === "calendar"
                                                ? "Calendar Year"
                                                : formData.reportingYear === "fiscal"
                                                    ? "Fiscal Year"
                                                    : "Custom Year",
                                    }
                                    : null
                            }
                            onChange={(selected) => {
                                const selectedType = selected?.value || "";
                                setFormData((prev) => ({
                                    ...prev,
                                    reportingYear: selectedType,
                                    // clear previous values when type changes
                                    Calendaryear: "",
                                    fiscalyear: "",
                                    customyear: "",
                                }));
                                setErrors((prev) => ({
                                    ...prev,
                                    reportingYear: null,
                                }));
                            }}
                            placeholder="Select Reporting Year Type"
                        />
                        {errors.reportingYear && (
                            <p className="text-red-500">{errors.reportingYear}</p>
                        )}
                    </div>

                    {/* Calendar Year */}
                    {formData.reportingYear === "calendar" && (
                        <div className="flex-1 mb-4">
                            <label className="field-label">Calendar Year</label>
                            <Select
                                options={Array.from({ length: 50 }, (_, i) => {
                                    const y = 2000 + i;
                                    return { value: y, label: y.toString() };
                                })}
                                value={
                                    formData.Calendaryear
                                        ? { value: formData.Calendaryear, label: formData.Calendaryear.toString() }
                                        : null
                                }
                                onChange={(selected) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        Calendaryear: selected.value.toString(), 
                                    }))
                                }
                                placeholder="Select Year"
                            />
                            {errors.Calendaryear && <p className="text-red-500">{errors.Calendaryear}</p>}
                        </div>
                    )}

                    {/* Fiscal Year */}
                    {formData.reportingYear === "fiscal" && (
                        <div className="flex-1 mb-4">
                            <label className="field-label">Fiscal Year</label>
                            <input
                                type="date"
                                name="fiscalyear"
                                value={formData.fiscalyear ? formData.fiscalyear.split("T")[0] : ""}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        fiscalyear: e.target.value,
                                    }))
                                }
                                className="input-field"
                            />
                            {errors.fiscalyear && <p className="text-red-500">{errors.fiscalyear}</p>}
                        </div>
                    )}

                    {/* Custom Year */}
                    {formData.reportingYear === "custom" && (
                        <div className="flex-1 mb-4">
                            <label className="field-label">Custom Year</label>
                            <input
                                type="date"
                                name="customyear"
                                value={formData.customyear ? formData.customyear.split("T")[0] : ""}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        customyear: e.target.value,
                                    }))
                                }
                                className="input-field"
                            />
                            {errors.customyear && <p className="text-red-500">{errors.customyear}</p>}
                        </div>
                    )}

                    {/* Boundary */}
                    <div className="">
                        <label className="field-label">Boundary *</label>
                        <input
                            type="text"
                            name="boundary"
                            value={formData.boundary}
                            onChange={handleChange}
                            className={`input ${errors.boundary ? "border-red-500" : "input-field"}`}
                            placeholder="Enter boundary"
                        />
                        {errors.boundary && <p className="text-red-500">{errors.boundary}</p>}
                    </div>

                    {/* Country */}
                    <div className="">
                        <label className="field-label">Country *</label>
                        <Select
                            options={countries.map((c) => ({ value: c, label: c }))}
                            value={formData.country ? { value: formData.country, label: formData.country } : null}
                            onChange={(selected) =>
                                setFormData((prev) => ({ ...prev, country: selected?.value || "" }))
                            }
                            placeholder="Select Country"
                            className="mb-3"
                            styles={{ control: (base) => ({ ...base, minHeight: '40px', borderWidth: '3px' }) }}
                        />
                        {errors.country && <p className="text-red-500">{errors.country}</p>}
                    </div>

                    {/* Province */}
                    <div className="">
                        <label className="field-label">Province</label>
                        <input
                            type="text"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter province"
                        />
                    </div>

                    {/* Base Year */}
                    <div className="">
                        <label className="field-label">Base Year</label>
                        <input
                            type="checkbox"
                            name="baseyear"
                            checked={formData.baseyear}
                            onChange={handleChange}
                            className="h-5 w-5 mt-2"
                        />
                    </div>

                    {/* Address */}
                    <div className="">
                        <label className="field-label">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter address"
                        />
                    </div>

                    {/* Total Employees */}
                    <div className="">
                        <label className="field-label">Total Employees *</label>
                        <input
                            type="number"
                            name="totalEmployees"
                            value={formData.totalEmployees}
                            onChange={handleChange}
                            className={`input ${errors.totalEmployees ? "border-red-500" : "input-field"}`}
                            placeholder="Enter total employees"
                        />
                        {errors.totalEmployees && <p className="text-red-500">{errors.totalEmployees}</p>}
                    </div>

                    {/* Currency */}
                    <div className="">
                        <label className="field-label">Currency *</label>

                        {/* <select
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
                        {errors.currency && <p className="text-red-500">{errors.currency}</p>} */}
                        <Select
                            options={currencies.map((item) => ({
                                value: item.code,
                                label: `${item.code} - ${item.rate.toFixed(2)}`
                            }))}
                            value={
                                formData.currency
                                    ? { value: formData.currency, label: formData.currency }
                                    : null
                            }
                            onChange={(selected) =>
                                setFormData((prev) => ({ ...prev, currency: selected?.value || "" }))
                            }
                            placeholder="Select Currency"
                            readOnly
                            className="mb-3"
                            styles={{ control: (base) => ({ ...base, minHeight: '40px', borderWidth: '3px' }) }}
                        />
                        {errors.currency && <p className="text-red-500">{errors.currency}</p>}

                    </div>

                    {/* Headquarter Location */}
                    <div className="">
                        <label className="field-label">Headquarter Location</label>
                        <input
                            type="text"
                            name="headquarterLocation"
                            value={formData.headquarterLocation}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter headquarter location"
                        />
                    </div>
                    {/* Sector Dropdown */}
                    <div className="">
                        <label className="field-label">Sector *</label>
                        {/* <select
                            value={formData.sectorId}
                            className="input-field"
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
                        {errors.sectorId && <p className="text-red-500">{errors.sectorId}</p>} */}
                        <Select
                            options={sectors.map((s) => ({ value: s._id, label: s.name }))}
                            value={
                                formData.sectorId
                                    ? { value: formData.sectorId, label: sectors.find((s) => s._id === formData.sectorId)?.name }
                                    : null
                            }
                            onChange={(selected) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    sectorId: selected?.value || "",
                                    industryId: ""
                                }))
                            }
                            placeholder="Select Sector"
                            className="mb-3"
                            isDisabled
                            styles={{ control: (base) => ({ ...base, minHeight: '40px', borderWidth: '3px' }) }}
                        />
                        {errors.sectorId && <p className="text-red-500">{errors.sectorId}</p>}

                    </div>

                    {/* Industry Dropdown */}
                    <div className="">
                        <label className="field-label">Industry *</label>
                        {/* <select
                            value={formData.industryId}
                            className="input-field"
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
                        {errors.industryId && <p className="text-red-500">{errors.industryId}</p>} */}
                        <Select
                            options={industries.map((i) => ({ value: i._id, label: i.name }))}
                            value={
                                formData.industryId
                                    ? { value: formData.industryId, label: industries.find((i) => i._id === formData.industryId)?.name }
                                    : null
                            }
                            onChange={(selected) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    industryId: selected?.value || ""
                                }))
                            }
                            placeholder="Select Industry"
                            isDisabled
                            className="mb-3"
                            readOnly
                            
                            styles={{ control: (base) => ({ ...base, minHeight: '40px', borderWidth: '3px' }) }}
                        />
                        {errors.industryId && <p className="text-red-500">{errors.industryId}</p>}
                    </div>

                    {/* Total Sites */}
                    <div className="">
                        <label className="field-label">Total Sites</label>
                        <input
                            type="number"
                            name="totalSites"
                            value={formData.totalSites}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter total sites"
                        />
                    </div>

                    {/* Total Area Sq M */}
                    <div className="">
                        <label className="field-label">Total Area (Sq M)</label>
                        <input
                            type="number"
                            name="totalAreaSqM"
                            value={formData.totalAreaSqM}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter total area in square meters"
                        />
                    </div>


                    {/* Units Manufactured Per Annum */}
                    <div className="">
                        <label className="field-label">Units Manufactured Per Annum</label>
                        <input
                            type="number"
                            name="unitsManufacturedPerAnnum"
                            value={formData.unitsManufacturedPerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter units manufactured per annum"
                        />
                    </div>

                    {/* Production Volume Tonne Per Annum */}
                    <div className="">
                        <label className="field-label">Production Volume (Tonne Per Annum)</label>
                        <input
                            type="number"
                            name="productionVolumeTonnePerAnnum"
                            value={formData.productionVolumeTonnePerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter production volume in tonnes per annum"
                        />
                    </div>

                    {/* Units Sold Per Annum */}
                    <div className="">
                        <label className="field-label">Units Sold Per Annum</label>
                        <input
                            type="number"
                            name="unitsSoldPerAnnum"
                            value={formData.unitsSoldPerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter units sold per annum"
                        />
                    </div>

                    {/* Electricity Generated MWh Per Annum */}
                    <div className="">
                        <label className="field-label">Electricity Generated (MWh Per Annum)</label>
                        <input
                            type="number"
                            name="electricityGeneratedMWhPerAnnum"
                            value={formData.electricityGeneratedMWhPerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter electricity generated in MWh per annum"
                        />
                    </div>

                    {/* Energy Generated GJ Per Annum */}
                    <div className="">
                        <label className="field-label">Energy Generated (GJ Per Annum)</label>
                        <input
                            type="number"
                            name="energyGeneratedGJPerAnnum"
                            value={formData.energyGeneratedGJPerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter energy generated in GJ per annum"
                        />
                    </div>

                    {/* Revenue Per Annum */}
                    <div className="">
                        <label className="field-label">Revenue Per Annum</label>
                        <input
                            type="number"
                            name="revenuePerAnnum"
                            value={formData.revenuePerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter revenue per annum"
                        />
                    </div>

                    {/* Total Man Hours Per Annum */}
                    <div className="">
                        <label className="field-label">Total Man Hours Per Annum</label>
                        <input
                            type="number"
                            name="totalManHoursPerAnnum"
                            value={formData.totalManHoursPerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter total man hours per annum"
                        />
                    </div>

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
