import React from 'react';
import { useAuth } from '../../auth/AuthContext';

const Home: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            Déconnexion
          </button>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Bienvenue, <span className="font-bold">{user?.email}</span> ! Vous êtes connecté à Alex Finance.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Solde Total</h3>
            <p className="text-2xl font-bold text-indigo-600">0.00 €</p>
          </div>
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Revenus</h3>
            <p className="text-2xl font-bold text-green-600">0.00 €</p>
          </div>
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Dépenses</h3>
            <p className="text-2xl font-bold text-red-600">0.00 €</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
