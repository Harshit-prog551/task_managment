package com.taskmanager.repository;

import com.taskmanager.entity.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {
    List<FileMetadata> findByTaskId(Long taskId);
    long countByTaskId(Long taskId);
}
