package com.restobar.core.dto;

import com.restobar.core.entities.TipoPago;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record PagoParcialRequest(
        @NotNull(message = "Selecciona la forma de pago")
        TipoPago tipoPago,
        Boolean aplicarIva,
        @Valid
        @NotEmpty(message = "Selecciona al menos un plato para cobrar")
        List<PagoParcialItemRequest> items
) {
}
