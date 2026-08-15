//! Platform-specific window behaviour.
//!
//! Everything that only applies to one OS lives in the per-platform modules, so
//! the shared window code and the React UI stay platform agnostic.

use std::sync::atomic::{AtomicBool, Ordering};

use tauri::{AppHandle, Manager, WebviewWindow};

use crate::{settings::SettingsState, window::CHARM_WINDOW_LABEL};

#[cfg(all(unix, not(target_os = "macos")))]
mod linux;
#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod windows;

#[cfg(all(unix, not(target_os = "macos")))]
use linux as imp;
#[cfg(target_os = "macos")]
use macos as imp;
#[cfg(target_os = "windows")]
use windows as imp;

/// Applies the traits that make a window behave like a desktop companion rather
/// than a regular application window.
///
/// Failures are logged by the platform implementations: none of these traits are
/// required for the charm to be usable.
pub fn apply_companion_traits(window: &WebviewWindow) {
    imp::apply_companion_traits(window);
}

/// Whether the operating system currently considers the desktop itself active.
/// User visibility and desktop presence remain separate: hiding the charm never
/// changes this value, and changing applications never changes user settings.
pub struct DesktopPresenceState {
    desktop_active: AtomicBool,
}

impl Default for DesktopPresenceState {
    fn default() -> Self {
        Self {
            desktop_active: AtomicBool::new(false),
        }
    }
}

pub fn start_desktop_presence(app: &AppHandle) -> Result<(), String> {
    imp::start_desktop_presence(app)
}

pub fn set_desktop_active(app: &AppHandle, active: bool) {
    if let Some(state) = app.try_state::<DesktopPresenceState>() {
        state.desktop_active.store(active, Ordering::Release);
    }
    reconcile_charm_visibility(app);
}

pub fn reconcile_charm_visibility(app: &AppHandle) {
    let desktop_active = app
        .try_state::<DesktopPresenceState>()
        .map(|state| state.desktop_active.load(Ordering::Acquire))
        .unwrap_or(false);
    let user_visible = app
        .try_state::<SettingsState>()
        .and_then(|state| state.current.lock().ok().map(|settings| settings.visible))
        .unwrap_or(false);

    if let Some(window) = app.get_webview_window(CHARM_WINDOW_LABEL) {
        let result = if desktop_active && user_visible {
            window.show()
        } else {
            window.hide()
        };
        if let Err(error) = result {
            eprintln!("[luckydrop] could not reconcile desktop presence: {error}");
        }
    }
}
