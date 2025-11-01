import decky


class Plugin:
    # Async entry point triggered once when the backend loads.
    async def _main(self):
        decky.logger.info("Decky BSSID Lock backend loaded")

    async def _unload(self):
        decky.logger.info("Decky BSSID Lock backend unloading")

    async def _uninstall(self):
        decky.logger.info("Decky BSSID Lock backend uninstalling")

    async def _migration(self):
        decky.logger.info("Decky BSSID Lock backend migration start")
