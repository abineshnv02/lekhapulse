from enum import StrEnum

from organizations.models import Membership


class Permission(StrEnum):
    CLIENT_VIEW = "client.view"
    CLIENT_CREATE = "client.create"
    CLIENT_UPDATE = "client.update"
    CLIENT_DELETE = "client.delete"

    TRANSACTION_VIEW = "transaction.view"
    TRANSACTION_CREATE = "transaction.create"
    TRANSACTION_UPDATE = "transaction.update"
    TRANSACTION_DELETE = "transaction.delete"

    MEMBER_VIEW = "member.view"
    MEMBER_INVITE = "member.invite"
    MEMBER_UPDATE = "member.update"
    MEMBER_REMOVE = "member.remove"

    AUDIT_VIEW = "audit.view"


ROLE_PERMISSIONS = {
    Membership.Role.OWNER: {
        Permission.CLIENT_VIEW,
        Permission.CLIENT_CREATE,
        Permission.CLIENT_UPDATE,
        Permission.CLIENT_DELETE,

        Permission.TRANSACTION_VIEW,
        Permission.TRANSACTION_CREATE,
        Permission.TRANSACTION_UPDATE,
        Permission.TRANSACTION_DELETE,

        Permission.MEMBER_VIEW,
        Permission.MEMBER_INVITE,
        Permission.MEMBER_UPDATE,
        Permission.MEMBER_REMOVE,

        Permission.AUDIT_VIEW,
    },

    Membership.Role.ADMIN: {
        Permission.CLIENT_VIEW,
        Permission.CLIENT_CREATE,
        Permission.CLIENT_UPDATE,
        Permission.CLIENT_DELETE,

        Permission.TRANSACTION_VIEW,
        Permission.TRANSACTION_CREATE,
        Permission.TRANSACTION_UPDATE,
        Permission.TRANSACTION_DELETE,

        Permission.MEMBER_VIEW,
        Permission.MEMBER_INVITE,
        Permission.MEMBER_UPDATE,
        Permission.MEMBER_REMOVE,

        Permission.AUDIT_VIEW,
    },

    Membership.Role.ACCOUNTANT: {
        Permission.CLIENT_VIEW,
        Permission.CLIENT_CREATE,
        Permission.CLIENT_UPDATE,

        Permission.TRANSACTION_VIEW,
        Permission.TRANSACTION_CREATE,
        Permission.TRANSACTION_UPDATE,
    },

    Membership.Role.VIEWER: {
        Permission.CLIENT_VIEW,
        Permission.TRANSACTION_VIEW,
    },
}


def has_permission(
    membership: Membership,
    permission: Permission,
) -> bool:
    return permission in ROLE_PERMISSIONS.get(
        membership.role,
        set(),
    )


def can_view_client(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.CLIENT_VIEW,
    )


def can_create_client(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.CLIENT_CREATE,
    )


def can_update_client(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.CLIENT_UPDATE,
    )


def can_delete_client(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.CLIENT_DELETE,
    )


def can_view_transaction(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.TRANSACTION_VIEW,
    )


def can_create_transaction(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.TRANSACTION_CREATE,
    )


def can_update_transaction(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.TRANSACTION_UPDATE,
    )


def can_delete_transaction(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.TRANSACTION_DELETE,
    )


def can_view_member(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.MEMBER_VIEW,
    )


def can_invite_member(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.MEMBER_INVITE,
    )


def can_update_member(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.MEMBER_UPDATE,
    )


def can_remove_member(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.MEMBER_REMOVE,
    )


def can_view_audit(
    membership: Membership,
) -> bool:
    return has_permission(
        membership,
        Permission.AUDIT_VIEW,
    )
