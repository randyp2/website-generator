package com.webgen.webgen_backend.verification.service.ai;

import com.webgen.webgen_backend.verification.dto.job.AssetVerificationResultDTO;
import com.webgen.webgen_backend.verification.service.job.AssetVerificationMessage;
import org.springframework.stereotype.Service;

@Service
public class AIVerificationServiceImpl implements AIVerificationService{

    @Override
    public AssetVerificationResultDTO verify(AssetVerificationMessage message) {
        return null;
    }
}
