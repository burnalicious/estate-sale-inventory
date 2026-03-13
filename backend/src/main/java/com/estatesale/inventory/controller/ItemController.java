package com.estatesale.inventory.controller;

import com.estatesale.inventory.model.Item;
import com.estatesale.inventory.model.ItemStatus;
import com.estatesale.inventory.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/sales/{saleId}/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public List<Map<String, Object>> listItems(
            @PathVariable Long saleId,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) String category) {
        return itemService.listItems(saleId, status, category).stream()
                .map(this::toResponse)
                .toList();
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
        map.put("createdAt", item.getCreatedAt());
        map.put("updatedAt", item.getUpdatedAt());
        return map;
    }
}
