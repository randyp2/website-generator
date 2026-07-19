package com.webgen.webgen_backend.verification.service.shared;

import org.junit.jupiter.api.Test;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;

import java.lang.reflect.Proxy;

import static org.assertj.core.api.Assertions.assertThat;

class ClaimEvidenceUploadObjectVerifierTest {

    @Test
    void returnsNormalizedIdentityFromValidatedObject() {
        HeadObjectResponse response = HeadObjectResponse.builder()
                .contentLength(42L)
                .contentType("application/pdf; charset=binary")
                .checksumSHA256("sha256-value")
                .eTag("\"etag-value\"")
                .build();
        S3Client s3Client = stubS3Client(response);
        ClaimEvidenceUploadObjectVerifier verifier = new ClaimEvidenceUploadObjectVerifier(
                new ClaimEvidenceUploadFilePolicy());

        ClaimEvidenceUploadObjectVerifier.VerifiedObjectIdentity identity =
                verifier.assertObjectIntegrity(
                        s3Client, "bucket", "key", 42L, "application/pdf");

        assertThat(identity.checksumSha256()).isEqualTo("sha256-value");
        assertThat(identity.eTag()).isEqualTo("etag-value");
        assertThat(identity.contentLength()).isEqualTo(42L);
    }

    private S3Client stubS3Client(HeadObjectResponse response) {
        return (S3Client) Proxy.newProxyInstance(
                S3Client.class.getClassLoader(),
                new Class[]{S3Client.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "headObject" -> {
                        assertThat(args[0]).isInstanceOf(HeadObjectRequest.class);
                        yield response;
                    }
                    case "serviceName" -> "s3";
                    case "close" -> null;
                    case "toString" -> "s3ClientProxy";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(
                            "Unexpected S3 method invocation: " + method.getName());
                });
    }
}
