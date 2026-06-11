package com.restobar.core.dto;

import com.restobar.core.entities.TipoPago;
import jakarta.validation.constraints.NotNull;

public record PagoRequest(
        @NotNull(message = "Selecciona la forma de pago")
        TipoPago tipoPago,
        Boolean aplicarIva
) {
}
