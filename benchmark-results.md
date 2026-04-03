## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.939**    | 276.61   | 3.20%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.086**    | 253.75   | 1.01%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.126**    | 246.2    | 0.57%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.116**    | 246.68   | 0.65%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.123**    | 245.06   | 0.43%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.103**    | 266.83   | 2.40%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.099**    | 252.83   | 1.02%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.905**    | 129.39   | 0.90%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **818.69**   | 1.5665   | 0.66%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **385.3**    | 8.1025   | 7.97%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.616**    | 280.1    | 0.39%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **3.924**    | 256.8    | 0.45%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **3.95**     | 256.49   | 0.50%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.908**    | 259.11   | 0.51%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **166.22**   | 7.8502   | 2.98%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **161.84**   | 8.7337   | 2.59%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **619.09**   | 2.828    | 1.65%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.416**    | 121.27   | 0.69%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.123**    | 143.43   | 0.94%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.198**    | 139.94   | 0.37%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **200.13**   | 6.072    | 1.81%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **125.04**   | 11.0544  | 2.53%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.403**    | 124.21   | 1.30%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.278**    | 122.43   | 0.51%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **143.62**   | 9.1486   | 3.15%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **85.436**   | 12.7851  | 1.92%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.028**    | 254.6    | 1.14%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.044**    | 249.26   | 0.42%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **191.7**    | 8.559    | 3.04%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **333.7**    | 6.4451   | 4.15%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **365.56**   | 10.2445  | 9.01%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **273.32**   | 4.84     | 2.16%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.129**    | 252.45   | 1.53%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **103.77**   | 15.9476  | 5.69%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **92.794**   | 17.3448  | 5.77%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **102.81**   | 15.5255  | 4.50%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **255.06**   | 7.5891   | 5.42%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **169.84**   | 6.915    | 1.34%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.613**    | 117.92   | 0.77%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.234**    | 238.38   | 0.45%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **387.1**    | 6.6419   | 7.40%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **646.81**   | 6.7063   | 9.12%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **313.63**   | 8.4723   | 8.70%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **296.4**    | 7.4752   | 6.97%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.308**    | 237.04   | 0.91%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.275**    | 235.81   | 0.32%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.519**   | 96.2199  | 9.35%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.298**    | 181.43   | 31.20%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.122**    | 163.63   | 2.16%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **132.79**   | 18.3286  | 8.50%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **238.22**   | 8.7788   | 3.34%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **75.474**   | 38.9424  | 7.51%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **31.012**   | 37.4261  | 1.63%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **19.528**   | 55.221   | 1.34%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **187**      | 9.4442   | 3.30%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **561.42**   | 3.3657   | 7.78%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **488.32**   | 4.5776   | 10.64%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **351.43**   | 10.7062  | 5.78%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.768**    | 218.58   | 1.14%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.087**    | 482.88   | 0.32%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **196.65**   | 12.7938  | 23.44%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
