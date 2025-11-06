package mjyuu.vocaloidshop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import mjyuu.vocaloidshop.dto.AuthRequestDTO;
import mjyuu.vocaloidshop.entity.User;
import mjyuu.vocaloidshop.repository.UserRepository;
import mjyuu.vocaloidshop.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtUtil jwtUtil;

    private AuthRequestDTO validRegisterRequest;
    private AuthRequestDTO validLoginRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        // Setup valid register request
        validRegisterRequest = AuthRequestDTO.builder()
                .email("test@example.com")
                .password("password123")
                .name("Test User")
                .phone("010-1234-5678")
                .address("123 Test St")
                .build();

        // Setup valid login request
        validLoginRequest = AuthRequestDTO.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        // Setup mock user
        mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("$2a$10$encodedPassword")
                .name("Test User")
                .phone("010-1234-5678")
                .address("123 Test St")
                .role(User.Role.USER)
                .build();
    }

    @Test
    @DisplayName("Should successfully register new user")
    void testRegisterSuccess() throws Exception {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtUtil.generateToken(anyLong(), anyString())).thenReturn("mock.jwt.token");

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.role").value("USER"));

        // Verify
        verify(userRepository, times(1)).existsByEmail("test@example.com");
        verify(userRepository, times(1)).save(any(User.class));
        verify(jwtUtil, times(1)).generateToken(anyLong(), anyString());
    }

    @Test
    @DisplayName("Should fail registration when email already exists")
    void testRegisterDuplicateEmail() throws Exception {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isBadRequest());

        // Verify
        verify(userRepository, times(1)).existsByEmail("test@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login with valid credentials")
    void testLoginSuccess() throws Exception {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyLong(), anyString())).thenReturn("mock.jwt.token");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.name").value("Test User"));

        // Verify
        verify(userRepository, times(1)).findByEmail("test@example.com");
        verify(passwordEncoder, times(1)).matches("password123", "$2a$10$encodedPassword");
        verify(jwtUtil, times(1)).generateToken(1L, "test@example.com");
    }

    @Test
    @DisplayName("Should fail login with invalid email")
    void testLoginInvalidEmail() throws Exception {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isBadRequest());

        // Verify
        verify(userRepository, times(1)).findByEmail("test@example.com");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    @DisplayName("Should fail login with wrong password")
    void testLoginWrongPassword() throws Exception {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isBadRequest());

        // Verify
        verify(userRepository, times(1)).findByEmail("test@example.com");
        verify(passwordEncoder, times(1)).matches(anyString(), anyString());
        verify(jwtUtil, never()).generateToken(anyLong(), anyString());
    }

    @Test
    @DisplayName("Should fail registration with invalid email format")
    void testRegisterInvalidEmail() throws Exception {
        // Given
        validRegisterRequest.setEmail("invalid-email");

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isBadRequest());
    }
}
