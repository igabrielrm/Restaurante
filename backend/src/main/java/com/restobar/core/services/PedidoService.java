package com.restobar.core.services;

import com.restobar.core.dto.AlertaStockDTO;
import com.restobar.core.dto.CrearPedidoRequest;
import com.restobar.core.dto.PagoRequest;
import com.restobar.core.dto.PagoParcialRequest;
import com.restobar.core.dto.PedidoDTO;
import com.restobar.core.dto.PedidoDetalleRequest;
import com.restobar.core.dto.PedidoListoDTO;
import com.restobar.core.entities.Ingrediente;
import com.restobar.core.entities.Mesa;
import com.restobar.core.entities.Pedido;
import com.restobar.core.entities.PedidoDetalle;
import com.restobar.core.entities.PedidoEstado;
import com.restobar.core.entities.Plato;
import com.restobar.core.entities.PlatoIngrediente;
import com.restobar.core.repositories.MesaRepository;
import com.restobar.core.repositories.PedidoDetalleRepository;
import com.restobar.core.repositories.PedidoRepository;
import com.restobar.core.repositories.PlatoRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private static final BigDecimal IVA = new BigDecimal("1.15");

    private final PedidoRepository pedidoRepository;
    private final MesaRepository mesaRepository;
    private final PlatoRepository platoRepository;
    private final PedidoDetalleRepository pedidoDetalleRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public PedidoService(
            PedidoRepository pedidoRepository,
            MesaRepository mesaRepository,
            PlatoRepository platoRepository,
            PedidoDetalleRepository pedidoDetalleRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.pedidoRepository = pedidoRepository;
        this.mesaRepository = mesaRepository;
        this.platoRepository = platoRepository;
        this.pedidoDetalleRepository = pedidoDetalleRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional(readOnly = true)
    public List<PedidoDTO> listarComandasActivas() {
        return pedidoRepository.findByEstadoInOrderByFechaCreacionAsc(
                        List.of(PedidoEstado.PENDIENTE, PedidoEstado.EN_PREPARACION, PedidoEstado.LISTO)
                ).stream()
                .map(DtoMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PedidoDTO> listarPorMesa(Long mesaId) {
        return pedidoRepository.findByMesaIdAndEstadoNotOrderByFechaCreacionDesc(mesaId, PedidoEstado.PAGADO)
                .stream()
                .map(DtoMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PedidoDTO> listarHistorialPagados() {
        return pedidoRepository.findByEstadoOrderByFechaCreacionDesc(PedidoEstado.PAGADO)
                .stream()
                .map(DtoMapper::toDto)
                .toList();
    }

    @Transactional
    public PedidoDTO crear(CrearPedidoRequest request) {
        if (request.detalles() == null || request.detalles().isEmpty()) {
            throw new IllegalArgumentException("El pedido debe incluir al menos un plato");
        }

        Mesa mesa = mesaRepository.findById(request.mesaId())
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));
        if (!mesa.isActiva()) {
            throw new IllegalArgumentException("No se puede cargar un pedido en una mesa inactiva");
        }

        Pedido pedido = new Pedido();
        pedido.setMesa(mesa);

        BigDecimal total = BigDecimal.ZERO;
        for (PedidoDetalleRequest item : request.detalles()) {
            Plato plato = platoRepository.findById(item.platoId())
                    .orElseThrow(() -> new IllegalArgumentException("Plato no encontrado"));
            if (!plato.isActivo()) {
                throw new IllegalArgumentException("El plato no esta activo: " + plato.getNombre());
            }

            PedidoDetalle detalle = new PedidoDetalle();
            detalle.setPlato(plato);
            detalle.setCantidad(item.cantidad());
            detalle.setNotasChef(item.notasChef());
            detalle.setPrecioUnitario(plato.getPrecio());
            pedido.addDetalle(detalle);

            total = total.add(plato.getPrecio().multiply(BigDecimal.valueOf(item.cantidad())));
        }

        pedido.setTotal(total.setScale(2, RoundingMode.HALF_UP));
        PedidoDTO dto = DtoMapper.toDto(pedidoRepository.saveAndFlush(pedido));
        messagingTemplate.convertAndSend("/topic/comandas", dto);
        return dto;
    }

    @Transactional
    public PedidoDTO cambiarEstado(Long pedidoId, PedidoEstado nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));

        PedidoEstado estadoAnterior = pedido.getEstado();
        pedido.setEstado(nuevoEstado);

        if (nuevoEstado == PedidoEstado.LISTO && estadoAnterior != PedidoEstado.LISTO) {
            descontarInventario(pedido);
        }

        PedidoDTO dto = DtoMapper.toDto(pedido);
        messagingTemplate.convertAndSend("/topic/comandas", dto);
        if (nuevoEstado == PedidoEstado.LISTO && estadoAnterior != PedidoEstado.LISTO) {
            publicarPedidoListo(pedido);
        }
        return dto;
    }

    @Transactional
    public List<PedidoDTO> pagarMesa(Long mesaId, PagoRequest request) {
        Mesa mesa = mesaRepository.findById(mesaId)
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));
        List<Pedido> pedidos = pedidoRepository.findByMesaIdAndEstadoNotOrderByFechaCreacionDesc(mesaId, PedidoEstado.PAGADO);
        if (pedidos.isEmpty()) {
            throw new IllegalArgumentException("La mesa no tiene pedidos pendientes de pago");
        }

        for (Pedido pedido : pedidos) {
            pedido.setTipoPago(request.tipoPago());
            pedido.setEstado(PedidoEstado.PAGADO);
            pedido.setTotal(aplicarIva(pedido.getTotal(), request.aplicarIva()));
        }
        mesa.setActiva(false);

        List<PedidoDTO> dtos = pedidos.stream().map(DtoMapper::toDto).toList();
        messagingTemplate.convertAndSend("/topic/comandas", dtos);
        return dtos;
    }

    @Transactional
    public List<PedidoDTO> pagarParcial(Long mesaId, PagoParcialRequest request) {
        Mesa mesa = mesaRepository.findById(mesaId)
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("Selecciona al menos un plato para cobrar por separado");
        }

        Pedido pago = new Pedido();
        pago.setMesa(mesa);
        pago.setEstado(PedidoEstado.PAGADO);
        pago.setTipoPago(request.tipoPago());

        BigDecimal totalSeleccionado = BigDecimal.ZERO;
        for (var item : request.items()) {
            if (item.cantidad() == null || item.cantidad() <= 0) {
                throw new IllegalArgumentException("La cantidad a cobrar debe ser mayor que cero");
            }
            PedidoDetalle detalleOriginal = pedidoDetalleRepository.findById(item.detalleId())
                    .orElseThrow(() -> new IllegalArgumentException("Plato de la cuenta no encontrado"));
            if (!detalleOriginal.getPedido().getMesa().getId().equals(mesaId)
                    || detalleOriginal.getPedido().getEstado() == PedidoEstado.PAGADO) {
                throw new IllegalArgumentException("El plato seleccionado no pertenece a una cuenta abierta de esta mesa");
            }
            if (item.cantidad() > detalleOriginal.getCantidad()) {
                throw new IllegalArgumentException("La cantidad seleccionada supera lo pendiente de cobro");
            }

            PedidoDetalle detallePagado = copiarDetalle(detalleOriginal, item.cantidad());
            pago.addDetalle(detallePagado);
            totalSeleccionado = totalSeleccionado.add(
                    detalleOriginal.getPrecioUnitario().multiply(BigDecimal.valueOf(item.cantidad()))
            );

            detalleOriginal.setCantidad(detalleOriginal.getCantidad() - item.cantidad());
            recalcularTotal(detalleOriginal.getPedido());
        }

        pago.setTotal(aplicarIva(totalSeleccionado, request.aplicarIva()));
        pedidoRepository.save(pago);
        limpiarPedidosVacios(mesaId);

        List<Pedido> pendientes = pedidoRepository.findByMesaIdAndEstadoNotOrderByFechaCreacionDesc(mesaId, PedidoEstado.PAGADO);
        if (pendientes.isEmpty()) {
            mesa.setActiva(false);
        }

        List<PedidoDTO> dtos = pendientes.stream().map(DtoMapper::toDto).toList();
        messagingTemplate.convertAndSend("/topic/comandas", dtos);
        return dtos;
    }

    private void descontarInventario(Pedido pedido) {
        for (PedidoDetalle detalle : pedido.getDetalles()) {
            for (PlatoIngrediente receta : detalle.getPlato().getReceta()) {
                Ingrediente ingrediente = receta.getIngrediente();
                BigDecimal cantidadADescontar = receta.getCantidadRequerida()
                        .multiply(BigDecimal.valueOf(detalle.getCantidad()));
                ingrediente.setStock(ingrediente.getStock().subtract(cantidadADescontar));

                if (ingrediente.getStock().compareTo(ingrediente.getStockMinimo()) < 0) {
                    messagingTemplate.convertAndSend(
                            "/topic/alertas-stock",
                            new AlertaStockDTO(
                                    ingrediente.getId(),
                                    ingrediente.getNombre(),
                                    ingrediente.getStock(),
                                    ingrediente.getStockMinimo()
                            )
                    );
                }
            }
        }
    }

    private PedidoDetalle copiarDetalle(PedidoDetalle original, int cantidad) {
        PedidoDetalle copia = new PedidoDetalle();
        copia.setPlato(original.getPlato());
        copia.setCantidad(cantidad);
        copia.setNotasChef(original.getNotasChef());
        copia.setPrecioUnitario(original.getPrecioUnitario());
        return copia;
    }

    private void recalcularTotal(Pedido pedido) {
        BigDecimal total = pedido.getDetalles().stream()
                .filter(detalle -> detalle.getCantidad() > 0)
                .map(detalle -> detalle.getPrecioUnitario().multiply(BigDecimal.valueOf(detalle.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        pedido.setTotal(total.setScale(2, RoundingMode.HALF_UP));
    }

    private void limpiarPedidosVacios(Long mesaId) {
        List<Pedido> pedidos = pedidoRepository.findByMesaIdAndEstadoNotOrderByFechaCreacionDesc(mesaId, PedidoEstado.PAGADO);
        for (Pedido pedido : pedidos) {
            pedido.getDetalles().removeIf(detalle -> detalle.getCantidad() <= 0);
            if (pedido.getDetalles().isEmpty()) {
                pedidoRepository.delete(pedido);
            }
        }
    }

    private BigDecimal aplicarIva(BigDecimal total, Boolean aplicarIva) {
        if (Boolean.FALSE.equals(aplicarIva)) {
            return total.setScale(2, RoundingMode.HALF_UP);
        }
        return total.multiply(IVA).setScale(2, RoundingMode.HALF_UP);
    }

    private void publicarPedidoListo(Pedido pedido) {
        List<String> platos = pedido.getDetalles().stream()
                .map(detalle -> detalle.getCantidad() + "x " + detalle.getPlato().getNombre())
                .toList();
        messagingTemplate.convertAndSend(
                "/topic/pedidos-listos",
                new PedidoListoDTO(pedido.getId(), DtoMapper.toDto(pedido.getMesa()), platos)
        );
    }
}
