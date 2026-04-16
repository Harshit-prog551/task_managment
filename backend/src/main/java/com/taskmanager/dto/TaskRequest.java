package com.taskmanager.dto;

import com.taskmanager.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull
    private Task.Status status = Task.Status.PENDING;

    @NotNull
    private Task.Priority priority = Task.Priority.MEDIUM;

    private LocalDate dueDate;

    private Long assignedUserId;
}
