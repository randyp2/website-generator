"use client";

import { useMemo, type ReactNode } from "react";

import { UserContext } from "@/context/UserContext";
import {
    useProfileMeQuery,
    type ProfileMeResponse,
} from "@/hooks/useProfileMeQuery";
import {
    toDashboardUser,
    type DashboardAuthUserFallback,
} from "./dashboard-user";

interface DashboardProfileProviderProps {
    authUser: DashboardAuthUserFallback;
    children: ReactNode;
    initialProfile: ProfileMeResponse;
}

const DashboardProfileProvider = ({
    authUser,
    children,
    initialProfile,
}: DashboardProfileProviderProps) => {
    const profileQuery = useProfileMeQuery({ initialData: initialProfile });
    const currentProfile = profileQuery.data ?? initialProfile;
    const user = useMemo(
        () => toDashboardUser(currentProfile, authUser),
        [authUser, currentProfile],
    );
    const contextValue = useMemo(() => ({ user }), [user]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export default DashboardProfileProvider;
