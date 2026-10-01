## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.054**    | 268.79   | 3.28%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.209**    | 258.04   | 2.40%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.267**    | 239.94   | 0.90%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.305**    | 239.1    | 0.83%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.281**    | 239.74   | 0.91%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.303**    | 233.35   | 0.25%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.268**    | 241.27   | 1.21%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.381**    | 122.45   | 0.75%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **860.89**   | 1.3836   | 0.42%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **483.24**   | 2.4288   | 0.51%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.49**     | 288.26   | 0.32%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.183**    | 246.74   | 0.90%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.228**    | 239.91   | 0.63%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.183**    | 243.42   | 0.60%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **174.3**    | 7.5287   | 2.74%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **164.41**   | 8.255    | 2.06%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **636.87**   | 2.7728   | 1.51%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.606**    | 118.39   | 0.67%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.23**     | 141.06   | 0.95%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.417**    | 135.9    | 0.37%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **201.49**   | 5.9079   | 1.87%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **126.7**    | 12.662   | 3.38%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.695**    | 118.53   | 1.17%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.704**    | 116.68   | 0.70%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **143.41**   | 10.7531  | 3.07%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **89.129**   | 13.806   | 2.21%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.252**    | 238.19   | 0.54%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.26**     | 237.77   | 0.43%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **200.88**   | 6.1947   | 2.11%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **337.94**   | 5.3278   | 3.24%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **227.42**   | 15.4803  | 9.92%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **287.98**   | 4.9555   | 1.80%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.168**    | 243.03   | 0.73%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **103.47**   | 15.0932  | 5.66%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **92.057**   | 22.2325  | 7.23%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **105.41**   | 12.0311  | 3.62%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **261.78**   | 6.691    | 4.42%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **144.53**   | 22.3827  | 8.44%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.542**    | 119.5    | 0.71%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.169**    | 261.35   | 2.36%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **379.22**   | 6.256    | 7.51%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **639.07**   | 6.0301   | 8.35%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **291.47**   | 9.6395   | 8.88%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **278.25**   | 8.3302   | 7.78%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.252**    | 238.81   | 0.69%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.201**    | 241.33   | 0.67%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.387**   | 101.43   | 12.10%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.514**    | 156.08   | 4.45%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.09**     | 165.26   | 8.23%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **129.8**    | 17.4496  | 7.25%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **237.87**   | 8.5284   | 3.37%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **75.949**   | 23.5863  | 5.71%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **30.409**   | 41.4269  | 2.64%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **19.515**   | 52.4948  | 0.76%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **183.87**   | 8.4273   | 2.81%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **537.36**   | 3.5117   | 7.99%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **528.67**   | 4.8071   | 8.86%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **349.29**   | 8.3667   | 4.76%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.778**    | 215.4    | 0.96%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.072**    | 489.14   | 0.52%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **247.84**   | 6.3507   | 10.60%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
