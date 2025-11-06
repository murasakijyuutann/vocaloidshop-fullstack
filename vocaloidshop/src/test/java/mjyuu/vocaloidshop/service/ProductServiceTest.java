package mjyuu.vocaloidshop.service;

import mjyuu.vocaloidshop.dto.ProductRequestDTO;
import mjyuu.vocaloidshop.entity.Category;
import mjyuu.vocaloidshop.entity.Product;
import mjyuu.vocaloidshop.repository.CategoryRepository;
import mjyuu.vocaloidshop.repository.ProductRepository;
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
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductService Tests")
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Category mockCategory;
    private Product mockProduct;
    private ProductRequestDTO validRequest;

    @BeforeEach
    void setUp() {
        // Setup mock category
        mockCategory = Category.builder()
                .id(1L)
                .name("Vocaloid")
                .description("Vocaloid software and merchandise")
                .build();

        // Setup mock product
        mockProduct = Product.builder()
                .id(1L)
                .name("Hatsune Miku V4X")
                .description("Vocaloid software")
                .price(15000)
                .stockQuantity(10)
                .imageUrl("https://example.com/miku.jpg")
                .category(mockCategory)
                .build();

        // Setup valid request
        validRequest = ProductRequestDTO.builder()
                .name("Hatsune Miku V4X")
                .description("Vocaloid software")
                .price(15000)
                .stockQuantity(10)
                .imageUrl("https://example.com/miku.jpg")
                .categoryId(1L)
                .build();
    }

    @Test
    @DisplayName("Should successfully create product")
    void testCreateProduct() {
        // Given
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(productRepository.save(any(Product.class))).thenReturn(mockProduct);

        // When
        Product result = productService.createProduct(validRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Hatsune Miku V4X");
        assertThat(result.getPrice()).isEqualTo(15000);
        assertThat(result.getCategory().getName()).isEqualTo("Vocaloid");

        verify(categoryRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw exception when category not found during product creation")
    void testCreateProductCategoryNotFound() {
        // Given
        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.createProduct(validRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Category not found");

        verify(categoryRepository, times(1)).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Should get all products")
    void testGetAllProducts() {
        // Given
        Product product2 = Product.builder()
                .id(2L)
                .name("Kagamine Rin/Len")
                .price(15000)
                .stockQuantity(5)
                .category(mockCategory)
                .build();

        List<Product> mockProducts = Arrays.asList(mockProduct, product2);
        when(productRepository.findAll()).thenReturn(mockProducts);

        // When
        List<Product> result = productService.getAllProducts();

        // Then
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(mockProduct, product2);
        verify(productRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should get product by ID")
    void testGetProduct() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));

        // When
        Product result = productService.getProduct(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Hatsune Miku V4X");
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when product not found by ID")
    void testGetProductNotFound() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.getProduct(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Product not found");

        verify(productRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("Should successfully update product")
    void testUpdateProduct() {
        // Given
        ProductRequestDTO updateRequest = ProductRequestDTO.builder()
                .name("Hatsune Miku V5")
                .description("Updated version")
                .price(20000)
                .stockQuantity(15)
                .imageUrl("https://example.com/miku-v5.jpg")
                .categoryId(1L)
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(productRepository.save(any(Product.class))).thenReturn(mockProduct);

        // When
        Product result = productService.updateProduct(1L, updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(productRepository, times(1)).findById(1L);
        verify(categoryRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent product")
    void testUpdateProductNotFound() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.updateProduct(999L, validRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Product not found");

        verify(productRepository, times(1)).findById(999L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    @DisplayName("Should successfully delete product")
    void testDeleteProduct() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        doNothing().when(productRepository).delete(mockProduct);

        // When
        productService.deleteProduct(1L);

        // Then
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).delete(mockProduct);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent product")
    void testDeleteProductNotFound() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> productService.deleteProduct(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Product not found");

        verify(productRepository, times(1)).findById(999L);
        verify(productRepository, never()).delete(any(Product.class));
    }

    @Test
    @DisplayName("Should get products by category")
    void testGetProductsByCategory() {
        // Given
        List<Product> mockProducts = Arrays.asList(mockProduct);
        when(productRepository.findByCategoryId(1L)).thenReturn(mockProducts);

        // When
        List<Product> result = productService.getProductsByCategory(1L);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCategory().getId()).isEqualTo(1L);
        verify(productRepository, times(1)).findByCategoryId(1L);
    }

    @Test
    @DisplayName("Should search products by name")
    void testSearchProducts() {
        // Given
        List<Product> mockProducts = Arrays.asList(mockProduct);
        when(productRepository.findByNameContaining("Miku")).thenReturn(mockProducts);

        // When
        List<Product> result = productService.searchProducts("Miku");

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).contains("Miku");
        verify(productRepository, times(1)).findByNameContaining("Miku");
    }
}
