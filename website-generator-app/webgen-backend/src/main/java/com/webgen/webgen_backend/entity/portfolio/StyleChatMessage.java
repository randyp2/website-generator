package com.webgen.webgen_backend.entity.portfolio;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StyleChatMessage {
    private String id;
    private String role;
    private String content;
    private String timestamp;
}
