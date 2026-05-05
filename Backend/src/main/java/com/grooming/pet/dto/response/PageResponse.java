package com.grooming.pet.dto.response;

import org.springframework.data.domain.Page;
import java.util.List;

public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public static <T> PageResponse<T> of(Page<T> p) {
        PageResponse<T> r = new PageResponse<>();
        r.content = p.getContent();
        r.page = p.getNumber();
        r.size = p.getSize();
        r.totalElements = p.getTotalElements();
        r.totalPages = p.getTotalPages();
        return r;
    }

    public List<T> getContent() { return content; }
    public int getPage() { return page; }
    public int getSize() { return size; }
    public long getTotalElements() { return totalElements; }
    public int getTotalPages() { return totalPages; }
}
