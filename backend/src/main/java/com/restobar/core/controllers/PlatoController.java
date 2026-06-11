package com.restobar.core.controllers;

import com.restobar.core.dto.PlatoDTO;
import com.restobar.core.dto.PlatoRequest;
import com.restobar.core.services.PlatoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/platos")
public class PlatoController {

    private final PlatoService platoService;

    public PlatoController(PlatoService platoService) {
        this.platoService = platoService;
    }

    @GetMapping
    public List<PlatoDTO> listarActivos() {
        return platoService.listarActivos();
    }

    @GetMapping("/admin")
    public List<PlatoDTO> listarTodos() {
        return platoService.listarTodos();
    }

    @PostMapping
    public PlatoDTO crear(@Valid @RequestBody PlatoRequest request) {
        return platoService.crear(request);
    }

    @PutMapping("/{id}")
    public PlatoDTO actualizar(@PathVariable Long id, @Valid @RequestBody PlatoRequest request) {
        return platoService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public PlatoDTO desactivar(@PathVariable Long id) {
        return platoService.desactivar(id);
    }
}
