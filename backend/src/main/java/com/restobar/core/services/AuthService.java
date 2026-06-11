package com.restobar.core.services;

import com.restobar.core.dto.LoginRequest;
import com.restobar.core.dto.UsuarioDTO;
import com.restobar.core.dto.CambiarPasswordRequest;
import com.restobar.core.entities.Usuario;
import com.restobar.core.repositories.UsuarioRepository;
import java.util.List;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UsuarioDTO login(LoginRequest request) {
        return usuarioRepository.findByUsername(request.username())
                .filter(usuario -> passwordEncoder.matches(request.password(), usuario.getPassword()))
                .map(DtoMapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Credenciales invalidas"));
    }

    @Transactional
    public UsuarioDTO cambiarPassword(CambiarPasswordRequest request, String username) {
        if (request.nuevaPassword() == null || request.nuevaPassword().isBlank()) {
            throw new IllegalArgumentException("La nueva contraseña no puede estar vacia");
        }

        return usuarioRepository.findByUsername(username)
                .filter(usuario -> passwordEncoder.matches(request.passwordActual(), usuario.getPassword()))
                .map(usuario -> {
                    usuario.setPassword(passwordEncoder.encode(request.nuevaPassword()));
                    return DtoMapper.toDto(usuario);
                })
                .orElseThrow(() -> new IllegalArgumentException("La contraseña actual no coincide"));
    }

    @Bean
    ApplicationRunner migratePlainTextPasswords(UsuarioRepository repository, PasswordEncoder encoder) {
        return args -> {
            List<Usuario> usuarios = repository.findAll();
            for (Usuario usuario : usuarios) {
                if (usuario.getPassword() != null && !usuario.getPassword().startsWith("$2")) {
                    usuario.setPassword(encoder.encode(usuario.getPassword()));
                }
            }
            repository.saveAll(usuarios);
        };
    }
}
