package com.restobar.core.dto;

import java.math.BigDecimal;

public record IngredienteDTO(Long id, String nombre, BigDecimal stock, BigDecimal stockMinimo) {
}
