package com.restobar.core.repositories;

import com.restobar.core.dto.TopPlatoDTO;
import com.restobar.core.entities.PedidoDetalle;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PedidoDetalleRepository extends JpaRepository<PedidoDetalle, Long> {

    @Query("""
            select new com.restobar.core.dto.TopPlatoDTO(
                d.plato.id,
                d.plato.nombre,
                sum(d.cantidad),
                sum(d.precioUnitario * d.cantidad)
            )
            from PedidoDetalle d
            where d.pedido.estado = com.restobar.core.entities.PedidoEstado.PAGADO
            group by d.plato.id, d.plato.nombre
            order by sum(d.cantidad) desc
            """)
    List<TopPlatoDTO> topPlatosVendidos();
}
