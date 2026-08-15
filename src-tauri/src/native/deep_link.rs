use tauri::AppHandle;
use tauri_plugin_deep_link::DeepLinkExt;
use url::Url;

pub fn initialize(app: &AppHandle) -> Result<(), String> {
    if let Err(error) = app.deep_link().register_all() {
        // Packaged applications are registered by their installer/bundle.
        // Development registration can legitimately be unavailable.
        eprintln!("[luckydrop] deep-link registration skipped: {error}");
    }

    let handle = app.clone();
    app.deep_link().on_open_url(move |event| {
        for url in event.urls() {
            handle_url(&handle, &url);
        }
    });

    if let Ok(Some(urls)) = app.deep_link().get_current() {
        for url in urls {
            handle_url(app, &url);
        }
    }
    Ok(())
}

fn handle_url(app: &AppHandle, url: &Url) {
    if url.scheme() != "luckydrop" || url.host_str() != Some("choose") {
        eprintln!("[luckydrop] ignored unsupported deep link: {url}");
        return;
    }

    let charm = url
        .query_pairs()
        .find_map(|(key, value)| (key == "charm").then(|| value.into_owned()));
    let Some(charm) = charm else {
        eprintln!("[luckydrop] choose link is missing a charm id");
        return;
    };

    match super::choose_charm(app, &charm) {
        Ok(()) => super::open_customizer(app),
        Err(error) => eprintln!("[luckydrop] rejected deep-link charm {charm:?}: {error}"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn expected_choose_link_shape_parses() {
        let url = Url::parse("luckydrop://choose?charm=nazar").expect("URL should parse");
        assert_eq!(url.scheme(), "luckydrop");
        assert_eq!(url.host_str(), Some("choose"));
        assert_eq!(
            url.query_pairs()
                .find_map(|(key, value)| (key == "charm").then(|| value.into_owned())),
            Some("nazar".into())
        );
    }
}
