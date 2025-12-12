package com.toji.toji.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.Enumeration;

@RestController
public class ProxyController {

    private final String VWORLD_WMS_URL = "http://api.vworld.kr/req/wms";

    @GetMapping("/proxy/wms.do")
    public void proxyWms(HttpServletRequest request, HttpServletResponse response) {
        try {
            StringBuilder urlBuilder = new StringBuilder(VWORLD_WMS_URL);
            urlBuilder.append("?");

            Enumeration<String> parameterNames = request.getParameterNames();
            while (parameterNames.hasMoreElements()) {
                String paramName = parameterNames.nextElement();
                if ("apikey".equalsIgnoreCase(paramName)) {
                    continue;
                }
                String paramValue = request.getParameter(paramName);
                urlBuilder.append(paramName).append("=").append(paramValue).append("&");
            }

            // Inject the API key here
            urlBuilder.append("key=720AE582-3B29-3A85-9357-C41C5E5E8607");

            URI url = new URI(urlBuilder.toString());

            // We need to stream the response
            try (InputStream is = url.toURL().openStream()) {
                response.setContentType(MediaType.IMAGE_PNG_VALUE);
                // Cache for 7 days (604800 seconds)
                response.setHeader("Cache-Control", "public, max-age=604800");
                OutputStream os = response.getOutputStream();
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }
}
