type NextSMS = {
    messages: {
      to: string, // phone number
      status: {
        groupId: 1 | 3 | 5,
        groupName: "REJECTED" | "DELIVERED" | "PENDING",
        id: number,
        name: string,
        description: string, // human readable
      },
      sendReference: number,
      smsCount: number,
      sort: number,
    }[]
}