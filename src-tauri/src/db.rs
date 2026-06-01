use std::path::PathBuf;

use sqlx::{
    sqlite::{SqliteConnectOptions, SqlitePoolOptions},
    SqlitePool,
};

use tauri::{AppHandle, Manager};

pub async fn connect_db(app: &AppHandle) -> Result<SqlitePool, Box<dyn std::error::Error>> {
    let app_dir = app.path().app_config_dir()?;

    std::fs::create_dir_all(&app_dir)?;

    let db_path: PathBuf = app_dir.join("test.db");

    let options = SqliteConnectOptions::new()
        .filename(db_path)
        .create_if_missing(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    sqlx::query("PRAGMA journal_mode = WAL;")
        .execute(&pool)
        .await?;

    Ok(pool)
}
