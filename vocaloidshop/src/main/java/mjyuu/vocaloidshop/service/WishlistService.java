package mjyuu.vocaloidshop.service;

import lombok.RequiredArgsConstructor;
import mjyuu.vocaloidshop.entity.Product;
import mjyuu.vocaloidshop.entity.User;
import mjyuu.vocaloidshop.entity.WishlistItem;
import mjyuu.vocaloidshop.repository.ProductRepository;
import mjyuu.vocaloidshop.repository.UserRepository;
import mjyuu.vocaloidshop.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public WishlistItem addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if already in wishlist
        Optional<WishlistItem> existing = wishlistItemRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            throw new RuntimeException("Product already in wishlist");
        }

        WishlistItem wishlistItem = WishlistItem.builder()
                .user(user)
                .product(product)
                .createdAt(LocalDateTime.now())
                .build();

        return wishlistItemRepository.save(wishlistItem);
    }

    @Transactional(readOnly = true)
    public List<WishlistItem> getUserWishlist(Long userId) {
        return wishlistItemRepository.findByUserId(userId);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        WishlistItem wishlistItem = wishlistItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));
        
        wishlistItemRepository.delete(wishlistItem);
    }

    @Transactional
    public void clearWishlist(Long userId) {
        wishlistItemRepository.deleteByUserId(userId);
    }
}
