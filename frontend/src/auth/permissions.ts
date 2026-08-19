export const PERMISSIONS = {
  CLIENT_VIEW: "client.view",
  CLIENT_CREATE: "client.create",
  CLIENT_UPDATE: "client.update",
  CLIENT_DELETE: "client.delete",

  TRANSACTION_VIEW: "transaction.view",
  TRANSACTION_CREATE: "transaction.create",
  TRANSACTION_UPDATE: "transaction.update",
  TRANSACTION_DELETE: "transaction.delete",

  MEMBER_VIEW: "member.view",
  MEMBER_INVITE: "member.invite",
  MEMBER_UPDATE: "member.update",
  MEMBER_REMOVE: "member.remove",

  AUDIT_VIEW: "audit.view",
} as const;


export type Permission =
  typeof PERMISSIONS[
    keyof typeof PERMISSIONS
  ];
