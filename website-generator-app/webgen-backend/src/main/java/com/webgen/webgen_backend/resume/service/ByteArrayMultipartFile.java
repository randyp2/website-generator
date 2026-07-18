package com.webgen.webgen_backend.resume.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;

/**
 * Adapts a size-validated in-memory storage object to the parser's existing
 * {@link MultipartFile} contract without writing sensitive resumes to local disk.
 */
final class ByteArrayMultipartFile implements MultipartFile {

    private final String originalFilename;
    private final String contentType;
    private final byte[] content;

    ByteArrayMultipartFile(String originalFilename, String contentType, byte[] content) {
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.content = Arrays.copyOf(content, content.length);
    }

    @Override
    public String getName() {
        return "file";
    }

    @Override
    public String getOriginalFilename() {
        return originalFilename;
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public boolean isEmpty() {
        return content.length == 0;
    }

    @Override
    public long getSize() {
        return content.length;
    }

    @Override
    public byte[] getBytes() {
        return Arrays.copyOf(content, content.length);
    }

    @Override
    public InputStream getInputStream() {
        return new ByteArrayInputStream(content);
    }

    @Override
    public void transferTo(java.io.File dest) throws IOException {
        transferTo(dest.toPath());
    }

    @Override
    public void transferTo(Path dest) throws IOException {
        Files.write(dest, content);
    }
}
