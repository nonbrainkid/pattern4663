from __future__ import annotations

from typing import Any

from .validation import parse_timestamp


def chronological_split(
    records: list[dict[str, Any]], train_fraction: float = 0.6, validation_fraction: float = 0.2
) -> dict[str, list[dict[str, Any]]]:
    """Deterministic chronological split with identical T0 values kept together."""
    if not (0 < train_fraction < 1) or not (0 < validation_fraction < 1):
        raise ValueError("split fractions must be between 0 and 1")
    if train_fraction + validation_fraction >= 1:
        raise ValueError("train_fraction + validation_fraction must be less than 1")
    ordered = sorted(
        records,
        key=lambda row: (
            parse_timestamp(row["t0"], "t0"),
            row["chain"].lower(),
            row["token_address"].lower(),
        ),
    )
    groups: list[list[dict[str, Any]]] = []
    for row in ordered:
        if not groups or parse_timestamp(groups[-1][0]["t0"]) != parse_timestamp(row["t0"]):
            groups.append([])
        groups[-1].append(row)
    if len(groups) < 3:
        raise ValueError("at least three distinct T0 timestamps are required")
    n = len(ordered)
    cumulative = []
    running = 0
    for group in groups:
        running += len(group)
        cumulative.append(running)
    train_candidates = range(1, len(groups) - 1)
    train_group_count = min(train_candidates, key=lambda i: (abs(cumulative[i - 1] - n * train_fraction), i))
    validation_target = n * (train_fraction + validation_fraction)
    val_candidates = range(train_group_count + 1, len(groups))
    validation_end = min(val_candidates, key=lambda i: (abs(cumulative[i - 1] - validation_target), i))
    return {
        "train": [row for group in groups[:train_group_count] for row in group],
        "validation": [row for group in groups[train_group_count:validation_end] for row in group],
        "holdout": [row for group in groups[validation_end:] for row in group],
    }

