import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom';

import { Dashboard } from './pages/dashboard/Dashboard';
import { Login } from './pages/login/Login';

export const MainRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/dashboard/:folderId" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/dashboard/home" />} />
            </Routes>
        </Router>
    );
};
