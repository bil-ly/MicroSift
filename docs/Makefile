SPHINXBUILD ?= uv run sphinx-build
SOURCEDIR = source
BUILDDIR = build

.PHONY: html clean check

html:
	$(SPHINXBUILD) -W --keep-going -b html $(SOURCEDIR) $(BUILDDIR)/html

clean:
	$(RM) -r $(BUILDDIR)

check:
	uv run pytest tests -v
	$(SPHINXBUILD) -W --keep-going -b html $(SOURCEDIR) $(BUILDDIR)/html
