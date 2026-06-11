package com.restobar.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "mesas",
        indexes = {
                @Index(name = "idx_mesas_activa", columnList = "activa"),
                @Index(name = "idx_mesas_identificador", columnList = "identificador_dinamico")
        }
)
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "identificador_dinamico", nullable = false, length = 60)
    private String identificadorDinamico;

    @Column(length = 200)
    private String descripcion;

    @Column(nullable = false)
    private boolean activa = true;

    @OneToMany(mappedBy = "mesa")
    private List<Pedido> pedidos = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdentificadorDinamico() {
        return identificadorDinamico;
    }

    public void setIdentificadorDinamico(String identificadorDinamico) {
        this.identificadorDinamico = identificadorDinamico;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }

    public List<Pedido> getPedidos() {
        return pedidos;
    }
}
