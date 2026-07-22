package com.webgen.webgen_backend.auth.service;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import static org.assertj.core.api.Assertions.assertThat;

class JWTServiceTest {

    @Test
    void rejectsMalformedTokenWithoutJwtDebugLogging() {
        Logger logger = (Logger) LoggerFactory.getLogger(JWTService.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);

        boolean valid;
        try {
            valid = new JWTService("http://localhost").isValid("not-a-jwt");
        } finally {
            logger.detachAppender(appender);
        }

        assertThat(valid).isFalse();
        assertThat(appender.list)
                .extracting(ILoggingEvent::getFormattedMessage)
                .noneMatch(message -> message.contains("[JWT-DEBUG]"));
    }
}
