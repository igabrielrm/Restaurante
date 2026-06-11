package com.restobar.core.dto;

import java.math.BigDecimal;

public record RecetaItemDTO(Long ingredienteId, String ingredienteNombre, BigDecimal cantidadRequerida) {
}
