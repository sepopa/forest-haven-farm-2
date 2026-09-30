"""Tiny ad-hoc migration for columns added after the initial schema.

`Base.metadata.create_all()` only creates tables that don't exist yet — it
never alters an existing table. This project has no Alembic set up, so for
the handful of columns added post-launch we add them by hand with
`ALTER TABLE ... ADD COLUMN` (safe/idempotent to re-run) instead of dropping
data. Swap this for a real migration tool if the schema keeps growing.
"""
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

# table -> [(column_name, column_ddl), ...]
_NEW_COLUMNS = {
    "order_items": [
        ("item_id", "VARCHAR(60)"),
        ("unit_price", "FLOAT DEFAULT 0"),
    ],
    "admin_users": [
        ("email", "VARCHAR(255)"),
        ("reset_token", "VARCHAR(255)"),
        ("reset_token_expires", "DATETIME"),
    ],
}


def run_migrations(engine: Engine) -> None:
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as conn:
        for table, columns in _NEW_COLUMNS.items():
            if table not in existing_tables:
                continue  # create_all will create it fresh, already correct
            existing_columns = {col["name"] for col in inspector.get_columns(table)}
            for name, ddl in columns:
                if name not in existing_columns:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))
