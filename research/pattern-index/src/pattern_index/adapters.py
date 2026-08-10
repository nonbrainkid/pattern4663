from __future__ import annotations

import json
import os
import urllib.parse
import urllib.request
from typing import Any

from .errors import MissingCredentialError, PatternIndexError


def _required_key(*names: str) -> tuple[str, str]:
    for name in names:
        value = os.environ.get(name)
        if value:
            return name, value
    raise MissingCredentialError(
        "missing credential; configure one of these environment variables: " + ", ".join(names)
    )


def _json_request(url: str, headers: dict[str, str], timeout: float) -> Any:
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.load(response)
    except Exception as exc:
        raise PatternIndexError(f"remote request failed for host {urllib.parse.urlparse(url).netloc}: {exc}") from exc


class DuneAdapter:
    """Minimal read-only adapter for results of an already-saved Dune query."""

    def get_latest_query_result(self, query_id: int, timeout: float = 30.0) -> Any:
        _, key = _required_key("DUNE_API_KEY")
        url = f"https://api.dune.com/api/v1/query/{int(query_id)}/results"
        return _json_request(url, {"X-DUNE-API-KEY": key, "Accept": "application/json"}, timeout)


class CoinGeckoAdapter:
    """Contract-address enrichment; never defines the study universe."""

    def token_by_contract(self, platform: str, address: str, timeout: float = 30.0) -> Any:
        key_name, key = _required_key("COINGECKO_API_KEY", "COINGECKO_DEMO_API_KEY")
        if key_name == "COINGECKO_API_KEY":
            base = "https://pro-api.coingecko.com/api/v3"
            header = "x-cg-pro-api-key"
        else:
            base = "https://api.coingecko.com/api/v3"
            header = "x-cg-demo-api-key"
        url = f"{base}/coins/{urllib.parse.quote(platform)}/contract/{urllib.parse.quote(address)}"
        return _json_request(url, {header: key, "Accept": "application/json"}, timeout)


class DexScreenerPublicEnrichmentAdapter:
    """Keyless, current-snapshot enrichment only.

    This endpoint is discovery/ranking biased, has no historical completeness
    guarantee, and MUST NOT be used to construct or label the launch universe.
    """

    sampling_bias = "current public token-pair snapshot; incomplete historical and zero-activity coverage"

    def token_pairs(self, chain_id: str, token_address: str, timeout: float = 30.0) -> Any:
        url = (
            "https://api.dexscreener.com/token-pairs/v1/"
            f"{urllib.parse.quote(chain_id)}/{urllib.parse.quote(token_address)}"
        )
        return _json_request(url, {"Accept": "application/json"}, timeout)


def credential_status() -> dict[str, bool]:
    return {
        "DUNE_API_KEY": bool(os.environ.get("DUNE_API_KEY")),
        "COINGECKO_API_KEY": bool(os.environ.get("COINGECKO_API_KEY")),
        "COINGECKO_DEMO_API_KEY": bool(os.environ.get("COINGECKO_DEMO_API_KEY")),
        "DEXSCREENER_API_KEY": bool(os.environ.get("DEXSCREENER_API_KEY")),
    }

