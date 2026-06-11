package com.restobar.core.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "ingredientes",
        indexes = {
                @Index(name = "idx_ingredientes_nombre", columnList = "nombre", unique = true),
                @Index(name = "idx_ingredientes_stock_minimo", columnList = "stock_minimo")
        }
)
public class Ingrediente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String nombre;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal stock;

    @Column(name = "stock_minimo", nullable = false, precision = 12, scale = 2)
    private BigDecimal stockMinimo;

    @OneToMany(mappedBy = "ingrediente")
    private List<PlatoIngrediente> recetas = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public BigDecimal getStock() {
        return stock;
    }

    public void setStock(BigDecimal stock) {
        this.stock = stock;
    }

    public BigDecimal getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(BigDecimal stockMinimo) {
        this.stockMinimo = stockMinimo;
    }

    public List<PlatoIngrediente> getRecetas() {
        return recetas;
    }
}
