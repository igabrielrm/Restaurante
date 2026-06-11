package com.restobar.core.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record IngredienteRequest(
        @NotBlank(message = "Ingresa el nombre del ingrediente")
        @Size(max = 120, message = "El nombre es demasiado largo")
        String nombre,
        @NotNull(message = "Ingresa el stock actual")
        @DecimalMin(value = "0.00", message = "El stock no puede ser negativo")
        BigDecimal stock,
        @NotNull(message = "Ingresa el stock minimo")
        @DecimalMin(value = "0.00", message = "El stock minimo no puede ser negativo")
        BigDecimal stockMinimo
) {
}
