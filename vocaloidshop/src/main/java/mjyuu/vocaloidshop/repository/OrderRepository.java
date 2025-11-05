package mjyuu.vocaloidshop.repository;

import mjyuu.vocaloidshop.entity.Order;
import mjyuu.vocaloidshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    List<Order> findByUser(User user);
    List<Order> findByUserOrderByOrderedAtDesc(User user);
}
