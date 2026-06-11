import { Shell } from './components/Shell';
import { useAuth } from './state/AuthContext';
import { AdminView } from './views/AdminView';
import { CajeroView } from './views/CajeroView';
import { CocineroView } from './views/CocineroView';
import { LoginView } from './views/LoginView';
import { MeseroView } from './views/MeseroView';

export default function App() {
  const { rol } = useAuth();

  if (!rol) {
    return <LoginView />;
  }

  return (
    <Shell>
      {rol === 'MESERO' && <MeseroView />}
      {rol === 'COCINERO' && <CocineroView />}
      {rol === 'CAJERO' && <CajeroView />}
      {rol === 'ADMIN' && <AdminView />}
    </Shell>
  );
}
