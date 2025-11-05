package mjyuu.vocaloidshop.controller;

import lombok.RequiredArgsConstructor;
import mjyuu.vocaloidshop.dto.WishlistItemResponseDTO;
import mjyuu.vocaloidshop.entity.WishlistItem;
import mjyuu.vocaloidshop.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<WishlistItemResponseDTO> addToWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        WishlistItem item = wishlistService.addToWishlist(userId, productId);
        return ResponseEntity.ok(toResponseDTO(item));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WishlistItemResponseDTO>> getUserWishlist(@PathVariable Long userId) {
        List<WishlistItem> wishlist = wishlistService.getUserWishlist(userId);
        List<WishlistItemResponseDTO> response = wishlist.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> clearWishlist(@PathVariable Long userId) {
        wishlistService.clearWishlist(userId);
        return ResponseEntity.noContent().build();
    }

    private WishlistItemResponseDTO toResponseDTO(WishlistItem item) {
        return WishlistItemResponseDTO.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productDescription(item.getProduct().getDescription())
                .productPrice(item.getProduct().getPrice())
                .productImageUrl(item.getProduct().getImageUrl())
                .addedAt(item.getCreatedAt())
                .build();
    }
}
