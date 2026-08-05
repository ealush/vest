## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.953**    | 277.95   | 2.90%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.132**    | 248.56   | 1.08%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.145**    | 243.36   | 0.45%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.151**    | 242.61   | 0.33%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.095**    | 273.14   | 3.09%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.119**    | 248      | 0.81%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.128**    | 252.17   | 1.12%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.942**    | 131.84   | 1.35%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **844.12**   | 1.6315   | 0.77%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **474.39**   | 2.457    | 0.49%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.692**    | 274.07   | 0.40%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.128**    | 248.47   | 1.04%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.163**    | 244.72   | 0.61%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.119**    | 247.05   | 0.62%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **163.14**   | 7.7592   | 2.58%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **159.95**   | 7.4366   | 1.79%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **607.77**   | 2.7793   | 1.45%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.716**    | 119.28   | 1.08%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.38**     | 137.86   | 0.87%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.43**     | 136.1    | 0.44%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **193.16**   | 6.2731   | 1.62%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **122.48**   | 12.0093  | 2.86%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.81**     | 115.14   | 0.47%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.784**    | 116.41   | 0.76%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **135.79**   | 9.8062   | 3.20%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **91.335**   | 14.5579  | 2.98%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.272**    | 236.79   | 0.48%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.301**    | 234.24   | 0.27%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **189.06**   | 6.8264   | 2.12%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **328.5**    | 5.7764   | 3.37%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **381.02**   | 7.6183   | 6.38%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **300.77**   | 4.6844   | 1.50%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.206**    | 240.21   | 0.52%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **106.9**    | 15.3969  | 5.46%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **101.96**   | 14.0474  | 4.04%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **110.59**   | 11.7159  | 3.65%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **268.56**   | 7.5101   | 5.21%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **169.18**   | 6.6435   | 0.96%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.652**    | 118.26   | 0.98%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.279**    | 240.06   | 0.79%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **398.27**   | 5.9809   | 7.28%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **602.28**   | 9.4237   | 10.96%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **323.01**   | 6.8584   | 7.57%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **302.55**   | 6.6658   | 6.25%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.3**      | 235.71   | 0.49%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.233**    | 238.86   | 0.55%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.884**   | 95.0435  | 10.07%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.465**    | 178.02   | 33.10%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.377**    | 156.87   | 0.43%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **135.67**   | 18.3866  | 8.17%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **241.97**   | 8.1949   | 2.96%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **81.284**   | 33.4507  | 6.83%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **32.255**   | 35.6709  | 1.81%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.63**    | 50.5313  | 0.82%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **184.47**   | 9.1963   | 3.18%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **581.7**    | 3.2244   | 7.17%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **494.59**   | 4.3431   | 10.28%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **354.76**   | 9.2761   | 7.44%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.918**    | 206.81   | 0.49%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.153**    | 479.1    | 0.80%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **206.98**   | 11.8187  | 20.21%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
