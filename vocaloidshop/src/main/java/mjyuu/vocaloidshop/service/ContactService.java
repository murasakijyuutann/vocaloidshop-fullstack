package mjyuu.vocaloidshop.service;

import lombok.RequiredArgsConstructor;
import mjyuu.vocaloidshop.dto.ContactRequestDTO;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final JavaMailSender mailSender;

    public void sendContactEmail(ContactRequestDTO request) {
        try {
            // Send email to admin/support
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(request.getEmail());
            message.setTo("support@vocalocart.com"); // Change to your support email
            message.setSubject("Contact Form: " + request.getSubject());
            message.setText(String.format(
                    "Name: %s\nEmail: %s\n\nMessage:\n%s",
                    request.getName(),
                    request.getEmail(),
                    request.getMessage()
            ));

            mailSender.send(message);

            // Send confirmation email to user
            SimpleMailMessage confirmation = new SimpleMailMessage();
            confirmation.setTo(request.getEmail());
            confirmation.setSubject("We received your message - VocaloCart");
            confirmation.setText(String.format(
                    "Dear %s,\n\nThank you for contacting us. We have received your message and will get back to you soon.\n\nBest regards,\nVocaloCart Team",
                    request.getName()
            ));

            mailSender.send(confirmation);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    public void validateContactRequest(ContactRequestDTO request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
            throw new RuntimeException("Subject is required");
        }
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new RuntimeException("Message is required");
        }
    }
}
