import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Credenciales requeridas
    const USER_VALID = 'carlos';
    const PASS_VALID = 'santani1234';

    if (username === USER_VALID && password === PASS_VALID) {
      const response = NextResponse.json({ success: true });
      
      // Cookie de sesión
      response.cookies.set('admin_token', 'authenticated', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 día
      });
      
      return response;
    }

    return NextResponse.json(
      { error: 'Usuario o contraseña incorrectos' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error procesando la solicitud' },
      { status: 500 }
    );
  }
}