mod api;
mod db;
mod engine;
mod service;
mod static_files;


use std::env;
use std::error::Error;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use tracing_subscriber::EnvFilter;

pub fn now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("paciencia_backend=debug,tower_http=info")),
        )
        .init();

    let args: Vec<String> = env::args().skip(1).collect();
    if args.iter().any(|arg| arg == "--help" || arg == "-h") {
        print_help();
        return Ok(());
    }

    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let db_path = default_db_path(&manifest_dir);
    let dist_dir = env::var("FRONTEND_DIST")
        .map(PathBuf::from)
        .unwrap_or_else(|_| manifest_dir.join("../frontend/dist"));

    let pool = db::init(&db_path).await?;
    tracing::info!(arquivo = %db_path.display(), "SQLite pronto");

    let app = api::router(pool, dist_dir.clone());

    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let requested_port: u16 = env::var("PORT")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(3001);
    let listener = bind_listener(&host, requested_port).await?;
    let address = listener.local_addr()?;
    let url = browser_url(&host, address.port());

    tracing::info!("Paciência 95 — servidor em {url}");
    #[cfg(debug_assertions)]
    tracing::info!(pasta = %dist_dir.display(), "frontend servido do disco (modo dev)");
    #[cfg(not(debug_assertions))]
    tracing::info!("frontend embutido no executável");

    let no_open =
        args.iter().any(|arg| arg == "--no-open") || env::var_os("PACIENTIA_NO_OPEN").is_some();
    let force_open =
        args.iter().any(|arg| arg == "--open") || env::var_os("PACIENTIA_OPEN").is_some();
    let should_open = !no_open && (force_open || !cfg!(debug_assertions));

    if should_open {
        tracing::info!("Abrindo o navegador padrão...");
        open_browser(&url);
    } else {
        tracing::info!("Abra {url} no navegador.");
    }

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

fn print_help() {
    println!(
        "Paciência 95 {}\n\
         \n\
         Uso: Paciencia95.exe [--open | --no-open]\n\
         \n\
         Opções:\n\
           --open      abre o navegador padrão (padrão no executável release)\n\
           --no-open   apenas inicia o servidor e mostra o endereço\n\
           -h, --help  mostra esta ajuda\n\
         \n\
         Variáveis de ambiente:\n\
           PORT=3001                 porta local (0 escolhe uma porta livre)\n\
           HOST=127.0.0.1            interface de escuta\n\
           DATABASE_PATH=...         caminho completo do arquivo SQLite\n\
           PACIENTIA_DATA_DIR=...    pasta que guarda paciencia.db\n\
           PACIENTIA_NO_OPEN=1       equivale a --no-open",
        env!("CARGO_PKG_VERSION")
    );
}

async fn bind_listener(host: &str, port: u16) -> std::io::Result<tokio::net::TcpListener> {
    match tokio::net::TcpListener::bind((host, port)).await {
        Ok(listener) => Ok(listener),
        Err(error) if error.kind() == std::io::ErrorKind::AddrInUse && !cfg!(debug_assertions) => {
            tracing::warn!(port, "porta ocupada; usando uma porta livre");
            tokio::net::TcpListener::bind((host, 0)).await
        }
        Err(error) => Err(error),
    }
}

fn browser_url(host: &str, port: u16) -> String {
    let display_host = match host {
        "0.0.0.0" | "::" => "127.0.0.1",
        other => other,
    };
    if display_host.contains(':') {
        format!("http://[{display_host}]:{port}")
    } else {
        format!("http://{display_host}:{port}")
    }
}

fn open_browser(url: &str) {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        if let Err(error) = Command::new("cmd").args(["/C", "start", "", url]).spawn() {
            tracing::warn!(%error, "não foi possível abrir o navegador. Acesse {url}");
        }
    }

    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        if let Err(error) = Command::new("open").arg(url).spawn() {
            tracing::warn!(%error, "não foi possível abrir o navegador. Acesse {url}");
        }
    }

    #[cfg(all(unix, not(target_os = "macos")))]
    {
        use std::process::Command;
        if let Err(error) = Command::new("xdg-open").arg(url).spawn() {
            tracing::warn!(%error, "não foi possível abrir o navegador. Acesse {url}");
        }
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", unix)))]
    {
        let _ = url;
    }
}

/// Em desenvolvimento os dados ficam no repositório. Na distribuição Windows,
/// usa a pasta `dados` ao lado do executável (quando há o marcador
/// `portatil.txt`) ou `%LOCALAPPDATA%\Paciencia95`.
fn default_db_path(manifest_dir: &Path) -> PathBuf {
    if let Ok(value) = env::var("DATABASE_PATH")
        && !value.trim().is_empty()
    {
        return PathBuf::from(value);
    }

    if let Ok(value) = env::var("PACIENTIA_DATA_DIR")
        && !value.trim().is_empty()
    {
        return PathBuf::from(value).join("paciencia.db");
    }

    if cfg!(debug_assertions) {
        return manifest_dir.join("../data/paciencia.db");
    }

    if let Ok(executable) = env::current_exe()
        && let Some(directory) = executable.parent()
        && directory.join("portatil.txt").exists()
    {
        let data_directory = directory.join("dados");
        if ensure_writable_dir(&data_directory) {
            return data_directory.join("paciencia.db");
        }
        tracing::warn!(
            pasta = %data_directory.display(),
            "pasta portátil sem permissão de escrita; usando os dados do usuário"
        );
    }

    app_data_dir()
        .map(|base| base.join("Paciencia95").join("paciencia.db"))
        .unwrap_or_else(|| manifest_dir.join("../data/paciencia.db"))
}

fn ensure_writable_dir(directory: &Path) -> bool {
    if std::fs::create_dir_all(directory).is_err() {
        return false;
    }
    let probe = directory.join(".escrita-teste");
    match std::fs::write(&probe, b"ok") {
        Ok(()) => {
            let _ = std::fs::remove_file(probe);
            true
        }
        Err(_) => false,
    }
}

fn app_data_dir() -> Option<PathBuf> {
    if cfg!(target_os = "windows") {
        env::var_os("LOCALAPPDATA").map(PathBuf::from)
    } else if cfg!(target_os = "macos") {
        env::var_os("HOME").map(|home| PathBuf::from(home).join("Library/Application Support"))
    } else if cfg!(unix) {
        env::var_os("XDG_DATA_HOME")
            .map(PathBuf::from)
            .or_else(|| env::var_os("HOME").map(|home| PathBuf::from(home).join(".local/share")))
    } else {
        None
    }
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("não foi possível instalar o handler de Ctrl+C");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("não foi possível instalar o handler de SIGTERM")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn url_usa_loopback_quando_servidor_escuta_em_todas_as_interfaces() {
        assert_eq!(browser_url("0.0.0.0", 3001), "http://127.0.0.1:3001");
        assert_eq!(browser_url("127.0.0.1", 3001), "http://127.0.0.1:3001");
        assert_eq!(browser_url("::1", 3001), "http://[::1]:3001");
    }
}
