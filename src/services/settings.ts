import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { CharmSettings } from "../types/settings";

const SETTINGS_CHANGED_EVENT = "charm-settings-changed";

export interface MonitorMetrics {
  logicalX: number;
  logicalWidth: number;
  minimumNormalizedX: number;
  maximumNormalizedX: number;
}

export function loadSettings(): Promise<CharmSettings> {
  return invoke<CharmSettings>("get_settings");
}

export function saveSettings(settings: CharmSettings): Promise<CharmSettings> {
  return invoke<CharmSettings>("update_settings", { settings });
}

export function onSettingsChanged(
  callback: (settings: CharmSettings) => void,
): Promise<UnlistenFn> {
  return listen<CharmSettings>(SETTINGS_CHANGED_EVENT, (event) => {
    callback(event.payload);
  });
}

export function getMonitorMetrics(): Promise<MonitorMetrics> {
  return invoke<MonitorMetrics>("get_monitor_metrics");
}

export function beginCharmDrag(): Promise<MonitorMetrics> {
  return invoke<MonitorMetrics>("begin_charm_drag");
}

export function previewDragPosition(normalizedX: number): Promise<void> {
  return invoke("preview_drag_position", { normalizedX });
}
