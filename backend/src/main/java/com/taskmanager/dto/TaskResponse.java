package com.taskmanager.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private UserDTO assignedUser;
    private List<FileMetadataDTO> files;
}
