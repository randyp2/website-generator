package com.webgen.webgen_backend;

import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class ModelInspector {

    private final OpenAiChatModel openAiChatModel;

    @PostConstruct
    public void logModelInfo() {
        OpenAiChatOptions options = (OpenAiChatOptions) openAiChatModel.getDefaultOptions();
        if (options != null) {
            System.out.println("🚀 Model: " + options.getModel());
            System.out.println("🧮 Max tokens: " + options.getMaxTokens());
            System.out.println("🎯 Temperature: " + options.getTemperature());
            System.out.println("🎛️ Top P: " + options.getTopP());
        } else {
            System.out.println("⚠️ No default model options found — check your configuration.");
        }
    }

}
