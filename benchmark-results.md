## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.167**    | 262.69   | 2.95%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.314**    | 236.97   | 0.65%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.33**     | 236.02   | 0.89%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.308**    | 251.36   | 2.28%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.319**    | 236.77   | 0.67%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.33**     | 233.22   | 0.29%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.296**    | 244.1    | 1.36%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.414**    | 122.04   | 0.93%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **912.72**   | 1.3673   | 0.53%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **467.09**   | 2.319    | 0.31%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.762**    | 272.05   | 1.18%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.113**    | 267.62   | 2.63%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.222**    | 244.89   | 0.99%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.195**    | 240.59   | 0.42%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **171.68**   | 7.6339   | 2.57%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **165.71**   | 7.5406   | 2.00%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **643.08**   | 2.6113   | 1.32%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **9.008**    | 112.91   | 0.82%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.528**    | 135.21   | 0.81%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.587**    | 132.57   | 0.21%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **201.75**   | 5.991    | 1.71%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **125.64**   | 11.8961  | 3.26%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.852**    | 119.05   | 1.39%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.894**    | 117.23   | 1.17%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **132.74**   | 10.9731  | 3.64%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **92.902**   | 12.9363  | 2.43%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.314**    | 247.4    | 1.75%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.381**    | 230.84   | 0.47%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **203.94**   | 6.0184   | 1.89%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **356.79**   | 5.3432   | 3.27%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **344**      | 8.393    | 5.96%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **291.74**   | 4.5542   | 1.81%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.196**    | 239.55   | 0.20%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **109.77**   | 15.2962  | 5.69%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **103.23**   | 17.7105  | 4.98%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **114.16**   | 11.6653  | 2.95%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **282.98**   | 6.0428   | 4.10%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **175.53**   | 6.6092   | 1.04%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **9.131**    | 110.16   | 0.34%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.519**    | 223.91   | 0.76%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **408.77**   | 5.4601   | 6.81%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **641.55**   | 8.8655   | 11.19%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **342.03**   | 7.0127   | 7.30%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **305.57**   | 8.2793   | 6.99%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.353**    | 233.58   | 0.67%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.205**    | 255.76   | 1.94%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.992**   | 93.6752  | 10.15%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.369**    | 180.58   | 32.42%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.254**    | 161.94   | 16.12%          | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **135.67**   | 12.2272  | 7.84%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **234.4**    | 7.7559   | 2.69%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **78.512**   | 35.3061  | 7.05%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **32.109**   | 38.3066  | 2.14%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.985**   | 52.4618  | 1.41%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **191.36**   | 8.738    | 2.68%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **594.62**   | 3.2584   | 6.44%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **464.11**   | 5.8324   | 12.11%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **354.74**   | 8.7396   | 4.90%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.915**    | 209.45   | 0.87%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.158**    | 465.96   | 0.24%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **221.46**   | 12.869   | 22.56%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
