"use client";

interface InsufficientCreditsModalProps {
    onClose: () => void;
    onAddCredits: () => void;
}

export const InsufficientCreditsModal = ({
    onClose,
    onAddCredits,
}: InsufficientCreditsModalProps) => (
    <div
        style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.72)",
            backdropFilter: "blur(3px)",
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
        }}
        onClick={onClose}
    >
        <div
            style={{
                width: "100%",
                maxWidth: "380px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backgroundColor: "#111317",
                padding: "20px",
                color: "#ffffff",
                boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)",
            }}
            onClick={(event) => event.stopPropagation()}
        >
            <h3
                style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 600,
                    lineHeight: 1.25,
                }}
            >
                Insufficient credits
            </h3>
            <p
                style={{
                    margin: "10px 0 0 0",
                    fontSize: "14px",
                    lineHeight: 1.45,
                    color: "rgba(255, 255, 255, 0.78)",
                }}
            >
                You need more credits to continue with style chat.
            </p>

            <div
                style={{
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    style={{
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                        backgroundColor: "transparent",
                        color: "rgba(255, 255, 255, 0.86)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "13px",
                        cursor: "pointer",
                    }}
                >
                    Close
                </button>
                <button
                    type="button"
                    onClick={onAddCredits}
                    style={{
                        border: "1px solid rgba(236, 164, 73, 0.9)",
                        backgroundColor: "rgba(236, 164, 73, 0.16)",
                        color: "#f4c06f",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Add credits
                </button>
            </div>
        </div>
    </div>
);
