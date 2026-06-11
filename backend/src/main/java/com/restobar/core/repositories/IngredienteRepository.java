package com.restobar.core.repositories;

import com.restobar.core.entities.Ingrediente;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface IngredienteRepository extends JpaRepository<Ingrediente, Long> {

    @Query("select i from Ingrediente i where i.stock <= i.stockMinimo order by i.nombre")
    List<Ingrediente> findConStockBajo();
}
