import Homepage from './pages/Homepage';
import UserTypeSelection from './pages/UserTypeSelection';
import HomeownerForm from './pages/HomeownerForm';
import RooferForm from './pages/RooferForm';
import Payment from './pages/Payment';
import MeasurementTool from './pages/MeasurementTool';
import Results from './pages/Results';
import AdminDashboard from './pages/AdminDashboard';
import HomeownerStart from './pages/HomeownerStart';
import RooferStart from './pages/RooferStart';
import Measure from './pages/Measure';
import SimpleResults from './pages/SimpleResults';


export const PAGES = {
    "Homepage": Homepage,
    "UserTypeSelection": UserTypeSelection,
    "HomeownerForm": HomeownerForm,
    "RooferForm": RooferForm,
    "Payment": Payment,
    "MeasurementTool": MeasurementTool,
    "Results": Results,
    "AdminDashboard": AdminDashboard,
    "HomeownerStart": HomeownerStart,
    "RooferStart": RooferStart,
    "Measure": Measure,
    "SimpleResults": SimpleResults,
}

export const pagesConfig = {
    mainPage: "Homepage",
    Pages: PAGES,
};