package com.bluestar.tournament.service;

import com.bluestar.tournament.domain.RegistrationStatus;
import com.bluestar.tournament.dto.AdminRegistrationDetailDto;
import com.bluestar.tournament.dto.AdminRegistrationSummaryDto;
import com.bluestar.tournament.dto.AdminRegistrationUpdateRequest;
import com.bluestar.tournament.dto.AdminTeamCreateRequest;
import com.bluestar.tournament.entity.Player;
import com.bluestar.tournament.entity.Registration;
import com.bluestar.tournament.entity.TeamContact;
import com.bluestar.tournament.entity.Tournament;
import com.bluestar.tournament.config.AppProperties;
import com.bluestar.tournament.exception.ApiException;
import com.bluestar.tournament.repository.RegistrationRepository;
import com.bluestar.tournament.util.ReferenceGenerator;
import com.bluestar.tournament.util.TeamNameNormalizer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminRegistrationService {

    private final RegistrationRepository registrationRepository;
    private final TournamentService tournamentService;
    private final RegistrationMediaStorage mediaStorage;
    private final AppProperties appProperties;

    public AdminRegistrationService(
            RegistrationRepository registrationRepository,
            TournamentService tournamentService,
            RegistrationMediaStorage mediaStorage,
            AppProperties appProperties) {
        this.registrationRepository = registrationRepository;
        this.tournamentService = tournamentService;
        this.mediaStorage = mediaStorage;
        this.appProperties = appProperties;
    }

    @Transactional(readOnly = true)
    public Page<AdminRegistrationSummaryDto> list(String q, Pageable pageable) {
        Long tid = tournamentService.requireCurrent().getId();
        return registrationRepository.searchAdmin(tid, q, pageable)
                .map(r -> new AdminRegistrationSummaryDto(
                        r.getId(),
                        r.getPublicReference(),
                        r.getTeamName(),
                        r.getStatus(),
                        r.getCreatedAt(),
                        r.getConfirmedAt()
                ));
    }

    @Transactional(readOnly = true)
    public AdminRegistrationDetailDto detail(Long id) {
        Registration r = registrationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Registration not found"));
        return AdminRegistrationDetailDto.from(r);
    }

    @Transactional
    public AdminRegistrationDetailDto update(Long id, AdminRegistrationUpdateRequest request) {
        Registration r = registrationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Registration not found"));
        applyUpdate(r, request, null, null);
        registrationRepository.save(r);
        return AdminRegistrationDetailDto.from(r);
    }

    @Transactional
    public AdminRegistrationDetailDto updateWithMedia(
            Long id,
            AdminRegistrationUpdateRequest request,
            MultipartFile teamLogo,
            List<MultipartFile> playerPhotos) {
        Registration r = registrationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Registration not found"));
        applyUpdate(r, request, teamLogo, playerPhotos);
        registrationRepository.save(r);
        return AdminRegistrationDetailDto.from(r);
    }

    @Transactional
    public AdminRegistrationDetailDto createTeam(AdminTeamCreateRequest request) {
        return createTeamInternal(request, null, null);
    }

    @Transactional
    public AdminRegistrationDetailDto createTeamWithMedia(
            AdminTeamCreateRequest request,
            MultipartFile teamLogo,
            MultipartFile captainPhoto) {
        return createTeamInternal(request, teamLogo, captainPhoto);
    }

    @Transactional
    public boolean removeFromBoard(Long id) {
        Registration r = registrationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Registration not found"));
        if (r.getStatus() == RegistrationStatus.CANCELLED) {
            return false;
        }
        if (r.getStatus() != RegistrationStatus.CONFIRMED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NOT_ON_BOARD", "Team is not on the board");
        }
        r.setNormalizedTeamName(cancelledNormalizedName(r));
        r.setStatus(RegistrationStatus.CANCELLED);
        registrationRepository.save(r);
        return true;
    }

    @Transactional
    public AdminRegistrationDetailDto updateStatus(Long id, RegistrationStatus status) {
        Registration r = registrationRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Registration not found"));
        if (status == RegistrationStatus.CANCELLED) {
            r.setNormalizedTeamName(cancelledNormalizedName(r));
        }
        r.setStatus(status);
        registrationRepository.save(r);
        return AdminRegistrationDetailDto.from(r);
    }

    @Transactional(readOnly = true)
    public String exportCsv() {
        Long tid = tournamentService.requireCurrent().getId();
        var rows = registrationRepository.findByTournamentId(tid, Pageable.unpaged()).getContent();
        String header = "reference,team,captain,email,phone,status,confirmed_at\n";
        String body = rows.stream().map(r -> String.join(",",
                csv(r.getPublicReference()),
                csv(r.getTeamName()),
                csv(r.getContact().getCaptainName()),
                csv(r.getContact().getEmail()),
                csv(r.getContact().getPhone()),
                csv(r.getStatus().name()),
                csv(r.getConfirmedAt() != null ? r.getConfirmedAt().toString() : "")
        )).collect(Collectors.joining("\n"));
        return header + body;
    }

    private AdminRegistrationDetailDto createTeamInternal(
            AdminTeamCreateRequest request,
            MultipartFile teamLogo,
            MultipartFile captainPhoto) {
        Tournament tournament = tournamentService.requireCurrent();
        String trimmed = request.teamName().trim();
        String normalized = TeamNameNormalizer.normalize(trimmed);
        if (registrationRepository.existsByTournamentIdAndNormalizedTeamName(tournament.getId(), normalized)) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_TEAM", "A team with this name already exists");
        }
        Instant now = Instant.now();
        long occupied = registrationRepository.countOccupiedSlots(tournament.getId(), now);
        if (occupied >= tournament.getMaxTeams()) {
            throw new ApiException(HttpStatus.CONFLICT, "CAPACITY_FULL", "All team slots are filled");
        }

        Registration reg = new Registration();
        reg.setPublicReference(ReferenceGenerator.publicReference());
        reg.setTrackingToken(ReferenceGenerator.trackingToken());
        reg.setTournament(tournament);
        reg.setTeamName(trimmed);
        reg.setNormalizedTeamName(normalized);
        reg.setStatus(RegistrationStatus.CONFIRMED);
        reg.setConfirmedAt(now);
        reg.setSlotReservationExpiresAt(null);

        TeamContact contact = new TeamContact();
        contact.setRegistration(reg);
        contact.setCaptainName(request.captainName().trim());
        contact.setPhone(null);
        contact.setEmail(null);
        reg.setContact(contact);

        Player captain = new Player();
        captain.setRegistration(reg);
        captain.setFullName(request.captainName().trim());
        captain.setCaptain(true);
        reg.getPlayers().add(captain);

        registrationRepository.save(reg);

        String logoPath = mediaStorage.storeTeamLogoIfPresent(reg.getPublicReference(), teamLogo);
        if (logoPath != null) {
            reg.setTeamLogoPath(logoPath);
        }
        String captainPhotoPath = mediaStorage.storePlayerPhotoIfPresent(reg.getPublicReference(), 0, captainPhoto);
        if (captainPhotoPath != null) {
            captain.setPhotoPath(captainPhotoPath);
        }
        registrationRepository.save(reg);
        return AdminRegistrationDetailDto.from(reg);
    }

    private void applyUpdate(
            Registration r,
            AdminRegistrationUpdateRequest request,
            MultipartFile teamLogo,
            List<MultipartFile> playerPhotos) {
        if (request.teamName() != null && !request.teamName().isBlank()) {
            String trimmed = request.teamName().trim();
            String normalized = TeamNameNormalizer.normalize(trimmed);
            Long tid = r.getTournament().getId();
            if (registrationRepository.existsByTournamentIdAndNormalizedTeamName(tid, normalized)
                    && !normalized.equals(r.getNormalizedTeamName())) {
                throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_TEAM", "A team with this name already exists");
            }
            r.setTeamName(trimmed);
            r.setNormalizedTeamName(normalized);
        }
        if (request.city() != null) {
            r.setCity(blankToNull(request.city()));
        }
        if (request.captainName() != null && !request.captainName().isBlank()) {
            r.getContact().setCaptainName(request.captainName().trim());
        }

        if (request.removePlayerIds() != null && !request.removePlayerIds().isEmpty()) {
            Set<Long> remove = new HashSet<>(request.removePlayerIds());
            r.getPlayers().removeIf(p -> p.getId() != null && remove.contains(p.getId()));
        }

        if (request.newPlayers() != null) {
            for (AdminRegistrationUpdateRequest.NewPlayer np : request.newPlayers()) {
                if (np.fullName() == null || np.fullName().isBlank()) {
                    continue;
                }
                Player player = new Player();
                player.setRegistration(r);
                player.setFullName(np.fullName().trim());
                player.setJerseyNumber(np.jerseyNumber());
                player.setPlayingRole(blankToNull(np.playingRole()));
                player.setCaptain(Boolean.TRUE.equals(np.captain()));
                applyPlayerPhoto(r, player, np.photoUploadIndex(), playerPhotos, r.getPlayers().size());
                r.getPlayers().add(player);
            }
        }

        if (request.players() != null) {
            for (AdminRegistrationUpdateRequest.PlayerUpdate pu : request.players()) {
                if (pu.id() == null || pu.fullName() == null || pu.fullName().isBlank()) {
                    continue;
                }
                Player player = r.getPlayers().stream()
                        .filter(p -> p.getId().equals(pu.id()))
                        .findFirst()
                        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PLAYER", "Player not found"));
                player.setFullName(pu.fullName().trim());
                if (pu.jerseyNumber() != null) {
                    player.setJerseyNumber(pu.jerseyNumber());
                }
                if (pu.playingRole() != null) {
                    player.setPlayingRole(blankToNull(pu.playingRole()));
                }
                if (Boolean.TRUE.equals(pu.captain())) {
                    r.getPlayers().forEach(p -> p.setCaptain(false));
                    player.setCaptain(true);
                    r.getContact().setCaptainName(player.getFullName());
                }
                applyPlayerPhoto(r, player, pu.photoUploadIndex(), playerPhotos, playerIndex(r, player));
            }
        }

        ensureCaptain(r);
        validateSquadSize(r);

        String logoPath = mediaStorage.storeTeamLogoIfPresent(r.getPublicReference(), teamLogo);
        if (logoPath != null) {
            r.setTeamLogoPath(logoPath);
        }
    }

    private static int playerIndex(Registration r, Player player) {
        for (int i = 0; i < r.getPlayers().size(); i++) {
            if (r.getPlayers().get(i).getId() != null && r.getPlayers().get(i).getId().equals(player.getId())) {
                return i;
            }
        }
        return Math.max(0, r.getPlayers().size() - 1);
    }

    private void applyPlayerPhoto(
            Registration r,
            Player player,
            Integer photoUploadIndex,
            List<MultipartFile> playerPhotos,
            int storageIndex) {
        if (photoUploadIndex == null || playerPhotos == null || photoUploadIndex < 0 || photoUploadIndex >= playerPhotos.size()) {
            return;
        }
        MultipartFile file = playerPhotos.get(photoUploadIndex);
        String path = mediaStorage.storePlayerPhotoIfPresent(r.getPublicReference(), storageIndex, file);
        if (path != null) {
            player.setPhotoPath(path);
        }
    }

    private void ensureCaptain(Registration r) {
        if (r.getPlayers().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NO_PLAYERS", "Team must have at least one player");
        }
        if (r.getPlayers().stream().noneMatch(Player::isCaptain)) {
            r.getPlayers().get(0).setCaptain(true);
            r.getContact().setCaptainName(r.getPlayers().get(0).getFullName());
        }
    }

    private void validateSquadSize(Registration r) {
        Tournament t = r.getTournament();
        int min = appProperties.effectiveMinSquadSize(t.getMinSquadSize());
        int size = r.getPlayers().size();
        if (size < min || size > t.getMaxSquadSize()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_SQUAD_SIZE",
                    "Squad must have between " + min + " and " + t.getMaxSquadSize() + " players");
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static String csv(String v) {
        if (v == null) return "";
        return "\"" + v.replace("\"", "\"\"") + "\"";
    }

    private static String cancelledNormalizedName(Registration r) {
        String suffix = "#cancelled#" + r.getId();
        String base = TeamNameNormalizer.normalize(r.getTeamName());
        int maxBase = 128 - suffix.length();
        if (base.length() > maxBase) {
            base = base.substring(0, Math.max(0, maxBase));
        }
        return base + suffix;
    }
}
