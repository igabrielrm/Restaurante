package com.restobar.core.dto;

import com.restobar.core.entities.PedidoEstado;
import jakarta.validation.constraints.NotNull;

public record EstadoPedidoRequest(
        @NotNull(message = "Selecciona el nuevo estado del pedido")
        PedidoEstado estado
) {
}
