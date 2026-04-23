import React, { useState, useEffect } from 'react';
import { analyticsApi, type QuoteAnalysis } from '@/api/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Brain, Sparkles, Loader2, Code, RefreshCw } from 'lucide-react';

interface Props {
  quoteId: number;
}

export const QuoteAnalysisView: React.FC<Props> = ({ quoteId }) => {
  const [analysis, setAnalysis] = useState<QuoteAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const data = await analyticsApi.get(quoteId);
        setAnalysis(data);
      } catch {
        // No analysis yet
      }
    };
    fetchExisting();
  }, [quoteId]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await analyticsApi.analyze(quoteId);
      setAnalysis(data);
    } catch {
      // Error handling already managed by loading/null states
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (val: unknown): string => {
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    return String(val);
  };

  if (!analysis && !loading) {
    return (
      <Card className="bg-indigo-50 border-indigo-200 border-dashed">
        <CardContent className="py-10 text-center space-y-4">
          <Brain className="h-12 w-12 text-indigo-400 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-indigo-900 uppercase">Expertise IA RM Logistique</h3>
            <p className="text-sm text-indigo-700">Lancer l'analyse stratégique du dossier.</p>
          </div>
          <Button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700 font-bold">
            <Sparkles className="h-4 w-4 mr-2" />
            GÉNÉRER L'ANALYSE
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="py-20 text-center space-y-4">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
          <p className="text-lg font-black text-slate-800 uppercase animate-pulse">Gemini traite les données...</p>
        </CardContent>
      </Card>
    );
  }

  const rawData = analysis?.full_response || {};

  return (
    <div className="space-y-6">
      <Card className="bg-white border-l-4 border-l-indigo-600 shadow-md">
        <CardHeader className="border-b bg-slate-50/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Rapport Stratégique</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowRaw(!showRaw)} className="text-[10px] font-bold text-slate-400 uppercase h-8">
            <Code className="h-3 w-3 mr-1" /> {showRaw ? 'Masquer JSON' : 'Voir JSON'}
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
            <div className="space-y-6">
                {Object.entries(rawData).map(([key, value]) => {
                    if (key === 'scenarios' && Array.isArray(value)) return null;
                    return (
                        <div key={key} className="space-y-1">
                            <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-tighter">{key.replace(/_/g, ' ')}</h4>
                            <p className="text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                {renderValue(value)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </CardContent>
      </Card>

      {Array.isArray(rawData.scenarios) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rawData.scenarios.map((s: Record<string, unknown>, idx: number) => (
                <Card key={idx} className="hover:shadow-xl transition-all border-slate-200 overflow-hidden group text-slate-800">
                    <CardHeader className="bg-indigo-600 text-white pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest">Scénario {idx + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {Object.entries(s).map(([sKey, sVal]) => (
                            <div key={sKey} className="border-b border-slate-50 pb-2 last:border-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{sKey.replace(/_/g, ' ')}</p>
                                <div className="text-xs font-bold mt-1">
                                    {Array.isArray(sVal) ? (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {sVal.map((item, i) => <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">{String(item)}</span>)}
                                        </div>
                                    ) : renderValue(sVal)}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
      )}

      {showRaw && (
        <Card className="bg-slate-900 text-green-400 border-none">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Code className="h-4 w-4" /> Debug : Raw Gemini Response
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <pre className="text-[10px] font-mono leading-tight overflow-x-auto">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="pt-4 flex justify-center">
          <Button onClick={handleGenerate} variant="outline" size="sm" className="text-[10px] font-bold text-indigo-600 border-indigo-200">
              <RefreshCw className={`h-3 w-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
              RE-GÉNÉRER TOUTE L'ANALYSE
          </Button>
      </div>
    </div>
  );
};
