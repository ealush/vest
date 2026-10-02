## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.978**    | 220.27   | 2.96%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **5.172**    | 196.55   | 0.77%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **5.193**    | 195.52   | 0.53%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **5.169**    | 197.03   | 0.67%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **5.18**     | 195.7    | 0.51%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **5.161**    | 202.51   | 1.19%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **5.142**    | 197.69   | 0.61%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **10.237**   | 98.4187  | 0.30%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **641.53**   | 1.8133   | 0.55%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **4.228**    | 240.3    | 0.65%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **5.021**    | 208.42   | 1.26%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **5.072**    | 200.18   | 0.60%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **5.05**     | 200.56   | 0.52%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **226.57**   | 6.1798   | 3.31%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **229.5**    | 5.5473   | 2.13%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **797.03**   | 2.4056   | 1.62%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **10.432**   | 103.79   | 2.17%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **8.775**    | 118.9    | 1.36%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **8.876**    | 114.79   | 0.60%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **271.23**   | 4.8412   | 2.15%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **174.94**   | 8.7533   | 2.88%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **10.393**   | 132.37   | 9.57%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **11.001**   | 91.6137  | 0.32%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **195.76**   | 6.563    | 2.31%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **122.5**    | 9.4675   | 1.72%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **5.144**    | 200.23   | 0.79%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **5.099**    | 199.72   | 0.69%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **272.07**   | 4.8646   | 2.19%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **461.81**   | 3.7705   | 2.61%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **286.38**   | 8.0263   | 6.80%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **382.73**   | 6.0846   | 4.10%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **5.039**    | 202.18   | 0.62%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **152.66**   | 12.2927  | 5.48%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **143.12**   | 20.4153  | 6.22%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **152.09**   | 8.865    | 3.27%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **364.55**   | 5.0438   | 4.07%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **183.06**   | 24.9503  | 9.44%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **11.174**   | 91.6525  | 0.79%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **5.182**    | 239.33   | 6.13%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **612**      | 4.5157   | 6.96%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **951.51**   | 6.6741   | 9.34%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **581.94**   | 5.3918   | 7.97%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **433.23**   | 6.5445   | 7.75%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **5.19**     | 198.37   | 1.01%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **5.168**    | 197.39   | 0.64%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **15.93**    | 74.0025  | 13.57%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **8.722**    | 118.28   | 11.71%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **8.059**    | 124.24   | 1.48%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **220.38**   | 8.7159   | 6.76%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **352.26**   | 6.3163   | 3.15%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **118.54**   | 15.199   | 6.30%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **46.121**   | 24.3198  | 1.50%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **29.544**   | 34.5622  | 0.66%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **269.87**   | 5.5345   | 2.37%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **964.45**   | 1.9402   | 5.11%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **719.7**    | 8.1933   | 17.04%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **570.35**   | 7.6203   | 5.92%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **6.321**    | 161.37   | 0.52%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.655**    | 377.7    | 0.13%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **331.59**   | 15.4411  | 27.55%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
