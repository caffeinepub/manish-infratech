import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LineItem {
    srNo: bigint;
    hsnCode: string;
    productName: string;
    amount: number;
    itemGst: number;
}
export interface UserProfile {
    name: string;
}
export interface Bill {
    lineItems: Array<LineItem>;
    finalAmount: number;
    cgst: number;
    sgst: number;
    totalGst: number;
    invoiceNumber: string;
    baseAmount: number;
    partyName: string;
    roundOff: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBill(partyName: string, invoiceNumber: string, lineItems: Array<LineItem>): Promise<Bill>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAggregate(): Promise<{
        totalGst: number;
        totalAmount: number;
    }>;
    getAllBills(): Promise<Array<Bill>>;
    getBill(invoiceNumber: string): Promise<Bill>;
    getBillsByParty(partyName: string): Promise<Array<Bill>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
