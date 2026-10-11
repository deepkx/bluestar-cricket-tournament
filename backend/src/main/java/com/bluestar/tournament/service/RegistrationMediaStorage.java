package com.bluestar.tournament.service;

import com.bluestar.tournament.config.AppProperties;
import com.bluestar.tournament.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;
@Service
public class RegistrationMediaStorage {

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_BYTES = 3 * 1024 * 1024;

    private final AppProperties appProperties;

    public RegistrationMediaStorage(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public String storeTeamLogo(String publicReference, MultipartFile file) {
        return store(publicReference, "team-logo", file);
    }

    public String storeTeamLogoIfPresent(String publicReference, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        return storeTeamLogo(publicReference, file);
    }

    public String storePlayerPhotoIfPresent(String publicReference, int index, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        return storePlayerPhoto(publicReference, index, file);
    }

    public String storePlayerPhoto(String publicReference, int index, MultipartFile file) {
        return store(publicReference, "player-" + String.format("%02d", index + 1), file);
    }

    private String store(String publicReference, String baseName, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PHOTO_REQUIRED", "Image file is required: " + baseName);
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_TOO_LARGE", "Image must be under 3 MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_IMAGE", "Use JPEG, PNG, or WebP images");
        }
        String ext = extensionFor(contentType);
        Path dir = Path.of(appProperties.uploadDir(), "registrations", publicReference).toAbsolutePath().normalize();
        try {
            Files.createDirectories(dir);
            String filename = baseName + ext;
            Path target = dir.resolve(filename).normalize();
            if (!target.startsWith(dir)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PATH", "Invalid file path");
            }
            file.transferTo(target);
            return "/uploads/registrations/" + publicReference + "/" + filename;
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "UPLOAD_FAILED", "Could not save image");
        }
    }

    private static String extensionFor(String contentType) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
