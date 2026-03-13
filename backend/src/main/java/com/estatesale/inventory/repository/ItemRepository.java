package com.estatesale.inventory.repository;

import com.estatesale.inventory.model.Item;
import com.estatesale.inventory.model.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findBySaleId(Long saleId);
    List<Item> findBySaleIdAndStatus(Long saleId, ItemStatus status);
    List<Item> findBySaleIdAndCategory(Long saleId, String category);
    List<Item> findBySaleIdAndStatusAndCategory(Long saleId, ItemStatus status, String category);
    Optional<Item> findByIdAndSaleId(Long id, Long saleId);
    int countBySaleId(Long saleId);
}
