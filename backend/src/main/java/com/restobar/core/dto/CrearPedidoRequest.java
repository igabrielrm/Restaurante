package com.restobar.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CrearPedidoRequest(
        @NotNull(message = "Selecciona una mesa")
        Long mesaId,
        @Valid
        @NotEmpty(message = "El pedido debe incluir al menos un plato")
        List<PedidoDetalleRequest> detalles
) {
}
