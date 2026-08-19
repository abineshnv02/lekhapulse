from django.test import TestCase

from clients.models import Client
from core.tests.factories import (
    add_membership,
    create_organization,
    create_user,
)
from organizations.models import Membership


class ClientAPITests(TestCase):
    def setUp(self):
        self.owner = create_user(
            email="owner@test.local",
        )

        self.organization, _ = create_organization(
            name="Client Test Organization",
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

        self.viewer = create_user(
            email="viewer@test.local",
        )

        add_membership(
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

    def create_client(
        self,
        token,
        *,
        name="Test Client",
        email="client@test.local",
        phone="9999999999",
    ):
        return self.client.post(
            "/api/v1/clients/",
            data={
                "name": name,
                "email": email,
                "phone": phone,
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

    def test_owner_can_create_client(self):
        token = self.authenticate(
            self.owner,
        )

        response = self.create_client(
            token,
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.json()["name"],
            "Test Client",
        )

        self.assertTrue(
            Client.objects.filter(
                id=response.json()["id"],
                organization=self.organization,
                is_deleted=False,
            ).exists()
        )

    def test_accountant_can_create_client(self):
        token = self.authenticate(
            self.accountant,
        )

        response = self.create_client(
            token,
            name="Accountant Client",
            email="accountant-client@test.local",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.json()["name"],
            "Accountant Client",
        )

    def test_viewer_cannot_create_client(self):
        token = self.authenticate(
            self.viewer,
        )

        response = self.create_client(
            token,
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        self.assertEqual(
            response.json()["detail"],
            "You do not have permission to create clients.",
        )

    def test_accountant_can_update_client(self):
        client = Client.objects.create(
            organization=self.organization,
            name="Original Client",
            email="original@test.local",
            phone="1111111111",
        )

        token = self.authenticate(
            self.accountant,
        )

        response = self.client.patch(
            f"/api/v1/clients/{client.id}",
            data={
                "name": "Updated Client",
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        client.refresh_from_db()

        self.assertEqual(
            client.name,
            "Updated Client",
        )

    def test_viewer_cannot_update_client(self):
        client = Client.objects.create(
            organization=self.organization,
            name="Protected Client",
            email="protected@test.local",
        )

        token = self.authenticate(
            self.viewer,
        )

        response = self.client.patch(
            f"/api/v1/clients/{client.id}",
            data={
                "name": "Should Not Change",
            },
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        client.refresh_from_db()

        self.assertEqual(
            client.name,
            "Protected Client",
        )

    def test_owner_can_soft_delete_client(self):
        client = Client.objects.create(
            organization=self.organization,
            name="Delete Me",
            email="delete@test.local",
        )

        token = self.authenticate(
            self.owner,
        )

        response = self.client.delete(
            f"/api/v1/clients/{client.id}",
            HTTP_AUTHORIZATION=f"Bearer {token}",
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        client.refresh_from_db()

        self.assertTrue(
            client.is_deleted
        )

        self.assertIsNotNone(
            client.deleted_at
        )

    def test_viewer_cannot_delete_client(self):
        client = Client.objects.create(
            organization=self.organization,
            name="Protected Delete",
        )

        token = self.authenticate(
            self.viewer,
        )

        response = self.client.delete(
            f"/api/v1/clients/{client.id}",
            HTTP_AUTHORIZATION=f"Bearer {token}",
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            403,
        )

        client.refresh_from_db()

        self.assertFalse(
            client.is_deleted
        )

    def test_deleted_client_is_hidden_from_list(self):
        deleted_client = Client.objects.create(
            organization=self.organization,
            name="Deleted Client",
        )

        active_client = Client.objects.create(
            organization=self.organization,
            name="Active Client",
        )

        deleted_client.is_deleted = True
        deleted_client.save(
            update_fields=[
                "is_deleted",
            ]
        )

        token = self.authenticate(
            self.owner,
        )

        response = self.client.get(
            "/api/v1/clients/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        items = response.json()["items"]

        names = {
            item["name"]
            for item in items
        }

        self.assertIn(
            "Active Client",
            names,
        )

        self.assertNotIn(
            "Deleted Client",
            names,
        )

    def test_client_from_another_organization_is_not_accessible(self):
        other_owner = create_user(
            email="other-owner@test.local",
        )

        other_organization, _ = (
            create_organization(
                name="Other Organization",
                owner=other_owner,
            )
        )

        other_client = Client.objects.create(
            organization=other_organization,
            name="Other Tenant Client",
        )

        token = self.authenticate(
            self.owner,
        )

        response = self.client.get(
            f"/api/v1/clients/{other_client.id}",
            HTTP_AUTHORIZATION=f"Bearer {token}",
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            404,
        )
