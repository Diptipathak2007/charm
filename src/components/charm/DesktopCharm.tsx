import { useCharmSettings } from "../../hooks/useCharmSettings";
import PhysicalCharm from "./PhysicalCharm";
import "./DesktopCharm.css";

function DesktopCharm() {
  const { settings } = useCharmSettings({ listenForChanges: true });

  if (!settings) {
    return <main className="desktop-charm" aria-label="LuckyDrop charm" />;
  }

  return (
    <main
      className={`desktop-charm${settings.visible ? "" : " desktop-charm--hidden"}`}
      aria-label="LuckyDrop charm"
    >
      <PhysicalCharm settings={settings} />
    </main>
  );
}

export default DesktopCharm;
