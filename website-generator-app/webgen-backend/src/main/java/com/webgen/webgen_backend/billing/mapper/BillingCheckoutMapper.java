package com.webgen.webgen_backend.billing.mapper;

import com.stripe.model.checkout.Session;
import com.webgen.webgen_backend.billing.dto.CreateCheckoutSessionResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BillingCheckoutMapper {

    @Mapping(target = "sessionId", source = "id")
    @Mapping(target = "checkoutUrl", source = "url")
    @Mapping(target = "mode", source = "mode")
    CreateCheckoutSessionResponseDTO toCreateCheckoutSessionResponse(Session session);
}
