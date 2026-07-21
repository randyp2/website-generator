"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MailCheck, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const EMAIL_CONFIRMATION_NOTICE_EVENT =
    "portrn:email-confirmation-sent";
const EMAIL_CONFIRMATION_QUERY_VALUE = "confirmation-sent";

/** Shows the confirmation notice after a client-side email signup. */
export const notifyEmailConfirmationSent = (): void => {
    window.dispatchEvent(new Event(EMAIL_CONFIRMATION_NOTICE_EVENT));
};

/** Displays an email-confirmation banner independently of the toast stack. */
export const EmailConfirmationNotice = () => {
    const searchParams = useSearchParams();
    const [isClientNoticeVisible, setIsClientNoticeVisible] = useState(false);
    const [dismissedQuery, setDismissedQuery] = useState<string | null>(null);

    const queryKey =
        searchParams?.get("signup") === EMAIL_CONFIRMATION_QUERY_VALUE
            ? searchParams.toString()
            : null;
    const isQueryNoticeVisible =
        queryKey !== null && queryKey !== dismissedQuery;
    const isVisible = isClientNoticeVisible || isQueryNoticeVisible;

    useEffect(() => {
        const showNotice = () => setIsClientNoticeVisible(true);

        window.addEventListener(
            EMAIL_CONFIRMATION_NOTICE_EVENT,
            showNotice,
        );

        return () => {
            window.removeEventListener(
                EMAIL_CONFIRMATION_NOTICE_EVENT,
                showNotice,
            );
        };
    }, []);

    const dismiss = () => {
        setIsClientNoticeVisible(false);

        if (queryKey === null) {
            return;
        }

        setDismissedQuery(queryKey);

        const url = new URL(window.location.href);
        url.searchParams.delete("signup");
        window.history.replaceState(
            window.history.state,
            "",
            `${url.pathname}${url.search}${url.hash}`,
        );
    };

    return (
        <AnimatePresence>
            {isVisible ? (
                <motion.div
                    initial={{ opacity: 0, y: -24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="pointer-events-none fixed inset-x-0 top-3 z-[300] flex justify-center px-4 sm:top-5"
                >
                    <div
                        role="status"
                        aria-live="polite"
                        className="pointer-events-auto relative flex w-full max-w-xl items-start gap-3 overflow-hidden rounded-xl border border-[#cc7d23]/35 bg-background/95 px-4 py-3.5 pr-11 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.45)] backdrop-blur-md"
                    >
                        <span
                            aria-hidden="true"
                            className="absolute inset-x-0 top-0 h-0.5 bg-[#cc7d23]"
                        />
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#cc7d23]/12 text-[#cc7d23]">
                            <MailCheck className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                                Confirmation email sent
                            </p>
                            <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                                Check your inbox and follow the link to verify
                                your PortRN account.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={dismiss}
                            aria-label="Dismiss confirmation notice"
                            className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};
