package mjyuu.vocaloidshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import mjyuu.vocaloidshop.entity.User.Role;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoDTO {

    private Long id;
    private String email;
    private String name;
    private String phone;
    private String address;
    private Role role;
    private LocalDateTime createdAt;
}
