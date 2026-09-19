## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.033**    | 270.05   | 2.81%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.175**    | 245.82   | 0.85%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.146**    | 256.11   | 1.70%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.21**     | 240.42   | 0.70%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.205**    | 245.44   | 1.16%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.202**    | 240.35   | 0.46%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.193**    | 245.91   | 0.95%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.148**    | 123.79   | 0.41%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **843.86**   | 1.5008   | 0.59%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **478.67**   | 2.3577   | 0.45%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.779**    | 267.11   | 0.38%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.1**      | 250.49   | 1.11%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.125**    | 244.83   | 0.53%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.081**    | 252.11   | 1.03%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **169.83**   | 9.9878   | 3.28%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **165.46**   | 8.1062   | 2.04%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **633.45**   | 2.818    | 1.63%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.575**    | 118.23   | 0.53%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.272**    | 142.17   | 1.25%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.388**    | 137.35   | 0.57%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **202.69**   | 5.9095   | 1.66%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **124.42**   | 11.7561  | 2.81%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.649**    | 117.15   | 0.50%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.682**    | 117.71   | 0.74%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **130.5**    | 9.2308   | 2.66%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **80.386**   | 13.8837  | 1.34%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.223**    | 242.56   | 0.92%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.245**    | 237.8    | 0.47%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **201.96**   | 6.3854   | 2.04%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **343.25**   | 5.5235   | 3.30%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **346.36**   | 8.8158   | 6.63%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **305.29**   | 4.7724   | 1.53%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.239**    | 238.2    | 0.44%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **107.17**   | 14.082   | 5.01%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **94.411**   | 20.0231  | 7.17%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **107.16**   | 11.7107  | 3.49%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **263.68**   | 6.4537   | 4.48%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **149.8**    | 29.7029  | 11.60%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.938**    | 113.47   | 0.70%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.348**    | 232.47   | 0.61%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **405.5**    | 5.8023   | 7.55%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **642.62**   | 5.3056   | 8.37%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **291.6**    | 7.8591   | 8.02%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **296.31**   | 7.4258   | 6.89%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.284**    | 256.39   | 2.60%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.274**    | 235.89   | 0.25%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.765**   | 98.1412  | 12.31%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.758**    | 156.57   | 14.62%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.105**    | 165.73   | 14.88%          | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **137.35**   | 13.5038  | 7.44%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **242.47**   | 7.8731   | 2.91%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **77.495**   | 33.9127  | 6.55%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **31.327**   | 37.2821  | 1.72%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.233**   | 50.6053  | 0.71%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **190.66**   | 9.1548   | 2.44%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **556.29**   | 3.9228   | 7.39%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **504.24**   | 4.6173   | 9.75%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **364.87**   | 8.0055   | 4.22%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.844**    | 217.3    | 1.39%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.12**     | 476.11   | 0.38%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **246.52**   | 6.2014   | 9.99%           | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
