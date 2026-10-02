## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.999**    | 276.09   | 2.94%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.131**    | 246.29   | 0.73%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.144**    | 243.94   | 0.39%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.133**    | 247.33   | 0.60%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.13**     | 244.6    | 0.42%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.13**     | 247.25   | 0.55%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.114**    | 252.49   | 1.16%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.204**    | 122.83   | 0.36%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **792.13**   | 1.6258   | 0.65%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **465.49**   | 2.5727   | 0.68%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.44**     | 293.5    | 0.44%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.022**    | 252.08   | 0.65%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.047**    | 248.66   | 0.24%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.007**    | 250.63   | 0.19%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **189.37**   | 8.629    | 3.50%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **187.1**    | 7.921    | 2.52%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **639.92**   | 2.8855   | 1.75%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.358**    | 122.53   | 0.79%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.154**    | 142.61   | 1.01%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.204**    | 140.78   | 0.51%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **221.5**    | 5.7671   | 2.19%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **139.04**   | 9.5242   | 2.64%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.738**    | 115.16   | 0.30%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.711**    | 115.86   | 0.39%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **164.21**   | 8.8976   | 2.49%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **98.418**   | 11.8462  | 2.00%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.094**    | 286.02   | 4.32%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.208**    | 239.65   | 0.26%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **222.61**   | 5.689    | 2.09%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **361.69**   | 4.6812   | 3.03%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **207.5**    | 16.3266  | 10.67%          | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **328.69**   | 4.6203   | 1.71%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **3.888**    | 261.06   | 0.53%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **117.42**   | 14.0145  | 5.57%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **108.14**   | 19.5127  | 8.16%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **122.28**   | 10.6308  | 3.72%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **292.4**    | 6.2427   | 4.57%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **165.02**   | 7.7819   | 1.43%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.761**    | 116.01   | 0.72%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.224**    | 238.19   | 0.29%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **443**      | 6.307    | 8.39%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **722.34**   | 8.84     | 11.76%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **391.85**   | 7.3352   | 8.05%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **354.08**   | 6.8217   | 7.38%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.188**    | 241.43   | 0.48%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.152**    | 241.72   | 0.18%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **12.615**   | 92.8789  | 13.07%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **7.096**    | 145.26   | 12.55%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.205**    | 161.17   | 0.09%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **158.35**   | 13.1608  | 7.69%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **272.29**   | 7.8548   | 3.31%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **86.641**   | 41.6701  | 8.41%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **34.929**   | 41.0141  | 3.05%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **22.731**   | 45.4571  | 0.72%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **205.31**   | 6.974    | 2.42%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **686.6**    | 3.3784   | 7.51%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **549.36**   | 4.7032   | 10.69%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **415.86**   | 9.0902   | 7.77%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **5**        | 206.05   | 0.97%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.116**    | 474.94   | 0.23%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **216.8**    | 14.3188  | 23.11%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
