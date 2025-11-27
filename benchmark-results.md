## 🚀 Benchmark Results

| Suite                    | Benchmark                        | Ops/sec (Hz) | P99 (ms) | Margin of Error |
| :----------------------- | :------------------------------- | :----------- | :------- | :-------------- |
| Field Volume Stress      | 500 fields                       | **5.33**     | 194.96   | 1.05%           |
| Field Volume Stress      | 1000 fields                      | **2.067**    | 498.2    | 1.24%           |
| Nested Fields with Hooks | depth 3 with 40 fields per level | **5.774**    | 175.95   | 2.02%           |
| Nested Fields with Hooks | depth 4 with 60 fields per level | **2.3**      | 444.27   | 4.79%           |
| Nested Fields with Hooks | depth 5 with 80 fields per level | **1.673**    | 600.72   | 6.44%           |
| Deep Nesting Stress      | depth 10                         | **156.78**   | 7.2128   | 0.71%           |
| Deep Nesting Stress      | depth 50                         | **16.381**   | 62.787   | 0.59%           |
| Deep Nesting Stress      | depth 100                        | **5.082**    | 198.54   | 0.41%           |
| Complex Feature Mix      | full run with feature flags      | **392.33**   | 3.5578   | 2.42%           |
| Complex Feature Mix      | focused/conditional run          | **545.73**   | 3.1992   | 9.02%           |
| Feature Coverage Matrix  | flow control one mode            | **554.91**   | 2.4625   | 2.34%           |
| Dynamic each and groups  | longer list                      | **485.32**   | 2.4181   | 1.62%           |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
