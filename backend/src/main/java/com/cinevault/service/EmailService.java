package com.cinevault.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtp(String to, String otp, String purpose) {
        if (mailSender == null) {
            System.err.println("WARNING: JavaMailSender not configured. Check spring.mail properties.");
            System.err.println("Mock Email to: " + to + " | OTP: " + otp + " | Purpose: " + purpose);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        
        if ("REGISTER".equalsIgnoreCase(purpose)) {
            message.setSubject("CineVault - Account Verification OTP");
            message.setText("Welcome to CineVault!\n\nYour One Time Password (OTP) for account verification is: " + otp + "\n\nThis OTP is valid for 10 minutes.");
        } else if ("RESET_PASSWORD".equalsIgnoreCase(purpose)) {
            message.setSubject("CineVault - Password Reset OTP");
            message.setText("You requested a password reset.\n\nYour OTP is: " + otp + "\n\nThis OTP is valid for 10 minutes. If you did not request this, please ignore this email.");
        }

        try {
            mailSender.send(message);
            System.out.println("OTP email sent to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }
}
