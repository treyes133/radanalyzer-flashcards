#!/usr/bin/env python3
"""Ensure key runtime packages exist inside the emulator venv.

The Firebase Emulator Suite creates/uses `functions/venv`; in constrained
environments `pip install` may download metadata without the actual package
contents, leaving imports like `firebase_admin` or `requests` unavailable.
This helper mirrors several required packages from the system installation
into the venv when they are missing so the emulator can start offline.
"""
from __future__ import annotations

import importlib.util
import shutil
import sys
import sysconfig
from pathlib import Path


def _site_packages(prefix: str) -> Path:
    """Return the purelib path for the given prefix."""
    paths = sysconfig.get_paths(vars={"base": prefix, "platbase": prefix})
    return Path(paths["purelib"]).resolve()


def _copy_module(module: str) -> None:
    if importlib.util.find_spec(module) is not None:
        return

    if sys.prefix == sys.base_prefix:
        raise RuntimeError("ensure_runtime_packages must run from inside the venv")

    venv_site = _site_packages(sys.prefix)
    system_site = _site_packages(sys.base_prefix)

    rel_path = Path(*module.split("."))
    source = system_site / rel_path
    if source.is_dir():
        target = venv_site / rel_path
        if target.exists():
            shutil.rmtree(target)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(source, target)
        return

    source_file = source.with_suffix(".py")
    if source_file.exists():
        target = venv_site / source_file.name
        shutil.copy2(source_file, target)
        return

    raise FileNotFoundError(
        f"Could not find module '{module}' in system site-packages: "
        f"{source}"
    )


def ensure_runtime_packages() -> None:
    for module in (
        "firebase_admin",
        "requests",
        "urllib3",
        "google",
    ):
        _copy_module(module)


if __name__ == "__main__":
    ensure_runtime_packages()
