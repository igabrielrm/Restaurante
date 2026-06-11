package com.restobar.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CambiarPasswordRequest(
        @NotBlank(message = "Ingresa la contraseña actual")
        String passwordActual,
        @NotBlank(message = "Ingresa la nueva contraseña")
        @Size(min = 8, max = 120, message = "La nueva contraseña debe tener entre 8 y 120 caracteres")
        String nuevaPassword
) {
}
