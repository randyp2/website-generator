package com.webgen.webgen_backend.portfolio.service.screenshot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ScreenshotStorageService {

    @Value("${supabase.project.url}")
    private String supabaseUrl;
    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    private static final String BUCKET = "portfolio_uploads";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Take the image bytes, upload to supabase object store and return public URL
     *
     * @param portfolioId a String of the id of the portfolio for upload path
     * @param pngBytes are Image bytes of the image to upload to object store
     * @return The public url assigned to this uploaded image
     */
    public String uploadScreenshot(String portfolioId, byte[] pngBytes) {
        String storagePath = "screenshots/" + portfolioId + "/preview.png";

        // Upload via Supabase Storage Rest API
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + BUCKET + "/" + storagePath;

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceRoleKey);
        headers.set("apikey", serviceRoleKey);
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.set("x-upsert", "true"); // Upsert to override double uploads

        // Construct request w/ headers
        HttpEntity<byte[]> request = new HttpEntity<>(pngBytes, headers);

        restTemplate.exchange(uploadUrl, HttpMethod.POST, request, String.class);

        return supabaseUrl + "/storage/v1/object/public/" + BUCKET + "/" + storagePath;
    }
}
