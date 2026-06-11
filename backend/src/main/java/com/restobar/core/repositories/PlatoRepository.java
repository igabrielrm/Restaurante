package com.restobar.core.repositories;

import com.restobar.core.entities.Plato;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatoRepository extends JpaRepository<Plato, Long> {
    List<Plato> findByActivoTrueOrderByNombreAsc();

    @EntityGraph(attributePaths = {"receta", "receta.ingrediente"})
    List<Plato> findAllByOrderByNombreAsc();
}
