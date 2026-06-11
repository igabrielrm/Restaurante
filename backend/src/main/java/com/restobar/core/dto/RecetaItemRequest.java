package com.restobar.core.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RecetaItemRequest(
        @NotNull(message = "Selecciona un ingrediente")
        Long ingredienteId,
        @NotNull(message = "Ingresa la cantidad requerida")
        @DecimalMin(value = "0.01", message = "La cantidad requerida debe ser mayor que cero")
        BigDecimal cantidadRequerida
) {
}
