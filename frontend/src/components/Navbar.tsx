import React from 'react';
import { useAuth } from '../auth/useAuth';
import { Button } from './ui/Button';
import logo from '@/assets/logo.png';
import { LogOut, User, Cpu, ChevronDown, Bot, LogIn, LayoutDashboard, ClipboardList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isAiMenuOpen, setIsAiMenuOpen] = React.useState(false);
  const location = useLocation();

  const isLandingPage = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-4">
              <img src={logo} alt="RM Logistic Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">
                RM Logistique
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-4 border-l pl-8">
              {/* Common Links (depending on page context) */}
              {isLandingPage ? (
                <>
                  <a href="#services" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-2">
                    Nos Services
                  </a>
                  <a href="#solutions" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-2">
                    Nos Solutions
                  </a>
                  <a href="#quote" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-2">
                    Demander un devis
                  </a>
                </>
              ) : (
                <Link to="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors px-2">
                  Accueil
                </Link>
              )}

              {/* Authenticated Links */}
              {isAuthenticated && (
                <>
                  <Link 
                    to="/home" 
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === '/home' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <Link 
                    to="/quotes" 
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname.startsWith('/quotes') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    Soumissions
                  </Link>

                  {/* AI Agent Hierarchical Menu */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setIsAiMenuOpen(true)}
                    onMouseLeave={() => setIsAiMenuOpen(false)}
                  >
                    <button className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === '/ai-config' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}>
                      <Bot className="h-4 w-4 text-indigo-500" />
                      AI agent
                      <ChevronDown className={`h-3 w-3 transition-transform ${isAiMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAiMenuOpen && (
                      <div className="absolute left-0 mt-0 w-48 bg-white border rounded-md shadow-lg py-1 z-50">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                          Integrations
                        </div>
                        <Link 
                          to="/ai-config" 
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          <Cpu className="h-3.5 w-3.5" />
                          Gemini API
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 mr-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-[150px] truncate">{user?.email}</span>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
