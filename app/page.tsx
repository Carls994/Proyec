'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export interface Integrante {
  id: number;
  nombre: string;
  tipo: 'aportante' | 'invitado' | 'nino';
  estado?: string | boolean;
  monto_pagado?: number | string;
}

interface Gasto {
  id: number;
  concepto: string;
  monto: number | string;
}

export default function Home() {
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Pestaña activa en la lista pública
  const [categoriaActiva, setCategoriaActiva] = useState<'aportante' | 'invitado' | 'nino'>('aportante');

  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);

  const MONTO_POR_INTEGRANTE = 100000;
  const COSTO_ALQUILER_LOCAL = 1000000;

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
      setDiasRestantes(Math.ceil(diferenciaTiempo / (1000 * 3600 * 24)));
    };

    calcularDias();
  }, []);

  // Filtrado por categorías
  const aportantes = integrantes.filter((i) => (i.tipo || 'aportante') === 'aportante');
  const invitados = integrantes.filter((i) => i.tipo === 'invitado');
  const ninos = integrantes.filter((i) => i.tipo === 'nino');

  // Cálculos financieros (se basan en los Aportantes)
  let totalMontoPagado = 0;
  let cantidadPagadosCompletos = 0;

  aportantes.forEach((i) => {
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
  const totalMeta = aportantes.length * MONTO_POR_INTEGRANTE;
  const porcentajeProgreso = totalMeta > 0 ? Math.round((totalMontoPagado / totalMeta) * 100) : 0;

  const formatGs = (amount: number) => new Intl.NumberFormat('es-PY').format(amount) + ' Gs.';

  const integrantesFiltrados = 
    categoriaActiva === 'aportante' ? aportantes :
    categoriaActiva === 'invitado' ? invitados : ninos;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-3 py-4 sm:p-6 flex justify-center items-start w-full">
      <div className="w-full max-w-xl mx-auto space-y-4">
        
        {/* Header */}
        <header className="space-y-3 pb-4 border-b border-slate-800 text-center w-full">
          <div className="flex flex-col items-center justify-center gap-2 w-full">
            <span className="px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              Gestión de Evento y Asistencia
            </span>
            <Link href="/admin">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium cursor-pointer">
                🔒 Acceso Admin
              </span>
            </Link>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center">
            Cumpleaños de Ña Tani
          </h1>

          {/* Datos Generales */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 w-full text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
              Lugar: <strong className="text-white">CAPRICORNIO</strong>
            </div>
            <a href="https://www.instagram.com/capricornioeventos_/" target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-pink-600/20 border border-pink-500/40 text-pink-300 text-xs font-semibold">
              📸 Instagram
            </a>
            <a href="https://maps.app.goo.gl/2bH8DYdhPo2RVx2K8" target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 text-xs font-semibold">
              📍 Ubicación
            </a>
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
              📅 Sáb. 14 Nov 2026
            </div>
          </div>

          {/* Conteo de Días */}
          <div className="w-full bg-amber-950/30 border border-amber-500/50 rounded-2xl py-2.5 px-4 text-center">
            {diasRestantes !== null && (
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-slate-300 text-sm font-bold">Faltan</span>
                <span className="text-3xl font-black text-amber-300">{diasRestantes}</span>
                <span className="text-slate-300 text-sm font-bold">días</span>
              </div>
            )}
          </div>

          {/* Bloque Alquiler */}
          <div className="px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/40 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            <span className="text-purple-200 font-extrabold uppercase">🏢 Capricornio</span>
            <span>Costo: <strong className="text-white">{formatGs(COSTO_ALQUILER_LOCAL)}</strong></span>
            <span>•</span>
            <span>Seña: <strong className="text-emerald-300">500.000 Gs.</strong></span>
            <span>•</span>
            <span>Saldo: <strong className="text-amber-300">500.000 Gs.</strong></span>
          </div>

          {/* Métricas Financieras */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-center w-full">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Aportantes</span>
              <span className="text-xl font-black text-white">{aportantes.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Completados</span>
              <span className="text-xl font-black text-emerald-400">{cantidadPagadosCompletos} / {aportantes.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-[10px] font-bold text-indigo-400 uppercase">Meta Total</span>
              <span className="text-xs font-extrabold text-indigo-200">{formatGs(totalMeta)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="block text-[10px] font-bold text-emerald-400 uppercase">Recaudado</span>
              <span className="text-xs font-extrabold text-emerald-300">{formatGs(totalMontoPagado)}</span>
            </div>

            {/* Caja */}
            <div className="col-span-2 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between px-4">
              <span className="text-xs font-bold text-cyan-400 uppercase">💵 Total en Caja</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-cyan-200">{formatGs(saldoEnCaja)}</span>
                <button onClick={() => setModalAbierto(true)} className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-200 text-xs font-bold">
                  🔍 Detalles
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* --- BOTONES DE SELECCIÓN DE CATEGORÍA --- */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setCategoriaActiva('aportante')}
            className={`py-2 px-1 text-xs font-extrabold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              categoriaActiva === 'aportante'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>💳 Aportantes</span>
            <span className="text-[10px] opacity-80">({aportantes.length})</span>
          </button>

          <button
            onClick={() => setCategoriaActiva('invitado')}
            className={`py-2 px-1 text-xs font-extrabold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              categoriaActiva === 'invitado'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🤝 Invitados</span>
            <span className="text-[10px] opacity-80">({invitados.length})</span>
          </button>

          <button
            onClick={() => setCategoriaActiva('nino')}
            className={`py-2 px-1 text-xs font-extrabold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              categoriaActiva === 'nino'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🎈 Niños</span>
            <span className="text-[10px] opacity-80">({ninos.length})</span>
          </button>
        </div>

        {/* LISTA SEGÚN CATEGORÍA SELECCIONADA */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl w-full">
          {integrantesFiltrados.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No hay personas registradas en esta categoría.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {integrantesFiltrados.map((item) => {
                if (categoriaActiva === 'aportante') {
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
                  }

                  return (
                    <div key={item.id} className="px-3.5 py-3 flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-100 text-sm truncate flex-1">{item.nombre}</span>
                      <span className="font-mono text-xs text-slate-400 shrink-0">100.000 Gs.</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeStyle} shrink-0`}>
                        {textoMostrar}
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div key={item.id} className="px-3.5 py-3 flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-100 text-sm truncate">{item.nombre}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {categoriaActiva === 'invitado' ? 'Invitado Confirmado' : 'Niño / Asistente'}
                      </span>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
