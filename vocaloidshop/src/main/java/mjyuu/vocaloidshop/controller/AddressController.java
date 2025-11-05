package mjyuu.vocaloidshop.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mjyuu.vocaloidshop.dto.AddressRequestDTO;
import mjyuu.vocaloidshop.dto.AddressResponseDTO;
import mjyuu.vocaloidshop.entity.Address;
import mjyuu.vocaloidshop.service.AddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<AddressResponseDTO> createAddress(
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequestDTO request) {
        Address address = addressService.createAddress(userId, request);
        return ResponseEntity.ok(toResponseDTO(address));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AddressResponseDTO>> listUserAddresses(@PathVariable Long userId) {
        List<Address> addresses = addressService.listUserAddresses(userId);
        List<AddressResponseDTO> response = addresses.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressResponseDTO> getAddress(@PathVariable Long id) {
        Address address = addressService.getAddress(id);
        return ResponseEntity.ok(toResponseDTO(address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponseDTO> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequestDTO request) {
        Address address = addressService.updateAddress(id, request);
        return ResponseEntity.ok(toResponseDTO(address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/default/user/{userId}")
    public ResponseEntity<Void> setDefaultAddress(
            @PathVariable Long userId,
            @PathVariable Long id) {
        addressService.setDefaultAddress(userId, id);
        return ResponseEntity.ok().build();
    }

    private AddressResponseDTO toResponseDTO(Address address) {
        return AddressResponseDTO.builder()
                .id(address.getId())
                .recipientName(address.getRecipientName())
                .line1(address.getLine1())
                .line2(address.getLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .phone(address.getPhone())
                .isDefault(address.isDefault())
                .build();
    }
}
