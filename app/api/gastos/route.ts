import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT * FROM gastos ORDER BY id DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { concepto, monto } = await request.json();
    if (!concepto || !monto) {
      return NextResponse.json({ error: 'Concepto y monto son requeridos' }, { status: 400 });
    }
    const { rows } = await pool.query(
      'INSERT INTO gastos (concepto, monto) VALUES ($1, $2) RETURNING *',
      [concepto, monto]
    );
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}