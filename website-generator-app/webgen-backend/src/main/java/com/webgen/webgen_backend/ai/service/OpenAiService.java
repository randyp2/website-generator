package com.webgen.webgen_backend.ai.service;

import com.webgen.webgen_backend.resume.model.FormData;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;


public interface OpenAiService {


    /**
     *  Given formData format it into json and call openAi API to generate portfolio
     * @param formData - Contains user's information regarding portfolio website
     * @return string -  html/css code
     */
    String generateHTMLCSSFromAi(FormData formData);
}
