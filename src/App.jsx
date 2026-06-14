import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PageTransition from './components/ui/PageTransition';
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
import ShearingForceCalc from './pages/calculators/sheetmetal/ShearingForceCalc';
import DeepDrawSim from './pages/calculators/sheetmetal/DeepDrawSim';
// CAE
import VonMisesStress from './pages/calculators/cae/VonMisesStress';
import BeamDeflection from './pages/calculators/cae/BeamDeflection';
import NaturalFrequency from './pages/calculators/cae/NaturalFrequency';
import ReynoldsNumber from './pages/calculators/cae/ReynoldsNumber';
import HeatTransfer from './pages/calculators/cae/HeatTransfer';
// Plastics
import ClampForce from './pages/calculators/plastics/ClampForce';
import InjectionPressure from './pages/calculators/plastics/InjectionPressure';
import CoolingTime from './pages/calculators/plastics/CoolingTime';
import ShrinkageCalc from './pages/calculators/plastics/ShrinkageCalc';
import RunnerGateSizing from './pages/calculators/plastics/RunnerGateSizing';
// Simulators
import HydraulicCircuitSim from './pages/calculators/simulators/HydraulicCircuitSim';
import HydraulicCylinderSim from './pages/calculators/simulators/HydraulicCylinderSim';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        {/* Hydraulics — 6 calculators */}
        <Route path="/calc/pump" element={<PageTransition><PumpCalculator /></PageTransition>} />
        <Route path="/calc/filter" element={<PageTransition><FilterSelection /></PageTransition>} />
        <Route path="/calc/pipe" element={<PageTransition><PipeHoseSizing /></PageTransition>} />
        <Route path="/calc/cooler" element={<PageTransition><OilCoolerSizing /></PageTransition>} />
        <Route path="/calc/pressure-drop" element={<PageTransition><PressureDropCalc /></PageTransition>} />
        <Route path="/calc/hyd-summary" element={<PageTransition><SystemSummary /></PageTransition>} />
        {/* Linkages — 3 calculators */}
        <Route path="/calc/fnr" element={<PageTransition><FNRMechanism /></PageTransition>} />
        <Route path="/calc/cable" element={<PageTransition><CableCalculator /></PageTransition>} />
        <Route path="/calc/fourbar" element={<PageTransition><FourBarLinkage /></PageTransition>} />
        {/* Sheet Metal — 6 calculators */}
        <Route path="/calc/bend" element={<PageTransition><BendAllowance /></PageTransition>} />
        <Route path="/calc/blank" element={<PageTransition><BlankSizeCalc /></PageTransition>} />
        <Route path="/calc/tonnage" element={<PageTransition><PressTonnage /></PageTransition>} />
        <Route path="/calc/springback" element={<PageTransition><SpringbackCalc /></PageTransition>} />
        <Route path="/calc/shearing" element={<PageTransition><ShearingForceCalc /></PageTransition>} />
        <Route path="/calc/deep-draw" element={<PageTransition><DeepDrawSim /></PageTransition>} />
        {/* CAE — 5 calculators */}
        <Route path="/calc/vonmises" element={<PageTransition><VonMisesStress /></PageTransition>} />
        <Route path="/calc/beam" element={<PageTransition><BeamDeflection /></PageTransition>} />
        <Route path="/calc/nvh" element={<PageTransition><NaturalFrequency /></PageTransition>} />
        <Route path="/calc/reynolds" element={<PageTransition><ReynoldsNumber /></PageTransition>} />
        <Route path="/calc/heat" element={<PageTransition><HeatTransfer /></PageTransition>} />
        {/* Plastics — 5 calculators */}
        <Route path="/calc/clamp-force" element={<PageTransition><ClampForce /></PageTransition>} />
        <Route path="/calc/injection-pressure" element={<PageTransition><InjectionPressure /></PageTransition>} />
        <Route path="/calc/cooling-time" element={<PageTransition><CoolingTime /></PageTransition>} />
        <Route path="/calc/shrinkage" element={<PageTransition><ShrinkageCalc /></PageTransition>} />
        <Route path="/calc/runner-gate" element={<PageTransition><RunnerGateSizing /></PageTransition>} />
        {/* Simulators — 2 */}
        <Route path="/sim/hydraulic-circuit" element={<HydraulicCircuitSim />} />
        <Route path="/sim/hydraulic-cylinder" element={<PageTransition><HydraulicCylinderSim /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <AnimatedRoutes />
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
