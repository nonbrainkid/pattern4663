#!/usr/bin/env python3
"""Repository-local entry point; no package installation required."""

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from pattern_index.cli import main  # noqa: E402


if __name__ == "__main__":
    raise SystemExit(main())

