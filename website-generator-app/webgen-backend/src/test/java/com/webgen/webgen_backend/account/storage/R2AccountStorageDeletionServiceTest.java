package com.webgen.webgen_backend.account.storage;

import com.webgen.webgen_backend.shared.config.R2Properties;
import org.junit.jupiter.api.Test;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectsResponse;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.lang.reflect.Proxy;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class R2AccountStorageDeletionServiceTest {

    @Test
    void repeatedlyDeletesAccountPrefixUntilItIsEmpty() {
        UUID profileId = UUID.randomUUID();
        String firstKey = "claims/" + profileId + "/claim-a/upload-a/evidence.pdf";
        String secondKey = "claims/" + profileId + "/claim-b/upload-b/evidence.png";
        AtomicInteger listCalls = new AtomicInteger();
        AtomicReference<ListObjectsV2Request> listRequest = new AtomicReference<>();
        AtomicReference<DeleteObjectsRequest> deleteRequest = new AtomicReference<>();
        S3Client s3Client = (S3Client) Proxy.newProxyInstance(
                S3Client.class.getClassLoader(),
                new Class[]{S3Client.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "listObjectsV2" -> {
                        listRequest.set((ListObjectsV2Request) args[0]);
                        if (listCalls.getAndIncrement() == 0) {
                            yield ListObjectsV2Response.builder()
                                    .contents(
                                            S3Object.builder().key(firstKey).build(),
                                            S3Object.builder().key(secondKey).build()
                                    )
                                    .build();
                        }
                        yield ListObjectsV2Response.builder().contents(List.of()).build();
                    }
                    case "deleteObjects" -> {
                        deleteRequest.set((DeleteObjectsRequest) args[0]);
                        yield DeleteObjectsResponse.builder().build();
                    }
                    case "serviceName" -> "S3";
                    case "close" -> null;
                    case "toString" -> "S3ClientFixture";
                    case "hashCode" -> System.identityHashCode(proxy);
                    case "equals" -> proxy == args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                }
        );
        R2Properties properties = new R2Properties();
        properties.setBucketName("evidence-bucket");
        R2AccountStorageDeletionService service =
                new R2AccountStorageDeletionService(s3Client, properties);

        service.deleteForAccount(profileId);

        assertThat(listCalls).hasValue(2);
        assertThat(listRequest.get().bucket()).isEqualTo("evidence-bucket");
        assertThat(listRequest.get().prefix()).isEqualTo("claims/" + profileId + "/");
        assertThat(deleteRequest.get().bucket()).isEqualTo("evidence-bucket");
        assertThat(deleteRequest.get().delete().objects())
                .extracting(object -> object.key())
                .containsExactly(firstKey, secondKey);
    }
}
