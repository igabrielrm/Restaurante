package com.restobar.core.services;

import com.restobar.core.dto.PlatoDTO;
import com.restobar.core.dto.PlatoRequest;
import com.restobar.core.dto.RecetaItemRequest;
import com.restobar.core.entities.Ingrediente;
import com.restobar.core.entities.Plato;
import com.restobar.core.entities.PlatoIngrediente;
import com.restobar.core.entities.PlatoIngredienteId;
import com.restobar.core.repositories.IngredienteRepository;
import com.restobar.core.repositories.PlatoRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatoService {

    private final PlatoRepository platoRepository;
    private final IngredienteRepository ingredienteRepository;

    public PlatoService(PlatoRepository platoRepository, IngredienteRepository ingredienteRepository) {
        this.platoRepository = platoRepository;
        this.ingredienteRepository = ingredienteRepository;
    }

    @Transactional(readOnly = true)
    public List<PlatoDTO> listarActivos() {
        return platoRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(DtoMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlatoDTO> listarTodos() {
        return platoRepository.findAllByOrderByNombreAsc().stream()
                .map(DtoMapper::toDto)
                .toList();
    }

    @Transactional
    public PlatoDTO crear(PlatoRequest request) {
        Plato plato = new Plato();
        aplicarCampos(plato, request);
        Plato guardado = platoRepository.saveAndFlush(plato);
        aplicarReceta(guardado, request.receta());
        return DtoMapper.toDto(guardado);
    }

    @Transactional
    public PlatoDTO actualizar(Long id, PlatoRequest request) {
        Plato plato = platoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Plato no encontrado"));
        aplicarCampos(plato, request);
        actualizarReceta(plato, request.receta());
        return DtoMapper.toDto(plato);
    }

    @Transactional
    public PlatoDTO desactivar(Long id) {
        Plato plato = platoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Plato no encontrado"));
        plato.setActivo(false);
        return DtoMapper.toDto(plato);
    }

    private void aplicarCampos(Plato plato, PlatoRequest request) {
        plato.setNombre(request.nombre());
        plato.setDescripcion(request.descripcion());
        plato.setPrecio(request.precio());
        plato.setImagenUrl(request.imagenUrl());
        plato.setActivo(request.activo());
    }

    private void aplicarReceta(Plato plato, List<RecetaItemRequest> receta) {
        if (receta == null) {
            return;
        }
        for (RecetaItemRequest item : receta) {
            Ingrediente ingrediente = ingredienteRepository.findById(item.ingredienteId())
                    .orElseThrow(() -> new IllegalArgumentException("Ingrediente no encontrado"));
            PlatoIngrediente platoIngrediente = new PlatoIngrediente();
            platoIngrediente.setId(new PlatoIngredienteId(plato.getId(), ingrediente.getId()));
            platoIngrediente.setPlato(plato);
            platoIngrediente.setIngrediente(ingrediente);
            platoIngrediente.setCantidadRequerida(item.cantidadRequerida());
            plato.getReceta().add(platoIngrediente);
        }
    }

    private void actualizarReceta(Plato plato, List<RecetaItemRequest> receta) {
        if (receta == null) {
            plato.getReceta().clear();
            return;
        }

        Set<Long> ingredientesSolicitados = receta.stream()
                .map(RecetaItemRequest::ingredienteId)
                .collect(Collectors.toSet());
        plato.getReceta().removeIf(item -> !ingredientesSolicitados.contains(item.getIngrediente().getId()));

        Map<Long, PlatoIngrediente> recetaActual = plato.getReceta().stream()
                .collect(Collectors.toMap(item -> item.getIngrediente().getId(), Function.identity()));

        for (RecetaItemRequest item : receta) {
            PlatoIngrediente existente = recetaActual.get(item.ingredienteId());
            if (existente != null) {
                existente.setCantidadRequerida(item.cantidadRequerida());
                continue;
            }
            Ingrediente ingrediente = ingredienteRepository.findById(item.ingredienteId())
                    .orElseThrow(() -> new IllegalArgumentException("Ingrediente no encontrado"));
            PlatoIngrediente nuevo = new PlatoIngrediente();
            nuevo.setId(new PlatoIngredienteId(plato.getId(), ingrediente.getId()));
            nuevo.setPlato(plato);
            nuevo.setIngrediente(ingrediente);
            nuevo.setCantidadRequerida(item.cantidadRequerida());
            plato.getReceta().add(nuevo);
        }
    }
}
