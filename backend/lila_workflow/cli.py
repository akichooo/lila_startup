from __future__ import annotations

import argparse
import json
from pathlib import Path

from .workflow import run_analysis


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run Lila audio analysis for one JSON payload.")
    parser.add_argument("input", type=Path, help="JSON payload containing an audio_url and session metadata.")
    parser.add_argument("--report-only", action="store_true", help="Print only the teacher-facing report text.")
    args = parser.parse_args(argv)

    payload = json.loads(args.input.read_text(encoding="utf-8"))
    result = run_analysis(payload)
    if args.report_only:
        print(result["report_text"])
    else:
        print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
