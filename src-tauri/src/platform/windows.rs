//! Windows foreground-window integration.

use std::sync::OnceLock;

use tauri::{AppHandle, WebviewWindow, Wry};
use windows::Win32::{
    Foundation::HWND,
    System::Threading::GetCurrentProcessId,
    UI::{
        Accessibility::{SetWinEventHook, HWINEVENTHOOK},
        WindowsAndMessaging::{
            GetClassNameW, GetForegroundWindow, GetWindowThreadProcessId, EVENT_SYSTEM_FOREGROUND,
            WINEVENT_OUTOFCONTEXT,
        },
    },
};

static APP: OnceLock<AppHandle<Wry>> = OnceLock::new();
static HOOK: OnceLock<usize> = OnceLock::new();

pub fn apply_companion_traits(window: &WebviewWindow) {
    let _ = window.set_skip_taskbar(true);
    let _ = window.set_always_on_top(false);
    let _ = window.set_focusable(false);
}

pub fn start_desktop_presence(app: &AppHandle) -> Result<(), String> {
    let _ = APP.set(app.clone());
    update_presence();

    let hook = unsafe {
        SetWinEventHook(
            EVENT_SYSTEM_FOREGROUND,
            EVENT_SYSTEM_FOREGROUND,
            None,
            Some(foreground_changed),
            0,
            0,
            WINEVENT_OUTOFCONTEXT,
        )
    };
    if hook.is_invalid() {
        return Err("could not install foreground-window listener".into());
    }
    let _ = HOOK.set(hook.0 as usize);
    Ok(())
}

unsafe extern "system" fn foreground_changed(
    _hook: HWINEVENTHOOK,
    _event: u32,
    _window: HWND,
    _object_id: i32,
    _child_id: i32,
    _thread_id: u32,
    _event_time: u32,
) {
    update_presence();
}

fn update_presence() {
    let foreground = unsafe { GetForegroundWindow() };
    // Nothing focused behaves like the desktop, and LuckyDrop's own windows
    // count as the desktop so the charm stays visible while it is customized.
    let desktop_active = foreground.is_invalid()
        || is_desktop_window(foreground)
        || belongs_to_this_process(foreground);
    if let Some(app) = APP.get() {
        super::set_desktop_active(app, desktop_active);
    }
}

fn is_desktop_window(window: HWND) -> bool {
    let mut class_name = [0u16; 128];
    let length = unsafe { GetClassNameW(window, &mut class_name) };
    if length <= 0 {
        return false;
    }
    let class_name = String::from_utf16_lossy(&class_name[..length as usize]);
    matches!(
        class_name.as_str(),
        "Progman" | "WorkerW" | "SHELLDLL_DefView"
    )
}

fn belongs_to_this_process(window: HWND) -> bool {
    let mut process_id = 0u32;
    unsafe { GetWindowThreadProcessId(window, Some(&mut process_id)) };
    process_id != 0 && process_id == unsafe { GetCurrentProcessId() }
}
