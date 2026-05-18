import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// Hydraulics
import PumpCalculator from './pages/calculators/hydraulics/PumpCalculator';
import FilterSelection from './pages/calculators/hydraulics/FilterSelection';
import PipeHoseSizing from './pages/calculators/hydraulics/PipeHoseSizing';
import OilCoolerSizing from './pages/calculators/hydraulics/OilCoolerSizing';
import PressureDropCalc from './pages/calculators/hydraulics/PressureDropCalc';
import SystemSummary from './pages/calculators/hydraulics/SystemSummary';
// Linkages
import FNRMechanism from './pages/calculators/linkages/FNRMechanism';
import CableCalculator from './pages/calculators/linkages/CableCalculator';
import FourBarLinkage from './pages/calculators/linkages/FourBarLinkage';
// Sheet Metal
import BendAllowance from './pages/calculators/sheetmetal/BendAllowance';
import BlankSizeCalc from './pages/calculators/sheetmetal/BlankSizeCalc';
import PressTonnage from './pages/calculators/sheetmetal/PressTonnage';
import SpringbackCalc from './pages/calculators/sheetmetal/SpringbackCalc';
// CAE
import VonMisesStress from './pages/calculators/cae/VonMisesStress';
import BeamDeflection from './pages/calculators/cae/BeamDeflection';
import NaturalFrequency from './pages/calculators/cae/NaturalFrequency';
import ReynoldsNumber from './pages/calculators/cae/ReynoldsNumber';
import HeatTransfer from './pages/calculators/cae/HeatTransfer';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Hydraulics — 6 calculators */}
            <Route path="/calc/pump" element={<PumpCalculator />} />
            <Route path="/calc/filter" element={<FilterSelection />} />
            <Route path="/calc/pipe" element={<PipeHoseSizing />} />
            <Route path="/calc/cooler" element={<OilCoolerSizing />} />
            <Route path="/calc/pressure-drop" element={<PressureDropCalc />} />
            <Route path="/calc/hyd-summary" element={<SystemSummary />} />
            {/* Linkages — 3 calculators */}
            <Route path="/calc/fnr" element={<FNRMechanism />} />
            <Route path="/calc/cable" element={<CableCalculator />} />
            <Route path="/calc/fourbar" element={<FourBarLinkage />} />
            {/* Sheet Metal — 4 calculators */}
            <Route path="/calc/bend" element={<BendAllowance />} />
            <Route path="/calc/blank" element={<BlankSizeCalc />} />
            <Route path="/calc/tonnage" element={<PressTonnage />} />
            <Route path="/calc/springback" element={<SpringbackCalc />} />
            {/* CAE — 5 calculators */}
            <Route path="/calc/vonmises" element={<VonMisesStress />} />
            <Route path="/calc/beam" element={<BeamDeflection />} />
            <Route path="/calc/nvh" element={<NaturalFrequency />} />
            <Route path="/calc/reynolds" element={<ReynoldsNumber />} />
            <Route path="/calc/heat" element={<HeatTransfer />} />
          </Routes>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
