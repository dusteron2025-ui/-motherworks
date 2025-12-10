"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Star, Shield, Clock, Heart, Sparkles, Smartphone, Users, DollarSign } from "lucide-react";
import { PhoneMockup } from "@/components/PhoneMockup";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'CLIENT' | 'PROVIDER'>('CLIENT');

  return (
    <div className="flex min-h-screen flex-col font-sans selection:bg-teal-100 selection:text-teal-900">

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-teal-600 tracking-tight">
            <div className="bg-teal-100 p-2 rounded-xl shadow-sm">
              <Heart className="h-6 w-6 fill-teal-600" />
            </div>
            MotherWorks
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <Link href="#how-it-works" className="hover:text-teal-600 transition-colors">Como Funciona</Link>
            <Link href="#benefits" className="hover:text-teal-600 transition-colors">Benefícios</Link>
            <Link href="#app-showcase" className="hover:text-teal-600 transition-colors">O App</Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-teal-600 hover:bg-teal-50">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20 rounded-full px-6">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-purple-50 -z-10"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm text-teal-800">
                <span className="flex h-2 w-2 rounded-full bg-teal-600 mr-2 animate-pulse"></span>
                A plataforma #1 de cuidados em Portugal
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Cuidado que <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-purple-600">transforma</span> lares.
              </h1>
              <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                Conectamos profissionais de limpeza verificadas a famílias que buscam qualidade, confiança e tempo livre.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/20 w-full sm:w-auto">
                    Agendar Limpeza <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-slate-50 w-full sm:w-auto">
                    Quero Trabalhar
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-8 h-8 rounded-full border-2 border-white" />
                  ))}
                </div>
                <p>+2.000 clientes felizes</p>
              </div>
            </div>

            <div className="relative animate-in fade-in zoom-in duration-1000 delay-200 hidden md:block">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-3xl"></div>
              <div className="relative z-10 bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://media.istockphoto.com/id/1390532053/photo/father-and-son-doing-laundry-together.jpg?s=612x612&w=0&k=20&c=p1uy0l3MErVLRzlqg1G-SVxylKEmB5Yh1Q4gNmq5E3I="
                  alt="Father and son doing laundry together"
                  className="rounded-2xl shadow-sm w-full h-[400px] object-cover"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">100% Verificadas</p>
                    <p className="text-xs text-slate-500">Segurança garantida</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* App Showcase Section */}
        <section id="app-showcase" className="py-24 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
          <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px]"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Tudo na palma da sua mão
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Uma experiência completa e intuitiva, desenhada tanto para quem precisa de ajuda quanto para quem oferece seus serviços.
              </p>

              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setActiveTab('CLIENT')}
                  className={cn(
                    "px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                    activeTab === 'CLIENT'
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30 scale-105"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  <Users className="w-4 h-4" /> Para Clientes
                </button>
                <button
                  onClick={() => setActiveTab('PROVIDER')}
                  className={cn(
                    "px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                    activeTab === 'PROVIDER'
                      ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  )}
                >
                  <Sparkles className="w-4 h-4" /> Para Profissionais
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
              {/* Phone Mockup */}
              <div className="order-2 md:order-1 flex justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-teal-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
                <div className="relative z-10 transform transition-all duration-500 hover:scale-105">
                  <PhoneMockup
                    imageSrc={
                      activeTab === 'CLIENT'
                        ? "/screenshots/client-dashboard.png"
                        : "/screenshots/provider-dashboard.png"
                    }
                  />
                </div>
              </div>

              {/* Content */}
              <div className="order-1 md:order-2 space-y-8">
                {activeTab === 'CLIENT' ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="inline-block p-3 bg-teal-500/10 rounded-2xl mb-2">
                      <Smartphone className="w-8 h-8 text-teal-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white">Contrate uma limpeza em segundos</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">Agendamento Fácil</p>
                          <p className="text-slate-400 text-sm">Escolha o serviço, data e hora em poucos cliques.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">Profissionais de Confiança</p>
                          <p className="text-slate-400 text-sm">Acesse perfis detalhados com avaliações e selos.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">Pagamento Seguro</p>
                          <p className="text-slate-400 text-sm">Tudo feito pelo app, sem precisar de dinheiro vivo.</p>
                        </div>
                      </li>
                    </ul>
                    <Link href="/signup">
                      <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-8 h-12 mt-4">
                        Quero um serviço pra mim
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="inline-block p-3 bg-purple-500/10 rounded-2xl mb-2">
                      <DollarSign className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-white">Gerencie seu negócio e lucre mais</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">Liberdade Total</p>
                          <p className="text-slate-400 text-sm">Defina seus horários, preços e área de atuação.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">Pagamentos Garantidos</p>
                          <p className="text-slate-400 text-sm">Receba semanalmente direto na sua conta.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-purple-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">Reputação Profissional</p>
                          <p className="text-slate-400 text-sm">Construa sua carreira com reviews e selos de qualidade.</p>
                        </div>
                      </li>
                    </ul>
                    <Link href="/signup">
                      <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-8 h-12 mt-4">
                        Quero trabalhar com limpeza
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="plans" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 -z-20"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 -z-10"></div>

          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                Planos que se adaptam a você
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Garanta sua casa sempre limpa com nossos planos de assinatura. Mais economia e tranquilidade.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Monthly Plan */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-teal-500/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col hover:-translate-y-2 transition-transform duration-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Mensal</h3>
                    <p className="text-slate-400 text-sm">Para manutenção básica</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">€120</span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-teal-500" /> 1 Limpeza Completa
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-teal-500" /> 4h de duração
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-teal-500" /> Produtos inclusos
                    </li>
                  </ul>
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl h-12">
                    Escolher Mensal
                  </Button>
                </div>
              </div>

              {/* Bi-weekly Plan (Popular) */}
              <div className="relative group transform md:-translate-y-4">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 to-teal-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative h-full bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 rounded-3xl flex flex-col hover:-translate-y-2 transition-transform duration-300 shadow-2xl">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    Mais Popular
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Quinzenal</h3>
                    <p className="text-slate-400 text-sm">O equilíbrio perfeito</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">€220</span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-white font-medium">
                      <CheckCircle2 className="w-5 h-5 text-purple-400" /> 2 Limpezas Completas
                    </li>
                    <li className="flex items-center gap-3 text-white font-medium">
                      <CheckCircle2 className="w-5 h-5 text-purple-400" /> 4h de duração cada
                    </li>
                    <li className="flex items-center gap-3 text-white font-medium">
                      <CheckCircle2 className="w-5 h-5 text-purple-400" /> Produtos inclusos
                    </li>
                    <li className="flex items-center gap-3 text-white font-medium">
                      <CheckCircle2 className="w-5 h-5 text-purple-400" /> 10% de desconto extra
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white border-none rounded-xl h-12 shadow-lg shadow-purple-500/25 font-bold text-lg">
                    Escolher Quinzenal
                  </Button>
                </div>
              </div>

              {/* Weekly Plan */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col hover:-translate-y-2 transition-transform duration-300">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">Semanal</h3>
                    <p className="text-slate-400 text-sm">Casa sempre impecável</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">€400</span>
                    <span className="text-slate-500">/mês</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-purple-500" /> 4 Limpezas Completas
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-purple-500" /> 4h de duração cada
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-purple-500" /> Produtos inclusos
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-purple-500" /> Prioridade no agendamento
                    </li>
                  </ul>
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl h-12">
                    Escolher Semanal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Como a MotherWorks funciona</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Simples, transparente e eficiente. Do agendamento à finalização.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Clock, title: "1. Agende", desc: "Diga o que precisa, quando e onde. Nosso sistema encontra as melhores opções." },
                { icon: Users, title: "2. Escolha", desc: "Compare perfis, preços e avaliações. Escolha quem mais combina com você." },
                { icon: Sparkles, title: "3. Relaxe", desc: "A profissional vai até você. O pagamento é liberado apenas após o serviço." }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-teal-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Pronto para transformar sua rotina?</h2>
            <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já descobriram a facilidade de ter uma casa sempre impecável.
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-16 px-10 text-lg rounded-full bg-white text-teal-700 hover:bg-teal-50 shadow-2xl">
                Começar Gratuitamente
              </Button>
            </Link>
          </div>
        </section>

      </main>

      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-2xl text-white">
              <Heart className="h-6 w-6 fill-teal-500 text-teal-500" />
              MotherWorks
            </div>
            <p className="text-sm text-slate-400">
              Conectando lares a profissionais de excelência. Cuidado, confiança e tecnologia.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-teal-400">Para Clientes</Link></li>
              <li><Link href="#" className="hover:text-teal-400">Para Profissionais</Link></li>
              <li><Link href="#" className="hover:text-teal-400">Segurança</Link></li>
              <li><Link href="#" className="hover:text-teal-400">Preços</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-teal-400">Sobre Nós</Link></li>
              <li><Link href="#" className="hover:text-teal-400">Carreiras</Link></li>
              <li><Link href="#" className="hover:text-teal-400">Blog</Link></li>
              <li><Link href="#" className="hover:text-teal-400">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-teal-400">Termos de Uso</Link></li>
              <li><Link href="#" className="hover:text-teal-400">Privacidade</Link></li>
              <li><Link href="#" className="hover:text-teal-400">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          © 2024 MotherWorks. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
