import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes
} from 'react-router-dom';

import { Home } from './pages/home/Home';

export const MainRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    )
}