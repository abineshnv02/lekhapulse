from django.test import TestCase

from core.tests.factories import (
    add_membership,
    create_organization,
    create_user,
)
from organizations.models import Membership


class AuditAuthorizationTests(TestCase):
    def setUp(self):
        self.owner = create_user(
            email="owner@test.local",
        )

        self.organization, _ = create_organization(
            name="Audit Organization",
            owner=self.owner,
        )

        self.accountant = create_user(
            email="accountant@test.local",
        )

        add_membership(
            user=self.accountant,
            organization=self.organization,
            role=Membership.Role.ACCOUNTANT,
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

    def test_owner_can_view_audit_events(self):
        token = self.authenticate(
            self.owner,
        )

        response = self.client.get(
            "/api/v1/audit/events",
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

    def test_accountant_cannot_view_audit_events(self):
        token = self.authenticate(
            self.accountant,
        )

        response = self.client.get(
            "/api/v1/audit/events",
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
            "You do not have permission to view audit events.",
        )
