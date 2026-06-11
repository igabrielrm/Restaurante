package com.restobar.core.dto;

import java.math.BigDecimal;

public record TopPlatoDTO(Long platoId, String platoNombre, Long unidadesVendidas, BigDecimal ingresoTotal) {
}
