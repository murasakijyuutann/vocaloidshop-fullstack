package mjyuu.vocaloidshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponseDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private Integer price;
    private Integer quantity;
    private Integer subtotal;
}
