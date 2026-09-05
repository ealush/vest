## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.062**    | 267.74   | 2.88%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.213**    | 243.06   | 0.80%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.223**    | 241.98   | 0.79%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.24**     | 241.75   | 0.74%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.252**    | 244.36   | 1.01%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.259**    | 240.75   | 0.72%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.229**    | 248.03   | 1.37%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.202**    | 122.95   | 0.36%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **842.87**   | 1.4321   | 0.47%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **480.7**    | 2.3081   | 0.41%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.74**     | 269.35   | 0.29%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.16**     | 244.96   | 0.62%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.186**    | 240.83   | 0.35%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.157**    | 243.16   | 0.48%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **165.97**   | 10.9272  | 3.31%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **163.37**   | 7.4052   | 1.86%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **624.1**    | 2.8243   | 1.52%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.684**    | 117.03   | 0.54%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.41**     | 137.91   | 0.99%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.477**    | 134.72   | 0.31%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **200.41**   | 6.1243   | 1.97%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **122.67**   | 10.4479  | 2.68%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.813**    | 114.89   | 0.41%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.765**    | 115.39   | 0.46%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **131.38**   | 9.5233   | 2.89%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **86.443**   | 14.0191  | 2.83%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.29**     | 238.75   | 1.11%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.294**    | 241.14   | 0.99%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **198.41**   | 7.2959   | 2.08%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **339.06**   | 5.3824   | 2.85%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **361.71**   | 8.4467   | 5.20%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **303.5**    | 3.9697   | 0.87%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.234**    | 239.23   | 0.54%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **107.63**   | 15.2797  | 6.05%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **95.536**   | 22.0952  | 7.92%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **110.7**    | 11.9977  | 3.73%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **272.86**   | 6.3322   | 4.30%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **155.62**   | 36.5041  | 12.81%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.756**    | 115.51   | 0.54%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.251**    | 238.93   | 0.57%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **382.58**   | 6.1574   | 7.31%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **644.96**   | 6.3057   | 8.29%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **298.36**   | 8.9435   | 8.38%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **286.9**    | 6.6183   | 6.59%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.27**     | 235.88   | 0.35%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.2**      | 240.03   | 0.32%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.657**   | 100.74   | 13.16%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.765**    | 154.01   | 11.01%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **5.981**    | 168.46   | 9.64%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **141**      | 13.5787  | 7.50%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **247.79**   | 7.8409   | 3.00%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **76.895**   | 33.7333  | 6.38%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **31.731**   | 38.1573  | 2.07%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **19.814**   | 56.0332  | 2.10%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **171.17**   | 37.5254  | 13.65%          | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **578.42**   | 3.1679   | 6.44%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **508.4**    | 5.885    | 9.61%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **361.66**   | 8.7728   | 6.25%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.845**    | 211.57   | 0.82%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.121**    | 475.75   | 0.43%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **263.9**    | 5.8228   | 9.97%           | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
