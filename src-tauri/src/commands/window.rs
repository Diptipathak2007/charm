use tauri::{AppHandle, Emitter};

use crate::{
    settings::SettingsState,
    window::{self, MonitorMetrics, CUSTOMIZER_WINDOW_LABEL},
};

use super::settings::SETTINGS_CHANGED_EVENT;

#[tauri::command]
pub fn get_monitor_metrics(app: AppHandle) -> Result<MonitorMetrics, String> {
    window::monitor_metrics(&app)
}

#[tauri::command]
pub fn begin_charm_drag(app: AppHandle) -> Result<MonitorMetrics, String> {
    window::begin_drag(&app)
}

/// Updates the customizer slider while the desktop pointer is moving, without
/// writing to disk on every mouse event. The final value is persisted through
/// `update_settings` on pointer release.
#[tauri::command]
pub fn preview_drag_position(
    app: AppHandle,
    state: tauri::State<'_, SettingsState>,
    normalized_x: f64,
) -> Result<(), String> {
    let mut preview = state
        .current
        .lock()
        .map_err(|_| "settings are temporarily unavailable".to_string())?
        .clone();
    preview.position.normalized_x = normalized_x.clamp(0.0, 1.0);

    app.emit_to(CUSTOMIZER_WINDOW_LABEL, SETTINGS_CHANGED_EVENT, preview)
        .map_err(|error| format!("could not update position preview: {error}"))
}
