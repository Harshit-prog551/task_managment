package com.taskmanager.dto;

import lombok.Data;

@Data
public class FileMetadataDTO {
    private Long id;
    private String originalFileName;
    private String fileType;
    private Long fileSize;
}
