import React from 'react';
import logo from '@/assets/logo.png';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & Address */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="RM Logistic Logo" className="h-8 w-auto brightness-0 invert" />
              <span className="text-xl font-bold text-white">RM Logistique</span>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-bold text-white uppercase text-[10px] tracking-wider mb-2">Siège Social</p>
              <p>507 Place D’armes suite 400</p>
              <p>Montreal, Quebec</p>
              <p>H2Y 2W8</p>
              <p className="pt-2 font-bold text-white">1.877.484.7766</p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold uppercase text-[10px] tracking-wider mb-4">Nos Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Fret (Freight)</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Spécialisé</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Service Conseil</a></li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-white font-bold uppercase text-[10px] tracking-wider mb-4">Nos Solutions</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Route (Road)</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Train</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Océan</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Air</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold uppercase text-[10px] tracking-wider mb-4">Entreprise</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">À propos</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Carrières</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-[10px] uppercase tracking-widest font-medium">
          © {new Date().getFullYear()} RM Logistique Inc. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};
