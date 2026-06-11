package com.restobar.core.controllers;

import com.restobar.core.dto.DashboardDTO;
import com.restobar.core.dto.PedidosPorHoraDTO;
import com.restobar.core.dto.TopPlatoDTO;
import com.restobar.core.dto.VentasPorPagoDTO;
import com.restobar.core.services.EstadisticasService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/estadisticas")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;

    public EstadisticasController(EstadisticasService estadisticasService) {
        this.estadisticasService = estadisticasService;
    }

    @GetMapping("/top-platos")
    public List<TopPlatoDTO> topPlatos() {
        return estadisticasService.topPlatos();
    }

    @GetMapping("/ventas")
    public Map<String, List<VentasPorPagoDTO>> ventas() {
        return estadisticasService.ventasAgrupadas();
    }

    @GetMapping("/pedidos-por-hora")
    public List<PedidosPorHoraDTO> pedidosPorHora() {
        return estadisticasService.pedidosPorHora();
    }

    @GetMapping("/dashboard")
    public DashboardDTO dashboard() {
        return estadisticasService.dashboard();
    }
}
