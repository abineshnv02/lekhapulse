from django.test import TestCase

from core.tests.factories import (
    create_organization,
    create_user,
)


class OwnerProtectionTests(TestCase):
    def setUp(self):
        self.owner = create_user(
            email="owner@test.local",
        )

        self.organization, self.owner_membership = (
            create_organization(
                name="Owner Protection Organization",
                owner=self.owner,
            )
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

    def test_owner_role_cannot_be_changed(self):
        token = self.authenticate(
            self.owner,
        )

        response = self.client.patch(
            f"/api/v1/team/members/"
            f"{self.owner_membership.id}",
            data={
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
            409,
        )

        self.assertEqual(
            response.json()["detail"],
            "The organization owner cannot "
            "have their role changed.",
        )

    def test_owner_cannot_be_removed(self):
        token = self.authenticate(
            self.owner,
        )

        response = self.client.delete(
            f"/api/v1/team/members/"
            f"{self.owner_membership.id}",
            HTTP_AUTHORIZATION=(
                f"Bearer {token}"
            ),
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            409,
        )

        self.assertEqual(
            response.json()["detail"],
            "The organization owner cannot "
            "be removed.",
        )
