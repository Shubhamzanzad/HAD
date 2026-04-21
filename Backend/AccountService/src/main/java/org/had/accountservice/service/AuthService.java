package org.had.accountservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.had.accountservice.entity.*;
import org.had.accountservice.exception.MyWebClientException;
import org.had.accountservice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {
    @Autowired
    private UserCredentialRepository repository;

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Autowired
    private DoctorDetailsRepository doctorDetailsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private WebClient webClient;

    @Autowired
    private EmailRegistrationRepository emailRegistrationRepository;

    @Autowired
    private HospitalDetailsRepository hospitalDetailsRepository;

    @Autowired
    private UserCredentialRepository userCredentialRepository;

    @Autowired
    private StaffDetailsRepository staffDetailsRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private ForgotPasswordRepository forgotPasswordRepository;

    public String generateToken(String username, String role) {
        return jwtService.generateToken(username, role);
    }

    public ResponseEntity<?> validateToken(String token, UserDetails userDetails) {
        try {
            jwtService.validateToken(token, userDetails);
            return ResponseEntity.ok("Token valid");
        } catch (Exception e) {
            return new ResponseEntity<>("tokenInvalid", HttpStatus.BAD_REQUEST);
        }
    }

    public String getAuthoritiesAsString(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(""));
    }

    public String sendMail(JsonNode jsonNode) {
        String to = jsonNode.get("to").asText();
        String role = jsonNode.get("role").asText();
        String subject = "Invitation to join our clinic as a " + role.toLowerCase();
        String uuid = String.valueOf(UUID.randomUUID());
        boolean flag = Objects.equals(role, "HEAD_DOCTOR");
        EmailRegistrationDetails emailRegistrationDetails = new EmailRegistrationDetails(uuid, role);
        emailRegistrationDetails.setRole(role);
        emailRegistrationDetails.setToken(uuid);
        emailRegistrationRepository.save(emailRegistrationDetails);
        String url = "http://localhost:5173/register/" + "?role=" + role + "&token=" + uuid + "&flag=" + flag;
        String htmlBody = "<html><body>" + "<p>This is a notification email. We would like you register to our hospital as a </p>" + role.toLowerCase() + "<p><em>" + "</em></p>" + url + "<p><b>This link will valid for only 10 minutes</b></p>" + "</body></html>";
        String body = htmlBody;
        MimeMessage message = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true); // true indicates multipart message
            helper.setFrom("noreply@example.com"); // Set your no-reply email address
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true indicates HTML content
            javaMailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
        return "Email Sent";
    }

    public String registerFacility(JsonNode jsonNode) {
        String address = jsonNode.get("address").asText();
        String district = jsonNode.get("district").asText();
        String state = jsonNode.get("state").asText();
        String facilityId = jsonNode.get("facilityId").asText();
        String facilityName = jsonNode.get("facilityName").asText();
        Integer pincode = jsonNode.get("pincode").asInt();
        String specialization = jsonNode.get("specialization").asText();

        HospitalDetails hospitalDetails = new HospitalDetails();
        hospitalDetails.setAddress(address);
        hospitalDetails.setHospital_name(facilityName);
        hospitalDetails.setHospital_id(facilityId);
        hospitalDetails.setPincode(pincode);
        hospitalDetails.setSpecialization(specialization);

        String[] districtParts = district.split("-");
        String districtName = districtParts[0];
        String districtCode = districtParts[1];
        String[] stateParts = state.split("-");
        String stateName = stateParts[0];
        String stateCode = stateParts[1];
        hospitalDetails.setDistrict(districtName);
        hospitalDetails.setState(stateName);
        hospitalDetails.setDistrict_code(Integer.valueOf(districtCode));
        hospitalDetails.setState_code(Integer.valueOf(stateCode));
        hospitalDetailsRepository.save(hospitalDetails);

        var values = new HashMap<String, String>() {{
            put("facilityName", facilityName);
            put("facilityId", facilityId);
        }};

        String requestBody;
        var objectMapper = new ObjectMapper();
        try {
            requestBody = objectMapper.writeValueAsString(values);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return webClient.post().uri("http://127.0.0.1:9008/abdm/hpr/registerFacility").contentType(MediaType.APPLICATION_JSON).body(BodyInserters.fromValue(requestBody)).retrieve().onStatus(HttpStatusCode::isError, clientResponse -> {
            return clientResponse.bodyToMono(String.class).flatMap(errorBody -> Mono.error(new MyWebClientException(errorBody, clientResponse.statusCode().value())));
        }).bodyToMono(String.class).block();
    }

    public String verifyEmail(JsonNode jsonNode) {
        String role = jsonNode.get("role").asText();
        String isHeadDoctor = jsonNode.get("isHeadDoctor").asText();
        String token = jsonNode.get("token").asText();

        EmailRegistrationDetails emailRegistrationDetails = emailRegistrationRepository.findByToken(token);

        if (emailRegistrationDetails == null) {
            return "Invalid Token";
        }

        Calendar calendar = Calendar.getInstance();
        if (emailRegistrationDetails.getExpiration().getTime() - calendar.getTime().getTime() <= 0) {
            emailRegistrationRepository.delete(emailRegistrationDetails);
            return "Verification Token Expired";
        }
        emailRegistrationRepository.delete(emailRegistrationDetails);
        return "User Token Verified";
    }

    public void editDetails(JsonNode jsonNode) {
        String role = jsonNode.get("role").asText();
        String username = jsonNode.get("username").asText();
        if (userCredentialRepository.findByUsername(username).isPresent()) {
            UserCredential userCredential = userCredentialRepository.findByUsername(username).get();
            if (role.equals("staff")) {
                editStaffDetails(userCredential, jsonNode);
            } else {
                editDoctorDetails(userCredential, jsonNode);
            }
        }

    }

    private void editDoctorDetails(UserCredential userCredential, JsonNode jsonNode) {
        if (doctorDetailsRepository.findByLoginCredential(userCredential).isPresent()) {
            DoctorDetails doctorDetails = doctorDetailsRepository.findByLoginCredential(userCredential).get();
            doctorDetails.setAddress(jsonNode.get("addressLine").asText());
            String district = jsonNode.get("district").asText();
            String state = jsonNode.get("state").asText();
            String[] districtParts = district.split("-");
            String districtName = districtParts[0];
            String districtCode = districtParts[1];
            String[] stateParts = state.split("-");
            String stateName = stateParts[0];
            String stateCode = stateParts[1];
            doctorDetails.setDistrict(districtName);
            doctorDetails.setState(stateName);
            doctorDetails.setDistrict_Code(Integer.valueOf(districtCode));
            doctorDetails.setState_Code(Integer.valueOf(stateCode));
            doctorDetails.setPincode(jsonNode.get("pincode").asInt());
            doctorDetails.setMobile(jsonNode.get("mobileNumber").asText());
            doctorDetails.setEmail(jsonNode.get("email").asText());
            doctorDetailsRepository.save(doctorDetails);
        }
    }

    private void editStaffDetails(UserCredential userCredential, JsonNode jsonNode) {
        if (staffDetailsRepository.findByLoginCredential(userCredential).isPresent()) {
            StaffDetails staffDetails = staffDetailsRepository.findByLoginCredential(userCredential).get();
            staffDetails.setAddress(jsonNode.get("addressLine").asText());
            String district = jsonNode.get("district").asText();
            String state = jsonNode.get("state").asText();
            String[] districtParts = district.split("-");
            String districtName = districtParts[0];
            String[] stateParts = state.split("-");
            String stateName = stateParts[0];
            staffDetails.setDistrict(districtName);
            staffDetails.setState(stateName);
            staffDetails.setPincode(jsonNode.get("pincode").asText());
            staffDetails.setMobile(jsonNode.get("mobileNumber").asText());
            staffDetails.setEmail(jsonNode.get("email").asText());
            staffDetailsRepository.save(staffDetails);
        }
    }

    public String editFacility(JsonNode jsonNode) {
        HospitalDetails hospitalDetails = hospitalDetailsRepository.findAll().getFirst();

        String district = jsonNode.get("district").asText();
        String[] districtParts = district.split("-");
        String districtName = districtParts[0];
        String districtCode = districtParts[1];
        hospitalDetails.setDistrict(districtName);
        hospitalDetails.setDistrict_code(Integer.valueOf(districtCode));

        String state = jsonNode.get("state").asText();
        String[] stateParts = state.split("-");
        String stateName = stateParts[0];
        String stateCode = stateParts[1];
        hospitalDetails.setState_code(Integer.valueOf(stateCode));
        hospitalDetails.setState(stateName);

        String facilityName = jsonNode.get("clinicName").asText();
        String facilityId = jsonNode.get("clinicId").asText();
        String bridgeId = jsonNode.get("bridgeId").asText();
        hospitalDetails.setPincode(jsonNode.get("pincode").asInt());
        hospitalDetails.setAddress(jsonNode.get("addressLine").asText());
        hospitalDetails.setHospital_name(facilityName);
        hospitalDetails.setHospital_id(facilityId);
        hospitalDetails.setSpecialization(jsonNode.get("specialization").asText());
        hospitalDetailsRepository.save(hospitalDetails);

        var values = new HashMap<String, String>() {{
            put("facilityName", facilityName);
            put("facilityId", facilityId);
            put("bridgeId", bridgeId);
        }};

        String requestBody;
        var objectMapper = new ObjectMapper();
        try {
            requestBody = objectMapper.writeValueAsString(values);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        return webClient.post().uri("http://127.0.0.1:9008/abdm/hpr/registerFacility").contentType(MediaType.APPLICATION_JSON).body(BodyInserters.fromValue(requestBody)).retrieve().onStatus(HttpStatusCode::isError, clientResponse -> {
            return clientResponse.bodyToMono(String.class).flatMap(errorBody -> Mono.error(new MyWebClientException(errorBody, clientResponse.statusCode().value())));
        }).bodyToMono(String.class).block();
    }

    public List<StaffDetails> getAllStaffList() {
        return staffDetailsRepository.findAll();
    }

    public void deleteFaculty(JsonNode jsonNode) {
        String role = jsonNode.get("role").asText();
        switch(role) {
            case "staff":
                Integer staffId = jsonNode.get("staffId").asInt();
                Optional<StaffDetails> staffDetailsOptional = staffDetailsRepository.findById(staffId);
                staffDetailsOptional.ifPresent(staffDetails -> {
                    UserCredential staffUserCredentials = staffDetails.getLoginCredential();
                    if(refreshTokenRepository.existsByUser(staffUserCredentials))
                        refreshTokenRepository.deleteByUser(staffUserCredentials);
                    staffDetailsRepository.delete(staffDetails);
                    userCredentialRepository.delete(staffUserCredentials);
                });
                break;
            case "doctor":
                Integer doctorId = jsonNode.get("doctorId").asInt();
                Optional<DoctorDetails> doctorDetailsOptional = doctorDetailsRepository.findById(doctorId);
                doctorDetailsOptional.ifPresent(doctorDetails -> {
                    UserCredential doctorUserCredential = doctorDetails.getLoginCredential();
                    if (refreshTokenRepository.existsByUser(doctorUserCredential))
                        refreshTokenRepository.deleteByUser(doctorUserCredential);
                    doctorDetailsRepository.delete(doctorDetails);
                    userCredentialRepository.delete(doctorUserCredential);
                });
                break;
        }
    }

    public void changePassword(JsonNode jsonNode) {
        String role = jsonNode.get("id").get("role").asText();
        String id = jsonNode.get("id").get("id").asText();
        String oldPassword = jsonNode.get("oldPassword").asText();
        String newPassword = jsonNode.get("newPassword").asText();

        if (role.equals("STAFF")) {
            Optional<StaffDetails> staffDetails = staffDetailsRepository.findById(Integer.valueOf(id));
            UserCredential userCredential = staffDetails.get().getLoginCredential();
            if (refreshTokenRepository.existsByUser(userCredential))
                refreshTokenRepository.deleteByUser(userCredential);
            if (staffDetails.isPresent()) {
                String password = userCredential.getPassword();
                if (passwordEncoder.matches(oldPassword, password)) {
                    String newEncryptedPassword = passwordEncoder.encode(newPassword);
                    userCredential.setPassword(newEncryptedPassword);
                    userCredentialRepository.save(userCredential);
                }
            }
        } else {
            Optional<DoctorDetails> doctorDetails = doctorDetailsRepository.findById(Integer.valueOf(id));
            UserCredential userCredential = doctorDetails.get().getLoginCredential();
            if (refreshTokenRepository.existsByUser(userCredential))
                refreshTokenRepository.deleteByUser(userCredential);
            if (doctorDetails.isPresent()) {
                String password = userCredential.getPassword();
                if (passwordEncoder.matches(oldPassword, password)) {
                    String newEncryptedPassword = passwordEncoder.encode(newPassword);
                    userCredential.setPassword(newEncryptedPassword);
                    userCredentialRepository.save(userCredential);
                }
            }
        }
    }

    public String forgotPassword(JsonNode jsonNode) {
        String email = jsonNode.get("email").asText();
        String token = UUID.randomUUID().toString();
        if(doctorDetailsRepository.findByEmail(email).isPresent()) {
            DoctorDetails doctorDetails = doctorDetailsRepository.findByEmail(email).get();
            UserCredential userCredential = doctorDetails.getLoginCredential();
            Integer id = userCredential.getUserCred_id();
            String role = "DOCTOR";
            ForgotPassword forgotPassword = new ForgotPassword(token, role, email, id);
            forgotPassword.setEmail(email);
            forgotPassword.setToken(token);
            forgotPassword.setRole(role);
            forgotPassword.setFacultyId(id);
            forgotPasswordRepository.save(forgotPassword);
            return sendForgotPasswordEmail(id, token, email);
        } else if (staffDetailsRepository.findByEmail(email).isPresent()) {
            StaffDetails staffDetails = staffDetailsRepository.findByEmail(email).get();
            UserCredential userCredential = staffDetails.getLoginCredential();
            Integer id = userCredential.getUserCred_id();
            String role = "STAFF";
            ForgotPassword forgotPassword = new ForgotPassword(token, role, email, id);
            forgotPassword.setEmail(email);
            forgotPassword.setRole(role);
            forgotPassword.setFacultyId(id);
            forgotPassword.setToken(token);
            forgotPasswordRepository.save(forgotPassword);
            return sendForgotPasswordEmail(id, token, email);
        }
            return "Email not registered";
    }

    private String sendForgotPasswordEmail(Integer id, String token, String email) {
        String subject = "Forgot Password";
        String url = "http://localhost:5173/auth/forgotPassword" + "?token=" + token + "&randomId=" + id;
        String htmlBody = "<html><body>" + "<p>This Email id contains a one time link to reset your password at Medisync website. Please do not share this link with anyone. Link will be active for 10 minutes.</p>" +  url + "<p><b>This link will valid for only 10 minutes</b></p>" + "</body></html>";
        MimeMessage message = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom("noreply@example.com");
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            javaMailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
        return "Email Sent";
    }

    public String verifyForgotPasswordToken(JsonNode jsonNode) {
        String token = jsonNode.get("token").asText();
        if(forgotPasswordRepository.findByToken(token).isPresent()) {
            Calendar calendar = Calendar.getInstance();
            ForgotPassword forgotPassword = forgotPasswordRepository.findByToken(token).get();
            if (forgotPassword.getExpiration().getTime() - calendar.getTime().getTime() <= 0) {
                forgotPasswordRepository.delete(forgotPassword);
                return "Verification Token Expired";
            }
            forgotPasswordRepository.delete(forgotPassword);
            return "User Token Verified";
        }
        else {
            return "Token Invalid";
        }
    }

    public String resetForgotPassword(JsonNode jsonNode) {
        String password = passwordEncoder.encode(jsonNode.get("password").asText());
        Integer id = jsonNode.get("id").asInt();
        UserCredential userCredential = userCredentialRepository.findById(id).get();
        userCredential.setPassword(password);
        userCredentialRepository.save(userCredential);
        return "Password Reset Successful";
    }
}
