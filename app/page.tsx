'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Integrante {
  id: number;
  nombre: string;
  estado?: string | boolean;
  monto_pagado?: number | string;
}

interface Gasto {
  id: number;
  concepto: string;
  monto: number | string;
  fecha?: string;
}

export default function Home() {
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Estado para el conteo de días
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);

  const MONTO_POR_INTEGRANTE = 100000;

  useEffect(() => {
    async function fetchData() {
      try {
        const resIntegrantes = await fetch('/api/integrantes', { cache: 'no-store' });
        const dataIntegrantes = await resIntegrantes.json();
        setIntegrantes(Array.isArray(dataIntegrantes) ? dataIntegrantes : []);

        const resGastos = await fetch('/api/gastos', { cache: 'no-store' });
        const dataGastos = await resGastos.json();
        setGastos(Array.isArray(dataGastos) ? dataGastos : []);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Lógica para calcular los días faltantes para el 14/11/2026
    const calcularDias = () => {
      const fechaObjetivo = new Date(2026, 10, 14); // Mes 10 es Noviembre (0-indexed)
      const ahora = new Date();
      
      // Ajuste de medianoche para cálculo exacto de días
      fechaObjetivo.setHours(0, 0, 0, 0);
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

      const diferenciaTiempo = fechaObjetivo.getTime() - hoy.getTime();
      const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

      setDiasRestantes(diferenciaDias);
    };

    calcularDias();
  }, []);

  let totalMontoPagado = 0;
  let cantidadPagadosCompletos = 0;

  integrantes.forEach((i) => {
    const est = String(i.estado).toLowerCase();
    const abonado = Number(i.monto_pagado) || 0;

    if (est.includes('pagado') || i.estado === true) {
      totalMontoPagado += MONTO_POR_INTEGRANTE;
      cantidadPagadosCompletos += 1;
    } else if (est.includes('parcial')) {
      totalMontoPagado += abonado;
    }
  });

  const totalGastos = gastos.reduce((acc, g) => acc + Number(g.monto || 0), 0);
  const saldoEnCaja = totalMontoPagado - totalGastos;
  const totalMeta = integrantes.length * MONTO_POR_INTEGRANTE;
  const porcentajeProgreso = totalMeta > 0 ? Math.round((totalMontoPagado / totalMeta) * 100) : 0;

  const formatGs = (amount: number) => {
    return new Intl.NumberFormat('es-PY').format(amount) + ' Gs.';
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-3 py-4 sm:p-6 flex justify-center items-start w-full">
      
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.92; transform: scale(0.99); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
        .glow-text {
          text-shadow: 0 0 12px rgba(245, 158, 11, 0.6), 0 0 24px rgba(217, 119, 6, 0.4);
        }
      `}</style>

      <div className="w-full max-w-xl mx-auto space-y-5">
        
        {/* Header */}
        <header className="space-y-4 pb-5 border-b border-slate-800 text-center w-full">
          <div className="flex flex-col items-center justify-center gap-2 w-full">
            <span className="px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider text-center">
              Gestión de Integrantes y Aportes
            </span>
            
            <Link
              href="/admin"
              className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              🔒 Acceso Admin
            </Link>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center">
            Cumpleaños de Ña Tani
          </h1>

          {/* Bloque de datos */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 w-full text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
              Lugar: <strong className="text-white">CAPRICORNIO</strong>
            </div>

            <a
              href="https://www.instagram.com/capricornioeventos_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/40 border border-pink-500/40 text-pink-300 hover:text-white font-semibold transition-all"
            >
              📸 <span>Ver Instagram</span>
            </a>

            <a
              href="https://maps.app.goo.gl/2bH8DYdhPo2RVx2K8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 hover:text-white font-semibold transition-all"
            >
              📍 <span>Ver ubicación</span>
            </a>

            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
              📅 Sábado 14 de Noviembre de 2026
            </div>
            
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
              ⏰ A partir de las 09:00 hs
            </div>
          </div>

          {/* Tarjeta Destacada: Conteo de Días Solo */}
          <div className="w-full bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border-2 border-amber-500/60 rounded-2xl py-3.5 px-4 shadow-[0_0_25px_rgba(245,158,11,0.2)] animate-pulse-subtle relative overflow-hidden flex items-center justify-center">
            
            {diasRestantes !== null ? (
              diasRestantes > 0 ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-200 text-base sm:text-lg font-bold">Faltan</span>
                  <span className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 glow-text tracking-tight">
                    {diasRestantes}
                  </span>
                  <span className="text-slate-200 text-base sm:text-lg font-bold">
                    {diasRestantes === 1 ? 'día' : 'días'}
                  </span>
                </div>
              ) : diasRestantes === 0 ? (
                <span className="text-xl sm:text-2xl font-black text-amber-300 glow-text uppercase tracking-wider">
                  🎉 ¡Hoy es el gran día! 🎉
                </span>
              ) : (
                <span className="text-sm font-semibold text-slate-400">
                  El evento ya ha concluido
                </span>
              )
            ) : (
              <span className="text-sm font-medium text-amber-300/70 animate-pulse">
                Calculando días...
              </span>
            )}

          </div>

          {/* Tarjetas de Resumen Financiero */}
          <div className="grid grid-cols-2 gap-2.5 pt-1 text-center w-full">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="block text-xs font-bold text-slate-400 uppercase">Integrantes</span>
              <span className="text-2xl font-black text-white block mt-0.5">{integrantes.length}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="block text-xs font-bold text-slate-400 uppercase">Completados</span>
              <span className="text-2xl font-black text-emerald-400 block mt-0.5">
                {cantidadPagadosCompletos} <span className="text-xs text-slate-400 font-normal">/ {integrantes.length}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30">
              <span className="block text-xs font-bold text-indigo-400 uppercase">Meta Total</span>
              <span className="text-sm sm:text-base font-extrabold text-indigo-200 block mt-0.5">{formatGs(totalMeta)}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
              <span className="block text-xs font-bold text-emerald-400 uppercase">Recaudado</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-300 block mt-0.5">{formatGs(totalMontoPagado)}</span>
            </div>

            {/* Tarjeta de Saldo en Caja con Botón para Abrir Modal */}
            <div className="col-span-2 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 shadow-lg flex items-center justify-between px-4">
              <div className="text-left">
                <span className="block text-xs font-bold text-cyan-400 uppercase tracking-wider">💵 Total en Caja</span>
                <span className="text-[10px] text-slate-400 block">Efectivo / Cuenta disponible</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-lg sm:text-xl font-black text-cyan-200">{formatGs(saldoEnCaja)}</span>
                <button
                  onClick={() => setModalAbierto(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/50 text-cyan-200 text-xs font-bold transition-all active:scale-95"
                >
                  🔍 Ver Detalles
                </button>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="col-span-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-300 uppercase">Progreso de la Meta</span>
                <span className="text-xs font-extrabold text-emerald-400">{porcentajeProgreso}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${porcentajeProgreso}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Lista Pública */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl w-full">
          <div className="divide-y divide-slate-800/80">
            {integrantes.map((item) => {
              const estadoTexto = String(item.estado ?? 'Pendiente');
              const estLower = estadoTexto.toLowerCase();
              const abonado = Number(item.monto_pagado) || 0;

              let badgeStyle = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
              let textoMostrar = estadoTexto.toUpperCase();

              if (estLower.includes('pagado')) {
                badgeStyle = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
                textoMostrar = 'PAGADO';
              } else if (estLower.includes('parcial')) {
                badgeStyle = 'bg-sky-500/10 border-sky-500/30 text-sky-400';
                textoMostrar = `PARCIAL (${formatGs(abonado)})`;
              } else if (estLower.includes('pendiente')) {
                textoMostrar = 'PENDIENTE';
              }

              return (
                <div key={item.id} className="px-3.5 py-3 flex items-center justify-between gap-2 hover:bg-slate-800/30 transition-colors">
                  <span className="font-medium text-slate-100 text-sm truncate flex-1 min-w-0">{item.nombre}</span>
                  <span className="font-mono text-xs font-semibold text-slate-400 shrink-0">
                    {formatGs(MONTO_POR_INTEGRANTE)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle} shrink-0 uppercase tracking-wide`}>
                    {textoMostrar}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MODAL EMERGENTE DE DETALLES DE CAJA */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 relative text-left">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                📊 Movimientos de Caja
              </h3>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Resumen rápido en Modal */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Ingresos Totales</span>
                <span className="text-emerald-400 font-extrabold text-sm mt-0.5 block">{formatGs(totalMontoPagado)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Gastos / Compras</span>
                <span className="text-rose-400 font-extrabold text-sm mt-0.5 block">{formatGs(totalGastos)}</span>
              </div>
            </div>

            {/* Historial de Gastos */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Egresos Registrados</h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {gastos.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-3">No hay gastos registrados aún.</p>
                ) : (
                  gastos.map((g) => (
                    <div key={g.id} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                      <span className="text-slate-200 font-medium">{g.concepto}</span>
                      <span className="text-rose-400 font-mono font-bold">-{formatGs(Number(g.monto))}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total Neto Disponibilidad */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/50 flex justify-between items-center text-xs">
              <span className="font-bold text-cyan-300 uppercase">Saldo Neto Disponible:</span>
              <span className="font-extrabold text-sm text-cyan-200 font-mono">{formatGs(saldoEnCaja)}</span>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
