from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any

from .errors import ValidationError


def _decode_json_column(row: dict[str, str], name: str, default: Any) -> Any:
    raw = row.pop(name, "")
    if not raw:
        return default
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValidationError(f"CSV column {name!r} is not valid JSON: {exc}") from exc


def load_records(path: str | Path) -> list[dict[str, Any]]:
    """Load normalized launch records from JSONL or CSV.

    CSV stores nested objects in `observations_json` and `outcome_30d_json`.
    `is_synthetic` is encoded as true/false. No implicit market-data lookup occurs.
    """
    source = Path(path)
    suffix = source.suffix.lower()
    if suffix in {".jsonl", ".ndjson"}:
        records: list[dict[str, Any]] = []
        with source.open("r", encoding="utf-8") as handle:
            for line_no, line in enumerate(handle, 1):
                if not line.strip():
                    continue
                try:
                    value = json.loads(line)
                except json.JSONDecodeError as exc:
                    raise ValidationError(f"{source}:{line_no}: invalid JSON: {exc}") from exc
                if not isinstance(value, dict):
                    raise ValidationError(f"{source}:{line_no}: record must be a JSON object")
                records.append(value)
        return records
    if suffix == ".csv":
        with source.open("r", encoding="utf-8", newline="") as handle:
            rows = []
            for row_no, raw_row in enumerate(csv.DictReader(handle), 2):
                row = dict(raw_row)
                raw_synthetic = row.get("is_synthetic", "").strip().lower()
                if raw_synthetic not in {"true", "false"}:
                    raise ValidationError(f"{source}:{row_no}: is_synthetic must be true or false")
                row["is_synthetic"] = raw_synthetic == "true"
                row["observations"] = _decode_json_column(row, "observations_json", {})
                outcome = _decode_json_column(row, "outcome_30d_json", None)
                if outcome is not None:
                    row["outcome_30d"] = outcome
                rows.append(row)
            return rows
    raise ValidationError(f"unsupported input format {suffix!r}; expected .jsonl, .ndjson, or .csv")


def write_json(path: str | Path, value: Any) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")

