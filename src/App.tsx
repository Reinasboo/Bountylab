import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Home from './pages/Home'
import DeveloperSearch from './pages/DeveloperSearch'
import DeveloperProfile from './pages/DeveloperProfile'
import RepoDiscovery from './pages/RepoDiscovery'
import SavedCandidates from './pages/SavedCandidates'
import NavigationBar from './components/NavigationBar'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/developers" element={<DeveloperSearch />} />
          <Route path="/developer/:login" element={<DeveloperProfile />} />
          <Route path="/repos" element={<RepoDiscovery />} />
          <Route path="/candidates" element={<SavedCandidates />} />
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
