## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.049**    | 271.72   | 2.93%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.226**    | 240.6    | 0.71%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.194**    | 242.97   | 0.86%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.213**    | 241.06   | 0.50%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.184**    | 246.24   | 1.00%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.227**    | 238.43   | 0.36%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.158**    | 244.58   | 0.90%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.838**    | 141.3    | 3.14%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **861.66**   | 2.0845   | 1.23%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **514.98**   | 2.3063   | 0.59%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.388**    | 300.31   | 0.76%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.135**    | 245.22   | 0.84%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.128**    | 249.03   | 1.00%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.084**    | 248.4    | 0.53%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **166.71**   | 10.0867  | 3.17%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **164.97**   | 7.4055   | 1.89%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **596.16**   | 2.79     | 9.20%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.722**    | 117.62   | 0.80%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.23**     | 152.81   | 3.18%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.405**    | 140.24   | 0.99%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **198.34**   | 6.0024   | 1.66%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **124.31**   | 11.2974  | 3.03%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.685**    | 118.54   | 1.00%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.548**    | 125.1    | 2.46%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **122.61**   | 12.0889  | 4.38%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **83.432**   | 14.6923  | 2.96%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.145**    | 255.08   | 1.67%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.17**     | 248.01   | 1.57%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **197.72**   | 7.2529   | 1.95%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **333.86**   | 5.4991   | 3.31%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **247.29**   | 18.8059  | 10.01%          | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **296.09**   | 4.694    | 1.68%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.134**    | 249.71   | 0.92%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **103.31**   | 16.1705  | 5.96%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **93.683**   | 20.7649  | 7.13%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **105.74**   | 14.09    | 3.79%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **268.3**    | 6.6699   | 4.59%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **142.24**   | 38.4672  | 13.72%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.644**    | 122.15   | 1.52%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.199**    | 255.78   | 2.07%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **378.88**   | 6.0366   | 6.48%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **617.65**   | 5.5677   | 9.86%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **287.85**   | 7.4792   | 7.88%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **274.38**   | 6.502    | 6.50%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.283**    | 243      | 1.29%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.285**    | 246.38   | 1.69%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.89**    | 94.6923  | 10.38%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.88**     | 149.1    | 9.57%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.25**     | 160      | 0.06%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **141.43**   | 14.2176  | 4.80%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **235.25**   | 8.9473   | 3.40%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **75.713**   | 48.3314  | 8.61%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **31.692**   | 40.1797  | 2.11%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.282**   | 51.6833  | 1.11%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **190.73**   | 10.12    | 3.01%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **570.64**   | 3.276    | 7.09%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **498**      | 4.4773   | 10.06%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **359.15**   | 8.855    | 7.11%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.808**    | 217.51   | 1.70%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.102**    | 481.22   | 0.43%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **257.83**   | 6.3427   | 11.04%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
