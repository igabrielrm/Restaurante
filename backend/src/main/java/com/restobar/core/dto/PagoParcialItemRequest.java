package com.restobar.core.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PagoParcialItemRequest(
        @NotNull(message = "Selecciona un plato de la cuenta")
        @JsonAlias({"id_producto", "idProducto", "itemId", "id_item"})
        Long detalleId,
        @NotNull(message = "Ingresa la cantidad a cobrar")
        @Min(value = 1, message = "La cantidad a cobrar debe ser mayor que cero")
        @JsonAlias({"cantidad_a_pagar", "cantidadAPagar"})
        Integer cantidad
) {
}
