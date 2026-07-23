package com.webgen.webgen_backend.portfolio.service;

import com.webgen.webgen_backend.portfolio.service.builder.BuilderServiceImpl;
import com.webgen.webgen_backend.portfolio.service.planner.PlannerServiceImpl;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;

class RefinementModelRoutingTest {

    @Test
    void reusesPortfolioGenerationModelsForPlanningAndSectionWork() throws Exception {
        assertResourceName(
                PlannerServiceImpl.class,
                "blueprintModel",
                "portfolioBlueprintModel"
        );
        assertResourceName(
                BuilderServiceImpl.class,
                "sectionModel",
                "portfolioSectionModel"
        );
        assertResourceName(
                BuilderServiceImpl.class,
                "sectionRepairModel",
                "portfolioSectionRepairModel"
        );
    }

    private void assertResourceName(
            Class<?> serviceType,
            String fieldName,
            String expectedResourceName
    ) throws Exception {
        Field field = serviceType.getDeclaredField(fieldName);
        Resource resource = field.getAnnotation(Resource.class);

        assertThat(resource)
                .as("%s.%s should declare a model resource", serviceType.getSimpleName(), fieldName)
                .isNotNull();
        assertThat(resource.name()).isEqualTo(expectedResourceName);
    }
}
