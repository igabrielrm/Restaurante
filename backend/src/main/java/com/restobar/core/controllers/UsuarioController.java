package com.restobar.core.controllers;

import com.restobar.core.dto.CambiarPasswordRequest;
import com.restobar.core.dto.UsuarioDTO;
import com.restobar.core.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final AuthService authService;

    public UsuarioController(AuthService authService) {
        this.authService = authService;
    }

    @PutMapping("/cambiar-password")
    public UsuarioDTO cambiarPassword(@Valid @RequestBody CambiarPasswordRequest request, Authentication authentication) {
        return authService.cambiarPassword(request, authentication.getName());
    }
}
