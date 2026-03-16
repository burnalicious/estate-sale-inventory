package com.estatesale.inventory;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SaleControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    private String saleJson() {
        return """
            {
                "name": "Test Sale",
                "address1": "123 Main St",
                "city": "Austin",
                "state": "TX",
                "zipCode": "78701",
                "saleDate": "2026-05-01",
                "status": "UPCOMING"
            }
            """;
    }

    @Test
    void createAndGetSale() throws Exception {
        MvcResult result = mvc.perform(post("/sales")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(saleJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Sale"))
                .andExpect(jsonPath("$.id").isNumber())
                .andReturn();

        Integer id = mapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        mvc.perform(get("/sales/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Sale"))
                .andExpect(jsonPath("$.status").value("UPCOMING"));
    }

    @Test
    void listSales() throws Exception {
        mvc.perform(post("/sales")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(saleJson()))
                .andExpect(status().isCreated());

        mvc.perform(get("/sales"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void listSalesFilterByStatus() throws Exception {
        mvc.perform(post("/sales")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(saleJson()))
                .andExpect(status().isCreated());

        mvc.perform(get("/sales").param("status", "UPCOMING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mvc.perform(get("/sales").param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void updateSale() throws Exception {
        MvcResult result = mvc.perform(post("/sales")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(saleJson()))
                .andExpect(status().isCreated())
                .andReturn();

        Integer id = mapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        String updated = """
            {
                "name": "Updated Sale",
                "address1": "456 Oak Ave",
                "city": "Dallas",
                "state": "TX",
                "zipCode": "75201",
                "saleDate": "2026-06-01",
                "status": "ACTIVE"
            }
            """;

        mvc.perform(put("/sales/" + id)
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(updated))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Sale"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void deleteSale() throws Exception {
        MvcResult result = mvc.perform(post("/sales")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(saleJson()))
                .andExpect(status().isCreated())
                .andReturn();

        Integer id = mapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        mvc.perform(delete("/sales/" + id)
                .with(httpBasic("admin", "admin")))
                .andExpect(status().isNoContent());

        mvc.perform(get("/sales/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void getSaleNotFound() throws Exception {
        mvc.perform(get("/sales/99999"))
                .andExpect(status().isNotFound());
    }
}
