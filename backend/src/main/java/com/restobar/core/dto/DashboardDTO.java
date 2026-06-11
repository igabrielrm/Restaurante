package com.restobar.core.dto;

import java.util.List;
import java.util.Map;

public record DashboardDTO(
        List<TopPlatoDTO> topPlatos,
        Map<String, List<VentasPorPagoDTO>> ventas,
        List<PedidosPorHoraDTO> horasPico
) {
}
