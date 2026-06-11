package com.restobar.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Ingresa el usuario")
        @Size(max = 80, message = "El usuario es demasiado largo")
        String username,
        @NotBlank(message = "Ingresa la contraseña")
        @Size(max = 120, message = "La contraseña es demasiado larga")
        String password
) {
}
