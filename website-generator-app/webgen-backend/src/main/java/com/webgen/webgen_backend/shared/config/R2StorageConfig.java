package com.webgen.webgen_backend.shared.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.Assert;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
@ConditionalOnProperty(prefix = "r2", name = "enabled", havingValue = "true")
public class R2StorageConfig {

    private final R2Properties r2Properties;

    public R2StorageConfig(R2Properties r2Properties) {
        this.r2Properties = r2Properties;
    }

    @Bean(name = "r2S3Client")
    public S3Client r2S3Client() {
        validateRequiredProperties();
        return S3Client.builder()
                .credentialsProvider(buildCredentialsProvider())
                .endpointOverride(URI.create(r2Properties.getEndpoint()))
                .region(Region.of(r2Properties.getRegion()))
                .serviceConfiguration(
                        S3Configuration.builder()
                                .pathStyleAccessEnabled(true)
                                .build()
                )
                .build();
    }

    @Bean(name = "r2S3Presigner")
    public S3Presigner r2S3Presigner() {
        validateRequiredProperties();
        return S3Presigner.builder()
                .credentialsProvider(buildCredentialsProvider())
                .endpointOverride(URI.create(r2Properties.getEndpoint()))
                .region(Region.of(r2Properties.getRegion()))
                .serviceConfiguration(
                        S3Configuration.builder()
                                .pathStyleAccessEnabled(true)
                                .build()
                )
                .build();
    }

    private StaticCredentialsProvider buildCredentialsProvider() {
        return StaticCredentialsProvider.create(
                AwsBasicCredentials.create(
                        r2Properties.getAccessKeyId(),
                        r2Properties.getSecretAccessKey()
                )
        );
    }

    private void validateRequiredProperties() {
        Assert.hasText(r2Properties.getAccessKeyId(), "r2.access-key-id must be set when r2.enabled=true");
        Assert.hasText(r2Properties.getSecretAccessKey(), "r2.secret-access-key must be set when r2.enabled=true");
        Assert.hasText(r2Properties.getBucketName(), "r2.bucket-name must be set when r2.enabled=true");
        Assert.hasText(r2Properties.getEndpoint(), "r2.endpoint must be set when r2.enabled=true");
        Assert.hasText(r2Properties.getRegion(), "r2.region must be set when r2.enabled=true");
    }
}

