## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.003**    | 271.8    | 3.41%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.149**    | 251.57   | 1.23%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.155**    | 245.11   | 0.73%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.176**    | 247.18   | 0.88%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.192**    | 240.71   | 0.39%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.124**    | 254.81   | 1.66%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.134**    | 245.56   | 0.72%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.019**    | 126.77   | 0.81%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **852.11**   | 1.5715   | 0.74%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **393.95**   | 8.2255   | 8.66%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.649**    | 280.93   | 1.06%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.185**    | 245.42   | 1.13%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.215**    | 241.3    | 0.67%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.148**    | 241.93   | 0.16%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **167.17**   | 7.8607   | 2.88%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **162**      | 7.8973   | 2.18%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **636.43**   | 2.6737   | 1.42%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.772**    | 114.99   | 0.39%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.43**     | 137.95   | 0.98%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.457**    | 134.89   | 0.21%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **198.51**   | 7.0701   | 2.67%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **126.64**   | 10.2342  | 2.52%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.752**    | 120.07   | 1.30%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.768**    | 119.86   | 1.36%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **140.93**   | 8.9327   | 2.19%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **88.715**   | 14.6767  | 2.37%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.282**    | 237.76   | 0.73%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.318**    | 233.43   | 0.30%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **201.67**   | 6.1107   | 1.81%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **347.63**   | 5.5222   | 3.26%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **384.69**   | 7.8497   | 5.44%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **245.83**   | 5.4437   | 2.99%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.034**    | 257.8    | 1.09%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **108.36**   | 14.219   | 5.48%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **101.35**   | 14.6006  | 3.78%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **113.13**   | 10.6012  | 2.94%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **279.51**   | 6.1676   | 3.88%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **173.98**   | 6.4943   | 1.13%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.79**     | 117.64   | 1.21%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.24**     | 245.42   | 1.58%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **395.28**   | 5.6938   | 6.38%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **591.3**    | 7.1107   | 10.05%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **304.55**   | 7.0153   | 8.22%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **289.56**   | 7.5652   | 7.47%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.42**     | 228.07   | 0.47%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.355**    | 231.38   | 0.35%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **11.605**   | 94.6118  | 9.86%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.339**    | 186.07   | 39.53%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.194**    | 162.59   | 8.87%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **140.32**   | 15.8264  | 8.17%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **248.76**   | 7.889    | 3.09%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **79.662**   | 25.1827  | 6.16%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **32.476**   | 38.2353  | 2.20%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.732**   | 50.8859  | 0.80%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **187.76**   | 9.6617   | 3.24%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **574.13**   | 3.4128   | 7.27%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **463.08**   | 5.6645   | 11.79%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **343.98**   | 9.1801   | 6.99%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.809**    | 216.64   | 1.85%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.139**    | 477.95   | 0.64%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **213.07**   | 13.211   | 22.27%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
