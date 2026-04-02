## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.948**    | 275.39   | 2.82%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.061**    | 250.4    | 0.53%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.067**    | 246.68   | 0.17%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.075**    | 247.73   | 0.31%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.051**    | 248.43   | 0.42%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.043**    | 256.1    | 1.17%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.041**    | 249.15   | 0.30%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.065**    | 126.89   | 0.63%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **826.76**   | 1.6143   | 0.78%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **394.78**   | 8.0857   | 8.18%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.607**    | 278.27   | 0.15%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.013**    | 252.35   | 0.50%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.012**    | 251.21   | 0.32%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.974**    | 254.7    | 0.45%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **179.16**   | 9.0165   | 3.58%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **180.91**   | 8.3364   | 2.89%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **632.68**   | 2.8292   | 1.59%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.34**     | 127.1    | 1.62%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.027**    | 146.67   | 1.29%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.091**    | 143.52   | 0.65%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **213.95**   | 6.0313   | 2.33%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **134.7**    | 10.887   | 3.13%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.512**    | 119.46   | 0.59%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.5**      | 118.49   | 0.32%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **142.74**   | 8.4291   | 2.75%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **92.894**   | 12.4242  | 2.46%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.071**    | 249.02   | 0.54%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.098**    | 246.69   | 0.30%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **214.85**   | 6.0085   | 2.58%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **357.67**   | 4.9263   | 3.46%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **331.03**   | 8.5861   | 8.60%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **327.04**   | 4.5247   | 1.81%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.095**    | 246.11   | 0.31%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **116.75**   | 13.3946  | 5.61%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **113.12**   | 12.8907  | 4.55%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **122.34**   | 10.4821  | 3.94%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **289.54**   | 6.8467   | 5.31%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **142.71**   | 68.4258  | 25.01%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.801**    | 114.21   | 0.20%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.185**    | 239.86   | 0.20%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **450.9**    | 5.6489   | 8.09%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **732.74**   | 7.1979   | 10.24%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **421.09**   | 8.1772   | 9.78%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **374.68**   | 6.1522   | 5.94%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.228**    | 239.41   | 0.36%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.161**    | 242.36   | 0.31%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **12.296**   | 93.0349  | 10.78%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.454**    | 180.68   | 36.86%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.25**     | 160.59   | 4.74%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **163.52**   | 11.8312  | 8.48%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **281.91**   | 7.6742   | 3.24%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **88.091**   | 37.6544  | 7.99%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **35.896**   | 31.9108  | 1.90%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **22.987**   | 44.8705  | 0.86%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **204.9**    | 8.084    | 3.31%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **670.32**   | 3.5205   | 7.92%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **391.13**   | 9.4495   | 17.21%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **401.7**    | 9.0005   | 8.30%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.889**    | 209.46   | 0.92%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.056**    | 488.47   | 0.21%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **258.16**   | 14.5503  | 25.74%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
