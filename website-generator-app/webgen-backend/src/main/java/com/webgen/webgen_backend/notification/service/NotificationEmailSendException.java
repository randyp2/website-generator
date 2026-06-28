package com.webgen.webgen_backend.notification.service;

public class NotificationEmailSendException extends RuntimeException {

    public NotificationEmailSendException(String message, Throwable cause) {
        super(message, cause);
    }
}
