package com.restobar.core.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record PlatoRequest(
        @NotBlank(message = "Ingresa el nombre del plato")
        @Size(max = 140, message = "El nombre del plato es demasiado largo")
        String nombre,
        @Size(max = 500, message = "La descripcion es demasiado larga")
        String descripcion,
        @NotNull(message = "Ingresa el precio")
        @DecimalMin(value = "0.00", message = "El precio no puede ser negativo")
        BigDecimal precio,
        String imagenUrl,
        boolean activo,
        @Valid
        List<RecetaItemRequest> receta
) {
}
