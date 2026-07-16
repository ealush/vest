## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.964**    | 284.16   | 3.74%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.13**     | 248.11   | 1.00%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.108**    | 249.34   | 0.76%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.078**    | 265.56   | 2.24%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.043**    | 258.02   | 1.87%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.007**    | 263.64   | 2.02%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.094**    | 254.49   | 1.26%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.803**    | 147.82   | 4.17%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **862.23**   | 1.4496   | 1.04%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **411.53**   | 7.8515   | 7.95%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.645**    | 276.36   | 0.33%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.073**    | 256.35   | 1.27%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.102**    | 246.45   | 0.38%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.019**    | 262.01   | 1.42%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **167.58**   | 10.1954  | 3.33%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **165.93**   | 7.7859   | 2.26%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **643.43**   | 2.7052   | 1.49%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.748**    | 115.5    | 0.44%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.3**      | 140.83   | 1.56%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.443**    | 136.9    | 0.63%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **201.76**   | 6.1404   | 2.26%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **126.96**   | 11.4941  | 2.89%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.443**    | 122.2    | 0.92%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.356**    | 122.59   | 0.77%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **144.81**   | 11.6605  | 3.07%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **87.898**   | 14.5424  | 3.02%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.207**    | 242.49   | 0.77%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.257**    | 237.43   | 0.49%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **203.87**   | 6.2009   | 2.07%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **356.75**   | 5.2627   | 3.17%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **353.82**   | 8.4531   | 5.79%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **281.16**   | 4.6677   | 1.90%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.176**    | 263.84   | 2.69%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **106.84**   | 15.7014  | 5.86%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **97.505**   | 20.4658  | 5.49%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **108.58**   | 11.7759  | 3.07%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **268.74**   | 6.335    | 4.20%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **166.51**   | 8.2521   | 1.80%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.597**    | 128.58   | 2.74%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.348**    | 234.77   | 0.61%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **386.01**   | 6.1127   | 6.98%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **617.19**   | 6.8562   | 10.22%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **308.94**   | 7.3515   | 7.95%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **284.02**   | 6.7986   | 6.81%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.241**    | 252.48   | 1.86%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.191**    | 240.39   | 0.38%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.919**   | 92.5726  | 8.27%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.575**    | 167.55   | 24.56%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.352**    | 158.06   | 5.03%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **139.33**   | 13.0105  | 8.70%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **237.13**   | 8.1954   | 3.08%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **77.321**   | 41.4139  | 8.00%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **32.35**    | 36.8849  | 2.03%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.584**   | 52.6571  | 1.26%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **185.5**    | 9.9175   | 2.93%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **589.04**   | 3.1018   | 7.15%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **478.44**   | 4.4042   | 10.65%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **357.74**   | 8.9474   | 7.15%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.938**    | 212.27   | 1.27%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.163**    | 466.9    | 0.32%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **205.29**   | 12.7476  | 21.93%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
