-- Renumber existing transactions continuously within each calendar day.
-- New transactions continue from MAX(dailySeq) + 1 in application code.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY DATE("createdAt")
      ORDER BY "createdAt" ASC, id ASC
    )::INTEGER AS seq
  FROM transactions
)
UPDATE transactions AS t
SET "dailySeq" = ranked.seq
FROM ranked
WHERE t.id = ranked.id;
