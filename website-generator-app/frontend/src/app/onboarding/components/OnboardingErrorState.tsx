import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import OnboardingShell from "./OnboardingShell";

type OnboardingErrorStateProps = {
    message: string;
    onRetry: () => void;
};

const OnboardingErrorState = ({
    message,
    onRetry,
}: OnboardingErrorStateProps) => (
    <OnboardingShell containerClassName="flex items-center justify-center px-4">
        <Card className="relative w-full max-w-lg border-border/80 bg-card/95">
            <CardHeader>
                <CardTitle className="text-2xl">Unable to start onboarding</CardTitle>
                <CardDescription>{message}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={onRetry}>Try again</Button>
            </CardContent>
        </Card>
    </OnboardingShell>
);

export default OnboardingErrorState;
