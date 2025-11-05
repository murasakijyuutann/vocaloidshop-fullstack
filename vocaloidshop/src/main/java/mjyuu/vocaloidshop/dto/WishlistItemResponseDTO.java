package mjyuu.vocaloidshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistItemResponseDTO {

    private Long id;
    private Long productId;
    private String productName;
    private String productDescription;
    private Integer productPrice;
    private String productImageUrl;
    private LocalDateTime addedAt;
}
