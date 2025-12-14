import { boolean } from "drizzle-orm/gel-core";
import { t } from "elysia";
type validErr = {
    success: boolean;
    message: string;
}

interface fileValidErr extends validErr {
    details: string
}

export const smsValidation = {
    verifyExcel: t.Object({
        file: t.File({
            error(): fileValidErr {
                return {
                    success: false,
                    message: "No file uploaded",
                    details: "Make sure file is uploaded."
                }
            }
        })
    }),
    contactPost: t.Object({
        name: t.String({
            minLength: 2,
            maxLength: 40,
            error(): validErr {
                return {
                    success: false, 
                    message: 'Name must be between 2-40 characters'
                }
            }
        }),
        phone: t.String({
            minLength: 12,
            maxLength: 12,
            error(): validErr {
                return {
                    success: false, 
                    message: 'Phone must be valid starts with 255'
                }
            }            
        })
    }),

    sendSMS: t.Object({
        message: t.String({
            minLength: 2,
            maxLength: 160,
            error(): validErr {
                return {
                    success: false,
                    message: "Message must be between 2-160 characters"
                }
            }
        }),
        type: t.Enum({
            contact: "contact",
            group: "group",
            upload: "upload"
        }),
        // optional data to be accepted
        file: t.Optional(
            t.Array(
                t.Object({
                name: t.String({
                    minLength: 2,
                    maxLength: 40,
                    error(): validErr {
                        return {
                            success: false,
                            message: "Name must be between 2-40 characters"
                        }
                    }
                }),
                phone: t.String({
                    minLength: 12,
                    maxLength: 12,
                    error(): validErr {
                        return {
                            success: false,
                            message: "Phone must be valid and starts with 255"
                        }
                    }
                })
                })
            )
        ),
        phone: t.Optional(
            // phone can be empty
            t.Number()
        ),
        contactSelection: t.Optional(
            t.Object({
                selectAll: t.Boolean(),
                selected: t.Record(t.String(), t.Boolean())
            })
        ),
        selectedGrp: t.Optional(
            t.Object({
                groupName: t.String({ 
                    minLength: 2,
                    maxLength: 40,
                    error(): validErr {
                        return {
                            success: false,
                            message: "Group name must be between 2-40 characters"
                        }
                    }
                }),
                totalContacts: t.Number(),
                groupId: t.String({
                    format: "uuid",
                    error(): validErr {
                        return {
                            success: false,
                            message: "Group id must be valid"
                        }
                    }
                    
                }),
                contacts: t.Array(
                    t.Object({
                        contactName: t.String(),
                        contactPhone: t.String()
                    })
                )
            })
        )     
    }),
    
    massiveContact: t.Array(
    t.Object({
        name: t.String({
            minLength: 2,
            maxLength: 40,
            error(): validErr {
                return {
                    success: false,
                    message: "Name must be between 2-40 characters"
                }
            }
        }),
        phone: t.String({
            minLength: 12,
            maxLength: 12,
            error(): validErr {
                return {
                    success: false,
                    message: "Phone must be valid and starts with 255"
                }
            }
        })
    })
    ),
    contactUpdate: t.Object({
        id: t.String(),
        name: t.String({
            minLength: 2,
            maxLength: 40,
            error(): validErr {
                return {
                    success: false, 
                    message: 'Name must be between 2-40 characters'
                }
            }
        }),
        phone: t.String({
            minLength: 12,
            maxLength: 12,
            error(): validErr {
                return {
                    success: false, 
                    message: 'Phone must be valid starts with 255'
                }
            }            
        })
    }),
    deleteContact: t.Object({
        id: t.String({
            format: "uuid",
            error (): validErr {
                return {
                    success: false,
                    message: "Contact ID must be a valid UUID"
                }
            }
        })
    }),
    createGroup: t.Object({
        groupName: t.String({
            minLength: 2,
            maxLength: 40,
            error(): validErr {
                return {
                    success: false, 
                    message: 'Name must be between 2-40 characters'
                }
            }
        }),
        contacts: t.Array(
            t.String({
                format: "uuid",
                error: (): validErr => ({
                    success: false,
                    message: "Each contact must be a valid UUID",
                }),
            }),
            {
                minItems: 1,
                error: (): validErr => ({
                    success: false,
                    message: "At least one contact must be selected",
                }),
            }
        ),
    }),
    deleteGroup: t.Object({
        id: t.String({
            format: "uuid",
            error (): validErr {
                return {
                    success: false,
                    message: "Group ID must be a valid UUID"
                }
            }
        })
    }),
    editGroup: t.Object({
        groupName: t.String(),
        contacts: t.Array(
            t.String({
                format: "uuid",
                error: (): validErr => ({
                    success: false,
                    message: "Each contact must be a valid UUID",
                }),
            }),
            {
                minItems: 1,
                error: (): validErr => ({
                    success: false,
                    message: "At least one contact must be selected",
                }),
            }
        ),
        groupId: t.String({
            format: "uuid",
            error (): validErr {
                return {
                    success: false,
                    message: "Group ID must be a valid UUID"
                }
            }
        })
    })

}