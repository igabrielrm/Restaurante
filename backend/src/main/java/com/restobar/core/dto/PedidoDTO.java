package com.restobar.core.dto;

import com.restobar.core.entities.PedidoEstado;
import com.restobar.core.entities.TipoPago;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoDTO(
        Long id,
        MesaDTO mesa,
        PedidoEstado estado,
        TipoPago tipoPago,
        BigDecimal total,
        LocalDateTime fechaCreacion,
        List<PedidoDetalleDTO> detalles
) {
}
