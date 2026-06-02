mod db;

use csv::ReaderBuilder;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_sql::{Migration, MigrationKind};

use sqlx::SqlitePool;
pub struct AppState {
    pub db: SqlitePool,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust Hotreload?", name)
}
fn deserialize_decimal<'de, D>(deserializer: D) -> Result<f64, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;

    s.replace(',', ".")
        .parse::<f64>()
        .map_err(serde::de::Error::custom)
}

#[derive(Debug, Deserialize)]
struct ProdutoCsv {
    nome: String,
    sku: String,
    #[serde(deserialize_with = "deserialize_decimal")]
    preco: f64,
    quantity: Option<u32>,
}

#[derive(Debug, Deserialize)]
struct ProdutoJson {
    nome: String,
    sku: String,
    preco: f64,
    quantity: Option<u32>,
}

#[derive(Serialize)]
struct InsertResponse {
    status: bool,
    rows_updated: usize,
}

#[tauri::command]
async fn insert_produtos(
    state: State<'_, AppState>,
    csv_path: &str,
) -> Result<InsertResponse, String> {
    let mut rdr = ReaderBuilder::new()
        .delimiter(b';') // Accepts a single byte (e.g., b';', b'\t', b'|')
        .from_path(csv_path)
        .map_err(|e| e.to_string())?;
    // let mut rdr = Reader::from_path(csv_path).map_err(|e| e.to_string())?;

    let records: Vec<ProdutoCsv> = rdr
        .deserialize()
        .collect::<Result<Vec<ProdutoCsv>, _>>()
        .map_err(|e| e.to_string())?;

    let mut tx = state.db.begin().await.map_err(|e| e.to_string())?;

    let total_records = records.len();

    for record in records {
        println!("Processing {}", record.nome);

        if let Err(e) = sqlx::query(
            r#"
        INSERT OR REPLACE INTO produtos (
            sku,
            nome,
            preco
        )
        VALUES (?, ?, ?)
        "#,
        )
        .bind(record.sku)
        .bind(record.nome)
        .bind(record.preco)
        .execute(&mut *tx)
        .await
        {
            println!("Failed insert: {:?}", e);
        }
    }

    sqlx::query(r#"UPDATE onboarding SET completed = 1 where id = 1"#)
        .execute(&mut *tx)
        .await
        .unwrap();

    let result = tx.commit().await;

    if let Err(e) = result {
        println!("Failed commit: {:?}", e);
        return Err(e.to_string());
    }

    Ok(InsertResponse {
        status: true,
        rows_updated: total_records,
    })
}

#[tauri::command]
async fn process_sale(
    state: State<'_, AppState>,
    items: &str,
    desconto: f64,
    venda_id: Option<i64>,
) -> Result<InsertResponse, String> {
    let mut tx = state.db.begin().await.map_err(|e| e.to_string())?;

    let items_parsed: Vec<ProdutoJson> = serde_json::from_str(items).map_err(|e| {
        println!("JSON ERROR: {:?}", e);
        e.to_string()
    })?;

    let mut valor_total = 0.0;
    for item in items_parsed.iter() {
        valor_total += item.preco * item.quantity.unwrap_or(1) as f64;
    }
    let valor_desconto = valor_total * (1.0 - desconto / 100.0);
    println!(
        "Valor total: {}, Valor desconto: {}",
        valor_total, valor_desconto
    );

    let id_venda = if let Some(id) = venda_id {
        id
    } else {
        sqlx::query(
            r#"
        INSERT INTO vendas (data_venda, desconto, valor_total, valor_desconto)
        VALUES (datetime('now'), ?, ?, ?)
        "#,
        )
        .bind(desconto)
        .bind(valor_total)
        .bind(valor_desconto)
        .execute(&mut *tx)
        .await
        .unwrap()
        .last_insert_rowid()
    };

    for item in items_parsed.iter() {
        sqlx::query(
            r#"
            INSERT INTO itens_venda (venda_id, produto_sku, quantidade)
            VALUES (?, ?, ?)
            ON CONFLICT(venda_id, produto_sku) DO UPDATE SET quantidade = excluded.quantidade
            "#,
        )
        .bind(id_venda)
        .bind(&item.sku)
        .bind(item.quantity.unwrap_or(1) as i64)
        .execute(&mut *tx)
        .await
        .unwrap();
    }

    tx.commit().await.map_err(|e| e.to_string())?;
    println!(
        "Processing sale with items: {} and desconto: {}",
        items, desconto
    );

    Ok(InsertResponse {
        status: true,
        rows_updated: id_venda as usize,
    })
}

#[derive(Debug, Deserialize, Serialize)]
struct ProdutoVenda {
    sku: String,
    nome: String,
    preco: f64,
    quantidade: i64,
}

#[derive(Debug, Serialize)]
struct VendaFinal {
    id: i64,
    data_venda: String,
    desconto: f64,
    valor_total: f64,
    valor_desconto: f64,
    status: String,
    produtos: Vec<ProdutoVenda>,
}

#[tauri::command]
async fn exportar_vendas(state: State<'_, AppState>, app_handdle: AppHandle) -> Result<(), String> {
    let mut tx = state.db.begin().await.map_err(|e| e.to_string())?;

    let rows = sqlx::query(
        r#"
        SELECT
            v.id,
            v.data_venda,
            v.desconto,
            v.valor_total,
            v.valor_desconto,
            v.status,

            COALESCE(
                json_group_array(
                    json_object(
                        'sku', p.SKU,
                        'nome', p.nome,
                        'preco', p.preco,
                        'quantidade', iv.quantidade
                    )
                ),
                '[]'
            ) AS produtos

        FROM vendas v
        LEFT JOIN itens_venda iv ON iv.venda_id = v.id
        LEFT JOIN produtos p ON p.SKU = iv.produto_sku
        GROUP BY v.id
        "#,
    )
    .fetch_all(&mut *tx) // ✅ IMPORTANT FIX
    .await
    .map_err(|e| e.to_string())?;

    let mut result = Vec::new();

    for row in rows {
        let produtos_str: String = row.get("produtos");

        let produtos: Vec<ProdutoVenda> = serde_json::from_str(&produtos_str).unwrap_or_default();

        result.push(VendaFinal {
            id: row.get("id"),
            data_venda: row.get("data_venda"),
            desconto: row.get("desconto"),
            valor_total: row.get("valor_total"),
            valor_desconto: row.get("valor_desconto"),
            status: row.get("status"),
            produtos,
        });
    }

    tx.commit().await.map_err(|e| e.to_string())?;

    println!("{}", serde_json::to_string_pretty(&result).unwrap());
    let res = serde_json::to_string_pretty(&result).unwrap();
    let file_path = app_handdle
        .dialog()
        .file()
        .add_filter("json", &["json"])
        .set_file_name("vendas_exportadas.json")
        .blocking_save_file();

    if let Some(path) = file_path {
        println!("Selected file path: {:?}", path);
        std::fs::write(path.to_string(), res.clone()).map_err(|e| e.to_string())?;
        return Ok(());
    } else {
        println!("No file selected");
        return Err("No file selected".to_string());
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create basic setup",
        sql: "CREATE TABLE IF NOT EXISTS produtos (
                nome TEXT NOT NULL,
                SKU text NOT NULL PRIMARY KEY,
                preco float NOT NULL
            );

            CREATE TABLE IF NOT EXISTS vendas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data_venda TEXT NOT NULL,
                desconto float NOT NULL,
                valor_total float NOT NULL,
                valor_desconto float NOT NULL,
                status TEXT NOT NULL DEFAULT 'PENDENTE'
            );

            CREATE TABLE IF NOT EXISTS itens_venda (
                venda_id INTEGER NOT NULL,
                produto_sku TEXT NOT NULL,
                quantidade INTEGER NOT NULL,

                PRIMARY KEY (venda_id, produto_sku),

                FOREIGN KEY (venda_id) REFERENCES vendas(id),
                FOREIGN KEY (produto_sku) REFERENCES produtos(SKU)
            );

            CREATE TABLE IF NOT EXISTS onboarding (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                step INTEGER NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0
            );

            INSERT INTO onboarding (step, completed) VALUES (1, 0)
            ",
        kind: MigrationKind::Up,
    }];
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:test.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let handle = app.handle().clone();

            let db = tauri::async_runtime::block_on(async move {
                db::connect_db(&handle).await.expect("failed to connect db")
            });

            app.manage(AppState { db });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            insert_produtos,
            process_sale,
            exportar_vendas
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
