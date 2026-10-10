## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.959**    | 272.28   | 3.24%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.153**    | 249.34   | 0.96%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.163**    | 243.86   | 0.53%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.164**    | 244.46   | 0.50%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.184**    | 241.9    | 0.42%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.125**    | 247.17   | 0.83%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.134**    | 243      | 0.24%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.977**    | 126.37   | 0.46%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **877.29**   | 1.5107   | 0.74%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **511.67**   | 2.3535   | 0.70%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.284**    | 343.44   | 3.25%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.066**    | 249.97   | 0.74%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.083**    | 248.78   | 0.46%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.069**    | 248.09   | 0.38%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **166.23**   | 7.9563   | 3.01%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **163.1**    | 8.2612   | 2.28%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **627.24**   | 2.8833   | 1.60%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.52**     | 118.87   | 0.62%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.043**    | 151.3    | 2.52%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.296**    | 138.03   | 0.48%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **195.76**   | 6.6918   | 2.12%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **123.33**   | 10.5911  | 2.68%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.686**    | 115.88   | 0.26%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.707**    | 115.97   | 0.44%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **131.98**   | 9.9788   | 2.85%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **84.794**   | 13.3732  | 1.78%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.121**    | 247.53   | 0.59%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.158**    | 242.92   | 0.35%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **193.61**   | 7.218    | 2.18%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **334.3**    | 5.3546   | 3.02%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **226.37**   | 16.1267  | 10.22%          | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **296.21**   | 4.8817   | 1.76%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.057**    | 248.01   | 0.27%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **100.95**   | 14.8751  | 5.67%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **91.518**   | 20.9955  | 7.59%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **107.5**    | 11.7729  | 3.69%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **268.28**   | 7.0707   | 4.43%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **137.81**   | 39.9958  | 13.83%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.575**    | 117.41   | 0.28%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.215**    | 240.61   | 0.62%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **386.54**   | 5.9836   | 7.03%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **651.61**   | 6.1452   | 8.41%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **285.72**   | 8.206    | 7.74%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **291.61**   | 6.6849   | 6.53%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.259**    | 236.38   | 0.41%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.214**    | 241.25   | 0.71%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.52**    | 97.2464  | 9.95%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.733**    | 150.66   | 5.24%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.156**    | 162.94   | 3.96%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **137.98**   | 14.4324  | 5.02%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **235.24**   | 8.4971   | 3.30%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **76.429**   | 36.0792  | 6.85%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **31.369**   | 39.0999  | 2.19%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.309**   | 53.3162  | 1.13%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **180.64**   | 9.3695   | 2.80%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **544.64**   | 3.51     | 7.77%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **508.27**   | 4.5848   | 9.14%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **359.29**   | 8.349    | 4.57%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.797**    | 213.24   | 0.64%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.094**    | 479.9    | 0.24%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **264.05**   | 6.5355   | 11.43%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
