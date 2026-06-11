package com.restobar.core.services;

import com.restobar.core.dto.CrearMesaRequest;
import com.restobar.core.dto.MesaDTO;
import com.restobar.core.entities.Mesa;
import com.restobar.core.repositories.MesaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MesaService {

    private final MesaRepository mesaRepository;

    public MesaService(MesaRepository mesaRepository) {
        this.mesaRepository = mesaRepository;
    }

    @Transactional(readOnly = true)
    public List<MesaDTO> listarActivas() {
        return mesaRepository.findByActivaTrueOrderByIdAsc().stream()
                .map(DtoMapper::toDto)
                .toList();
    }

    @Transactional
    public MesaDTO abrirMesa(CrearMesaRequest request) {
        Mesa mesa = new Mesa();
        mesa.setActiva(true);
        mesa.setDescripcion(request.descripcion());
        mesa.setIdentificadorDinamico("Mesa #" + (mesaRepository.countByActivaTrue() + 1));
        return DtoMapper.toDto(mesaRepository.save(mesa));
    }

    @Transactional
    public MesaDTO cerrarMesa(Long id) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mesa no encontrada"));
        mesa.setActiva(false);
        return DtoMapper.toDto(mesa);
    }
}
