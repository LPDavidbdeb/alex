import React from 'react';
import { Navbar } from '@/components/Navbar';
import { GoogleAIStatus } from '@/components/GoogleAIStatus';
import { Cpu, Settings, ShieldCheck } from 'lucide-react';

const AIConfig: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Cpu className="h-8 w-8 text-indigo-600" />
            Configuration AI Agent
          </h1>
          <p className="text-slate-500 mt-2">
            Gérez vos intégrations d'intelligence artificielle et surveillez leur utilisation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Settings className="h-5 w-5" />
              <h2>Google AI Studio (Gemini)</h2>
            </div>
            
            <div className="max-w-md">
                <GoogleAIStatus />
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <h2>Sécurité et Quotas</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              L'accès à l'API Gemini est sécurisé via vos clés API Google Cloud. 
              Les métriques d'utilisation sont extraites en temps réel via Google Cloud Monitoring 
              pour assurer une transparence totale sur la consommation de jetons et les limites de requêtes.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AIConfig;
