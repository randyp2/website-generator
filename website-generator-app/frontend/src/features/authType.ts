// Define shape/types for the auth reducer hook 
export interface AuthFormState {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    rememberMe: boolean;
    agreedToTerms: boolean;
}

export type AuthFormAction =
    | { type: "SET_FIELD"; field: keyof AuthFormState; payload: string | boolean }
    | { type: "RESET" }
    | { type: "TOGGLE_REMEMBER_ME" }
    | { type: "TOGGLE_TERMS" };

export type AuthMode = "login" | "register";