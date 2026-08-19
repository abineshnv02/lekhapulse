from uuid import UUID

from django.test import TestCase

from audit.models import AuditEvent
from core.tests.factories import (
    add_membership,
    create_organization,
    create_user,
)
from organizations.models import Invitation, Membership


class TeamAPITests(TestCase):
    def setUp(self):
        self.owner = create_user(
            email="owner@test.local",
        )

        self.organization, self.owner_membership = (
            create_organization(
                name="Team Test Organization",
                owner=self.owner,
            )
        )

        self.accountant = create_user(
            email="accountant@test.local",
        )

        self.accountant_membership = add_membership(
            user=self.accountant,
            organization=self.organization,
            role=Membership.Role.ACCOUNTANT,
        )

        self.viewer = create_user(
            email="viewer@test.local",
        )

        self.viewer_membership = add_membership(
            user=self.viewer,
            organization=self.organization,
            role=Membership.Role.VIEWER,
        )

    def authenticate(self, user):
        response = self.client.post(
            "/api/v1/auth/login",
            data={
                "email": user.email,
                "password": "TestPass123!",
            },
            content_type="application/json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        return response.json()["access_token"]

    def test_owner_can_list_team_members(self):
        token = self.authenticate(
            self.owner,
        )

        response = self.client.get(
            "/api/v1/team/members",
            HTTP_AUTHORIZATION=(
                f"Bearer {token}"
            ),
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.json()["count"],
            3,
        )

        emails = {
            item["email"]
            for item in response.json()["items"]
        }

        self.assertIn(
            "owner@test.local",
            emails,
        )

        self.assertIn(
            "accountant@test.local",
            emails,
        )

        self.assertIn(
            "viewer@test.local",
            emails,
        )

    def test_accountant_cannot_list_team_members(self):
        token = self.authenticate(
            self.accountant,
        )

        response = self.client.get(
            "/api/v1/team/members",
            HTTP_AUTHORIZATION=(
                f"Bearer {token}"
            ),
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        self.assertEqual(
            response.json()["detail"],
            "You do not have permission to view team members.",
        )

    def test_owner_can_invite_accountant(self):
        token = self.authenticate(
            self.owner,
        )

        response = self.client.post(
            "/api/v1/team/invitations",
            data={
                "email": "new-accountant@test.local",
                "role": "ACCOUNTANT",
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=(
                f"Bearer {token}"
            ),
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        body = response.json()

        self.assertEqual(
            body["email"],
            "new-accountant@test.local",
        )

        self.assertEqual(
            body["role"],
            "ACCOUNTANT",
        )

        self.assertTrue(
            body["invitation_url"].startswith(
                "http://localhost:5173/accept-invitation/"
            )
        )

        self.assertTrue(
            Invitation.objects.filter(
                id=body["id"],
                organization=self.organization,
                email="new-accountant@test.local",
                role=Membership.Role.ACCOUNTANT,
            ).exists()
        )

    def test_accountant_cannot_invite_member(self):
        token = self.authenticate(
            self.accountant,
        )

        response = self.client.post(
            "/api/v1/team/invitations",
            data={
                "email": "blocked@test.local",
                "role": "VIEWER",
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=(
                f"Bearer {token}"
            ),
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        self.assertEqual(
            response.json()["detail"],
            "You do not have permission to invite team members.",
        )

    def test_invitation_acceptance_creates_user_and_membership(self):
        token = self.authenticate(
            self.owner,
        )

        invite_response = self.client.post(
            "/api/v1/team/invitations",
            data={
                "email": "accept@test.local",
                "role": "ACCOUNTANT",
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=(
                f"Bearer {token}"
            ),
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            invite_response.status_code,
            200,
        )

        invitation_id = UUID(
            invite_response.json()["id"]
        )

        invitation = Invitation.objects.get(
            id=invitation_id,
        )

        accept_response = self.client.post(
            f"/api/v1/team/invitations/"
            f"{invitation.token}/accept",
            data={
                "password": "AcceptedPass123!",
            },
            content_type="application/json",
        )

        self.assertEqual(
            accept_response.status_code,
            200,
        )

        user_id = accept_response.json()["user_id"]

        membership = Membership.objects.get(
            user_id=user_id,
            organization=self.organization,
        )

        self.assertEqual(
            membership.role,
            Membership.Role.ACCOUNTANT,
        )

        invitation.refresh_from_db()

        self.assertIsNotNone(
            invitation.accepted_at,
        )

    def test_invitation_acceptance_creates_audit_event(self):
        token = self.authenticate(
            self.owner,
        )

        invite_response = self.client.post(
            "/api/v1/team/invitations",
            data={
                "email": "audit-accept@test.local",
                "role": "ACCOUNTANT",
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=(
                f"Bearer {token}"
            ),
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            invite_response.status_code,
            200,
        )

        invitation = Invitation.objects.get(
            id=invite_response.json()["id"],
        )

        accept_response = self.client.post(
            f"/api/v1/team/invitations/"
            f"{invitation.token}/accept",
            data={
                "password": "AcceptedPass123!",
            },
            content_type="application/json",
        )

        self.assertEqual(
            accept_response.status_code,
            200,
        )

        event = AuditEvent.objects.filter(
            action=AuditEvent.Action.INVITATION_ACCEPTED,
            target_id=str(invitation.id),
        ).first()

        self.assertIsNotNone(
            event,
        )

        self.assertEqual(
            event.actor.email,
            "audit-accept@test.local",
        )

        self.assertEqual(
            event.metadata["email"],
            "audit-accept@test.local",
        )

        self.assertEqual(
            event.metadata["role"],
            "ACCOUNTANT",
        )

    def test_owner_can_update_member_role(self):
        token = self.authenticate(
            self.owner,
        )

        response = self.client.patch(
            f"/api/v1/team/members/"
            f"{self.viewer_membership.id}",
            data={
                "role": "ACCOUNTANT",
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=(
                f"Bearer {token}"
            ),
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.viewer_membership.refresh_from_db()

        self.assertEqual(
            self.viewer_membership.role,
            Membership.Role.ACCOUNTANT,
        )

    def test_owner_can_remove_member_without_deleting_user(self):
        token = self.authenticate(
            self.owner,
        )

        user_id = self.viewer.id
        membership_id = self.viewer_membership.id

        response = self.client.delete(
            f"/api/v1/team/members/"
            f"{membership_id}",
            HTTP_AUTHORIZATION=(
                f"Bearer {token}"
            ),
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertFalse(
            Membership.objects.filter(
                id=membership_id,
            ).exists()
        )

        self.assertTrue(
            type(self.viewer).objects.filter(
                id=user_id,
            ).exists()
        )

    def test_accountant_cannot_remove_member(self):
        token = self.authenticate(
            self.accountant,
        )

        response = self.client.delete(
            f"/api/v1/team/members/"
            f"{self.viewer_membership.id}",
            HTTP_AUTHORIZATION=(
                f"Bearer {token}"
            ),
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        self.assertEqual(
            response.json()["detail"],
            "You do not have permission to remove team members.",
        )

        self.assertTrue(
            Membership.objects.filter(
                id=self.viewer_membership.id,
            ).exists()
        )
