# MicroSift Sphinx Documentation Site Design

## Purpose

Create a clean, developer-focused documentation site for MicroSift. The site
will give maintainers one navigable source for local setup, system architecture,
authentication behavior, API behavior, infrastructure, and troubleshooting.
It will incorporate the existing diagrams and explain how each diagram maps to
the current implementation.

## Audience and success criteria

The primary audience is developers who build, maintain, or operate MicroSift.
The documentation is successful when a new maintainer can:

- start the local application and identify every exposed service;
- understand how React, Traefik, FastAPI, Keycloak, PostgreSQL, and Mailpit
  interact;
- follow registration, email verification, approval, login, API authorization,
  and logout flows;
- distinguish behavior implemented today from behavior shown as future design;
- locate the relevant frontend, backend, and infrastructure files; and
- build the documentation locally with one documented command and no Sphinx
  warnings.

## Technical approach

The documentation will be a standalone Python project rooted in `docs/` and
managed by `uv`. Sphinx will generate static HTML. MyST Parser will allow pages
to be authored in Markdown, matching the repository's existing documentation.
Furo will provide the HTML theme because it is responsive, readable, and does
not impose a data-science-oriented navigation model.

Documentation dependencies will be declared in `docs/pyproject.toml` and locked
in `docs/uv.lock`. The supported workflow will use `uv sync` followed by either
the Makefile or a direct `uv run sphinx-build` command. The build configuration
will enable strict warning handling so broken references and malformed source
documents fail verification.

## Information architecture

The site will use a task-first navigation structure:

```text
Home
├── Getting started
├── Architecture
│   ├── System overview
│   ├── Services
│   └── Request routing
├── Authentication and access
│   ├── Overview
│   ├── Registration and email verification
│   ├── Manual admin approval
│   ├── Login and token exchange
│   └── Protected API access and logout
├── Development
│   ├── Common commands
│   ├── Backend
│   └── Frontend
└── Operations
    ├── Keycloak configuration
    └── Troubleshooting
```

The home page will provide a short project description, a concise service map,
and direct links for setup, architecture, and authentication. Each subsection
will be included in a Sphinx toctree so navigation and search cover the entire
site.

## Content sources and accuracy

Content will be derived from the repository rather than copied blindly. The
primary sources are:

- root `ReadMe.md` and `compose.yaml` for the local workflow and service model;
- `Frontend/src/App.tsx` and `Frontend/src/auth.ts` for browser routes and
  Keycloak integration;
- `Backend/src/backend/api.py` for token validation and API behavior;
- `Infrastructure/traefik/dynamic.yaml` for routing;
- existing backend, frontend, and infrastructure README files; and
- images under `Diagrams/` and `Diagrams/login/`.

The current implementation has a public health endpoint plus authenticated
`/api/me` and approved-role-only `/api/approved` endpoints. Documentation will
not imply that market analysis or MongoDB access exists today. Where the
high-level login diagram includes those future concepts, its caption and nearby
text will label them as planned architecture.

Email verification and admin approval will be documented as separate gates.
Keycloak owns credentials, browser authentication, and role mappings. React
receives tokens through `keycloak-js`; FastAPI validates access tokens and
enforces the `approved` realm role. The application never handles a user's
Keycloak password directly.

## Diagram handling

The supplied PNG files will be copied into
`docs/source/_static/diagrams/`, grouped into high-level and detailed-flow
subdirectories. This makes the documentation build self-contained and prevents
links from depending on files outside the documentation source tree.

Each image will have:

- meaningful alternative text;
- a caption describing its scope;
- responsive sizing that remains readable on smaller screens; and
- accompanying prose summarizing the important path and failure states.

The three high-level sequence diagrams will introduce registration, approval,
and protected access. The detailed flow diagrams will support the corresponding
authentication and routing pages. The extensionless file `Diagrams/login/0`
will not be included unless it contains unique information not represented by
the named diagrams. The available source set omits a copied
`05_admin_approval.gv.png`; the existing high-level admin approval diagram will
cover that flow rather than creating or inventing an asset.

## Project files

The implementation will create:

- `pyproject.toml` and `uv.lock` for the documentation environment;
- `Makefile` for convenient HTML build and cleanup targets;
- `source/conf.py` for Sphinx, MyST, Furo, static assets, and project metadata;
- `source/index.md` and the section pages described above;
- `source/_static/custom.css` for small diagram and layout refinements; and
- `source/_static/diagrams/` containing documentation-owned copies of the
  selected assets.

Existing `docs/auth/architecture.md` and `docs/podman.md` contain useful source
material. Their accurate information will be incorporated into the new
structure. The original files may remain as compatibility stubs that point to
the new pages if repository links still target them; this avoids silently
breaking existing references.

Generated HTML will live under `docs/build/` and will be ignored by Git. Source
files and the dependency lockfile will remain tracked.

## Build behavior and failure handling

The documented strict build will be equivalent to:

```bash
uv run sphinx-build -W --keep-going -b html source build/html
```

`-W` converts warnings to failures and `--keep-going` reports all discoverable
problems in one run. Missing images, invalid internal references, duplicate
labels, and pages omitted from navigation must therefore be corrected before
the site is considered complete.

The documentation will avoid runtime calls to MicroSift services. This keeps
the build deterministic and allows it to run without Docker Compose, Keycloak,
or network access after dependencies are installed.

## Verification

Implementation verification will include:

1. Synchronizing the locked environment with `uv sync`.
2. Removing prior generated output through the Makefile cleanup target.
3. Running the strict Sphinx HTML build.
4. Confirming the expected HTML pages and copied diagram assets exist.
5. Reviewing the generated landing page and representative authentication page
   for navigation, image rendering, and readable layout.

No application behavior will change. Existing backend and frontend tests do not
need to be altered; the strict documentation build is the primary acceptance
test for this project.

## Out of scope

This first documentation pass will not add hosted deployment, CI publishing,
automatic Python API extraction, versioned documentation, localization, or new
application features. Those can be added later without changing the basic
source layout.
