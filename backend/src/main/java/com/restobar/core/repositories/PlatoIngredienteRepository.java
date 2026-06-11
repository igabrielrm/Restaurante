package com.restobar.core.repositories;

import com.restobar.core.entities.PlatoIngrediente;
import com.restobar.core.entities.PlatoIngredienteId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatoIngredienteRepository extends JpaRepository<PlatoIngrediente, PlatoIngredienteId> {
}
