import { useEffect, useMemo, useState } from 'react';
import { CreditCard, ReceiptText, Scissors, WalletCards } from 'lucide-react';
import { getHistorialVentas, getMesasActivas, getPedidosPorMesa, pagarMesa, pagarParcial } from '../api';
import type { Mesa, Pedido, TipoPago } from '../types';
import { getErrorMessage } from '../utils/security';

const tiposPago: TipoPago[] = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'];

export function CajeroView() {
  const [tab, setTab] = useState<'activas' | 'historial'>('activas');
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [historial, setHistorial] = useState<Pedido[]>([]);
  const [tipoPago, setTipoPago] = useState<TipoPago>('EFECTIVO');
  const [aplicarIva, setAplicarIva] = useState(true);
  const [splitMode, setSplitMode] = useState(false);
  const [cantidadesParciales, setCantidadesParciales] = useState<Record<number, number>>({});
  const [historialSeleccionado, setHistorialSeleccionado] = useState<HistorialGrupo | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (mesa) {
      void getPedidosPorMesa(mesa.id)
        .then(setPedidos)
        .catch((error) => setMessage(getErrorMessage(error, 'No se pudo cargar la cuenta de la mesa.')));
    } else {
      setPedidos([]);
    }
  }, [mesa]);

  const subtotal = useMemo(() => pedidos.reduce((acc, pedido) => acc + pedido.total, 0), [pedidos]);
  const iva = aplicarIva ? subtotal * 0.15 : 0;
  const total = subtotal + iva;
  const historialAgrupado = useMemo(() => agruparHistorial(historial), [historial]);
  const detallesPendientes = useMemo(() => pedidos.flatMap((pedido) => pedido.detalles), [pedidos]);
  const detallesSeleccionados = useMemo(
    () => detallesPendientes.filter((detalle) => (cantidadesParciales[detalle.id] ?? 0) > 0),
    [detallesPendientes, cantidadesParciales],
  );
  const parcialSubtotal = detallesSeleccionados.reduce(
    (acc, detalle) => acc + detalle.precioUnitario * (cantidadesParciales[detalle.id] ?? 0),
    0,
  );
  const parcialIva = aplicarIva ? parcialSubtotal * 0.15 : 0;
  const parcialTotal = parcialSubtotal + parcialIva;

  async function refresh() {
    try {
      const [mesasData, historialData] = await Promise.all([getMesasActivas(), getHistorialVentas()]);
      setMesas(mesasData);
      setHistorial(historialData);
      setMesa((current) => current ?? mesasData[0] ?? null);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo cargar la informacion de caja.'));
    }
  }

  async function procesarPago() {
    if (!mesa) {
      return;
    }
    try {
      await pagarMesa(mesa.id, tipoPago, aplicarIva);
      setMessage(`Pago procesado y ${mesa.identificadorDinamico} cerrada.`);
      setMesa(null);
      setPedidos([]);
      setCantidadesParciales({});
      setSplitMode(false);
      await refresh();
      window.setTimeout(() => setMessage(''), 3500);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo procesar el pago.'));
    }
  }

  async function procesarPagoParcial() {
    if (!mesa || detallesSeleccionados.length === 0) {
      return;
    }
    try {
      const pendientes = await pagarParcial(
        mesa.id,
        tipoPago,
        aplicarIva,
        detallesSeleccionados.map((detalle) => ({ detalleId: detalle.id, cantidad: cantidadesParciales[detalle.id] })),
      );
      setPedidos(pendientes);
      setCantidadesParciales({});
      setMessage('Pago separado procesado. La cuenta se actualizo.');
      await refresh();
      window.setTimeout(() => setMessage(''), 3500);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo procesar el pago separado.'));
    }
  }

  function setCantidadParcial(detalleId: number, cantidad: number, max: number) {
    const next = Math.max(0, Math.min(max, cantidad));
    setCantidadesParciales((current) => {
      const updated = { ...current };
      if (next === 0) {
        delete updated[detalleId];
      } else {
        updated[detalleId] = next;
      }
      return updated;
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <aside className="card p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Caja</p>
            <h2 className="section-title">Control de cobros</h2>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === 'activas' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setTab('activas')}
          >
            Por cobrar
          </button>
          <button
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === 'historial' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
            onClick={() => setTab('historial')}
          >
            Historial
          </button>
        </div>

        {tab === 'activas' ? (
          <div className="mt-5 grid gap-3">
            {mesas.map((item) => (
              <button
                key={item.id}
                className={`rounded-2xl border p-4 text-left transition hover:border-slate-400 ${mesa?.id === item.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}
                onClick={() => setMesa(item)}
              >
                <span className="block font-bold text-slate-950">{item.identificadorDinamico}</span>
                <span className="text-sm text-slate-500">{item.descripcion || 'Sin descripcion'}</span>
              </button>
            ))}
            {mesas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No hay mesas activas para cobrar.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {historialAgrupado.map((grupo) => (
              <button
                key={grupo.key}
                className={`rounded-2xl border bg-white p-4 text-left transition hover:border-slate-400 ${historialSeleccionado?.key === grupo.key ? 'border-slate-900' : 'border-slate-200'}`}
                onClick={() => setHistorialSeleccionado(grupo)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{grupo.mesa}</p>
                    <p className="text-sm text-slate-500">{grupo.fecha}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{grupo.tipoPago}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm text-slate-500">{grupo.items} platos</span>
                  <span className="font-bold text-slate-950">${grupo.total.toFixed(2)}</span>
                </div>
              </button>
            ))}
            {historialAgrupado.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Aun no hay ventas cerradas.
              </div>
            )}
          </div>
        )}
      </aside>

      <section className="card p-4 sm:p-6">
        {tab === 'historial' ? (
          <TicketHistorial grupo={historialSeleccionado} />
        ) : (
          <>
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <ReceiptText className="h-4 w-4" />
              Pre-cuenta
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">{mesa?.identificadorDinamico ?? 'Sin mesa seleccionada'}</h2>
            <p className="mt-1 text-sm text-slate-500">{mesa?.descripcion || 'Selecciona una mesa activa para auditar el consumo.'}</p>
          </div>
          {message && <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</span>}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          {detallesPendientes.map((detalle) => (
            <div key={detalle.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 p-4 last:border-b-0">
              <div className="flex items-start gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{detalle.cantidad}x {detalle.platoNombre}</p>
                  {detalle.notasChef && <p className="mt-1 text-sm text-slate-500">{detalle.notasChef}</p>}
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900">${detalle.subtotal.toFixed(2)}</span>
                {splitMode && (
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-700"
                      onClick={() => setCantidadParcial(detalle.id, (cantidadesParciales[detalle.id] ?? 0) - 1, detalle.cantidad)}
                    >
                      -
                    </button>
                    <input
                      className="h-8 w-14 rounded-lg border border-slate-200 bg-white text-center text-sm font-bold"
                      type="number"
                      min={0}
                      max={detalle.cantidad}
                      value={cantidadesParciales[detalle.id] ?? 0}
                      onChange={(event) => setCantidadParcial(detalle.id, Number(event.target.value), detalle.cantidad)}
                    />
                    <button
                      className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-700"
                      onClick={() => setCantidadParcial(detalle.id, (cantidadesParciales[detalle.id] ?? 0) + 1, detalle.cantidad)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {pedidos.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">No hay pedidos pendientes para esta mesa.</div>
          )}
        </div>

        {splitMode && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-slate-950">Pago por separado</p>
                <p className="text-sm text-slate-600">Selecciona los platos que paga esta persona.</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Total seleccionado</p>
                <p className="text-xl font-bold text-slate-950">${parcialTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">Forma de pago</span>
              <select className="input" value={tipoPago} onChange={(event) => setTipoPago(event.target.value as TipoPago)}>
                {tiposPago.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </label>

            <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <span>
                <span className="block font-semibold text-slate-950">Activar IVA</span>
                <span className="text-sm text-slate-500">Aplica el 15% sobre la cuenta.</span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-slate-900"
                checked={aplicarIva}
                onChange={(event) => setAplicarIva(event.target.checked)}
              />
            </label>

            <button
              className="btn-secondary mt-4 w-full"
              onClick={() => {
                setSplitMode((current) => !current);
                setCantidadesParciales({});
              }}
            >
              <Scissors className="h-5 w-5" />
              {splitMode ? 'Volver a pago total' : 'Pagar por separado'}
            </button>
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex justify-between text-sm text-slate-300">
              <span>{splitMode ? 'Seleccionado' : 'Subtotal'}</span>
              <span>${(splitMode ? parcialSubtotal : subtotal).toFixed(2)}</span>
            </div>
            <div className="mt-3 flex justify-between text-sm text-slate-300">
              <span>IVA 15%</span>
              <span>${(splitMode ? parcialIva : iva).toFixed(2)}</span>
            </div>
            <div className="mt-5 flex justify-between border-t border-white/10 pt-5 text-2xl font-bold">
              <span>Total</span>
              <span>${(splitMode ? parcialTotal : total).toFixed(2)}</span>
            </div>
            {splitMode ? (
              <button className="btn-primary mt-5 w-full bg-white text-slate-950 hover:bg-slate-100" onClick={procesarPagoParcial} disabled={!mesa || detallesSeleccionados.length === 0}>
                <CreditCard className="h-5 w-5" />
                Cobrar seleccion
              </button>
            ) : (
              <button className="btn-primary mt-5 w-full bg-white text-slate-950 hover:bg-slate-100" onClick={procesarPago} disabled={!mesa || pedidos.length === 0}>
                <CreditCard className="h-5 w-5" />
                Pago total
              </button>
            )}
          </div>
        </div>
          </>
        )}
      </section>
    </div>
  );
}

function TicketHistorial({ grupo }: { grupo: HistorialGrupo | null }) {
  if (!grupo) {
    return (
      <div className="grid min-h-[520px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div>
          <ReceiptText className="mx-auto h-10 w-10 text-slate-400" />
          <h2 className="mt-4 text-xl font-bold text-slate-950">Selecciona una venta</h2>
          <p className="mt-2 text-sm text-slate-500">Toca una mesa cerrada del historial para ver el ticket completo.</p>
        </div>
      </div>
    );
  }

  const detalles = grupo.pedidos.flatMap((pedido) => pedido.detalles);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow">Ticket de venta</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{grupo.mesa}</h2>
          <p className="mt-1 text-sm text-slate-500">{grupo.fecha} · {grupo.tipoPago}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total cobrado</p>
          <p className="text-2xl font-bold text-slate-950">${grupo.total.toFixed(2)}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        {detalles.map((detalle) => (
          <div key={detalle.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 p-4 last:border-b-0">
            <div>
              <p className="font-semibold text-slate-950">{detalle.cantidad}x {detalle.platoNombre}</p>
                {detalle.notasChef && <p className="mt-1 text-sm text-slate-500">{detalle.notasChef}</p>}
            </div>
            <span className="font-bold text-slate-900">${detalle.subtotal.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HistorialGrupo {
  key: number;
  mesa: string;
  fecha: string;
  tipoPago: string;
  total: number;
  items: number;
  pedidos: Pedido[];
}

function agruparHistorial(pedidos: Pedido[]) {
  const grupos = new Map<number, HistorialGrupo>();

  pedidos.forEach((pedido) => {
    const current = grupos.get(pedido.mesa.id);
    const items = pedido.detalles.reduce((acc, detalle) => acc + detalle.cantidad, 0);
    if (current) {
      current.total += pedido.total;
      current.items += items;
      current.pedidos.push(pedido);
      return;
    }
    grupos.set(pedido.mesa.id, {
      key: pedido.mesa.id,
      mesa: pedido.mesa.identificadorDinamico,
      fecha: new Date(pedido.fechaCreacion).toLocaleString(),
      tipoPago: pedido.tipoPago ?? 'SIN PAGO',
      total: pedido.total,
      items,
      pedidos: [pedido],
    });
  });

  return Array.from(grupos.values());
}
