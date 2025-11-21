package com.toji.toji.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // static 리소스 경로 설정
        registry.addResourceHandler("/data/**")
                .addResourceLocations("classpath:/static/data/");

        // 불법점용 이미지 파일 경로 설정
        // 개발 환경에서 업로드된 파일을 즉시 확인하기 위해 file: 프로토콜 사용
        registry.addResourceHandler("/CDIGIT_CCTV01/**")
                .addResourceLocations("file:src/main/resources/static/CDIGIT_CCTV01/",
                        "classpath:/static/CDIGIT_CCTV01/");
    }
}
