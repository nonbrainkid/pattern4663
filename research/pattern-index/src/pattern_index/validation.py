from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from .errors import ValidationError

EVM_ADDRESS = re.compile(r"^0x[0-9a-fA-F]{40}$")
SYNTHETIC_ADDRESS = re.compile(r"^synthetic:[a-z0-9:_-]+$")
REQUIRED_STRINGS = (
    "schema_version",
    "data_status",
    "chain",
    "token_address",
    "pool_address",
    "quote_token_address",
    "dex_project",
    "universe_source",
    "t0",
    "t0_definition",
)


def parse_timestamp(value: Any, field: str = "timestamp") -> datetime:
    if not isinstance(value, str):
        raise ValidationError(f"{field} must be an ISO-8601 string")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValidationError(f"{field} is not valid ISO-8601: {value!r}") from exc
    if parsed.tzinfo is None:
        raise ValidationError(f"{field} must include a timezone")
    return parsed.astimezone(timezone.utc)


def _number(value: Any, field: str, *, nonnegative: bool = True) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValidationError(f"{field} must be numeric")
    number = float(value)
    if nonnegative and number < 0:
        raise ValidationError(f"{field} must be non-negative")
    return number


def _address(value: Any, field: str, synthetic: bool) -> None:
    if not isinstance(value, str):
        raise ValidationError(f"{field} must be a string")
    allowed = SYNTHETIC_ADDRESS.fullmatch(value) if synthetic else EVM_ADDRESS.fullmatch(value)
    if not allowed:
        kind = "synthetic:*" if synthetic else "0x-prefixed 20-byte EVM"
        raise ValidationError(f"{field} must be a {kind} address")


def validate_record(record: dict[str, Any]) -> None:
    if not isinstance(record, dict):
        raise ValidationError("record must be an object")
    for field in REQUIRED_STRINGS:
        if not isinstance(record.get(field), str) or not record[field]:
            raise ValidationError(f"{field} is required and must be a non-empty string")
    if record["schema_version"] != "0.1.0":
        raise ValidationError("schema_version must be 0.1.0")
    if record["data_status"] not in {"synthetic", "observed", "partial"}:
        raise ValidationError("data_status must be synthetic, observed, or partial")
    if not isinstance(record.get("is_synthetic"), bool):
        raise ValidationError("is_synthetic must be boolean")
    synthetic = record["is_synthetic"]
    if synthetic != (record["data_status"] == "synthetic"):
        raise ValidationError("is_synthetic and data_status=synthetic must agree")
    for field in ("token_address", "pool_address", "quote_token_address"):
        _address(record[field], field, synthetic)
    t0 = parse_timestamp(record["t0"], "t0")
    observations = record.get("observations")
    if not isinstance(observations, dict):
        raise ValidationError("observations must be an object")
    for collection in ("swaps", "liquidity", "traders"):
        if collection not in observations or not isinstance(observations[collection], list):
            raise ValidationError(f"observations.{collection} must be an array")
    for index, swap in enumerate(observations["swaps"]):
        prefix = f"observations.swaps[{index}]"
        if not isinstance(swap, dict):
            raise ValidationError(f"{prefix} must be an object")
        parse_timestamp(swap.get("timestamp"), f"{prefix}.timestamp")
        _number(swap.get("amount_usd"), f"{prefix}.amount_usd")
        if swap.get("side") not in {"buy", "sell", "unknown"}:
            raise ValidationError(f"{prefix}.side must be buy, sell, or unknown")
        _address(swap.get("trader"), f"{prefix}.trader", synthetic)
    for index, point in enumerate(observations["liquidity"]):
        prefix = f"observations.liquidity[{index}]"
        if not isinstance(point, dict):
            raise ValidationError(f"{prefix} must be an object")
        parse_timestamp(point.get("timestamp"), f"{prefix}.timestamp")
        _number(point.get("liquidity_usd"), f"{prefix}.liquidity_usd")
    for index, trader in enumerate(observations["traders"]):
        prefix = f"observations.traders[{index}]"
        if not isinstance(trader, dict):
            raise ValidationError(f"{prefix} must be an object")
        parse_timestamp(trader.get("timestamp"), f"{prefix}.timestamp")
        _address(trader.get("address"), f"{prefix}.address", synthetic)
    outcome = record.get("outcome_30d")
    if outcome is not None:
        if not isinstance(outcome, dict):
            raise ValidationError("outcome_30d must be an object")
        window_end = parse_timestamp(outcome.get("window_end"), "outcome_30d.window_end")
        if window_end <= t0:
            raise ValidationError("outcome_30d.window_end must be after t0")
        label = outcome.get("success_label")
        if label not in {0, 1, None}:
            raise ValidationError("outcome_30d.success_label must be 0, 1, or null")
        if outcome.get("label_status") not in {
            "draft_synthetic", "observed_unlocked", "observed_locked", "missing"
        }:
            raise ValidationError("outcome_30d.label_status is invalid")
        for field in ("cumulative_volume_usd", "max_liquidity_usd"):
            if outcome.get(field) is not None:
                _number(outcome[field], f"outcome_30d.{field}")
        if outcome.get("last_trade_at") is not None:
            parse_timestamp(outcome["last_trade_at"], "outcome_30d.last_trade_at")


def validate_records(records: list[dict[str, Any]]) -> None:
    seen: set[tuple[str, str]] = set()
    for index, record in enumerate(records):
        try:
            validate_record(record)
        except ValidationError as exc:
            raise ValidationError(f"record[{index}]: {exc}") from exc
        identity = (record["chain"].lower(), record["token_address"].lower())
        if identity in seen:
            raise ValidationError(f"record[{index}]: duplicate chain+token identity {identity}")
        seen.add(identity)

