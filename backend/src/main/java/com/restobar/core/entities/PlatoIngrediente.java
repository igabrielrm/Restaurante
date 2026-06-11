package com.restobar.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(
        name = "plato_ingredientes",
        indexes = {
                @Index(name = "idx_plato_ingredientes_plato", columnList = "plato_id"),
                @Index(name = "idx_plato_ingredientes_ingrediente", columnList = "ingrediente_id")
        }
)
public class PlatoIngrediente {

    @EmbeddedId
    private PlatoIngredienteId id = new PlatoIngredienteId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("platoId")
    @JoinColumn(name = "plato_id", nullable = false)
    private Plato plato;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("ingredienteId")
    @JoinColumn(name = "ingrediente_id", nullable = false)
    private Ingrediente ingrediente;

    @Column(name = "cantidad_requerida", nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidadRequerida;

    public PlatoIngredienteId getId() {
        return id;
    }

    public void setId(PlatoIngredienteId id) {
        this.id = id;
    }

    public Plato getPlato() {
        return plato;
    }

    public void setPlato(Plato plato) {
        this.plato = plato;
    }

    public Ingrediente getIngrediente() {
        return ingrediente;
    }

    public void setIngrediente(Ingrediente ingrediente) {
        this.ingrediente = ingrediente;
    }

    public BigDecimal getCantidadRequerida() {
        return cantidadRequerida;
    }

    public void setCantidadRequerida(BigDecimal cantidadRequerida) {
        this.cantidadRequerida = cantidadRequerida;
    }
}
