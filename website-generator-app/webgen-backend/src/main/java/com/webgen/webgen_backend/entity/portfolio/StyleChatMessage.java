package com.webgen.webgen_backend.entity.portfolio;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StyleChatMessage {
    private String role;
    private String content;
}
