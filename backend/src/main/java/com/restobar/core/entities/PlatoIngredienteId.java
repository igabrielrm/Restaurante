package com.restobar.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PlatoIngredienteId implements Serializable {

    @Column(name = "plato_id")
    private Long platoId;

    @Column(name = "ingrediente_id")
    private Long ingredienteId;

    public PlatoIngredienteId() {
    }

    public PlatoIngredienteId(Long platoId, Long ingredienteId) {
        this.platoId = platoId;
        this.ingredienteId = ingredienteId;
    }

    public Long getPlatoId() {
        return platoId;
    }

    public void setPlatoId(Long platoId) {
        this.platoId = platoId;
    }

    public Long getIngredienteId() {
        return ingredienteId;
    }

    public void setIngredienteId(Long ingredienteId) {
        this.ingredienteId = ingredienteId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PlatoIngredienteId that)) {
            return false;
        }
        return Objects.equals(platoId, that.platoId) && Objects.equals(ingredienteId, that.ingredienteId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(platoId, ingredienteId);
    }
}
