import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import HRDashboard from "./Pages/HRDashboard";
import EmployeeCreateDto from "./Pages/EmployeeCreateDto";
import Onboarding from "./Pages/Onboarding";
import EditEmployee from "./Pages/EditEmployee"; 
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/HRDashboard"
          element={
            <ProtectedRoute>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
raksha Addhela
      
        <Route
          path="/EmployeeCreateDto"
          element={
            <ProtectedRoute>
              <EmployeeCreateDto />
            </ProtectedRoute>
          }
        />

        <Route
          path="/onboarding/:employeeId"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
          
        

        <Route
          path="/edit-employee/:employeeId"
          element={
            <ProtectedRoute>
              <EditEmployee />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
