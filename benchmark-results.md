## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.065**    | 271.37   | 3.40%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.209**    | 258.95   | 2.44%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.257**    | 244.5    | 1.31%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.251**    | 237.48   | 0.55%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.251**    | 242.76   | 0.87%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.273**    | 243.39   | 1.05%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.266**    | 244.54   | 1.18%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.342**    | 121.12   | 0.42%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **883.14**   | 1.4073   | 0.97%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **526.49**   | 2.3092   | 0.67%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.43**     | 299.77   | 0.82%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.153**    | 248.63   | 1.09%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.201**    | 248.86   | 1.42%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.151**    | 244.88   | 0.52%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **166.78**   | 8.1647   | 2.63%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **162.74**   | 7.5558   | 1.84%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **614.56**   | 2.7581   | 1.57%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.647**    | 120.18   | 1.26%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.232**    | 147.81   | 2.54%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.26**     | 147.21   | 2.11%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **195.95**   | 6.5023   | 1.68%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **124.89**   | 12.0893  | 3.10%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.873**    | 117.43   | 1.27%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.883**    | 115.38   | 0.93%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **130.19**   | 11.0907  | 4.42%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **85.139**   | 13.438   | 2.26%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.257**    | 245.46   | 1.62%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.231**    | 249.05   | 1.75%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **195.88**   | 7.1927   | 2.07%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **313.59**   | 5.3418   | 3.74%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **249.75**   | 21.7042  | 13.05%          | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **300.38**   | 4.7562   | 2.00%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.156**    | 253.29   | 2.00%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **107.97**   | 15.0425  | 5.54%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **93.917**   | 20.1003  | 7.21%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **110.98**   | 12.6898  | 3.23%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **273.58**   | 6.2201   | 3.97%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **136.41**   | 43.7435  | 15.20%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.911**    | 112.88   | 0.34%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.369**    | 237.51   | 1.03%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **389.95**   | 5.7363   | 6.74%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **595.3**    | 5.7358   | 9.45%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **284.8**    | 7.1319   | 7.46%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **276.65**   | 6.5205   | 5.84%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.361**    | 235.21   | 0.70%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.328**    | 232.94   | 0.32%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.661**   | 98.3166  | 11.29%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.893**    | 150.11   | 8.72%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.255**    | 160.46   | 4.61%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **139.59**   | 14.1445  | 7.85%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **235.73**   | 8.1744   | 3.18%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **76.749**   | 45.6835  | 8.28%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **32.51**    | 39.489   | 2.32%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.707**   | 50.1307  | 0.75%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **189.24**   | 9.7701   | 3.38%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **557.15**   | 3.2964   | 6.83%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **474.39**   | 4.3585   | 9.54%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **361.33**   | 8.742    | 4.38%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.842**    | 220.63   | 2.13%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.166**    | 467.78   | 0.35%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **263.34**   | 5.8047   | 10.34%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
