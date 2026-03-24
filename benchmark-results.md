## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.068**    | 272.59   | 3.39%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.246**    | 239.47   | 0.51%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.214**    | 241.32   | 0.77%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.249**    | 239.18   | 0.50%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.268**    | 235.23   | 0.20%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.228**    | 245.46   | 1.08%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.249**    | 236.61   | 0.23%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.272**    | 121.81   | 0.42%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **884.51**   | 1.4245   | 1.04%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **419.83**   | 8.6045   | 9.11%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.682**    | 276.12   | 0.62%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.171**    | 243.6    | 0.67%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.164**    | 248.38   | 0.98%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.148**    | 243.31   | 0.42%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **170.75**   | 9.4561   | 3.09%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **164.55**   | 7.4143   | 1.89%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **626.68**   | 2.7831   | 1.59%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.815**    | 116.47   | 0.73%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.394**    | 141.63   | 1.71%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.436**    | 135.83   | 0.42%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **199.86**   | 6.0699   | 1.92%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **127.15**   | 11.6232  | 2.95%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.813**    | 114.86   | 0.38%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.832**    | 114.69   | 0.52%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **143.65**   | 8.8777   | 2.99%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **90.098**   | 14.8071  | 3.54%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.144**    | 285.23   | 4.88%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.297**    | 233.63   | 0.15%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **196.8**    | 8.2963   | 2.22%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **339.53**   | 5.6311   | 3.07%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **362.67**   | 8.0814   | 6.63%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **305.56**   | 4.4331   | 1.71%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.233**    | 239.31   | 0.53%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **107.18**   | 16.3319  | 5.83%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **101.83**   | 15.6118  | 5.02%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **111.43**   | 11.1566  | 3.64%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **267.34**   | 7.0798   | 5.22%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **171.75**   | 6.7265   | 1.11%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.802**    | 116.65   | 0.89%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.302**    | 236.24   | 0.47%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **410.66**   | 5.7659   | 7.43%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **710.81**   | 6.859    | 9.00%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **337.87**   | 7.5058   | 8.15%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **316.14**   | 8.2589   | 7.57%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.395**    | 230.46   | 0.51%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.288**    | 252.89   | 2.18%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.891**   | 95.1728  | 10.67%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.338**    | 184.88   | 37.53%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.396**    | 156.49   | 1.17%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **141.37**   | 12.7091  | 8.29%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **250.78**   | 8.9055   | 3.39%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **78.656**   | 35.4185  | 7.26%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **32.199**   | 36.2827  | 1.80%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.332**   | 52.6112  | 1.20%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **187.52**   | 9.8282   | 3.37%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **604.64**   | 3.4422   | 7.22%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **456.27**   | 5.7962   | 12.24%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **349.94**   | 9.3032   | 7.74%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.914**    | 207.75   | 0.57%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.15**     | 468.69   | 0.34%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **205.42**   | 13.4141  | 22.00%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
