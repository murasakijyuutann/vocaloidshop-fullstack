package mjyuu.vocaloidshop.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mjyuu.vocaloidshop.dto.AuthRequestDTO;
import mjyuu.vocaloidshop.dto.AuthResponseDTO;
import mjyuu.vocaloidshop.entity.User;
import mjyuu.vocaloidshop.repository.UserRepository;
import mjyuu.vocaloidshop.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody AuthRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(User.Role.USER)
                .build();
        
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        
        AuthResponseDTO response = AuthResponseDTO.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);
        
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().build();
        }
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        
        AuthResponseDTO response = AuthResponseDTO.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
        
        return ResponseEntity.ok(response);
    }
}
