package com.restobar.core.services;

import com.restobar.core.dto.IngredienteDTO;
import com.restobar.core.dto.IngredienteRequest;
import com.restobar.core.entities.Ingrediente;
import com.restobar.core.repositories.IngredienteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IngredienteService {

    private final IngredienteRepository ingredienteRepository;

    public IngredienteService(IngredienteRepository ingredienteRepository) {
        this.ingredienteRepository = ingredienteRepository;
    }

    @Transactional(readOnly = true)
    public List<IngredienteDTO> listar() {
        return ingredienteRepository.findAll().stream().map(DtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<IngredienteDTO> stockBajo() {
        return ingredienteRepository.findConStockBajo().stream().map(DtoMapper::toDto).toList();
    }

    @Transactional
    public IngredienteDTO crear(IngredienteRequest request) {
        Ingrediente ingrediente = new Ingrediente();
        aplicarCampos(ingrediente, request);
        return DtoMapper.toDto(ingredienteRepository.save(ingrediente));
    }

    @Transactional
    public IngredienteDTO actualizar(Long id, IngredienteRequest request) {
        Ingrediente ingrediente = ingredienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ingrediente no encontrado"));
        aplicarCampos(ingrediente, request);
        return DtoMapper.toDto(ingrediente);
    }

    @Transactional
    public void eliminar(Long id) {
        Ingrediente ingrediente = ingredienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ingrediente no encontrado"));
        if (!ingrediente.getRecetas().isEmpty()) {
            throw new IllegalArgumentException("No se puede eliminar un ingrediente que forma parte de una receta");
        }
        ingredienteRepository.delete(ingrediente);
    }

    private void aplicarCampos(Ingrediente ingrediente, IngredienteRequest request) {
        ingrediente.setNombre(request.nombre());
        ingrediente.setStock(request.stock());
        ingrediente.setStockMinimo(request.stockMinimo());
    }
}
