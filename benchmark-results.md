## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.111**    | 258.67   | 2.41%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.257**    | 236.75   | 0.42%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.256**    | 237.07   | 0.38%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.266**    | 242.3    | 0.98%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.26**     | 235.9    | 0.37%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.238**    | 243.55   | 1.21%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.265**    | 237.4    | 0.54%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.268**    | 122.47   | 0.57%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **866.68**   | 1.4866   | 0.60%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **399.87**   | 7.9559   | 8.54%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.753**    | 268.29   | 0.39%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.196**    | 244.13   | 0.94%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.185**    | 242.91   | 0.62%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.15**     | 243.43   | 0.43%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **169.96**   | 7.6095   | 3.02%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **165.64**   | 7.6442   | 2.23%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **624.05**   | 3.0078   | 1.70%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.818**    | 114.73   | 0.61%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.326**    | 141.48   | 1.24%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.411**    | 135.9    | 0.34%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **204.92**   | 6.0498   | 1.98%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **125.73**   | 12.7134  | 3.88%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.637**    | 117.87   | 0.82%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.706**    | 116.59   | 0.49%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **149.38**   | 8.5486   | 2.38%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **86.366**   | 14.782   | 3.72%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.188**    | 248.92   | 1.53%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.239**    | 241.29   | 0.96%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **201.37**   | 6.3252   | 2.43%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **331.75**   | 6.0629   | 4.01%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **354.21**   | 8.7486   | 6.10%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **297.5**    | 4.7013   | 1.78%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.143**    | 245.79   | 0.54%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **107.73**   | 15.1615  | 5.76%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **100.47**   | 15.2519  | 4.60%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **109.27**   | 15.1055  | 4.40%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **267.69**   | 7.491    | 5.18%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **171.09**   | 6.9124   | 1.23%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.813**    | 116.05   | 0.90%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.308**    | 233.47   | 0.27%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **387.35**   | 6.4186   | 7.65%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **602.12**   | 7.0481   | 10.24%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **314.3**    | 7.0668   | 7.58%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **276.51**   | 8.9152   | 8.65%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.252**    | 249.51   | 1.75%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.169**    | 242.44   | 0.67%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.617**   | 95.6653  | 9.22%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.383**    | 179.36   | 32.03%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.158**    | 162.81   | 3.25%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **138.79**   | 13.5576  | 7.91%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **245.72**   | 8.1326   | 3.03%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **78.762**   | 39.566   | 7.79%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **31.93**    | 40.3641  | 2.79%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.711**   | 52.0703  | 1.28%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **182.15**   | 10.2465  | 3.99%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **561.83**   | 3.5536   | 7.45%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **476.05**   | 4.7007   | 10.40%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **370.66**   | 9.4807   | 6.73%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.9**      | 207.48   | 0.57%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.121**    | 474.51   | 0.22%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **213.87**   | 12.9243  | 22.62%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
