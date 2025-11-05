package mjyuu.vocaloidshop.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequestDTO {

    @NotBlank(message = "Recipient name is required")
    @Size(max = 100)
    private String recipientName;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 255)
    private String line1;

    @Size(max = 255)
    private String line2;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "State/Province is required")
    @Size(max = 100)
    private String state;

    @NotBlank(message = "Postal code is required")
    @Size(max = 20)
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(max = 100)
    private String country;

    @Size(max = 20)
    private String phone;

    private Boolean isDefault;
}
