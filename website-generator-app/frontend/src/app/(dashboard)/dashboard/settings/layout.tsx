import type { ReactNode } from "react";
import { SettingsTabsNav } from "./components/SettingsTabsNav";

interface SettingsLayoutProps {
    children: ReactNode;
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
    return (
        <div className="w-full space-y-8 px-4 py-8 md:px-6 lg:px-8">
            <header className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                    Settings
                </h1>
                <p className="text-sm text-muted-foreground">
                    Manage your profile, billing, and security preferences.
                </p>
            </header>
            <SettingsTabsNav />
            <main>{children}</main>
        </div>
    );
};

export default SettingsLayout;
