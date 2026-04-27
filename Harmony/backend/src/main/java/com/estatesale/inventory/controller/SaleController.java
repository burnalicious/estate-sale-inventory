package com.estatesale.inventory.controller;

import com.estatesale.inventory.model.Sale;
import com.estatesale.inventory.model.SaleStatus;
import com.estatesale.inventory.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    public List<Map<String, Object>> listSales(@RequestParam(required = false) SaleStatus status) {
        return saleService.listSales(status).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{saleId}")
    public Map<String, Object> getSale(@PathVariable Long saleId) {
        return toResponse(saleService.getSale(saleId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createSale(@Valid @RequestBody Sale sale) {
        return toResponse(saleService.createSale(sale));
    }

    @PutMapping("/{saleId}")
    public Map<String, Object> updateSale(@PathVariable Long saleId, @Valid @RequestBody Sale sale) {
        return toResponse(saleService.updateSale(saleId, sale));
    }

    @GetMapping("/{saleId}/summary")
    public Map<String, Object> getSaleSummary(@PathVariable Long saleId) {
        return saleService.getSaleSummary(saleId);
    }

    @DeleteMapping("/{saleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSale(@PathVariable Long saleId) {
        saleService.deleteSale(saleId);
    }

    private Map<String, Object> toResponse(Sale sale) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", sale.getId());
        map.put("name", sale.getName());
        map.put("address1", sale.getAddress1());
        map.put("address2", sale.getAddress2());
        map.put("city", sale.getCity());
        map.put("state", sale.getState());
        map.put("zipCode", sale.getZipCode());
        map.put("saleDate", sale.getSaleDate());
        map.put("status", sale.getStatus());
        map.put("itemCount", saleService.getItemCount(sale.getId()));
        map.put("createdAt", sale.getCreatedAt());
        map.put("updatedAt", sale.getUpdatedAt());
        return map;
    }
}
