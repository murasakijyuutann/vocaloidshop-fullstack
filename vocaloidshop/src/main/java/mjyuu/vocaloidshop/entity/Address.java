package mjyuu.vocaloidshop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(nullable = false)
    private String recipientName;
    
    @Column(nullable = false)
    private String line1;
    
    private String line2;
    
    @Column(nullable = false)
    private String city;
    
    private String state;
    
    @Column(nullable = false)
    private String postalCode;
    
    @Column(nullable = false)
    private String country;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(name = "is_default")
    private boolean isDefault;
}
