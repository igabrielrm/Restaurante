package com.restobar.core.config;

import com.restobar.core.entities.Rol;
import com.restobar.core.entities.Usuario;
import com.restobar.core.repositories.UsuarioRepository;
import java.util.List;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataBootstrap {

    @Bean
    ApplicationRunner ensureBaseUsers(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            List<BaseUser> users = List.of(
                    new BaseUser("admin", "admin123", Rol.ADMIN),
                    new BaseUser("mesero", "mesero123", Rol.MESERO),
                    new BaseUser("cajero", "cajero123", Rol.CAJERO),
                    new BaseUser("cocina", "cocina123", Rol.COCINERO)
            );

            for (BaseUser user : users) {
                if (usuarioRepository.existsByUsername(user.username())) {
                    continue;
                }

                Usuario usuario = new Usuario();
                usuario.setUsername(user.username());
                usuario.setPassword(passwordEncoder.encode(user.password()));
                usuario.setRol(user.rol());
                usuarioRepository.save(usuario);
            }
        };
    }

    private record BaseUser(String username, String password, Rol rol) {
    }
}
