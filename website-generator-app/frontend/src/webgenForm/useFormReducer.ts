import { FormState, FormAction, initialState } from "./formType";

// Reducer
export const formReducer = (state: FormState, action: FormAction): FormState => {
    switch (action.type) {
      case 'UPDATE_FIELD':
        return { ...state, [action.field]: action.value };
      case 'NEXT_STEP':
        return { ...state, currentStep: Math.min(state.currentStep + 1, 4) };
      case 'PREV_STEP':
        return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };
      case 'RESET':
        return initialState;
      default:
        return state;
    }
  };