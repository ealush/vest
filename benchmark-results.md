## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.033**    | 270.97   | 2.74%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **4.142**    | 249.29   | 1.22%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **4.198**    | 244.65   | 0.77%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **4.194**    | 240.79   | 0.74%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **4.189**    | 240.75   | 0.38%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **4.185**    | 248.91   | 1.28%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **4.192**    | 241.55   | 0.55%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **8.096**    | 127.72   | 1.06%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **867.75**   | 1.4856   | 1.03%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **512.96**   | 2.3075   | 0.54%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.421**    | 298.68   | 0.75%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **4.178**    | 245.66   | 0.91%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **4.188**    | 241.7    | 0.52%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **4.131**    | 244.58   | 0.45%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **168.23**   | 7.6057   | 2.63%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **162.97**   | 9.8417   | 2.48%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **612.19**   | 2.8095   | 1.58%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.622**    | 118.67   | 0.94%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.2**      | 142.9    | 1.21%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.433**    | 136.76   | 0.80%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **198.82**   | 6.1276   | 1.75%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **123.15**   | 13.9855  | 3.76%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.837**    | 115.91   | 0.69%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.823**    | 115.94   | 0.90%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **131.12**   | 9.6968   | 3.11%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **88.849**   | 13.2083  | 2.10%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **4.317**    | 235.06   | 0.64%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **4.369**    | 231.57   | 0.37%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **202.72**   | 5.948    | 1.61%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **337.41**   | 5.4144   | 3.03%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **222.87**   | 15.7719  | 9.93%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **308.84**   | 3.9693   | 0.57%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **4.276**    | 238.25   | 0.99%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **104.78**   | 14.3107  | 5.08%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **93.696**   | 20.5149  | 7.61%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **109.14**   | 12.4308  | 3.70%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **270.97**   | 6.6284   | 4.36%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **142.56**   | 44.1583  | 15.26%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.724**    | 115.48   | 0.31%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.201**    | 255.65   | 1.96%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **390.11**   | 5.8121   | 7.05%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (larger payload)    | **603.63**   | 6.3439   | 10.12%          | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **289.17**   | 7.0626   | 7.74%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **272.83**   | 7.1864   | 7.61%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.315**    | 234.88   | 0.63%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.244**    | 237.3    | 0.43%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **12.012**   | 94.0919  | 11.29%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **6.882**    | 153.04   | 12.07%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **6.299**    | 159.01   | 2.09%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **136.35**   | 16.8016  | 8.01%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **237.65**   | 8.2087   | 3.00%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **77.615**   | 47.3464  | 8.36%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **31.81**    | 40.3341  | 2.51%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **20.819**   | 49.2973  | 0.73%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **182.97**   | 9.7335   | 3.75%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **546.1**    | 3.3217   | 7.10%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **506.07**   | 4.5467   | 8.53%           | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **360.23**   | 7.6444   | 4.27%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.809**    | 214.2    | 1.03%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **2.102**    | 493.03   | 0.99%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **254.9**    | 6.1902   | 10.05%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
