## 🚀 Benchmark Results

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **4.498**    | 267.15   | 7.64%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **3.967**    | 257.69   | 0.89%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **3.878**    | 262.94   | 0.63%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **3.904**    | 259.38   | 0.54%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **3.819**    | 279.23   | 2.06%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **3.862**    | 260.63   | 0.37%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **3.868**    | 261.33   | 0.38%           | 0          | 0.00%    |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **7.773**    | 132.92   | 0.90%           | 0          | 0.00%    |
| Result Selectors & Reporting      | hasErrors (Volume)                 | **973.23**   | 1.6338   | 1.19%           | 0          | 0.00%    |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **568.34**   | 2.5192   | 1.16%           | 0          | 0.00%    |
| Result Selectors & Reporting      | Summary Generation (Large)         | **2.983**    | 338.72   | 0.50%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **3.907**    | 257.91   | 0.50%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **3.911**    | 258.9    | 0.60%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Reject Storm                       | **3.878**    | 261.93   | 0.98%           | 0          | 0.00%    |
| Async & Concurrency Stress        | Async Race                         | **220.4**    | 6.2061   | 3.06%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **213.45**   | 5.8571   | 2.13%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **884.68**   | 2.3086   | 1.72%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **8.165**    | 123.97   | 0.50%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **7.153**    | 144.83   | 1.06%           | 0          | 0.00%    |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **7.151**    | 143.59   | 1.20%           | 0          | 0.00%    |
| VestBus & Internals               | Bus Scaling                        | **247.76**   | 5.1313   | 2.17%           | 0          | 0.00%    |
| VestBus & Internals               | State Refill                       | **162.66**   | 8.6354   | 2.56%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Test Object Allocator              | **8.403**    | 119.86   | 0.39%           | 0          | 0.00%    |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **8.466**    | 120.64   | 1.06%           | 0          | 0.00%    |
| Serialization                     | Serialize (Large)                  | **190.98**   | 6.8311   | 2.23%           | 0          | 0.00%    |
| Serialization                     | Deserialize (Large)                | **121.57**   | 9.9463   | 1.69%           | 0          | 0.00%    |
| Edge Cases & Integration          | Broad Group                        | **3.903**    | 259.33   | 0.70%           | 0          | 0.00%    |
| Edge Cases & Integration          | Namespace Collision                | **3.996**    | 251.91   | 0.33%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Field Names                  | **251.16**   | 5.0391   | 1.81%           | 0          | 0.00%    |
| Edge Cases & Integration          | Large Failure Messages             | **514.83**   | 3.7426   | 3.10%           | 0          | 0.00%    |
| Complex Data Validation           | Enforce Huge String                | **475.24**   | 5.7567   | 5.52%           | 0          | 0.00%    |
| State Management                  | Serialize Large                    | **408.62**   | 3.8229   | 1.88%           | 0          | 0.00%    |
| Integration & Edge Cases          | Callback Overhead                  | **3.852**    | 264.36   | 1.01%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **158.47**   | 9.5109   | 4.68%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **146.59**   | 11.8931  | 3.97%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **151.32**   | 8.7361   | 3.48%           | 0          | 0.00%    |
| Reordering & Reconciliation       | each (Key Thrashing)               | **347.74**   | 5.9656   | 4.55%           | 0          | 0.00%    |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **176.23**   | 51.4106  | 18.56%          | 0          | 0.00%    |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **8.319**    | 122.09   | 0.53%           | 0          | 0.00%    |
| Concurrency & Events              | Bus Stress                         | **4.033**    | 251.69   | 0.63%           | 0          | 0.00%    |
| Feature Coverage Matrix           | enforce matrix (small payload)     | **698.71**   | 4.6538   | 7.78%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control eager mode            | **632.82**   | 4.8014   | 8.04%           | 0          | 0.00%    |
| Feature Coverage Matrix           | flow control one mode              | **513.81**   | 4.6186   | 6.51%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Same Name)      | **4.047**    | 250.77   | 0.88%           | 0          | 0.00%    |
| Core Test Functionality           | test (High Volume, Unique Names)   | **4.039**    | 251.5    | 0.87%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **17.274**   | 68.2238  | 18.12%          | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **7.431**    | 137.29   | 6.92%           | 0          | 0.00%    |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **5.985**    | 167.42   | 2.58%           | 0          | 0.00%    |
| Complex Feature Mix               | full run with feature flags        | **240.92**   | 8.7103   | 6.71%           | 0          | 0.00%    |
| Complex Feature Mix               | focused/conditional run            | **383.79**   | 6.3593   | 3.40%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 10                           | **124.59**   | 13.4172  | 7.97%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 50                           | **43.843**   | 25.5363  | 1.36%           | 0          | 0.00%    |
| Deep Nesting Stress               | depth 100                          | **25.83**    | 41.2464  | 1.04%           | 0          | 0.00%    |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **252.5**    | 4.9826   | 1.70%           | 0          | 0.00%    |
| Conditional isolates              | skip even indices                  | **965.05**   | 2.0585   | 5.76%           | 0          | 0.00%    |
| Conditional isolates              | omit multiples of 4                | **733.16**   | 9.7921   | 18.13%          | 0          | 0.00%    |
| Field Volume Stress               | 10 fields                          | **638.54**   | 7.3269   | 6.76%           | 0          | 0.00%    |
| Field Volume Stress               | 500 fields                         | **4.888**    | 206.6    | 0.55%           | 0          | 0.00%    |
| Field Volume Stress               | 1000 fields                        | **1.937**    | 560.06   | 2.21%           | 0          | 0.00%    |
| Dynamic each and groups           | longer list                        | **405.52**   | 13.2612  | 19.04%          | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
