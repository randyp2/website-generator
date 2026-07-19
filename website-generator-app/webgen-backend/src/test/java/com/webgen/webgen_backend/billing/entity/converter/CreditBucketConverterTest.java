package com.webgen.webgen_backend.billing.entity.converter;

import com.webgen.webgen_backend.billing.model.CreditBucket;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CreditBucketConverterTest {

    private final CreditBucketConverter converter = new CreditBucketConverter();

    @Test
    void convertsEveryBucketUsingItsStableDatabaseValue() {
        for (CreditBucket bucket : CreditBucket.values()) {
            String databaseValue = converter.convertToDatabaseColumn(bucket);

            assertThat(databaseValue).isEqualTo(bucket.databaseValue());
            assertThat(converter.convertToEntityAttribute(databaseValue)).isEqualTo(bucket);
        }
    }

    @Test
    void preservesNullValuesForJpaNullHandling() {
        assertThat(converter.convertToDatabaseColumn(null)).isNull();
        assertThat(converter.convertToEntityAttribute(null)).isNull();
    }

    @Test
    void rejectsUnknownPersistedBuckets() {
        assertThatThrownBy(() -> converter.convertToEntityAttribute("unknown"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Unsupported credit bucket: unknown");
    }
}
