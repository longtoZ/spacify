import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom';

import { Home } from './pages/dashboard/Dashboard';
import { Login } from './pages/login/Login';

export const MainRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/dashboard" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};
