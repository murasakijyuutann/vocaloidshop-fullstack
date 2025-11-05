package mjyuu.vocaloidshop.repository;

import mjyuu.vocaloidshop.entity.CartItem;
import mjyuu.vocaloidshop.entity.Product;
import mjyuu.vocaloidshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    void deleteByUserId(Long userId);
    void deleteByUser(User user);
}
