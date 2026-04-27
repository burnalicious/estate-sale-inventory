package com.estatesale.inventory.repository;

import com.estatesale.inventory.model.Sale;
import com.estatesale.inventory.model.SaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByStatus(SaleStatus status);
}
