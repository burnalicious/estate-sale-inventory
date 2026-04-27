package com.estatesale.inventory.repository;

import com.estatesale.inventory.model.Item;
import com.estatesale.inventory.model.ItemStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findBySaleId(Long saleId);
    List<Item> findBySaleIdAndStatus(Long saleId, ItemStatus status);
    List<Item> findBySaleIdAndCategory(Long saleId, String category);
    List<Item> findBySaleIdAndStatusAndCategory(Long saleId, ItemStatus status, String category);
    Optional<Item> findByIdAndSaleId(Long id, Long saleId);
    int countBySaleId(Long saleId);

    Page<Item> findBySaleId(Long saleId, Pageable pageable);
    Page<Item> findBySaleIdAndStatus(Long saleId, ItemStatus status, Pageable pageable);
    Page<Item> findBySaleIdAndCategory(Long saleId, String category, Pageable pageable);
    Page<Item> findBySaleIdAndStatusAndCategory(Long saleId, ItemStatus status, String category, Pageable pageable);

    int countBySaleIdAndStatus(Long saleId, ItemStatus status);

    @Query("SELECT COALESCE(SUM(i.price), 0) FROM Item i WHERE i.sale.id = :saleId")
    BigDecimal sumPriceBySaleId(Long saleId);

    @Query("SELECT COALESCE(SUM(i.price), 0) FROM Item i WHERE i.sale.id = :saleId AND i.status = :status")
    BigDecimal sumPriceBySaleIdAndStatus(Long saleId, ItemStatus status);
}
