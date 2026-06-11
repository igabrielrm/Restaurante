package com.restobar.core.dto;

import com.restobar.core.entities.Rol;

public record UsuarioDTO(Long id, String username, Rol rol) {
}
