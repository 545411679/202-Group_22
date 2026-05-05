package com.grooming.pet.dto.response;

public class CategoryResponse {
    private Long categoryId;
    private String name;

    public CategoryResponse(Long categoryId, String name) {
        this.categoryId = categoryId;
        this.name = name;
    }

    public Long getCategoryId() { return categoryId; }
    public String getName() { return name; }
}
