"""Live API smoke test against a running server (default http://127.0.0.1:8000)."""
import sys
import uuid
import httpx

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
suffix = uuid.uuid4().hex[:8]
merchant_email = f"merchant_{suffix}@test.com"
buyer_email = f"buyer_{suffix}@test.com"
password = "testpass123"


def main() -> None:
    with httpx.Client(base_url=BASE, timeout=30.0) as client:
        r = client.get("/health")
        assert r.status_code == 200, r.text
        assert r.json()["system_status"] == "operational"
        print("OK  health")

        r = client.post(
            "/api/v1/auth/signup",
            json={
                "email": merchant_email,
                "password": password,
                "full_name": "Smoke Merchant",
                "role": "merchant_admin",
            },
        )
        assert r.status_code == 200, r.text
        print("OK  merchant signup")

        r = client.post(
            "/api/v1/auth/login",
            data={"username": merchant_email, "password": password},
        )
        assert r.status_code == 200, r.text
        merchant_token = r.json()["access_token"]
        m_headers = {"Authorization": f"Bearer {merchant_token}"}
        print("OK  merchant login")

        r = client.post(
            "/inventory/",
            json={"name": "Widget", "price": 10.0, "stock": 5, "unit_type": "box"},
            headers=m_headers,
        )
        assert r.status_code == 200, r.text
        product_id = r.json()["id"]
        merchant_profile_id = r.json()["merchant_id"]
        print("OK  create inventory")

        client.post("/merchants/visibility?action=show", headers=m_headers)

        r = client.get("/merchants/")
        assert r.status_code == 200, r.text
        assert any(
            m["id"] == merchant_profile_id for m in r.json()
        ), "merchant profile not public in marketplace"
        print("OK  merchants discoverable")

        r = client.post(
            "/api/v1/auth/signup",
            json={
                "email": buyer_email,
                "password": password,
                "full_name": "Smoke Buyer",
                "role": "buyer",
            },
        )
        assert r.status_code == 200, r.text
        print("OK  buyer signup")

        r = client.post(
            "/api/v1/auth/login",
            data={"username": buyer_email, "password": password},
        )
        assert r.status_code == 200, r.text
        buyer_token = r.json()["access_token"]
        b_headers = {"Authorization": f"Bearer {buyer_token}"}
        print("OK  buyer login")

        r = client.post(
            "/merchants/partnerships",
            json={"merchant_id": merchant_profile_id},
            headers=b_headers,
        )
        assert r.status_code == 200, r.text
        link_id = r.json()["id"]
        print("OK  partnership request")

        r = client.put(
            f"/merchants/partnerships/{link_id}",
            json={"status": "active"},
            headers=m_headers,
        )
        assert r.status_code == 200, r.text
        print("OK  partnership accepted")

        r = client.get(
            f"/inventory/merchant/{merchant_profile_id}", headers=b_headers
        )
        assert r.status_code == 200, r.text
        assert len(r.json()) >= 1
        print("OK  buyer catalog")

        r = client.post(
            "/transactions/",
            json={
                "merchant_id": merchant_profile_id,
                "items": [{"product_id": product_id, "quantity": 1}],
            },
            headers=b_headers,
        )
        assert r.status_code == 200, r.text
        assert r.json()["total_value"] == 10.0
        print("OK  place order")

        r = client.get("/transactions/", headers=m_headers)
        assert r.status_code == 200, r.text
        assert len(r.json()) >= 1
        print("OK  merchant list orders")

    print("\nAll smoke tests passed.")


if __name__ == "__main__":
    main()
