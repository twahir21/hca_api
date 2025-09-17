import { eq, or } from "drizzle-orm";
import { db } from "../../connections/drizzle.conn";
import { contactsTable } from "../../schema/sms.schema";

export const smsDatabase = {
    createContact: async ({ name, phone }: { name: string; phone: string }): Promise<{
        success: boolean;
        message: string;
    }> => {
        try {
            // 1. check if name or phone exixts
            const count = await db.select({
                name: contactsTable.name,
                phone: contactsTable.phone
            })
            .from(contactsTable)
            .where(or(
                eq(contactsTable.name, name),
                eq(contactsTable.phone, phone)
            ));

            if(count.length > 0){
                return {
                    success: false,
                    message: "Phone number or name is already taken."
                }
            }
            // 2. If pass, insert to database
            await db.insert(contactsTable).values({
                name, phone
            });

            return {
                success: true,
                message: "Contact registered successfully!"
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? 
                            error.message :
                            "Something went wrong in creating new Contact"
            }
        }
    }
}