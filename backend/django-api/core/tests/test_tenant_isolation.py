from django.test import TestCase

from core.tests.factories import (
    create_organization,
    create_user,
)


class TenantIsolationTests(TestCase):
    def setUp(self):
        self.owner_a = create_user(
            email="owner-a@test.local",
        )

        self.organization_a, _ = create_organization(
            name="Organization A",
            owner=self.owner_a,
        )

        self.owner_b = create_user(
            email="owner-b@test.local",
        )

        self.organization_b, _ = create_organization(
            name="Organization B",
            owner=self.owner_b,
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

    def test_user_cannot_access_another_organization(self):
        token = self.authenticate(
            self.owner_a,
        )

        response = self.client.get(
            "/api/v1/audit/events",
            HTTP_AUTHORIZATION=(
                f"Bearer {token}"
            ),
            HTTP_X_ORGANIZATION_ID=str(
                self.organization_b.id
            ),
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        self.assertEqual(
            response.json()["detail"],
            "You are not a member of this organization.",
        )
