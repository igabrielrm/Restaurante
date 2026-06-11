package com.restobar.core.repositories;

import com.restobar.core.entities.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);

    boolean existsByUsername(String username);
}
