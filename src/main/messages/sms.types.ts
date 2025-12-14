type SmsStatus = {
  code: string;       // e.g. "DELIVERED", "FAILED", "INVALID_NUMBER"
  description: string; // human-readable message
};

type SmsMessageSuccess = {
  to: string;
  status: SmsStatus;
  messageId: number;
  smsCount: number;   // > 0
  message: string;
  sendReference: number;
};

type SmsMessageFailure = {
  to: string;
  status: SmsStatus;
  smsCount: 0;        // always 0
  sendReference: number;
  sort?: number;      // sometimes present
};

export type SmsResult = {
  messages: (SmsMessageSuccess | SmsMessageFailure)[];
};

export function isSmsSuccess(msg: SmsMessageSuccess | SmsMessageFailure): msg is SmsMessageSuccess {
  return "messageId" in msg && msg.smsCount > 0;
}

export type sendSMS = {
    file?: {
        name: string;
        phone: string;
    }[] | undefined;
    phone?: number | undefined;
    contactSelection?: {
        selectAll: boolean;
        selected: {
            [x: string]: boolean;
        };
    } | undefined;
    type: "contact" | "group" | "upload";
    message: string;
        selectedGrp?: {
        groupName: string;
        totalContacts: number;
        groupId: string;
        contacts: {
          contactName: string;
          contactPhone: string;
        }[];
    } | undefined;
}

export type massiveContact = {
    name: string;
    phone: string;
}[];

export type createGroup = {
    groupName: string; 
    contacts: string [];
}

export type GroupedResult = {
  groupName: string;
  totalContacts: number;
  contacts: {
    contactName: string;
    contactPhone: string;
  }[];
};

export type editGroup = {
  groupName: string;
  contacts: string [];
  groupId: string;
}

type mainReturn = {
  success: boolean;
  message: string;
} 

export interface recentSMS extends mainReturn {
  data: {
    id: string;
    message: string;
    groupName: string;
    createdAt: Date;
  }[],
  totalSMS: number
}

export interface smsAnalytics extends mainReturn {
  data: { 
    smsToday: number; 
    totalGroups: number;
    totalContacts: number;
  }
}