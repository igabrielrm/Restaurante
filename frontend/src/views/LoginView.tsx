import { useState } from 'react';
import { ChefHat, Loader2, LockKeyhole, UserRound } from 'lucide-react';
import { login } from '../api';
import { useAuth } from '../state/AuthContext';
import { getErrorMessage } from '../utils/security';

export function LoginView() {
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setLoading(true);
    setError('');
    try {
      setUser(await login(username, password));
    } catch (error) {
      setError(getErrorMessage(error, 'No se pudo iniciar sesion. Intenta nuevamente.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#f1dfca,transparent_35%),#fbf7ef] p-4">
      <section className="card w-full max-w-lg overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="mb-10 flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-brand-600 text-white">
              <ChefHat className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-600">Restaurante</p>
              <h1 className="text-3xl font-black text-ink">Ingreso del personal</h1>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">Usuario</span>
              <div className="relative">
                <UserRound className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input className="input pl-12" value={username} onChange={(event) => setUsername(event.target.value)} />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">Clave</span>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input className="input pl-12" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
            </label>
            {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            <button className="btn-primary w-full" onClick={submit} disabled={loading}>
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              Ingresar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
