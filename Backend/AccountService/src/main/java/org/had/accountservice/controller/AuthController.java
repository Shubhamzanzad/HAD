package org.had.accountservice.controller;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.had.accountservice.config.UserCredentialUserDetails;
import org.had.accountservice.dto.AuthRequest;
import org.had.accountservice.dto.DoctorDetailsDTO;
import org.had.accountservice.dto.StaffDetailsDTO;
import org.had.accountservice.entity.DoctorDetails;
import org.had.accountservice.entity.RefreshToken;
import org.had.accountservice.entity.StaffDetails;
import org.had.accountservice.exception.TokenRefreshException;
import org.had.accountservice.repository.UserCredentialRepository;
import org.had.accountservice.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private StaffService staffService;

    @Autowired
    private RefreshTokenService refreshTokenService;
    @Autowired
    private UserCredentialRepository userCredentialRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateAndGetToken(@RequestBody AuthRequest authRequest) {
        Authentication authenticate = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));
        if (authenticate.isAuthenticated()) {
            UserCredentialUserDetails credential = (UserCredentialUserDetails) authenticate.getPrincipal();
            String role = authService.getAuthoritiesAsString(credential.getAuthorities());
            String token = authService.generateToken(authRequest.getUsername(), role);

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(credential.getId());
            ResponseCookie jwtRefreshCookie = jwtService.generateRefreshJwtCookie(refreshToken.getToken());

            Map<String, String> response = new HashMap<>();
            response.put("status", "Logged in successfully");
            response.put("token", token);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                    .body(response);
        } else {
            throw new UsernameNotFoundException("invalid user request !");
        }
    }

    @PostMapping(value = "/registerDoctor", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerDoctor(@Valid @RequestBody DoctorDetailsDTO doctorDetailsDTO) {

        String result = doctorService.addDoctor(doctorDetailsDTO);
        if (result.equals("Doctor added to system")) {
            Authentication authenticate = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(doctorDetailsDTO.getUsername(), doctorDetailsDTO.getPassword()));
            if (authenticate.isAuthenticated()) {
                UserCredentialUserDetails credential = (UserCredentialUserDetails) authenticate.getPrincipal();
                String role = authService.getAuthoritiesAsString(credential.getAuthorities());
                String token = authService.generateToken(doctorDetailsDTO.getUsername(), role);
                Map<String, String> response = new HashMap<>();
                response.put("status", result);
                response.put("token", token);
                return ResponseEntity.ok(response);
            } else {
                throw new UsernameNotFoundException("invalid user request !");
            }
        }
        return ResponseEntity.badRequest().body(result);
    }

    @GetMapping(value = "/isHeadDoctorPresent", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> isHeadDoctorPresent() {
        if(userCredentialRepository.existsByRole("HEAD_DOCTOR")){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Head Doctor already exists !");
        }
        return ResponseEntity.ok().body(true);
    }


    @PostMapping(value = "/sendEmail")
    public String sendMail(@RequestBody JsonNode jsonNode) {
        return authService.sendMail(jsonNode);
    }

    @PostMapping(value = "verifyEmail")
    public String verifyEmail(@RequestBody JsonNode jsonNode) {
        return authService.verifyEmail(jsonNode);
    }

    @PostMapping(value = "/get-doctor-details", produces = MediaType.APPLICATION_JSON_VALUE)
    public String getDoctorDetails(@RequestBody JsonNode jsonNode) {
        String otp = jsonNode.get("otp").asText();
        String txnId = jsonNode.get("txnId").asText();
        return doctorService.getDoctorDetails(otp, txnId);
    }

    @PostMapping(value = "/generateAadharOTPHPR", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> generateAadharOTPHPR(@RequestBody JsonNode jsonNode) {
        String hprId = jsonNode.get("hprId").asText();
        String details = doctorService.generateAadharOTPHPR(hprId);
        return ResponseEntity.ok(details);
    }

    @PostMapping(value = "/deleteFaculty", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> deleteFaculty( @RequestBody JsonNode jsonNode) {
        authService.deleteFaculty(jsonNode);
        return ResponseEntity.ok("Faculty deleted successfully");
    }

    @PostMapping(value = "/get-staff-details-by-username", produces = MediaType.APPLICATION_JSON_VALUE)
    public StaffDetails getStaffDetailsByUsername(@RequestBody JsonNode jsonNode) {
        String username = jsonNode.get("username").asText();
        return staffService.getStaffDetailsByUsername(username);
    }

    @PostMapping(value = {"/get-doctor-details-by-username","get-head_doctor-details-by-username"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public DoctorDetails getDoctorDetailsByUsername(@RequestBody JsonNode jsonNode) {
        String username = jsonNode.get("username").asText();
        return doctorService.getDoctorDetailsByUsername(username);
    }

    @PostMapping(value = "/registerStaff", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerStaff(@Valid @RequestBody StaffDetailsDTO staffDetailsDTO) {
        String result = staffService.addStaff(staffDetailsDTO);
        if (result.equals("Staff added to system")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/signout")
    public ResponseEntity<?> logout() {
        Object principle = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principle.toString() != "anonymousUser") {
            Integer userId = ((UserCredentialUserDetails) principle).getId();
            refreshTokenService.deleteByUserCredId(userId);
        }

        ResponseCookie jwtRefreshCookie = jwtService.getCleanJwtRefreshCookie();
        Map<String, String> response = new HashMap<>();
        response.put("status", "You've been signed out!");
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                .body(response);
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(HttpServletRequest request) {
        String refreshToken = jwtService.getJwtRefreshFromCookies(request);

        if ((refreshToken != null) && (refreshToken.length() > 0)) {
            return refreshTokenService.findByToken(refreshToken)
                    .map(refreshTokenService::verifyExpiration)
                    .map(RefreshToken::getUser)
                    .map(user -> {
                        String role = user.getRole();
                        String token = authService.generateToken(user.getUsername(), role);
                        Map<String, String> response = new HashMap<>();
                        response.put("status", "Token is refreshed successfully!");
                        response.put("token", token);

                        return ResponseEntity.ok()
                                .body(response);
                    })
                    .orElseThrow(() -> new TokenRefreshException(refreshToken,
                            "Refresh token is not in database!", HttpStatus.FORBIDDEN.value()));
        }

        return ResponseEntity.badRequest().body("Refresh Token is empty!");
    }

    @PostMapping(value = "/isLogged", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> isLogged(HttpServletRequest request) {
        String refreshToken = jwtService.getJwtRefreshFromCookies(request);
        if ((refreshToken != null) && (refreshToken.length() > 0)) {
            Optional<RefreshToken> token = refreshTokenService.findByToken(refreshToken);
            if(token.isPresent()){
                return ResponseEntity.ok("user is logged in");
            }
            else return ResponseEntity.badRequest().body("Refresh token is not in database!");
        }
        return ResponseEntity.badRequest().body("Refresh Token is empty!");
    }

    @PostMapping(value = "/registerFacility", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerFacility(@RequestBody JsonNode jsonNode) {
        authService.registerFacility(jsonNode);
        return ResponseEntity.ok("Facility added to system");
    }

    @PostMapping(value = "/editFacility", produces = MediaType.APPLICATION_JSON_VALUE)
    public String editFacility(@RequestBody JsonNode jsonNode) {
        return authService.editFacility(jsonNode);
    }

    @PostMapping(value = "/editDetails", produces = MediaType.APPLICATION_JSON_VALUE)
    public String editDetails(@RequestBody JsonNode jsonNode) {
        authService.editDetails(jsonNode);
        return "Details edited successfully";
    }

    @PreAuthorize("hasAnyAuthority('HEAD_DOCTOR','STAFF')")
    @GetMapping(value = "/getAllStaffList",produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllStaffList(){
        List<StaffDetails> staffDetailsList = authService.getAllStaffList();
        if(staffDetailsList.isEmpty())
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("no staff found");
        return ResponseEntity.ok(staffDetailsList);
    }

    @PostMapping(value = "/changePassword", produces = MediaType.APPLICATION_JSON_VALUE)
    public String changePassword(@RequestBody JsonNode jsonNode) {
        authService.changePassword(jsonNode);
        return "Password Changed Successfully";
    }

    @PostMapping(value = "/forgotPassword", produces = MediaType.APPLICATION_JSON_VALUE)
    public String forgotPassword(@RequestBody JsonNode jsonNode) {
        return authService.forgotPassword(jsonNode);

    }
    @PostMapping(value = "/verifyForgotPasswordToken", produces = MediaType.APPLICATION_JSON_VALUE)
    public String verifyForgotPasswordToken(@RequestBody JsonNode jsonNode) {
        return authService.verifyForgotPasswordToken(jsonNode);
    }

    @PostMapping(value = "resetForgotPassword", produces = MediaType.APPLICATION_JSON_VALUE)
    public String resetForgotPassword(@RequestBody JsonNode jsonNode) {
        return authService.resetForgotPassword(jsonNode);
    }
}
