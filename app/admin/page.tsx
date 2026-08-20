'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Integrante {
  id: number;
  nombre: string;
  estado: string;
  monto_pagado: number;
}

interface Gasto {
  id: number;
  concepto: string;
  monto: number;
  fecha?: string;
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('Pendiente');
  const [nuevoMontoFormatted, setNuevoMontoFormatted] = useState('');

  // Estados para edicion de integrante
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEdit, setNombreEdit] = useState('');

  // Estado para Modal/Edición rápida de Pago Parcial
  const [parcialModalItem, setParcialModalItem] = useState<Integrante | null>(null);
  const [montoParcialFormatted, setMontoParcialFormatted] = useState('');

  // Estados para gastos
  const [conceptoGasto, setConceptoGasto] = useState('');
  const [montoGasto, setMontoGasto] = useState('');
  const [submittingGasto, setSubmittingGasto] = useState(false);

  const MONTO_POR_INTEGRANTE = 100000;

  // FUNCIÓN AUXILIAR PARA DAR FORMATO DE MILES
  const formatNumberWithDots = (value: string | number) => {
    const rawValue = String(value).replace(/\D/g, '');
    if (!rawValue) return '';
    return new Intl.NumberFormat('es-PY').format(Number(rawValue));
  };

  const fetchIntegrantes = async () => {
    try {
      const res = await fetch('/api/integrantes');
      if (res.ok) {
        const data = await res.json();
        setIntegrantes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error al cargar integrantes:', err);
    }
  };

  const fetchGastos = async () => {
    try {
      const res = await fetch('/api/gastos');
      if (res.ok) {
        const data = await res.json();
        setGastos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error al cargar gastos:', err);
    }
  };

  useEffect(() => {
    if (autenticado) {
      fetchIntegrantes();
      fetchGastos();
    }
  }, [autenticado]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      setAutenticado(true);
    } else {
      const data = await res.json();
      setErrorLogin(data.error || 'Credenciales inválidas');
    }
  };

  // CREATE INTEGRANTE
  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    let monto = 0;
    if (nuevoEstado === 'Pagado') monto = 100000;
    if (nuevoEstado === 'Parcial') {
      monto = Number(nuevoMontoFormatted.replace(/\./g, '')) || 0;
    }

    await fetch('/api/integrantes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nuevoNombre,
        estado: nuevoEstado,
        monto_pagado: monto,
      }),
    });

    setNuevoNombre('');
    setNuevoMontoFormatted('');
    setNuevoEstado('Pendiente');
    fetchIntegrantes();
  };

  // UPDATE ESTADO (Pagado o Pendiente)
  const handleCambiarEstado = async (id: number, estado: string) => {
    let monto = 0;
    if (estado === 'Pagado') monto = 100000;

    await fetch('/api/integrantes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado, monto_pagado: monto }),
    });

    fetchIntegrantes();
  };

  // ABRIR MODAL PARCIAL
  const handleAbrirModalParcial = (item: Integrante) => {
    setParcialModalItem(item);
    const montoInicial = item.monto_pagado || 50000;
    setMontoParcialFormatted(formatNumberWithDots(montoInicial));
  };

  // CONFIRMAR PAGO PARCIAL DESDE EL MODAL
  const handleGuardarParcial = async () => {
    if (!parcialModalItem) return;
    const montoNum = Number(montoParcialFormatted.replace(/\./g, '')) || 0;

    await fetch('/api/integrantes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: parcialModalItem.id,
        estado: 'Parcial',
        monto_pagado: montoNum,
      }),
    });

    setParcialModalItem(null);
    setMontoParcialFormatted('');
    fetchIntegrantes();
  };

  // UPDATE NOMBRE
  const handleGuardarNombre = async (id: number) => {
    if (!nombreEdit.trim()) return;

    await fetch('/api/integrantes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, nombre: nombreEdit }),
    });

    setEditandoId(null);
    setNombreEdit('');
    fetchIntegrantes();
  };

  // DELETE INTEGRANTE
  const handleEliminar = async (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a "${nombre}"?`)) {
      await fetch('/api/integrantes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchIntegrantes();
    }
  };

  // CÁLCULOS DE SALDOS Y CAJA
  let totalRecaudado = 0;
  integrantes.forEach((i) => {
    const est = String(i.estado || '').toLowerCase();
    const abonado = Number(i.monto_pagado) || 0;

    if (est.includes('pagado')) {
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

  // MANEJO DE FORMATO DE MONTO EN TIEMPO REAL PARA GASTOS
  const handleMontoGastoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMontoGasto(formatNumberWithDots(e.target.value));
  };

  // REGISTRAR NUEVO GASTO
  const handleRegistrarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = Number(montoGasto.replace(/\./g, ''));

    if (!conceptoGasto.trim() || !montoNum || montoNum <= 0) {
      alert('⚠️ Ingrese un concepto válido y un monto mayor a 0 Gs.');
      return;
    }

    if (montoNum > saldoEnCaja) {
      alert(`❌ Saldo insuficiente en caja. Disponible actual: ${formatGs(saldoEnCaja)}`);
      return;
    }

    setSubmittingGasto(true);

    try {
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concepto: conceptoGasto, monto: montoNum }),
      });

      if (res.ok) {
        setConceptoGasto('');
        setMontoGasto('');
        fetchGastos();
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

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 w-full max-w-sm space-y-4 shadow-xl">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold">Acceso Administrador</h2>
            <p className="text-xs text-slate-400">Ingresa tus credenciales de acceso</p>
          </div>

          {errorLogin && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
              {errorLogin}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Usuario</label>
              <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
            Ingresar
          </button>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:underline">
              ← Volver a la vista pública
            </Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header Admin */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Panel Admin - Gestión CRUD</h1>
          <p className="text-xs text-slate-400">Bienvenido, {username}</p>
        </div>
        <Link href="/" className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-slate-300 transition-colors">
          👁️ Ver sitio público
        </Link>
      </div>

      {/* TARJETAS DE SALDO Y CAJA */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Recaudado</span>
          <span className="text-sm sm:text-base font-black text-emerald-400 mt-1 block">{formatGs(totalRecaudado)}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Gastos</span>
          <span className="text-sm sm:text-base font-black text-rose-400 mt-1 block">{formatGs(totalGastos)}</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 shadow-lg">
          <span className="text-[10px] font-bold text-cyan-400 uppercase block">Disponible Caja</span>
          <span className="text-sm sm:text-base font-black text-cyan-200 mt-1 block">{formatGs(saldoEnCaja)}</span>
        </div>
      </div>

      {/* CREATE: Formulario para Agregar Integrante */}
      <form onSubmit={handleAgregar} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Nombre Completo"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className="flex-1 min-w-[200px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          required
        />
        <select
          value={nuevoEstado}
          onChange={(e) => setNuevoEstado(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Pagado">Pagado</option>
          <option value="Parcial">Parcial</option>
        </select>

        {nuevoEstado === 'Parcial' && (
          <input
            type="text"
            placeholder="Monto Gs."
            value={nuevoMontoFormatted}
            onChange={(e) => setNuevoMontoFormatted(formatNumberWithDots(e.target.value))}
            className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            required
          />
        )}

        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Registrar
        </button>
      </form>

      {/* READ, UPDATE, DELETE: Lista Interactiva de Integrantes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 font-bold text-xs text-slate-300 uppercase tracking-wider">
          👥 Listado de Integrantes
        </div>
        <div className="divide-y divide-slate-800">
          {integrantes.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              No hay integrantes registrados.
            </div>
          ) : (
            integrantes.map((item) => (
              <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                
                {/* EDICIÓN DE NOMBRE O VISUALIZACIÓN */}
                <div className="flex-1">
                  {editandoId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nombreEdit}
                        onChange={(e) => setNombreEdit(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleGuardarNombre(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-lg"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-100">{item.nombre}</p>
                      <button
                        onClick={() => {
                          setEditandoId(item.id);
                          setNombreEdit(item.nombre);
                        }}
                        className="text-slate-400 hover:text-indigo-400 text-xs"
                        title="Editar Nombre"
                      >
                        ✏️
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-slate-400 mt-0.5">
                    Estado: <strong className="text-slate-200">{String(item.estado ?? 'Pendiente')}</strong>
                    {String(item.estado).toLowerCase().includes('parcial') && 
                      ` (${new Intl.NumberFormat('es-PY').format(Number(item.monto_pagado) || 0)} Gs.)`}
                  </p>
                </div>

                {/* ACCIONES CRUD: ESTADOS Y ELIMINAR */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCambiarEstado(item.id, 'Pagado')}
                    className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                  >
                    Pagado
                  </button>
                  <button
                    onClick={() => handleAbrirModalParcial(item)}
                    className="px-2.5 py-1.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-medium hover:bg-sky-500/30 transition-colors"
                  >
                    Parcial
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(item.id, 'Pendiente')}
                    className="px-2.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition-colors"
                  >
                    Pendiente
                  </button>

                  <button
                    onClick={() => handleEliminar(item.id, item.nombre)}
                    className="px-2.5 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium hover:bg-rose-500/40 transition-colors ml-1"
                    title="Eliminar Registro"
                  >
                    🗑️
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* FORMULARIO DE REGISTRO DE GASTOS */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          💸 Registrar Egreso / Gasto de Caja
        </h2>
        <form onSubmit={handleRegistrarGasto} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Concepto o destino del dinero (ej: Alquiler)"
            value={conceptoGasto}
            onChange={(e) => setConceptoGasto(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            required
          />
          <input
            type="text"
            placeholder="Monto Gs."
            value={montoGasto}
            onChange={handleMontoGastoChange}
            className="w-full sm:w-36 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={submittingGasto}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {submittingGasto ? 'Guardando...' : 'Confirmar Gasto'}
          </button>
        </form>
      </div>

      {/* HISTORIAL DE GASTOS REGISTRADOS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          📋 Historial de Gastos Registrados
        </h2>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {gastos.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-2">No hay gastos registrados aún.</p>
          ) : (
            gastos.map((g) => (
              <div key={g.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
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

      {/* MODAL FLOTANTE PARA INGRESAR MONTO PARCIAL CON SEPARADOR DE MILES */}
      {parcialModalItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="font-bold text-lg text-slate-100">Registrar Pago Parcial</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Integrante: <strong className="text-indigo-400">{parcialModalItem.nombre}</strong>
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Monto Abonado (Gs.)</label>
              <input
                type="text"
                autoFocus
                value={montoParcialFormatted}
                onChange={(e) => setMontoParcialFormatted(formatNumberWithDots(e.target.value))}
                placeholder="Ej: 50.000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-base font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setParcialModalItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarParcial}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Guardar Pago
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
