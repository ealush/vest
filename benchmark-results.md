## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **3.943**    | 279.98   | 2.92%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.067**    | 251.26   | 0.74%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.091**    | 250.11   | 0.75%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.103**    | 248.83   | 0.60%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.04**     | 265.17   | 1.81%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.067**    | 256.85   | 1.23%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.064**    | 252.18   | 0.78%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.903**    | 128.34   | 0.64%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **859.35**   | 1.6205   | 0.79%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **377.14**   | 8.2447   | 8.22%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.651**    | 291.21   | 1.63%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **3.973**    | 259.32   | 1.28%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.01**     | 252.27   | 0.41%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.963**    | 256.44   | 0.49%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **166.73**   | 10.1325  | 3.59%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **161.54**   | 8.263    | 2.49%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **623.72**   | 2.9238   | 1.79%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.366**    | 121.76   | 0.59%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.14**     | 146.9    | 1.58%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.212**    | 139.76   | 0.40%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **198.21**   | 6.3941   | 2.19%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **122.68**   | 12.3309  | 3.57%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.163**    | 133.9    | 2.75%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.432**    | 119.71   | 0.29%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **139.18**   | 10.4092  | 3.80%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **88.117**   | 14.6691  | 2.55%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.073**    | 250.68   | 0.68%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.083**    | 250.84   | 0.72%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **195.08**   | 7.2303   | 2.54%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **341.22**   | 5.366    | 3.62%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **345.02**   | 8.8283   | 5.61%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **301.91**   | 4.0703   | 1.10%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.027**    | 251.51   | 0.48%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **102.64**   | 14.6584  | 5.56%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **96.692**   | 26.2903  | 7.35%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **107.51**   | 11.8827  | 3.68%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **265.74**   | 6.9548   | 4.83%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **166.85**   | 8.3547   | 1.98%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.355**    | 134.47   | 3.39%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.126**    | 245.36   | 0.56%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **382.64**   | 6.6765   | 8.26%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **599.54**   | 6.7759   | 11.39%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **297.99**   | 8.5585   | 9.39%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **287.85**   | 7.6332   | 7.21%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.168**    | 246.7    | 1.06%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.23**     | 244.31   | 1.01%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.414**   | 97.5716  | 8.27%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.205**    | 185.33   | 33.85%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.06**     | 165.3    | 2.12%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **138.4**    | 15.5175  | 8.52%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **244.42**   | 8.6661   | 3.27%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **76.758**   | 22.0144  | 5.64%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **31.138**   | 39.6978  | 2.45%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **19.917**   | 56.2829  | 1.74%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **179.73**   | 12.2928  | 4.31%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **561.97**   | 3.1622   | 7.06%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **450.36**   | 4.9072   | 10.70%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **332.87**   | 9.7149   | 8.38%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.739**    | 215.21   | 0.81%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.088**    | 482.24   | 0.24%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **214.38**   | 13.9741  | 23.17%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
