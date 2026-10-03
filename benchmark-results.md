## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.002**    | 271.86   | 2.69%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.132**    | 250.86   | 1.39%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.149**    | 249.8    | 0.99%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.072**    | 252.33   | 1.00%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.126**    | 249.7    | 0.92%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.154**    | 243.89   | 0.45%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.099**    | 249.55   | 0.91%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.933**    | 127.52   | 0.45%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **883.99**   | 1.5009   | 0.74%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **493.52**   | 2.4722   | 0.89%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.269**    | 309.21   | 0.53%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.006**    | 253.43   | 0.74%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.059**    | 247.98   | 0.32%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.978**    | 253.81   | 0.51%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **159.91**   | 8.7001   | 3.26%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **155.44**   | 8.2823   | 2.31%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **624.88**   | 2.8356   | 1.68%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.355**    | 127.08   | 1.59%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.112**    | 145.17   | 1.08%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.187**    | 140.61   | 0.36%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **190.15**   | 6.8394   | 2.08%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **117.93**   | 10.2698  | 2.73%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.536**    | 117.89   | 0.35%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.464**    | 120.84   | 0.67%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **131.96**   | 11.2108  | 3.92%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **82.37**    | 13.5713  | 2.11%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.15**     | 244.17   | 0.47%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.176**    | 241.68   | 0.37%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **192.88**   | 6.5571   | 2.08%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **332.44**   | 5.6128   | 3.21%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **228.88**   | 15.3966  | 9.85%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **296.38**   | 4.8516   | 1.67%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.109**    | 247.06   | 0.60%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **105.04**   | 14.7034  | 5.64%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **93.681**   | 19.148   | 7.39%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **109.7**    | 14.4937  | 3.97%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **271.74**   | 6.8385   | 4.53%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **144.05**   | 24.6477  | 8.69%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.546**    | 119.28   | 0.65%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.186**    | 242.12   | 0.53%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **386.92**   | 8.0098   | 8.50%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **623.66**   | 6.4754   | 9.09%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **276.56**   | 7.8076   | 8.00%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **288.58**   | 6.2117   | 5.89%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.26**     | 238.42   | 0.63%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.226**    | 240.05   | 0.50%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.462**   | 98.4651  | 11.36%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.599**    | 155.14   | 8.54%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **5.969**    | 168.56   | 7.74%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **137.28**   | 15.8493  | 5.15%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **225.88**   | 8.9848   | 3.36%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **75.243**   | 48.6827  | 8.58%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **31.121**   | 39.5794  | 2.16%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **19.86**    | 52.7525  | 0.87%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **184.58**   | 9.4558   | 3.20%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **579.83**   | 3.8159   | 7.81%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **498.4**    | 4.397    | 9.80%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **358.54**   | 9.5575   | 7.31%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.772**    | 214.1    | 0.68%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.078**    | 491.57   | 0.61%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **249.62**   | 6.6387   | 10.57%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
