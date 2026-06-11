package com.restobar.core.controllers;

import com.restobar.core.dto.IngredienteDTO;
import com.restobar.core.dto.IngredienteRequest;
import com.restobar.core.services.IngredienteService;
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
@RequestMapping("/api/ingredientes")
public class IngredienteController {

    private final IngredienteService ingredienteService;

    public IngredienteController(IngredienteService ingredienteService) {
        this.ingredienteService = ingredienteService;
    }

    @GetMapping
    public List<IngredienteDTO> listar() {
        return ingredienteService.listar();
    }

    @GetMapping("/stock-bajo")
    public List<IngredienteDTO> stockBajo() {
        return ingredienteService.stockBajo();
    }

    @PostMapping
    public IngredienteDTO crear(@Valid @RequestBody IngredienteRequest request) {
        return ingredienteService.crear(request);
    }

    @PutMapping("/{id}")
    public IngredienteDTO actualizar(@PathVariable Long id, @Valid @RequestBody IngredienteRequest request) {
        return ingredienteService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        ingredienteService.eliminar(id);
    }
}
