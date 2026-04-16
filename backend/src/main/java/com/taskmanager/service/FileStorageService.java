package com.taskmanager.service;

import com.taskmanager.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        rootLocation = Paths.get(uploadDir);
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory", e);
        }
    }

    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot store empty file");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new BadRequestException("Only PDF files are allowed");
        }

        String originalFilename = file.getOriginalFilename();
        String storedFilename = UUID.randomUUID() + "_" + originalFilename;

        try {
            Path destinationFile = rootLocation.resolve(storedFilename).normalize();
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored file: {}", storedFilename);
            return storedFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public Resource loadAsResource(String filename) {
        try {
            Path file = rootLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new BadRequestException("File not found or not readable: " + filename);
        } catch (MalformedURLException e) {
            throw new BadRequestException("File not found: " + filename);
        }
    }

    public void delete(String filename) {
        try {
            Path file = rootLocation.resolve(filename).normalize();
            Files.deleteIfExists(file);
        } catch (IOException e) {
            log.error("Failed to delete file: {}", filename, e);
        }
    }

    public String getUploadDir() {
        return rootLocation.toAbsolutePath().toString();
    }
}
