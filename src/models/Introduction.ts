//-Path: "Choco-Developer-Bot/src/models/Introduction.ts"
import { Document, Model, Schema, model, models } from "mongoose";

export interface IIntroduction {
    age?: string;
    name: string;
    works?: string;
    gender?: string;
    address?: string;
    hobbies?: string;
    birthday?: string;
    username: string;
    discordId: string;
    rawContent?: string;
    portfolio?: string;
    introducedAt: Date;
    additionalInfo?: string;
    displayType?: "list" | "raw";
}

export type IntroductionDocument = IIntroduction & Document;

/**
 * โครงสร้างข้อมูลการแนะนำตัวในฐานข้อมูล
 */
const IntroductionSchema = new Schema({
    age: { type: String },
    name: { type: String, required: true },
    works: { type: String },
    gender: { type: String },
    address: { type: String },
    hobbies: { type: String },
    birthday: { type: String },
    rawContent: { type: String },
    username: { type: String, required: true },
    displayType: { type: String, enum: ["list", "raw"] },
    discordId: { type: String, required: true, unique: true },
    portfolio: { type: String },
    additionalInfo: { type: String },
    introducedAt: { type: Date, default: Date.now },
});

const Introduction: Model<IntroductionDocument> =
    models.Introduction ||
    model<IntroductionDocument>("Introduction", IntroductionSchema);

export default Introduction;
