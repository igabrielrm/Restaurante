package com.restobar.core.services;

import com.restobar.core.dto.DashboardDTO;
import com.restobar.core.dto.PedidosPorHoraDTO;
import com.restobar.core.dto.TopPlatoDTO;
import com.restobar.core.dto.VentasPorPagoDTO;
import com.restobar.core.repositories.PedidoDetalleRepository;
import com.restobar.core.repositories.PedidoRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EstadisticasService {

    private final PedidoDetalleRepository pedidoDetalleRepository;
    private final PedidoRepository pedidoRepository;

    public EstadisticasService(PedidoDetalleRepository pedidoDetalleRepository, PedidoRepository pedidoRepository) {
        this.pedidoDetalleRepository = pedidoDetalleRepository;
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional(readOnly = true)
    public List<TopPlatoDTO> topPlatos() {
        return pedidoDetalleRepository.topPlatosVendidos();
    }

    @Transactional(readOnly = true)
    public Map<String, List<VentasPorPagoDTO>> ventasAgrupadas() {
        LocalDate hoy = LocalDate.now();
        Map<String, List<VentasPorPagoDTO>> resultado = new LinkedHashMap<>();
        resultado.put("dia", ventasEntre(hoy.atStartOfDay(), hoy.atTime(LocalTime.MAX)));
        resultado.put("semana", ventasEntre(
                hoy.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay(),
                hoy.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(LocalTime.MAX)
        ));
        resultado.put("mes", ventasEntre(
                hoy.withDayOfMonth(1).atStartOfDay(),
                hoy.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX)
        ));
        return resultado;
    }

    @Transactional(readOnly = true)
    public List<PedidosPorHoraDTO> pedidosPorHora() {
        LocalDate hoy = LocalDate.now();
        return pedidoRepository.pedidosPorHora(hoy.atStartOfDay(), hoy.atTime(LocalTime.MAX));
    }

    @Transactional(readOnly = true)
    public DashboardDTO dashboard() {
        return new DashboardDTO(topPlatos(), ventasAgrupadas(), pedidosPorHora());
    }

    private List<VentasPorPagoDTO> ventasEntre(LocalDateTime desde, LocalDateTime hasta) {
        return pedidoRepository.ventasPorPago(desde, hasta);
    }
}
