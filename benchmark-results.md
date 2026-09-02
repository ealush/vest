## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.05**     | 268.03   | 2.92%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.233**    | 239.03   | 0.48%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.241**    | 240.88   | 0.81%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.222**    | 240.01   | 0.60%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.211**    | 246      | 1.19%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.248**    | 239.82   | 0.57%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.224**    | 245.19   | 1.17%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.222**    | 123.42   | 0.47%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **848.38**   | 1.3928   | 0.47%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **482.96**   | 2.4854   | 0.56%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.742**    | 271.86   | 0.60%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.136**    | 247.4    | 0.86%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.185**    | 241.58   | 0.40%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.143**    | 244.09   | 0.43%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **174.19**   | 10.2049  | 3.23%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **168.22**   | 9.0435   | 2.54%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **636.13**   | 2.7501   | 1.52%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.753**    | 116.13   | 0.61%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.297**    | 143.22   | 1.82%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.362**    | 137.04   | 0.48%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **203.01**   | 5.9931   | 1.68%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **125.2**    | 11.6134  | 2.94%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.765**    | 119.37   | 1.22%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.734**    | 116.87   | 0.66%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **143.6**    | 11.0849  | 3.38%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **93.132**   | 13.2422  | 1.87%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.246**    | 238.62   | 0.59%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.285**    | 238.68   | 0.80%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **199.89**   | 6.0252   | 1.80%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **342.58**   | 5.4809   | 3.21%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **292.64**   | 8.9222   | 7.65%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **286.7**    | 4.7404   | 1.93%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.174**    | 243.58   | 0.68%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **107.08**   | 14.3909  | 5.77%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **94.746**   | 19.1181  | 7.59%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **112.71**   | 12.0633  | 3.31%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **275.61**   | 6.3672   | 4.20%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **158.23**   | 17.8966  | 6.74%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.793**    | 116.59   | 0.93%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.375**    | 230.55   | 0.37%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **414.96**   | 5.2048   | 6.43%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **611.78**   | 4.9071   | 10.01%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **326.5**    | 8.4247   | 8.15%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **302.24**   | 6.0818   | 6.35%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.258**    | 240.05   | 0.88%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.222**    | 241.82   | 0.79%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.824**   | 95.2697  | 10.80%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.873**    | 151.64   | 11.37%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.278**    | 160.43   | 9.05%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **138.03**   | 12.3935  | 7.44%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **241.84**   | 8.0357   | 2.93%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **80.242**   | 39.6082  | 7.40%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **32.508**   | 35.4228  | 1.92%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.807**   | 49.2386  | 0.80%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **189.93**   | 8.7122   | 3.29%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **569.59**   | 3.4576   | 6.79%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **517.09**   | 4.4731   | 9.33%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **360.8**    | 8.342    | 4.05%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.845**    | 212.04   | 0.72%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.11**     | 492.69   | 1.01%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **268.48**   | 6.3002   | 10.41%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
