import { ButtonItem, PanelSection, PanelSectionRow, staticClasses } from "@decky/ui";
import { definePlugin, toaster } from "@decky/api";
import { FaShip } from "react-icons/fa";

function Content() {
  const onClick = async () => {
    toaster.toast({
      title: "BSSID Locked",
      body: "Current Wi-Fi connection marked as locked."
    });
  };

  return (
    <PanelSection title="Decky BSSID Lock">
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={onClick}>
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
