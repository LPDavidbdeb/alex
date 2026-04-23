import React, { useEffect, useState } from 'react';
import { googleApi, type GoogleStatus, type UsageMetrics } from '@/api/google';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  CheckCircle2, 
  XCircle, 
  Activity, 
  RefreshCw, 
  Brain, 
  ArrowUpRight, 
  ArrowDownLeft,
  Info
} from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '@/auth/useAuth';

export const GoogleAIStatus: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllModels, setShowAllModels] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [statusRes, metricsRes] = await Promise.all([
        googleApi.getStatus(),
        googleApi.getMetrics()
      ]);
      setStatus(statusRes);
      setMetrics(metricsRes);
    } catch (error: unknown) {
      console.error("Erreur lors de la récupération des infos Google AI:", error);
      const err = error as { message?: string };
      setStatus({
        status: 'error',
        message: err.message || "Erreur de communication avec le serveur."
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, fetchData]);

  const formatTokens = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
  };

  const displayedModels = showAllModels ? status?.models : status?.models?.slice(0, 3);

  return (
    <Card className="bg-white shadow-md border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-slate-50/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-sm font-bold">Google AI Studio (Gemini)</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchData} 
          disabled={loading || !isAuthenticated}
          className="h-8 w-8 p-0 hover:bg-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {!isAuthenticated ? (
            <div className="text-center py-4 text-slate-500 text-xs">Authentification requise...</div>
        ) : (
        <div className="space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              {status?.status === 'success' ? (
                <div className="bg-green-100 p-1.5 rounded-full">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              ) : (
                <div className="bg-red-100 p-1.5 rounded-full">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {status?.status === 'success' ? 'Clé Active' : 'Erreur de connexion'}
                </div>
                <div className="text-[10px] text-slate-500 max-w-[200px] truncate">
                  {status?.message}
                </div>
              </div>
            </div>
          </div>

          {/* Models Section */}
          {status?.models && status.models.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Modèles accessibles</div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {status.models.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {displayedModels?.map(model => (
                  <div key={model.id} className="group p-3 rounded-md border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-bold text-slate-800">{model.display_name}</div>
                      <div className="flex gap-2">
                        <div className="flex items-center text-[9px] font-medium text-slate-500 bg-white border px-1 rounded">
                           <ArrowDownLeft className="h-2.5 w-2.5 mr-0.5 text-blue-500" />
                           {formatTokens(model.input_token_limit)}
                        </div>
                        <div className="flex items-center text-[9px] font-medium text-slate-500 bg-white border px-1 rounded">
                           <ArrowUpRight className="h-2.5 w-2.5 mr-0.5 text-green-500" />
                           {formatTokens(model.output_token_limit)}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 group-hover:line-clamp-none transition-all">
                      {model.description}
                    </p>
                  </div>
                ))}
              </div>

              {status.models.length > 3 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAllModels(!showAllModels)}
                  className="w-full text-[10px] font-bold text-slate-400 hover:text-indigo-600 h-6"
                >
                  {showAllModels ? 'Voir moins' : `Voir les ${status.models.length - 3} autres modèles`}
                </Button>
              )}
            </div>
          )}

          {/* Metrics Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-indigo-600 mb-3">
              <Activity className="h-4 w-4" />
              <div className="text-xs font-black uppercase tracking-wider">Activité (24h)</div>
            </div>
            
            {metrics?.status === 'warning' ? (
                <div className="flex gap-2 p-2 bg-amber-50 border border-amber-100 rounded text-[10px] text-amber-700">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    {metrics.message}
                </div>
            ) : metrics?.request_count !== undefined ? (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 leading-none">
                  {metrics.request_count}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase">Requêtes</span>
              </div>
            ) : (
                <div className="text-[10px] text-slate-400 italic">Aucune donnée de télémétrie</div>
            )}
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  );
};
