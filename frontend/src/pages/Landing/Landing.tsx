import React from 'react';
import { Navbar } from '@/components/Navbar';
import { PublicFooter } from '@/components/PublicFooter';
import { QuoteForm } from '@/components/QuoteForm';
import { 
  Truck, 
  ShieldCheck, 
  BarChart3, 
  Road, 
  Ship, 
  Plane, 
  TrainFront,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-8">
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none uppercase">
              Logistique <span className="text-indigo-500">Sans Limites</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium max-w-2xl leading-relaxed">
              Solutions de transport intelligentes pour le marché canadien et international. Fiabilité, expertise et innovation technologique.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="h-14 px-8 text-lg font-bold" onClick={() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' })}>
                DEMANDER UN DEVIS
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-white text-white hover:bg-white hover:text-slate-900 transition-all">
                NOS SOLUTIONS
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block">
          <ChevronDown className="h-8 w-8 text-slate-500" />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-[10px] font-black tracking-[0.2em] text-indigo-600 uppercase">Nos Services</h2>
            <p className="text-4xl font-black text-slate-900 uppercase tracking-tight">Expertise Logistique</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard 
              icon={<Truck className="h-10 w-10" />}
              title="Fret (Freight)"
              description="Gestion complète de vos cargaisons standard et complexes à travers le continent."
            />
            <ServiceCard 
              icon={<ShieldCheck className="h-10 w-10" />}
              title="Spécialisé"
              description="Équipements sur mesure et transport hors normes pour vos projets les plus exigeants."
            />
            <ServiceCard 
              icon={<BarChart3 className="h-10 w-10" />}
              title="Service Conseil"
              description="Optimisation de chaîne d'approvisionnement et stratégie logistique personnalisée."
            />
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black tracking-[0.2em] text-indigo-600 uppercase">Nos Solutions</h2>
                <p className="text-4xl font-black text-slate-900 uppercase tracking-tight">Transport Multimodal</p>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">
                Qu'il s'agisse de transport routier, ferroviaire, maritime ou aérien, RM Logistique déploie les ressources nécessaires pour acheminer vos marchandises en toute sécurité.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <SolutionItem icon={<Road className="h-5 w-5" />} label="Route" />
                <SolutionItem icon={<TrainFront className="h-5 w-5" />} label="Train" />
                <SolutionItem icon={<Ship className="h-5 w-5" />} label="Océan" />
                <SolutionItem icon={<Plane className="h-5 w-5" />} label="Air" />
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-square lg:aspect-video">
                <img src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" alt="Logistics" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-indigo-600/20 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section id="quote" className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 skew-x-12 translate-x-1/4" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="text-white space-y-8">
              <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tight leading-none">
                Prêt à <span className="text-indigo-500">Optimiser</span> Vos Opérations ?
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                Remplissez le formulaire de soumission et obtenez une analyse détaillée de vos besoins de transport. Notre équipe d'experts est prête à relever vos défis.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm font-bold bg-white/5 p-4 rounded-lg border border-white/10">
                    <span className="bg-indigo-600 h-2 w-2 rounded-full animate-ping" />
                    Réponse en moins de 24 heures
                </div>
                <div className="flex items-center gap-4 text-sm font-bold bg-white/5 p-4 rounded-lg border border-white/10">
                    <span className="bg-indigo-600 h-2 w-2 rounded-full" />
                    Support dédié 24/7
                </div>
              </div>
            </div>
            <QuoteForm />
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

const ServiceCard: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
    <div className="text-indigo-600 mb-6 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-black text-slate-900 uppercase mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </div>
);

const SolutionItem: React.FC<{icon: React.ReactNode, label: string}> = ({icon, label}) => (
  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-all cursor-default group">
    <div className="text-indigo-500 group-hover:scale-110 transition-transform">{icon}</div>
    <span className="font-bold text-slate-700 text-sm uppercase">{label}</span>
  </div>
);

export default Landing;
