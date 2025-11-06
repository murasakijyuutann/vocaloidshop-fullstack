package mjyuu.vocaloidshop.service;

import lombok.RequiredArgsConstructor;
import mjyuu.vocaloidshop.dto.AddToCartRequestDTO;
import mjyuu.vocaloidshop.entity.CartItem;
import mjyuu.vocaloidshop.entity.Product;
import mjyuu.vocaloidshop.entity.User;
import mjyuu.vocaloidshop.exception.ResourceNotFoundException;
import mjyuu.vocaloidshop.repository.CartItemRepository;
import mjyuu.vocaloidshop.repository.ProductRepository;
import mjyuu.vocaloidshop.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartItem addToCart(Long userId, AddToCartRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        // Check if product already in cart
        Optional<CartItem> existingItem = cartItemRepository.findByUserAndProduct(user, product);

        if (existingItem.isPresent()) {
            // Update quantity if already exists
            CartItem cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            return cartItemRepository.save(cartItem);
        } else {
            // Create new cart item
            CartItem newItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .price(product.getPrice())
                    .build();
            return cartItemRepository.save(newItem);
        }
    }

    @Transactional(readOnly = true)
    public List<CartItem> getUserCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return cartItemRepository.findByUser(user);
    }

    @Transactional
    public void updateCartItemQuantity(Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", cartItemId));
        
        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional
    public void removeFromCart(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", cartItemId));
        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        cartItemRepository.deleteByUser(user);
    }

    @Transactional(readOnly = true)
    public Integer getCartTotal(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<CartItem> items = cartItemRepository.findByUser(user);
        return items.stream()
                .mapToInt(item -> item.getPrice() * item.getQuantity())
                .sum();
    }
}
