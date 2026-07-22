-- Reuse the immutable preview for generated portfolios published before
-- publishing began copying generated_versions.preview_url onto the portfolio.
UPDATE public.portfolios AS portfolio
SET screenshot_url = btrim(version.preview_url)
FROM public.generated_versions AS version
WHERE portfolio.published_version_id = version.id
  AND version.portfolio_id = portfolio.id
  AND upper(coalesce(portfolio.source_type, '')) = 'GENERATED'
  AND (portfolio.screenshot_url IS NULL OR btrim(portfolio.screenshot_url) = '')
  AND version.preview_url IS NOT NULL
  AND btrim(version.preview_url) <> '';
