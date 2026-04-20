package com.cinevault.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.otp.from-email}")
    private String fromEmail;

    public void sendOtp(String toEmail, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("CineVault — Your Verification Code");

            String html = """
                <div style="font-family: 'Courier New', monospace; background: #0e0e0e; color: #f3ffca; padding: 40px; max-width: 480px; margin: 0 auto; border: 1px solid #ffffff1a;">
                    <h1 style="font-size: 13px; letter-spacing: 0.3em; text-transform: uppercase; color: #f3ffca; margin: 0 0 32px;">CINEVAULT / IDENTITY VERIFICATION</h1>
                    <p style="font-size: 12px; color: #ffffff60; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;">YOUR AUTHORIZATION CODE</p>
                    <div style="background: #1a1a1a; border: 2px solid #f3ffca; padding: 24px; text-align: center; margin: 16px 0;">
                        <span style="font-size: 48px; font-weight: 900; letter-spacing: 0.25em; color: #f3ffca;">%s</span>
                    </div>
                    <p style="font-size: 11px; color: #ffffff40; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 24px;">This code expires in <strong style="color: #ff706f;">10 minutes</strong>. Do not share it with anyone.</p>
                    <hr style="border: none; border-top: 1px solid #ffffff10; margin: 32px 0;" />
                    <p style="font-size: 10px; color: #ffffff20; text-transform: uppercase; letter-spacing: 0.1em;">GLITCH_NOIR // CINEVAULT SYSTEM // AUTOMATED MESSAGE</p>
                </div>
                """.formatted(code);

            helper.setText(html, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }
}
