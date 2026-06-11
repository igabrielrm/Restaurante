package com.restobar.core.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PedidoDetalleRequest(
        @NotNull(message = "Selecciona un plato")
        Long platoId,
        @NotNull(message = "Ingresa una cantidad")
        @Min(value = 1, message = "La cantidad debe ser mayor que cero")
        Integer cantidad,
        @Size(max = 500, message = "La nota es demasiado larga")
        String notasChef
) {
}
