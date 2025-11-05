package mjyuu.vocaloidshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mjyuu.vocaloidshop.entity.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {

    private Long id;
    private Long userId;
    private Integer totalAmount;
    private OrderStatus status;
    private LocalDateTime orderedAt;
    
    // Shipping address fields
    private String shipRecipientName;
    private String shipLine1;
    private String shipLine2;
    private String shipCity;
    private String shipState;
    private String shipPostalCode;
    private String shipCountry;
    private String shipPhone;
    
    private List<OrderItemResponseDTO> items;
}
