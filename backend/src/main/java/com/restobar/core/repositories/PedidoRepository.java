package com.restobar.core.repositories;

import com.restobar.core.dto.PedidosPorHoraDTO;
import com.restobar.core.dto.VentasPorPagoDTO;
import com.restobar.core.entities.Pedido;
import com.restobar.core.entities.PedidoEstado;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @EntityGraph(attributePaths = {"mesa", "detalles", "detalles.plato"})
    List<Pedido> findByMesaIdAndEstadoNotOrderByFechaCreacionDesc(Long mesaId, PedidoEstado estado);

    @EntityGraph(attributePaths = {"mesa", "detalles", "detalles.plato"})
    List<Pedido> findByEstadoInOrderByFechaCreacionAsc(List<PedidoEstado> estados);

    @EntityGraph(attributePaths = {"mesa", "detalles", "detalles.plato"})
    List<Pedido> findByEstadoOrderByFechaCreacionDesc(PedidoEstado estado);

    @Query("""
            select new com.restobar.core.dto.VentasPorPagoDTO(p.tipoPago, sum(p.total))
            from Pedido p
            where p.estado = com.restobar.core.entities.PedidoEstado.PAGADO
              and p.fechaCreacion between :desde and :hasta
              and p.tipoPago is not null
            group by p.tipoPago
            order by p.tipoPago
            """)
    List<VentasPorPagoDTO> ventasPorPago(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query("""
            select new com.restobar.core.dto.PedidosPorHoraDTO(hour(p.fechaCreacion), count(p))
            from Pedido p
            where p.fechaCreacion between :desde and :hasta
            group by hour(p.fechaCreacion)
            order by hour(p.fechaCreacion)
            """)
    List<PedidosPorHoraDTO> pedidosPorHora(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}
