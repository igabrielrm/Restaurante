import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, BellRing, Plus, Search, Send, Table2, X } from 'lucide-react';
import {
  abrirMesa,
  crearPedido,
  createStompClient,
  getMesasActivas,
  getPedidosPorMesa,
  getPlatos,
} from '../api';
import type { Mesa, Pedido, PedidoListo, Plato } from '../types';
import { getErrorMessage, sanitizeText } from '../utils/security';

interface CartItem {
  plato: Plato;
  cantidad: number;
  notasChef: string;
}

interface PlatoDraft {
  plato: Plato | null;
  cantidad: number;
  notasChef: string;
}

const emptyDraft: PlatoDraft = { plato: null, cantidad: 1, notasChef: '' };

export function MeseroView() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [pedidosMesa, setPedidosMesa] = useState<Pedido[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [newMesaOpen, setNewMesaOpen] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [draft, setDraft] = useState<PlatoDraft>(emptyDraft);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<PedidoListo | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void refreshBase();
    const client = createStompClient(
      () => undefined,
      undefined,
      (pedidoListo) => {
        setToast(pedidoListo);
        window.setTimeout(() => setToast(null), 6500);
      },
    );
    return () => {
      void client.deactivate();
    };
  }, []);

  useEffect(() => {
    if (mesaSeleccionada) {
      void getPedidosPorMesa(mesaSeleccionada.id)
        .then(setPedidosMesa)
        .catch((error) => setMessage(getErrorMessage(error, 'No se pudo cargar la mesa seleccionada.')));
    } else {
      setPedidosMesa([]);
    }
  }, [mesaSeleccionada]);

  const mesaNuevaPreview = `Mesa #${mesas.length + 1}`;
  const mesaEnTrabajo = newMesaOpen ? null : mesaSeleccionada;
  const totalCart = useMemo(() => cart.reduce((acc, item) => acc + item.plato.precio * item.cantidad, 0), [cart]);
  const totalPedidoMesa = useMemo(() => pedidosMesa.reduce((acc, pedido) => acc + pedido.total, 0), [pedidosMesa]);
  const platosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return platos;
    }
    return platos.filter((plato) => `${plato.nombre} ${plato.descripcion}`.toLowerCase().includes(term));
  }, [platos, search]);

  async function refreshBase() {
    try {
      const [mesasData, platosData] = await Promise.all([getMesasActivas(), getPlatos()]);
      setMesas(mesasData);
      setPlatos(platosData);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudieron cargar mesas y menu.'));
    }
  }

  function resetComanda() {
    setCart([]);
    setDraft(emptyDraft);
    setSearch('');
  }

  function abrirNuevaMesa() {
    resetComanda();
    setDescripcion('');
    setMesaSeleccionada(null);
    setNewMesaOpen(true);
  }

  function elegirMesa(mesa: Mesa) {
    resetComanda();
    setMesaSeleccionada(mesa);
  }

  function agregarDraft() {
    if (!draft.plato) {
      return;
    }
    setCart((current) => [...current, { plato: draft.plato!, cantidad: draft.cantidad, notasChef: sanitizeText(draft.notasChef) }]);
    setDraft(emptyDraft);
    setSelectorOpen(false);
  }

  function removeCartItem(index: number) {
    setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function changeCartQuantity(index: number, delta: number) {
    setCart((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) {
        return item;
      }
      return { ...item, cantidad: Math.max(1, item.cantidad + delta) };
    }));
  }

  async function enviarComanda() {
    if (cart.length === 0) {
      return;
    }

    try {
      let mesaDestino = mesaSeleccionada;
      if (newMesaOpen) {
        mesaDestino = await abrirMesa(descripcion);
        setMesas((current) => [...current, mesaDestino!]);
        setNewMesaOpen(false);
        setMesaSeleccionada(mesaDestino);
      }

      if (!mesaDestino) {
        return;
      }

      await crearPedido({
        mesaId: mesaDestino.id,
        detalles: cart.map((item) => ({
          platoId: item.plato.id,
          cantidad: item.cantidad,
          notasChef: item.notasChef,
        })),
      });

      setMessage(`Comanda enviada para ${mesaDestino.identificadorDinamico}.`);
      resetComanda();
      await refreshBase();
      setPedidosMesa(await getPedidosPorMesa(mesaDestino.id));
      window.setTimeout(() => setMessage(''), 3500);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo enviar la comanda.'));
    }
  }

  return (
    <div className="relative grid gap-5 lg:grid-cols-[360px_1fr]">
      {toast && (
        <div className="fixed left-4 right-4 top-20 z-40 mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-white p-4 shadow-soft">
          <div className="flex gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">Pedido listo para entregar</p>
              <p className="mt-1 text-sm text-slate-600">
                {toast.mesa.identificadorDinamico}: {toast.platos.join(', ')}
              </p>
            </div>
            <button className="ml-auto text-slate-400" onClick={() => setToast(null)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <section className="card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Mesero</p>
            <h2 className="section-title">Mesas en proceso</h2>
          </div>
          <button className="btn-primary !px-3" onClick={abrirNuevaMesa} aria-label="Agregar mesa">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {mesas.map((mesa) => (
            <button
              key={mesa.id}
              className={`rounded-2xl border p-4 text-left transition hover:border-slate-400 ${mesaSeleccionada?.id === mesa.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}
              onClick={() => elegirMesa(mesa)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-base font-bold text-slate-950">{mesa.identificadorDinamico}</span>
                  <p className="mt-1 text-sm text-slate-500">{mesa.descripcion || 'Sin descripcion'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Activa</span>
              </div>
            </button>
          ))}
          {mesas.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No hay mesas en proceso. Usa el boton + para abrir la primera.
            </div>
          )}
        </div>
      </section>

      <section className="card min-h-[560px] p-4 sm:p-6">
        {mesaEnTrabajo ? (
          <MesaDetalle
            mesa={mesaEnTrabajo}
            pedidos={pedidosMesa}
            cart={cart}
            totalCart={totalCart}
            totalPedidoMesa={totalPedidoMesa}
            message={message}
            onBack={() => setMesaSeleccionada(null)}
            onOpenSelector={() => setSelectorOpen(true)}
            onRemoveCartItem={removeCartItem}
            onChangeCartQuantity={changeCartQuantity}
            onEnviarComanda={enviarComanda}
          />
        ) : (
          <div className="grid h-full min-h-[480px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
            <div>
              <Table2 className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-4 text-xl font-bold text-slate-950">Selecciona una mesa</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Entra al detalle para revisar lo pedido o agregar platos sin bloquear el flujo de atencion.
              </p>
              <button className="btn-primary mt-5" onClick={abrirNuevaMesa}>
                <Plus className="h-5 w-5" />
                Agregar mesa
              </button>
            </div>
          </div>
        )}
      </section>

      {newMesaOpen && (
        <FullScreenModal title="Nueva mesa" onClose={() => setNewMesaOpen(false)}>
          <div className="flex min-h-full flex-col">
            <div className="border-b border-slate-200 pb-5">
              <p className="eyebrow">Mesa asignada</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">{mesaNuevaPreview}</h2>
              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Descripcion opcional</span>
                <input
                  className="input"
                  placeholder="Ej. Juan gorra roja, terraza, familia de 4"
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                />
              </label>
            </div>

            <div className="flex-1 py-5">
              <ComandaBuilder
                cart={cart}
                total={totalCart}
                onAdd={() => setSelectorOpen(true)}
                onRemove={removeCartItem}
                onChangeQuantity={changeCartQuantity}
              />
            </div>

            <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white px-4 py-4 sm:-mx-6 sm:px-6">
              <button className="btn-primary w-full" onClick={enviarComanda} disabled={cart.length === 0}>
                <Send className="h-5 w-5" />
                Abrir mesa y enviar comanda
              </button>
            </div>
          </div>
        </FullScreenModal>
      )}

      {selectorOpen && (
        <FullScreenModal title="Agregar plato" onClose={() => setSelectorOpen(false)}>
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <section>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  className="input pl-12"
                  placeholder="Buscar plato del menu"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {platosFiltrados.map((plato) => (
                  <button
                    key={plato.id}
                    className={`rounded-2xl border p-4 text-left transition hover:border-slate-400 ${draft.plato?.id === plato.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}
                    onClick={() => setDraft((current) => ({ ...current, plato }))}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-950">{plato.nombre}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{plato.descripcion}</p>
                      </div>
                      <span className="font-bold text-slate-900">${plato.precio.toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <aside className="card p-4 shadow-none">
              <p className="eyebrow">Detalle</p>
              <h3 className="mt-2 text-lg font-bold text-slate-950">{draft.plato?.nombre ?? 'Selecciona un plato'}</h3>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Cantidad</span>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={draft.cantidad}
                  onChange={(event) => setDraft((current) => ({ ...current, cantidad: Math.max(1, Number(event.target.value)) }))}
                />
              </label>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Nota de preparacion</span>
                <textarea
                  className="input min-h-28"
                  placeholder="Ej. Sin cebolla, termino medio"
                  value={draft.notasChef}
                  onChange={(event) => setDraft((current) => ({ ...current, notasChef: event.target.value }))}
                />
              </label>
              <button className="btn-primary mt-5 w-full" onClick={agregarDraft} disabled={!draft.plato}>
                <Plus className="h-5 w-5" />
                Agregar a comanda
              </button>
            </aside>
          </div>
        </FullScreenModal>
      )}
    </div>
  );
}

function MesaDetalle({
  mesa,
  pedidos,
  cart,
  totalCart,
  totalPedidoMesa,
  message,
  onBack,
  onOpenSelector,
  onRemoveCartItem,
  onChangeCartQuantity,
  onEnviarComanda,
}: {
  mesa: Mesa;
  pedidos: Pedido[];
  cart: CartItem[];
  totalCart: number;
  totalPedidoMesa: number;
  message: string;
  onBack: () => void;
  onOpenSelector: () => void;
  onRemoveCartItem: (index: number) => void;
  onChangeCartQuantity: (index: number, delta: number) => void;
  onEnviarComanda: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div>
        <button className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 lg:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start">
          <div>
            <p className="eyebrow">Detalle de mesa</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">{mesa.identificadorDinamico}</h2>
            <p className="mt-1 text-sm text-slate-500">{mesa.descripcion || 'Sin descripcion'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cuenta parcial</p>
            <p className="text-xl font-bold text-slate-950">${totalPedidoMesa.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-bold text-slate-950">Pedidos registrados</h3>
            <span className="text-sm text-slate-500">{pedidos.length} comandas</span>
          </div>
          <div className="grid gap-3">
            {pedidos.flatMap((pedido) => pedido.detalles.map((detalle) => ({ pedido, detalle }))).map(({ pedido, detalle }) => (
              <div key={detalle.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{detalle.cantidad}x {detalle.platoNombre}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{pedido.estado.replace('_', ' ')}</p>
                    {detalle.notasChef && <p className="mt-2 text-sm text-slate-500">{detalle.notasChef}</p>}
                  </div>
                  <span className="font-bold text-slate-900">${detalle.subtotal.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {pedidos.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                Esta mesa aun no tiene pedidos cargados.
              </div>
            )}
          </div>
        </div>
      </div>

      <aside className="self-start rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <ComandaBuilder
          cart={cart}
          total={totalCart}
          onAdd={onOpenSelector}
          onRemove={onRemoveCartItem}
          onChangeQuantity={onChangeCartQuantity}
        />
        {message && <p className="mt-3 rounded-xl border border-emerald-200 bg-white p-3 text-sm font-semibold text-emerald-700">{message}</p>}
        <button className="btn-primary mt-4 w-full" onClick={onEnviarComanda} disabled={cart.length === 0}>
          <Send className="h-5 w-5" />
          Enviar comanda adicional
        </button>
      </aside>
    </div>
  );
}

function ComandaBuilder({
  cart,
  total,
  onAdd,
  onRemove,
  onChangeQuantity,
}: {
  cart: CartItem[];
  total: number;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChangeQuantity: (index: number, delta: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Comanda</p>
          <h3 className="text-lg font-bold text-slate-950">Platos a enviar</h3>
        </div>
        <button className="btn-secondary !px-3 !py-2" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Agregar plato
        </button>
      </div>
      <div className="mt-4 grid max-h-[42vh] gap-3 overflow-auto pr-1">
        {cart.map((item, index) => (
          <div key={`${item.plato.id}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">{item.plato.nombre}</p>
                {item.notasChef && <p className="mt-1 text-sm text-slate-500">{item.notasChef}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-700" onClick={() => onChangeQuantity(index, -1)}>
                  -
                </button>
                <span className="min-w-6 text-center text-sm font-bold text-slate-950">{item.cantidad}</span>
                <button className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-700" onClick={() => onChangeQuantity(index, 1)}>
                  +
                </button>
                <button className="ml-1 text-slate-400 hover:text-red-600" onClick={() => onRemove(index)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {cart.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            La comanda esta vacia. Agrega platos sin perder de vista la mesa.
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-sm font-semibold text-slate-500">Subtotal</span>
        <span className="text-xl font-bold text-slate-950">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

function FullScreenModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <button className="btn-secondary !px-3 !py-2" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </header>
        <main className="flex-1 overflow-auto px-4 py-5 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
