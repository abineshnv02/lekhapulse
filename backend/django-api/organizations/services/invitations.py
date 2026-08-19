from datetime import timedelta

from django.db import IntegrityError, transaction as db_transaction
from django.utils import timezone

from accounts.models import User
from audit.models import AuditEvent
from audit.services.events import record_audit_event
from organizations.models import (
    Invitation,
    Membership,
    Organization,
)


INVITATION_LIFETIME_DAYS = 7


def create_invitation(
    organization: Organization,
    *,
    email: str,
    role: str,
    actor: User,
) -> Invitation:
    email = email.strip().lower()

    if not email:
        raise ValueError(
            "Email is required."
        )

    valid_roles = {
        Membership.Role.ADMIN,
        Membership.Role.ACCOUNTANT,
        Membership.Role.VIEWER,
    }

    if role not in valid_roles:
        raise ValueError(
            "Only Admin, Accountant, or Viewer "
            "roles can be invited."
        )

    existing_member = Membership.objects.filter(
        organization=organization,
        user__email=email,
    ).exists()

    if existing_member:
        raise ValueError(
            "This user is already a member of "
            "the organization."
        )

    expires_at = (
        timezone.now()
        + timedelta(
            days=INVITATION_LIFETIME_DAYS
        )
    )

    try:
        with db_transaction.atomic():

            invitation = Invitation.objects.create(
                organization=organization,
                email=email,
                role=role,
                expires_at=expires_at,
            )

            record_audit_event(
                organization=organization,
                actor=actor,
                action=AuditEvent.Action.MEMBER_INVITED,
                target_type="Invitation",
                target_id=str(invitation.id),
                metadata={
                    "email": invitation.email,
                    "role": invitation.role,
                },
            )

    except IntegrityError as exc:
        raise ValueError(
            "A pending invitation already exists "
            "for this email."
        ) from exc

    return invitation


def get_invitation_by_token(
    token,
) -> Invitation:
    try:
        invitation = (
            Invitation.objects
            .select_related("organization")
            .get(token=token)
        )
    except Invitation.DoesNotExist:
        raise ValueError(
            "Invitation not found."
        )

    if invitation.accepted_at is not None:
        raise ValueError(
            "This invitation has already been accepted."
        )

    if invitation.expires_at <= timezone.now():
        raise ValueError(
            "This invitation has expired."
        )

    return invitation


def accept_invitation(
    *,
    token,
    password: str,
) -> tuple[User, Membership]:
    if not password:
        raise ValueError(
            "Password is required."
        )

    invitation = get_invitation_by_token(
        token,
    )

    email = invitation.email.strip().lower()

    with db_transaction.atomic():

        user = User.objects.filter(
            email=email,
        ).first()

        if user is None:
            user = User.objects.create_user(
                email=email,
                password=password,
            )

        else:
            # Existing account is allowed to accept
            # the invitation without changing its
            # existing password.
            #
            # The invitation grants access to the
            # organization through a new membership.
            if not user.is_active:
                user.is_active = True

                user.save(
                    update_fields=[
                        "is_active",
                    ],
                )

        membership, created = (
            Membership.objects.get_or_create(
                user=user,
                organization=invitation.organization,
                defaults={
                    "role": invitation.role,
                },
            )
        )

        if not created:
            raise ValueError(
                "This user is already a member "
                "of the organization."
            )

        invitation.accepted_at = timezone.now()

        invitation.save(
            update_fields=[
                "accepted_at",
                "updated_at",
            ],
        )

        record_audit_event(
            organization=invitation.organization,
            actor=user,
            action=AuditEvent.Action.INVITATION_ACCEPTED,
            target_type="Invitation",
            target_id=str(invitation.id),
            metadata={
                "email": user.email,
                "role": membership.role,
            },
        )

    return user, membership
