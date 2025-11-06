package mjyuu.vocaloidshop.service;

import mjyuu.vocaloidshop.dto.AddToCartRequestDTO;
import mjyuu.vocaloidshop.entity.CartItem;
import mjyuu.vocaloidshop.entity.Category;
import mjyuu.vocaloidshop.entity.Product;
import mjyuu.vocaloidshop.entity.User;
import mjyuu.vocaloidshop.repository.CartItemRepository;
import mjyuu.vocaloidshop.repository.ProductRepository;
import mjyuu.vocaloidshop.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CartService Tests")
class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    private User mockUser;
    private Product mockProduct;
    private CartItem mockCartItem;
    private AddToCartRequestDTO validRequest;
    private Category mockCategory;

    @BeforeEach
    void setUp() {
        // Setup mock category
        mockCategory = Category.builder()
                .id(1L)
                .name("Vocaloid")
                .build();

        // Setup mock user
        mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .build();

        // Setup mock product
        mockProduct = Product.builder()
                .id(1L)
                .name("Hatsune Miku V4X")
                .price(15000)
                .stockQuantity(10)
                .category(mockCategory)
                .build();

        // Setup mock cart item
        mockCartItem = CartItem.builder()
                .id(1L)
                .user(mockUser)
                .product(mockProduct)
                .quantity(2)
                .price(15000)
                .build();

        // Setup valid request
        validRequest = AddToCartRequestDTO.builder()
                .productId(1L)
                .quantity(2)
                .build();
    }

    @Test
    @DisplayName("Should successfully add new product to cart")
    void testAddToCartNewItem() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(cartItemRepository.findByUserAndProduct(mockUser, mockProduct)).thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(mockCartItem);

        // When
        CartItem result = cartService.addToCart(1L, validRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getProduct().getName()).isEqualTo("Hatsune Miku V4X");
        assertThat(result.getQuantity()).isEqualTo(2);

        verify(userRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).findById(1L);
        verify(cartItemRepository, times(1)).findByUserAndProduct(mockUser, mockProduct);
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    @DisplayName("Should update quantity when product already in cart")
    void testAddToCartExistingItem() {
        // Given
        CartItem existingItem = CartItem.builder()
                .id(1L)
                .user(mockUser)
                .product(mockProduct)
                .quantity(3)
                .price(15000)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(cartItemRepository.findByUserAndProduct(mockUser, mockProduct)).thenReturn(Optional.of(existingItem));
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(existingItem);

        // When
        CartItem result = cartService.addToCart(1L, validRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getQuantity()).isEqualTo(5); // 3 + 2

        verify(cartItemRepository, times(1)).findByUserAndProduct(mockUser, mockProduct);
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void testAddToCartUserNotFound() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> cartService.addToCart(999L, validRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");

        verify(userRepository, times(1)).findById(999L);
        verify(productRepository, never()).findById(any());
    }

    @Test
    @DisplayName("Should throw exception when product not found")
    void testAddToCartProductNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        validRequest.setProductId(999L);

        // When & Then
        assertThatThrownBy(() -> cartService.addToCart(1L, validRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Product not found");

        verify(userRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("Should get all items in user cart")
    void testGetUserCart() {
        // Given
        CartItem item2 = CartItem.builder()
                .id(2L)
                .user(mockUser)
                .product(mockProduct)
                .quantity(1)
                .price(15000)
                .build();

        List<CartItem> mockCartItems = Arrays.asList(mockCartItem, item2);

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findByUser(mockUser)).thenReturn(mockCartItems);

        // When
        List<CartItem> result = cartService.getUserCart(1L);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(mockCartItem, item2);

        verify(userRepository, times(1)).findById(1L);
        verify(cartItemRepository, times(1)).findByUser(mockUser);
    }

    @Test
    @DisplayName("Should throw exception when getting cart for non-existent user")
    void testGetUserCartUserNotFound() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> cartService.getUserCart(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");

        verify(userRepository, times(1)).findById(999L);
        verify(cartItemRepository, never()).findByUser(any());
    }

    @Test
    @DisplayName("Should update cart item quantity")
    void testUpdateCartItemQuantity() {
        // Given
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(mockCartItem));
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(mockCartItem);

        // When
        cartService.updateCartItemQuantity(1L, 5);

        // Then
        verify(cartItemRepository, times(1)).findById(1L);
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
        verify(cartItemRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should delete cart item when quantity set to zero")
    void testUpdateCartItemQuantityToZero() {
        // Given
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(mockCartItem));
        doNothing().when(cartItemRepository).delete(mockCartItem);

        // When
        cartService.updateCartItemQuantity(1L, 0);

        // Then
        verify(cartItemRepository, times(1)).findById(1L);
        verify(cartItemRepository, times(1)).delete(mockCartItem);
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent cart item")
    void testUpdateCartItemQuantityNotFound() {
        // Given
        when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> cartService.updateCartItemQuantity(999L, 5))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Cart item not found");

        verify(cartItemRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("Should successfully remove item from cart")
    void testRemoveFromCart() {
        // Given
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(mockCartItem));
        doNothing().when(cartItemRepository).delete(mockCartItem);

        // When
        cartService.removeFromCart(1L);

        // Then
        verify(cartItemRepository, times(1)).findById(1L);
        verify(cartItemRepository, times(1)).delete(mockCartItem);
    }

    @Test
    @DisplayName("Should throw exception when removing non-existent cart item")
    void testRemoveFromCartNotFound() {
        // Given
        when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> cartService.removeFromCart(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Cart item not found");

        verify(cartItemRepository, times(1)).findById(999L);
        verify(cartItemRepository, never()).delete(any());
    }
}
