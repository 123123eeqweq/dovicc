import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

async function getCurrentUserServer() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3001';
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    return null;
  }

  try {
    const cookieHeader = `token=${token.value}`;
    
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getCurrentUserServer();

  if (!data || !data.user) {
    notFound();
  }

  const user = data.user;
  if (!user.isAdmin && user.role !== 'admin' && user.role !== 'superadmin') {
    notFound();
  }

  return <>{children}</>;
}
