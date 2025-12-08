interface FoundationPromptInputs {
    companyName: string;
    geography: string;
    focusAreas?: string[];
    userFiles?: Array<{
        name: string;
        type: string;
    }>;
}
export declare function buildFoundationPrompt(inputs: FoundationPromptInputs): string;
export {};
//# sourceMappingURL=foundation-prompt.d.ts.map