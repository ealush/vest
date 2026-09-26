## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.992**    | 276.15   | 2.95%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.114**    | 245.77   | 0.60%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.131**    | 244.67   | 0.32%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.129**    | 245.84   | 0.45%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.106**    | 252.62   | 1.00%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.139**    | 242.67   | 0.15%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.124**    | 247.81   | 0.75%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.142**    | 126.76   | 0.83%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **799.76**   | 1.7951   | 1.06%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **439.45**   | 6.2946   | 3.92%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.62**     | 278.53   | 0.43%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.024**    | 254.72   | 0.75%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.039**    | 248.62   | 0.17%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.02**     | 249.95   | 0.20%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **185.75**   | 8.8267   | 3.30%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **181.49**   | 9.0542   | 2.66%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **637.51**   | 2.8148   | 1.63%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.389**    | 123.99   | 1.06%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.094**    | 145.49   | 1.23%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.181**    | 140.13   | 0.31%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **217.95**   | 5.6648   | 1.96%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **137.82**   | 9.7688   | 2.82%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.682**    | 115.6    | 0.20%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.693**    | 116.18   | 0.37%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **157.27**   | 8.9695   | 2.79%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **98.385**   | 11.5099  | 1.81%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.151**    | 244.94   | 0.48%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.135**    | 258.38   | 1.75%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **217.47**   | 5.8774   | 2.21%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **359.54**   | 4.7219   | 2.91%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **197.89**   | 29.134   | 11.06%          | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **327.36**   | 4.4506   | 1.52%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.067**    | 250.79   | 0.66%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **117.37**   | 14.9553  | 5.96%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **100.22**   | 26.073   | 10.11%          | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **122.76**   | 11.2796  | 3.66%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **291.55**   | 6.2016   | 4.39%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **169**      | 7.6656   | 1.33%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.642**    | 123.29   | 2.38%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.209**    | 241.15   | 0.62%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **442.55**   | 5.6924   | 7.49%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **762.98**   | 5.7535   | 8.85%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **394.92**   | 6.6268   | 7.67%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **346.13**   | 5.8395   | 6.68%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.184**    | 243.26   | 0.73%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.117**    | 265.67   | 2.37%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **12.277**   | 94.0202  | 12.50%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.95**     | 149.93   | 10.65%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.159**    | 162.59   | 1.71%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **161.85**   | 11.0031  | 8.11%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **273.87**   | 8.0395   | 3.58%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **88.812**   | 43.3767  | 8.47%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **35.467**   | 31.5934  | 1.53%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **22.653**   | 47.49    | 1.25%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **205.3**    | 8.0724   | 2.99%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **681.8**    | 3.1237   | 7.24%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **555.12**   | 4.605    | 10.64%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **407.39**   | 9.3987   | 8.68%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.883**    | 236.59   | 4.01%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.101**    | 482.58   | 0.51%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **231.71**   | 13.4429  | 22.53%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
