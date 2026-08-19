from datetime import date
from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase

from clients.models import Client
from core.tests.factories import (
    add_membership,
    create_organization,
    create_user,
)
from organizations.models import Membership
from transactions.models import Transaction


class TransactionAPITests(TestCase):
    def setUp(self):
        self.owner = create_user(
            email="owner@test.local",
        )

        self.organization, _ = create_organization(
            name="Transaction Test Organization",
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

        self.client_record = Client.objects.create(
            organization=self.organization,
            name="Transaction Test Client",
            email="client@test.local",
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

    def create_transaction_payload(
        self,
        *,
        source_transaction_id="TX-TEST-001",
        description="Cloud hosting",
        amount="10000.00",
    ):
        return {
            "client_id": str(
                self.client_record.id
            ),
            "transaction_date": "2026-08-17",
            "description": description,
            "amount": amount,
            "currency": "INR",
            "source": "manual",
            "source_transaction_id": (
                source_transaction_id
            ),
        }

    def test_owner_can_create_transaction(self):
        token = self.authenticate(
            self.owner,
        )

        with patch(
            "config.api.transactions.routes.process_transaction.delay",
        ) as mock_delay:

            response = self.client.post(
                "/api/v1/transactions/",
                data=self.create_transaction_payload(),
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

        self.assertEqual(
            response.json()["description"],
            "Cloud hosting",
        )

        self.assertEqual(
            response.json()["status"],
            Transaction.Status.PENDING,
        )

        mock_delay.assert_called_once_with(
            response.json()["id"],
        )

        self.assertTrue(
            Transaction.objects.filter(
                id=response.json()["id"],
                client=self.client_record,
            ).exists()
        )

    def test_accountant_can_create_transaction(self):
        token = self.authenticate(
            self.accountant,
        )

        with patch(
            "config.api.transactions.routes.process_transaction.delay",
        ):

            response = self.client.post(
                "/api/v1/transactions/",
                data=self.create_transaction_payload(
                    source_transaction_id="ACCOUNTANT-TX-001",
                ),
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

        self.assertEqual(
            response.json()["status"],
            Transaction.Status.PENDING,
        )

    def test_viewer_cannot_create_transaction(self):
        token = self.authenticate(
            self.viewer,
        )

        with patch(
            "config.api.transactions.routes.process_transaction.delay",
        ) as mock_delay:

            response = self.client.post(
                "/api/v1/transactions/",
                data=self.create_transaction_payload(),
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

        self.assertEqual(
            response.json()["detail"],
            "You do not have permission to create transactions.",
        )

        mock_delay.assert_not_called()

    def test_accountant_can_update_pending_transaction(self):
        transaction = Transaction.objects.create(
            client=self.client_record,
            transaction_date=date(2026, 8, 17),
            description="Original description",
            amount=Decimal("10000.0000"),
            currency="INR",
            source="manual",
            source_transaction_id="TX-UPDATE-001",
            status=Transaction.Status.PENDING,
        )

        token = self.authenticate(
            self.accountant,
        )

        with patch(
            "config.api.transactions.routes.process_transaction.delay",
        ) as mock_delay:

            response = self.client.patch(
                f"/api/v1/transactions/"
                f"{transaction.id}",
                data={
                    "description": "Updated description",
                    "amount": "10500.00",
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

        transaction.refresh_from_db()

        self.assertEqual(
            transaction.description,
            "Updated description",
        )

        self.assertEqual(
            transaction.amount,
            Decimal("10500.00"),
        )

        self.assertEqual(
            transaction.status,
            Transaction.Status.PENDING,
        )

        mock_delay.assert_called_once_with(
            str(transaction.id),
        )

    def test_viewer_cannot_update_transaction(self):
        transaction = Transaction.objects.create(
            client=self.client_record,
            transaction_date=date(2026, 8, 17),
            description="Protected transaction",
            amount=Decimal("5000.0000"),
            currency="INR",
            source="manual",
            source_transaction_id="TX-VIEWER-001",
        )

        token = self.authenticate(
            self.viewer,
        )

        with patch(
            "config.api.transactions.routes.process_transaction.delay",
        ) as mock_delay:

            response = self.client.patch(
                f"/api/v1/transactions/"
                f"{transaction.id}",
                data={
                    "description": "Should not change",
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

        transaction.refresh_from_db()

        self.assertEqual(
            transaction.description,
            "Protected transaction",
        )

        mock_delay.assert_not_called()

    def test_ai_suggested_transaction_can_be_confirmed(self):
        transaction = Transaction.objects.create(
            client=self.client_record,
            transaction_date=date(2026, 8, 17),
            description="AWS cloud hosting",
            amount=Decimal("15000.0000"),
            currency="INR",
            source="manual",
            source_transaction_id="TX-CONFIRM-001",
            status=Transaction.Status.AI_SUGGESTED,
            ai_category="Cloud Computing Expenses",
            ai_confidence=Decimal("0.9500"),
        )

        token = self.authenticate(
            self.owner,
        )

        response = self.client.post(
            f"/api/v1/transactions/"
            f"{transaction.id}/confirm",
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

        transaction.refresh_from_db()

        self.assertEqual(
            transaction.status,
            Transaction.Status.CONFIRMED,
        )

        self.assertEqual(
            transaction.confirmed_category,
            "Cloud Computing Expenses",
        )

    def test_pending_transaction_cannot_be_confirmed(self):
        transaction = Transaction.objects.create(
            client=self.client_record,
            transaction_date=date(2026, 8, 17),
            description="Still pending",
            amount=Decimal("5000.0000"),
            currency="INR",
            source="manual",
            source_transaction_id="TX-CONFIRM-002",
            status=Transaction.Status.PENDING,
        )

        token = self.authenticate(
            self.owner,
        )

        response = self.client.post(
            f"/api/v1/transactions/"
            f"{transaction.id}/confirm",
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
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
            "Only AI-suggested transactions can be confirmed.",
        )

        transaction.refresh_from_db()

        self.assertEqual(
            transaction.status,
            Transaction.Status.PENDING,
        )

    def test_confirmed_transaction_cannot_be_updated(self):
        transaction = Transaction.objects.create(
            client=self.client_record,
            transaction_date=date(2026, 8, 17),
            description="Confirmed transaction",
            amount=Decimal("8000.0000"),
            currency="INR",
            source="manual",
            source_transaction_id="TX-CONFIRM-003",
            status=Transaction.Status.CONFIRMED,
            ai_category="Electricity Expense",
            ai_confidence=Decimal("0.9900"),
            confirmed_category="Electricity Expense",
        )

        token = self.authenticate(
            self.owner,
        )

        with patch(
            "config.api.transactions.routes.process_transaction.delay",
        ) as mock_delay:

            response = self.client.patch(
                f"/api/v1/transactions/"
                f"{transaction.id}",
                data={
                    "description": "Should not change",
                },
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
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
            "This transaction cannot be edited while it is "
            "being processed or after it has been confirmed.",
        )

        transaction.refresh_from_db()

        self.assertEqual(
            transaction.description,
            "Confirmed transaction",
        )

        mock_delay.assert_not_called()

    def test_processing_transaction_cannot_be_updated(self):
        transaction = Transaction.objects.create(
            client=self.client_record,
            transaction_date=date(2026, 8, 17),
            description="Processing transaction",
            amount=Decimal("9000.0000"),
            currency="INR",
            source="manual",
            source_transaction_id="TX-PROCESSING-001",
            status=Transaction.Status.PROCESSING,
        )

        token = self.authenticate(
            self.owner,
        )

        with patch(
            "config.api.transactions.routes.process_transaction.delay",
        ) as mock_delay:

            response = self.client.patch(
                f"/api/v1/transactions/"
                f"{transaction.id}",
                data={
                    "description": "Should not change",
                },
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
                HTTP_X_ORGANIZATION_ID=str(
                    self.organization.id
                ),
            )

        self.assertEqual(
            response.status_code,
            409,
        )

        transaction.refresh_from_db()

        self.assertEqual(
            transaction.description,
            "Processing transaction",
        )

        mock_delay.assert_not_called()

    def test_duplicate_source_transaction_id_is_rejected(self):
        token = self.authenticate(
            self.owner,
        )

        payload = self.create_transaction_payload(
            source_transaction_id="DUPLICATE-001",
        )

        with patch(
            "config.api.transactions.routes.process_transaction.delay",
        ):

            first_response = self.client.post(
                "/api/v1/transactions/",
                data=payload,
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
                HTTP_X_ORGANIZATION_ID=str(
                    self.organization.id
                ),
            )

            second_response = self.client.post(
                "/api/v1/transactions/",
                data=payload,
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {token}",
                HTTP_X_ORGANIZATION_ID=str(
                    self.organization.id
                ),
            )

        self.assertEqual(
            first_response.status_code,
            200,
        )

        self.assertEqual(
            second_response.status_code,
            409,
        )

        self.assertIn(
            "A transaction with this source ID already exists",
            second_response.json()["detail"],
        )

    def test_transaction_from_another_organization_is_not_accessible(
        self,
    ):
        other_owner = create_user(
            email="other-owner@test.local",
        )

        other_organization, _ = (
            create_organization(
                name="Other Transaction Organization",
                owner=other_owner,
            )
        )

        other_client = Client.objects.create(
            organization=other_organization,
            name="Other Client",
        )

        other_transaction = Transaction.objects.create(
            client=other_client,
            transaction_date=date(2026, 8, 17),
            description="Other organization transaction",
            amount=Decimal("2500.0000"),
            currency="INR",
            source="manual",
            source_transaction_id="OTHER-TX-001",
        )

        token = self.authenticate(
            self.owner,
        )

        response = self.client.get(
            f"/api/v1/transactions/"
            f"{other_transaction.id}",
            HTTP_AUTHORIZATION=f"Bearer {token}",
            HTTP_X_ORGANIZATION_ID=str(
                self.organization.id
            ),
        )

        self.assertEqual(
            response.status_code,
            404,
        )

    def test_confirming_transaction_creates_audit_event(self):
        transaction = Transaction.objects.create(
            client=self.client_record,
            transaction_date=date(2026, 8, 17),
            description="Audited confirmation",
            amount=Decimal("12345.0000"),
            currency="INR",
            source="manual",
            source_transaction_id="TX-AUDIT-001",
            status=Transaction.Status.AI_SUGGESTED,
            ai_category="Cloud Computing Expenses",
            ai_confidence=Decimal("0.9500"),
        )

        token = self.authenticate(
            self.owner,
        )

        response = self.client.post(
            f"/api/v1/transactions/"
            f"{transaction.id}/confirm",
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

        from audit.models import AuditEvent

        event = AuditEvent.objects.filter(
            action=AuditEvent.Action.TRANSACTION_CONFIRMED,
            target_id=str(transaction.id),
        ).first()

        self.assertIsNotNone(
            event,
        )

        self.assertEqual(
            event.actor,
            self.owner,
        )

        self.assertEqual(
            event.metadata["previous_status"],
            Transaction.Status.AI_SUGGESTED,
        )

        self.assertEqual(
            event.metadata["new_status"],
            Transaction.Status.CONFIRMED,
        )
