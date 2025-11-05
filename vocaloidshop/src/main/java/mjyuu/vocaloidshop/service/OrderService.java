package mjyuu.vocaloidshop.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import mjyuu.vocaloidshop.entity.*;
import mjyuu.vocaloidshop.repository.AddressRepository;
import mjyuu.vocaloidshop.repository.CartItemRepository;
import mjyuu.vocaloidshop.repository.OrderRepository;
import mjyuu.vocaloidshop.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;

    @Transactional
    public Order placeOrder(Long userId, Long addressId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        List<OrderItem> orderItems = new ArrayList<>();
        int totalAmount = 0;
        
        for (CartItem cart : cartItems) {
            Product product = cart.getProduct();
            if (product.getStockQuantity() < cart.getQuantity()) {
                throw new RuntimeException("Insufficient stock: " + product.getName());
            }
            
            product.setStockQuantity(product.getStockQuantity() - cart.getQuantity());
            
            OrderItem item = OrderItem.builder()
                    .product(product)
                    .price(product.getPrice())
                    .quantity(cart.getQuantity())
                    .build();
            
            orderItems.add(item);
            totalAmount += item.getPrice() * item.getQuantity();
        }
        
        Order.OrderBuilder orderBuilder = Order.builder()
                .user(user)
                .orderedAt(LocalDateTime.now())
                .totalAmount(totalAmount)
                .items(orderItems)
                .status(OrderStatus.PAYMENT_RECEIVED);
        
        if (addressId != null) {
            Address address = addressRepository.findById(addressId)
                    .orElseThrow(() -> new RuntimeException("Address not found"));
            
            if (!address.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized access to address");
            }
            
            orderBuilder
                    .shipRecipientName(address.getRecipientName())
                    .shipLine1(address.getLine1())
                    .shipLine2(address.getLine2())
                    .shipCity(address.getCity())
                    .shipState(address.getState())
                    .shipPostalCode(address.getPostalCode())
                    .shipCountry(address.getCountry())
                    .shipPhone(address.getPhone());
        }
        
        Order order = orderBuilder.build();
        orderItems.forEach(item -> item.setOrder(order));
        
        orderRepository.save(order);
        cartItemRepository.deleteAll(cartItems);
        
        return order;
    }

    public List<Order> listUserOrders(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUserOrderByOrderedAtDesc(user);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus nextStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (nextStatus == OrderStatus.CANCELED) {
            order.setStatus(OrderStatus.CANCELED);
            return order;
        }
        
        OrderStatus currentStatus = order.getStatus();
        if (currentStatus == null) {
            order.setStatus(OrderStatus.PAYMENT_RECEIVED);
            currentStatus = OrderStatus.PAYMENT_RECEIVED;
        }
        
        int currentIndex = indexOf(currentStatus);
        int nextIndex = indexOf(nextStatus);
        
        if (nextIndex < currentIndex && nextStatus != OrderStatus.CANCELED) {
            throw new RuntimeException("Cannot revert order status to previous stage");
        }
        
        order.setStatus(nextStatus);
        return order;
    }

    private int indexOf(OrderStatus status) {
        return switch (status) {
            case PAYMENT_RECEIVED -> 0;
            case PROCESSING -> 1;
            case PREPARING -> 2;
            case READY_FOR_DELIVERY -> 3;
            case IN_DELIVERY -> 4;
            case DELIVERED -> 5;
            case CANCELED -> 6;
        };
    }

    public List<Order> listAllOrders() {
        return orderRepository.findAll();
    }
}
