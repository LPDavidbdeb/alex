import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { quotesApi, type QuoteRequest } from '@/api/quotes';
import { 
  FileText, 
  Search, 
  ArrowRight, 
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const QuoteList: React.FC = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchName] = useState('');

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await quotesApi.list();
        setQuotes(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des devis:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const filteredQuotes = quotes.filter(quote => 
    `${quote.first_name} ${quote.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <FileText className="h-7 w-7 text-indigo-600" />
              Soumissions de devis
            </h1>
            <p className="text-sm text-slate-500">Consultez et gérez les demandes de transport entrantes.</p>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un nom ou email..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Client</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Trajet</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Équipement</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuotes.length > 0 ? filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {quote.first_name[0]}{quote.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{quote.first_name} {quote.last_name}</p>
                            <p className="text-xs text-slate-500">{quote.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <span className="font-medium truncate max-w-[150px]">{quote.pick_up_address.label}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="font-medium truncate max-w-[150px]">{quote.final_drop_address.label}</span>
                        </div>
                        {quote.is_multi_drop && (
                           <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1 rounded mt-1 inline-block">Multi-arrêts</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {quote.equipment_types.length > 0 ? quote.equipment_types.slice(0, 2).map(et => (
                            <span key={et.id} className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase">
                              {et.label_fr}
                            </span>
                          )) : (
                            <span className="text-[9px] text-slate-400 italic">Aucun</span>
                          )}
                          {quote.equipment_types.length > 2 && (
                            <span className="text-[9px] text-slate-400">+{quote.equipment_types.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(quote.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/quotes/${quote.id}`}>
                          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 group-hover:translate-x-1 transition-all">
                             Détails
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                        Aucune demande trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuoteList;
