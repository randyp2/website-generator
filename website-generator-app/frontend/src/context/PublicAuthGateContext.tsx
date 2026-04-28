"use client";

import type { User } from "@supabase/supabase-js";
import React, { createContext, useContext, useMemo } from "react";
import { useEffect, useState } from "react";

import { PublicAuthModal } from "@/components/auth/PublicAuthModal";
import { createClient } from "@/utils/supabase/client";

export type AuthModalReason = "general" | "pricing" | "engagement" | "comment";

type PublicAuthGateContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    isAuthReady: boolean;
    openAuthModal: (reason?: AuthModalReason) => void;
    closeAuthModal: () => void;
    requireAuth: (reason?: AuthModalReason) => boolean;
};

const PublicAuthGateContext = createContext<PublicAuthGateContextValue | null>(
    null,
);

export const PublicAuthGateProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
    const [authModalReason, setAuthModalReason] =
        useState<AuthModalReason>("general");
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const initUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setUser(session?.user ?? null);
            setIsAuthReady(true);
        };

        void initUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsAuthReady(true);
            if (session?.user) {
                setIsAuthModalOpen(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const openAuthModal = (reason: AuthModalReason = "general") => {
        setAuthModalReason(reason);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    const requireAuth = (reason: AuthModalReason = "general"): boolean => {
        if (!isAuthReady) {
            return false;
        }
        if (user) {
            return true;
        }
        openAuthModal(reason);
        return false;
    };

    return (
        <PublicAuthGateContext.Provider
            value={{
                user,
                isAuthenticated: Boolean(user),
                isAuthReady,
                openAuthModal,
                closeAuthModal,
                requireAuth,
            }}
        >
            {children}
            <PublicAuthModal
                open={isAuthModalOpen}
                reason={authModalReason}
                onOpenChange={setIsAuthModalOpen}
            />
        </PublicAuthGateContext.Provider>
    );
};

export const usePublicAuthGate = (): PublicAuthGateContextValue => {
    const context = useContext(PublicAuthGateContext);

    if (!context) {
        throw new Error(
            "usePublicAuthGate must be used inside PublicAuthGateProvider",
        );
    }

    return context;
};
