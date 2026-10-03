## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.363**    | 312.19   | 1.68%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **3.458**    | 295.59   | 0.85%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **3.443**    | 300.16   | 1.05%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **3.469**    | 291.58   | 0.43%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **3.476**    | 290.75   | 0.58%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **3.486**    | 290.9    | 0.53%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **3.486**    | 294.23   | 0.72%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.149**    | 141.34   | 0.53%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **800.45**   | 1.6983   | 0.90%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **489.64**   | 2.5023   | 0.85%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **2.476**    | 410.83   | 0.55%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **3.336**    | 329.8    | 2.55%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **3.44**     | 293.28   | 0.42%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.387**    | 297.74   | 0.34%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **187.12**   | 8.8465   | 3.60%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **180.45**   | 8.63     | 3.04%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **702.56**   | 2.8642   | 1.98%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **7.243**    | 140.61   | 0.85%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **6.228**    | 191.92   | 4.96%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **6.321**    | 164.14   | 1.25%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **212.31**   | 6.0089   | 2.31%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **135.96**   | 10.1857  | 2.96%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **7.319**    | 138.1    | 0.36%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **7.38**     | 137.71   | 0.50%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **153.77**   | 8.3668   | 2.37%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **95.069**   | 12.0241  | 1.68%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **3.439**    | 293.31   | 0.32%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **3.496**    | 289.3    | 0.38%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **212.9**    | 6.2288   | 2.62%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **419.74**   | 4.4216   | 3.32%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **232.51**   | 8.1979   | 4.81%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **286.85**   | 4.2102   | 1.56%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **3.379**    | 307.08   | 1.07%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **123.78**   | 12.7739  | 4.77%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **115.31**   | 16.9967  | 6.45%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **122.98**   | 11.7506  | 4.34%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **294.51**   | 6.7392   | 4.93%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **147.5**    | 53.2721  | 19.12%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **7.179**    | 142.46   | 0.70%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **3.408**    | 294.71   | 0.24%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **519.8**    | 5.1975   | 8.04%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **907.17**   | 5.6337   | 15.46%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **477.84**   | 6.8752   | 9.14%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **391.24**   | 5.8043   | 7.05%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **3.381**    | 308.84   | 1.62%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **3.328**    | 302.61   | 0.44%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **12.198**   | 88.1527  | 7.25%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.035**    | 174.6    | 14.85%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **5.166**    | 194.31   | 4.78%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **189.61**   | 10.98    | 7.64%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **314.2**    | 7.2833   | 3.63%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **99.721**   | 17.5074  | 6.80%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **36.039**   | 29.5542  | 1.12%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **21.292**   | 48.7031  | 0.95%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **195.91**   | 7.6676   | 2.56%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **736.25**   | 3.052    | 7.63%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **648.35**   | 4.6313   | 11.21%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **506.4**    | 8.4936   | 6.39%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.377**    | 232.7    | 0.58%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **1.733**    | 585.65   | 0.58%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **236.88**   | 13.6005  | 20.60%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
