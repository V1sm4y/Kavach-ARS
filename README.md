# Kavach ARS

## Autonomous Remediation System for Secure Software

Kavach ARS is a defensive cyber-reasoning system for authorized software targets. It combines static analysis, dependency scanning, dynamic testing, and an LLM-guided patch planner to find a vulnerability, generate a minimal remediation, and prove that the fix holds.

The system is designed around one closed loop:

```text
Detect -> Validate -> Reason -> Patch -> Verify -> Report
```

## Problem

Security teams often receive vulnerability alerts without a tested remediation. Manual triage, patching, and verification delay fixes in mission-support software.

Kavach ARS transforms validated findings into an auditable remediation package: evidence, a safe regression test, a minimal Git patch, validation results, and a final approval decision.

## Core Workflow

1. Ingest an approved source repository or containerized application.
2. Check target policy and isolate the analysis workspace.
3. Run static analysis, dependency scanning, test discovery, and targeted testing.
4. Normalize and prioritize high-confidence findings.
5. Create a safe reproduction or security regression test.
6. Ask the LLM for a structured, minimal patch proposal.
7. Apply the patch only in a disposable Git/Docker workspace.
8. Run functional tests, regression tests, and targeted property or fuzz tests.
9. Export an evidence dossier for analyst approval.

## Architecture

```text
Approved target + policy
          |
          v
Static scan / dependency scan / test discovery
          |
          v
Evidence normalizer and risk prioritizer
          |
          v
LLM patch planner (structured output only)
          |
          v
Docker validation sandbox
          |
          v
Regression proof + evidence dossier
```

## MVP Scope

The first release supports Python Flask/FastAPI targets in Docker.

Initial vulnerability classes:

- Path traversal
- Command injection
- SQL injection
- Known vulnerable Python dependencies

The first complete demonstration should support path traversal and command injection. Further vulnerability classes are added only after the patch-and-proof loop is stable.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Orchestration | Python 3.11, Typer, optional FastAPI |
| Static analysis | Semgrep, Bandit |
| Dependency scanning | pip-audit |
| Functional and regression tests | pytest |
| Property testing | Hypothesis |
| Targeted fuzzing | Atheris |
| AI patch planning | Local LLM through Ollama or an approved secure endpoint |
| Isolation | Docker |
| Patch and rollback | Git |
| Evidence storage | SQLite |
| Reporting | JSON, SARIF, SHA-256 hashes |
| Policy controls | YAML |

## Safety Model

Kavach ARS is defensive by design.

- It runs only against administrator-approved targets.
- Analysis and patching use a disposable isolated workspace.
- Network access is disabled in the validation sandbox by default.
- The LLM cannot directly run shell commands or deploy patches.
- Every patch requires functional and security validation.
- Human approval is required before release or deployment.
- Reports contain evidence and integrity hashes, but never secrets.

## Target Policy

Each target includes a policy that constrains scope and remediation authority.

```yaml
allowed_paths:
  - app/
  - tests/

blocked_paths:
  - infrastructure/
  - secrets/
  - production/

max_files_changed: 3
max_patch_lines: 80
network_access: false
human_approval_required: true
```

## Acceptance Gate

A patch is accepted only when all checks pass:

- The finding is supported by scanner and/or runtime evidence.
- The safe security regression test demonstrates the original issue.
- Existing functional tests pass after the patch.
- The security regression is blocked after the patch.
- Targeted property or fuzz tests pass.
- The patch complies with target policy and permitted file scope.

## Evidence Package

Every successful run produces:

```text
finding.json
reproduction_test.py
patch.diff
validation_results.json
report.sarif
integrity_hashes.json
```

## Implementation Roadmap

### Phase 1: Target and Baseline

- Build a containerized Flask/FastAPI telemetry service with seeded, authorized vulnerabilities.
- Add normal functional tests.
- Integrate Semgrep, Bandit, pip-audit, and pytest.

### Phase 2: Evidence Pipeline

- Create a target manifest and YAML policy validator.
- Normalize tool output into a common finding model.
- Rank findings by severity and confidence.

### Phase 3: Patch and Proof

- Generate security regression tests for supported vulnerability types.
- Add Git worktree and Docker sandbox execution.
- Add strict JSON LLM patch proposals.
- Implement the validation and policy acceptance gate.

### Phase 4: Demonstration

- Demonstrate two end-to-end verified remediations.
- Export JSON/SARIF reports and a human-readable evidence summary.
- Adapt the target manifest for the competition's supplied infrastructure.

## Definition of Done

The MVP is complete when one command can safely execute the full workflow against an authorized target and return:

```text
Finding: confirmed
Reproduction: passed
Patch: generated and applied in sandbox
Functional tests: passed
Security regression: blocked
Verdict: ready for analyst approval
Evidence dossier: generated
```

## Project Status

Planning and implementation setup. No production deployment, automatic merge, or uncontrolled network scanning is part of the MVP.
