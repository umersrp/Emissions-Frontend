import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Datepicker from "react-tailwindcss-datepicker";

const boundaryOptions = [
    { value: "operational control", label: "Operational Control" },
    { value: "financial control", label: "Financial Control" },
    { value: "equity share", label: "Equity Share" },
];

const MyCompany = () => {
    const navigate = useNavigate();
    const [countries, setCountries] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [companyId, setCompanyId] = useState(null);
    const [fiscalRange, setFiscalRange] = useState({ startDate: null, endDate: null });
    const [customRange, setCustomRange] = useState({ startDate: null, endDate: null });

    const [formData, setFormData] = useState({
        companyName: "",
        reportingYear: "",
        boundary: null,
        country: "",
        province: "",
        baseyear: false,
        Calendaryear: null,
        fiscalyear: "",
        customyear: "",
        address: "",
        totalEmployees: "",
        currency: null,
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
        sector: "",
        industry: "",
    });

    const [errors, setErrors] = useState({});

    //   Fetch countries and currencies
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const countryRes = await axios.get("https://restcountries.com/v3.1/all?fields=name");
                const countryList = countryRes.data
                    .map((c) => ({ value: c.name.common, label: c.name.common }))
                    .sort((a, b) => a.label.localeCompare(b.label));
                setCountries(countryList);

                const currencyRes = await axios.get("https://open.er-api.com/v6/latest/USD");
                const currencyList = Object.keys(currencyRes.data.rates).map((code) => ({
                    value: code,
                    label: code,
                }));
                setCurrencies(currencyList);
            } catch (error) {
                console.error("Error fetching dropdown data:", error);
                toast.error("Failed to load dropdown data");
            }
        };
        fetchDropdownData();
    }, []);

    //   Fetch company by logged-in user ID
    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                const companyId = localStorage.getItem("companyId"); // 👈 assuming companyId is stored here
                console.log(companyId);
                if (!companyId) {
                    toast.error("User ID not found. Please log in again.");
                    
                    return;
                }

                const response = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/company/company-profile/${companyId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                const data = response.data.data;
                if (!data) {
                    toast.error("No company profile found for this user.");
                    return;
                }

                setCompanyId(data._id);

                setFormData({
                    companyName: data.companyName || "",
                    reportingYear: data.reportingYear || "",
                    boundary: data.boundary || "",
                    country: data.country || "",
                    province: data.province || "",
                    baseyear: data.baseyear || false,
                    Calendaryear: data.Calendaryear || null,
                    fiscalyear: data.fiscalyear || "",
                    customyear: data.customyear || "",
                    address: data.address || "",
                    totalEmployees: data.totalEmployees || "",
                    currency: data.currency || "",
                    headquarterLocation: data.headquarterLocation || "",
                    totalSites: data.totalSites || "",
                    totalAreaSqM: data.totalAreaSqM || "",
                    unitsManufacturedPerMonth: data.unitsManufacturedPerMonth || "",
                    unitsManufacturedPerAnnum: data.unitsManufacturedPerAnnum || "",
                    productionVolumeTonnePerAnnum: data.productionVolumeTonnePerAnnum || "",
                    unitsSoldPerAnnum: data.unitsSoldPerAnnum || "",
                    electricityGeneratedMWhPerAnnum: data.electricityGeneratedMWhPerAnnum || "",
                    energyGeneratedGJPerAnnum: data.energyGeneratedGJPerAnnum || "",
                    revenuePerAnnum: data.revenuePerAnnum || "",
                    totalManHoursPerAnnum: data.totalManHoursPerAnnum || "",
                    sector: data.sector || "No Industry Assinged",
                    industry: data.industry || "No Industry Assinged",
                });

                if (data.fiscalyear) setFiscalRange(data.fiscalyear);
                if (data.customyear) setCustomRange(data.customyear);
            } catch (error) {
                console.error("Failed to fetch company data:", error);
                toast.error("Failed to fetch company profile");
            }
        };

        fetchCompanyData();
    }, []);

    const validate = () => {
        const errors = {};
        if (!formData.companyName) errors.companyName = "Company name is required";
        if (!formData.reportingYear) errors.reportingYear = "Reporting year is required";
        if (!formData.boundary) errors.boundary = "Boundary is required";
        if (!formData.country) errors.country = "Country is required";
        if (!formData.address) errors.address = "Address is required";
        if (!formData.province) errors.province = "Province is required";
        if (!formData.totalEmployees) errors.totalEmployees = "Total employees is required";
        if (!formData.currency) errors.currency = "Currency is required";
        if (!formData.headquarterLocation) errors.headquarterLocation = "Headquarter location is required";
        if (!formData.totalSites) errors.totalSites = "Total sites/buildings are required";
        if (!formData.totalAreaSqM) errors.totalAreaSqM = "Total area is required";
        if (!formData.unitsManufacturedPerAnnum) errors.unitsManufacturedPerAnnum = "Units manufactured per annum is required";
        if (!formData.productionVolumeTonnePerAnnum) errors.productionVolumeTonnePerAnnum = "Production volume is required";
        if (!formData.unitsSoldPerAnnum) errors.unitsSoldPerAnnum = "Units sold per annum is required";
        if (!formData.electricityGeneratedMWhPerAnnum) errors.electricityGeneratedMWhPerAnnum = "Electricity generated is required";
        if (!formData.energyGeneratedGJPerAnnum) errors.energyGeneratedGJPerAnnum = "Energy generated is required";
        if (!formData.revenuePerAnnum) errors.revenuePerAnnum = "Revenue is required";
        if (!formData.totalManHoursPerAnnum) errors.totalManHoursPerAnnum = "Total man hours are required";
        if (formData.reportingYear === "calendar" && !formData.Calendaryear)
            errors.Calendaryear = "Calendar year is required";
        if (formData.reportingYear === "fiscal" &&
            (!formData.fiscalyear?.startDate || !formData.fiscalyear?.endDate))
            errors.fiscalyear = "Both start and end date are required for fiscal year";
        if (formData.reportingYear === "custom" &&
            (!formData.customyear?.startDate || !formData.customyear?.endDate))
            errors.customyear = "Both start and end date are required for custom year";
        return errors;
    };

    //   Update company
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
                `${process.env.REACT_APP_BASE_URL}/company/company-profile/${companyId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            toast.success("Company profile updated successfully!");
            navigate("/Company/:id");
        } catch (error) {
            console.error("Failed to update company profile:", error);
            toast.error(error.response?.data?.message || "Failed to update company profile");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/dashboard");
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    return (
        <Card title="Update Company Profile">
            <div className="w-full mx-auto p-6">
                <form className="lg:grid-cols-3 grid gap-8 grid-cols-1">
                    {/* Company Name */}
                    <div className="">
                        <label className="field-label">Company / Organization Name *</label>
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
                    <div className="flex-1">
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
                                setFormData((prev) => ({
                                    ...prev,
                                    reportingYear: selected?.value || "",
                                    Calendaryear: "",
                                    fiscalyear: "",
                                    customyear: "",
                                }))
                                setErrors((prev) => ({
                                    ...prev,
                                    reportingYear: null,
                                }));
                            }}
                            placeholder="Select Reporting Year Type"
                        />
                        {errors.reportingYear && <p className="text-red-500">{errors.reportingYear}</p>}

                    </div>


                    {/* Boundary */}
                    <div className="">
                        <label className="field-label">Boundary *</label>
                        <Select
                            name="boundary"
                            options={boundaryOptions}
                            value={boundaryOptions.find((option) => option.value === formData.boundary) || null}
                            onChange={(selectedOption) => {
                                setFormData((prev) => ({ ...prev, boundary: selectedOption.value }));
                                setErrors((prev) => ({
                                    ...prev,
                                    boundary: null,
                                }));
                            }}
                            placeholder="Select boundary"
                            classNamePrefix="react-select"
                            className={`w-full ${errors.boundary ? "border border-red-500 rounded-md" : ""}`}
                        />
                        {errors.boundary && <p className="text-red-500">{errors.boundary}</p>}
                    </div>

                    {/* Show the corresponding input beside it */}
                    {formData.reportingYear === "calendar" && (
                        <div className="flex-1">
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
                                onChange={(selected) => {
                                    setFormData((prev) => ({ ...prev, Calendaryear: selected.value }))
                                    setErrors((prev) => ({
                                        ...prev,
                                        Calendaryear: null,
                                    }));
                                }}
                                placeholder="Select Year"
                            />
                            {errors.Calendaryear && <p className="text-red-500">{errors.Calendaryear}</p>}

                        </div>
                    )}

                    {/* Fiscal Year */}
                    {formData.reportingYear === "fiscal" && (
                        <div className="flex-1 relative z-[9999]">
                            <label className="field-label">Fiscal Year (Start & End Date)</label>
                            <Datepicker
                                value={fiscalRange}
                                onChange={(newValue) => {
                                    setFiscalRange(newValue);
                                    setFormData((prev) => ({
                                        ...prev,
                                        fiscalyear: {
                                            startDate: newValue.startDate,
                                            endDate: newValue.endDate,
                                        },
                                    }));
                                    setErrors((prev) => ({
                                        ...prev,
                                        fiscalyear: null,
                                    }));
                                }}
                                inputClassName="w-full border border-slate-300 dark:border-slate-600 input-field rounded-md text-sm bg-white dark:bg-slate-800 dark:text-white"
                                containerClassName="container-class "
                                popperPlacement="bottom-start"
                                popperModifiers={[
                                    {
                                        name: "flip",
                                        enabled: true, //  prevent it from flipping to top
                                    },
                                    {
                                        name: "preventOverflow",
                                        options: {
                                            altBoundary: false,
                                            rootBoundary: "viewport",
                                            tether: true, //   prevents weird repositioning
                                        },
                                    },
                                   
                                ]}
                            />
                             <style jsx global>{`
  /* Remove h-full and center the icon */
  .container-class button[type="button"] {
    height: 2.5rem !important;
    top: 35% !important;
    transform: translateY(-0%) !important;
  }
  
  /* Adjust icon positioning */
  .react-datepicker__calendar-icon {
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
                            `}</style>

                            {/*  inline style to control popper position */}

                            {errors.fiscalyear && (
                                <p className="text-red-500">{errors.fiscalyear}</p>
                            )}
                        </div>
                    )}

                    {/* Custom Year */}
                    {formData.reportingYear === "custom" && (
                        <div className="flex-1 overflow-visible relative z-[100]">
                            <label className="field-label">Custom Year (Start & End Date)</label>
                            <Datepicker
                                value={customRange}
                                onChange={(newValue) => {
                                    setCustomRange(newValue);
                                    setFormData((prev) => ({
                                        ...prev,
                                        customyear: {
                                            startDate: newValue.startDate,
                                            endDate: newValue.endDate,
                                        },
                                    }));
                                    setErrors((prev) => ({
                                        ...prev,
                                        customyear: null,
                                    }));
                                }}
                                inputClassName="w-full border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-md text-sm bg-white dark:bg-slate-800 dark:text-white"
                                containerClassName="container-class"
                                popperPlacement="bottom-start"
                                popperModifiers={[
                                    {
                                        name: "flip",
                                        enabled: true, //  prevent it from flipping to top
                                    },
                                    {
                                        name: "preventOverflow",
                                        options: {
                                            altBoundary: false,
                                            rootBoundary: "viewport",
                                            tether: true, //   prevents weird repositioning
                                        },
                                    },
                                    
                                ]}
                            />
                              <style jsx global>{`
  /* Remove h-full and center the icon */
  .container-class button[type="button"] {
    height: 2.5rem !important;
    top: 35% !important;
    transform: translateY(-0%) !important;
  }
  
  /* Adjust icon positioning */
  .react-datepicker__calendar-icon {
    padding: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
                            `}</style>
                            {/*  inline style to control popper position */}
                            {errors.customyear && (
                                <p className="text-red-500">{errors.customyear}</p>
                            )}
                        </div>
                    )}
                    {/* Country */}
                    <div>
                        <label className="field-label">Country of Operation *</label>
                        <Select
                            options={countries}
                            value={countries.find((c) => c.value === formData.country) || null}
                            onChange={(selectedOption) => {
                                setFormData((prev) => ({ ...prev, country: selectedOption?.value || "" }));
                                setErrors((prev) => ({
                                    ...prev,
                                    country: null,
                                }));
                            }}
                            placeholder="Select Country"
                        />
                        {errors.country && <p className="text-red-500">{errors.country}</p>}
                    </div>
                    {/* Province */}
                    <div className="">
                        <label className="field-label">Province / Territroy</label>
                        <input
                            type="text"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter province"
                        />
                        {errors.province && <p className="text-red-500">{errors.province}</p>}
                    </div>

                    {/* Base Year */}
                    <div className="">
                        <label className="field-label">Is This a Base Year ??</label>
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
                        {errors.address && <p className="text-red-500">{errors.address}</p>}
                    </div>

                    {/* Total Employees */}
                    <div className="">
                        <label className="field-label">Total Employees *</label>
                        <input
                            type="number"
                            name="totalEmployees"
                            value={formData.totalEmployees}
                            onChange={handleChange}
                            className={"input-field"}
                            placeholder="Enter total employees"
                        />
                        {errors.totalEmployees && <p className="text-red-500">{errors.totalEmployees}</p>}
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="field-label">Currency *</label>
                        <Select
                            options={currencies}
                            value={currencies.find((c) => c.value === formData.currency) || null}
                            onChange={(selectedOption) => {
                                setFormData((prev) => ({ ...prev, currency: selectedOption.value }));
                                setErrors((prev) => ({
                                    ...prev,
                                    currency: null,
                                }));
                            }}
                            placeholder="Select Currency"
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
                        {errors.headquarterLocation && <p className="text-red-500">{errors.headquarterLocation}</p>}
                    </div>

                    {/* Sector (read-only) */}
                    <div className="">
                        <label className="field-label">Sector *</label>
                        <input
                            type="text"
                            name="sector"
                            value={formData.sector || "Manufacturing"} // <-- replace with actual value or keep dynamic
                            readOnly
                            className="input-field bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                    {/* Industry (read-only) */}
                    <div className="">
                        <label className="field-label">Industry *</label>
                        <input
                            type="text"
                            name="industry"
                            value={formData.industry || "Textiles"} // <-- replace with actual value
                            readOnly
                            className="input-field bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                    {/* Total Sites */}
                    <div className="">
                        <label className="field-label">Total Sites / Building</label>
                        <input
                            type="number"
                            name="totalSites"
                            value={formData.totalSites}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter sites/buildings"
                        />
                        {errors.totalSites && <p className="text-red-500">{errors.totalSites}</p>}
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
                            placeholder="Enter area in sq m"
                        />
                        {errors.totalAreaSqM && <p className="text-red-500">{errors.totalAreaSqM}</p>}
                    </div>

                    {/* Units Manufactured per Annum */}
                    <div className="">
                        <label className="field-label">No. of Units Manufactured per Annum</label>
                        <input
                            type="number"
                            name="unitsManufacturedPerAnnum"
                            value={formData.unitsManufacturedPerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter Manufactured units "
                        />
                        {errors.unitsManufacturedPerAnnum && <p className="text-red-500">{errors.unitsManufacturedPerAnnum}</p>}
                    </div>

                    {/* Production Volume Tonne per Annum */}
                    <div className="">
                        <label className="field-label">Production Volume (Tonne per Annum)</label>
                        <input
                            type="number"
                            name="productionVolumeTonnePerAnnum"
                            value={formData.productionVolumeTonnePerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter production volume "
                        />
                        {errors.productionVolumeTonnePerAnnum && <p className="text-red-500">{errors.productionVolumeTonnePerAnnum}</p>}
                    </div>

                    {/* Units Sold per Annum */}
                    <div className="">
                        <label className="field-label">No. of Units Sold per Annum</label>
                        <input
                            type="number"
                            name="unitsSoldPerAnnum"
                            value={formData.unitsSoldPerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter Sold units "
                        />
                        {errors.unitsSoldPerAnnum && <p className="text-red-500">{errors.unitsSoldPerAnnum}</p>}
                    </div>

                    {/* Electricity Generated MWh per Annum */}
                    <div className="">
                        <label className="field-label">Electricity Generated (MWh per Annum)</label>
                        <input
                            type="number"
                            name="electricityGeneratedMWhPerAnnum"
                            value={formData.electricityGeneratedMWhPerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter electricity generated"
                        />
                        {errors.electricityGeneratedMWhPerAnnum && <p className="text-red-500">{errors.electricityGeneratedMWhPerAnnum}</p>}
                    </div>

                    {/* Energy Generated GJ per Annum */}
                    <div className="">
                        <label className="field-label">Energy Generated (GJ per Annum)</label>
                        <input
                            type="number"
                            name="energyGeneratedGJPerAnnum"
                            value={formData.energyGeneratedGJPerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter energy generated"
                        />
                        {errors.energyGeneratedGJPerAnnum && <p className="text-red-500">{errors.energyGeneratedGJPerAnnum}</p>}
                    </div>

                    {/* Revenue per Annum */}
                    <div className="">
                        <label className="field-label">Revenue per Annum</label>
                        <input
                            type="number"
                            name="revenuePerAnnum"
                            value={formData.revenuePerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter revenue"
                        />
                        {errors.revenuePerAnnum && <p className="text-red-500">{errors.revenuePerAnnum}</p>}
                    </div>

                    {/* Total Man Hours per Annum */}
                    <div className="">
                        <label className="field-label">Total Man Hours per Annum</label>
                        <input
                            type="number"
                            name="totalManHoursPerAnnum"
                            value={formData.totalManHoursPerAnnum}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter total man"
                        />
                        {errors.totalManHoursPerAnnum && <p className="text-red-500">{errors.totalManHoursPerAnnum}</p>}
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

export default MyCompany;
