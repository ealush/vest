## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.077**    | 270.81   | 3.09%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.259**    | 240.85   | 1.02%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.257**    | 238.85   | 0.66%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.223**    | 241.18   | 0.68%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.182**    | 246.73   | 1.32%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.172**    | 251.07   | 1.63%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.276**    | 240.29   | 1.14%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.053**    | 127.9    | 1.38%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **914.17**   | 1.3507   | 0.52%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **519.41**   | 2.2407   | 0.58%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.435**    | 307.41   | 1.43%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.092**    | 250.59   | 1.02%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.101**    | 247.19   | 1.01%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.996**    | 257.28   | 1.11%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **167.75**   | 7.9877   | 3.10%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **166.37**   | 8.1616   | 1.96%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **622.51**   | 2.7125   | 1.40%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.599**    | 118.03   | 0.56%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.277**    | 143.32   | 1.67%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.092**    | 147.17   | 2.11%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **191.49**   | 8.2602   | 2.81%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **122.58**   | 12.5835  | 3.21%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.027**    | 128.23   | 1.37%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.023**    | 127.04   | 0.98%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **124.55**   | 12.1867  | 4.35%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **81.233**   | 17.047   | 3.23%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.132**    | 245.09   | 0.55%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.187**    | 241.53   | 0.69%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **199.28**   | 6.2693   | 2.09%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **327.64**   | 5.7605   | 3.25%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **225.6**    | 12.4756  | 8.54%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **300.49**   | 4.7565   | 1.85%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.204**    | 242.07   | 0.75%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **106.18**   | 15.1489  | 6.01%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **94.351**   | 22.4638  | 7.57%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **107.67**   | 11.6979  | 3.76%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **271.12**   | 6.6087   | 4.28%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **143.52**   | 40.8686  | 14.31%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.945**    | 115      | 0.81%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.394**    | 231.06   | 0.61%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **373.73**   | 6.3788   | 7.34%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **599.17**   | 5.5852   | 9.22%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **290.35**   | 7.7228   | 7.20%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **282.72**   | 6.3592   | 6.10%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.398**    | 228.81   | 0.31%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.323**    | 236.13   | 0.68%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.705**   | 96.1383  | 11.03%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.78**     | 150.84   | 8.49%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.02**     | 167.27   | 8.83%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **133.84**   | 20.9955  | 6.58%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **234.3**    | 7.8293   | 2.91%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **78.742**   | 50.1152  | 8.96%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **30.68**    | 41.1451  | 2.71%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **19.923**   | 54.0866  | 1.26%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **165.23**   | 60.3141  | 22.01%          | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **573.1**    | 3.5089   | 7.29%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **496.48**   | 5.0345   | 10.32%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **356.77**   | 8.3001   | 4.46%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.901**    | 210.95   | 0.96%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.162**    | 467.42   | 0.39%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **278.52**   | 6.0022   | 9.84%           | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
