use tauri::{
    menu::{MenuBuilder, MenuItem, SubmenuBuilder},
    tray::TrayIconBuilder,
    AppHandle, Manager, Wry,
};

use crate::settings::CharmSettings;

struct TrayState {
    show: MenuItem<Wry>,
    hide: MenuItem<Wry>,
}

const CHARM_MENU: &[(&str, &str)] = &[
    ("nazar", "Nazar"),
    ("nimbu-mirchi", "Nimbu-Mirchi"),
    ("lucky-cat", "Lucky Cat"),
    ("horseshoe", "Horseshoe"),
    ("clover", "Four Leaf Clover"),
    ("hamsa", "Hamsa"),
    ("daruma", "Daruma"),
    ("drishti-bommai", "Drishti Bommai"),
    ("scarab", "Scarab"),
    ("lucky-coin", "Lucky Coin"),
    ("red-knot", "Endless Red Knot"),
    ("eye-bead", "Glass Eye Bead"),
];

pub fn create(app: &AppHandle, settings: &CharmSettings) -> tauri::Result<()> {
    let title = MenuItem::with_id(app, "title", "LuckyDrop", false, None::<&str>)?;
    let show = MenuItem::with_id(
        app,
        "show-charm",
        "Show Charm",
        !settings.visible,
        None::<&str>,
    )?;
    let hide = MenuItem::with_id(
        app,
        "hide-charm",
        "Hide Charm",
        settings.visible,
        None::<&str>,
    )?;
    let customize = MenuItem::with_id(
        app,
        "open-customizer",
        "Open Customization…",
        true,
        None::<&str>,
    )?;
    let settings_item = MenuItem::with_id(app, "settings", "Settings…", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit LuckyDrop", true, None::<&str>)?;

    let mut choose_builder = SubmenuBuilder::new(app, "Choose Charm");
    for (id, name) in CHARM_MENU {
        choose_builder = choose_builder.text(format!("choose:{id}"), name);
    }
    let choose = choose_builder.build()?;

    let menu = MenuBuilder::new(app)
        .item(&title)
        .separator()
        .item(&show)
        .item(&hide)
        .item(&customize)
        .item(&choose)
        .item(&settings_item)
        .separator()
        .item(&quit)
        .build()?;

    let mut tray = TrayIconBuilder::with_id("luckydrop")
        .menu(&menu)
        .tooltip("LuckyDrop")
        .icon_as_template(cfg!(target_os = "macos"))
        .on_menu_event(handle_menu_event);
    if let Some(icon) = app.default_window_icon().cloned() {
        tray = tray.icon(icon);
    }
    tray.build(app)?;

    app.manage(TrayState { show, hide });
    Ok(())
}

pub fn refresh(app: &AppHandle, settings: &CharmSettings) {
    if let Some(tray) = app.try_state::<TrayState>() {
        let _ = tray.show.set_enabled(!settings.visible);
        let _ = tray.hide.set_enabled(settings.visible);
    }
}

fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    let id = event.id().as_ref();
    let result = match id {
        "show-charm" => super::set_charm_visibility(app, true),
        "hide-charm" => super::set_charm_visibility(app, false),
        "open-customizer" | "settings" => {
            super::open_customizer(app);
            Ok(())
        }
        "quit" => {
            app.exit(0);
            Ok(())
        }
        _ if id.starts_with("choose:") => super::choose_charm(app, &id["choose:".len()..]),
        _ => Ok(()),
    };

    if let Err(error) = result {
        eprintln!("[luckydrop] tray action {id:?} failed: {error}");
    }
}
