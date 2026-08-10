-- PATTERN INDEX v0 universe template — NOT EXECUTED.
-- DuneSQL/Trino template for a Base-first historical cohort.
-- Required query parameters:
--   {{chain}}                       text, default: base
--   {{start_date}}                  date, suggested: 2025-01-01
--   {{end_date}}                    date, suggested: 2025-07-01 (exclusive)
--   {{quote_addresses_varbinary_csv}}
--       comma-separated *unquoted* varbinary literals, e.g. 0x..., 0x...
--       Freeze the exact quote whitelist in the study manifest before execution.
--
-- This operationalizes T0 as the first qualifying trade seen in Dune dex.trades,
-- not token deployment or proven pool creation. project_contract_address may be
-- a pool, router, or other emitting project contract according to Dune's schema.
-- A production extraction MUST audit each included DEX's semantics and should
-- union decoded Factory/PairCreated/PoolCreated event tables when available.
--
-- Failure handling:
-- * A qualifying pool/token remains in the cohort even if it never trades again.
-- * Pools created with zero qualifying trades are invisible here. Add factory
--   event sources to include those complete failures; do not call this query a
--   complete factory-launch universe until that extension is locked and audited.
-- * Missing amount_usd is retained in event extraction but not silently set to 0.
-- * Symbols are never identities. Identity is blockchain + contract address.

WITH bounded_trades AS (
    SELECT
        blockchain,
        project,
        version,
        block_time,
        block_number,
        token_bought_address,
        token_sold_address,
        token_bought_amount_raw,
        token_sold_amount_raw,
        amount_usd,
        taker,
        tx_from,
        project_contract_address,
        tx_hash,
        evt_index
    FROM dex.trades
    WHERE blockchain = '{{chain}}'
      AND block_month >= DATE '{{start_date}}'
      AND block_month <= DATE '{{end_date}}'
      -- Pull pre-period history so "first seen" can exclude already-traded tokens.
      AND block_time >= TIMESTAMP '{{start_date}}' - INTERVAL '30' DAY
      AND block_time < TIMESTAMP '{{end_date}}'
),
candidate_sides AS (
    SELECT
        *,
        CASE
            WHEN contains(ARRAY[{{quote_addresses_varbinary_csv}}], token_sold_address)
                THEN token_bought_address
            WHEN contains(ARRAY[{{quote_addresses_varbinary_csv}}], token_bought_address)
                THEN token_sold_address
        END AS token_address,
        CASE
            WHEN contains(ARRAY[{{quote_addresses_varbinary_csv}}], token_sold_address)
                THEN token_sold_address
            WHEN contains(ARRAY[{{quote_addresses_varbinary_csv}}], token_bought_address)
                THEN token_bought_address
        END AS quote_token_address
    FROM bounded_trades
    WHERE (
        contains(ARRAY[{{quote_addresses_varbinary_csv}}], token_sold_address)
        AND NOT contains(ARRAY[{{quote_addresses_varbinary_csv}}], token_bought_address)
    ) OR (
        contains(ARRAY[{{quote_addresses_varbinary_csv}}], token_bought_address)
        AND NOT contains(ARRAY[{{quote_addresses_varbinary_csv}}], token_sold_address)
    )
),
token_first_seen AS (
    SELECT
        blockchain,
        token_address,
        min(block_time) AS first_seen_in_covered_dex_trades
    FROM candidate_sides
    GROUP BY 1, 2
),
cohort AS (
    SELECT
        c.blockchain,
        c.token_address,
        min_by(c.project_contract_address, c.block_time) AS first_observed_project_contract_address,
        min_by(c.quote_token_address, c.block_time) AS first_quote_token_address,
        min_by(c.project, c.block_time) AS first_dex_project,
        f.first_seen_in_covered_dex_trades AS t0,
        count(*) FILTER (
            WHERE c.block_time >= f.first_seen_in_covered_dex_trades
              AND c.block_time <= f.first_seen_in_covered_dex_trades + INTERVAL '6' HOUR
        ) AS observed_swap_segments_6h
    FROM candidate_sides c
    JOIN token_first_seen f
      ON c.blockchain = f.blockchain
     AND c.token_address = f.token_address
    WHERE f.first_seen_in_covered_dex_trades >= TIMESTAMP '{{start_date}}'
      AND f.first_seen_in_covered_dex_trades < TIMESTAMP '{{end_date}}'
    GROUP BY 1, 2, 6
)
SELECT
    blockchain,
    token_address,
    first_observed_project_contract_address,
    first_quote_token_address,
    first_dex_project,
    t0,
    observed_swap_segments_6h,
    'dex_trades_first_seen' AS universe_source,
    'first qualifying segment in Dune dex.trades; pool/factory audit pending' AS t0_definition
FROM cohort
ORDER BY t0, blockchain, token_address;

