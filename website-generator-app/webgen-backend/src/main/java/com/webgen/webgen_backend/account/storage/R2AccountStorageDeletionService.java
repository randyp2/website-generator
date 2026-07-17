package com.webgen.webgen_backend.account.storage;

import com.webgen.webgen_backend.shared.config.R2Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.Delete;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectsResponse;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.util.List;
import java.util.UUID;

/**
 * Deletes all Cloudflare R2 objects owned by one account.
 */
@Service
@RequiredArgsConstructor
public class R2AccountStorageDeletionService {

    private static final int DELETE_BATCH_SIZE = 1000;
    private static final int MAX_DELETE_PASSES = 10_000;

    private final S3Client s3Client;
    private final R2Properties r2Properties;

    /**
     * Sweeps the deterministic account prefix until no objects remain.
     *
     * @param profileId authenticated account id
     */
    public void deleteForAccount(UUID profileId) {
        if (profileId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "profileId is required");
        }
        if (!StringUtils.hasText(r2Properties.getBucketName())) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "R2 bucket is not configured"
            );
        }

        String bucket = r2Properties.getBucketName().trim();
        String prefix = "claims/" + profileId + "/";

        try {
            for (int pass = 0; pass < MAX_DELETE_PASSES; pass++) {
                ListObjectsV2Response listed = s3Client.listObjectsV2(
                        ListObjectsV2Request.builder()
                                .bucket(bucket)
                                .prefix(prefix)
                                .maxKeys(DELETE_BATCH_SIZE)
                                .build()
                );
                List<ObjectIdentifier> objects = listed.contents().stream()
                        .map(object -> ObjectIdentifier.builder().key(object.key()).build())
                        .toList();
                if (objects.isEmpty()) {
                    return;
                }

                DeleteObjectsResponse deleted = s3Client.deleteObjects(
                        DeleteObjectsRequest.builder()
                                .bucket(bucket)
                                .delete(Delete.builder().objects(objects).quiet(true).build())
                                .build()
                );
                if (!deleted.errors().isEmpty()) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_GATEWAY,
                            "R2 reported one or more object deletion failures"
                    );
                }
            }
        } catch (S3Exception exception) {
            if (exception.statusCode() == 404) {
                return;
            }
            throw storageFailure(exception);
        } catch (SdkClientException exception) {
            throw storageFailure(exception);
        }

        throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "R2 account prefix did not become empty"
        );
    }

    private ResponseStatusException storageFailure(Exception cause) {
        return new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Unable to delete R2 account objects",
                cause
        );
    }
}
