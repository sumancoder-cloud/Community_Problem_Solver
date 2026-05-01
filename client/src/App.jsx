import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { isAuthenticated } from './utils/auth.js';
import 'react-toastify/dist/ReactToastify.css';
// import './styles/Global.css';
import './index.css';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import OTPVerify from './pages/OTPVerify.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Problems from './pages/Problems.jsx';
import ProblemDetail from './pages/ProblemDetail.jsx';
import CreateProblem from './pages/CreateProblem.jsx';
import UserProfile from './pages/UserProfile.jsx';
import TrackingHistory from './pages/TrackingHistory.jsx';
import Notifications from './pages/Notifications.jsx';
import VolunteerDashboard from './pages/VolunteerDashboard.jsx';
import RegionsDashboard from './pages/RegionsDashboard.jsx';
import VolunteerApply from './pages/VolunteerApply.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/volunteer-apply" element={<VolunteerApply />} />
                <Route path="/otp-verify" element={<OTPVerify />} />
                
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } 
                />

                <Route 
                    path="/problems" 
                    element={
                        <PrivateRoute>
                            <Problems />
                        </PrivateRoute>
                    } 
                />

                <Route 
                    path="/problems/:id" 
                    element={
                        <PrivateRoute>
                            <ProblemDetail />
                        </PrivateRoute>
                    } 
                />

                <Route 
                    path="/create-problem" 
                    element={
                        <PrivateRoute>
                            <CreateProblem />
                        </PrivateRoute>
                    } 
                />

                <Route 
                    path="/profile" 
                    element={
                        <PrivateRoute>
                            <UserProfile />
                        </PrivateRoute>
                    } 
                />

                <Route 
                    path="/tracking/:id" 
                    element={
                        <PrivateRoute>
                            <TrackingHistory />
                        </PrivateRoute>
                    } 
                />

                <Route 
                    path="/notifications" 
                    element={
                        <PrivateRoute>
                            <Notifications />
                        </PrivateRoute>
                    } 
                />

                <Route 
                    path="/volunteer" 
                    element={
                        <PrivateRoute>
                            <VolunteerDashboard />
                        </PrivateRoute>
                    } 
                />

                <Route 
                    path="/regions" 
                    element={
                        <PrivateRoute>
                            <RegionsDashboard />
                        </PrivateRoute>
                    } 
                />

                <Route 
                    path="/admin" 
                    element={
                        <PrivateRoute>
                            <AdminDashboard />
                        </PrivateRoute>
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;
