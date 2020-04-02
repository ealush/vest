'use strict';(function(p,g){"object"===typeof exports&&"undefined"!==typeof module?module.exports=g():"function"===typeof define&&define.amd?define(g):(p=p||self,p.vest=g())})(this,function(){function p(a,b){return b={exports:{}},a(b,b.exports),b.exports}function g(a){m.use().ctx=this;Object.assign(this,a)}function t(a,b,h,k){Object.assign(this,{ctx:a,testFn:k,fieldName:b,statement:h,isWarning:!1,failed:!1})}var v="undefined"!==typeof globalThis?globalThis:"undefined"!==typeof window?window:"undefined"!==
typeof global?global:"undefined"!==typeof self?self:{},x=p(function(a,b){!function(b,k){a.exports=k()}(v,function(){function a(f){return!!Array.isArray(f)}function b(f){return"number"==typeof f}function w(f){return"string"==typeof f}function y(f,a){return a instanceof RegExp?a.test(f):"string"==typeof a&&(new RegExp(a)).test(f)}function n(f,a){return!!(Array.isArray(a)&&["string","number","boolean"].includes(typeof f)||"string"==typeof a&&"string"==typeof f)&&a.includes(f)}function g(f,a){return f===
a}function e(f){return!(isNaN(parseFloat(f))||isNaN(Number(f))||!isFinite(f))}function d(f,a){return e(f)&&e(a)&&Number(f)===Number(a)}function c(a){return!a||(e(a)?0===a:Object.prototype.hasOwnProperty.call(a,"length")?0===a.length:"object"!=typeof a||0===Object.keys(a).length)}function z(a,c){return e(a)&&e(c)&&Number(a)>Number(c)}function A(a,c){return e(a)&&e(c)&&Number(a)>=Number(c)}function B(a,c){return e(a)&&e(c)&&Number(a)<Number(c)}function m(a,c){return e(a)&&e(c)&&Number(a)<=Number(c)}
function l(a,c){return a.length===c}function p(a){return!!a}function q(a,c,...d){if("function"==typeof a&&!0!==a(c,...d))throw Error(`[Enforce]: invalid ${typeof c} value`);}function r(a={}){let c={...x,...a};if("function"==typeof v.Proxy)return a=>{let f=new Proxy(c,{get:(c,d)=>{if(t(c,d))return(...b)=>(q(c[d],a,...b),f)}});return f};let f=Object.keys(c);return a=>f.reduce((f,d)=>Object.assign(f,{...t(c,d)&&{[d]:(...b)=>(q(c[d],a,...b),f)}}),{})}let t=(a,c)=>((a=Object.prototype.hasOwnProperty.call(a,
c)&&"function"==typeof a[c])||function(a){setTimeout(()=>{throw Error(`[enforce]: ${a}`);})}(`Rule "${c}" was not found in rules object. Make sure you typed it correctly.`),a),v=Function("return this")();a.negativeForm="isNotArray";b.negativeForm="isNotNumber";w.negativeForm="isNotString";y.negativeForm="notMatches";n.negativeForm="notInside";g.negativeForm="notEquals";e.negativeForm="isNotNumeric";d.negativeForm="numberNotEquals";c.negativeForm="isNotEmpty";z.alias="gt";A.alias="gte";B.alias="lt";
m.alias="lte";l.negativeForm="lengthNotEquals";p.negativeForm="isFalsy";var x=function(a){for(let c in a){let d=a[c].negativeForm,b=a[c].alias;d&&(a[d]=(...d)=>!a[c](...d));b&&(a[b]=a[c])}return a}({isArray:a,isNumber:b,isString:w,matches:y,inside:n,equals:g,numberEquals:d,isNumeric:e,isEmpty:c,greaterThan:z,greaterThanOrEquals:A,lessThan:B,lessThanOrEquals:m,longerThan:function(a,c){return a.length>c},longerThanOrEquals:function(a,c){return a.length>=c},shorterThan:function(a,c){return a.length<
c},shorterThanOrEquals:function(a,c){return a.length<=c},lengthEquals:l,isOdd:a=>!!e(a)&&0!=a%2,isEven:a=>!!e(a)&&0==a%2,isTruthy:p});let u=new r;return u.Enforce=r,u})}),C=p(function(a,b){(function(b,k){a.exports=k()})(v,function(){let a=a=>{if("function"===typeof a)try{return b(a())}catch(y){return!1}return b(a)},b=a=>Array.isArray(a)?!0:0!=a&&!!a;return(...b)=>b.some(a)})});let q=Function("return this")(),l=(a,b=Error)=>setTimeout(()=>{throw new b(`[Vest]: ${a}`);}),r=Symbol.for("VEST#1");var m=
{use:()=>q[r],useContext:()=>q[r].ctx,register:a=>{const b=q[r];b?b.VERSION!==a.VERSION&&l(`Multiple versions of Vest detected: (${[a.VERSION,b.VERSION].join()}).
    Most features should work regularly, but for optimal feature compatibility, you should have all running instances use the same version.`):q[r]=a;return q[r]}};g.prototype.setCurrentTest=function(a){this.currentTest=a};g.prototype.removeCurrentTest=function(){delete this.currentTest};g.clear=function(){m.use().ctx=null};let u=(a,b)=>{const h=m.useContext();b&&(h?(h.exclusive=h.exclusive||{},[].concat(b).forEach(b=>{"string"===typeof b&&(h.exclusive[a]=h.exclusive[a]||{},h.exclusive[a][b]=!0)})):
l(`${a} ${"hook called outside of a running suite."}`))};t.prototype.valueOf=function(){return!0!==this.failed};t.prototype.fail=function(){this.ctx.result.markFailure({fieldName:this.fieldName,statement:this.statement,isWarning:this.isWarning});this.failed=!0;return this};t.prototype.warn=function(){this.isWarning=!0;return this};let D=a=>{const {testFn:b,statement:h,ctx:k}=a,w=()=>k.result.markAsDone(a),g=b=>{a.statement="string"===typeof b?b:h;a.fail();k.result.markAsDone(a)};k.setCurrentTest(a);
try{b.then(w,g)}catch(n){g()}k.removeCurrentTest()},E=a=>{var b=[];const h=[],k={};let g=!1;const m=a=>{b=b.filter(c=>c!==a)},n=a=>b.length?a?b.some(c=>c.fieldName===a):!!b.length:!1,l=a=>{if(!a)return h.forEach(a=>a(d));if(Array.isArray(k[a]))return k[a].forEach(a=>a(d))},e=a=>{const c={};for(const b in d.tests)d.tests[b]&&d.tests[b][a]&&(c[b]=d.tests[b][a]);return c},d={name:a,errorCount:0,warnCount:0,testCount:0,tests:{},skipped:[],tested:[]};Object.defineProperties(d,{hasErrors:{value:a=>a?!(!d.tests[a]||
!d.tests[a].errorCount):!!d.errorCount,writable:!0,configurable:!0,enumerable:!1},hasWarnings:{value:a=>a?!(!d.tests[a]||!d.tests[a].warnCount):!!d.warnCount,writable:!0,configurable:!0,enumerable:!1},getErrors:{value:a=>a?d.tests[a].errors?d.tests[a].errors:[]:e("errors"),writable:!0,configurable:!0,enumerable:!1},getWarnings:{value:a=>a?d.tests[a].warnings?d.tests[a].warnings:[]:e("warnings"),writable:!0,configurable:!0,enumerable:!1},done:{value:(...a)=>{const {length:c,[c-1]:b,[c-2]:e}=a;if("function"!==
typeof b)return d;if(!g||e&&!n(e))return b(d),d;e?(k[e]=k[e]||[],k[e].push(b)):h.push(b);return d},writable:!0,configurable:!0,enumerable:!1},cancel:{value:()=>{d.canceled=!0;return d},writable:!0,configurable:!0,enumerable:!1}});return{markTestRun:a=>{d.tests[a]||(d.tests[a]={testCount:0,errorCount:0,warnCount:0},d.tested.push(a));d.tests[a].testCount++;d.testCount++},markFailure:({fieldName:a,statement:b,isWarning:e})=>{if(d.tests[a]){if(e){e="warnings";var c="warnCount"}else e="errors",c="errorCount";
d.tests[a][e]=d.tests[a][e]||[];b&&d.tests[a][e].push(b);d[c]++;d.tests[a][c]++}},setPending:a=>{g=!0;b.push(a)},addToSkipped:a=>{!d.skipped.includes(a)&&d.skipped.push(a)},markAsDone:a=>{d.canceled||(a&&(m(a),n(a.fieldName)||l(a.fieldName)),n()||l())},pending:b,output:d}};return m.register({Enforce:x.Enforce,VERSION:"1.0.7",enforce:x,draft:()=>{const a=m.useContext();if(a)return a.result.output;l("draft hook called outside of a running suite.")},test:(a,...b)=>{var h;"string"===typeof b[0]?[k,h]=
b:"function"===typeof b[0]&&([h]=b);if("function"===typeof h){a=new t(m.useContext(),a,k,h);{const {ctx:l,fieldName:n}=a;b=!1;var k=n;if(k=(h=m.useContext())&&h.exclusive?h.exclusive.skip&&h.exclusive.skip[k]?!0:h.exclusive.only?h.exclusive.only[k]?!1:!0:!1:!1)l.result.addToSkipped(n);else{l.result.markTestRun(n);a.ctx.setCurrentTest(a);try{var g=a.testFn.apply(a)}catch(F){g=!1}a.ctx.removeCurrentTest();!1===g&&a.fail();g&&"function"===typeof g.then&&(b=!0,a.testFn=g);b&&l.result.setPending(a)}}return a}},
any:C,validate:(a,b)=>{if("string"!==typeof a)return l("Suite initialization error. Expected name to be a string.",TypeError);if("function"!==typeof b)return l("Suite initialization error. Expected tests to be a function.",TypeError);a=E(a);new g({result:a});b();g.clear();[...a.pending].forEach(D);return a.output},only:a=>u("only",a),skip:a=>u("skip",a),warn:()=>{const a=m.useContext();a?a.currentTest?a.currentTest.warn():l("warn hook called outside of a test callback. It won't have an effect."):
l("warn hook called outside of a running suite.")}})})
//# sourceMappingURL=vest.js.map
