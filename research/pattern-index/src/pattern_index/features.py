from __future__ import annotations

from datetime import timedelta
from typing import Any

from .validation import parse_timestamp, validate_record


def compute_early_features(record: dict[str, Any], cutoff_hours: int = 6) -> dict[str, Any]:
    """Compute scalar features only from observations in [T0, T0 + cutoff]."""
    if cutoff_hours <= 0:
        raise ValueError("cutoff_hours must be positive")
    validate_record(record)
    t0 = parse_timestamp(record["t0"], "t0")
    cutoff = t0 + timedelta(hours=cutoff_hours)
    swaps = [
        item for item in record["observations"]["swaps"]
        if t0 <= parse_timestamp(item["timestamp"]) <= cutoff
    ]
    liquidity = sorted(
        (
            item for item in record["observations"]["liquidity"]
            if t0 <= parse_timestamp(item["timestamp"]) <= cutoff
        ),
        key=lambda item: parse_timestamp(item["timestamp"]),
    )
    trader_events = [
        item for item in record["observations"]["traders"]
        if t0 <= parse_timestamp(item["timestamp"]) <= cutoff
    ]
    volume = sum(float(item["amount_usd"]) for item in swaps)
    buy_volume = sum(float(item["amount_usd"]) for item in swaps if item["side"] == "buy")
    traders = {item["trader"].lower() for item in swaps}
    traders.update(item["address"].lower() for item in trader_events)
    active_hours = {
        int((parse_timestamp(item["timestamp"]) - t0).total_seconds() // 3600)
        for item in swaps
    }
    initial_liquidity = float(liquidity[0]["liquidity_usd"]) if liquidity else None
    last_liquidity = float(liquidity[-1]["liquidity_usd"]) if liquidity else None
    liquidity_change_ratio = None
    if initial_liquidity not in {None, 0.0} and last_liquidity is not None:
        liquidity_change_ratio = (last_liquidity - initial_liquidity) / initial_liquidity
    return {
        "chain": record["chain"].lower(),
        "token_address": record["token_address"].lower(),
        "t0": record["t0"],
        "feature_cutoff_hours": cutoff_hours,
        "feature_cutoff_at": cutoff.isoformat().replace("+00:00", "Z"),
        "swap_count": len(swaps),
        "buy_count": sum(item["side"] == "buy" for item in swaps),
        "sell_count": sum(item["side"] == "sell" for item in swaps),
        "unknown_side_count": sum(item["side"] == "unknown" for item in swaps),
        "volume_usd": round(volume, 12),
        "buy_volume_ratio": round(buy_volume / volume, 12) if volume else None,
        "unique_traders": len(traders),
        "active_hour_buckets": len(active_hours),
        "initial_liquidity_usd": initial_liquidity,
        "last_liquidity_usd": last_liquidity,
        "liquidity_change_ratio": (
            round(liquidity_change_ratio, 12) if liquidity_change_ratio is not None else None
        ),
    }

