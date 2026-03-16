package com.estatesale.inventory;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
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
class ItemControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    private int saleId;

    @BeforeEach
    void setUp() throws Exception {
        MvcResult result = mvc.perform(post("/sales")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "name": "Item Test Sale",
                        "address1": "789 Elm St",
                        "city": "Houston",
                        "state": "TX",
                        "zipCode": "77001",
                        "saleDate": "2026-07-01",
                        "status": "ACTIVE"
                    }
                    """))
                .andExpect(status().isCreated())
                .andReturn();

        saleId = mapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();
    }

    private String itemJson() {
        return """
            {
                "name": "Test Item",
                "description": "A test item",
                "category": "Furniture",
                "condition": "GOOD",
                "price": 100.00,
                "status": "AVAILABLE"
            }
            """;
    }

    @Test
    void createAndGetItem() throws Exception {
        MvcResult result = mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(itemJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Item"))
                .andExpect(jsonPath("$.price").value(100.00))
                .andReturn();

        Integer itemId = mapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        mvc.perform(get("/sales/" + saleId + "/items/" + itemId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Item"));
    }

    @Test
    void listItemsPaginated() throws Exception {
        mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(itemJson()))
                .andExpect(status().isCreated());

        mvc.perform(get("/sales/" + saleId + "/items")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").isNumber())
                .andExpect(jsonPath("$.page").value(0));
    }

    @Test
    void filterItemsByStatus() throws Exception {
        mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(itemJson()))
                .andExpect(status().isCreated());

        mvc.perform(get("/sales/" + saleId + "/items")
                .param("status", "AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void filterItemsByCategory() throws Exception {
        mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(itemJson()))
                .andExpect(status().isCreated());

        mvc.perform(get("/sales/" + saleId + "/items")
                .param("category", "Furniture"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void updateItem() throws Exception {
        MvcResult result = mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(itemJson()))
                .andExpect(status().isCreated())
                .andReturn();

        Integer itemId = mapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        String updated = """
            {
                "name": "Updated Item",
                "description": "Updated description",
                "category": "Electronics",
                "condition": "LIKE_NEW",
                "price": 250.00,
                "status": "SOLD"
            }
            """;

        mvc.perform(put("/sales/" + saleId + "/items/" + itemId)
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(updated))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Item"))
                .andExpect(jsonPath("$.status").value("SOLD"));
    }

    @Test
    void deleteItem() throws Exception {
        MvcResult result = mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(itemJson()))
                .andExpect(status().isCreated())
                .andReturn();

        Integer itemId = mapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        mvc.perform(delete("/sales/" + saleId + "/items/" + itemId)
                .with(httpBasic("admin", "admin")))
                .andExpect(status().isNoContent());

        mvc.perform(get("/sales/" + saleId + "/items/" + itemId))
                .andExpect(status().isNotFound());
    }

    @Test
    void itemsNotFoundForMissingSale() throws Exception {
        mvc.perform(get("/sales/99999/items"))
                .andExpect(status().isNotFound());
    }
}
