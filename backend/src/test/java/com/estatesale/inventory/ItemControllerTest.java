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

    @Test
    void createItemWithAllFields() throws Exception {
        String fullItem = """
            {
                "name": "Vintage Lamp",
                "description": "Art deco table lamp, brass finish, original shade",
                "category": "Lighting",
                "condition": "LIKE_NEW",
                "price": 185.50,
                "status": "AVAILABLE",
                "photoUrl": "https://example.com/lamp.jpg",
                "tags": "vintage,brass,art deco"
            }
            """;

        mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(fullItem))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Vintage Lamp"))
                .andExpect(jsonPath("$.description").value("Art deco table lamp, brass finish, original shade"))
                .andExpect(jsonPath("$.category").value("Lighting"))
                .andExpect(jsonPath("$.condition").value("LIKE_NEW"))
                .andExpect(jsonPath("$.price").value(185.50))
                .andExpect(jsonPath("$.status").value("AVAILABLE"))
                .andExpect(jsonPath("$.photoUrl").value("https://example.com/lamp.jpg"))
                .andExpect(jsonPath("$.tags[0]").value("vintage"))
                .andExpect(jsonPath("$.tags[1]").value("brass"))
                .andExpect(jsonPath("$.tags[2]").value("art deco"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.saleId").value(saleId))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists());
    }

    @Test
    void createItemMinimalFields() throws Exception {
        String minimal = """
            {
                "name": "Mystery Box",
                "price": 5.00,
                "status": "AVAILABLE"
            }
            """;

        mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(minimal))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Mystery Box"))
                .andExpect(jsonPath("$.price").value(5.00))
                .andExpect(jsonPath("$.description").isEmpty())
                .andExpect(jsonPath("$.category").isEmpty())
                .andExpect(jsonPath("$.condition").isEmpty())
                .andExpect(jsonPath("$.tags").isArray())
                .andExpect(jsonPath("$.tags").isEmpty());
    }

    @Test
    void createItemMissingRequiredFieldsReturns400() throws Exception {
        String noName = """
            { "price": 10.00, "status": "AVAILABLE" }
            """;
        mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(noName))
                .andExpect(status().isBadRequest());

        String noPrice = """
            { "name": "Widget", "status": "AVAILABLE" }
            """;
        mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(noPrice))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createItemWithEachCondition() throws Exception {
        String[] conditions = {"NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"};
        for (String cond : conditions) {
            String item = """
                {
                    "name": "Condition Test %s",
                    "price": 10.00,
                    "status": "AVAILABLE",
                    "condition": "%s"
                }
                """.formatted(cond, cond);

            mvc.perform(post("/sales/" + saleId + "/items")
                    .with(httpBasic("admin", "admin"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(item))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.condition").value(cond));
        }
    }

    @Test
    void createItemWithEachStatus() throws Exception {
        String[] statuses = {"AVAILABLE", "SOLD", "WITHDRAWN"};
        for (String st : statuses) {
            String item = """
                {
                    "name": "Status Test %s",
                    "price": 10.00,
                    "status": "%s"
                }
                """.formatted(st, st);

            mvc.perform(post("/sales/" + saleId + "/items")
                    .with(httpBasic("admin", "admin"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(item))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value(st));
        }
    }

    @Test
    void createMultipleItemsAndVerifyCount() throws Exception {
        for (int i = 1; i <= 5; i++) {
            String item = """
                {
                    "name": "Batch Item %d",
                    "price": %d.00,
                    "status": "AVAILABLE",
                    "category": "Batch"
                }
                """.formatted(i, i * 10);

            mvc.perform(post("/sales/" + saleId + "/items")
                    .with(httpBasic("admin", "admin"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(item))
                    .andExpect(status().isCreated());
        }

        mvc.perform(get("/sales/" + saleId + "/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(5))
                .andExpect(jsonPath("$.content.length()").value(5));
    }

    @Test
    void createItemThenUpdateStatusToSold() throws Exception {
        MvcResult result = mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "name": "Selling This",
                        "price": 75.00,
                        "status": "AVAILABLE"
                    }
                    """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("AVAILABLE"))
                .andReturn();

        Integer itemId = mapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();

        mvc.perform(put("/sales/" + saleId + "/items/" + itemId)
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "name": "Selling This",
                        "price": 75.00,
                        "status": "SOLD"
                    }
                    """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SOLD"));

        // Verify it shows up under SOLD filter
        mvc.perform(get("/sales/" + saleId + "/items").param("status", "SOLD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.name == 'Selling This')]").exists());
    }

    @Test
    void createItemOnNonexistentSaleReturns404() throws Exception {
        mvc.perform(post("/sales/99999/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(itemJson()))
                .andExpect(status().isNotFound());
    }

    @Test
    void saleSummaryReflectsAddedItems() throws Exception {
        // Add 3 items: 2 available, 1 sold
        mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "name": "Chair", "price": 100.00, "status": "AVAILABLE" }
                    """))
                .andExpect(status().isCreated());

        mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "name": "Table", "price": 200.00, "status": "AVAILABLE" }
                    """))
                .andExpect(status().isCreated());

        mvc.perform(post("/sales/" + saleId + "/items")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    { "name": "Lamp", "price": 50.00, "status": "SOLD" }
                    """))
                .andExpect(status().isCreated());

        // Verify summary
        mvc.perform(get("/sales/" + saleId + "/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(3))
                .andExpect(jsonPath("$.totalValue").value(350.00))
                .andExpect(jsonPath("$.soldItems").value(1))
                .andExpect(jsonPath("$.soldValue").value(50.00))
                .andExpect(jsonPath("$.availableItems").value(2))
                .andExpect(jsonPath("$.withdrawnItems").value(0));
    }
}
