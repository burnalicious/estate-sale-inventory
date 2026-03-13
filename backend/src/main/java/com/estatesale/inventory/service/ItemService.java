package com.estatesale.inventory.service;

import com.estatesale.inventory.exception.ResourceNotFoundException;
import com.estatesale.inventory.model.Item;
import com.estatesale.inventory.model.ItemStatus;
import com.estatesale.inventory.model.Sale;
import com.estatesale.inventory.repository.ItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ItemService {

    private final ItemRepository itemRepository;
    private final SaleService saleService;

    public ItemService(ItemRepository itemRepository, SaleService saleService) {
        this.itemRepository = itemRepository;
        this.saleService = saleService;
    }

    public List<Item> listItems(Long saleId, ItemStatus status, String category) {
        saleService.getSale(saleId); // verify sale exists

        if (status != null && category != null) {
            return itemRepository.findBySaleIdAndStatusAndCategory(saleId, status, category);
        } else if (status != null) {
            return itemRepository.findBySaleIdAndStatus(saleId, status);
        } else if (category != null) {
            return itemRepository.findBySaleIdAndCategory(saleId, category);
        }
        return itemRepository.findBySaleId(saleId);
    }

    public Page<Item> listItems(Long saleId, ItemStatus status, String category, int page, int size) {
        saleService.getSale(saleId); // verify sale exists
        Pageable pageable = PageRequest.of(page, size);

        if (status != null && category != null) {
            return itemRepository.findBySaleIdAndStatusAndCategory(saleId, status, category, pageable);
        } else if (status != null) {
            return itemRepository.findBySaleIdAndStatus(saleId, status, pageable);
        } else if (category != null) {
            return itemRepository.findBySaleIdAndCategory(saleId, category, pageable);
        }
        return itemRepository.findBySaleId(saleId, pageable);
    }

    public Item getItem(Long saleId, Long itemId) {
        saleService.getSale(saleId); // verify sale exists
        return itemRepository.findByIdAndSaleId(itemId, saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));
    }

    public Item createItem(Long saleId, Item item) {
        Sale sale = saleService.getSale(saleId);
        item.setSale(sale);
        return itemRepository.save(item);
    }

    public Item updateItem(Long saleId, Long itemId, Item updated) {
        Item item = getItem(saleId, itemId);
        item.setName(updated.getName());
        item.setDescription(updated.getDescription());
        item.setCategory(updated.getCategory());
        item.setCondition(updated.getCondition());
        item.setPrice(updated.getPrice());
        item.setStatus(updated.getStatus());
        item.setPhotoUrl(updated.getPhotoUrl());
        return itemRepository.save(item);
    }

    public void deleteItem(Long saleId, Long itemId) {
        Item item = getItem(saleId, itemId);
        itemRepository.delete(item);
    }
}
