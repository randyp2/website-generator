package com.webgen.webgen_backend.billing.mapper;

import com.webgen.webgen_backend.billing.dto.BillingInvoiceDTO;
import com.webgen.webgen_backend.billing.entity.BillingInvoice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BillingInvoiceMapper {

    @Mapping(target = "invoiceId", source = "stripeInvoiceId")
    BillingInvoiceDTO toDto(BillingInvoice entity);

    List<BillingInvoiceDTO> toDtos(List<BillingInvoice> entities);
}
