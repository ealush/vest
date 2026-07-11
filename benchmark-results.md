## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.955**    | 276.65   | 3.52%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.063**    | 253.17   | 1.07%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.087**    | 247.95   | 0.45%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.056**    | 260.03   | 1.43%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.082**    | 248.55   | 0.75%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.081**    | 247.42   | 0.44%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.072**    | 252.7    | 1.08%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.909**    | 136.83   | 2.29%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **799.18**   | 1.7088   | 1.04%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **463.15**   | 2.6427   | 0.82%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.566**    | 283.5    | 0.47%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **3.96**     | 283.07   | 3.08%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.014**    | 253.07   | 0.58%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.905**    | 274.75   | 2.18%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **176.7**    | 8.9955   | 3.99%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **176.82**   | 7.8012   | 2.83%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **633.49**   | 2.9924   | 1.86%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.218**    | 124.23   | 0.92%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.005**    | 146.31   | 1.35%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.141**    | 140.89   | 0.26%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **211.52**   | 6.3694   | 2.78%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **130.77**   | 11.4129  | 3.71%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.582**    | 117.72   | 0.60%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.546**    | 120.38   | 0.93%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **128.54**   | 9.4795   | 2.05%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **90.185**   | 14.307   | 3.09%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.079**    | 251.62   | 0.87%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.032**    | 266.42   | 2.66%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **212.24**   | 6.3024   | 2.70%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **351.69**   | 5.4952   | 3.54%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **306.9**    | 9.5071   | 6.35%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **331.92**   | 4.5143   | 1.49%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **3.926**    | 274.1    | 2.27%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **117.76**   | 15.4128  | 6.29%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **111.01**   | 14.0746  | 4.58%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **122.42**   | 10.4024  | 3.54%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **284.7**    | 6.6583   | 4.87%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **171.75**   | 8.4546   | 1.73%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.703**    | 116.06   | 0.53%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.122**    | 246.1    | 0.74%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **439.37**   | 6.0015   | 8.25%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **754.96**   | 7.684    | 10.97%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **396.93**   | 7.7782   | 9.49%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **341.58**   | 6.2054   | 6.72%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.138**    | 244.29   | 0.45%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.044**    | 259.13   | 1.54%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **12.266**   | 92.6075  | 11.68%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.381**    | 185.17   | 39.55%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.186**    | 162.11   | 3.64%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **161.59**   | 14.489   | 9.11%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **284.32**   | 7.6681   | 3.33%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **81.082**   | 55.8907  | 10.50%          | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **35.35**    | 32.8267  | 1.73%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **22.723**   | 45.2716  | 0.84%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **172.64**   | 76.8491  | 28.50%          | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **669.31**   | 3.3165   | 7.85%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **409.71**   | 9.4022   | 16.64%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **416.75**   | 9.7416   | 8.26%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.962**    | 204.98   | 0.59%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.079**    | 488.1    | 0.50%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **257.44**   | 15.5264  | 25.59%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
