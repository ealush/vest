## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.125**    | 332.53   | 1.59%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **3.17**     | 320.02   | 0.64%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **3.175**    | 329.83   | 1.26%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **3.172**    | 322.59   | 0.84%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **3.173**    | 330.02   | 1.24%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **3.189**    | 320.74   | 0.75%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **3.197**    | 321.6    | 0.82%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **6.429**    | 157.36   | 0.62%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **710.73**   | 1.7884   | 0.70%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **445.19**   | 2.6276   | 0.69%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **2.396**    | 420.5    | 0.36%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **3.23**     | 313.09   | 0.70%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **3.23**     | 315.33   | 0.53%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.179**    | 316.73   | 0.35%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **159.07**   | 8.8062   | 3.07%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **154.18**   | 9.1816   | 2.44%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **633.98**   | 2.8053   | 1.73%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **6.841**    | 150.14   | 0.94%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **5.979**    | 173.36   | 1.52%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **5.988**    | 169.75   | 0.69%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **186.91**   | 7.189    | 2.05%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **124.78**   | 11.465   | 2.57%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **6.904**    | 147.07   | 0.50%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **6.888**    | 147.66   | 0.59%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **141.74**   | 8.8803   | 2.89%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **85.073**   | 14.0063  | 2.06%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **3.307**    | 307.61   | 0.66%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **3.333**    | 304.13   | 0.49%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **187.59**   | 6.9656   | 2.00%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **343.14**   | 4.7293   | 2.79%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **252.96**   | 9.2689   | 6.45%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **302.51**   | 4.7619   | 1.35%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **3.181**    | 318.47   | 0.67%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **112.82**   | 12.8003  | 4.41%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **93.985**   | 18.8631  | 6.24%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **108.4**    | 11.904   | 3.67%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **262.29**   | 6.9091   | 4.32%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **137.99**   | 40.4818  | 14.16%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **6.864**    | 147.8    | 0.62%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **3.361**    | 299.89   | 0.45%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **446.72**   | 5.2533   | 6.55%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **665.1**    | 7.0926   | 10.33%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **361.48**   | 7.6443   | 7.65%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **300.41**   | 6.3939   | 5.95%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **3.315**    | 306.26   | 0.87%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **3.321**    | 303.85   | 0.48%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **10.911**   | 97.438   | 8.19%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **5.537**    | 186.48   | 9.92%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **4.81**     | 209.67   | 10.75%          | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **149.35**   | 22.2616  | 6.23%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **244.26**   | 8.3022   | 3.21%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **83.096**   | 47.9125  | 8.17%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **32.107**   | 34.4225  | 1.43%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.122**   | 51.0797  | 0.77%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **152.92**   | 65.9568  | 23.96%          | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **636.32**   | 2.9748   | 6.67%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **534.38**   | 4.6859   | 8.75%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **385.57**   | 9.2936   | 7.05%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **3.926**    | 260.04   | 0.99%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **1.626**    | 618.77   | 0.35%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **216.55**   | 13.5115  | 21.14%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
