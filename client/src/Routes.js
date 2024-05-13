import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom';

import { Dashboard } from './pages/dashboard/Dashboard';
import { Login } from './pages/login/Login';
import { Search } from './pages/search/Search';

export const MainRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/dashboard/:folderId" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/search" element={<Search />} />
                <Route path="*" element={<Navigate to="/dashboard/home" />} />
            </Routes>
        </Router>
    );
};
