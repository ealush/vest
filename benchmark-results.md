## 🚀 Benchmark Results

### a68b6852 - 2025-12-22

> chore(benchmark): update benchmark script and workflow

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **2.901**    | 355.29   | 1.03%           |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **2.899**    | 353.97   | 0.93%           |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **2.843**    | 369.55   | 2.24%           |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **2.832**    | 360.3    | 0.80%           |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **2.761**    | 373.77   | 1.41%           |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **2.846**    | 360.37   | 1.32%           |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **2.802**    | 368.71   | 1.27%           |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **3.445**    | 306.48   | 2.38%           |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **828.83**   | 1.5948   | 1.32%           |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.346**    | 310.71   | 1.49%           |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **6.115**    | 183.39   | 4.63%           |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **6.313**    | 165.99   | 1.42%           |
| Async & Concurrency Stress        | Reject Storm                       | **6.158**    | 168.68   | 1.89%           |
| Async & Concurrency Stress        | Async Race                         | **397.99**   | 2.9753   | 1.51%           |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **99.403**   | 13.6663  | 2.04%           |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **134.88**   | 8.5008   | 1.15%           |
| Control Flow & Hooks Internals    | omitWhen (Active)                  | **1.415**    | 747.08   | 2.23%           |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **17.506**   | 66.3205  | 4.81%           |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **4.037**    | 275.23   | 3.28%           |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **4.058**    | 258.41   | 1.73%           |
| VestBus & Internals               | Bus Scaling                        | **110.03**   | 22.076   | 6.24%           |
| VestBus & Internals               | State Refill                       | **104.33**   | 10.8047  | 1.72%           |
| Memory & Object Lifecycle         | Test Object Allocator              | **1.468**    | 705.3    | 1.12%           |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **1.477**    | 716.95   | 1.95%           |
| Serialization                     | Serialize (Large)                  | **476.95**   | 3.2688   | 2.37%           |
| Serialization                     | Deserialize (Large)                | **241.14**   | 5.304    | 2.09%           |
| Edge Cases & Integration          | Namespace Collision                | **1.204**    | 886.13   | 2.64%           |
| Edge Cases & Integration          | Large Field Names                  | **101.11**   | 16.562   | 3.42%           |
| Core Test Functionality           | test (High Volume, Same Name)      | **1.116**    | 946.53   | 2.46%           |
| Core Test Functionality           | test (High Volume, Unique Names)   | **2.043**    | 506.4    | 1.52%           |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **44.269**   | 27.3806  | 5.01%           |
| Complex Data Validation           | Enforce Huge String                | **205.66**   | 7.5968   | 4.25%           |
| State Management                  | Serialize Large                    | **891.53**   | 3.2063   | 3.98%           |
| Integration & Edge Cases          | Callback Overhead                  | **1.502**    | 740.96   | 3.19%           |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **135.54**   | 9.3061   | 1.52%           |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **127.02**   | 8.1665   | 0.51%           |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **127.36**   | 8.3347   | 0.70%           |
| Reordering & Reconciliation       | each (Key Thrashing)               | **264.33**   | 4.8946   | 2.34%           |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **201.57**   | 5.2901   | 0.67%           |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **3.401**    | 304.63   | 1.38%           |
| Concurrency & Events              | Bus Stress                         | **1.255**    | 832.25   | 2.05%           |
| Field Volume Stress               | 500 fields                         | **3.592**    | 296.37   | 2.17%           |
| Field Volume Stress               | 1000 fields                        | **1.383**    | 750.27   | 1.35%           |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **4.838**    | 222.19   | 5.64%           |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **1.933**    | 541.32   | 10.44%          |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **1.459**    | 698.44   | 23.73%          |
| Deep Nesting Stress               | depth 10                           | **130.72**   | 17.3355  | 9.20%           |
| Deep Nesting Stress               | depth 50                           | **19.326**   | 56.0712  | 1.69%           |
| Deep Nesting Stress               | depth 100                          | **8.739**    | 137.8    | 5.23%           |
| Complex Feature Mix               | full run with feature flags        | **305.85**   | 4.5618   | 2.30%           |
| Complex Feature Mix               | focused/conditional run            | **444.58**   | 3.0357   | 1.54%           |
| Feature Coverage Matrix           | flow control eager mode            | **894.81**   | 1.7368   | 3.01%           |
| Feature Coverage Matrix           | flow control one mode              | **424.92**   | 2.789    | 1.82%           |
| Dynamic each and groups           | longer list                        | **349.92**   | 3.6377   | 3.17%           |

---

### a68b6852 - 2025-12-22

> chore(benchmark): update benchmark script and workflow

| Suite                             | Benchmark                          | Ops/sec (Hz) | P99 (ms) | Margin of Error |
| :-------------------------------- | :--------------------------------- | :----------- | :------- | :-------------- |
| Reconciler & History Diffing      | Reconciler (Stable List)           | **2.701**    | 393.12   | 2.75%           |
| Reconciler & History Diffing      | Reconciler (Full Invalidation)     | **2.792**    | 373.59   | 1.32%           |
| Reconciler & History Diffing      | Reconciler (Prepend Item)          | **2.773**    | 375.89   | 1.58%           |
| Reconciler & History Diffing      | Reconciler (Append Item)           | **2.756**    | 372.03   | 1.11%           |
| Reconciler & History Diffing      | Reconciler (Interleaved)           | **2.628**    | 409.54   | 2.38%           |
| Reconciler & History Diffing      | Isolate Reordering (Reverse)       | **2.697**    | 399.88   | 2.23%           |
| Reconciler & History Diffing      | Isolate Reordering (Shuffle)       | **2.679**    | 382.27   | 0.91%           |
| Reconciler & History Diffing      | Orphan GC Pressure                 | **3.318**    | 318.07   | 2.00%           |
| Result Selectors & Reporting      | getErrors (Group Lookup)           | **823.09**   | 1.5725   | 1.25%           |
| Result Selectors & Reporting      | Summary Generation (Large)         | **3.179**    | 322.74   | 1.02%           |
| Async & Concurrency Stress        | Pending Storm (Memory)             | **6.314**    | 170      | 2.32%           |
| Async & Concurrency Stress        | Resolve Storm (Throughput)         | **6.236**    | 176.68   | 2.63%           |
| Async & Concurrency Stress        | Reject Storm                       | **6.097**    | 179.59   | 2.54%           |
| Async & Concurrency Stress        | Async Race                         | **397.14**   | 2.9378   | 1.49%           |
| Control Flow & Hooks Internals    | test.memo (Thrashing)              | **100.28**   | 10.9206  | 0.94%           |
| Control Flow & Hooks Internals    | test.memo (Stagnation)             | **130.84**   | 13.0948  | 2.76%           |
| Control Flow & Hooks Internals    | omitWhen (Active)                  | **1.377**    | 740.76   | 0.85%           |
| Control Flow & Hooks Internals    | skipWhen (Active)                  | **18.371**   | 55.7293  | 1.18%           |
| Control Flow & Hooks Internals    | only Starvation (Early)            | **3.931**    | 260.44   | 0.93%           |
| Control Flow & Hooks Internals    | only Starvation (Late)             | **3.869**    | 271.46   | 1.73%           |
| VestBus & Internals               | Bus Scaling                        | **106.73**   | 10.1242  | 1.05%           |
| VestBus & Internals               | State Refill                       | **100.25**   | 11.4825  | 1.41%           |
| Memory & Object Lifecycle         | Test Object Allocator              | **1.402**    | 748.02   | 1.50%           |
| Memory & Object Lifecycle         | Garbage Collection Friendly        | **1.359**    | 762.78   | 1.67%           |
| Serialization                     | Serialize (Large)                  | **432.88**   | 5.0639   | 3.72%           |
| Serialization                     | Deserialize (Large)                | **237.74**   | 5.6455   | 2.21%           |
| Edge Cases & Integration          | Namespace Collision                | **1.163**    | 883.37   | 1.08%           |
| Edge Cases & Integration          | Large Field Names                  | **99.639**   | 11.5644  | 1.55%           |
| Core Test Functionality           | test (High Volume, Same Name)      | **1.068**    | 959.05   | 1.00%           |
| Core Test Functionality           | test (High Volume, Unique Names)   | **1.958**    | 518.23   | 0.92%           |
| Complex Combinations & Edge Cases | High Frequency test Creation       | **41.386**   | 34.4255  | 7.86%           |
| Complex Data Validation           | Enforce Huge String                | **205.07**   | 7.7407   | 4.14%           |
| State Management                  | Serialize Large                    | **914.69**   | 3.1614   | 4.18%           |
| Integration & Edge Cases          | Callback Overhead                  | **1.427**    | 711.97   | 1.19%           |
| Reordering & Reconciliation       | each (Reorder - Reverse)           | **135.09**   | 8.1655   | 0.85%           |
| Reordering & Reconciliation       | each (Reorder - Insert Middle)     | **122.59**   | 9.431    | 0.85%           |
| Reordering & Reconciliation       | each (Reorder - Delete Middle)     | **123.14**   | 11.9163  | 2.12%           |
| Reordering & Reconciliation       | each (Key Thrashing)               | **263.81**   | 4.3764   | 0.94%           |
| State Mutation & Reset            | suite.remove() (Many Fields)       | **201.15**   | 5.8837   | 1.12%           |
| State Mutation & Reset            | suite.reset() (Memory Reclamation) | **3.382**    | 308.9    | 1.27%           |
| Concurrency & Events              | Bus Stress                         | **1.23**     | 856.52   | 2.05%           |
| Field Volume Stress               | 500 fields                         | **3.586**    | 287.14   | 0.95%           |
| Field Volume Stress               | 1000 fields                        | **1.354**    | 756.28   | 1.02%           |
| Nested Fields with Hooks          | depth 3 with 40 fields per level   | **4.734**    | 215.18   | 1.38%           |
| Nested Fields with Hooks          | depth 4 with 60 fields per level   | **1.895**    | 555.27   | 11.25%          |
| Nested Fields with Hooks          | depth 5 with 80 fields per level   | **1.44**     | 698.46   | 7.19%           |
| Deep Nesting Stress               | depth 10                           | **141.29**   | 9.2364   | 1.26%           |
| Deep Nesting Stress               | depth 50                           | **19.358**   | 57.7004  | 1.66%           |
| Deep Nesting Stress               | depth 100                          | **8.905**    | 116.28   | 1.03%           |
| Complex Feature Mix               | full run with feature flags        | **310.66**   | 4.1814   | 2.15%           |
| Complex Feature Mix               | focused/conditional run            | **442.31**   | 2.7405   | 8.57%           |
| Feature Coverage Matrix           | flow control eager mode            | **888.8**    | 1.7236   | 2.95%           |
| Feature Coverage Matrix           | flow control one mode              | **443.43**   | 3.0733   | 1.94%           |
| Dynamic each and groups           | longer list                        | **349.51**   | 3.5822   | 3.19%           |

---

### 174a94b5 - 2025-12-19

> Refactor(vest): Remove top-level registry hierarchy and simplify test registration

| Suite                    | Benchmark                        | Ops/sec (Hz) | P99 (ms) | Margin of Error |
| :----------------------- | :------------------------------- | :----------- | :------- | :-------------- |
| Field Volume Stress      | 500 fields                       | **5.5**      | 190      | 1.00%           |
| Field Volume Stress      | 1000 fields                      | **2**        | 400      | 1.00%           |
| Nested Fields with Hooks | depth 3 with 40 fields per level | **6**        | 170      | 1.00%           |

---

| Suite                    | Benchmark                        | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |
| :----------------------- | :------------------------------- | :----------- | :------- | :-------------- | :--------- | :------- |
| Field Volume Stress      | 500 fields                       | **5.5**      | 190      | 1.00%           | 0          | 0.00%    |
| Field Volume Stress      | 1000 fields                      | **2**        | 400      | 1.00%           | 0          | 0.00%    |
| Nested Fields with Hooks | depth 3 with 40 fields per level | **6**        | 170      | 1.00%           | 0          | 0.00%    |

<details>
<summary>Raw Output</summary>

```
See CI logs for full output
```

</details>
