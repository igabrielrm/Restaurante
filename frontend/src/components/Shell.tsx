import { useState } from 'react';
import { BarChart3, ChefHat, ClipboardList, LogOut, ReceiptText, Store, UserRound, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cambiarPassword } from '../api';
import { useAuth } from '../state/AuthContext';
import type { Rol } from '../types';
import { getErrorMessage } from '../utils/security';

const roleIcon: Record<Rol, ReactNode> = {
  ADMIN: <BarChart3 className="h-5 w-5" />,
  MESERO: <ClipboardList className="h-5 w-5" />,
  COCINERO: <ChefHat className="h-5 w-5" />,
  CAJERO: <ReceiptText className="h-5 w-5" />,
};

const roleLabel: Record<Rol, string> = {
  ADMIN: 'Dueño',
  MESERO: 'Mesero',
  COCINERO: 'Cocina',
  CAJERO: 'Caja',
};

export function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-slate-950 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow">Restaurante</p>
              <h1 className="text-base font-bold text-ink sm:text-xl">Panel operativo</h1>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 sm:flex">
                {roleIcon[user.rol]}
                {user.username} · {roleLabel[user.rol]}
              </div>
              <button className="btn-secondary !px-3 !py-2" onClick={() => setAccountOpen(true)} title="Mi Cuenta">
                <UserRound className="h-5 w-5" />
                <span className="hidden sm:inline">Mi Cuenta</span>
              </button>
              <button className="btn-secondary !px-3 !py-2" onClick={logout} title="Cerrar sesion">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      {user && accountOpen && <AccountModal username={user.username} onClose={() => setAccountOpen(false)} />}
    </div>
  );
}

function AccountModal({ username, onClose }: { username: string; onClose: () => void }) {
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    setMessage('');
    if (nuevaPassword !== confirmarPassword) {
      setMessage('La nueva contraseña y la confirmacion no coinciden.');
      return;
    }
    setSaving(true);
    try {
      await cambiarPassword({ passwordActual, nuevaPassword });
      setMessage('Contraseña actualizada correctamente.');
      setPasswordActual('');
      setNuevaPassword('');
      setConfirmarPassword('');
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo actualizar la contraseña.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <section className="card w-full max-w-md p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="eyebrow">Mi Cuenta</p>
            <h2 className="text-xl font-bold text-slate-950">Cambiar contraseña</h2>
          </div>
          <button className="btn-secondary !px-3 !py-2" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-4">
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-600">Contraseña Actual</span>
            <input className="input" type="password" value={passwordActual} onChange={(event) => setPasswordActual(event.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-600">Nueva Contraseña</span>
            <input className="input" type="password" value={nuevaPassword} onChange={(event) => setNuevaPassword(event.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-600">Confirmar Contraseña</span>
            <input className="input" type="password" value={confirmarPassword} onChange={(event) => setConfirmarPassword(event.target.value)} />
          </label>
          {message && <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">{message}</p>}
          <button className="btn-primary w-full" onClick={submit} disabled={saving || !passwordActual || !nuevaPassword || !confirmarPassword}>
            Guardar contraseña
          </button>
        </div>
      </section>
    </div>
  );
}
