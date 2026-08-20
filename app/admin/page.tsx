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

export default function AdminPage() {
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el nuevo gasto
  const [conceptoGasto, setConceptoGasto] = useState('');
  const [montoGasto, setMontoGasto] = useState('');
  const [submittingGasto, setSubmittingGasto] = useState(false);

  const MONTO_POR_INTEGRANTE = 100000;

  const cargarDatos = async () => {
    try {
      const [resInt, resGas] = await Promise.all([
        fetch('/api/integrantes', { cache: 'no-store' }),
        fetch('/api/gastos', { cache: 'no-store' }),
      ]);
      const dataInt = await resInt.json();
      const dataGas = await resGas.json();

      setIntegrantes(Array.isArray(dataInt) ? dataInt : []);
      setGastos(Array.isArray(dataGas) ? dataGas : []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Totales de Caja
  let totalRecaudado = 0;
  integrantes.forEach((i) => {
    const est = String(i.estado).toLowerCase();
    const abonado = Number(i.monto_pagado) || 0;

    if (est.includes('pagado') || i.estado === true) {
      totalRecaudado += MONTO_POR_INTEGRANTE;
    } else if (est.includes('parcial')) {
      totalRecaudado += abonado;
    }
  });

  const totalGastos = gastos.reduce((acc, g) => acc + Number(g.monto || 0), 0);
  const saldoEnCaja = totalRecaudado - totalGastos;

  const formatGs = (amount: number) => {
    return new Intl.NumberFormat('es-PY').format(amount) + ' Gs.';
  };

  // Guardar Nuevo Gasto
  const handleRegistrarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = Number(montoGasto);

    if (!conceptoGasto.trim() || !montoNum || montoNum <= 0) {
      alert('⚠️ Ingrese un concepto válido y un monto mayor a 0 Gs.');
      return;
    }

    if (montoNum > saldoEnCaja) {
      alert(`❌ Saldo insuficiente. Disponible actual: ${formatGs(saldoEnCaja)}`);
      return;
    }

    setSubmittingGasto(true);

    try {
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto: conceptoGasto,
          monto: montoNum,
        }),
      });

      if (res.ok) {
        setConceptoGasto('');
        setMontoGasto('');
        await cargarDatos();
      } else {
        alert('Ocurrió un error al guardar el gasto.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión al registrar el gasto.');
    } finally {
      setSubmittingGasto(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-black text-white">Panel Administrador</h1>
            <p className="text-xs text-slate-400">Control de Integrantes y Registro de Gastos</p>
          </div>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            ← Inicio
          </Link>
        </div>

        {/* Resumen Financiero */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Ingresos</span>
            <span className="text-sm font-black text-emerald-400 mt-1 block">{formatGs(totalRecaudado)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Gastos</span>
            <span className="text-sm font-black text-rose-400 mt-1 block">{formatGs(totalGastos)}</span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40">
            <span className="text-[10px] font-bold text-cyan-400 uppercase block">Disponible</span>
            <span className="text-sm font-black text-cyan-200 mt-1 block">{formatGs(saldoEnCaja)}</span>
          </div>
        </div>

        {/* Formulario de Registro de Gastos */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            💸 Registrar Egreso de Caja
          </h2>

          <form onSubmit={handleRegistrarGasto} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Concepto / Destino del Dinero</label>
              <input
                type="text"
                placeholder="Ej: Pago de alquiler o compra de insumos"
                value={conceptoGasto}
                onChange={(e) => setConceptoGasto(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Monto en Gs.</label>
              <input
                type="number"
                placeholder="Ej: 150000"
                value={montoGasto}
                onChange={(e) => setMontoGasto(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingGasto}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {submittingGasto ? 'Guardando...' : 'Confirmar Gasto'}
            </button>
          </form>
        </div>

        {/* Historial de Gastos */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            📋 Historial de Gastos Registrados
          </h2>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {gastos.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-3">No hay gastos registrados.</p>
            ) : (
              gastos.map((g) => (
                <div key={g.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block">{g.concepto}</span>
                    {g.fecha && (
                      <span className="text-[10px] text-slate-500">
                        {new Date(g.fecha).toLocaleDateString('es-PY')}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-rose-400 text-sm">
                    -{formatGs(Number(g.monto))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
