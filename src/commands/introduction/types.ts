//-Path: "Choco-Developer-Bot/src/commands/introduction/types.ts"
import { IIntroduction } from "../../models/Introduction";

export interface Question {
    label: string;
    emoji: string;
    required: boolean;
    key: keyof IIntroduction;
}
