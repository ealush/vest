## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.063**    | 268.3    | 2.87%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.212**    | 245.9    | 1.24%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.236**    | 239.62   | 0.71%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.236**    | 239.57   | 0.56%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.234**    | 237.81   | 0.38%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.262**    | 240.01   | 0.90%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.259**    | 237.65   | 0.37%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.23**     | 126.06   | 1.01%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **899.74**   | 1.5051   | 1.03%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **531.04**   | 2.1596   | 0.40%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.372**    | 298.44   | 0.28%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.178**    | 243.87   | 0.65%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.214**    | 241.1    | 0.57%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.171**    | 241.21   | 0.32%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **167.97**   | 10.3804  | 3.05%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **165.6**    | 7.9144   | 1.94%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **619.95**   | 2.6362   | 1.25%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.797**    | 115.99   | 0.93%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.38**     | 138.47   | 1.16%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.44**     | 136.26   | 0.44%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **200.24**   | 6.0096   | 1.89%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **126.1**    | 10.7622  | 2.68%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.883**    | 114.97   | 0.65%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **9.036**    | 111.52   | 0.38%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **149.56**   | 9.1892   | 2.50%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **91.951**   | 13.2433  | 2.22%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.32**     | 233.35   | 0.39%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.357**    | 233.71   | 0.69%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **199.87**   | 6.098    | 2.08%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **337.06**   | 5.4445   | 3.04%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **244.4**    | 10.7332  | 8.05%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **306.16**   | 4.2979   | 1.05%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.324**    | 233.46   | 0.32%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **108.64**   | 14.2448  | 5.36%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **95.556**   | 17.5212  | 6.70%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **109.88**   | 11.1479  | 3.18%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **273.7**    | 6.0599   | 3.95%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **145.52**   | 44.7833  | 15.68%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.976**    | 112.86   | 0.48%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.462**    | 227.68   | 0.50%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **391.68**   | 6.1897   | 7.20%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **619.21**   | 6.2895   | 9.52%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **299.05**   | 6.3022   | 7.52%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **299.94**   | 6.1446   | 5.54%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.429**    | 228.65   | 0.50%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.391**    | 230.21   | 0.41%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.797**   | 94.3604  | 9.34%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.835**    | 150.95   | 10.62%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.207**    | 161.92   | 6.44%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **140.83**   | 15.1681  | 8.40%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **238.6**    | 7.8008   | 2.97%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **80.377**   | 48.216   | 8.58%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **33.167**   | 34.7644  | 1.51%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **21.349**   | 48.9319  | 0.71%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **190.37**   | 9.2669   | 2.91%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **574.94**   | 3.6085   | 7.15%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **514.61**   | 4.5226   | 9.52%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **364.71**   | 8.4458   | 4.58%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.827**    | 215.74   | 1.07%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.112**    | 491.1    | 0.97%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **271.66**   | 5.9111   | 10.42%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
