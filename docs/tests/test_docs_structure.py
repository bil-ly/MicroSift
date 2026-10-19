from __future__ import annotations

from pathlib import Path


DOCS_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = DOCS_ROOT / "source"

REQUIRED_PAGES = (
    "getting-started.md",
    "architecture/overview.md",
    "architecture/services.md",
    "architecture/routing.md",
    "authentication/overview.md",
    "authentication/registration.md",
    "authentication/admin-approval.md",
    "authentication/login.md",
    "authentication/api-access.md",
    "development/commands.md",
    "development/backend.md",
    "development/frontend.md",
    "operations/keycloak.md",
    "operations/troubleshooting.md",
)

EXPECTED_DIAGRAMS = (
    "high-level/01-registration.png",
    "high-level/02-admin-approval.png",
    "high-level/03-login-and-access.png",
    "detailed/01-opening.png",
    "detailed/02-registration.png",
    "detailed/03-login.png",
    "detailed/04-dashboard.png",
    "detailed/06-api-outcomes-logout.png",
)


def source_path(relative: str) -> Path:
    return SOURCE_ROOT / relative


def read_source(relative: str) -> str:
    return source_path(relative).read_text(encoding="utf-8")


def test_required_pages_are_listed_in_index() -> None:
    index = read_source("index.md")
    omitted = [page for page in REQUIRED_PAGES if page.removesuffix(".md") not in index]

    assert omitted == []


def test_static_css_keeps_content_images_responsive() -> None:
    css = read_source("_static/custom.css")

    assert ".content img" in css
    assert "max-width: 100%" in css
    assert "height: auto" in css


def test_local_environment_secrets_are_not_documented() -> None:
    environment_file = DOCS_ROOT.parent / ".env"
    if not environment_file.exists() or not SOURCE_ROOT.exists():
        return

    secret_values = {
        value.strip().strip('"').strip("'")
        for line in environment_file.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.lstrip().startswith("#") and "=" in line
        for name in [line.split("=", 1)[0].upper()]
        for value in [line.split("=", 1)[1]]
        if any(marker in name for marker in ("PASSWORD", "SECRET", "TOKEN"))
        if value.strip()
    }
    markdown = "\n".join(
        path.read_text(encoding="utf-8") for path in SOURCE_ROOT.rglob("*.md")
    )

    leaked = sorted(value for value in secret_values if value in markdown)
    assert leaked == []


def test_expected_diagram_assets_are_packaged() -> None:
    diagram_root = source_path("_static/diagrams")
    missing = [
        relative
        for relative in EXPECTED_DIAGRAMS
        if not (diagram_root / relative).is_file()
        or (diagram_root / relative).stat().st_size == 0
    ]

    assert missing == []
