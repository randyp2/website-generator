"use client";

import { type ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { clearDeletedAccountSession } from "@/lib/logout-client";

const DELETE_CONFIRMATION = "DELETE";

interface AccountDeletionResponse {
    stage?: string;
    accountDeleted?: boolean;
}

interface ErrorResponse {
    error?: string;
    detail?: string;
    message?: string;
}

const readErrorMessage = async (response: Response): Promise<string> => {
    const body = (await response.json().catch(() => null)) as
        | ErrorResponse
        | null;
    return (
        body?.detail ??
        body?.error ??
        body?.message ??
        "Unable to delete your account. Please try again."
    );
};

/** Confirms and permanently deletes the current account. */
export const DeleteAccountDialog = () => {
    const router = useRouter();
    const { addToast } = useToast();
    const [open, setOpen] = useState<boolean>(false);
    const [confirmation, setConfirmation] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handleOpenChange = (nextOpen: boolean): void => {
        if (isDeleting) {
            return;
        }

        setOpen(nextOpen);
        if (!nextOpen) {
            setConfirmation("");
        }
    };

    const handleConfirmationChange = (
        event: ChangeEvent<HTMLInputElement>,
    ): void => {
        setConfirmation(event.target.value);
    };

    const deleteAccount = async (): Promise<void> => {
        if (confirmation !== DELETE_CONFIRMATION || isDeleting) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch("/api/account", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirmation: DELETE_CONFIRMATION }),
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response));
            }

            const result = (await response.json()) as AccountDeletionResponse;
            if (!result.accountDeleted || result.stage !== "COMPLETED") {
                throw new Error(
                    "Account deletion did not finish. Please try again.",
                );
            }

            await clearDeletedAccountSession();
            router.replace("/");
            router.refresh();
        } catch (error) {
            addToast({
                type: "error",
                title: "Account deletion failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Unable to delete your account. Please try again.",
            });
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="destructive"
                    className="gap-1.5 hover:cursor-pointer"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete account
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete your account?</DialogTitle>
                    <DialogDescription>
                        This permanently removes your account, portfolios,
                        uploads, and subscription. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <label
                        htmlFor="account-deletion-confirmation"
                        className="text-sm font-medium"
                    >
                        Type <span className="font-mono">DELETE</span> to
                        confirm
                    </label>
                    <Input
                        id="account-deletion-confirmation"
                        value={confirmation}
                        onChange={handleConfirmationChange}
                        disabled={isDeleting}
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isDeleting}
                        className="hover:cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={deleteAccount}
                        disabled={
                            confirmation !== DELETE_CONFIRMATION || isDeleting
                        }
                        className="hover:cursor-pointer"
                    >
                        {isDeleting ? "Deleting account..." : "Delete forever"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
