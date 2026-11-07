## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **2.905**    | 361.49   | 1.83%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **3.029**    | 335.14   | 0.59%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **3.052**    | 331.84   | 0.60%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **3.066**    | 330.13   | 0.58%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **3.021**    | 338.47   | 1.10%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **3.062**    | 335.06   | 0.80%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **3.037**    | 335.81   | 0.65%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **6.136**    | 164.51   | 0.33%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **671.09**   | 1.9422   | 0.75%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **439.02**   | 2.7594   | 0.85%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **2.322**    | 446.39   | 0.98%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **3.021**    | 333.17   | 0.36%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **3.053**    | 330.62   | 0.46%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **2.995**    | 336.46   | 0.29%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **152.23**   | 8.8519   | 3.13%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **144.83**   | 8.6198   | 2.31%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **626.31**   | 3.02     | 1.81%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **6.472**    | 158.35   | 0.72%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **5.701**    | 182.13   | 1.09%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **5.728**    | 177.49   | 0.62%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **181.73**   | 7.1446   | 2.11%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **116.55**   | 12.1429  | 3.14%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **6.487**    | 155.73   | 0.60%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **6.563**    | 153.55   | 0.31%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **138.7**    | 9.3502   | 2.77%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **82.183**   | 13.4521  | 1.76%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **3.111**    | 326.4    | 0.48%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **3.12**     | 325.72   | 0.52%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **175.41**   | 10.298   | 3.28%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **325.26**   | 7.3766   | 4.53%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **247.33**   | 8.1149   | 5.52%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **309.55**   | 4.7031   | 1.44%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **3.122**    | 323.39   | 0.41%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **105**      | 13.349   | 4.60%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **92.425**   | 18.7075  | 5.77%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **103.31**   | 13.0336  | 3.72%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **243.29**   | 8.3815   | 5.20%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **134.6**    | 38.6299  | 13.17%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **6.579**    | 154.36   | 0.67%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **3.173**    | 324.34   | 0.78%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **421.56**   | 5.3081   | 6.59%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **681.22**   | 5.6213   | 8.80%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **332.35**   | 7.2333   | 7.99%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **287.96**   | 7.1267   | 7.03%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **3.184**    | 316.78   | 0.42%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **3.164**    | 319.69   | 0.41%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **10.45**    | 103.72   | 7.94%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **5.213**    | 201.16   | 10.99%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **4.513**    | 222.58   | 5.61%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **142.37**   | 13.8287  | 7.96%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **231.71**   | 8.919    | 3.54%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **76.46**    | 51.1194  | 8.80%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **28.622**   | 43.9301  | 2.74%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **17.757**   | 60.6356  | 1.23%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **167**      | 9.0901   | 3.15%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **610.08**   | 3.352    | 7.34%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **505.75**   | 4.146    | 8.44%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **358.87**   | 8.9935   | 7.15%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **3.637**    | 286.87   | 1.48%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **1.523**    | 661.35   | 0.40%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **279.8**    | 5.4613   | 7.88%           | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
