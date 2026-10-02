## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.002**    | 270.73   | 2.82%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.19**     | 243.35   | 0.80%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.204**    | 241.11   | 0.55%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.185**    | 257.23   | 1.94%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.175**    | 242.6    | 0.41%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.16**     | 250.65   | 1.26%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.138**    | 247.36   | 0.74%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.993**    | 129.74   | 1.03%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **881.45**   | 1.5129   | 1.16%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **479.03**   | 2.5717   | 1.04%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.417**    | 296.37   | 0.50%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.059**    | 260.11   | 1.45%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.09**     | 247.86   | 0.49%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.07**     | 248.03   | 0.58%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **162.9**    | 8.0323   | 2.89%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **161.49**   | 9.1827   | 2.22%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **620.67**   | 2.867    | 1.64%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.587**    | 118.47   | 0.74%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.216**    | 144.1    | 1.30%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.261**    | 142.35   | 0.93%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **191.09**   | 7.9176   | 2.41%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **121.9**    | 10.799   | 2.88%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.696**    | 123.9    | 2.07%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.742**    | 115.77   | 0.71%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **139.38**   | 9.1532   | 2.86%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **88.358**   | 13.7176  | 2.43%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.157**    | 243.85   | 0.71%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.179**    | 247.08   | 0.86%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **191.21**   | 7.6008   | 2.25%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **331.3**    | 5.4564   | 3.43%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **203.33**   | 10.6265  | 7.33%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **271.92**   | 4.9088   | 2.72%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.179**    | 242.14   | 0.46%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **105.24**   | 15.4169  | 5.35%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **92.829**   | 21.4661  | 7.29%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **107.12**   | 11.838   | 3.46%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **265.36**   | 7.1803   | 4.56%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **144.87**   | 22.3832  | 8.70%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.74**     | 115.88   | 0.50%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.289**    | 235.82   | 0.61%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **393.45**   | 5.8436   | 6.83%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **607.81**   | 7.2272   | 10.31%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **279.79**   | 9.609    | 9.56%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **281.77**   | 6.4928   | 6.42%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.212**    | 244.84   | 0.90%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.183**    | 241.79   | 0.48%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.375**   | 100.78   | 11.81%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.737**    | 154.73   | 10.65%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.127**    | 164.43   | 9.41%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **133.61**   | 14.3312  | 7.71%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **235.87**   | 8.6418   | 3.20%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **77.755**   | 35.4862  | 6.98%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **31.299**   | 45.0537  | 4.56%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.675**   | 52.5486  | 1.14%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **184.66**   | 9.7844   | 3.41%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **559.62**   | 3.6606   | 7.50%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **491.62**   | 4.5138   | 10.42%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **365.09**   | 9.4839   | 4.92%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.742**    | 222.23   | 1.45%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.098**    | 481.65   | 0.51%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **262.39**   | 5.7929   | 10.39%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
