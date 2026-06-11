import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ChefHat, Clock3, Flame, CheckCircle2 } from 'lucide-react';
import { cambiarEstadoPedido, createStompClient, getComandasActivas } from '../api';
import type { Pedido, PedidoEstado } from '../types';
import { getErrorMessage } from '../utils/security';

const columns: Array<{ estado: PedidoEstado; title: string; icon: ReactNode; next?: PedidoEstado }> = [
  { estado: 'PENDIENTE', title: 'Pendiente', icon: <Clock3 className="h-5 w-5" />, next: 'EN_PREPARACION' },
  { estado: 'EN_PREPARACION', title: 'En preparacion', icon: <Flame className="h-5 w-5" />, next: 'LISTO' },
  { estado: 'LISTO', title: 'Listo', icon: <CheckCircle2 className="h-5 w-5" /> },
];

const notificationSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=');

export function CocineroView() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [stockAlert, setStockAlert] = useState<string>('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void getComandasActivas()
      .then(setPedidos)
      .catch((error) => setMessage(getErrorMessage(error, 'No se pudieron cargar las comandas.')));
    const client = createStompClient((pedido) => {
      setPedidos((current) => {
        const exists = current.some((item) => item.id === pedido.id);
        if (!exists && pedido.estado === 'PENDIENTE') {
          void notificationSound.play().catch(() => undefined);
        }
        if (pedido.estado === 'PAGADO') {
          return current.filter((item) => item.id !== pedido.id);
        }
        return exists ? current.map((item) => item.id === pedido.id ? pedido : item) : [...current, pedido];
      });
    }, (alert) => {
      const parsed = alert as { ingredienteNombre?: string; stock?: number };
      setStockAlert(`Stock bajo: ${parsed.ingredienteNombre ?? 'ingrediente'} (${parsed.stock ?? 0})`);
      window.setTimeout(() => setStockAlert(''), 5000);
    });
    return () => {
      void client.deactivate();
    };
  }, []);

  const grouped = useMemo(() => {
    return columns.reduce<Record<PedidoEstado, Pedido[]>>((acc, column) => {
      acc[column.estado] = pedidos.filter((pedido) => pedido.estado === column.estado);
      return acc;
    }, { PENDIENTE: [], EN_PREPARACION: [], LISTO: [], PAGADO: [] });
  }, [pedidos]);

  async function avanzar(pedido: Pedido, next?: PedidoEstado) {
    if (!next) {
      return;
    }
    try {
      const actualizado = await cambiarEstadoPedido(pedido.id, next);
      setPedidos((current) => current.map((item) => item.id === actualizado.id ? actualizado : item));
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo actualizar el estado del pedido.'));
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">
            <ChefHat className="h-5 w-5" />
            Cocina en vivo
          </p>
          <h2 className="mt-2 text-3xl font-black text-ink">Tablero de comandas</h2>
        </div>
        <div className="grid gap-2">
          {stockAlert && <div className="rounded-2xl bg-amber-50 px-4 py-3 font-semibold text-amber-800">{stockAlert}</div>}
          {message && <div className="rounded-2xl bg-rose-50 px-4 py-3 font-semibold text-rose-700">{message}</div>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => (
          <section key={column.estado} className="card min-h-[60vh] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-black text-ink">
                {column.icon}
                {column.title}
              </h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">{grouped[column.estado].length}</span>
            </div>
            <div className="grid gap-3">
              {grouped[column.estado].map((pedido) => (
                <article key={pedido.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-black">{pedido.mesa.identificadorDinamico}</h4>
                      <p className="text-sm text-slate-500">{pedido.mesa.descripcion}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold">#{pedido.id}</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {pedido.detalles.map((detalle) => (
                      <li key={detalle.id} className="rounded-2xl bg-white p-3">
                        <div className="font-bold">{detalle.cantidad}x {detalle.platoNombre}</div>
                        {detalle.notasChef && <p className="mt-1 text-sm text-brand-700">Nota: {detalle.notasChef}</p>}
                      </li>
                    ))}
                  </ul>
                  {column.next && (
                    <button className="btn-primary mt-4 w-full" onClick={() => avanzar(pedido, column.next)}>
                      Avanzar a {column.next.replace('_', ' ')}
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
