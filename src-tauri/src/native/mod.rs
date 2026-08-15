//! System tray, shortcuts and deep links.

mod deep_link;
mod tray;

use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

use crate::{
    commands::settings::apply_settings,
    platform,
    settings::{CharmSettings, SettingsState},
    window::CUSTOMIZER_WINDOW_LABEL,
};

pub use tray::refresh as refresh_tray;

pub const TOGGLE_SHORTCUT: &str = "CommandOrControl+Shift+L";

pub fn initialize(app: &AppHandle, initial: &CharmSettings) -> Result<(), String> {
    tray::create(app, initial).map_err(|error| format!("tray initialization failed: {error}"))?;

    app.global_shortcut()
        .on_shortcut(TOGGLE_SHORTCUT, |app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                if let Err(error) = toggle_charm(app) {
                    eprintln!("[luckydrop] shortcut could not toggle charm: {error}");
                }
            }
        })
        .map_err(|error| format!("global shortcut registration failed: {error}"))?;

    deep_link::initialize(app)?;
    platform::start_desktop_presence(app)?;
    Ok(())
}

pub fn toggle_charm(app: &AppHandle) -> Result<(), String> {
    let mut settings = current_settings(app)?;
    settings.visible = !settings.visible;
    apply_settings(app, settings).map(|_| ())
}

pub fn choose_charm(app: &AppHandle, charm_id: &str) -> Result<(), String> {
    let mut settings = current_settings(app)?;
    settings.charm_id = charm_id.to_string();
    let applied = apply_settings(app, settings)?;
    if applied.charm_id != charm_id {
        return Err(format!("unknown charm id: {charm_id}"));
    }
    Ok(())
}

pub fn set_charm_visibility(app: &AppHandle, visible: bool) -> Result<(), String> {
    let mut settings = current_settings(app)?;
    settings.visible = visible;
    apply_settings(app, settings).map(|_| ())
}

pub fn open_customizer(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(CUSTOMIZER_WINDOW_LABEL) {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

pub fn hide_customizer(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(CUSTOMIZER_WINDOW_LABEL) {
        let _ = window.hide();
    }
}

pub fn handle_second_instance(app: &AppHandle, args: Vec<String>) {
    use tauri_plugin_deep_link::DeepLinkExt;

    app.deep_link().handle_cli_arguments(args.iter());
    if !args
        .iter()
        .any(|argument| argument.starts_with("luckydrop://"))
    {
        open_customizer(app);
    }
}

fn current_settings(app: &AppHandle) -> Result<CharmSettings, String> {
    app.state::<SettingsState>()
        .current
        .lock()
        .map(|settings| settings.clone())
        .map_err(|_| "settings are temporarily unavailable".to_string())
}
