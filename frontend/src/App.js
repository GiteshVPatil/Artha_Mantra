import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import AIReport from "./pages/AIReport";

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import PrivateRoute from './components/Auth/PrivateRoute';
import AIChatbot from './components/AIChatbot';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Trading from './pages/Trading';
import Market from './pages/Market';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import EducatorDashboard from './pages/EducatorDashboard';
import News from './pages/News';


// Styles
import './styles/global.css';

// ✅ NEW EDUCATOR ROUTE COMPONENT
const EducatorRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'educator') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="App">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/ai-report" element={<AIReport />} />
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/portfolio" element={
                    <PrivateRoute>
                      <Portfolio />
                    </PrivateRoute>
                  } />
                  <Route path="/trading" element={
                    <PrivateRoute>
                      <Trading />
                    </PrivateRoute>
                  } />
                  <Route path="/market" element={
                    <PrivateRoute>
                      <Market />
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  <Route path="/analytics" element={
                    <PrivateRoute>
                      <Analytics />
                    </PrivateRoute>
                  } />
                  <Route path="/notifications" element={
                    <PrivateRoute>
                      <Notifications />
                    </PrivateRoute>
                  } />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/news" element={<News />} />
                  
                  {/* ✅ EDUCATOR DASHBOARD ROUTE - NOW WITH PROPER COMPONENT */}
                  <Route path="/educator-dashboard" element={
                    <EducatorRoute>
                      <EducatorDashboard />
                    </EducatorRoute>
                  } />
                  
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
              <Footer />

              {/* AI Chatbot - appears on all pages as floating button */}
              <AIChatbot />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
