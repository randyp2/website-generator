package com.webgen.webgen_backend.verification.service.shared;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.verification.entity.ClaimEvidenceUpload;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class EvidenceGroupKeyFactoryTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final EvidenceGroupKeyFactory factory = new EvidenceGroupKeyFactory();

    @Test
    void identicalChecksumsProduceSameGroupAcrossUploads() {
        ClaimEvidenceUpload first = uploadWithIdentity(UUID.randomUUID(), "same-sha", "etag-one", 42L);
        ClaimEvidenceUpload second = uploadWithIdentity(UUID.randomUUID(), "same-sha", "etag-two", 42L);

        assertThat(factory.forManualUpload(first))
                .isEqualTo(factory.forManualUpload(second))
                .isEqualTo("manual_upload:sha256:same-sha");
    }

    @Test
    void etagFallbackIncludesLength() {
        ClaimEvidenceUpload upload = uploadWithIdentity(UUID.randomUUID(), null, "opaque-etag", 42L);

        assertThat(factory.forManualUpload(upload))
                .isEqualTo("manual_upload:etag:opaque-etag:42");
    }

    private ClaimEvidenceUpload uploadWithIdentity(
            UUID uploadId,
            String checksum,
            String eTag,
            long contentLength
    ) {
        var verifiedObject = objectMapper.createObjectNode();
        if (checksum != null) {
            verifiedObject.put("checksumSha256", checksum);
        }
        verifiedObject.put("eTag", eTag);
        verifiedObject.put("contentLength", contentLength);
        return ClaimEvidenceUpload.builder()
                .id(uploadId)
                .metadata(objectMapper.createObjectNode().set("verifiedObject", verifiedObject))
                .build();
    }
}
