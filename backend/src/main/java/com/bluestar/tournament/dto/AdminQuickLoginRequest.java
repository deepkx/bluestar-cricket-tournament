package com.bluestar.tournament.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminQuickLoginRequest(@NotBlank String password) {}
