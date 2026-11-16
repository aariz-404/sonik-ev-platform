"""
test_qa_integration.py — Complete QA & Integration Test Suite for Sonik EV Platform

Executes and reports actual PASS/FAIL results for all 16 specified integration test cases:
  TC01: Successful login.
  TC02: Invalid login.
  TC03: Load stations.
  TC04: Filter available chargers.
  TC05: Reject negative power filter.
  TC06: Retrieve unknown charger.
  TC07: Create demo session.
  TC08: Reject session for unavailable charger.
  TC09: Activate valid session.
  TC10: Reject invalid session transition.
  TC11: Complete active session.
  TC12: Create service ticket.
  TC13: Update ticket status.
  TC14: Driver cannot access operator-only endpoint.
  TC15: Dashboard analytics update after a session change.
  TC16: Session created by ChargeConnect appears in ChargeOps.
"""

import sys
import os
import json
import urllib.request
import urllib.error
import time

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5000/api/v1")

class QATestRunner:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url.rstrip('/')
        self.results = []
        self.operator_token = None
        self.driver_token = None
        self.admin_token = None

    def _request(self, endpoint, method="GET", data=None, token=None):
        url = f"{self.base_url}{endpoint if endpoint.startswith('/') else f'/{endpoint}'}"
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        body = json.dumps(data).encode("utf-8") if data is not None else None
        req = urllib.request.Request(url, data=body, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req) as resp:
                status = resp.status
                raw = resp.read().decode("utf-8")
                json_data = json.loads(raw) if raw else {}
                return status, json_data
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8")
            try:
                json_data = json.loads(raw)
            except Exception:
                json_data = {"error": raw}
            return e.code, json_data

    def record_result(self, tc_id, title, passed, details=""):
        status_str = "PASS" if passed else "FAIL"
        self.results.append({
            "id": tc_id,
            "title": title,
            "status": status_str,
            "details": details
        })
        prefix = "[PASS]" if passed else "[FAIL]"
        print(f"{prefix} {tc_id}: {title}")
        if details and not passed:
            print(f"       Details: {details}")

    def run_all(self):
        print("=" * 70)
        print(" SONIK EV PLATFORM — QA & INTEGRATION TEST SUITE (TC01 - TC16)")
        print(f" Target Backend: {self.base_url}")
        print("=" * 70)

        # -------------------------------------------------------------
        # TC01: Successful login
        # -------------------------------------------------------------
        try:
            status, res = self._request("/auth/login", method="POST", data={
                "email": "operator@sonik.ev",
                "password": "operator123"
            })
            passed = (
                status == 200 and
                res.get("success") is True and
                "token" in res.get("data", {}) and
                res["data"]["user"]["role"] == "OPERATOR"
            )
            if passed:
                self.operator_token = res["data"]["token"]

            # Also verify driver login
            d_status, d_res = self._request("/auth/login", method="POST", data={
                "email": "driver@sonik.ev",
                "password": "driver123"
            })
            if d_status == 200:
                self.driver_token = d_res["data"]["token"]

            self.record_result("TC01", "Successful login", passed and (d_status == 200),
                               f"Operator HTTP {status}, Driver HTTP {d_status}")
        except Exception as e:
            self.record_result("TC01", "Successful login", False, str(e))

        # -------------------------------------------------------------
        # TC02: Invalid login
        # -------------------------------------------------------------
        try:
            status, res = self._request("/auth/login", method="POST", data={
                "email": "operator@sonik.ev",
                "password": "incorrect_password_999"
            })
            passed = (status == 401 and res.get("success") is False)
            self.record_result("TC02", "Invalid login", passed,
                               f"HTTP {status}, error: {res.get('message') or res.get('error')}")
        except Exception as e:
            self.record_result("TC02", "Invalid login", False, str(e))

        # -------------------------------------------------------------
        # TC03: Load stations
        # -------------------------------------------------------------
        try:
            status, res = self._request("/stations")
            stations = res.get("data", [])
            passed = (
                status == 200 and
                res.get("success") is True and
                isinstance(stations, list) and
                len(stations) >= 5 and
                all("station_id" in s and "name" in s and "city" in s for s in stations)
            )
            self.record_result("TC03", "Load stations", passed,
                               f"HTTP {status}, returned {len(stations)} stations")
        except Exception as e:
            self.record_result("TC03", "Load stations", False, str(e))

        # -------------------------------------------------------------
        # TC04: Filter available chargers
        # -------------------------------------------------------------
        try:
            status, res = self._request("/chargers?status=Available")
            chargers = res.get("data", [])
            passed = (
                status == 200 and
                res.get("success") is True and
                len(chargers) > 0 and
                all(c.get("status") == "Available" for c in chargers)
            )
            self.record_result("TC04", "Filter available chargers", passed,
                               f"HTTP {status}, returned {len(chargers)} Available chargers")
        except Exception as e:
            self.record_result("TC04", "Filter available chargers", False, str(e))

        # -------------------------------------------------------------
        # TC05: Reject negative power filter
        # -------------------------------------------------------------
        try:
            status, res = self._request("/chargers?min_power=-10")
            passed = (
                status == 400 and
                res.get("success") is False and
                any("positive" in str(err).lower() or "power" in str(err).lower()
                    for err in res.get("errors", [res.get("message", "")]))
            )
            self.record_result("TC05", "Reject negative power filter", passed,
                               f"HTTP {status}, errors: {res.get('errors')}")
        except Exception as e:
            self.record_result("TC05", "Reject negative power filter", False, str(e))

        # -------------------------------------------------------------
        # TC06: Retrieve unknown charger
        # -------------------------------------------------------------
        try:
            status, res = self._request("/chargers/999999")
            passed = (status == 404 and res.get("success") is False)
            self.record_result("TC06", "Retrieve unknown charger", passed,
                               f"HTTP {status}, not found as expected")
        except Exception as e:
            self.record_result("TC06", "Retrieve unknown charger", False, str(e))

        # -------------------------------------------------------------
        # Find an Available charger for session testing
        # -------------------------------------------------------------
        available_charger_id = None
        try:
            _, c_res = self._request("/chargers?status=Available")
            if c_res.get("data"):
                available_charger_id = c_res["data"][0]["charger_id"]
        except Exception:
            pass

        # -------------------------------------------------------------
        # TC07: Create demo session
        # -------------------------------------------------------------
        test_session_id = None
        try:
            if not available_charger_id:
                raise Exception("No Available charger found to initiate session")

            status, res = self._request("/sessions", method="POST", data={
                "charger_id": available_charger_id
            }, token=self.driver_token)

            session_data = res.get("data", {})
            passed = (
                status == 201 and
                res.get("success") is True and
                session_data.get("status") == "Created" and
                session_data.get("session_id") is not None
            )
            if passed:
                test_session_id = session_data["session_id"]
            self.record_result("TC07", "Create demo session", passed,
                               f"HTTP {status}, session_id: {test_session_id}, status: {session_data.get('status')}")
        except Exception as e:
            self.record_result("TC07", "Create demo session", False, str(e))

        # -------------------------------------------------------------
        # TC08: Reject session for unavailable charger
        # -------------------------------------------------------------
        try:
            # Find an offline or charging charger (e.g., charger 4 is Offline or 2 is Charging)
            _, c_res = self._request("/chargers?status=Offline")
            offline_id = None
            if c_res.get("data"):
                offline_id = c_res["data"][0]["charger_id"]
            else:
                _, c_res2 = self._request("/chargers?status=Charging")
                if c_res2.get("data"):
                    offline_id = c_res2["data"][0]["charger_id"]

            if not offline_id:
                offline_id = 4  # default from seed

            status, res = self._request("/sessions", method="POST", data={
                "charger_id": offline_id
            }, token=self.driver_token)

            passed = (status == 409 and res.get("success") is False)
            self.record_result("TC08", "Reject session for unavailable charger", passed,
                               f"HTTP {status}, rejected unavailable charger #{offline_id}")
        except Exception as e:
            self.record_result("TC08", "Reject session for unavailable charger", False, str(e))

        # -------------------------------------------------------------
        # TC09: Activate valid session
        # -------------------------------------------------------------
        try:
            if not test_session_id:
                raise Exception("Missing test session from TC07")

            status, res = self._request(f"/sessions/{test_session_id}", method="PATCH", data={
                "status": "Active"
            }, token=self.driver_token)

            session_data = res.get("data", {})
            passed = (
                status == 200 and
                res.get("success") is True and
                session_data.get("status") == "Active" and
                session_data.get("start_time") is not None
            )
            self.record_result("TC09", "Activate valid session", passed,
                               f"HTTP {status}, session #{test_session_id} active")
        except Exception as e:
            self.record_result("TC09", "Activate valid session", False, str(e))

        # -------------------------------------------------------------
        # TC10: Reject invalid session transition
        # -------------------------------------------------------------
        try:
            # Attempt to revert Active session back to Created
            status, res = self._request(f"/sessions/{test_session_id}", method="PATCH", data={
                "status": "Created"
            }, token=self.driver_token)

            passed = (status in [422, 400] and res.get("success") is False)
            self.record_result("TC10", "Reject invalid session transition", passed,
                               f"HTTP {status}, rejected Active -> Created")
        except Exception as e:
            self.record_result("TC10", "Reject invalid session transition", False, str(e))

        # -------------------------------------------------------------
        # TC11: Complete active session
        # -------------------------------------------------------------
        try:
            if not test_session_id:
                raise Exception("Missing test session")

            status, res = self._request(f"/sessions/{test_session_id}", method="PATCH", data={
                "status": "Completed",
                "energy_kwh": 26.8
            }, token=self.driver_token)

            session_data = res.get("data", {})
            passed = (
                status == 200 and
                res.get("success") is True and
                session_data.get("status") == "Completed" and
                float(session_data.get("energy_kwh", 0)) == 26.8 and
                session_data.get("end_time") is not None
            )

            # Check that the charger was reset to Available
            _, chg_res = self._request(f"/chargers/{available_charger_id}")
            charger_reset = chg_res.get("data", {}).get("status") == "Available"

            passed = passed and charger_reset
            self.record_result("TC11", "Complete active session", passed,
                               f"HTTP {status}, energy: 26.8 kWh, charger reset to Available: {charger_reset}")
        except Exception as e:
            self.record_result("TC11", "Complete active session", False, str(e))

        # -------------------------------------------------------------
        # TC12: Create service ticket
        # -------------------------------------------------------------
        created_ticket_id = None
        try:
            status, res = self._request("/tickets", method="POST", data={
                "category": "Hardware",
                "priority": "Medium",
                "description": "Integration test: Connector latch release action test.",
                "charger_id": available_charger_id
            }, token=self.driver_token)

            ticket_data = res.get("data", {})
            passed = (
                status == 201 and
                res.get("success") is True and
                ticket_data.get("ticket_id") is not None and
                ticket_data.get("status") == "Open"
            )
            if passed:
                created_ticket_id = ticket_data["ticket_id"]
            self.record_result("TC12", "Create service ticket", passed,
                               f"HTTP {status}, ticket_id: {created_ticket_id}")
        except Exception as e:
            self.record_result("TC12", "Create service ticket", False, str(e))

        # -------------------------------------------------------------
        # TC13: Update ticket status
        # -------------------------------------------------------------
        try:
            if not created_ticket_id:
                raise Exception("Missing ticket from TC12")

            # Operator updates ticket to InProgress
            status1, res1 = self._request(f"/tickets/{created_ticket_id}", method="PATCH", data={
                "status": "InProgress"
            }, token=self.operator_token)

            # Operator updates ticket to Resolved
            status2, res2 = self._request(f"/tickets/{created_ticket_id}", method="PATCH", data={
                "status": "Resolved"
            }, token=self.operator_token)

            passed = (
                status1 == 200 and
                res1.get("data", {}).get("status") == "InProgress" and
                status2 == 200 and
                res2.get("data", {}).get("status") == "Resolved"
            )
            self.record_result("TC13", "Update ticket status", passed,
                               f"InProgress HTTP {status1}, Resolved HTTP {status2}")
        except Exception as e:
            self.record_result("TC13", "Update ticket status", False, str(e))

        # -------------------------------------------------------------
        # TC14: Driver cannot access operator-only endpoint
        # -------------------------------------------------------------
        try:
            # Driver calls operator analytics summary
            status, res = self._request("/analytics/summary", token=self.driver_token)
            passed = (status == 403 and res.get("success") is False)
            self.record_result("TC14", "Driver cannot access operator-only endpoint", passed,
                               f"HTTP {status} Forbidden returned as required")
        except Exception as e:
            self.record_result("TC14", "Driver cannot access operator-only endpoint", False, str(e))

        # -------------------------------------------------------------
        # TC15: Dashboard analytics update after a session change
        # -------------------------------------------------------------
        try:
            # 1. Fetch baseline analytics as operator
            _, initial_analytics = self._request("/analytics/summary", token=self.operator_token)
            initial_stats = initial_analytics.get("data", {}).get("stats", {})
            initial_active = initial_stats.get("active_sessions", 0)
            initial_energy = float(initial_stats.get("total_energy_all_time_kwh", 0))

            # 2. Find available charger and create/activate session
            _, chg_res = self._request("/chargers?status=Available")
            target_charger_id = chg_res["data"][0]["charger_id"]

            _, sess_new = self._request("/sessions", method="POST", data={
                "charger_id": target_charger_id
            }, token=self.driver_token)
            temp_session_id = sess_new["data"]["session_id"]

            # Activate session
            self._request(f"/sessions/{temp_session_id}", method="PATCH", data={
                "status": "Active"
            }, token=self.driver_token)

            # 3. Check analytics: active_sessions should increase by 1
            _, mid_analytics = self._request("/analytics/summary", token=self.operator_token)
            mid_stats = mid_analytics.get("data", {}).get("stats", {})
            mid_active = mid_stats.get("active_sessions", 0)
            active_increased = (mid_active == initial_active + 1)

            # 4. Complete session with 14.5 kWh
            self._request(f"/sessions/{temp_session_id}", method="PATCH", data={
                "status": "Completed",
                "energy_kwh": 14.5
            }, token=self.driver_token)

            # 5. Check analytics: total_energy should reflect the new session
            _, final_analytics = self._request("/analytics/summary", token=self.operator_token)
            final_stats = final_analytics.get("data", {}).get("stats", {})
            final_energy = float(final_stats.get("total_energy_all_time_kwh", 0))
            energy_increased = (final_energy >= initial_energy + 14.0)

            passed = active_increased and energy_increased
            self.record_result("TC15", "Dashboard analytics update after a session change", passed,
                               f"Active: {initial_active} -> {mid_active}, Energy: {initial_energy:.1f} -> {final_energy:.1f} kWh")
        except Exception as e:
            self.record_result("TC15", "Dashboard analytics update after a session change", False, str(e))

        # -------------------------------------------------------------
        # TC16: Session created by ChargeConnect appears in ChargeOps
        # -------------------------------------------------------------
        try:
            # 1. Driver (ChargeConnect) creates a new session
            _, chg_res = self._request("/chargers?status=Available")
            c_id = chg_res["data"][0]["charger_id"]

            _, driver_sess = self._request("/sessions", method="POST", data={
                "charger_id": c_id
            }, token=self.driver_token)
            created_by_driver_id = driver_sess.get("data", {}).get("session_id")

            # 2. Operator (ChargeOps) fetches all sessions
            status, op_res = self._request("/sessions?limit=50", token=self.operator_token)
            op_sessions = op_res.get("data", [])
            found_in_chargeops = any(s.get("session_id") == created_by_driver_id for s in op_sessions)

            passed = (
                status == 200 and
                created_by_driver_id is not None and
                found_in_chargeops
            )
            self.record_result("TC16", "Session created by ChargeConnect appears in ChargeOps", passed,
                               f"Driver created SES-{created_by_driver_id}, verified in Operator query: {found_in_chargeops}")
        except Exception as e:
            self.record_result("TC16", "Session created by ChargeConnect appears in ChargeOps", False, str(e))

        print("=" * 70)
        passed_count = sum(1 for r in self.results if r["status"] == "PASS")
        total_count = len(self.results)
        print(f" TOTAL TESTS RUN: {total_count} | PASSED: {passed_count} | FAILED: {total_count - passed_count}")
        print("=" * 70)

        return passed_count == total_count

if __name__ == "__main__":
    runner = QATestRunner()
    success = runner.run_all()
    sys.exit(0 if success else 1)
