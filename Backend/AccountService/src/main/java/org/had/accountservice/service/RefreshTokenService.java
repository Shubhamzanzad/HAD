package org.had.accountservice.service;

import jakarta.transaction.Transactional;
import org.had.accountservice.entity.RefreshToken;
import org.had.accountservice.exception.TokenRefreshException;
import org.had.accountservice.repository.RefreshTokenRepository;
import org.had.accountservice.repository.UserCredentialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private UserCredentialRepository userCredentialRepository;

    public Optional<RefreshToken> findByToken(String token){
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken createRefreshToken(Integer userId){
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(userCredentialRepository.findById(userId).get());
        refreshToken.setExpiryDate(Instant.now().plusMillis(1000*24*60*60));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken;
    }

    public RefreshToken verifyExpiration(RefreshToken token){
        if(token.getExpiryDate().compareTo(Instant.now())<0){
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token was expired. Please Sign In again", HttpStatus.FORBIDDEN.value());
        }
        return token;
    }

    @Transactional
    public int deleteByUserCredId(Integer userId){
        return refreshTokenRepository.deleteByUser(userCredentialRepository.findById(userId).get());
    }

}
