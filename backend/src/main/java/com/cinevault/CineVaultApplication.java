package com.cinevault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CineVaultApplication {

    public static void main(String[] args) {
        SpringApplication.run(CineVaultApplication.class, args);
    }
}
