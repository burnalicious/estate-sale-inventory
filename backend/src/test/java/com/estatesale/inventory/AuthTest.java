package com.estatesale.inventory;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthTest {

    @Autowired
    private MockMvc mvc;

    private String saleJson() {
        return """
            {
                "name": "Auth Test Sale",
                "address1": "100 Test Blvd",
                "city": "Austin",
                "state": "TX",
                "zipCode": "78701",
                "saleDate": "2026-08-01",
                "status": "UPCOMING"
            }
            """;
    }

    @Test
    void getRequestsArePublic() throws Exception {
        mvc.perform(get("/sales"))
                .andExpect(status().isOk());
    }

    @Test
    void postWithoutAuthReturns401() throws Exception {
        mvc.perform(post("/sales")
                .contentType(MediaType.APPLICATION_JSON)
                .content(saleJson()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void putWithoutAuthReturns401() throws Exception {
        mvc.perform(put("/sales/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(saleJson()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteWithoutAuthReturns401() throws Exception {
        mvc.perform(delete("/sales/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void postWithAuthSucceeds() throws Exception {
        mvc.perform(post("/sales")
                .with(httpBasic("admin", "admin"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(saleJson()))
                .andExpect(status().isCreated());
    }

    @Test
    void wrongCredentialsReturns401() throws Exception {
        mvc.perform(post("/sales")
                .with(httpBasic("admin", "wrongpassword"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(saleJson()))
                .andExpect(status().isUnauthorized());
    }
}
