import { ButtonItem, PanelSection, PanelSectionRow, staticClasses } from "@decky/ui";
import { callable, definePlugin, toaster } from "@decky/api";
import { FaShip } from "react-icons/fa";
import { useState } from "react";

type LockResult = {
  status: "success" | "partial" | "failure";
  ssid?: string;
  bssid?: string;
  connection?: string;
  message?: string;
};

const lockBssid = callable<[], LockResult>("lock_bssid");
const clearBssid = callable<[], LockResult>("clear_bssid");

function Content() {
  const [isRunning, setIsRunning] = useState(false);

  const handleResult = (result: LockResult | undefined, successTitle: string, partialTitle: string) => {
    if (result?.status === "success") {
      toaster.toast({
        title: successTitle,
        body: result.message ?? "Operation completed."
      });
      return true;
    }
    if (result?.status === "partial") {
      toaster.toast({
        title: partialTitle,
        body: result.message ?? "No changes were required."
      });
      return true;
    }
    toaster.toast({
      title: "BSSID Operation Failed",
      body: "bssid lock failed"
    });
    return false;
  };

  const lock = async () => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    try {
      const result = await lockBssid();
      handleResult(result, "BSSID Locked", "Already Locked");
    } catch (error) {
      console.error("Lock BSSID failed", error);
      toaster.toast({
        title: "BSSID Operation Failed",
        body: "bssid lock failed"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clear = async () => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    try {
      const result = await clearBssid();
      handleResult(result, "BSSID Cleared", "Already Clear");
    } catch (error) {
      console.error("Clear BSSID failed", error);
      toaster.toast({
        title: "BSSID Operation Failed",
        body: "bssid lock failed"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <PanelSection title="Decky BSSID Lock">
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={lock} disabled={isRunning}>
          Lock BSSID for current Wi-Fi connection
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={clear} disabled={isRunning}>
          Clear BSSID lock for current Wi-Fi connection
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default definePlugin(() => {
  console.log("Decky BSSID Lock frontend loaded");

  return {
    name: "Decky BSSID Lock",
    titleView: <div className={staticClasses.Title}>Decky BSSID Lock</div>,
    content: <Content />,
    icon: <FaShip />,
    onDismount() {
        console.log("Decky BSSID Lock frontend unloading");
    },
  };
});
