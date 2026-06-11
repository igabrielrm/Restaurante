package com.restobar.core.dto;

import java.math.BigDecimal;

public record PedidoDetalleDTO(
        Long id,
        Long platoId,
        String platoNombre,
        Integer cantidad,
        String notasChef,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) {
}
