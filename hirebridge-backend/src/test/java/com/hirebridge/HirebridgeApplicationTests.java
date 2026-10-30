package com.hirebridge;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.TestPropertySource;

/**
 * Application context smoke test.
 *
 * Uses MOCK web environment (Tomcat does not start) and an in-memory
 * H2 datasource so no live PostgreSQL connection is required.
 *
 * Admin credentials are supplied via Spring properties (app.admin.email /
 * app.admin.password).  AdminInitializer reads these through @Value so
 * they take effect even in the test context where System.getenv() would
 * return null.
 */
@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
@TestPropertySource(properties = {
        // H2 in-memory datasource
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        // Satisfy the mandatory DB_PASSWORD placeholder
        "DB_PASSWORD=test-placeholder",
        // Seed admin via Spring properties so AdminInitializer runs cleanly
        "app.admin.email=admin@test.local",
        "app.admin.password=TestAdmin@123!"
})
class HirebridgeApplicationTests {

    @Test
    void contextLoads() {
        // Verifies:
        //   1. Spring context wires without circular dependency errors
        //   2. AdminInitializer runs and creates the admin row in H2
        //   3. All beans (Security, JWT, JPA) start without exceptions
    }
}
