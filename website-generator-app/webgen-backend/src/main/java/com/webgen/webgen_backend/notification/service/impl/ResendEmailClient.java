package com.webgen.webgen_backend.notification.service.impl;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.springframework.stereotype.Component;

@Component
public class ResendEmailClient {

    public CreateEmailResponse send(String apiKey, CreateEmailOptions options) throws ResendException {
        return new Resend(apiKey).emails().send(options);
    }
}
