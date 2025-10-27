// Types
export interface FormState {
    name: string;
    tagline: string;
    about: string;
    skills: string[];
    email: string;
    github: string;
    linkedin: string;
    customStyle: string;
    theme: string;
    customSectionTitle: string;
    customSectionContent: string;
    currentStep: number;
}



export type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof FormState; value: string | string[] }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };



// Initial State
export const initialState: FormState = {
    name: '',
    tagline: '',
    about: '',
    skills: [],
    email: '',
    github: '',
    linkedin: '',
    customStyle: '',
    theme: 'apple-dark',
    customSectionTitle: '',
    customSectionContent: '',
    currentStep: 0,
};