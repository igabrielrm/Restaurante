package com.restobar.core.dto;

import java.math.BigDecimal;
import java.util.List;

public record PlatoDTO(
        Long id,
        String nombre,
        String descripcion,
        BigDecimal precio,
        String imagenUrl,
        boolean activo,
        List<RecetaItemDTO> receta
) {
}
