package com.restobar.core.config;

import com.restobar.core.entities.Usuario;
import com.restobar.core.repositories.UsuarioRepository;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public UserDetailsService userDetailsService(UsuarioRepository usuarioRepository) {
        return username -> {
            Usuario usuario = usuarioRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
            return User.withUsername(usuario.getUsername())
                    .password(usuario.getPassword())
                    .roles(usuario.getRol().name())
                    .build();
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(List.of(provider));
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .ignoringRequestMatchers("/api/auth/login", "/api/auth/logout", "/ws-restaurante/**")
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(HttpStatus.NO_CONTENT.value()))
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write(errorBody(401, "Unauthorized", "Debes iniciar sesion para continuar"));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write(errorBody(403, "Forbidden", "No tienes permiso para realizar esta accion"));
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()
                        .requestMatchers("/ws-restaurante/**").permitAll()
                        .requestMatchers("/api/usuarios/cambiar-password").authenticated()
                        .requestMatchers("/api/ingredientes/**").hasRole("ADMIN")
                        .requestMatchers("/api/estadisticas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/platos").authenticated()
                        .requestMatchers("/api/platos/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/platos").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/platos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/platos/**").hasRole("ADMIN")
                        .requestMatchers("/api/pedidos/historial").hasAnyRole("CAJERO", "ADMIN")
                        .requestMatchers("/api/pedidos/mesa/*/pagar", "/api/pedidos/mesa/*/pagar/").hasAnyRole("CAJERO", "ADMIN")
                        .requestMatchers("/api/pedidos/mesa/*/pagar-parcial", "/api/pedidos/mesa/*/pagar-parcial/").hasAnyRole("CAJERO", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/pedidos/*/estado").hasAnyRole("COCINERO", "ADMIN")
                        .requestMatchers("/api/pedidos/comandas").hasAnyRole("COCINERO", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/pedidos").hasAnyRole("MESERO", "ADMIN")
                        .requestMatchers("/api/pedidos/mesa/**").hasAnyRole("MESERO", "CAJERO", "ADMIN")
                        .requestMatchers("/api/mesas/**").hasAnyRole("MESERO", "CAJERO", "ADMIN")
                        .anyRequest().authenticated()
                )
                .build();
    }

    private String errorBody(int status, String error, String message) {
        return String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\"}",
                Instant.now(),
                status,
                error,
                message
        );
    }
}
