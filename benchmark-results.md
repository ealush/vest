## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.948**    | 295.78   | 4.44%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.047**    | 253.93   | 1.23%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.026**    | 253.11   | 0.79%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.042**    | 252.69   | 0.87%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **3.958**    | 294.23   | 4.31%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.051**    | 250.82   | 0.64%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.03**     | 255.89   | 1.06%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.999**    | 128.03   | 1.02%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **797.73**   | 1.8495   | 1.19%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **464.07**   | 2.6619   | 0.88%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.566**    | 283.58   | 0.49%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **3.927**    | 258.95   | 0.80%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **3.939**    | 265.08   | 1.23%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.926**    | 257.79   | 0.53%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **174.22**   | 11.441   | 4.28%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **177.3**    | 7.7297   | 2.98%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **618.49**   | 3.1609   | 1.94%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.104**    | 127.2    | 1.15%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **6.948**    | 150.52   | 1.92%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **6.995**    | 144.49   | 0.63%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **209.53**   | 6.4231   | 2.76%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **130.98**   | 10.75    | 3.60%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.422**    | 122.81   | 1.07%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.504**    | 120.18   | 0.84%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **156.36**   | 8.9478   | 2.71%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **89.63**    | 12.611   | 2.03%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.041**    | 252.93   | 0.91%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.042**    | 254.43   | 0.83%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **207.81**   | 6.7575   | 3.15%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **348.33**   | 5.7123   | 3.71%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **324.98**   | 14.4507  | 11.04%          | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **324.82**   | 4.3265   | 1.44%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **3.939**    | 255.67   | 0.39%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **111.35**   | 16.0008  | 6.16%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **108.61**   | 12.5948  | 4.44%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **117.09**   | 14.7259  | 5.37%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **278.46**   | 7.4294   | 5.76%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **163.79**   | 7.091    | 1.54%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.483**    | 119.91   | 0.80%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **3.995**    | 282.56   | 3.28%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **432.89**   | 5.9459   | 7.80%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **691.39**   | 9.559    | 11.77%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **407.07**   | 8.3609   | 10.08%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **347.53**   | 7.1052   | 7.46%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.084**    | 261.02   | 1.77%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.081**    | 250.7    | 0.72%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **12.127**   | 94.4081  | 11.03%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.369**    | 183.35   | 36.48%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.17**     | 162.08   | 0.08%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **156.57**   | 12.8024  | 8.24%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **271.64**   | 8.355    | 3.53%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **85.541**   | 44.4609  | 9.11%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **35.539**   | 33.1658  | 1.97%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **22.364**   | 46.5273  | 0.99%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **195.35**   | 9.2911   | 3.62%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **681.49**   | 3.114    | 7.61%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **397.44**   | 9.2757   | 17.38%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **404.74**   | 10.4681  | 9.08%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.872**    | 208.81   | 0.48%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.042**    | 492.02   | 0.22%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **221.05**   | 14.0268  | 27.24%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
