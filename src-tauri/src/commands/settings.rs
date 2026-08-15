use std::{thread, time::Duration};

use tauri::{AppHandle, Emitter, Manager, State};

use crate::{
    native, platform,
    settings::{CharmSettings, SettingsState},
    window::{self, CHARM_WINDOW_LABEL},
};

pub const SETTINGS_CHANGED_EVENT: &str = "charm-settings-changed";
const HIDE_ANIMATION_DURATION: Duration = Duration::from_millis(220);

#[tauri::command]
pub fn get_settings(state: State<'_, SettingsState>) -> Result<CharmSettings, String> {
    state
        .current
        .lock()
        .map(|settings| settings.clone())
        .map_err(|_| "settings are temporarily unavailable".to_string())
}

#[tauri::command]
pub fn update_settings(app: AppHandle, settings: CharmSettings) -> Result<CharmSettings, String> {
    apply_settings(&app, settings)
}

pub fn apply_settings(app: &AppHandle, settings: CharmSettings) -> Result<CharmSettings, String> {
    let settings = settings.sanitized();
    let state = app.state::<SettingsState>();
    state
        .save(&settings)
        .map_err(|error| format!("could not save settings: {error}"))?;

    {
        let mut current = state
            .current
            .lock()
            .map_err(|_| "settings are temporarily unavailable".to_string())?;
        *current = settings.clone();
    }

    if let Some(charm_window) = app.get_webview_window(CHARM_WINDOW_LABEL) {
        window::place_charm_window(&charm_window, &settings.position);

        // Showing first lets the webview paint the drop-in transition. Hiding
        // waits for the matching CSS transition, then removes the native window
        // so its transparent pixels no longer intercept desktop input.
        if settings.visible {
            if let Err(error) = charm_window.show() {
                eprintln!("[luckydrop] could not show the charm window: {error}");
            }
        }
    }

    if let Err(error) = app.emit_to(CHARM_WINDOW_LABEL, SETTINGS_CHANGED_EVENT, settings.clone()) {
        eprintln!("[luckydrop] could not update the charm preview: {error}");
    }

    if !settings.visible {
        hide_after_transition(app.clone());
    } else {
        platform::reconcile_charm_visibility(app);
    }
    native::refresh_tray(app, &settings);

    Ok(settings)
}

fn hide_after_transition(app: AppHandle) {
    thread::spawn(move || {
        thread::sleep(HIDE_ANIMATION_DURATION);

        let still_hidden = app
            .try_state::<SettingsState>()
            .and_then(|state| state.current.lock().ok().map(|settings| !settings.visible))
            .unwrap_or(false);

        if still_hidden {
            if let Some(window) = app.get_webview_window(CHARM_WINDOW_LABEL) {
                if let Err(error) = window.hide() {
                    eprintln!("[luckydrop] could not hide the charm window: {error}");
                }
            }
        }
    });
}
