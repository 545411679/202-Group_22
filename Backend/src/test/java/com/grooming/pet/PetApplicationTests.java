package com.grooming.pet;

import com.grooming.pet.config.DataInitializer;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class PetApplicationTests {

    private DataInitializer dataInitializer;

    @Test
    void contextLoads() {
    }
}

