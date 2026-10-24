## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **5.088**    | 214.96   | 2.68%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **5.256**    | 196.21   | 1.02%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **5.275**    | 193.15   | 0.48%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **5.269**    | 192.15   | 0.37%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **5.269**    | 192.84   | 0.48%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **5.279**    | 192.28   | 0.47%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **5.265**    | 191.29   | 0.26%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **10.477**   | 96.9935  | 0.49%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **628.77**   | 2.0077   | 0.91%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **4.313**    | 232.7    | 0.22%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **5.152**    | 198.1    | 0.71%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **5.198**    | 193.14   | 0.24%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **5.161**    | 194.28   | 0.13%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **237.12**   | 6.8364   | 3.19%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **231.72**   | 5.9994   | 2.29%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **811.41**   | 2.3441   | 1.57%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **10.573**   | 95.7663  | 0.46%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **8.957**    | 113.57   | 0.88%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **9.048**    | 111.04   | 0.20%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **275.93**   | 4.6572   | 1.96%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **174.06**   | 9.2742   | 2.83%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **11.041**   | 94.1847  | 1.06%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **11.043**   | 91.3192  | 0.40%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **202.49**   | 6.4164   | 2.16%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **124.65**   | 9.4114   | 1.86%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **5.213**    | 194.57   | 0.46%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **5.251**    | 192.01   | 0.32%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **273.75**   | 4.7799   | 2.09%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **462.82**   | 3.8306   | 2.92%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **251.93**   | 9.5081   | 6.99%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **421.46**   | 3.1243   | 1.31%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **5.097**    | 196.94   | 0.22%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **151.22**   | 10.8783  | 5.52%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **147.06**   | 13.2305  | 4.28%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **154.23**   | 10.0895  | 3.72%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **367.51**   | 4.9218   | 4.79%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **208.59**   | 6.6029   | 1.57%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **11.191**   | 90.4882  | 0.59%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **5.251**    | 191.92   | 0.31%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **595.67**   | 4.5607   | 7.37%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **954.95**   | 5.6447   | 8.99%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **563.07**   | 5.4453   | 8.79%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **442.31**   | 5.0396   | 6.32%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **5.358**    | 190.59   | 0.59%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **5.291**    | 190.35   | 0.25%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **15.743**   | 73.8501  | 13.16%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **8.938**    | 114.24   | 7.82%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **8.019**    | 125.17   | 4.70%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **216.99**   | 9.7934   | 7.39%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **353.61**   | 6.478    | 3.29%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **119.67**   | 17.7557  | 6.14%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **46.851**   | 24.1962  | 1.26%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **29.342**   | 35.2964  | 0.72%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **255.76**   | 6.1137   | 2.48%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **947.34**   | 2.0287   | 5.52%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **704.4**    | 7.6387   | 15.52%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **544.69**   | 7.5997   | 7.13%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **6.129**    | 195.31   | 5.02%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.635**    | 387.97   | 0.94%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **321.43**   | 16.145   | 28.28%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
