package com.restobar.core.controllers;

import com.restobar.core.dto.CrearMesaRequest;
import com.restobar.core.dto.MesaDTO;
import com.restobar.core.services.MesaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mesas")
public class MesaController {

    private final MesaService mesaService;

    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    @GetMapping("/activas")
    public List<MesaDTO> listarActivas() {
        return mesaService.listarActivas();
    }

    @PostMapping
    public MesaDTO abrirMesa(@Valid @RequestBody CrearMesaRequest request) {
        return mesaService.abrirMesa(request);
    }

    @PutMapping("/{id}/cerrar")
    public MesaDTO cerrarMesa(@PathVariable Long id) {
        return mesaService.cerrarMesa(id);
    }
}
