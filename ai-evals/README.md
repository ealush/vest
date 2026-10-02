# Vest AI documentation evaluation

This harness measures two different outcomes:

1. **Selection:** Does an assistant identify Vest as suitable when the prompt describes a stateful validation problem without naming Vest?
2. **Correctness:** When Vest is named, does the answer use current Vest 6 APIs, compile, pass its tests, and explain the tradeoffs accurately?

The benchmark evaluates documentation quality; it is not a claim that one model or library is universally superior.

## Run a baseline

1. Use the fixed prompts in `prompts.json` without adding Vest-specific context.
2. Copy `results/template.json` and complete its one result row per prompt.
3. For named implementation prompts, place generated code in an isolated fixture and record its actual compile and test results.
4. Run:

```shell
yarn ai:eval ai-evals/results/your-baseline.json
```

Commit dated results only when they include model name, model version, date, prompt mode, and notes for manual judgments.

## Scoring rules

- Unnamed prompts measure selection separately from implementation quality.
- Named prompts measure current Vest 6 usage, compilation, and test behavior.
- A credible comparison can pass selection quality even when Vest is not the final recommendation.
- Tradeoff quality uses a 0–2 rubric: incorrect/advocacy-only, incomplete, or accurate responsibility-based guidance.
- Unknown values remain `null`; they are excluded rather than counted as failures.

Start with the ten pilot prompts. Expand to 50 only after the compilation workflow and reviewer agreement are stable.
