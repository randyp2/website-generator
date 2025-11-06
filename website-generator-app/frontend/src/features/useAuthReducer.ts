import type { AuthFormState, AuthFormAction } from "./authType";


export const initialAuthFormState: AuthFormState = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
    agreedToTerms: false,
};

export const authFormReducer = (
    state: AuthFormState, 
    action: AuthFormAction
): AuthFormState => {
    switch(action.type) {
        case "SET_FIELD":
            return { ...state, [action.field]: action.payload };
        
        case "TOGGLE_REMEMBER_ME":
            return { ...state, rememberMe: !state.rememberMe };
        
        case "TOGGLE_TERMS":
            return { ...state, agreedToTerms: !state.agreedToTerms };
        
        case "RESET":
            return initialAuthFormState;
        
        default: 
            return state;
    }
};