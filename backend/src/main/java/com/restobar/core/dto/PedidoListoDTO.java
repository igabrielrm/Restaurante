package com.restobar.core.dto;

import java.util.List;

public record PedidoListoDTO(Long pedidoId, MesaDTO mesa, List<String> platos) {
}
