import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Leer (GET)
export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM integrantes ORDER BY id ASC');
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al obtener datos' }, { status: 500 });
  }
}

// Crear (POST)
export async function POST(request: Request) {
  try {
    const { nombre, estado, monto_pagado } = await request.json();

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    const query = `
      INSERT INTO integrantes (nombre, estado, monto_pagado) 
      VALUES ($1, $2, $3) RETURNING *
    `;
    const values = [nombre, estado || 'Pendiente', monto_pagado || 0];
    const { rows } = await pool.query(query, values);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al guardar' }, { status: 500 });
  }
}

// Actualizar (PUT)
export async function PUT(request: Request) {
  try {
    const { id, nombre, estado, monto_pagado } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    // Permite actualizar nombre, estado o monto si se proveen
    const query = `
      UPDATE integrantes 
      SET 
        nombre = COALESCE($1, nombre), 
        estado = COALESCE($2, estado), 
        monto_pagado = COALESCE($3, monto_pagado) 
      WHERE id = $4 RETURNING *
    `;
    const values = [nombre, estado, monto_pagado, id];
    const { rows } = await pool.query(query, values);

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al actualizar' }, { status: 500 });
  }
}

// Eliminar (DELETE)
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    await pool.query('DELETE FROM integrantes WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al eliminar' }, { status: 500 });
  }
}