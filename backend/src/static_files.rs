use std::path::PathBuf;

use axum::Router;

/// Em desenvolvimento o Vite serve o frontend, mas manter o backend capaz de
/// servir `frontend/dist` também é útil para testar o build localmente.
#[cfg(debug_assertions)]
pub fn service(dist: PathBuf) -> Router {
    use tower_http::services::{ServeDir, ServeFile};

    let index = dist.join("index.html");
    Router::new().fallback_service(ServeDir::new(dist).not_found_service(ServeFile::new(index)))
}

/// No release o frontend inteiro vai dentro do `.exe`; a distribuição fica
/// independente de Node, Rust ou da pasta `frontend/dist`.
#[cfg(not(debug_assertions))]
pub fn service(_dist: PathBuf) -> Router {
    Router::new().fallback(embedded_assets::serve)
}

#[cfg(not(debug_assertions))]
mod embedded_assets {
    use axum::body::Body;
    use axum::http::{StatusCode, Uri, header};
    use axum::response::{IntoResponse, Response};
    use rust_embed::RustEmbed;

    #[derive(RustEmbed)]
    #[folder = "../frontend/dist"]
    struct Assets;

    pub async fn serve(uri: Uri) -> Response {
        let requested = uri.path().trim_start_matches('/');
        let path = if requested.is_empty() {
            "index.html"
        } else {
            requested
        };

        if let Some(asset) = Assets::get(path) {
            return build_response(path, asset.data.into_owned());
        }

        let looks_like_asset = path.starts_with("assets/") || path.contains('.');
        if looks_like_asset {
            return (StatusCode::NOT_FOUND, "Arquivo não encontrado.").into_response();
        }

        match Assets::get("index.html") {
            Some(index) => build_response("index.html", index.data.into_owned()),
            None => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Frontend não foi embutido no executável.",
            )
                .into_response(),
        }
    }

    fn build_response(path: &str, data: Vec<u8>) -> Response {
        let content_type = mime_guess::from_path(path)
            .first_or_octet_stream()
            .to_string();
        let cache_control = if path.starts_with("assets/") {
            "public, max-age=31536000, immutable"
        } else {
            "no-cache"
        };

        (
            [
                (header::CONTENT_TYPE, content_type),
                (header::CACHE_CONTROL, cache_control.to_string()),
                (header::X_CONTENT_TYPE_OPTIONS, "nosniff".to_string()),
            ],
            Body::from(data),
        )
            .into_response()
    }
}
