## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.039**    | 281.08   | 3.75%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.168**    | 242.43   | 0.53%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.151**    | 242.62   | 0.26%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.17**     | 241.94   | 0.26%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.157**    | 242.69   | 0.31%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.161**    | 243.92   | 0.59%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.149**    | 243.9    | 0.36%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.203**    | 122.96   | 0.42%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **810.54**   | 1.646    | 1.01%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **406.75**   | 7.8083   | 7.86%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.682**    | 273.61   | 0.35%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.105**    | 247.19   | 0.58%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.102**    | 245.01   | 0.22%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.064**    | 247.39   | 0.17%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **187.7**    | 8.2563   | 3.30%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **183.64**   | 6.8729   | 2.39%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **648.47**   | 2.8341   | 1.59%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.515**    | 118.07   | 0.32%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.12**     | 145.78   | 1.45%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.208**    | 139.56   | 0.29%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **219.29**   | 5.7232   | 2.14%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **135.3**    | 11.6121  | 3.54%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.669**    | 119.4    | 0.93%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.691**    | 116.29   | 0.42%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **148.39**   | 9.3768   | 3.02%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **98.883**   | 11.4853  | 1.82%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.129**    | 251.1    | 1.00%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.179**    | 241.21   | 0.29%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **217.59**   | 5.8591   | 2.20%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **362.83**   | 4.7867   | 2.92%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **318.41**   | 9.2103   | 7.76%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **335.2**    | 4.2159   | 1.30%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.086**    | 246.18   | 0.28%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **117.46**   | 15.7866  | 6.75%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **116.77**   | 11.7839  | 3.96%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **124.48**   | 9.9549   | 3.34%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **291.86**   | 6.2087   | 4.42%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **146.82**   | 58.5395  | 21.22%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.574**    | 116.95   | 0.17%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.115**    | 244.99   | 0.30%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **447.08**   | 5.6976   | 8.32%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **755.18**   | 9.7089   | 19.09%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **404.8**    | 8.1351   | 9.96%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **363.61**   | 6.0407   | 7.18%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.164**    | 243.14   | 0.43%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.13**     | 243.69   | 0.38%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **12.788**   | 89.8186  | 11.04%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.678**    | 175.61   | 37.96%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.361**    | 158.15   | 7.61%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **162.95**   | 11.4206  | 8.09%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **281.97**   | 7.4352   | 3.23%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **86.945**   | 51.4642  | 9.87%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **36.034**   | 31.635   | 1.47%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **22.96**    | 44.623   | 0.76%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **174.8**    | 84.394   | 31.54%          | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **692.02**   | 2.842    | 7.14%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **405.92**   | 8.9246   | 17.72%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **413.9**    | 9.4515   | 7.89%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **5.009**    | 203.18   | 0.52%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.107**    | 484.47   | 0.61%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **256.93**   | 12.9472  | 20.51%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
