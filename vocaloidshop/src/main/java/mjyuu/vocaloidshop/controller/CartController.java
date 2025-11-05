package mjyuu.vocaloidshop.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mjyuu.vocaloidshop.dto.AddToCartRequestDTO;
import mjyuu.vocaloidshop.dto.CartItemResponseDTO;
import mjyuu.vocaloidshop.entity.CartItem;
import mjyuu.vocaloidshop.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin
public class CartController {
    
    private final CartService cartService;
    
    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItemResponseDTO>> getCart(@PathVariable Long userId) {
        List<CartItem> cartItems = cartService.getUserCart(userId);
        List<CartItemResponseDTO> response = cartItems.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{userId}")
    public ResponseEntity<CartItemResponseDTO> addToCart(@PathVariable Long userId, @Valid @RequestBody AddToCartRequestDTO request) {
        try {
            CartItem cartItem = cartService.addToCart(userId, request);
            return ResponseEntity.ok(toResponseDTO(cartItem));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{userId}/{itemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long userId, @PathVariable Long itemId) {
        try {
            cartService.removeFromCart(itemId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    private CartItemResponseDTO toResponseDTO(CartItem cartItem) {
        Integer subtotal = cartItem.getPrice() * cartItem.getQuantity();
        return CartItemResponseDTO.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProduct().getId())
                .productName(cartItem.getProduct().getName())
                .productImage(cartItem.getProduct().getImageUrl())
                .price(cartItem.getPrice())
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
