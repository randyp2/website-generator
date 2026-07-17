package com.webgen.webgen_backend.billing.entity.converter;

import com.webgen.webgen_backend.billing.model.CreditBucket;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Persists credit buckets using their stable lowercase database values.
 */
@Converter
public class CreditBucketConverter implements AttributeConverter<CreditBucket, String> {

    @Override
    public String convertToDatabaseColumn(CreditBucket attribute) {
        return attribute != null ? attribute.databaseValue() : null;
    }

    @Override
    public CreditBucket convertToEntityAttribute(String databaseValue) {
        return databaseValue != null ? CreditBucket.fromDatabaseValue(databaseValue) : null;
    }
}
