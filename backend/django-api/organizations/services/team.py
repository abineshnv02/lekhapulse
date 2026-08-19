from django.db import transaction as db_transaction

from audit.models import AuditEvent
from audit.services.events import record_audit_event

from organizations.models import (
    Membership,
    Organization,
)


def update_member_role(
    *,
    organization: Organization,
    membership_id,
    new_role: str,
    actor: Membership,
) -> Membership:
    valid_roles = {
        Membership.Role.ADMIN,
        Membership.Role.ACCOUNTANT,
        Membership.Role.VIEWER,
    }

    if new_role not in valid_roles:
        raise ValueError(
            "A team member can only have the "
            "Admin, Accountant, or Viewer role."
        )

    with db_transaction.atomic():
        try:
            membership = (
                Membership.objects
                .select_for_update()
                .select_related(
                    "user",
                    "organization",
                )
                .get(
                    id=membership_id,
                    organization=organization,
                )
            )
        except Membership.DoesNotExist:
            raise ValueError(
                "Team member not found."
            )

        if membership.role == Membership.Role.OWNER:
            raise ValueError(
                "The organization owner cannot "
                "have their role changed."
            )

        old_role = membership.role

        membership.role = new_role

        membership.save(
            update_fields=[
                "role",
                "updated_at",
            ],
        )

        record_audit_event(
            organization=organization,
            actor=actor.user,
            action=AuditEvent.Action.MEMBER_ROLE_UPDATED,
            target_type="Membership",
            target_id=str(membership.id),
            metadata={
                "member_email": membership.user.email,
                "old_role": old_role,
                "new_role": new_role,
            },
        )

        return membership


def remove_member(
    *,
    organization: Organization,
    membership_id,
    actor_membership: Membership,
) -> None:
    with db_transaction.atomic():
        try:
            membership = (
                Membership.objects
                .select_for_update()
                .select_related(
                    "user",
                    "organization",
                )
                .get(
                    id=membership_id,
                    organization=organization,
                )
            )
        except Membership.DoesNotExist:
            raise ValueError(
                "Team member not found."
            )

        if membership.role == Membership.Role.OWNER:
            raise ValueError(
                "The organization owner cannot "
                "be removed."
            )

        if membership.id == actor_membership.id:
            raise ValueError(
                "You cannot remove your own "
                "organization membership."
            )

        removed_email = membership.user.email
        removed_role = membership.role
        removed_membership_id = str(
            membership.id
        )

        membership.delete()

        record_audit_event(
            organization=organization,
            actor=actor_membership.user,
            action=AuditEvent.Action.MEMBER_REMOVED,
            target_type="Membership",
            target_id=removed_membership_id,
            metadata={
                "member_email": removed_email,
                "role": removed_role,
            },
        )
