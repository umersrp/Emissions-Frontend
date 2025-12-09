import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, } from "react-router-dom";
import PrivateRoute from "./store/api/Privateroute";

// home pages  & dashboard
//import Dashboard from "./pages/dashboard";
const Dashboard = lazy(() => import("./pages/dashboard"));
const Ecommerce = lazy(() => import("./pages/dashboard/ecommerce"));

const CrmPage = lazy(() => import("./pages/dashboard/crm"));
const ProjectPage = lazy(() => import("./pages/dashboard/project"));
const BankingPage = lazy(() => import("./pages/dashboard/banking"));

const Login = lazy(() => import("./pages/auth/login"));
const Login2 = lazy(() => import("./pages/auth/login2"));
const Login3 = lazy(() => import("./pages/auth/login3"));
const Register = lazy(() => import("./pages/auth/register"));
const Register2 = lazy(() => import("./pages/auth/register2"));
const Register3 = lazy(() => import("./pages/auth/register3"));
const ForgotPass = lazy(() => import("./pages/auth/forgot-password"));
const ForgotPass2 = lazy(() => import("./pages/auth/forgot-password2"));
const ForgotPass3 = lazy(() => import("./pages/auth/forgot-password3"));
const LockScreen = lazy(() => import("./pages/auth/lock-screen"));
const LockScreen2 = lazy(() => import("./pages/auth/lock-screen2"));
const LockScreen3 = lazy(() => import("./pages/auth/lock-screen3"));
const Error = lazy(() => import("./pages/404"));

import Layout from "./layout/Layout";
import AuthLayout from "./layout/AuthLayout";

// components pages
const Button = lazy(() => import("./pages/components/button"));
const Dropdown = lazy(() => import("./pages/components/dropdown"));
const Badges = lazy(() => import("./pages/components/badges"));
const Colors = lazy(() => import("./pages/components/colors"));
const Typography = lazy(() => import("./pages/components/typography"));
const Alert = lazy(() => import("./pages/components/alert"));
const Progressbar = lazy(() => import("./pages/components/progress-bar"));
const Card = lazy(() => import("./pages/components/card"));
const Image = lazy(() => import("./pages/components/image"));
const Placeholder = lazy(() => import("./pages/components/placeholder"));
const Tooltip = lazy(() => import("./pages/components/tooltip-popover"));
const Modal = lazy(() => import("./pages/components/modal"));
const Carousel = lazy(() => import("./pages/components/carousel"));
const Pagination = lazy(() => import("./pages/components/pagination"));
const TabsAc = lazy(() => import("./pages/components/tab-accordion"));
const Video = lazy(() => import("./pages/components/video"));

// forms components
const InputPage = lazy(() => import("./pages/forms/input"));
const TextareaPage = lazy(() => import("./pages/forms/textarea"));
const CheckboxPage = lazy(() => import("./pages/forms/checkbox"));
const RadioPage = lazy(() => import("./pages/forms/radio-button"));
const SwitchPage = lazy(() => import("./pages/forms/switch"));
const InputGroupPage = lazy(() => import("./pages/forms/input-group"));
const InputlayoutPage = lazy(() => import("./pages/forms/input-layout"));
const InputMask = lazy(() => import("./pages/forms/input-mask"));
const FormValidation = lazy(() => import("./pages/forms/form-validation"));
const FileInput = lazy(() => import("./pages/forms/file-input"));
const FormRepeater = lazy(() => import("./pages/forms/form-repeater"));
const FormWizard = lazy(() => import("./pages/forms/form-wizard"));
const SelectPage = lazy(() => import("./pages/forms/select"));
const Flatpicker = lazy(() => import("./pages/forms/date-time-picker"));

// chart page
const AppexChartPage = lazy(() => import("./pages/chart/appex-chart"));
const ChartJs = lazy(() => import("./pages/chart/chartjs"));
const Recharts = lazy(() => import("./pages/chart/recharts"));

// map page
const MapPage = lazy(() => import("./pages/map"));

// table pages
const BasicTablePage = lazy(() => import("./pages/table/table-basic"));
const TanstackTable = lazy(() => import("./pages/table/react-table"));

// utility pages
const UserPage = lazy(() => import("./pages/utility/userTable"));
const UserAddPage = lazy(() => import("./pages/utility/user-add"));
const UserEditPage = lazy(() => import("./pages/utility/user-edit"));
const VendorAddPage = lazy(() => import("./pages/utility/vendor-add"));
const VendorEditPage = lazy(() => import("./pages/utility/vendor-edit"));
const InvoicePreviewPage = lazy(() =>
  import("./pages/utility/invoice-preview")
);
const VendorPage = lazy(() => import("./pages/utility/vendor"));
const InvoiceEditPage = lazy(() => import("./pages/utility/invoice-edit"));
const PricingPage = lazy(() => import("./pages/utility/pricing"));
const BlankPage = lazy(() => import("./pages/utility/blank-page"));
const ComingSoonPage = lazy(() => import("./pages/utility/coming-soon"));
const UnderConstructionPage = lazy(() =>
  import("./pages/utility/under-construction")
);
const BlogPage = lazy(() => import("./pages/utility/blog"));
const BlogDetailsPage = lazy(() => import("./pages/utility/blog/blog-details"));
const FaqPage = lazy(() => import("./pages/utility/faq"));
// const Settings = lazy(() => import("./pages/utility/settings"));
const Profile = lazy(() => import("./pages/utility/profile"));
const IconPage = lazy(() => import("./pages/icons"));
const NotificationPage = lazy(() => import("./pages/utility/notifications"));
const ChangelogPage = lazy(() => import("./pages/changelog"));
const RoleAddPage = lazy(() => import("./pages/utility/role-add"));
const RolePage = lazy(() => import("./pages/utility/roleTable"));
const ProductAddPage = lazy(() => import("./pages/utility/product-add"));
const ProductPage = lazy(() => import("./pages/utility/productTable"));
const ProductPreviewPage = lazy(() => import("./pages/utility/product-preview"));
const ProductEditPage = lazy(() => import("./pages/utility/product-edit"));

// widget pages
const BasicWidget = lazy(() => import("./pages/widget/basic-widget"));
const StatisticWidget = lazy(() => import("./pages/widget/statistic-widget"));

// app page
const TodoPage = lazy(() => import("./pages/app/todo"));
const EmailPage = lazy(() => import("./pages/app/email"));
const ChatPage = lazy(() => import("./pages/app/chat"));
const ProjectPostPage = lazy(() => import("./pages/app/projects"));
const ProjectDetailsPage = lazy(() =>
  import("./pages/app/projects/project-details")
);

const KanbanPage = lazy(() => import("./pages/app/kanban"));
const CalenderPage = lazy(() => import("./pages/app/calendar"));

//Ecommerce-Pages

const EcommercePage = lazy(() => import("./pages/ecommerce"));

import Loading from "@/components/Loading";
import { ProductDetails } from "./pages/ecommerce/productDetails";
import Cart from "./pages/ecommerce/cart";
import Wishlist from "./pages/ecommerce/wish-list";
import Orders from "./pages/ecommerce/orders";
import OrderDetails from "./pages/ecommerce/orderDetails";
import Checkout from "./pages/ecommerce/checkout";
import EditProduct from "./pages/ecommerce/edit-product";
import Customers from "./pages/ecommerce/customers";
import Sellers from "./pages/ecommerce/sellers";
import AddProduct from "./pages/ecommerce/add-product";
import InvoiceEPage from "./pages/ecommerce/invoice-ecompage";
import Productview from "./pages/utility/product-view";
import Customerview from "./pages/ecommerce/customerview";
import Vendorview from "./pages/utility/vendor-view";
import RoleEditPage from "./pages/utility/role-edit";
import Productcatagory from "./pages/ecommerce/product-catagory";
import Productcreateform from "./pages/ecommerce/product-c-form";
import Catagroyedit from "./pages/ecommerce/catagroy-edit";
import { Bar } from "react-chartjs-2";
import Brandtable from "./pages/ecommerce/brand-table";
import Brandsadd from "./pages/ecommerce/brands-add";
import Brandsedit from "./pages/ecommerce/brands-edit";
import Vendorcatagory from "./pages/ecommerce/vendor-catagory";
import Vendoradd from "./pages/ecommerce/vendor-add";
import Vendorcatagoryedit from "./pages/ecommerce/Vendorcatagory-edit";
import Discounttable from "./pages/utility/Discount-table";
import Discountadd from "./pages/utility/Discount-add";
import Configadd from "./pages/utility/config-add";
import Discountedit from "./pages/utility/Discount-edit";
import Rider from "./pages/utility/Rider";
import Rideradd from "./pages/utility/Rider-add";
import Orderview from "./pages/ecommerce/Order-view";
import AssignOrder from "./pages/ecommerce/assign-order";
import Rideredit from "./pages/utility/Rider-edit";
import Venue from "./pages/utility/venue";
import VenueAddPage from "./pages/utility/venue-add";
import VenueEditPage from "./pages/utility/venue-edit";
import Aboutus from "./pages/utility/Aboutus";
import Feedback from "./pages/utility/feedback";
import Gallery from "./pages/utility/Gallery";
import Galleryadd from "./pages/utility/Gallery-add";
import Contactedit from "./pages/utility/contactus-edit";
import Feedbackedit from "./pages/utility/feedbackedit";
import Scheduleedit from "./pages/utility/schedule-edit";
import Scheduletble from "./pages/utility/Scheduletble";
import Scheduleadd from "./pages/utility/Scheduleadd";
import Attendence from "./pages/utility/attendence";
import CoachPage from "./pages/utility/Coach";
import CoachAddPage from "./pages/utility/Coach-add";
import CoachEditPage from "./pages/utility/Coach-edit";
import Located from "./pages/utility/Located";
import Locatedadd from "./pages/utility/Located-add";
import Locationedit from "./pages/utility/Location-edit";
import Amenities from "./pages/utility/Amenities";
import AmenitiesAddPage from "./pages/utility/Amenitiesadd";
import Booking from "./pages/utility/Booking";
import Bookingadd from "./pages/utility/Booking-add";
import OpenStreetMapEmbed from "./pages/utility/map";
import Sportlist from "./pages/utility/Sport";
import SportAdd from "./pages/utility/SportAdd";
import Bookeduser from "./pages/utility/Bookeduser";
import Venueview from "./pages/utility/Venue-view";
import BookingView from "./pages/utility/Booking-view";
import SendNotificationForm from "./pages/utility/Notification";
import NotificationTable from "./pages/utility/Notification-Table";
import SectorTable from "./Carbonx-pages/Sector/Sectors-table";
import SectorAddForm from "./Carbonx-pages/Sector/SectorsAdd";
import SectorEdit from "./Carbonx-pages/Sector/SectorEdit";
import SectorView from "./Carbonx-pages/Sector/SectorView";
import Industry from "./Carbonx-pages/Industry/Industry";
import IndustryAddFrom from "./Carbonx-pages/Industry/IndustryAdd";
import CompanyProfileForm from "./Carbonx-pages/Company/CompanyAddForm";
import CompanyTable from "./Carbonx-pages/Company/CompanyTable";
import EditCompanyProfile from "./Carbonx-pages/Company/EditCompanyProfile";
import ViewCompanyProfile from "./Carbonx-pages/Company/ViewComapyProfile";
import BuildingFormPage from "./Carbonx-pages/Building/[id]/Building-form";
import BuildingTable from "./Carbonx-pages/Building/Buidingtable";
import StationaryCombustionFormPage from "@/Carbonx-pages/ScopeOne/Stationary/Stationary-Combustion-Form";
import StationaryCombustionListing from "@/Carbonx-pages/ScopeOne/Stationary/Stationary-Combustion-Listing";
import Scope1 from "./Carbonx-pages/ScopeOne/Scope1/Scope1";
import FugitiveCombustionFormPage from "@/Carbonx-pages/ScopeOne/Fugitive/Fugitive-Combustion-Form";
import FugitiveCombustionListing from "@/Carbonx-pages/ScopeOne/Fugitive/Fugitive-Combustion-Listing";
import MobileCombustionFormPage from "./Carbonx-pages/ScopeOne/Mobile/Mobile-Combustion-Form";
import MobileCombustionListing from "./Carbonx-pages/ScopeOne/Mobile/Mobile-Combustion-Listing";
import ProcessEmissionsFormPage from "./Carbonx-pages/ScopeOne/Process/Process-Emissions-Form";
import ProcessEmissionsListing from "./Carbonx-pages/ScopeOne/Process/Process-Emissions-Listing";
import MyCompany from "./Carbonx-pages/Company/MyCompany";
import ScopeOneReport from "./Carbonx-pages/ScopeOne/ScopeOneReport/Scope-One-Report";
import EmissionsReportPage from "./Carbonx-pages/AirEmissions/Air-Emissions-Report-Page";
import Scope2 from "./Carbonx-pages/ScopeTwo/Scope2/Scope2";
import PurchasedCoolingFormPage from "./Carbonx-pages/ScopeTwo/PurchasedElectricity/Purchased-Electricity-Form";
import PurchasedCoolingListing from "./Carbonx-pages/ScopeTwo/PurchasedElectricity/Purchased-Electricity-Listing";
import PurchasedElectricityFormPage from "./Carbonx-pages/ScopeTwo/PurchasedElectricity/Purchased-Electricity-Form";
import PurchasedElectricityListing from "./Carbonx-pages/ScopeTwo/PurchasedElectricity/Purchased-Electricity-Listing";
import Scope3 from "./Carbonx-pages/ScopeThree/Scope3/Scope3";
import PurchasedGoodServicesFormPage from "./Carbonx-pages/ScopeThree/PurchasedGoodAndServices/Purchased-Good-Services-Form";
import PurchasedGoodServicesListing from "./Carbonx-pages/ScopeThree/PurchasedGoodAndServices/Purchased-Good-Services-Listing";
import ScopeTwoReport from "./Carbonx-pages/ScopeTwo/ScopeTwoReport/Scope-Two-Report";
import FuelFusion from "./Carbonx-pages/ScopeThree/FuelFusion/fuelFusion";
import FuelEnergyForm from "./Carbonx-pages/ScopeThree/FuelFusion/fuelEnergyForm";
import WasteGeneratedFormPage from "./Carbonx-pages/ScopeThree/WasteGenerated/Waste-Generated-Form";
import WasteGeneratedListing from "./Carbonx-pages/ScopeThree/WasteGenerated/Waste-Generated-Listing";



function App() {
  return (
    <main className="App  relative">

      <Routes>
        <Route path="/" element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/login2" element={<Login2 />} />
          <Route path="/login3" element={<Login3 />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register2" element={<Register2 />} />
          <Route path="/register3" element={<Register3 />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/forgot-password2" element={<ForgotPass2 />} />
          <Route path="/forgot-password3" element={<ForgotPass3 />} />
          <Route path="/lock-screen" element={<LockScreen />} />
          <Route path="/lock-screen2" element={<LockScreen2 />} />
          <Route path="/lock-screen3" element={<LockScreen3 />} />
        </Route>
        <Route path="/*" element={<Layout />}>
          {/* <Route path="dashboard" element={<Dashboard />} /> */}
          <Route path="dashboard" element={
            <PrivateRoute
              element={Dashboard}
              requiredAuthTypes={["company", "admin", "vendor"]}
            />
          } />
          {/* <Route path="discountt" element={
            <PrivateRoute
              element={BankingPage}
              requiredAuthTypes={[ "vendor"]}
            />
          } /> */}
          <Route path="ecommerce" element={<Ecommerce />} />
          <Route path="crm" element={<CrmPage />} />
          <Route path="project" element={<ProjectPage />} />
          <Route path="discountt" element={<BankingPage />} />
          {/* App pages */}
          <Route path="todo" element={<TodoPage />} />
          <Route path="email" element={<EmailPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="projects" element={<ProjectPostPage />} />
          <Route path={"projects/:id"} element={<ProjectDetailsPage />} />
          <Route path="project-details" element={<ProjectDetailsPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="calender" element={<CalenderPage />} />
          {/* Components pages */}
          <Route path="button" element={<Button />} />
          <Route path="dropdown" element={<Dropdown />} />
          <Route path="badges" element={<Badges />} />
          <Route path="colors" element={<Colors />} />
          <Route path="typography" element={<Typography />} />
          <Route path="alert" element={<Alert />} />
          <Route path="progress-bar" element={<Progressbar />} />
          <Route path="card" element={<Card />} />
          <Route path="image" element={<Image />} />
          <Route path="Placeholder" element={<Placeholder />} />
          <Route path="tooltip-popover" element={<Tooltip />} />
          <Route path="modal" element={<Modal />} />
          <Route path="carousel" element={<Carousel />} />
          <Route path="Paginations" element={<Pagination />} />
          <Route path="tab-accordion" element={<TabsAc />} />
          <Route path="video" element={<Video />} />
          <Route path="input" element={<InputPage />} />
          <Route path="textarea" element={<TextareaPage />} />
          <Route path="checkbox" element={<CheckboxPage />} />
          <Route path="radio-button" element={<RadioPage />} />
          <Route path="switch" element={<SwitchPage />} />
          <Route path="input-group" element={<InputGroupPage />} />
          <Route path="input-layout" element={<InputlayoutPage />} />
          <Route path="input-mask" element={<InputMask />} />
          <Route path="form-validation" element={<FormValidation />} />
          <Route path="file-input" element={<FileInput />} />
          <Route path="form-repeater" element={<FormRepeater />} />
          <Route path="form-wizard" element={<FormWizard />} />
          <Route path="select" element={<SelectPage />} />
          <Route path="date-time-picker" element={<Flatpicker />} />
          <Route path="appex-chart" element={<AppexChartPage />} />
          <Route path="chartjs" element={<ChartJs />} />
          <Route path="recharts" element={<Recharts />} />
          <Route path="map" element={<MapPage />} />
          <Route path="table-basic" element={<BasicTablePage />} />
          <Route path="react-table" element={<TanstackTable />} />
          <Route path="Customer" element={<UserPage />} />
          <Route path="vendor" element={<VendorPage />} />
          <Route path="Customers-add" element={<UserAddPage />} />
          <Route path="Customer-edit" element={<UserEditPage />} />
          <Route path="vendor-add" element={<VendorAddPage />} />
          <Route path="vendor-edit" element={<VendorEditPage />} />
          <Route path="add-player" element={<RoleAddPage />} />
          <Route path="Player-edit" element={<RoleEditPage />} />
          <Route path="Player" element={<RolePage />} />
          <Route path="product-add" element={<ProductAddPage />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="product-view" element={<Productview />} />
          <Route path="customer-view" element={<Customerview />} />
          <Route path="vendor-view" element={<Vendorview />} />
          <Route path="mapl" element={<OpenStreetMapEmbed />} />




          <Route path="product-preview" element={<ProductPreviewPage />} />
          <Route path="product-edit" element={<ProductEditPage />} />
          <Route path="invoice-preview" element={<InvoicePreviewPage />} />
          <Route path="invoice-edit" element={<InvoiceEditPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="blank-page" element={<BlankPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog-details" element={<BlogDetailsPage />} />
          <Route path="faq" element={<FaqPage />} />
          {/* <Route path="settings" element={<Settings />} /> */}
          <Route path="profile" element={<Profile />} />
          <Route path="basic" element={<BasicWidget />} />
          <Route path="statistic" element={<StatisticWidget />} />
          <Route path="icons" element={<IconPage />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="changelog" element={<ChangelogPage />} />

          <Route path="products" element={<EcommercePage />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-details" element={<OrderDetails />} />
          <Route path="product-catagroy" element={<Productcatagory />} />
          <Route path="product-form" element={<Productcreateform />} />
          <Route path="category-edit" element={<Catagroyedit />} />
          <Route path="brands" element={<Brandtable />} />
          <Route path="brands-add" element={<Brandsadd />} />
          <Route path="brands-edit" element={<Brandsedit />} />
          <Route path="Vendor-category" element={<Vendorcatagory />} />
          <Route path="vender-add" element={<Vendoradd />} />
          <Route path="vender-cata-edit" element={<Vendorcatagoryedit />} />
          <Route path="discout-table" element={<Discounttable />} />
          <Route path="discout-add" element={<Discountadd />} />
          <Route path="discount-edit" element={<Discountedit />} />
          <Route path="add-config" element={<Configadd />} />
          <Route path="Rider" element={<Rider />} />
          <Route path="Rider-add" element={<Rideradd />} />
          <Route path="Order-view" element={<Orderview />} />
          <Route path="assign-order" element={<AssignOrder />} />
          <Route path="rider-edit" element={<Rideredit />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit-product" element={<EditProduct />} />
          <Route path="sellers" element={<Sellers />} />
          <Route path="invoice-ecommerce" element={<InvoiceEPage />} />
          <Route path="venue" element={<Venue />} />
          <Route path="venue-add" element={<VenueAddPage />} />
          <Route path="venue-edit" element={<VenueEditPage />} />
          <Route path="about-us" element={<Aboutus />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="gallery-add" element={<Galleryadd />} />
          <Route path="contactus" element={<Contactedit />} />
          <Route path="feededit" element={<Feedbackedit />} />
          <Route path="Group-edit" element={<Scheduleedit />} />
          <Route path="Group-table" element={<Scheduletble />} />
          <Route path="Group-add" element={<Scheduleadd />} />
          <Route path="attendence" element={<Attendence />} />
          <Route path="Coach" element={<CoachPage />} />
          <Route path="Coach-add" element={<CoachAddPage />} />
          <Route path="Location" element={<Located />} />
          <Route path="booking" element={<Booking />} />
          <Route path="Booking-add" element={<Bookingadd />} />


          <Route path="Located-add" element={<Locatedadd />} />
          <Route path="Located-edit/:id" element={<Locationedit />} />
          <Route path="amenities" element={<Amenities />} />
          <Route path="amenities-add" element={<AmenitiesAddPage />} />
          <Route path="sportlist" element={<Sportlist />} />
          <Route path="Sport-Add" element={<SportAdd />} />
          <Route path="Booked-user-list" element={<Bookeduser />} />
          <Route path="Venue-view " element={<Venueview />} />
          <Route path="booking-view" element={<BookingView />} />
          <Route path="Notification" element={<SendNotificationForm />} />
          <Route path="Notification-table" element={<NotificationTable />} />

          <Route path="Sector-table" element={<SectorTable />} />
          <Route path="Add-Sector-Form" element={<SectorAddForm />} />
          <Route path="Add-Sector-Edit/:id" element={<SectorEdit />} />
          <Route path="Sector-View/:id" element={<SectorView />} />

          <Route path="Industry" element={<Industry />} />
          <Route path="Industry-Add" element={<IndustryAddFrom />} />

          <Route path="Company-Add" element={<CompanyProfileForm />} />
          <Route path="Company-Edit/:id" element={<EditCompanyProfile />} />
          <Route path="Company-View/:id" element={<ViewCompanyProfile />} />
          <Route path="Company" element={<CompanyTable />} />
          <Route path="Company/:id" element={<MyCompany />} />

          <Route path="Building-Form/add" element={<BuildingFormPage />} />
          <Route path="Building-Form/:id" element={<BuildingFormPage />} />
          <Route path="Building" element={<BuildingTable />} />

          <Route path="Scope-1" element={<Scope1 />} />
          
          <Route path="Scope-One-Report" element={<ScopeOneReport/>} />
          <Route path="Air-Emission-Report-Page" element={<EmissionsReportPage/>} />

          <Route path="Stationary-Combustion-Form/add" element={<StationaryCombustionFormPage />} />
          <Route path="Stationary-Combustion-Form/:id" element={<StationaryCombustionFormPage />} />
          <Route path="Stationary-Combustion" element={<StationaryCombustionListing />} />

          <Route path="Fugitive-Emissions-Form/add" element={<FugitiveCombustionFormPage />} />
          <Route path="Fugitive-Emissions-Form/:id" element={<FugitiveCombustionFormPage />} />
          <Route path="Fugitive-Emissions" element={<FugitiveCombustionListing />} />

          <Route path="Mobile-Combustion-Form/add" element={<MobileCombustionFormPage />} />
          <Route path="Mobile-Combustion-Form/:id" element={<MobileCombustionFormPage />} />
          <Route path="Mobile-Combustion" element={<MobileCombustionListing />} />
          
          <Route path="Process-Emissions-Form/add" element={<ProcessEmissionsFormPage />} />
          <Route path="Process-Emissions-Form/:id" element={<ProcessEmissionsFormPage />} />
          <Route path="Process-Emissions" element={<ProcessEmissionsListing />} />


          <Route path="Scope-2" element={<Scope2 />} />
          <Route path="Scope-Two-Report" element={<ScopeTwoReport/>} />

          <Route path="Purchased-Electricity-Form/add" element={<PurchasedElectricityFormPage />} />
          <Route path="Purchased-Electricity-Form/:id" element={<PurchasedElectricityFormPage />} />
          <Route path="Purchased-Electricity" element={<PurchasedElectricityListing/>} />

          <Route path="Scope-3" element={<Scope3/>} />

          <Route path="Purchased-Good-Services-Form/add" element={<PurchasedGoodServicesFormPage />} />
          <Route path="Purchased-Good-Services-Form/:id" element={<PurchasedGoodServicesFormPage />} />
          <Route path="Purchased-Good-Services" element={<PurchasedGoodServicesListing/>} />

          <Route path="fuel-energy-form/add" element={<FuelEnergyForm />} />
          <Route path="fuel-energy-form/:id" element={<FuelEnergyForm />} />
          <Route path="fuel-energy" element={<FuelFusion/>} />

          <Route path="Waste-Generated-Form/add" element={<WasteGeneratedFormPage/>} />
          <Route path="Waste-Generated-Form/:id" element={<WasteGeneratedFormPage/>} />
          <Route path="Waste-Generated" element={<WasteGeneratedListing/>} />


          <Route path="Coach-edit" element={<CoachEditPage />} />


          <Route path="*" element={<Navigate to="/404" />} />
        </Route>
        <Route
          path="/404"
          element={
            <Suspense fallback={<Loading />}>
              <Error />
            </Suspense>
          }
        />
        <Route
          path="/coming-soon"
          element={
            <Suspense fallback={<Loading />}>
              <ComingSoonPage />
            </Suspense>
          }
        />
        <Route
          path="/under-construction"
          element={
            <Suspense fallback={<Loading />}>
              <UnderConstructionPage />
            </Suspense>
          }
        />
      </Routes>

    </main>

  );
}

export default App;
