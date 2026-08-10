from __future__ import annotations

import json
import csv
import sys
import tempfile
import unittest
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from pattern_index.baseline import prevalence_baseline  # noqa: E402
from pattern_index.errors import ValidationError  # noqa: E402
from pattern_index.features import compute_early_features  # noqa: E402
from pattern_index.io import load_records  # noqa: E402
from pattern_index.manifest import build_manifest  # noqa: E402
from pattern_index.splits import chronological_split  # noqa: E402
from pattern_index.validation import validate_record, validate_records  # noqa: E402


class PipelineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.records = load_records(ROOT / "data" / "synthetic_demo.jsonl")

    def test_schema_files_and_valid_fixture(self):
        launch_schema = json.loads((ROOT / "schema" / "launch.schema.json").read_text(encoding="utf-8"))
        manifest_schema = json.loads((ROOT / "schema" / "study-manifest.schema.json").read_text(encoding="utf-8"))
        self.assertEqual(launch_schema["$schema"], "https://json-schema.org/draft/2020-12/schema")
        self.assertIn("study_id", manifest_schema["required"])
        validate_records(self.records)

    def test_validation_rejects_real_record_with_synthetic_address(self):
        record = deepcopy(self.records[0])
        record["data_status"] = "observed"
        record["is_synthetic"] = False
        with self.assertRaises(ValidationError):
            validate_record(record)

    def test_validation_rejects_duplicate_chain_contract(self):
        with self.assertRaisesRegex(ValidationError, r"duplicate chain\+token"):
            validate_records([self.records[0], deepcopy(self.records[0])])

    def test_csv_loader_decodes_nested_normalized_record(self):
        record = deepcopy(self.records[0])
        observations = record.pop("observations")
        outcome = record.pop("outcome_30d")
        record["is_synthetic"] = "true"
        record["observations_json"] = json.dumps(observations)
        record["outcome_30d_json"] = json.dumps(outcome)
        with tempfile.TemporaryDirectory() as temp_dir:
            source = Path(temp_dir) / "launches.csv"
            with source.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=list(record))
                writer.writeheader()
                writer.writerow(record)
            loaded = load_records(source)
        validate_records(loaded)
        self.assertEqual(loaded[0]["token_address"], "synthetic:token:001")

    def test_feature_cutoff_excludes_future_and_pre_t0_observations(self):
        record = deepcopy(self.records[0])
        record["observations"]["swaps"].append({
            "timestamp": "2025-01-04T23:59:59Z",
            "trader": "synthetic:trader:pre",
            "side": "buy",
            "amount_usd": 888,
        })
        features = compute_early_features(record, cutoff_hours=6)
        self.assertEqual(features["swap_count"], 1)
        self.assertEqual(features["volume_usd"], 10)
        self.assertEqual(features["unique_traders"], 2)

    def test_cutoff_boundary_is_inclusive(self):
        features = compute_early_features(self.records[-1], cutoff_hours=6)
        self.assertEqual(features["swap_count"], 1)
        self.assertEqual(features["last_liquidity_usd"], 720)

    def test_chronological_split_is_deterministic_and_later(self):
        first = chronological_split(list(reversed(self.records)))
        second = chronological_split(self.records)
        ids = lambda rows: [row["token_address"] for row in rows]
        self.assertEqual({key: ids(value) for key, value in first.items()}, {key: ids(value) for key, value in second.items()})
        self.assertLess(first["train"][-1]["t0"], first["validation"][0]["t0"])
        self.assertLess(first["validation"][-1]["t0"], first["holdout"][0]["t0"])
        self.assertEqual({key: len(value) for key, value in first.items()}, {"train": 5, "validation": 1, "holdout": 2})

    def test_equal_t0_group_is_not_split(self):
        records = deepcopy(self.records)
        records[1]["t0"] = records[0]["t0"]
        split = chronological_split(records)
        locations = {
            row["token_address"]: name for name, rows in split.items() for row in rows
        }
        self.assertEqual(locations[records[0]["token_address"]], locations[records[1]["token_address"]])

    def test_prevalence_baseline(self):
        metrics = prevalence_baseline([0, 0, 1, 1], [0, 1])
        self.assertEqual(metrics["train_prevalence"], 0.5)
        self.assertEqual(metrics["brier_score"], 0.25)
        self.assertAlmostEqual(metrics["log_loss"], 0.6931471805599453)

    def test_manifest_is_reproducible_and_changes_with_file(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            sample = root / "input.txt"
            sample.write_text("alpha\n", encoding="utf-8")
            kwargs = {"generated_at": "2026-08-10T00:00:00Z", "parameters": {"cutoff": 6}}
            first = build_manifest(root, [sample], **kwargs)
            second = build_manifest(root, [sample], **kwargs)
            self.assertEqual(first, second)
            sample.write_text("beta\n", encoding="utf-8")
            third = build_manifest(root, [sample], **kwargs)
            self.assertNotEqual(first["study_id"], third["study_id"])


if __name__ == "__main__":
    unittest.main()
