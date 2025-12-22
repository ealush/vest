## 🚀 Benchmark Results

### 174a94b5 - 2025-12-19

> Refactor(vest): Remove top-level registry hierarchy and simplify test registration

| Suite                    | Benchmark                        | Ops/sec (Hz) | P99 (ms) | Margin of Error |
| :----------------------- | :------------------------------- | :----------- | :------- | :-------------- |
| Field Volume Stress      | 500 fields                       | **5.5**      | 190      | 1.00%           |
| Field Volume Stress      | 1000 fields                      | **2**        | 400      | 1.00%           |
| Nested Fields with Hooks | depth 3 with 40 fields per level | **6**        | 170      | 1.00%           |

---

| Suite                    | Benchmark                        | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :----------------------- | :------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Field Volume Stress      | 500 fields                       | **5.5**      | 190      | 1.00%           | 0          | 0.00%    |
| Field Volume Stress      | 1000 fields                      | **2**        | 400      | 1.00%           | 0          | 0.00%    |
| Nested Fields with Hooks | depth 3 with 40 fields per level | **6**        | 170      | 1.00%           | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
