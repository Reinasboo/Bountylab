import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import DeveloperSearch from './pages/DeveloperSearch';
import DeveloperProfile from './pages/DeveloperProfile';
import RepoDiscovery from './pages/RepoDiscovery';
import SavedCandidates from './pages/SavedCandidates';
import NavigationBar from './components/NavigationBar';
function App() {
    return (_jsxs(BrowserRouter, { children: [_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx(NavigationBar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/developers", element: _jsx(DeveloperSearch, {}) }), _jsx(Route, { path: "/developer/:login", element: _jsx(DeveloperProfile, {}) }), _jsx(Route, { path: "/repos", element: _jsx(RepoDiscovery, {}) }), _jsx(Route, { path: "/candidates", element: _jsx(SavedCandidates, {}) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/developers", replace: true }) })] })] }), _jsx(Toaster, {})] }));
}
export default App;
