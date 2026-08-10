from __future__ import annotations

import math
from typing import Iterable


def prevalence(labels: Iterable[int]) -> float:
    values = list(labels)
    if not values:
        raise ValueError("at least one label is required")
    if any(value not in {0, 1} for value in values):
        raise ValueError("labels must be 0 or 1")
    return sum(values) / len(values)


def prevalence_baseline(train_labels: Iterable[int], evaluation_labels: Iterable[int]) -> dict[str, float | int]:
    """Evaluate a constant probability learned only from training prevalence."""
    train = list(train_labels)
    evaluation = list(evaluation_labels)
    probability = prevalence(train)
    if not evaluation:
        raise ValueError("at least one evaluation label is required")
    if any(value not in {0, 1} for value in evaluation):
        raise ValueError("labels must be 0 or 1")
    predicted_class = 1 if probability >= 0.5 else 0
    clipped = min(max(probability, 1e-15), 1 - 1e-15)
    brier = sum((probability - label) ** 2 for label in evaluation) / len(evaluation)
    log_loss = -sum(
        label * math.log(clipped) + (1 - label) * math.log(1 - clipped)
        for label in evaluation
    ) / len(evaluation)
    return {
        "train_n": len(train),
        "train_positive": sum(train),
        "train_prevalence": probability,
        "evaluation_n": len(evaluation),
        "evaluation_positive": sum(evaluation),
        "predicted_class": predicted_class,
        "accuracy": sum(label == predicted_class for label in evaluation) / len(evaluation),
        "brier_score": brier,
        "log_loss": log_loss,
    }

