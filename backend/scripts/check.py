#!/usr/bin/env python3
"""Run all code quality checks."""

import subprocess
import sys
from typing import List, Tuple


def run_command(command: List[str]) -> Tuple[int, str, str]:
    """Run a command and return its exit code, stdout, and stderr."""
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
    )
    stdout, stderr = process.communicate()
    return process.returncode, stdout, stderr


def main() -> int:
    """Run all checks and return 0 if all passed, 1 if any failed."""
    checks = [
        (["black", ".", "--check"], "Black (code formatting)"),
        (["flake8", "."], "Flake8 (code style)"),
        (["isort", ".", "--check"], "isort (import sorting)"),
        (["pytest"], "pytest (unit tests)"),
    ]

    failed = False
    for command, description in checks:
        print(f"\nRunning {description}...")
        exit_code, stdout, stderr = run_command(command)
        
        if exit_code != 0:
            failed = True
            print(f"❌ {description} failed!")
            if stdout:
                print("stdout:", stdout)
            if stderr:
                print("stderr:", stderr)
        else:
            print(f"✅ {description} passed!")

    if failed:
        print("\n❌ Some checks failed!")
        return 1
    
    print("\n✅ All checks passed!")
    return 0


if __name__ == "__main__":
    sys.exit(main()) 