package com.webgen.webgen_backend.shared.storage;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static com.webgen.webgen_backend.shared.integration.SupabaseAdminRequestHeaders.create;
import static org.springframework.http.HttpStatus.BAD_GATEWAY;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

/**
 * Minimal server-side client for the Supabase Storage REST API.
 */
@Component
public class SupabaseStorageClient {

    private static final int PAGE_SIZE = 1000;
    private static final int DELETE_BATCH_SIZE = 1000;

    private final RestTemplate restTemplate;
    private final String projectUrl;
    private final String serviceRoleKey;

    @Autowired
    public SupabaseStorageClient(
            @Value("${supabase.project.url}") String projectUrl,
            @Value("${supabase.service-role-key}") String serviceRoleKey
    ) {
        this(new RestTemplate(), projectUrl, serviceRoleKey);
    }

    protected SupabaseStorageClient(
            RestTemplate restTemplate,
            String projectUrl,
            String serviceRoleKey
    ) {
        this.restTemplate = restTemplate;
        this.projectUrl = trimTrailingSlash(projectUrl);
        this.serviceRoleKey = serviceRoleKey;
    }

    /**
     * Recursively lists exact object paths below a non-empty logical prefix.
     *
     * @param bucket Supabase Storage bucket
     * @param prefix logical folder prefix without a leading slash
     * @return exact paths that can be passed to the bulk deletion endpoint
     */
    public List<String> listRecursively(String bucket, String prefix) {
        validateConfiguration();
        String normalizedBucket = requireSegment(bucket, "Storage bucket is required");
        String normalizedPrefix = requirePrefix(prefix);
        ArrayDeque<String> pendingFolders = new ArrayDeque<>();
        Set<String> visitedFolders = new HashSet<>();
        List<String> objectPaths = new ArrayList<>();
        pendingFolders.add(normalizedPrefix);

        while (!pendingFolders.isEmpty()) {
            String folder = pendingFolders.removeFirst();
            if (!visitedFolders.add(folder)) {
                continue;
            }

            int offset = 0;
            while (true) {
                List<StorageObject> page = listPage(
                        normalizedBucket,
                        folder,
                        offset
                );
                for (StorageObject object : page) {
                    if (!StringUtils.hasText(object.name())) {
                        continue;
                    }
                    String path = joinPath(folder, object.name());
                    if (object.id() == null) {
                        pendingFolders.addLast(path);
                    } else {
                        objectPaths.add(path);
                    }
                }
                if (page.size() < PAGE_SIZE) {
                    break;
                }
                offset += PAGE_SIZE;
            }
        }

        return List.copyOf(objectPaths);
    }

    /**
     * Deletes every object below the supplied logical prefix.
     */
    public void deletePrefix(String bucket, String prefix) {
        deleteObjects(bucket, listRecursively(bucket, prefix));
    }

    /**
     * Deletes exact object paths in API-supported batches.
     */
    public void deleteObjects(String bucket, List<String> objectPaths) {
        validateConfiguration();
        String normalizedBucket = requireSegment(bucket, "Storage bucket is required");
        if (objectPaths == null || objectPaths.isEmpty()) {
            return;
        }

        URI uri = storageUri("object", normalizedBucket);
        for (int start = 0; start < objectPaths.size(); start += DELETE_BATCH_SIZE) {
            int end = Math.min(start + DELETE_BATCH_SIZE, objectPaths.size());
            List<String> batch = objectPaths.subList(start, end).stream()
                    .map(this::requirePrefix)
                    .toList();
            HttpEntity<DeleteObjectsRequest> request = new HttpEntity<>(
                    new DeleteObjectsRequest(batch),
                    storageHeaders()
            );
            try {
                restTemplate.exchange(uri, HttpMethod.DELETE, request, Void.class);
            } catch (HttpStatusCodeException exception) {
                if (exception.getStatusCode().value() == 404) {
                    continue;
                }
                throw storageFailure("Unable to delete Supabase Storage objects", exception);
            } catch (RestClientException exception) {
                throw storageFailure("Unable to delete Supabase Storage objects", exception);
            }
        }
    }

    private List<StorageObject> listPage(
            String bucket,
            String prefix,
            int offset
    ) {
        URI uri = storageUri("object", "list", bucket);
        ListObjectsRequest body = new ListObjectsRequest(
                prefix,
                PAGE_SIZE,
                offset,
                new SortBy("name", "asc")
        );
        HttpEntity<ListObjectsRequest> request = new HttpEntity<>(body, storageHeaders());

        try {
            ResponseEntity<StorageObject[]> response = restTemplate.exchange(
                    uri,
                    HttpMethod.POST,
                    request,
                    StorageObject[].class
            );
            StorageObject[] objects = response.getBody();
            return objects == null ? List.of() : List.of(objects);
        } catch (HttpStatusCodeException exception) {
            if (exception.getStatusCode().value() == 404) {
                return List.of();
            }
            throw storageFailure("Unable to list Supabase Storage objects", exception);
        } catch (RestClientException exception) {
            throw storageFailure("Unable to list Supabase Storage objects", exception);
        }
    }

    private HttpHeaders storageHeaders() {
        HttpHeaders headers = create(serviceRoleKey);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private URI storageUri(String... pathSegments) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(projectUrl)
                .pathSegment("storage", "v1");
        for (String segment : pathSegments) {
            builder.pathSegment(segment);
        }
        return builder.build().encode().toUri();
    }

    private void validateConfiguration() {
        if (!StringUtils.hasText(projectUrl) || !StringUtils.hasText(serviceRoleKey)) {
            throw new ResponseStatusException(
                    INTERNAL_SERVER_ERROR,
                    "Supabase Storage is not configured"
            );
        }
    }

    private String requireSegment(String value, String message) {
        if (!StringUtils.hasText(value) || value.contains("/")) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, message);
        }
        return value.trim();
    }

    private String requirePrefix(String value) {
        if (!StringUtils.hasText(value)) {
            throw new ResponseStatusException(
                    INTERNAL_SERVER_ERROR,
                    "Refusing to operate on an empty storage prefix"
            );
        }
        String normalized = value.trim().replaceAll("^/+|/+$", "");
        boolean hasTraversalSegment = Arrays.stream(normalized.split("/"))
                .anyMatch(".."::equals);
        if (normalized.isBlank() || hasTraversalSegment) {
            throw new ResponseStatusException(
                    INTERNAL_SERVER_ERROR,
                    "Invalid storage object path"
            );
        }
        return normalized;
    }

    private String joinPath(String prefix, String name) {
        return requirePrefix(prefix) + "/" + requirePrefix(name);
    }

    private String trimTrailingSlash(String value) {
        if (value == null) {
            return null;
        }
        return value.trim().replaceAll("/+$", "");
    }

    private ResponseStatusException storageFailure(
            String message,
            Exception cause
    ) {
        return new ResponseStatusException(BAD_GATEWAY, message, cause);
    }

    private record ListObjectsRequest(
            String prefix,
            int limit,
            int offset,
            SortBy sortBy
    ) {
    }

    private record SortBy(String column, String order) {
    }

    private record DeleteObjectsRequest(List<String> prefixes) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record StorageObject(String name, String id) {
    }
}
