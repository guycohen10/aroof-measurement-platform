/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AddressMethodSelector from './pages/AddressMethodSelector';
import AdminDashboard from './pages/AdminDashboard';
import AdminGodMode from './pages/AdminGodMode';
import AdminLeadPoster from './pages/AdminLeadPoster';
import AsphaltShingles3Tab from './pages/AsphaltShingles3Tab';
import AsphaltShinglesArchitectural from './pages/AsphaltShinglesArchitectural';
import Automations from './pages/Automations';
import BlogHome from './pages/BlogHome';
import BlogPost from './pages/BlogPost';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingSuccess from './pages/BookingSuccess';
import CedarShingles from './pages/CedarShingles';
import ClayTile from './pages/ClayTile';
import Commercial from './pages/Commercial';
import CompanyProfile from './pages/CompanyProfile';
import CompanyProfilePublic from './pages/CompanyProfilePublic';
import CompanySettings from './pages/CompanySettings';
import Composite from './pages/Composite';
import ConcreteTile from './pages/ConcreteTile';
import ContactInfoPage from './pages/ContactInfoPage';
import CrewDashboard from './pages/CrewDashboard';
import CrewManagement from './pages/CrewManagement';
import CustomerDetail from './pages/CustomerDetail';
import CustomerPortal from './pages/CustomerPortal';
import DispatchBoard from './pages/DispatchBoard';
import DispatchDashboard from './pages/DispatchDashboard';
import DispatchJobDetail from './pages/DispatchJobDetail';
import EPDM from './pages/EPDM';
import EmailVerification from './pages/EmailVerification';
import EmergencyRoofing from './pages/EmergencyRoofing';
import EmployeeLogin from './pages/EmployeeLogin';
import EnrollMaintenance from './pages/EnrollMaintenance';
import EstimateManager from './pages/EstimateManager';
import EstimatorDashboard from './pages/EstimatorDashboard';
import EstimatorLeadDetail from './pages/EstimatorLeadDetail';
import ExistingLeadSelector from './pages/ExistingLeadSelector';
import FollowUpSettings from './pages/FollowUpSettings';
import ForgotPassword from './pages/ForgotPassword';
import GetEstimate from './pages/GetEstimate';
import GreenRoof from './pages/GreenRoof';
import Gutters from './pages/Gutters';
import Homepage from './pages/Homepage';
import Insurance from './pages/Insurance';
import InvoiceManager from './pages/InvoiceManager';
import InvoiceView from './pages/InvoiceView';
import JobBoard from './pages/JobBoard';
import JobDetail from './pages/JobDetail';
import JobScheduling from './pages/JobScheduling';
import JoinTeam from './pages/JoinTeam';
import LeadManagement from './pages/LeadManagement';
import LeaveReview from './pages/LeaveReview';
import MaintenancePlans from './pages/MaintenancePlans';
import MeasurementPage from './pages/MeasurementPage';
import MetalShingles from './pages/MetalShingles';
import MetalStandingSeam from './pages/MetalStandingSeam';
import MyProfile from './pages/MyProfile';
import NaturalSlate from './pages/NaturalSlate';
import NewLeadForm from './pages/NewLeadForm';
import PDFDownload from './pages/PDFDownload';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProposalView from './pages/ProposalView';
import QuoteBuilder from './pages/QuoteBuilder';
import QuoteManager from './pages/QuoteManager';
import QuoteView from './pages/QuoteView';
import Results from './pages/Results';
import RoofInspection from './pages/RoofInspection';
import RoofPreview from './pages/RoofPreview';
import RoofRepair from './pages/RoofRepair';
import RoofReplacement from './pages/RoofReplacement';
import RooferBilling from './pages/RooferBilling';
import RooferBrowseLeads from './pages/RooferBrowseLeads';
import RooferDashboard from './pages/RooferDashboard';
import RooferDirectory from './pages/RooferDirectory';
import RooferForgotPassword from './pages/RooferForgotPassword';
import RooferLogin from './pages/RooferLogin';
import RooferMeasurement from './pages/RooferMeasurement';
import RooferPlans from './pages/RooferPlans';
import RooferProfile from './pages/RooferProfile';
import RooferSettings from './pages/RooferSettings';
import RooferSignup from './pages/RooferSignup';
import RoofingTypesIndex from './pages/RoofingTypesIndex';
import SelectReportType from './pages/SelectReportType';
import Services from './pages/Services';
import Siding from './pages/Siding';
import SolarTiles from './pages/SolarTiles';
import Start from './pages/Start';
import StartFunnel from './pages/StartFunnel';
import StormDamage from './pages/StormDamage';
import StormTracking from './pages/StormTracking';
import StripeCanceled from './pages/StripeCanceled';
import StripeSuccess from './pages/StripeSuccess';
import SubscriptionDetail from './pages/SubscriptionDetail';
import Subscriptions from './pages/Subscriptions';
import TPO from './pages/TPO';
import TeamManager from './pages/TeamManager';
import TermsAndConditions from './pages/TermsAndConditions';
import UpgradeProfile from './pages/UpgradeProfile';
import VerifyEmail from './pages/VerifyEmail';
import Visualizing from './pages/Visualizing';
import WalletHistory from './pages/WalletHistory';
import Windows from './pages/Windows';
import MeasurementChoice from './pages/MeasurementChoice';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AddressMethodSelector": AddressMethodSelector,
    "AdminDashboard": AdminDashboard,
    "AdminGodMode": AdminGodMode,
    "AdminLeadPoster": AdminLeadPoster,
    "AsphaltShingles3Tab": AsphaltShingles3Tab,
    "AsphaltShinglesArchitectural": AsphaltShinglesArchitectural,
    "Automations": Automations,
    "BlogHome": BlogHome,
    "BlogPost": BlogPost,
    "Booking": Booking,
    "BookingConfirmation": BookingConfirmation,
    "BookingSuccess": BookingSuccess,
    "CedarShingles": CedarShingles,
    "ClayTile": ClayTile,
    "Commercial": Commercial,
    "CompanyProfile": CompanyProfile,
    "CompanyProfilePublic": CompanyProfilePublic,
    "CompanySettings": CompanySettings,
    "Composite": Composite,
    "ConcreteTile": ConcreteTile,
    "ContactInfoPage": ContactInfoPage,
    "CrewDashboard": CrewDashboard,
    "CrewManagement": CrewManagement,
    "CustomerDetail": CustomerDetail,
    "CustomerPortal": CustomerPortal,
    "DispatchBoard": DispatchBoard,
    "DispatchDashboard": DispatchDashboard,
    "DispatchJobDetail": DispatchJobDetail,
    "EPDM": EPDM,
    "EmailVerification": EmailVerification,
    "EmergencyRoofing": EmergencyRoofing,
    "EmployeeLogin": EmployeeLogin,
    "EnrollMaintenance": EnrollMaintenance,
    "EstimateManager": EstimateManager,
    "EstimatorDashboard": EstimatorDashboard,
    "EstimatorLeadDetail": EstimatorLeadDetail,
    "ExistingLeadSelector": ExistingLeadSelector,
    "FollowUpSettings": FollowUpSettings,
    "ForgotPassword": ForgotPassword,
    "GetEstimate": GetEstimate,
    "GreenRoof": GreenRoof,
    "Gutters": Gutters,
    "Homepage": Homepage,
    "Insurance": Insurance,
    "InvoiceManager": InvoiceManager,
    "InvoiceView": InvoiceView,
    "JobBoard": JobBoard,
    "JobDetail": JobDetail,
    "JobScheduling": JobScheduling,
    "JoinTeam": JoinTeam,
    "LeadManagement": LeadManagement,
    "LeaveReview": LeaveReview,
    "MaintenancePlans": MaintenancePlans,
    "MeasurementPage": MeasurementPage,
    "MetalShingles": MetalShingles,
    "MetalStandingSeam": MetalStandingSeam,
    "MyProfile": MyProfile,
    "NaturalSlate": NaturalSlate,
    "NewLeadForm": NewLeadForm,
    "PDFDownload": PDFDownload,
    "Payment": Payment,
    "PaymentSuccess": PaymentSuccess,
    "PrivacyPolicy": PrivacyPolicy,
    "ProposalView": ProposalView,
    "QuoteBuilder": QuoteBuilder,
    "QuoteManager": QuoteManager,
    "QuoteView": QuoteView,
    "Results": Results,
    "RoofInspection": RoofInspection,
    "RoofPreview": RoofPreview,
    "RoofRepair": RoofRepair,
    "RoofReplacement": RoofReplacement,
    "RooferBilling": RooferBilling,
    "RooferBrowseLeads": RooferBrowseLeads,
    "RooferDashboard": RooferDashboard,
    "RooferDirectory": RooferDirectory,
    "RooferForgotPassword": RooferForgotPassword,
    "RooferLogin": RooferLogin,
    "RooferMeasurement": RooferMeasurement,
    "RooferPlans": RooferPlans,
    "RooferProfile": RooferProfile,
    "RooferSettings": RooferSettings,
    "RooferSignup": RooferSignup,
    "RoofingTypesIndex": RoofingTypesIndex,
    "SelectReportType": SelectReportType,
    "Services": Services,
    "Siding": Siding,
    "SolarTiles": SolarTiles,
    "Start": Start,
    "StartFunnel": StartFunnel,
    "StormDamage": StormDamage,
    "StormTracking": StormTracking,
    "StripeCanceled": StripeCanceled,
    "StripeSuccess": StripeSuccess,
    "SubscriptionDetail": SubscriptionDetail,
    "Subscriptions": Subscriptions,
    "TPO": TPO,
    "TeamManager": TeamManager,
    "TermsAndConditions": TermsAndConditions,
    "UpgradeProfile": UpgradeProfile,
    "VerifyEmail": VerifyEmail,
    "Visualizing": Visualizing,
    "WalletHistory": WalletHistory,
    "Windows": Windows,
    "MeasurementChoice": MeasurementChoice,
}

export const pagesConfig = {
    mainPage: "Homepage",
    Pages: PAGES,
    Layout: __Layout,
};