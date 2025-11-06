package mjyuu.vocaloidshop.exception;

/**
 * Custom exception for invalid credentials (401 Unauthorized)
 */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
    
    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
}
