//! X11 desktop presence. Wayland intentionally keeps the charm hidden because
//! strict desktop-only behaviour needs APIs Wayland compositors do not expose.

use std::thread;

use tauri::{AppHandle, WebviewWindow};
use x11rb::{
    connection::Connection,
    protocol::{
        xproto::{Atom, AtomEnum, ChangeWindowAttributesAux, ConnectionExt, EventMask, Window},
        Event,
    },
    rust_connection::RustConnection,
};

struct Atoms {
    active_window: Atom,
    window_type: Atom,
    desktop_window_type: Atom,
    process_id: Atom,
}

pub fn apply_companion_traits(window: &WebviewWindow) {
    let _ = window.set_skip_taskbar(true);
    let _ = window.set_always_on_top(false);
    let _ = window.set_focusable(false);
}

pub fn start_desktop_presence(app: &AppHandle) -> Result<(), String> {
    let session = std::env::var("XDG_SESSION_TYPE").unwrap_or_default();
    if !session.eq_ignore_ascii_case("x11") {
        super::set_desktop_active(app, false);
        eprintln!("[luckydrop] desktop charm disabled: strict desktop mode requires X11");
        return Ok(());
    }

    let handle = app.clone();
    thread::Builder::new()
        .name("luckydrop-x11-presence".into())
        .spawn(move || {
            if let Err(error) = watch_x11_desktop(&handle) {
                eprintln!("[luckydrop] X11 desktop listener stopped: {error}");
                super::set_desktop_active(&handle, false);
            }
        })
        .map_err(|error| format!("could not start X11 desktop listener: {error}"))?;
    Ok(())
}

fn watch_x11_desktop(app: &AppHandle) -> Result<(), String> {
    let (connection, screen_index) =
        x11rb::connect(None).map_err(|error| format!("X11 connection failed: {error}"))?;
    let root = connection.setup().roots[screen_index].root;
    let atoms = Atoms {
        active_window: intern(&connection, b"_NET_ACTIVE_WINDOW")?,
        window_type: intern(&connection, b"_NET_WM_WINDOW_TYPE")?,
        desktop_window_type: intern(&connection, b"_NET_WM_WINDOW_TYPE_DESKTOP")?,
        process_id: intern(&connection, b"_NET_WM_PID")?,
    };

    connection
        .change_window_attributes(
            root,
            &ChangeWindowAttributesAux::new().event_mask(EventMask::PROPERTY_CHANGE),
        )
        .map_err(|error| format!("could not subscribe to root properties: {error}"))?;
    connection.flush().map_err(|error| error.to_string())?;

    update_x11_presence(app, &connection, root, &atoms)?;

    loop {
        let event = connection
            .wait_for_event()
            .map_err(|error| format!("X11 event read failed: {error}"))?;
        if let Event::PropertyNotify(event) = event {
            if event.window == root && event.atom == atoms.active_window {
                update_x11_presence(app, &connection, root, &atoms)?;
            }
        }
    }
}

fn update_x11_presence(
    app: &AppHandle,
    connection: &RustConnection,
    root: Window,
    atoms: &Atoms,
) -> Result<(), String> {
    let active = property(connection, root, atoms.active_window, AtomEnum::WINDOW, 1)?
        .into_iter()
        .next()
        .unwrap_or(0);

    // Nothing focused means the desktop itself is active, and LuckyDrop's own
    // windows count as the desktop so the charm stays visible while it is
    // customized.
    let desktop_active = if active == 0 || active == root {
        true
    } else {
        property(connection, active, atoms.window_type, AtomEnum::ATOM, 16)?
            .into_iter()
            .any(|value| value == atoms.desktop_window_type)
            || property(connection, active, atoms.process_id, AtomEnum::CARDINAL, 1)?
                .into_iter()
                .any(|value| value == std::process::id())
    };
    super::set_desktop_active(app, desktop_active);
    Ok(())
}

fn property(
    connection: &RustConnection,
    window: Window,
    property: Atom,
    kind: AtomEnum,
    length: u32,
) -> Result<Vec<u32>, String> {
    Ok(connection
        .get_property(false, window, property, kind, 0, length)
        .map_err(|error| error.to_string())?
        .reply()
        .map_err(|error| error.to_string())?
        .value32()
        .map(|values| values.collect())
        .unwrap_or_default())
}

fn intern(connection: &RustConnection, name: &[u8]) -> Result<Atom, String> {
    connection
        .intern_atom(false, name)
        .map_err(|error| error.to_string())?
        .reply()
        .map(|reply| reply.atom)
        .map_err(|error| error.to_string())
}
