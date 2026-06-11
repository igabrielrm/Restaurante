package com.restobar.core.dto;

import java.math.BigDecimal;

public record AlertaStockDTO(Long ingredienteId, String ingredienteNombre, BigDecimal stock, BigDecimal stockMinimo) {
}
