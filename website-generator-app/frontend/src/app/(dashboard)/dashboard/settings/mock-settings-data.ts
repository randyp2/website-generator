export interface SettingsProfileMock {
    fullName: string;
    username: string;
    email: string;
    bio: string;
    timezone: string;
    joinedDateLabel: string;
    publicProfilePath: string;
}

export interface SettingsSecuritySessionMock {
    id: string;
    deviceLabel: string;
    locationLabel: string;
    lastSeenLabel: string;
    current: boolean;
}

export interface SettingsSecurityMock {
    twoFactorEnabled: boolean;
    connectedAccounts: {
        github: boolean;
        google: boolean;
    };
    activeSessions: readonly SettingsSecuritySessionMock[];
}

export interface SettingsBillingInvoiceMock {
    id: string;
    description: string;
    amountLabel: string;
    statusLabel: "paid" | "failed" | "open";
    dateLabel: string;
}

export interface SettingsBillingMock {
    plan: {
        name: string;
        statusLabel: string;
        cadenceLabel: string;
        renewalLabel: string;
        monthlyCredits: number;
        manageEnabled: boolean;
    };
    credits: {
        balance: number;
        nextRefreshLabel: string;
    };
    invoices: readonly SettingsBillingInvoiceMock[];
}

export const SETTINGS_PROFILE_MOCK: SettingsProfileMock = {
    fullName: "John Doe",
    username: "johndoe",
    email: "johndoe@example.com",
    bio: "Product designer and frontend engineer building conversion-focused portfolio sites.",
    timezone: "America/Los_Angeles",
    joinedDateLabel: "Joined April 2026",
    publicProfilePath: "/johndoe",
};

export const SETTINGS_SECURITY_MOCK: SettingsSecurityMock = {
    twoFactorEnabled: false,
    connectedAccounts: {
        github: true,
        google: false,
    },
    activeSessions: [
        {
            id: "sess-current",
            deviceLabel: "MacBook Pro · Chrome",
            locationLabel: "San Francisco, CA",
            lastSeenLabel: "Active now",
            current: true,
        },
        {
            id: "sess-mobile",
            deviceLabel: "iPhone 15 · Safari",
            locationLabel: "San Francisco, CA",
            lastSeenLabel: "2 hours ago",
            current: false,
        },
    ],
};

export const SETTINGS_BILLING_MOCK: SettingsBillingMock = {
    plan: {
        name: "PortRN Pro",
        statusLabel: "Active",
        cadenceLabel: "Annual · $99 / year",
        renewalLabel: "Renews on June 15, 2026",
        monthlyCredits: 300,
        manageEnabled: false,
    },
    credits: {
        balance: 742,
        nextRefreshLabel: "Credits refresh on June 15, 2026",
    },
    invoices: [
        {
            id: "inv_2026_04",
            description: "Website Generator Pro Annual",
            amountLabel: "$99.00",
            statusLabel: "paid",
            dateLabel: "Apr 15, 2026",
        },
        {
            id: "inv_2026_03_pack",
            description: "Credit Pack · Medium (500)",
            amountLabel: "$15.00",
            statusLabel: "paid",
            dateLabel: "Mar 21, 2026",
        },
    ],
};
