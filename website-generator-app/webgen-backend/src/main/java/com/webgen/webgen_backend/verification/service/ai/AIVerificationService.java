package com.webgen.webgen_backend.verification.service.ai;

import com.webgen.webgen_backend.verification.dto.job.AssetVerificationResultDTO;
import com.webgen.webgen_backend.verification.service.job.AssetVerificationMessage;

public interface AIVerificationService {

    AssetVerificationResultDTO verify(AssetVerificationMessage message);

}
