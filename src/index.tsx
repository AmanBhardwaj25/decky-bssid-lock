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

function Content() {
  const [isRunning, setIsRunning] = useState(false);

  const onClick = async () => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    try {
      const result = await lockBssid();
      if (result?.status === "success") {
        toaster.toast({
          title: "BSSID Locked",
          body: `Locked ${result.ssid ?? "current network"} to ${result.bssid ?? "target BSSID"}.`
        });
        return;
      }

      if (result?.status === "partial") {
        toaster.toast({
          title: "Already Locked",
          body: result.message ?? "BSSID was already locked for this connection."
        });
        return;
      }

      toaster.toast({
        title: "BSSID Lock Failed",
        body: "bssid lock failed"
      });
    } catch {
      toaster.toast({
        title: "BSSID Lock Failed",
        body: "bssid lock failed"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <PanelSection title="Decky BSSID Lock">
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={onClick} disabled={isRunning}>
          Lock BSSID for current Wi-Fi connection
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
