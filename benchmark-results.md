## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **7.116**    | 168.67   | 6.59%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **7.678**    | 132.58   | 0.74%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **7.964**    | 128.09   | 0.95%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **7.518**    | 169.73   | 7.00%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **7.975**    | 130.04   | 1.30%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **7.996**    | 128.31   | 1.26%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **7.467**    | 173.32   | 7.58%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **15.061**   | 69.1858  | 1.19%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **841.65**   | 2.1878   | 1.43%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **5.564**    | 186.97   | 1.61%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **7.389**    | 144.84   | 2.31%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **7.537**    | 138.84   | 1.31%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **7.63**     | 133.45   | 0.88%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **315.5**    | 5.1139   | 3.61%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **325.89**   | 4.492    | 1.99%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **14.401**   | 71.9973  | 2.22%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **12.46**    | 85.3625  | 1.97%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **12.885**   | 79.3929  | 0.78%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **378.39**   | 5.9986   | 2.67%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **234.73**   | 5.5548   | 2.42%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **15.279**   | 67.6443  | 1.42%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **15.499**   | 66.0756  | 1.31%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **229.21**   | 5.5156   | 1.22%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **153.56**   | 7.8941   | 1.26%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **7.194**    | 170.06   | 5.82%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **7.766**    | 130.38   | 0.52%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **387.72**   | 3.1544   | 1.22%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **690.57**   | 2.5562   | 1.94%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **427.83**   | 8.2597   | 6.45%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **466.93**   | 3.2519   | 1.75%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **6.853**    | 149.99   | 1.30%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **209.51**   | 9.8041   | 6.16%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **213.12**   | 6.2531   | 3.43%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **218.89**   | 6.1347   | 3.47%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **505.21**   | 4.0749   | 4.32%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **255.26**   | 13.0635  | 14.68%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **16.976**   | 60.5738  | 1.39%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **7.996**    | 128.87   | 1.84%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **979.27**   | 4.6059   | 8.85%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **727.03**   | 5.4919   | 11.96%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **664.49**   | 3.9752   | 6.61%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **7.502**    | 137.08   | 1.17%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **7.358**    | 138.13   | 1.07%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **18.256**   | 91.8296  | 48.90%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **12.454**   | 86.8525  | 18.93%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **11.358**   | 88.0452  | 0.02%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **303.38**   | 11.5405  | 7.00%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **493.27**   | 5.7423   | 3.82%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **163.8**    | 13.1598  | 7.79%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **62.349**   | 28.9418  | 2.86%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **41.088**   | 28.7827  | 1.26%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **384.53**   | 4.052    | 1.86%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **931.51**   | 5.1063   | 16.65%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **828.52**   | 6.8788   | 7.05%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **9.256**    | 111.09   | 1.16%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **3.824**    | 313.18   | 5.16%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **473.12**   | 9.7684   | 16.62%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
