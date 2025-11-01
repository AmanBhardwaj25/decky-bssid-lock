import asyncio
import os
import subprocess
from datetime import datetime

import decky


class LockError(Exception):
    pass


class Plugin:
    # Async entry point triggered once when the backend loads.
    async def _main(self):
        self.loop = asyncio.get_running_loop()
        self.log_path = os.path.join(decky.DECKY_PLUGIN_LOG_DIR, "bssid-lock.log")
        os.makedirs(decky.DECKY_PLUGIN_LOG_DIR, exist_ok=True)
        decky.logger.info("Decky BSSID Lock backend loaded")

    async def _unload(self):
        decky.logger.info("Decky BSSID Lock backend unloading")

    async def _uninstall(self):
        decky.logger.info("Decky BSSID Lock backend uninstalling")

    async def _migration(self):
        decky.logger.info("Decky BSSID Lock backend migration start")

    async def lock_bssid(self):
        loop = getattr(self, "loop", None) or asyncio.get_running_loop()
        result = await loop.run_in_executor(None, self._lock_bssid_sync)
        return result

    def _lock_bssid_sync(self):
        try:
            device = self._get_wifi_device()
            if not device:
                raise LockError("No Wi-Fi device found.")

            ssid = self._get_active_ssid()
            if not ssid:
                raise LockError("No active Wi-Fi SSID found.")

            connection = self._get_active_connection(device)
            if not connection:
                raise LockError(f"No active connection profile for device {device}.")

            bssid = self._get_bssid_for_ssid(ssid)
            if not bssid:
                raise LockError(f"Could not find BSSID for SSID {ssid}.")

            current_bssid = self._get_current_bssid(connection)
            if current_bssid and self._normalize(current_bssid) == self._normalize(bssid):
                message = f"BSSID already locked for SSID '{ssid}' ({connection})."
                decky.logger.info(message)
                return {
                    "status": "partial",
                    "message": message,
                    "ssid": ssid,
                    "bssid": bssid,
                    "connection": connection,
                }

            self._run_nmcli(["connection", "modify", connection, "wifi.bssid", bssid])
            message = f"Locked SSID '{ssid}' (connection: {connection}) to BSSID {bssid}."
            decky.logger.info(message)
            return {
                "status": "success",
                "ssid": ssid,
                "bssid": bssid,
                "connection": connection,
            }

        except LockError as err:
            self._log_failure(str(err))
            return {"status": "failure", "message": str(err)}
        except subprocess.CalledProcessError as err:
            output = (err.stdout or "") + (err.stderr or "")
            self._log_failure(f"nmcli error: {output.strip() or err}")
            return {"status": "failure", "message": "nmcli returned an error."}
        except Exception as err:  # pylint: disable=broad-except
            self._log_failure(f"Unexpected error: {err}")
            return {"status": "failure", "message": "Unexpected error occurred."}

    def _run_nmcli(self, args):
        return subprocess.check_output(
            ["nmcli", *args],
            text=True,
            stderr=subprocess.STDOUT,
        )

    def _get_wifi_device(self):
        output = subprocess.check_output(
            ["nmcli", "-t", "-f", "DEVICE,TYPE", "dev", "status"],
            text=True,
            stderr=subprocess.STDOUT,
        )
        for line in output.splitlines():
            if line.endswith(":wifi"):
                return line.split(":", 1)[0]
        return ""

    def _get_active_ssid(self):
        output = subprocess.check_output(
            ["nmcli", "-t", "-f", "ACTIVE,SSID", "dev", "wifi"],
            text=True,
            stderr=subprocess.STDOUT,
        )
        for line in output.splitlines():
            if line.startswith("yes:"):
                return line.split(":", 1)[1]
        return ""

    def _get_active_connection(self, device):
        output = subprocess.check_output(
            ["nmcli", "-t", "-f", "NAME,DEVICE", "connection", "show", "--active"],
            text=True,
            stderr=subprocess.STDOUT,
        )
        for line in output.splitlines():
            if line.endswith(f":{device}"):
                return line.split(":", 1)[0]
        return ""

    def _get_bssid_for_ssid(self, ssid):
        output = subprocess.check_output(
            ["nmcli", "-t", "-f", "SSID,BSSID", "dev", "wifi", "list"],
            text=True,
            stderr=subprocess.STDOUT,
        )
        for line in output.splitlines():
            if not line:
                continue
            if line.startswith(f"{ssid}:"):
                return line[len(ssid) + 1 :].replace("\\", "")
        return ""

    def _get_current_bssid(self, connection):
        output = subprocess.check_output(
            ["nmcli", "-g", "wifi.bssid", "connection", "show", connection],
            text=True,
            stderr=subprocess.STDOUT,
        )
        return output.strip()

    def _normalize(self, value):
        return value.replace("\\", "").strip().lower()

    def _log_failure(self, message):
        decky.logger.error(message)
        if getattr(self, "log_path", None):
            timestamp = datetime.now().isoformat()
            try:
                with open(self.log_path, "a", encoding="utf-8") as log_file:
                    log_file.write(f"[{timestamp}] {message}\n")
            except OSError as err:
                decky.logger.error("Failed to write error log: %s", err)
