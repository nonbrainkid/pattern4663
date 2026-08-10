from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Iterable


def sha256_file(path: str | Path) -> str:
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_manifest(
    root: str | Path,
    files: Iterable[str | Path],
    *,
    generated_at: str,
    status: str = "protocol_draft",
    result_status: str = "no_result_claimed",
    parameters: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build deterministic manifest when inputs and generated_at are fixed."""
    base = Path(root).resolve()
    entries = []
    for file_value in files:
        absolute = Path(file_value)
        if not absolute.is_absolute():
            absolute = base / absolute
        absolute = absolute.resolve()
        try:
            relative = absolute.relative_to(base).as_posix()
        except ValueError as exc:
            raise ValueError(f"manifest input escapes root: {absolute}") from exc
        entries.append({"path": relative, "sha256": sha256_file(absolute), "bytes": absolute.stat().st_size})
    body: dict[str, Any] = {
        "schema_version": "0.1.0",
        "generated_at": generated_at,
        "study_status": status,
        "result_status": result_status,
        "parameters": parameters or {},
        "inputs": sorted(entries, key=lambda item: item["path"]),
    }
    canonical = json.dumps(body, sort_keys=True, separators=(",", ":")).encode("utf-8")
    body["study_id"] = "sha256:" + hashlib.sha256(canonical).hexdigest()
    return body

