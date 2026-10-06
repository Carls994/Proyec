'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
  const COSTO_ALQUILER_LOCAL = 1000000; // Costo total del alquiler
  const SENA_LOCAL = 500000; // Monto ya entregado como seña

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

    const calcularDias = () => {
      const fechaObjetivo = new Date(2026, 10, 14);
      const ahora = new Date();
      
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
  const metaAportes = integrantes.length * MONTO_POR_INTEGRANTE;
  const totalMeta = metaAportes + COSTO_ALQUILER_LOCAL;
  const porcentajeProgreso = totalMeta > 0 ? Math.round((totalMontoPagado / totalMeta) * 100) : 0;

  const saldoPendienteLocal = COSTO_ALQUILER_LOCAL - SENA_LOCAL;

  const formatGs = (amount: number) => {
    return new Intl.NumberFormat('es-PY').format(amount) + ' Gs.';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.4, 
        ease: [0, 0, 0.2, 1] as const 
      } 
    },
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-3 py-4 sm:p-6 flex justify-center items-start w-full">
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.94; transform: scale(0.995); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
        .glow-text {
          text-shadow: 0 0 12px rgba(245, 158, 11, 0.6), 0 0 24px rgba(217, 119, 6, 0.4);
        }
      `}</style>

      <motion.div 
        className="w-full max-w-xl mx-auto space-y-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Header */}
        <header className="space-y-4 pb-5 border-b border-slate-800 text-center w-full">
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-2 w-full">
            <span className="px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider text-center">
              Gestión de Integrantes y Aportes
            </span>
            
            <Link href="/admin">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                🔒 Acceso Admin
              </motion.span>
            </Link>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-2xl sm:text-3xl font-extrabold text-white text-center">
            Cumpleaños de Ña Tani
          </motion.h1>

          {/* Bloque de datos */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-1.5 w-full text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
              Lugar: <strong className="text-white">CAPRICORNIO</strong>
            </div>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://www.instagram.com/capricornioeventos_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-600/20 hover:bg-pink-600/40 border border-pink-500/40 text-pink-300 hover:text-white font-semibold transition-all"
            >
              📸 <span>Ver Instagram</span>
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://maps.app.goo.gl/2bH8DYdhPo2RVx2K8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 hover:text-white font-semibold transition-all"
            >
              📍 <span>Ver ubicación</span>
            </motion.a>

            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
              📅 Sábado 14 de Noviembre de 2026
            </div>
            
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
              ⏰ A partir de las 09:00 hs
            </div>
          </motion.div>

          {/* Tarjeta Destacada: Conteo de Días */}
          <motion.div variants={itemVariants} className="w-full bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border-2 border-amber-500/60 rounded-2xl py-3.5 px-4 shadow-[0_0_25px_rgba(245,158,11,0.2)] animate-pulse-subtle relative overflow-hidden flex items-center justify-center">
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
          </motion.div>

          {/* TARJETA DESTACADA: ESTADO DEL ALQUILER DEL LOCAL */}
          <motion.div variants={itemVariants} className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-purple-300 uppercase tracking-wide">
                <span>🏢</span>
                <span>Alquiler del Local (CAPRICORNIO)</span>
              </div>
              <span className="font-extrabold text-purple-200 font-mono text-sm">{formatGs(COSTO_ALQUILER_LOCAL)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/40 flex flex-col justify-center items-center">
                <span className="text-[10px] text-emerald-300 uppercase font-bold flex items-center gap-1">
                  ✅ Señado / Pagado
                </span>
                <span className="font-extrabold text-emerald-200 font-mono text-xs mt-0.5">{formatGs(SENA_LOCAL)}</span>
              </div>

              <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-500/40 flex flex-col justify-center items-center">
                <span className="text-[10px] text-amber-300 uppercase font-bold flex items-center gap-1">
                  ⏳ Restante por Pagar
                </span>
                <span className="font-extrabold text-amber-200 font-mono text-xs mt-0.5">{formatGs(saldoPendienteLocal)}</span>
              </div>
            </div>
          </motion.div>

          {/* Tarjetas de Resumen Financiero */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2.5 pt-1 text-center w-full">
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

            {/* Tarjeta de Saldo en Caja */}
            <div className="col-span-2 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 shadow-lg flex items-center justify-between px-4">
              <div className="text-left">
                <span className="block text-xs font-bold text-cyan-400 uppercase tracking-wider">💵 Total en Caja</span>
                <span className="text-[10px] text-slate-400 block">Efectivo / Cuenta disponible</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-lg sm:text-xl font-black text-cyan-200">{formatGs(saldoEnCaja)}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setModalAbierto(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/50 text-cyan-200 text-xs font-bold transition-all"
                >
                  🔍 Ver Detalles
                </motion.button>
              </div>
            </div>

            {/* Barra de Progreso Animada */}
            <div className="col-span-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-300 uppercase">Progreso de la Meta</span>
                <span className="text-xs font-extrabold text-emerald-400">{porcentajeProgreso}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-300 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${porcentajeProgreso}%` }}
                  transition={{ duration: 1.2, ease: [0, 0, 0.2, 1] }}
                />
              </div>
            </div>
          </motion.div>
        </header>

        {/* Lista Pública */}
        <motion.div variants={itemVariants} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl w-full">
          <div className="divide-y divide-slate-800/80">
            {integrantes.map((item, index) => {
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
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
                  className="px-3.5 py-3 flex items-center justify-between gap-2 transition-colors"
                >
                  <span className="font-medium text-slate-100 text-sm truncate flex-1 min-w-0">{item.nombre}</span>
                  <span className="font-mono text-xs font-semibold text-slate-400 shrink-0">
                    {formatGs(MONTO_POR_INTEGRANTE)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle} shrink-0 uppercase tracking-wide`}>
                    {textoMostrar}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </motion.div>

      {/* MODAL EMERGENTE ANIMADO */}
      <AnimatePresence>
        {modalAbierto && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalAbierto(false)}
          >
            <motion.div 
              className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 relative text-left"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  📊 Movimientos de Caja
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setModalAbierto(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  aria-label="Cerrar modal"
                >
                  ✕
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Ingresos Totales</span>
                  <span className="text-emerald-400 font-extrabold text-sm mt-0.5 block">{formatGs(totalMontoPagado)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Egresos Totales</span>
                  <span className="text-rose-400 font-extrabold text-sm mt-0.5 block">{formatGs(totalGastos)}</span>
                </div>
              </div>

              {/* Detalle del Alquiler del Local dentro del Modal */}
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-1 text-xs">
                <div className="flex justify-between items-center font-bold text-purple-300">
                  <span>🏢 Total Alquiler Local:</span>
                  <span className="font-mono text-purple-200">{formatGs(COSTO_ALQUILER_LOCAL)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-emerald-400">
                  <span>• Seña entregada (50%):</span>
                  <span className="font-mono font-bold">-{formatGs(SENA_LOCAL)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-amber-300 pt-1 border-t border-purple-900/60 font-semibold">
                  <span>• Saldo restante local:</span>
                  <span className="font-mono">{formatGs(saldoPendienteLocal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Egresos Registrados</h4>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {gastos.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-3">No hay gastos registrados aún.</p>
                  ) : (
                    gastos.map((g) => {
                      const esSenaLocal = Number(g.monto) === SENA_LOCAL || g.concepto.toLowerCase().includes('seña') || g.concepto.toLowerCase().includes('local');
                      return (
                        <div 
                          key={g.id} 
                          className={`p-2.5 rounded-lg border flex justify-between items-center ${
                            esSenaLocal 
                              ? 'bg-purple-950/40 border-purple-500/50' 
                              : 'bg-slate-950/80 border-slate-800/80'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-slate-200 font-medium">{g.concepto}</span>
                            {esSenaLocal && (
                              <span className="text-[9px] text-purple-300 font-semibold">Destinado a seña del local</span>
                            )}
                          </div>
                          <span className="text-rose-400 font-mono font-bold">-{formatGs(Number(g.monto))}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/50 flex justify-between items-center text-xs">
                <span className="font-bold text-cyan-300 uppercase">Saldo Neto Disponible en Caja:</span>
                <span className="font-extrabold text-sm text-cyan-200 font-mono">{formatGs(saldoEnCaja)}</span>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
