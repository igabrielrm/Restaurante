package com.restobar.core.dto;

import jakarta.validation.constraints.Size;

public record CrearMesaRequest(
        @Size(max = 200, message = "La descripcion no puede superar 200 caracteres")
        String descripcion
) {
}
