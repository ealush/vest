## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.018**    | 273.57   | 3.00%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.121**    | 249.13   | 1.03%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.143**    | 244.44   | 0.58%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.171**    | 241.55   | 0.42%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.159**    | 242.58   | 0.48%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.148**    | 246.7    | 0.83%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.08**     | 265.86   | 2.79%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.055**    | 128.94   | 1.18%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **846.86**   | 1.548    | 0.64%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **380.88**   | 8.2079   | 7.35%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.675**    | 273.85   | 0.29%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.016**    | 268.24   | 1.99%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.043**    | 249.14   | 0.48%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.016**    | 251.86   | 0.56%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **164.85**   | 7.9771   | 3.12%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **143.35**   | 11.1658  | 3.32%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **628.22**   | 2.9052   | 1.74%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.517**    | 119.32   | 0.72%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.22**     | 140.83   | 0.82%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.305**    | 138.68   | 0.56%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **197.61**   | 6.4251   | 2.22%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **126.95**   | 10.2356  | 2.71%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.558**    | 118.43   | 0.66%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.561**    | 118.14   | 0.53%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **141.36**   | 9.4648   | 2.72%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **89.28**    | 13.2526  | 2.37%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.118**    | 265.5    | 2.43%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.086**    | 248.92   | 0.84%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **196.29**   | 7.191    | 2.32%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **343.63**   | 5.2765   | 3.29%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **341.13**   | 8.9242   | 7.26%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **256.65**   | 5.4083   | 2.50%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.093**    | 246.44   | 0.43%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **105.72**   | 13.8288  | 5.44%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **101.69**   | 13.5405  | 4.18%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **111.03**   | 11.1202  | 3.55%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **273.06**   | 6.7672   | 4.68%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **170.72**   | 10.7977  | 2.43%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.801**    | 122.86   | 2.24%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.322**    | 235.59   | 0.79%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **383.99**   | 6.1659   | 7.41%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **638.98**   | 6.0253   | 8.61%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **299.73**   | 6.905    | 8.08%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **283.89**   | 6.8393   | 6.97%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.294**    | 236.08   | 0.54%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.225**    | 240.47   | 0.49%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.703**   | 94.4269  | 9.32%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.349**    | 182      | 33.91%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.227**    | 160.69   | 0.84%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **140.46**   | 14.0167  | 8.17%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **240.74**   | 8.2191   | 3.11%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **77.924**   | 43.1572  | 8.40%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **32.219**   | 36.2544  | 2.17%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.691**   | 52.1323  | 1.11%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **187.54**   | 8.8439   | 2.95%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **573.09**   | 3.4238   | 7.43%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **487.16**   | 4.4632   | 10.30%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **347.27**   | 9.616    | 7.66%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.716**    | 231.63   | 3.03%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.112**    | 482.04   | 0.60%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **208.11**   | 14.4328  | 24.24%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
