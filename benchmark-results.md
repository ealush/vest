## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.893**    | 252.54   | 6.33%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **5.165**    | 205.91   | 1.96%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **5.275**    | 192.64   | 0.54%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **5.269**    | 193.82   | 0.67%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **5.255**    | 193.01   | 0.53%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **5.183**    | 205.26   | 1.89%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **5.207**    | 202.53   | 1.43%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **10.355**   | 102.83   | 1.88%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **565.61**   | 2.3202   | 1.48%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **4.167**    | 246.52   | 1.18%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **5.082**    | 205.16   | 1.52%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **5.131**    | 201.6    | 1.23%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **5.082**    | 198.8    | 0.58%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **220.74**   | 7.1888   | 5.81%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **225.11**   | 5.7723   | 5.06%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **776.04**   | 2.4842   | 1.60%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **10.197**   | 100.36   | 0.88%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **8.695**    | 119.04   | 1.28%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **8.738**    | 121.06   | 1.56%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **262.37**   | 5.3978   | 2.41%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **170.42**   | 8.9504   | 2.59%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **10.732**   | 97.0068  | 1.38%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **10.745**   | 95.7953  | 1.00%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **198.95**   | 7.5998   | 2.95%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **118.77**   | 9.5693   | 1.81%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **5.146**    | 208.66   | 2.10%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **5.243**    | 194.38   | 0.53%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **264.24**   | 5.4862   | 2.67%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **447.12**   | 3.8508   | 2.52%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **257.5**    | 16.1754  | 10.31%          | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **407.92**   | 3.6974   | 1.86%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.956**    | 208.18   | 1.05%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **150.01**   | 11.5367  | 5.57%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **145.53**   | 10.6947  | 3.79%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **153.97**   | 8.9649   | 3.53%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **363.36**   | 5.3379   | 4.38%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **173**      | 39.7172  | 14.27%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **10.981**   | 91.9941  | 0.54%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **5.175**    | 195.15   | 0.55%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **582.49**   | 5.3178   | 8.37%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **936.6**    | 6.1954   | 9.69%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **554.69**   | 5.7179   | 9.87%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **431.73**   | 5.3047   | 6.56%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **5.168**    | 197.8    | 1.19%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **5.08**     | 211      | 1.90%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **14.836**   | 79.5349  | 13.31%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **8.269**    | 124.5    | 12.36%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **7.237**    | 139.77   | 14.67%          | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **211.51**   | 9.7263   | 7.35%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **340.39**   | 6.8331   | 3.39%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **112.47**   | 16.4137  | 8.54%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **43.877**   | 25.5795  | 1.41%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **28.32**    | 37.8097  | 1.07%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **256.46**   | 5.8616   | 2.30%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **909.76**   | 2.0071   | 6.04%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **697.3**    | 8.1896   | 15.27%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **544.69**   | 8.0004   | 6.97%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **5.884**    | 171.37   | 0.42%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.445**    | 413.09   | 0.41%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **311.66**   | 16.0209  | 31.03%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
