package com.estatesale.inventory.service;

import com.estatesale.inventory.exception.ResourceNotFoundException;
import com.estatesale.inventory.model.ItemStatus;
import com.estatesale.inventory.model.Sale;
import com.estatesale.inventory.model.SaleStatus;
import com.estatesale.inventory.repository.ItemRepository;
import com.estatesale.inventory.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SaleService {

    private final SaleRepository saleRepository;
    private final ItemRepository itemRepository;

    public SaleService(SaleRepository saleRepository, ItemRepository itemRepository) {
        this.saleRepository = saleRepository;
        this.itemRepository = itemRepository;
    }

    public List<Sale> listSales(SaleStatus status) {
        if (status != null) {
            return saleRepository.findByStatus(status);
        }
        return saleRepository.findAll();
    }

    public Sale getSale(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", id));
    }

    public Sale createSale(Sale sale) {
        return saleRepository.save(sale);
    }

    public Sale updateSale(Long id, Sale updated) {
        Sale sale = getSale(id);
        sale.setName(updated.getName());
        sale.setAddress1(updated.getAddress1());
        sale.setAddress2(updated.getAddress2());
        sale.setCity(updated.getCity());
        sale.setState(updated.getState());
        sale.setZipCode(updated.getZipCode());
        sale.setSaleDate(updated.getSaleDate());
        sale.setStatus(updated.getStatus());
        return saleRepository.save(sale);
    }

    public void deleteSale(Long id) {
        Sale sale = getSale(id);
        saleRepository.delete(sale);
    }

    public int getItemCount(Long saleId) {
        return itemRepository.countBySaleId(saleId);
    }

    public Map<String, Object> getSaleSummary(Long id) {
        getSale(id); // verify sale exists
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalItems", itemRepository.countBySaleId(id));
        summary.put("totalValue", itemRepository.sumPriceBySaleId(id));
        summary.put("soldItems", itemRepository.countBySaleIdAndStatus(id, ItemStatus.SOLD));
        summary.put("soldValue", itemRepository.sumPriceBySaleIdAndStatus(id, ItemStatus.SOLD));
        summary.put("availableItems", itemRepository.countBySaleIdAndStatus(id, ItemStatus.AVAILABLE));
        summary.put("withdrawnItems", itemRepository.countBySaleIdAndStatus(id, ItemStatus.WITHDRAWN));
        return summary;
    }
}
