"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

const createDashboardQueryClient = (): QueryClient =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                refetchOnWindowFocus: false,
                retry: 1,
            },
        },
    });

const DashboardQueryProvider = ({ children }: { children: ReactNode }) => {
    const [queryClient] = useState(createDashboardQueryClient);

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

export default DashboardQueryProvider;
