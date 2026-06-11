import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { BarChart3, ImagePlus, PackagePlus, Save, Soup, Trash2, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  desactivarPlato,
  eliminarIngrediente,
  getDashboard,
  getIngredientes,
  getPlatos,
  guardarIngrediente,
  guardarPlato,
} from '../api';
import type { Dashboard, Ingrediente, Plato } from '../types';
import { getErrorMessage } from '../utils/security';

const colors = ['#211915', '#7b432d', '#9b5b3e', '#8a5a16', '#d7c2a9'];

interface PlatoForm {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  activo: boolean;
  receta: Array<{ ingredienteId: number; cantidadRequerida: number }>;
}

const emptyForm: PlatoForm = {
  nombre: '',
  descripcion: '',
  precio: 0,
  imagenUrl: '',
  activo: true,
  receta: [],
};

interface IngredienteForm {
  id?: number;
  nombre: string;
  stock: number;
  stockMinimo: number;
}

const emptyIngredienteForm: IngredienteForm = {
  nombre: '',
  stock: 0,
  stockMinimo: 0,
};

export function AdminView() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [form, setForm] = useState<PlatoForm>(emptyForm);
  const [ingredienteForm, setIngredienteForm] = useState<IngredienteForm>(emptyIngredienteForm);
  const [message, setMessage] = useState('');
  const [showTopBreakdown, setShowTopBreakdown] = useState(false);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    try {
      const [dashboardData, ingredientesData, platosData] = await Promise.all([
        getDashboard(),
        getIngredientes(),
        getPlatos(true),
      ]);
      setDashboard(dashboardData);
      setIngredientes(ingredientesData);
      setPlatos(platosData);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo cargar el panel de administracion.'));
    }
  }

  const ventasMes = useMemo(() => dashboard?.ventas.mes ?? [], [dashboard]);
  const platoEstrella = dashboard?.topPlatos[0];

  function editar(plato: Plato) {
    setForm({
      id: plato.id,
      nombre: plato.nombre,
      descripcion: plato.descripcion,
      precio: plato.precio,
      imagenUrl: plato.imagenUrl,
      activo: plato.activo,
      receta: plato.receta.map((item) => ({
        ingredienteId: item.ingredienteId,
        cantidadRequerida: item.cantidadRequerida,
      })),
    });
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, imagenUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  async function submit() {
    try {
      const { id, ...payload } = form;
      await guardarPlato(payload, id);
      setForm(emptyForm);
      setMessage('Plato guardado correctamente.');
      await refresh();
      window.setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo guardar el plato.'));
    }
  }

  async function desactivar() {
    if (!form.id) {
      return;
    }
    try {
      await desactivarPlato(form.id);
      setForm(emptyForm);
      setMessage('Plato desactivado.');
      await refresh();
      window.setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo desactivar el plato.'));
    }
  }

  function editarIngrediente(ingrediente: Ingrediente) {
    setIngredienteForm({
      id: ingrediente.id,
      nombre: ingrediente.nombre,
      stock: ingrediente.stock,
      stockMinimo: ingrediente.stockMinimo,
    });
  }

  async function submitIngrediente() {
    try {
      const { id, ...payload } = ingredienteForm;
      await guardarIngrediente(payload, id);
      setIngredienteForm(emptyIngredienteForm);
      setMessage('Ingrediente guardado.');
      await refresh();
      window.setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo guardar el ingrediente.'));
    }
  }

  async function borrarIngrediente(id: number) {
    try {
      await eliminarIngrediente(id);
      setIngredienteForm(emptyIngredienteForm);
      setMessage('Ingrediente eliminado.');
      await refresh();
      window.setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(getErrorMessage(error, 'No se pudo eliminar el ingrediente.'));
    }
  }

  function addRecetaItem() {
    const ingrediente = ingredientes[0];
    if (!ingrediente) {
      return;
    }
    setForm((current) => ({
      ...current,
      receta: [...current.receta, { ingredienteId: ingrediente.id, cantidadRequerida: 1 }],
    }));
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard icon={<TrendingUp className="h-6 w-6" />} title="Plato estrella" value={platoEstrella?.platoNombre ?? 'Sin ventas'} />
        <MetricCard
          icon={<Soup className="h-6 w-6" />}
          title="Unidades top"
          value={platoEstrella?.unidadesVendidas?.toString() ?? '0'}
          active={showTopBreakdown}
          onClick={() => setShowTopBreakdown((current) => !current)}
        />
        <MetricCard icon={<BarChart3 className="h-6 w-6" />} title="Mesas y comandas" value="Tiempo real" />
        <MetricCard icon={<ImagePlus className="h-6 w-6" />} title="Carta" value={`${platos.length} platos`} />
      </section>

      {showTopBreakdown && (
        <section className="card p-5">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Resumen de ventas</p>
              <h2 className="section-title">Desglose de unidades top</h2>
            </div>
            <span className="text-sm text-slate-500">{dashboard?.topPlatos.length ?? 0} platos con ventas registradas</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            {(dashboard?.topPlatos ?? []).map((item, index) => (
              <div key={item.platoId} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[60px_1fr_auto_auto] sm:items-center">
                <span className="text-sm font-bold text-slate-400">#{index + 1}</span>
                <span className="font-semibold text-slate-950">{item.platoNombre}</span>
                <span className="text-sm text-slate-500">{item.unidadesVendidas} unidades</span>
                <span className="font-bold text-slate-950">${item.ingresoTotal.toFixed(2)}</span>
              </div>
            ))}
            {(dashboard?.topPlatos.length ?? 0) === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">Aun no hay ventas pagadas para construir el ranking.</div>
            )}
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="section-title">Ingresos del mes por pago</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ventasMes}
                  dataKey="total"
                  nameKey="tipoPago"
                  innerRadius={64}
                  outerRadius={104}
                  paddingAngle={3}
                  label={renderPieLabel}
                >
                  {ventasMes.map((entry, index) => <Cell key={entry.tipoPago} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="section-title">Horas pico de hoy</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard?.horasPico ?? []} margin={{ top: 24, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" tickFormatter={(value) => `${value}:00`} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" name="Pedidos" fill="#7b432d" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="cantidad" position="top" fill="#211915" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_430px]">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">Carta y platos</h2>
            {message && <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{message}</span>}
          </div>
          <div className="grid gap-3">
            {platos.map((plato) => (
              <button key={plato.id} className="grid gap-4 rounded-3xl border border-slate-200 p-4 text-left transition hover:bg-slate-50 sm:grid-cols-[88px_1fr_auto]" onClick={() => editar(plato)}>
                <div className="h-20 rounded-2xl bg-slate-100">
                  {plato.imagenUrl && <img src={plato.imagenUrl} alt={plato.nombre} className="h-full w-full rounded-2xl object-cover" />}
                </div>
                <div>
                  <h3 className="font-black text-ink">{plato.nombre}</h3>
                  <p className="text-sm text-slate-500">{plato.descripcion}</p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-bold ${plato.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {plato.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <span className="font-black text-slate-900">${plato.precio.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>

        <form className="card grid gap-4 p-5" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <h2 className="text-xl font-black text-ink">{form.id ? 'Editar plato' : 'Nuevo plato'}</h2>
          <input className="input" placeholder="Nombre" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} />
          <textarea className="input min-h-24" placeholder="Descripcion" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })} />
          <input className="input" type="number" step="0.01" placeholder="Precio" value={form.precio} onChange={(event) => setForm({ ...form, precio: Number(event.target.value) })} />
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 p-4 font-semibold text-slate-600">
            <ImagePlus className="h-5 w-5" />
            Cargar imagen del plato
            <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
          </label>
          {form.imagenUrl && <img src={form.imagenUrl} alt="Preview" className="h-40 w-full rounded-3xl object-cover" />}
          <label className="flex items-center gap-3 font-semibold">
            <input type="checkbox" checked={form.activo} onChange={(event) => setForm({ ...form, activo: event.target.checked })} />
            Plato activo
          </label>

          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black">Receta</h3>
              <button type="button" className="btn-secondary !px-3 !py-2" onClick={addRecetaItem}>Agregar</button>
            </div>
            <div className="grid gap-3">
              {form.receta.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_110px] gap-2">
                  <select
                    className="input"
                    value={item.ingredienteId}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      receta: current.receta.map((entry, i) => i === index ? { ...entry, ingredienteId: Number(event.target.value) } : entry),
                    }))}
                  >
                    {ingredientes.map((ingrediente) => <option key={ingrediente.id} value={ingrediente.id}>{ingrediente.nombre}</option>)}
                  </select>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={item.cantidadRequerida}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      receta: current.receta.map((entry, i) => i === index ? { ...entry, cantidadRequerida: Number(event.target.value) } : entry),
                    }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="btn-secondary" onClick={() => setForm(emptyForm)}>Limpiar</button>
            <button type="submit" className="btn-primary">
              <Save className="h-5 w-5" />
              Guardar
            </button>
          </div>
          {form.id && (
            <button type="button" className="btn-secondary border-red-200 text-red-700 hover:bg-red-50" onClick={desactivar}>
              <Trash2 className="h-5 w-5" />
              Desactivar plato
            </button>
          )}
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_430px]">
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow">Inventario</p>
              <h2 className="section-title">Ingredientes y stock</h2>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            {ingredientes.map((ingrediente) => {
              const stockBajo = ingrediente.stock <= ingrediente.stockMinimo;
              return (
                <div key={ingrediente.id} className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <button className="text-left" onClick={() => editarIngrediente(ingrediente)}>
                    <p className="font-semibold text-slate-950">{ingrediente.nombre}</p>
                    <p className="text-sm text-slate-500">Minimo recomendado: {ingrediente.stockMinimo}</p>
                  </button>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${stockBajo ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                    Stock: {ingrediente.stock}
                  </span>
                  <button className="text-sm font-semibold text-red-700" onClick={() => borrarIngrediente(ingrediente.id)}>
                    Eliminar
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <form className="card grid gap-4 p-5" onSubmit={(event) => { event.preventDefault(); void submitIngrediente(); }}>
          <h2 className="text-xl font-black text-ink">{ingredienteForm.id ? 'Editar ingrediente' : 'Nuevo ingrediente'}</h2>
          <input
            className="input"
            placeholder="Nombre del ingrediente"
            value={ingredienteForm.nombre}
            onChange={(event) => setIngredienteForm({ ...ingredienteForm, nombre: event.target.value })}
          />
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="Stock actual"
            value={ingredienteForm.stock}
            onChange={(event) => setIngredienteForm({ ...ingredienteForm, stock: Number(event.target.value) })}
          />
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="Stock minimo"
            value={ingredienteForm.stockMinimo}
            onChange={(event) => setIngredienteForm({ ...ingredienteForm, stockMinimo: Number(event.target.value) })}
          />
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="btn-secondary" onClick={() => setIngredienteForm(emptyIngredienteForm)}>Limpiar</button>
            <button type="submit" className="btn-primary">
              <Save className="h-5 w-5" />
              Guardar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  active = false,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-700">{icon}</div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <h3 className="mt-1 text-2xl font-black text-ink">{value}</h3>
    </>
  );

  if (onClick) {
    return (
      <button
        className={`card p-5 text-left transition hover:border-slate-400 ${active ? 'border-slate-900 bg-slate-50' : ''}`}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <article className={`card p-5 text-left transition ${active ? 'border-slate-900 bg-slate-50' : ''}`}>
      {content}
    </article>
  );
}

function renderPieLabel(entry: any) {
  if (!entry.tipoPago || !entry.percent || entry.percent < 0.05) {
    return '';
  }
  return `${entry.tipoPago} ${(entry.percent * 100).toFixed(0)}%`;
}
