'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Integrante {
  id: number;
  nombre: string;
  estado: string;
  monto_pagado: number;
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState('Pendiente');
  const [nuevoMonto, setNuevoMonto] = useState<number>(0);

  // Estados para edicion
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEdit, setNombreEdit] = useState('');

  const fetchIntegrantes = async () => {
    try {
      const res = await fetch('/api/integrantes');
      if (res.ok) {
        const data = await res.json();
        setIntegrantes(data);
      }
    } catch (err) {
      console.error('Error al cargar integrantes:', err);
    }
  };

  useEffect(() => {
    if (autenticado) {
      fetchIntegrantes();
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

  // CREATE
  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    let monto = 0;
    if (nuevoEstado === 'Pagado') monto = 100000;
    if (nuevoEstado === 'Parcial') monto = nuevoMonto;

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
    setNuevoMonto(0);
    setNuevoEstado('Pendiente');
    fetchIntegrantes();
  };

  // UPDATE ESTADO
  const handleCambiarEstado = async (id: number, estado: string, montoActual: number) => {
    let monto = 0;
    if (estado === 'Pagado') monto = 100000;
    if (estado === 'Parcial') {
      const resp = prompt('Ingrese el monto abonado (Gs.):', String(montoActual || 50000));
      if (resp === null) return;
      monto = Number(resp) || 0;
    }

    await fetch('/api/integrantes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado, monto_pagado: monto }),
    });

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

  // DELETE
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
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Panel Admin - Gestión CRUD</h1>
          <p className="text-xs text-slate-400">Bienvenido, {username}</p>
        </div>
        <Link href="/" className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-slate-300 transition-colors">
          👁️ Ver sitio público
        </Link>
      </div>

      {/* CREATE: Formulario para Agregar */}
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
            type="number"
            placeholder="Monto Gs."
            value={nuevoMonto}
            onChange={(e) => setNuevoMonto(Number(e.target.value))}
            className="w-28 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        )}

        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Registrar
        </button>
      </form>

      {/* READ, UPDATE, DELETE: Lista Interactiva */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
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
                    onClick={() => handleCambiarEstado(item.id, 'Pagado', item.monto_pagado)}
                    className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                  >
                    Pagado
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(item.id, 'Parcial', item.monto_pagado)}
                    className="px-2.5 py-1.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-medium hover:bg-sky-500/30 transition-colors"
                  >
                    Parcial
                  </button>
                  <button
                    onClick={() => handleCambiarEstado(item.id, 'Pendiente', 0)}
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
    </div>
  );
}
