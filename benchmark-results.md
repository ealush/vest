## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.985**    | 271.67   | 2.50%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.125**    | 250.28   | 1.01%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.125**    | 248.44   | 0.72%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.156**    | 247.6    | 0.81%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.112**    | 254.88   | 1.27%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.094**    | 260.29   | 1.68%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.145**    | 247.7    | 0.75%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.981**    | 126.95   | 0.62%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **855.98**   | 1.566    | 1.24%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **467.39**   | 2.5819   | 0.69%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.582**    | 285.45   | 0.76%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.009**    | 254.66   | 0.73%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.069**    | 248.67   | 0.64%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.044**    | 251.76   | 0.71%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **162.72**   | 8.1259   | 2.91%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **157.32**   | 8.0419   | 2.16%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **617.48**   | 3.007    | 1.65%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.555**    | 119.34   | 0.84%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.153**    | 146.69   | 1.52%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.122**    | 161.65   | 3.83%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **189.88**   | 8.215    | 2.37%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **119.31**   | 12.0761  | 2.60%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.46**     | 125.83   | 1.88%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.459**    | 118.99   | 0.40%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **132.94**   | 9.8785   | 2.98%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **79.026**   | 14.3815  | 2.52%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.018**    | 292.44   | 4.41%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.142**    | 245.04   | 0.62%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **187.82**   | 6.8551   | 2.11%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **326.98**   | 5.7718   | 3.72%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **338.84**   | 8.9865   | 5.58%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **294.06**   | 4.9452   | 1.38%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.116**    | 247.57   | 0.54%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **106.41**   | 14.6154  | 5.45%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **92.478**   | 22.1381  | 7.42%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **105.91**   | 11.9872  | 3.80%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **248.38**   | 8.278    | 6.50%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **149.9**    | 46.3646  | 16.49%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.764**    | 116.07   | 0.67%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.232**    | 239.59   | 0.62%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **379.94**   | 6.4214   | 7.91%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **597.61**   | 6.0042   | 9.94%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **294.51**   | 7.074    | 7.46%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **282.27**   | 6.9276   | 7.56%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.312**    | 236.06   | 0.60%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.255**    | 237.39   | 0.53%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.845**   | 95.6932  | 10.76%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.747**    | 152.34   | 7.73%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.155**    | 162.52   | 0.41%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **130.83**   | 17.7609  | 8.03%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **234.43**   | 8.5019   | 3.17%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **75.504**   | 28.0208  | 6.07%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **30.892**   | 40.4165  | 2.43%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **19.646**   | 55.605   | 1.61%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **186.39**   | 9.815    | 3.46%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **561.48**   | 3.7365   | 7.73%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **506.77**   | 5.4564   | 10.10%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **359.77**   | 8.1136   | 4.43%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.767**    | 218.65   | 1.11%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.067**    | 488.15   | 0.49%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **271.71**   | 6.0982   | 10.46%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
