## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.035**    | 268.2    | 2.53%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.173**    | 250.27   | 1.32%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.172**    | 242.94   | 0.42%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.183**    | 244.3    | 0.70%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.198**    | 239.87   | 0.38%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.181**    | 249.33   | 1.37%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.16**     | 253.81   | 1.46%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.091**    | 125.32   | 0.46%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **867.44**   | 1.477    | 0.60%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **498.35**   | 2.3082   | 0.49%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.502**    | 288.78   | 0.43%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.126**    | 247.01   | 0.83%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.131**    | 245.13   | 0.57%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.044**    | 249.34   | 0.49%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **172.11**   | 7.6741   | 2.92%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **169.8**    | 8.6497   | 2.24%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **641.59**   | 2.8644   | 1.62%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.718**    | 116.57   | 0.64%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.332**    | 143.4    | 1.72%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.426**    | 136.49   | 0.65%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **205.79**   | 5.8214   | 1.51%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **127.56**   | 11.508   | 2.97%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.803**    | 118.52   | 1.21%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.805**    | 116.38   | 0.88%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **150.24**   | 9.7089   | 2.42%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **84.205**   | 13.2042  | 1.50%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.228**    | 241.53   | 0.73%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.277**    | 249.51   | 1.71%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **204.04**   | 5.789    | 1.51%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **353.9**    | 5.2849   | 3.14%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **237.03**   | 9.5771   | 7.45%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **309.2**    | 4.7856   | 1.35%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.252**    | 238.04   | 0.44%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **107.55**   | 15.4484  | 5.54%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **95.662**   | 19.5522  | 6.92%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **110.56**   | 11.4862  | 3.36%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **276.67**   | 6.252    | 4.06%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **152.66**   | 22.0005  | 7.47%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.893**    | 116.65   | 1.10%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.374**    | 246.73   | 2.02%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **415.22**   | 5.2628   | 6.45%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **676.46**   | 6.3348   | 8.41%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **299.67**   | 7.0146   | 7.79%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **301.43**   | 5.9025   | 6.35%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.4**      | 233.54   | 0.84%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.332**    | 235.32   | 0.62%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.757**   | 97.0025  | 11.36%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.935**    | 147.36   | 6.84%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.206**    | 163.65   | 19.94%          | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **138.62**   | 13.622   | 8.13%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **243.05**   | 8.3085   | 3.15%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **77.731**   | 38.1864  | 7.23%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **31.776**   | 42.1437  | 2.82%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.569**   | 52.8085  | 1.08%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **194.4**    | 8.739    | 2.73%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **562.21**   | 3.0021   | 6.97%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **497.26**   | 5.0468   | 9.88%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **358.76**   | 9.032    | 6.98%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.919**    | 211.13   | 1.02%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.151**    | 471.53   | 0.44%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **269.64**   | 5.7813   | 10.27%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
