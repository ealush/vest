## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.011**    | 276.7    | 3.17%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.113**    | 250.88   | 1.07%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.111**    | 246.33   | 0.52%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.121**    | 245.51   | 0.39%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.141**    | 245.47   | 0.45%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.133**    | 244.97   | 0.43%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.096**    | 255.23   | 1.33%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.043**    | 126.49   | 0.61%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **851.94**   | 1.6526   | 1.13%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **433.8**    | 2.6923   | 0.66%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.58**     | 284.05   | 0.49%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.032**    | 253.67   | 0.91%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.064**    | 248.09   | 0.44%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.976**    | 254.41   | 0.61%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **171.03**   | 7.8875   | 3.16%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **163.26**   | 9.5815   | 2.67%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **631.25**   | 2.8785   | 1.72%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.244**    | 133.91   | 2.65%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.135**    | 145.45   | 1.19%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.145**    | 143.96   | 0.82%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **198.48**   | 6.4465   | 2.23%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **127.21**   | 11.5596  | 2.89%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.429**    | 120.93   | 0.60%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.4**      | 121.67   | 0.92%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **148.62**   | 10.973   | 3.39%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **85.002**   | 15.0237  | 3.13%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.051**    | 255.03   | 1.26%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.15**     | 243.78   | 0.45%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **195.84**   | 7.1417   | 2.46%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **338.58**   | 5.4195   | 3.76%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **344.9**    | 8.9436   | 7.16%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **319.81**   | 3.8874   | 1.01%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.095**    | 247.52   | 1.00%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **107.49**   | 15.3762  | 5.70%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **100.36**   | 17.1273  | 4.71%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **109.02**   | 11.1098  | 3.11%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **269.2**    | 6.4363   | 4.15%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **167.98**   | 9.7034   | 2.13%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.796**    | 117.73   | 1.27%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.309**    | 236.84   | 0.97%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **381.5**    | 6.6072   | 7.61%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **611.67**   | 6.8097   | 9.89%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **318.02**   | 7.7269   | 7.49%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **291.43**   | 6.7234   | 6.47%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.147**    | 243.59   | 0.56%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.126**    | 250.01   | 1.32%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.297**   | 98.4707  | 11.87%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.21**     | 184.59   | 31.62%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.051**    | 166.64   | 10.59%          | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **132.9**    | 16.8155  | 8.45%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **231.67**   | 8.53     | 3.36%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **77.986**   | 49.4488  | 9.10%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **30.947**   | 39.8389  | 2.45%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **19.444**   | 74.9981  | 5.91%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **166.4**    | 57.5584  | 20.86%          | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **580.64**   | 3.5307   | 7.22%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **461.58**   | 5.7094   | 11.94%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **344.34**   | 9.509    | 7.64%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.78**     | 214.57   | 0.76%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.101**    | 479.33   | 0.27%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **204.22**   | 11.178   | 21.17%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
