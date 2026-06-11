package com.restobar.core.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "pedidos",
        indexes = {
                @Index(name = "idx_pedidos_mesa_estado", columnList = "mesa_id,estado"),
                @Index(name = "idx_pedidos_estado", columnList = "estado"),
                @Index(name = "idx_pedidos_fecha_creacion", columnList = "fecha_creacion"),
                @Index(name = "idx_pedidos_tipo_pago", columnList = "tipo_pago")
        }
)
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mesa_id", nullable = false)
    private Mesa mesa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PedidoEstado estado = PedidoEstado.PENDIENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pago", length = 30)
    private TipoPago tipoPago;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoDetalle> detalles = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }

    public void addDetalle(PedidoDetalle detalle) {
        detalles.add(detalle);
        detalle.setPedido(this);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Mesa getMesa() {
        return mesa;
    }

    public void setMesa(Mesa mesa) {
        this.mesa = mesa;
    }

    public PedidoEstado getEstado() {
        return estado;
    }

    public void setEstado(PedidoEstado estado) {
        this.estado = estado;
    }

    public TipoPago getTipoPago() {
        return tipoPago;
    }

    public void setTipoPago(TipoPago tipoPago) {
        this.tipoPago = tipoPago;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public List<PedidoDetalle> getDetalles() {
        return detalles;
    }
}
