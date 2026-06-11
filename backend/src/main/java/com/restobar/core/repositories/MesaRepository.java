package com.restobar.core.repositories;

import com.restobar.core.entities.Mesa;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MesaRepository extends JpaRepository<Mesa, Long> {
    List<Mesa> findByActivaTrueOrderByIdAsc();
    long countByActivaTrue();
}
