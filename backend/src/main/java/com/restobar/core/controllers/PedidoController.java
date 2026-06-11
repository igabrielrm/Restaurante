package com.restobar.core.controllers;

import com.restobar.core.dto.CrearPedidoRequest;
import com.restobar.core.dto.EstadoPedidoRequest;
import com.restobar.core.dto.PagoRequest;
import com.restobar.core.dto.PagoParcialRequest;
import com.restobar.core.dto.PedidoDTO;
import com.restobar.core.services.PedidoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping("/comandas")
    public List<PedidoDTO> comandasActivas() {
        return pedidoService.listarComandasActivas();
    }

    @GetMapping("/historial")
    public List<PedidoDTO> historialPagados() {
        return pedidoService.listarHistorialPagados();
    }

    @GetMapping("/mesa/{mesaId}")
    public List<PedidoDTO> pedidosPorMesa(@PathVariable Long mesaId) {
        return pedidoService.listarPorMesa(mesaId);
    }

    @PostMapping
    public PedidoDTO crear(@Valid @RequestBody CrearPedidoRequest request) {
        return pedidoService.crear(request);
    }

    @PutMapping("/{pedidoId}/estado")
    public PedidoDTO cambiarEstado(@PathVariable Long pedidoId, @Valid @RequestBody EstadoPedidoRequest request) {
        return pedidoService.cambiarEstado(pedidoId, request.estado());
    }

    @PutMapping("/mesa/{mesaId}/pagar")
    public List<PedidoDTO> pagarMesa(@PathVariable Long mesaId, @Valid @RequestBody PagoRequest request) {
        return pedidoService.pagarMesa(mesaId, request);
    }

    @PutMapping({"/mesa/{mesaId}/pagar-parcial", "/mesa/{mesaId}/pagar-parcial/"})
    public List<PedidoDTO> pagarParcial(@PathVariable Long mesaId, @Valid @RequestBody PagoParcialRequest request) {
        return pedidoService.pagarParcial(mesaId, request);
    }

    @PostMapping({"/mesa/{mesaId}/pagar-parcial", "/mesa/{mesaId}/pagar-parcial/"})
    public List<PedidoDTO> pagarParcialPost(@PathVariable Long mesaId, @Valid @RequestBody PagoParcialRequest request) {
        return pedidoService.pagarParcial(mesaId, request);
    }
}
