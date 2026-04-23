import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Home from './pages/Home/Home';
import AIConfig from './pages/AIConfig/AIConfig';
import Landing from './pages/Landing/Landing';
import QuoteList from './pages/Quotes/QuoteList';
import QuoteDetail from './pages/Quotes/QuoteDetail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-config" 
            element={
              <ProtectedRoute>
                <AIConfig />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quotes" 
            element={
              <ProtectedRoute>
                <QuoteList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quotes/:id" 
            element={
              <ProtectedRoute>
                <QuoteDetail />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
