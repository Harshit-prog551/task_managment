package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.entity.*;
import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final FileMetadataRepository fileMetadataRepository;
    private final FileStorageService fileStorageService;

    private static final int MAX_FILES_PER_TASK = 3;

    public Page<TaskResponse> getTasks(
            Task.Status status,
            Task.Priority priority,
            LocalDate dueDate,
            String sortBy,
            String sortDir,
            int page,
            int size) {

        Specification<Task> spec = buildSpecification(status, priority, dueDate);
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return taskRepository.findAll(spec, pageable).map(this::toResponse);
    }

    public TaskResponse getTaskById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        Task task = new Task();
        mapRequestToTask(request, task);
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findById(id);
        mapRequestToTask(request, task);
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = findById(id);
        task.getFiles().forEach(f -> fileStorageService.delete(f.getStoredFileName()));
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse uploadFiles(Long taskId, List<MultipartFile> files) {
        Task task = findById(taskId);
        long existingCount = fileMetadataRepository.countByTaskId(taskId);

        if (existingCount + files.size() > MAX_FILES_PER_TASK) {
            throw new BadRequestException("Maximum " + MAX_FILES_PER_TASK +
                    " files allowed per task. Currently has: " + existingCount);
        }

        for (MultipartFile file : files) {
            String storedName = fileStorageService.store(file);
            FileMetadata metadata = FileMetadata.builder()
                    .originalFileName(file.getOriginalFilename())
                    .storedFileName(storedName)
                    .filePath(fileStorageService.getUploadDir() + "/" + storedName)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .task(task)
                    .build();
            fileMetadataRepository.save(metadata);
        }

        return toResponse(taskRepository.findById(taskId).orElseThrow());
    }

    @Transactional
    public void deleteFile(Long taskId, Long fileId) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File not found: " + fileId));
        if (!file.getTask().getId().equals(taskId)) {
            throw new BadRequestException("File does not belong to this task");
        }
        fileStorageService.delete(file.getStoredFileName());
        fileMetadataRepository.delete(file);
    }

    private void mapRequestToTask(TaskRequest request, Task task) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        if (request.getAssignedUserId() != null) {
            User user = userRepository.findById(request.getAssignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "User not found: " + request.getAssignedUserId()));
            task.setAssignedUser(user);
        } else {
            task.setAssignedUser(null);
        }
    }

    private Specification<Task> buildSpecification(
            Task.Status status, Task.Priority priority, LocalDate dueDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (priority != null) predicates.add(cb.equal(root.get("priority"), priority));
            if (dueDate != null) predicates.add(cb.equal(root.get("dueDate"), dueDate));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Task findById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    public TaskResponse toResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus().name());
        response.setPriority(task.getPriority().name());
        response.setDueDate(task.getDueDate());

        if (task.getAssignedUser() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(task.getAssignedUser().getId());
            userDTO.setEmail(task.getAssignedUser().getEmail());
            userDTO.setRole(task.getAssignedUser().getRole().name());
            response.setAssignedUser(userDTO);
        }

        List<FileMetadataDTO> fileDTOs = task.getFiles().stream().map(f -> {
            FileMetadataDTO dto = new FileMetadataDTO();
            dto.setId(f.getId());
            dto.setOriginalFileName(f.getOriginalFileName());
            dto.setFileType(f.getFileType());
            dto.setFileSize(f.getFileSize());
            return dto;
        }).collect(Collectors.toList());

        response.setFiles(fileDTOs);
        return response;
    }
}
