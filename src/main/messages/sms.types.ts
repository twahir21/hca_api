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