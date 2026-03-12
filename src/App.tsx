import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Home from './pages/Home'
import DeveloperSearch from './pages/DeveloperSearch'
import DeveloperProfile from './pages/DeveloperProfile'
import RepoDiscovery from './pages/RepoDiscovery'
import SavedCandidates from './pages/SavedCandidates'
import { DebugPage } from './pages/DebugPage'
import { TestAPI } from './pages/TestAPI'
import NavigationBar from './components/NavigationBar'
import { ConsoleDebugPanel } from './components/ConsoleDebugPanel'

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
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/test-api" element={<TestAPI />} />
        </Routes>
      </div>
      <Toaster />
      <ConsoleDebugPanel />
    </BrowserRouter>
  )
}

export default App
