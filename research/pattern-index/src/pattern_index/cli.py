from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .adapters import credential_status
from .baseline import prevalence_baseline
from .errors import PatternIndexError, ValidationError
from .features import compute_early_features
from .io import load_records, write_json
from .manifest import build_manifest
from .splits import chronological_split
from .validation import validate_records


def _labels(records: list[dict[str, Any]]) -> list[int]:
    labels = []
    for record in records:
        label = (record.get("outcome_30d") or {}).get("success_label")
        if label not in {0, 1}:
            raise ValidationError("baseline requires every record to have success_label 0 or 1")
        labels.append(label)
    return labels


def _summary(records: list[dict[str, Any]], source: Path) -> dict[str, Any]:
    validate_records(records)
    features = [compute_early_features(record, cutoff_hours=6) for record in records]
    splits = chronological_split(records)
    train_labels = _labels(splits["train"])
    return {
        "schema_version": "0.1.0",
        "study_status": "protocol_draft",
        "result_status": "no_result_claimed",
        "synthetic": all(record["is_synthetic"] for record in records),
        "market_data": False,
        "warning": "PIPELINE DEMONSTRATION ONLY — SYNTHETIC DATA, NOT MARKET EVIDENCE",
        "input": source.name,
        "record_count": len(records),
        "feature_cutoff_hours": 6,
        "feature_columns": sorted(key for key in features[0] if key not in {"chain", "token_address", "t0"}),
        "split_counts": {name: len(rows) for name, rows in splits.items()},
        "synthetic_baseline": {
            "validation": prevalence_baseline(train_labels, _labels(splits["validation"])),
            "holdout": prevalence_baseline(train_labels, _labels(splits["holdout"])),
        },
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="PATTERN INDEX reproducible research CLI")
    sub = parser.add_subparsers(dest="command", required=True)
    validate = sub.add_parser("validate", help="validate normalized JSONL/CSV")
    validate.add_argument("input")
    features = sub.add_parser("features", help="compute leakage-bounded early features")
    features.add_argument("input")
    features.add_argument("--cutoff-hours", type=int, default=6)
    features.add_argument("--output")
    baseline = sub.add_parser("baseline", help="chronological split and prevalence baseline")
    baseline.add_argument("input")
    baseline.add_argument("--output")
    manifest = sub.add_parser("manifest", help="hash study inputs into a deterministic manifest")
    manifest.add_argument("--root", default=".")
    manifest.add_argument("--file", action="append", required=True)
    manifest.add_argument("--generated-at", required=True, help="fixed ISO timestamp for reproducibility")
    manifest.add_argument("--output")
    demo = sub.add_parser("run-demo", help="run only the visibly synthetic fixture")
    demo.add_argument("--input", default="data/synthetic_demo.jsonl")
    demo.add_argument("--output", default="outputs/synthetic_demo_summary.json")
    sub.add_parser("credential-status", help="report only whether credential variables are present")
    return parser


def _emit(value: Any, output: str | None) -> None:
    if output:
        write_json(output, value)
    else:
        print(json.dumps(value, indent=2, sort_keys=True))


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.command == "credential-status":
            _emit({"credential_present": credential_status(), "secrets_logged": False}, None)
            return 0
        if args.command == "manifest":
            value = build_manifest(
                args.root, args.file, generated_at=args.generated_at,
                parameters={"feature_cutoff_hours": 6, "outcome_days": 30},
            )
            _emit(value, args.output)
            return 0
        source = Path(args.input)
        records = load_records(source)
        validate_records(records)
        if args.command == "validate":
            _emit({"valid": True, "records": len(records), "result_status": "no_result_claimed"}, None)
        elif args.command == "features":
            _emit([compute_early_features(record, args.cutoff_hours) for record in records], args.output)
        elif args.command == "baseline":
            splits = chronological_split(records)
            train_labels = _labels(splits["train"])
            value = {
                "result_status": "no_result_claimed",
                "split_counts": {key: len(rows) for key, rows in splits.items()},
                "validation": prevalence_baseline(train_labels, _labels(splits["validation"])),
                "holdout": prevalence_baseline(train_labels, _labels(splits["holdout"])),
            }
            _emit(value, args.output)
        elif args.command == "run-demo":
            if not all(record["is_synthetic"] for record in records):
                raise ValidationError("run-demo refuses any record not marked synthetic")
            _emit(_summary(records, source), args.output)
            print(f"wrote synthetic-only summary to {args.output}")
        return 0
    except (OSError, PatternIndexError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())

