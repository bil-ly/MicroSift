import time
import unittest
from types import SimpleNamespace
from unittest.mock import patch

import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from backend.api import approved, audience, current_user, issuer, me


class AuthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    def token(self, **overrides):
        claims = {
            "sub": "user-1",
            "iss": issuer,
            "aud": audience,
            "exp": int(time.time()) + 60,
            "preferred_username": "alice",
            "realm_access": {"roles": []},
        }
        claims.update(overrides)
        return jwt.encode(claims, self.private_key, algorithm="RS256")

    def verify(self, token):
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        with patch("backend.api.signing_keys") as keys:
            keys.return_value.get_signing_key_from_jwt.return_value = SimpleNamespace(
                key=self.private_key.public_key()
            )
            return current_user(credentials)

    def test_valid_unapproved_user_is_pending_and_denied_private_access(self):
        user = self.verify(self.token())
        self.assertEqual(me(user)["approval"], "pending")
        with self.assertRaises(HTTPException) as raised:
            approved(user)
        self.assertEqual(raised.exception.status_code, 403)

    def test_approved_role_grants_private_access(self):
        user = self.verify(self.token(realm_access={"roles": ["approved"]}))
        self.assertEqual(me(user)["approval"], "approved")
        self.assertEqual(approved(user), {"status": "approved"})

    def test_rejects_wrong_audience_and_issuer(self):
        for claims in ({"aud": "other-api"}, {"iss": "http://attacker/realms/microsift"}):
            with self.subTest(claims=claims), self.assertRaises(HTTPException) as raised:
                self.verify(self.token(**claims))
            self.assertEqual(raised.exception.status_code, 401)

    def test_rejects_expired_token(self):
        with self.assertRaises(HTTPException) as raised:
            self.verify(self.token(exp=int(time.time()) - 60))
        self.assertEqual(raised.exception.status_code, 401)


if __name__ == "__main__":
    unittest.main()
