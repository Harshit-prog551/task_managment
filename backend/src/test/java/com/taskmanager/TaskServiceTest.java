package com.taskmanager;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.FileMetadataRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.FileStorageService;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private UserRepository userRepository;
    @Mock private FileMetadataRepository fileMetadataRepository;
    @Mock private FileStorageService fileStorageService;

    @InjectMocks private TaskService taskService;

    private Task sampleTask;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("user@test.com")
                .role(User.Role.USER)
                .build();

        sampleTask = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .status(Task.Status.PENDING)
                .priority(Task.Priority.MEDIUM)
                .assignedUser(sampleUser)
                .files(new ArrayList<>())
                .build();
    }

    @Test
    void getTaskById_shouldReturnTask_whenExists() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        TaskResponse response = taskService.getTaskById(1L);
        assertNotNull(response);
        assertEquals("Test Task", response.getTitle());
        assertEquals("PENDING", response.getStatus());
    }

    @Test
    void getTaskById_shouldThrow_whenNotFound() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> taskService.getTaskById(99L));
    }

    @Test
    void createTask_shouldReturnCreatedTask() {
        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");
        request.setStatus(Task.Status.PENDING);
        request.setPriority(Task.Priority.HIGH);

        Task saved = Task.builder()
                .id(2L)
                .title("New Task")
                .status(Task.Status.PENDING)
                .priority(Task.Priority.HIGH)
                .files(new ArrayList<>())
                .build();

        when(taskRepository.save(any(Task.class))).thenReturn(saved);

        TaskResponse response = taskService.createTask(request);
        assertNotNull(response);
        assertEquals("New Task", response.getTitle());
        assertEquals("HIGH", response.getPriority());
    }

    @Test
    void deleteTask_shouldDelete_whenExists() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        doNothing().when(taskRepository).delete(sampleTask);
        assertDoesNotThrow(() -> taskService.deleteTask(1L));
        verify(taskRepository, times(1)).delete(sampleTask);
    }

    @Test
    void uploadFiles_shouldThrow_whenExceedsLimit() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        when(fileMetadataRepository.countByTaskId(1L)).thenReturn(3L);
        var mockFiles = List.of(mock(org.springframework.web.multipart.MultipartFile.class));
        assertThrows(com.taskmanager.exception.BadRequestException.class,
                () -> taskService.uploadFiles(1L, mockFiles));
    }
}
