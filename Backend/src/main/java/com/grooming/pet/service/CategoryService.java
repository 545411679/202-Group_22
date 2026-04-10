package com.grooming.pet.service;

import com.grooming.pet.dto.request.CategoryRequest;
import com.grooming.pet.dto.response.CategoryResponse;
import com.grooming.pet.exception.*;
import com.grooming.pet.model.*;
import com.grooming.pet.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final SpecialistRepository specialistRepository;
    private final AuthService authService;

    public CategoryService(CategoryRepository categoryRepository,
                           SpecialistRepository specialistRepository,
                           AuthService authService) {
        this.categoryRepository = categoryRepository;
        this.specialistRepository = specialistRepository;
        this.authService = authService;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }

    public CategoryResponse createCategory(CategoryRequest req) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        if (categoryRepository.existsByName(req.getName())) {
            throw new ConflictException("Category already exists: " + req.getName());
        }
        Category category = new Category(req.getName());
        category = categoryRepository.save(category);
        return new CategoryResponse(category.getId(), category.getName());
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest req) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));
        category.setName(req.getName());
        category = categoryRepository.save(category);
        return new CategoryResponse(category.getId(), category.getName());
    }

    public void deleteCategory(Long id) {
        User currentUser = authService.getCurrentUser();
        if (currentUser.getRole() != User.Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found."));
        if (specialistRepository.existsBySpecialty(category.getName())) {
            throw new BadRequestException("Cannot delete category: it is used by one or more specialists.");
        }
        categoryRepository.delete(category);
    }
}
