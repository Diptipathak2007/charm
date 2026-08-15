//! macOS desktop presence.

use std::{ptr::NonNull, sync::Once};

use block2::RcBlock;
use objc2_app_kit::{NSWindow, NSWorkspace, NSWorkspaceDidActivateApplicationNotification};
use objc2_foundation::NSNotification;
use tauri::{AppHandle, WebviewWindow};

static OBSERVER: Once = Once::new();

/// Keep the charm below ordinary windows and out of focus/Dock workflows.
pub fn apply_companion_traits(window: &WebviewWindow) {
    let _ = window.set_always_on_top(false);
    let _ = window.set_focusable(false);
    let _ = window.set_visible_on_all_workspaces(true);

    if let Ok(pointer) = window.ns_window() {
        // A level just below NSNormalWindowLevel keeps the charm behind Finder
        // and all application windows while remaining above the desktop.
        let native_window = unsafe { &*pointer.cast::<NSWindow>() };
        native_window.setLevel(-1);
    }
}

pub fn start_desktop_presence(app: &AppHandle) -> Result<(), String> {
    app.set_activation_policy(tauri::ActivationPolicy::Accessory)
        .map_err(|error| format!("could not set accessory activation policy: {error}"))?;

    update_presence(app);
    let handle = app.clone();
    OBSERVER.call_once(move || {
        let workspace = NSWorkspace::sharedWorkspace();
        let center = workspace.notificationCenter();
        let block = RcBlock::new(move |_notification: NonNull<NSNotification>| {
            update_presence(&handle);
        });

        let observer = unsafe {
            center.addObserverForName_object_queue_usingBlock(
                Some(NSWorkspaceDidActivateApplicationNotification),
                None,
                None,
                &block,
            )
        };

        // The observer is intentionally process-lived. NSWorkspace's
        // notification center owns the copied block until app termination.
        std::mem::forget(observer);
    });

    Ok(())
}

fn update_presence(app: &AppHandle) {
    let workspace = NSWorkspace::sharedWorkspace();
    let desktop_active = match workspace.frontmostApplication() {
        // LuckyDrop's own windows count as the desktop so the charm stays
        // visible while it is being customized.
        Some(application) => {
            application.processIdentifier() == std::process::id() as i32
                || application
                    .bundleIdentifier()
                    .is_some_and(|identifier| identifier.to_string() == "com.apple.finder")
        }
        None => true,
    };
    super::set_desktop_active(app, desktop_active);
}
