## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.683**    | 347.26   | 9.10%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **3.987**    | 285.52   | 3.53%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.033**    | 250.84   | 0.41%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.025**    | 251.22   | 0.36%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.018**    | 254.9    | 0.64%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.015**    | 250.55   | 0.31%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.006**    | 254.75   | 0.70%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.998**    | 128.07   | 0.80%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **816.49**   | 1.6654   | 1.15%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **486.33**   | 2.5007   | 0.68%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.298**    | 310.6    | 0.64%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **3.989**    | 255.21   | 0.76%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.001**    | 250.97   | 0.28%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.715**    | 383.51   | 11.02%          | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **185.43**   | 7.2451   | 3.15%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **179.92**   | 9.7244   | 2.98%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **624.46**   | 2.7915   | 1.64%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **7.997**    | 146.56   | 5.82%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **6.992**    | 146.48   | 1.26%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.053**    | 143.59   | 0.45%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **215.79**   | 5.8825   | 2.15%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **134.7**    | 9.376    | 2.48%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.302**    | 147.52   | 5.68%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.573**    | 117.3    | 0.25%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **159.59**   | 9.0137   | 2.43%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **94.823**   | 12.3742  | 2.50%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.022**    | 251.1    | 0.53%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.062**    | 248.34   | 0.40%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **214.48**   | 5.993    | 2.27%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **357.54**   | 4.7887   | 2.96%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **213.08**   | 11.3489  | 9.08%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **323.84**   | 4.6633   | 1.84%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.018**    | 251.62   | 0.45%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **118.48**   | 13.7585  | 5.43%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **103.73**   | 20.6847  | 8.11%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **119.32**   | 11.7156  | 4.00%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **283.75**   | 6.6987   | 4.57%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **161.78**   | 7.2553   | 1.32%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.798**    | 115.04   | 0.61%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.213**    | 241.34   | 0.56%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **450.93**   | 5.959    | 8.26%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **733.93**   | 8.5085   | 12.19%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **380.07**   | 9.1665   | 10.64%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **350.81**   | 7.4908   | 7.02%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.079**    | 247.95   | 0.51%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.047**    | 249.92   | 0.34%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **12.393**   | 95.0184  | 13.33%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.904**    | 149.08   | 11.75%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.154**    | 163.05   | 4.39%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **155.88**   | 17.5304  | 8.77%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **265.65**   | 8.3694   | 3.64%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **85.619**   | 49.7286  | 9.32%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **35.834**   | 31.0448  | 1.45%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **22.233**   | 49.0136  | 1.11%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **201.98**   | 8.2366   | 2.79%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **660.78**   | 3.32     | 7.82%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **491.4**    | 4.5963   | 10.31%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **394.99**   | 9.6944   | 7.98%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.921**    | 210.66   | 1.04%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.085**    | 482.68   | 0.31%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **237.49**   | 12.5489  | 21.40%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
