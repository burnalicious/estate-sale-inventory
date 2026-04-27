package com.estatesale.inventory.controller;

import com.estatesale.inventory.model.Item;
import com.estatesale.inventory.model.ItemStatus;
import com.estatesale.inventory.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/sales/{saleId}/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public Map<String, Object> listItems(
            @PathVariable Long saleId,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Item> result = itemService.listItems(saleId, status, category, page, size);
        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent().stream().map(this::toResponse).toList());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("page", result.getNumber());
        response.put("size", result.getSize());
        return response;
    }

    @GetMapping("/{itemId}")
    public Map<String, Object> getItem(@PathVariable Long saleId, @PathVariable Long itemId) {
        return toResponse(itemService.getItem(saleId, itemId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createItem(@PathVariable Long saleId, @Valid @RequestBody Item item) {
        return toResponse(itemService.createItem(saleId, item));
    }

    @PutMapping("/{itemId}")
    public Map<String, Object> updateItem(
            @PathVariable Long saleId,
            @PathVariable Long itemId,
            @Valid @RequestBody Item item) {
        return toResponse(itemService.updateItem(saleId, itemId, item));
    }

    @PostMapping("/{itemId}/photo")
    public Map<String, Object> uploadPhoto(
            @PathVariable Long saleId,
            @PathVariable Long itemId,
            @RequestParam("file") MultipartFile file) throws IOException {
        Path uploadDir = Paths.get("uploads").toAbsolutePath();
        Files.createDirectories(uploadDir);

        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String filename = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), uploadDir.resolve(filename));

        String photoUrl = "/uploads/" + filename;
        Item item = itemService.getItem(saleId, itemId);
        item.setPhotoUrl(photoUrl);
        return toResponse(itemService.updateItem(saleId, itemId, item));
    }

    @DeleteMapping("/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable Long saleId, @PathVariable Long itemId) {
        itemService.deleteItem(saleId, itemId);
    }

    private Map<String, Object> toResponse(Item item) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", item.getId());
        map.put("saleId", item.getSale().getId());
        map.put("name", item.getName());
        map.put("description", item.getDescription());
        map.put("category", item.getCategory());
        map.put("condition", item.getCondition());
        map.put("price", item.getPrice());
        map.put("status", item.getStatus());
        map.put("photoUrl", item.getPhotoUrl());
        map.put("tags", item.getTags() != null && !item.getTags().isBlank()
                ? Arrays.asList(item.getTags().split(","))
                : Collections.emptyList());
        map.put("createdAt", item.getCreatedAt());
        map.put("updatedAt", item.getUpdatedAt());
        return map;
    }
}
