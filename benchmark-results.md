## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.644**    | 312.05   | 4.57%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **3.943**    | 256.38   | 0.48%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **3.944**    | 257.72   | 0.47%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **3.917**    | 270.33   | 1.53%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **3.915**    | 260.23   | 0.58%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **3.949**    | 257.79   | 0.59%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **3.94**     | 255.73   | 0.23%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.82**     | 128.49   | 0.24%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **802.22**   | 1.584    | 0.63%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **459.79**   | 2.5344   | 0.77%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.527**    | 287.61   | 0.49%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **3.878**    | 263.37   | 0.72%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **3.889**    | 258.05   | 0.16%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.863**    | 259.48   | 0.16%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **184.35**   | 7.4296   | 3.15%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **179.41**   | 8.8773   | 2.62%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **629.01**   | 2.8163   | 1.57%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **7.93**     | 126.98   | 0.35%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **6.774**    | 152.31   | 1.29%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **6.876**    | 150.27   | 0.86%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **216.53**   | 5.6631   | 1.84%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **132.77**   | 11.8715  | 3.26%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.284**    | 121.83   | 0.32%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.242**    | 122.47   | 0.30%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **157.45**   | 7.9764   | 2.16%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **93.823**   | 12.4452  | 2.10%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **3.942**    | 258.89   | 0.55%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **3.98**     | 252.96   | 0.34%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **215.94**   | 5.8346   | 2.02%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **364.7**    | 4.6489   | 3.13%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **309.85**   | 9.234    | 7.40%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **327.24**   | 4.4147   | 1.51%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.051**    | 248.48   | 0.25%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **121.92**   | 12.963   | 5.05%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **107.59**   | 18.0663  | 7.70%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **123**      | 10.5502  | 3.39%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **295.06**   | 6.1633   | 4.32%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **173.85**   | 6.5965   | 1.17%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.621**    | 120.8    | 1.24%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.19**     | 268.29   | 3.14%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **466.88**   | 5.7603   | 7.79%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **755.86**   | 8.1136   | 10.60%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **371.64**   | 6.4837   | 8.14%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **354.2**    | 6.0714   | 6.87%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.103**    | 256.43   | 1.34%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.096**    | 245.85   | 0.32%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **12.733**   | 91.1788  | 12.85%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.989**    | 152.53   | 15.98%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.316**    | 158.93   | 4.81%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **166.72**   | 11.8369  | 7.34%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **283.53**   | 7.7206   | 3.43%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **84.895**   | 52.6476  | 10.19%          | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **36.382**   | 30.5693  | 1.56%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **23.214**   | 44.2092  | 0.80%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **203.93**   | 7.7569   | 3.06%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **698.58**   | 3.11     | 6.80%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **570.39**   | 4.5523   | 11.36%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **428.76**   | 8.8826   | 7.47%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.823**    | 235.23   | 3.39%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.04**     | 492.39   | 0.17%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **234.28**   | 12.7477  | 22.59%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
