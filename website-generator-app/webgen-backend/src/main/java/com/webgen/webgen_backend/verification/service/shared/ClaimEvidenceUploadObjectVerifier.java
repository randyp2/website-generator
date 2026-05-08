package com.webgen.webgen_backend.verification.service.shared;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Component
@RequiredArgsConstructor
public class ClaimEvidenceUploadObjectVerifier {

    private final ClaimEvidenceUploadFilePolicy claimEvidenceUploadFilePolicy;

    public void assertObjectIntegrity(
            S3Client s3Client,
            String bucket,
            String key,
            Long expectedLength,
            String expectedContentType
    ) {
        try {
            var headObjectResponse = s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build()
            );

            if (expectedLength != null
                    && headObjectResponse.contentLength() != null
                    && !expectedLength.equals(headObjectResponse.contentLength())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Uploaded object size mismatch");
            }

            String normalizedActualContentType = claimEvidenceUploadFilePolicy
                    .normalizeContentType(headObjectResponse.contentType());
            if (!StringUtils.hasText(normalizedActualContentType)
                    || !normalizedActualContentType.equals(expectedContentType)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Uploaded object content type mismatch");
            }
        } catch (S3Exception ex) {
            if (ex.statusCode() == HttpStatus.NOT_FOUND.value()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Uploaded object not found");
            }
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to validate uploaded object"
            );
        }
    }
}
