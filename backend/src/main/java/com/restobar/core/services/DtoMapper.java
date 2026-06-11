package com.restobar.core.services;

import com.restobar.core.dto.IngredienteDTO;
import com.restobar.core.dto.MesaDTO;
import com.restobar.core.dto.PedidoDTO;
import com.restobar.core.dto.PedidoDetalleDTO;
import com.restobar.core.dto.PlatoDTO;
import com.restobar.core.dto.RecetaItemDTO;
import com.restobar.core.dto.UsuarioDTO;
import com.restobar.core.entities.Ingrediente;
import com.restobar.core.entities.Mesa;
import com.restobar.core.entities.Pedido;
import com.restobar.core.entities.PedidoDetalle;
import com.restobar.core.entities.Plato;
import com.restobar.core.entities.Usuario;
import java.math.BigDecimal;

public final class DtoMapper {

    private DtoMapper() {
    }

    public static UsuarioDTO toDto(Usuario usuario) {
        return new UsuarioDTO(usuario.getId(), usuario.getUsername(), usuario.getRol());
    }

    public static MesaDTO toDto(Mesa mesa) {
        return new MesaDTO(mesa.getId(), mesa.getIdentificadorDinamico(), mesa.getDescripcion(), mesa.isActiva());
    }

    public static IngredienteDTO toDto(Ingrediente ingrediente) {
        return new IngredienteDTO(
                ingrediente.getId(),
                ingrediente.getNombre(),
                ingrediente.getStock(),
                ingrediente.getStockMinimo()
        );
    }

    public static PlatoDTO toDto(Plato plato) {
        return new PlatoDTO(
                plato.getId(),
                plato.getNombre(),
                plato.getDescripcion(),
                plato.getPrecio(),
                plato.getImagenUrl(),
                plato.isActivo(),
                plato.getReceta().stream()
                        .map(item -> new RecetaItemDTO(
                                item.getIngrediente().getId(),
                                item.getIngrediente().getNombre(),
                                item.getCantidadRequerida()
                        ))
                        .toList()
        );
    }

    public static PedidoDTO toDto(Pedido pedido) {
        return new PedidoDTO(
                pedido.getId(),
                toDto(pedido.getMesa()),
                pedido.getEstado(),
                pedido.getTipoPago(),
                pedido.getTotal(),
                pedido.getFechaCreacion(),
                pedido.getDetalles().stream().map(DtoMapper::toDto).toList()
        );
    }

    private static PedidoDetalleDTO toDto(PedidoDetalle detalle) {
        BigDecimal subtotal = detalle.getPrecioUnitario().multiply(BigDecimal.valueOf(detalle.getCantidad()));
        return new PedidoDetalleDTO(
                detalle.getId(),
                detalle.getPlato().getId(),
                detalle.getPlato().getNombre(),
                detalle.getCantidad(),
                detalle.getNotasChef(),
                detalle.getPrecioUnitario(),
                subtotal
        );
    }
}
