package com.restobar.core.dto;

import com.restobar.core.entities.TipoPago;
import java.math.BigDecimal;

public record VentasPorPagoDTO(TipoPago tipoPago, BigDecimal total) {
}
