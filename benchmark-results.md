## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **7.502**    | 154.94   | 4.29%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **7.783**    | 180.03   | 10.22%          | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **8.316**    | 122.21   | 0.52%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **8.158**    | 138.15   | 3.38%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **8.266**    | 125.58   | 1.19%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **8.301**    | 124.17   | 1.06%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **7.99**     | 127.21   | 0.81%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **16.3**     | 63.4295  | 1.17%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **936.37**   | 2.1031   | 1.34%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **6.086**    | 168.18   | 0.98%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **8.154**    | 124.46   | 0.61%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **7.899**    | 133      | 1.56%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **7.82**     | 128.96   | 0.41%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **337.23**   | 4.4012   | 2.93%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **351.18**   | 4.11     | 1.96%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **15.887**   | 65.2077  | 1.41%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **13.392**   | 79.241   | 2.00%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **13.533**   | 82.7273  | 3.12%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **412.31**   | 3.3175   | 1.83%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **249.75**   | 6.1577   | 2.62%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **16.967**   | 59.3992  | 0.41%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **17.031**   | 59.1676  | 0.50%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **248.26**   | 4.8946   | 1.06%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **166.64**   | 8.4944   | 1.85%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **8.138**    | 131.09   | 1.68%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **8.213**    | 123.3    | 0.49%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **414.91**   | 3.7131   | 1.91%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **713.67**   | 2.4779   | 2.07%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **514.94**   | 7.1393   | 6.96%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **490.26**   | 3.1324   | 1.66%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **7.448**    | 137.53   | 1.57%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **225.28**   | 9.5946   | 6.20%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **220.46**   | 6.4773   | 3.35%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **229.65**   | 5.9579   | 3.38%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **517.58**   | 4.2449   | 4.51%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **310.28**   | 5.2007   | 2.11%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **16.592**   | 61.4885  | 0.70%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **7.772**    | 130.72   | 0.61%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **959.07**   | 4.6558   | 9.19%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **911.75**   | 4.4807   | 7.80%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **647.7**    | 3.926    | 6.71%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **7.403**    | 138.34   | 1.91%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **7.097**    | 144.88   | 1.59%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **21.203**   | 58.4115  | 21.34%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **12.494**   | 82.4878  | 12.94%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **11.199**   | 90.9437  | 23.43%          | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **304.31**   | 8.024    | 6.75%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **452.76**   | 6.0383   | 3.82%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **157.5**    | 14.1111  | 7.81%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **60.433**   | 19.9692  | 1.76%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **39.399**   | 31.6576  | 1.51%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **378.39**   | 3.5798   | 1.87%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **834.98**   | 7.0854   | 6.94%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **9.325**    | 114.34   | 1.93%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **3.987**    | 259.53   | 1.41%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **414.29**   | 8.2717   | 16.44%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
