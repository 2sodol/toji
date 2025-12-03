package com.toji.toji;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class TojiApplication {

	public static void main(String[] args) {
		SpringApplication.run(TojiApplication.class, args);
	}

}
