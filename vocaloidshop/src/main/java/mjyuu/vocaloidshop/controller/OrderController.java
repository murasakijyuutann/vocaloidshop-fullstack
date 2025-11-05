package mjyuu.vocaloidshop.controller;

import lombok.RequiredArgsConstructor;
import mjyuu.vocaloidshop.entity.Order;
import mjyuu.vocaloidshop.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin
public class OrderController {
    
    private final OrderService orderService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.listUserOrders(userId);
        return ResponseEntity.ok(orders);
    }
    
    @PostMapping("/user/{userId}")
    public ResponseEntity<Order> placeOrder(@PathVariable Long userId, @RequestParam(required = false) Long addressId) {
        Order order = orderService.placeOrder(userId, addressId);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.listAllOrders().stream()
                .filter(o -> o.getId().equals(id))
                .findFirst()
                .orElse(null);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(order);
    }
}
