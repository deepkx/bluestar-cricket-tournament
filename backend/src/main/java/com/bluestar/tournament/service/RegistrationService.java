package com.bluestar.tournament.service;

import com.bluestar.tournament.config.AppProperties;
import com.bluestar.tournament.domain.RegistrationStatus;
import com.bluestar.tournament.dto.*;
import com.bluestar.tournament.entity.*;
import com.bluestar.tournament.exception.ApiException;
import com.bluestar.tournament.repository.RegistrationRepository;
import com.bluestar.tournament.util.ReferenceGenerator;
import com.bluestar.tournament.util.TeamNameNormalizer;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final TournamentService tournamentService;
    private final AppProperties appProperties;
    private final RegistrationMediaStorage mediaStorage;

    public RegistrationService(
            RegistrationRepository registrationRepository,
            TournamentService tournamentService,
            AppProperties appProperties,
            RegistrationMediaStorage mediaStorage) {
        this.registrationRepository = registrationRepository;
        this.tournamentService = tournamentService;
        this.appProperties = appProperties;
        this.mediaStorage = mediaStorage;
    }

    @Transactional
    public RegistrationCreatedResponse create(RegistrationCreateRequest request) {
        if (!Boolean.TRUE.equals(request.rulesAccepted())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "RULES_REQUIRED", "Tournament rules must be accepted");
        }
        Tournament tournament = tournamentService.requireCurrent();
        int minSquad = appProperties.effectiveMinSquadSize(tournament.getMinSquadSize());
        validateSquad(request.players(), minSquad, tournament.getMaxSquadSize());
        if (!tournamentService.isRegistrationOpen(tournament)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "REGISTRATION_CLOSED", "Registration is currently closed");
        }

        String normalized = TeamNameNormalizer.normalize(request.teamName());
        if (registrationRepository.existsByTournamentIdAndNormalizedTeamName(tournament.getId(), normalized)) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_TEAM", "A team with this name is already registered");
        }

        Instant now = Instant.now();
        long occupied = registrationRepository.countOccupiedSlots(tournament.getId(), now);
        if (occupied >= tournament.getMaxTeams()) {
            throw new ApiException(HttpStatus.CONFLICT, "CAPACITY_FULL", "All team slots are currently reserved");
        }

        Registration reg = new Registration();
        reg.setPublicReference(ReferenceGenerator.publicReference());
        reg.setTrackingToken(ReferenceGenerator.trackingToken());
        reg.setTournament(tournament);
        reg.setTeamName(request.teamName().trim());
        reg.setNormalizedTeamName(normalized);
        reg.setCity(request.city());
        reg.setStatus(RegistrationStatus.CONFIRMED);
        reg.setConfirmedAt(now);
        reg.setSlotReservationExpiresAt(null);

        TeamContact contact = new TeamContact();
        contact.setRegistration(reg);
        contact.setCaptainName(request.captain().fullName().trim());
        contact.setPhone(null);
        contact.setEmail(null);
        reg.setContact(contact);

        String captainNorm = request.captain().fullName().trim().toLowerCase();
        for (RegistrationCreateRequest.PlayerDto p : request.players()) {
            Player player = new Player();
            player.setRegistration(reg);
            player.setFullName(p.fullName().trim());
            player.setJerseyNumber(p.jerseyNumber());
            player.setPlayingRole(blankToNull(p.playingRole()));
            boolean isCap = Boolean.TRUE.equals(p.isCaptain())
                    || p.fullName().trim().equalsIgnoreCase(request.captain().fullName());
            player.setCaptain(isCap || p.fullName().trim().toLowerCase().equals(captainNorm));
            reg.getPlayers().add(player);
        }
        if (reg.getPlayers().stream().noneMatch(Player::isCaptain)) {
            reg.getPlayers().get(0).setCaptain(true);
        }

        registrationRepository.save(reg);
        return new RegistrationCreatedResponse(
                reg.getPublicReference(),
                reg.getTrackingToken(),
                tournament.getEntryFeePaise(),
                "INR"
        );
    }

    @Transactional
    public RegistrationCreatedResponse createWithMedia(
            RegistrationCreateRequest request,
            MultipartFile teamLogo,
            List<MultipartFile> playerPhotos) {
        if (playerPhotos == null || playerPhotos.size() != request.players().size()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "PHOTO_COUNT_MISMATCH",
                    "One photo required per registered player");
        }
        RegistrationCreatedResponse created = create(request);
        Registration reg = registrationRepository
                .findByPublicReferenceAndTrackingToken(created.publicReference(), created.trackingToken())
                .orElseThrow();

        reg.setTeamLogoPath(mediaStorage.storeTeamLogo(reg.getPublicReference(), teamLogo));
        for (int i = 0; i < reg.getPlayers().size(); i++) {
            reg.getPlayers().get(i).setPhotoPath(
                    mediaStorage.storePlayerPhoto(reg.getPublicReference(), i, playerPhotos.get(i)));
        }
        registrationRepository.save(reg);
        return created;
    }

    @Transactional(readOnly = true)
    public RegistrationStatusResponse getStatus(String reference, String trackingToken) {
        Registration reg = registrationRepository.findByPublicReferenceAndTrackingToken(reference, trackingToken)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Registration not found"));
        Tournament t = reg.getTournament();
        boolean canRetry = reg.getStatus() == RegistrationStatus.PENDING_PAYMENT
                || reg.getStatus() == RegistrationStatus.PAYMENT_FAILED
                || reg.getStatus() == RegistrationStatus.PAYMENT_PROCESSING;
        return new RegistrationStatusResponse(
                reg.getPublicReference(),
                reg.getTeamName(),
                reg.getStatus(),
                t.getEntryFeePaise(),
                reg.getConfirmedAt(),
                canRetry
        );
    }

    @Transactional
    public Registration requireForPayment(String reference, String trackingToken) {
        Registration reg = registrationRepository.findByPublicReferenceAndTrackingToken(reference, trackingToken)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Registration not found"));
        if (reg.getStatus() == RegistrationStatus.CONFIRMED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ALREADY_CONFIRMED", "Registration is already confirmed");
        }
        if (reg.getStatus() == RegistrationStatus.CANCELLED || reg.getStatus() == RegistrationStatus.REFUNDED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NOT_PAYABLE", "Registration cannot accept payment");
        }
        Instant now = Instant.now();
        if (reg.getSlotReservationExpiresAt() != null && reg.getSlotReservationExpiresAt().isBefore(now)
                && reg.getStatus() == RegistrationStatus.PENDING_PAYMENT) {
            reg.setSlotReservationExpiresAt(now.plus(appProperties.slotReservationMinutes(), ChronoUnit.MINUTES));
        }
        return reg;
    }

    @Transactional(readOnly = true)
    public TeamDetailPublicDto getConfirmedTeamDetail(String teamName) {
        if (teamName == null || teamName.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_NAME", "Team name required");
        }
        Tournament t = tournamentService.requireCurrent();
        String normalized = TeamNameNormalizer.normalize(teamName);
        Registration reg = registrationRepository
                .findByTournamentIdAndNormalizedTeamNameAndStatus(
                        t.getId(), normalized, RegistrationStatus.CONFIRMED)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Team not found"));
        List<TeamDetailPublicDto.PlayerLine> players = reg.getPlayers().stream()
                .map(p -> new TeamDetailPublicDto.PlayerLine(
                        p.getFullName(), p.isCaptain(), p.getPhotoPath()))
                .toList();
        return new TeamDetailPublicDto(
                reg.getTeamName(),
                reg.getTeamLogoPath(),
                reg.getContact().getCaptainName(),
                reg.getConfirmedAt(),
                players);
    }

    @Transactional(readOnly = true)
    public List<TeamPublicDto> listConfirmedTeams(String query) {
        Tournament t = tournamentService.requireCurrent();
        return registrationRepository
                .findByTournamentIdAndStatusOrderByConfirmedAtAscTeamNameAsc(t.getId(), RegistrationStatus.CONFIRMED)
                .stream()
                .filter(r -> query == null || query.isBlank()
                        || r.getTeamName().toLowerCase().contains(query.toLowerCase()))
                .map(r -> new TeamPublicDto(
                        r.getId(),
                        r.getTeamName(),
                        r.getTeamLogoPath(),
                        RegistrationStatus.CONFIRMED,
                        r.getConfirmedAt() != null ? r.getConfirmedAt() : r.getCreatedAt()))
                .toList();
    }

    private void validateSquad(List<RegistrationCreateRequest.PlayerDto> players, int min, int max) {
        if (players.size() < min || players.size() > max) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_SQUAD_SIZE",
                    "Squad must have between " + min + " and " + max + " players");
        }
        Set<String> names = new HashSet<>();
        Set<Integer> jerseys = new HashSet<>();
        for (RegistrationCreateRequest.PlayerDto p : players) {
            String n = p.fullName().trim().toLowerCase();
            if (!names.add(n)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "DUPLICATE_PLAYER", "Duplicate player name: " + p.fullName());
            }
            if (p.jerseyNumber() != null && !jerseys.add(p.jerseyNumber())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "DUPLICATE_JERSEY", "Duplicate jersey number: " + p.jerseyNumber());
            }
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s;
    }
}
