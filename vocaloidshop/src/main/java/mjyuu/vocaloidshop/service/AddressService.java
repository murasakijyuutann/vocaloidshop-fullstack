package mjyuu.vocaloidshop.service;

import lombok.RequiredArgsConstructor;
import mjyuu.vocaloidshop.dto.AddressRequestDTO;
import mjyuu.vocaloidshop.entity.Address;
import mjyuu.vocaloidshop.entity.User;
import mjyuu.vocaloidshop.repository.AddressRepository;
import mjyuu.vocaloidshop.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional
    public Address createAddress(Long userId, AddressRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If this address is set as default, unset other default addresses
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            List<Address> existingAddresses = addressRepository.findByUserId(userId);
            existingAddresses.forEach(addr -> {
                if (addr.isDefault()) {
                    addr.setDefault(false);
                }
            });
            addressRepository.saveAll(existingAddresses);
        }

        Address address = Address.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .line1(request.getLine1())
                .line2(request.getLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .phone(request.getPhone())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();

        return addressRepository.save(address);
    }

    @Transactional(readOnly = true)
    public List<Address> listUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Address getAddress(Long addressId) {
        return addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
    }

    @Transactional
    public Address updateAddress(Long addressId, AddressRequestDTO request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // If setting as default, unset other default addresses for this user
        if (Boolean.TRUE.equals(request.getIsDefault()) && !address.isDefault()) {
            List<Address> existingAddresses = addressRepository.findByUserId(address.getUser().getId());
            existingAddresses.forEach(addr -> {
                if (!addr.getId().equals(addressId) && addr.isDefault()) {
                    addr.setDefault(false);
                }
            });
            addressRepository.saveAll(existingAddresses);
        }

        address.setRecipientName(request.getRecipientName());
        address.setLine1(request.getLine1());
        address.setLine2(request.getLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setPhone(request.getPhone());
        address.setDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        addressRepository.delete(address);
    }

    @Transactional
    public void setDefaultAddress(Long userId, Long addressId) {
        // Unset all default addresses for this user
        List<Address> addresses = addressRepository.findByUserId(userId);
        addresses.forEach(addr -> {
            if (addr.isDefault()) {
                addr.setDefault(false);
            }
        });
        addressRepository.saveAll(addresses);

        // Set the specified address as default
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Address does not belong to this user");
        }
        
        address.setDefault(true);
        addressRepository.save(address);
    }
}
