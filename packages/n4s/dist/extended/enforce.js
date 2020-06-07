"use strict";!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t=t||self).enforce=e()}(this,(function(){function t(){return(t=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var u,r=arguments[e];for(u in r)Object.prototype.hasOwnProperty.call(r,u)&&(t[u]=r[u])}return t}).apply(this,arguments)}function e(t,e){return t===e}function u(t){return!(isNaN(parseFloat(t))||isNaN(Number(t))||!isFinite(t))}function r(t,e){return u(t)&&u(e)&&Number(t)>Number(e)}function n(t,e){return u(t)&&u(e)&&Number(t)>=Number(e)}function i(t,e){return!!(Array.isArray(e)&&-1!==["string","number","boolean"].indexOf(typeof t)||"string"==typeof e&&"string"==typeof t)&&-1!==e.indexOf(t)}function o(t){return!!Array.isArray(t)}function a(t){return!t||(u(t)?0===t:Object.prototype.hasOwnProperty.call(t,"length")?0===t.length:"object"!=typeof t||0===Object.keys(t).length)}function d(t){return"number"==typeof t}function s(t){return"string"==typeof t}function c(t){return!!t}function l(t,e){return t.length===e}function f(t,e){return u(t)&&u(e)&&Number(t)<Number(e)}function $(t,e){return u(t)&&u(e)&&Number(t)<=Number(e)}function p(t,e){return e instanceof RegExp?e.test(t):"string"==typeof e&&new RegExp(e).test(t)}function g(t,e){return u(t)&&u(e)&&Number(t)===Number(e)}function h(t,e){if("function"==typeof t){for(var u=arguments.length,r=Array(2<u?u-2:0),n=2;n<u;n++)r[n-2]=arguments[n];if(!0!==t.apply(void 0,[e].concat(r)))throw Error("[Enforce]: invalid "+typeof e+" value")}}function _(t){return(_="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function y(t){if(!("string"==typeof t||t instanceof String)){if(null===t)var e="null";else e="object"===(e=_(t))&&t.constructor&&t.constructor.hasOwnProperty("name")?t.constructor.name:"a ".concat(e);throw new TypeError("Expected string but received ".concat(e,"."))}}function m(){var t,e=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},u=1<arguments.length?arguments[1]:void 0;for(t in u)void 0===e[t]&&(e[t]=u[t]);return e}function A(t){return(A="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function b(t,e,u){if(y(t),"object"===A(e)){var r=e.min||0;e=e.max}else r=e,e=u;return(t=encodeURI(t).split(/%..|./).length-1)>=r&&(void 0===e||t<=e)}function v(t,e){y(t),(e=m(e,U)).allow_trailing_dot&&"."===t[t.length-1]&&(t=t.substring(0,t.length-1)),t=t.split(".");for(var u=0;u<t.length;u++)if(63<t[u].length)return!1;if(e.require_tld&&(u=t.pop(),!t.length||!/^([a-z\u00a1-\uffff]{2,}|xn[a-z0-9-]{2,})$/i.test(u)||/[\s\u2002-\u200B\u202F\u205F\u3000\uFEFF\uDB40\uDC20]/.test(u)))return!1;for(var r=0;r<t.length;r++)if(u=t[r],e.allow_underscores&&(u=u.replace(/_/g,"")),!/^[a-z\u00a1-\uffff0-9-]+$/i.test(u)||/[\uff01-\uff5e]/.test(u)||"-"===u[0]||"-"===u[u.length-1])return!1;return!0}function Z(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"";if(y(t),!(e=String(e)))return Z(t,4)||Z(t,6);if("4"===e)return!!D.test(t)&&255>=t.split(".").sort((function(t,e){return t-e}))[3];if("6"===e){if(e=[t],t.includes("%")&&(2!==(e=t.split("%")).length||!e[0].includes(":")||""===e[1]))return!1;var u=!1,r=Z((e=e[0].split(":"))[e.length-1],4),n=r?7:8;if(e.length>n)return!1;if("::"===t)return!0;"::"===t.substr(0,2)?(e.shift(),e.shift(),u=!0):"::"===t.substr(t.length-2)&&(e.pop(),e.pop(),u=!0);for(var i=0;i<e.length;++i)if(""===e[i]&&0<i&&i<e.length-1){if(u)return!1;u=!0}else if(!(r&&i===e.length-1||G.test(e[i])))return!1;return u?1<=e.length:e.length===n}return!1}function E(t){return(E="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function S(t,e){for(var u=0;u<e.length;u++){var r=e[u];if(t===r||"[object RegExp]"===Object.prototype.toString.call(r)&&r.test(t))return!0}return!1}var F=function(t,e){return(t=Object.prototype.hasOwnProperty.call(t,e)&&"function"==typeof t[e])||function(t){setTimeout((function(){throw Error("[enforce]: "+t)}))}('Rule "'+e+'" was not found in rules object. Make sure you typed it correctly.'),t},x=Function("return this")();e.negativeForm="notEquals",u.negativeForm="isNotNumeric",r.alias="gt",n.alias="gte",i.negativeForm="notInside",o.negativeForm="isNotArray",a.negativeForm="isNotEmpty",d.negativeForm="isNotNumber",s.negativeForm="isNotString",c.negativeForm="isFalsy",l.negativeForm="lengthNotEquals",f.alias="lt",$.alias="lte",p.negativeForm="notMatches",g.negativeForm="numberNotEquals";var N=function(t){var e,u=function(e){var u=t[e].negativeForm,r=t[e].alias;u&&(t[u]=function(){return!t[e].apply(t,arguments)}),r&&(t[r]=t[e])};for(e in t)u(e);return t}({equals:e,greaterThan:r,greaterThanOrEquals:n,inside:i,isArray:o,isEmpty:a,isEven:function(t){return!!u(t)&&0==t%2},isNumber:d,isNumeric:u,isOdd:function(t){return!!u(t)&&0!=t%2},isString:s,isTruthy:c,lengthEquals:l,lessThan:f,lessThanOrEquals:$,longerThan:function(t,e){return t.length>e},longerThanOrEquals:function(t,e){return t.length>=e},matches:p,numberEquals:g,shorterThan:function(t,e){return t.length<e},shorterThanOrEquals:function(t,e){return t.length<=e}}),w=t({},N);if("function"==typeof x.Proxy)N=function(t){var e=new Proxy(w,{get:function(u,r){if(F(u,r))return function(){for(var n=arguments.length,i=Array(n),o=0;o<n;o++)i[o]=arguments[o];return h.apply(void 0,[u[r],t].concat(i)),e}}});return e};else{var O=Object.keys(w);N=function(e){return O.reduce((function(u,r){var n;return t(u,t({},F(w,r)&&((n={})[r]=function(){for(var t=arguments.length,n=Array(t),i=0;i<t;i++)n[i]=arguments[i];return h.apply(void 0,[w[r],e].concat(n)),u},n)))}),{})}}N.extend=function(e){t(w,e),"function"!=typeof x.Proxy&&(O=Object.keys(w))};for(var T,R={"en-US":/^[0-9A-Z]+$/i,"bg-BG":/^[0-9\u0410-\u042f]+$/i,"cs-CZ":/^[0-9A-Z\u00c1\u010c\u010e\u00c9\u011a\u00cd\u0147\u00d3\u0158\u0160\u0164\u00da\u016e\u00dd\u017d]+$/i,"da-DK":/^[0-9A-Z\u00c6\u00d8\u00c5]+$/i,"de-DE":/^[0-9A-Z\u00c4\u00d6\u00dc\u00df]+$/i,"el-GR":/^[0-9\u0391-\u03c9]+$/i,"es-ES":/^[0-9A-Z\u00c1\u00c9\u00cd\u00d1\u00d3\u00da\u00dc]+$/i,"fr-FR":/^[0-9A-Z\u00c0\u00c2\u00c6\u00c7\u00c9\u00c8\u00ca\u00cb\u00cf\u00ce\u00d4\u0152\u00d9\u00db\u00dc\u0178]+$/i,"it-IT":/^[0-9A-Z\u00c0\u00c9\u00c8\u00cc\u00ce\u00d3\u00d2\u00d9]+$/i,"hu-HU":/^[0-9A-Z\u00c1\u00c9\u00cd\u00d3\u00d6\u0150\u00da\u00dc\u0170]+$/i,"nb-NO":/^[0-9A-Z\u00c6\u00d8\u00c5]+$/i,"nl-NL":/^[0-9A-Z\u00c1\u00c9\u00cb\u00cf\u00d3\u00d6\u00dc\u00da]+$/i,"nn-NO":/^[0-9A-Z\u00c6\u00d8\u00c5]+$/i,"pl-PL":/^[0-9A-Z\u0104\u0106\u0118\u015a\u0141\u0143\u00d3\u017b\u0179]+$/i,"pt-PT":/^[0-9A-Z\u00c3\u00c1\u00c0\u00c2\u00c4\u00c7\u00c9\u00ca\u00cb\u00cd\u00cf\u00d5\u00d3\u00d4\u00d6\u00da\u00dc]+$/i,"ru-RU":/^[0-9\u0410-\u042f\u0401]+$/i,"sl-SI":/^[0-9A-Z\u010c\u0106\u0110\u0160\u017d]+$/i,"sk-SK":/^[0-9A-Z\u00c1\u010c\u010e\u00c9\u00cd\u0147\u00d3\u0160\u0164\u00da\u00dd\u017d\u0139\u0154\u013d\u00c4\u00d4]+$/i,"sr-RS@latin":/^[0-9A-Z\u010c\u0106\u017d\u0160\u0110]+$/i,"sr-RS":/^[0-9\u0410-\u042f\u0402\u0408\u0409\u040a\u040b\u040f]+$/i,"sv-SE":/^[0-9A-Z\u00c5\u00c4\u00d6]+$/i,"tr-TR":/^[0-9A-Z\u00c7\u011e\u0130\u0131\u00d6\u015e\u00dc]+$/i,"uk-UA":/^[0-9\u0410-\u0429\u042c\u042e\u042f\u0404I\u0407\u0490\u0456]+$/i,"ku-IQ":/^[\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u06690-9\u0626\u0627\u0628\u067e\u062a\u062c\u0686\u062d\u062e\u062f\u0631\u0695\u0632\u0698\u0633\u0634\u0639\u063a\u0641\u06a4\u0642\u06a9\u06af\u0644\u06b5\u0645\u0646\u0648\u06c6\u06be\u06d5\u06cc\u06ce\u064a\u0637\u0624\u062b\u0622\u0625\u0623\u0643\u0636\u0635\u0629\u0638\u0630]+$/i,ar:/^[\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u06690-9\u0621\u0622\u0623\u0624\u0625\u0626\u0627\u0628\u0629\u062a\u062b\u062c\u062d\u062e\u062f\u0630\u0631\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0639\u063a\u0641\u0642\u0643\u0644\u0645\u0646\u0647\u0648\u0649\u064a\u064b\u064c\u064d\u064e\u064f\u0650\u0651\u0652\u0670]+$/,he:/^[0-9\u05d0-\u05ea]+$/,"fa-IR":/^['0-9\u0622\u0627\u0628\u067e\u062a\u062b\u062c\u0686\u0647\u062e\u062f\u0630\u0631\u0632\u0698\u0633\u0634\u0635\u0636\u0637\u0638\u0639\u063a\u0641\u0642\u06a9\u06af\u0644\u0645\u0646\u0648\u0647\u06cc\u06f1\u06f2\u06f3\u06f4\u06f5\u06f6\u06f7\u06f8\u06f9\u06f0']+$/i},P="AU GB HK IN NZ ZA ZM".split(" "),I=0;I<P.length;I++)T="en-".concat(P[I]),R[T]=R["en-US"];for(P="AE BH DZ EG IQ JO KW LB LY MA QM QA SA SD SY TN YE".split(" "),I=0;I<P.length;I++)T="ar-".concat(P[I]),R[T]=R.ar;R["pt-BR"]=R["pt-PT"],R["pl-Pl"]=R["pl-PL"],P=Object.keys(R);var L=/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14})$/,C={symbol:"$",require_symbol:!1,allow_space_after_symbol:!1,symbol_after_digits:!1,allow_negatives:!0,parens_for_negatives:!1,negative_sign_before_digits:!1,negative_sign_after_digits:!1,allow_negative_sign_placeholder:!1,thousands_separator:",",decimal_separator:".",allow_decimal:!0,require_decimal:!1,digits_after_decimal:[2],allow_space_after_digits:!1},U={require_tld:!0,allow_underscores:!1,allow_trailing_dot:!1},D=/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/,G=/^[0-9A-F]{1,4}$/i,M={allow_display_name:!1,require_display_name:!1,allow_utf8_local_part:!0,require_tld:!0},q=/^([^\x00-\x1F\x7F-\x9F\cX]+)<(.+)>$/i,z=/^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~]+$/i,B=/^[a-z\d]+$/,j=/^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f]))*$/i,K=/^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i,H=/^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i,k={ES:function(t){y(t);var e={X:0,Y:1,Z:2};if(t=t.trim().toUpperCase(),!/^[0-9X-Z][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/.test(t))return!1;var u=t.slice(0,-1).replace(/[X,Y,Z]/g,(function(t){return e[t]}));return t.endsWith("TRWAGMYFPDXBNJZSQVHLCKE".split("")[u%23])},"he-IL":function(t){if(t=t.trim(),!/^\d{9}$/.test(t))return!1;for(var e,u=0,r=0;r<t.length;r++)u+=9<(e=Number(t[r])*(r%2+1))?e-9:e;return 0==u%10},"zh-TW":function(t){var e={A:10,B:11,C:12,D:13,E:14,F:15,G:16,H:17,I:34,J:18,K:19,L:20,M:21,N:22,O:35,P:23,Q:24,R:25,S:26,T:27,U:28,V:29,W:32,X:30,Y:31,Z:33};return t=t.trim().toUpperCase(),!!/^[A-Z][0-9]{9}$/.test(t)&&Array.from(t).reduce((function(t,u,r){return 0===r?(t=e[u])%10*9+Math.floor(t/10):9===r?0==(10-t%10-Number(u))%10:t+Number(u)*(9-r)}),0)}},Y=/^[A-z]{2,4}([_-]([A-z]{4}|[\d]{3}))?([_-]([A-z]{2}|[\d]{3}))?$/,J=/^(application|audio|font|image|message|model|multipart|text|video)\/[a-zA-Z0-9\.\-\+]{1,100}$/i,W=/^text\/[a-zA-Z0-9\.\-\+]{1,100};\s?charset=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?$/i,V=/^multipart\/[a-zA-Z0-9\.\-\+]{1,100}(;\s?(boundary|charset)=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?){0,2}$/i,X={"am-AM":/^(\+?374|0)((10|[9|7][0-9])\d{6}$|[2-4]\d{7}$)/,"ar-AE":/^((\+?971)|0)?5[024568]\d{7}$/,"ar-BH":/^(\+?973)?(3|6)\d{7}$/,"ar-DZ":/^(\+?213|0)(5|6|7)\d{8}$/,"ar-EG":/^((\+?20)|0)?1[0125]\d{8}$/,"ar-IQ":/^(\+?964|0)?7[0-9]\d{8}$/,"ar-JO":/^(\+?962|0)?7[789]\d{7}$/,"ar-KW":/^(\+?965)[569]\d{7}$/,"ar-SA":/^(!?(\+?966)|0)?5\d{8}$/,"ar-SY":/^(!?(\+?963)|0)?9\d{8}$/,"ar-TN":/^(\+?216)?[2459]\d{7}$/,"be-BY":/^(\+?375)?(24|25|29|33|44)\d{7}$/,"bg-BG":/^(\+?359|0)?8[789]\d{7}$/,"bn-BD":/^(\+?880|0)1[13456789][0-9]{8}$/,"cs-CZ":/^(\+?420)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,"da-DK":/^(\+?45)?\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,"de-DE":/^(\+49)?0?1(5[0-25-9]\d|6([23]|0\d?)|7([0-57-9]|6\d))\d{7}$/,"de-AT":/^(\+43|0)\d{1,4}\d{3,12}$/,"el-GR":/^(\+?30|0)?(69\d{8})$/,"en-AU":/^(\+?61|0)4\d{8}$/,"en-GB":/^(\+?44|0)7\d{9}$/,"en-GG":/^(\+?44|0)1481\d{6}$/,"en-GH":/^(\+233|0)(20|50|24|54|27|57|26|56|23|28)\d{7}$/,"en-HK":/^(\+?852[-\s]?)?[456789]\d{3}[-\s]?\d{4}$/,"en-MO":/^(\+?853[-\s]?)?[6]\d{3}[-\s]?\d{4}$/,"en-IE":/^(\+?353|0)8[356789]\d{7}$/,"en-IN":/^(\+?91|0)?[6789]\d{9}$/,"en-KE":/^(\+?254|0)(7|1)\d{8}$/,"en-MT":/^(\+?356|0)?(99|79|77|21|27|22|25)[0-9]{6}$/,"en-MU":/^(\+?230|0)?\d{8}$/,"en-NG":/^(\+?234|0)?[789]\d{9}$/,"en-NZ":/^(\+?64|0)[28]\d{7,9}$/,"en-PK":/^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/,"en-RW":/^(\+?250|0)?[7]\d{8}$/,"en-SG":/^(\+65)?[89]\d{7}$/,"en-TZ":/^(\+?255|0)?[67]\d{8}$/,"en-UG":/^(\+?256|0)?[7]\d{8}$/,"en-US":/^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$/,"en-ZA":/^(\+?27|0)\d{9}$/,"en-ZM":/^(\+?26)?09[567]\d{7}$/,"es-CL":/^(\+?56|0)[2-9]\d{1}\d{7}$/,"es-EC":/^(\+?593|0)([2-7]|9[2-9])\d{7}$/,"es-ES":/^(\+?34)?(6\d{1}|7[1234])\d{7}$/,"es-MX":/^(\+?52)?(1|01)?\d{10,11}$/,"es-PA":/^(\+?507)\d{7,8}$/,"es-PY":/^(\+?595|0)9[9876]\d{7}$/,"es-UY":/^(\+598|0)9[1-9][\d]{6}$/,"et-EE":/^(\+?372)?\s?(5|8[1-4])\s?([0-9]\s?){6,7}$/,"fa-IR":/^(\+?98[\-\s]?|0)9[0-39]\d[\-\s]?\d{3}[\-\s]?\d{4}$/,"fi-FI":/^(\+?358|0)\s?(4(0|1|2|4|5|6)?|50)\s?(\d\s?){4,8}\d$/,"fj-FJ":/^(\+?679)?\s?\d{3}\s?\d{4}$/,"fo-FO":/^(\+?298)?\s?\d{2}\s?\d{2}\s?\d{2}$/,"fr-FR":/^(\+?33|0)[67]\d{8}$/,"fr-GF":/^(\+?594|0|00594)[67]\d{8}$/,"fr-GP":/^(\+?590|0|00590)[67]\d{8}$/,"fr-MQ":/^(\+?596|0|00596)[67]\d{8}$/,"fr-RE":/^(\+?262|0|00262)[67]\d{8}$/,"he-IL":/^(\+972|0)([23489]|5[012345689]|77)[1-9]\d{6}$/,"hu-HU":/^(\+?36)(20|30|70)\d{7}$/,"id-ID":/^(\+?62|0)8(1[123456789]|2[1238]|3[1238]|5[12356789]|7[78]|9[56789]|8[123456789])([\s?|\d]{5,11})$/,"it-IT":/^(\+?39)?\s?3\d{2} ?\d{6,7}$/,"ja-JP":/^(\+81[ \-]?(\(0\))?|0)[6789]0[ \-]?\d{4}[ \-]?\d{4}$/,"kk-KZ":/^(\+?7|8)?7\d{9}$/,"kl-GL":/^(\+?299)?\s?\d{2}\s?\d{2}\s?\d{2}$/,"ko-KR":/^((\+?82)[ \-]?)?0?1([0|1|6|7|8|9]{1})[ \-]?\d{3,4}[ \-]?\d{4}$/,"lt-LT":/^(\+370|8)\d{8}$/,"ms-MY":/^(\+?6?01){1}(([0145]{1}(\-|\s)?\d{7,8})|([236789]{1}(\s|\-)?\d{7}))$/,"nb-NO":/^(\+?47)?[49]\d{7}$/,"ne-NP":/^(\+?977)?9[78]\d{8}$/,"nl-BE":/^(\+?32|0)4?\d{8}$/,"nl-NL":/^(\+?31|0)6?\d{8}$/,"nn-NO":/^(\+?47)?[49]\d{7}$/,"pl-PL":/^(\+?48)? ?[5-8]\d ?\d{3} ?\d{2} ?\d{2}$/,"pt-BR":/(?=^(\+?5{2}\-?|0)[1-9]{2}\-?\d{4}\-?\d{4}$)(^(\+?5{2}\-?|0)[1-9]{2}\-?[6-9]{1}\d{3}\-?\d{4}$)|(^(\+?5{2}\-?|0)[1-9]{2}\-?9[6-9]{1}\d{3}\-?\d{4}$)/,"pt-PT":/^(\+?351)?9[1236]\d{7}$/,"ro-RO":/^(\+?4?0)\s?7\d{2}(\/|\s|\.|\-)?\d{3}(\s|\.|\-)?\d{3}$/,"ru-RU":/^(\+?7|8)?9\d{9}$/,"sl-SI":/^(\+386\s?|0)(\d{1}\s?\d{3}\s?\d{2}\s?\d{2}|\d{2}\s?\d{3}\s?\d{3})$/,"sk-SK":/^(\+?421)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,"sr-RS":/^(\+3816|06)[- \d]{5,9}$/,"sv-SE":/^(\+?46|0)[\s\-]?7[\s\-]?[02369]([\s\-]?\d){7}$/,"th-TH":/^(\+66|66|0)\d{9}$/,"tr-TR":/^(\+?90|0)?5\d{9}$/,"uk-UA":/^(\+?38|8)?0\d{9}$/,"vi-VN":/^(\+?84|0)((3([2-9]))|(5([2689]))|(7([0|6-9]))|(8([1-6|89]))|(9([0-9])))([0-9]{7})$/,"zh-CN":/^((\+|00)86)?1([358][0-9]|4[579]|6[67]|7[01235678]|9[189])[0-9]{8}$/,"zh-TW":/^(\+?886\-?|0)?9\d{8}$/};X["en-CA"]=X["en-US"],X["fr-BE"]=X["nl-BE"],X["zh-HK"]=X["en-HK"],X["zh-MO"]=X["en-MO"],T=Object.keys(X);var Q={AM:/^[A-Z]{2}\d{7}$/,AR:/^[A-Z]{3}\d{6}$/,AT:/^[A-Z]\d{7}$/,AU:/^[A-Z]\d{7}$/,BE:/^[A-Z]{2}\d{6}$/,BG:/^\d{9}$/,CA:/^[A-Z]{2}\d{6}$/,CH:/^[A-Z]\d{7}$/,CN:/^[GE]\d{8}$/,CY:/^[A-Z](\d{6}|\d{8})$/,CZ:/^\d{8}$/,DE:/^[CFGHJKLMNPRTVWXYZ0-9]{9}$/,DK:/^\d{9}$/,DZ:/^\d{9}$/,EE:/^([A-Z]\d{7}|[A-Z]{2}\d{7})$/,ES:/^[A-Z0-9]{2}([A-Z0-9]?)\d{6}$/,FI:/^[A-Z]{2}\d{7}$/,FR:/^\d{2}[A-Z]{2}\d{5}$/,GB:/^\d{9}$/,GR:/^[A-Z]{2}\d{7}$/,HR:/^\d{9}$/,HU:/^[A-Z]{2}(\d{6}|\d{7})$/,IE:/^[A-Z0-9]{2}\d{7}$/,IS:/^(A)\d{7}$/,IT:/^[A-Z0-9]{2}\d{7}$/,JP:/^[A-Z]{2}\d{7}$/,KR:/^[MS]\d{8}$/,LT:/^[A-Z0-9]{8}$/,LU:/^[A-Z0-9]{8}$/,LV:/^[A-Z0-9]{2}\d{7}$/,MT:/^\d{7}$/,NL:/^[A-Z]{2}[A-Z0-9]{6}\d$/,PO:/^[A-Z]{2}\d{7}$/,PT:/^[A-Z]\d{6}$/,RO:/^\d{8,9}$/,SE:/^\d{8}$/,SL:/^(P)[A-Z]\d{7}$/,SK:/^[0-9A-Z]\d{7}$/,TR:/^[A-Z]\d{8}$/,UA:/^[A-Z]{2}\d{6}$/,US:/^\d{9}$/},tt=/^\d{5}$/,et=/^\d{6}$/,ut={AD:/^AD\d{3}$/,AT:I=/^\d{4}$/,AU:I,BE:I,BG:I,BR:/^\d{5}-\d{3}$/,CA:/^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][\s\-]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,CH:I,CZ:/^\d{3}\s?\d{2}$/,DE:tt,DK:I,DZ:tt,EE:tt,ES:tt,FI:tt,FR:/^\d{2}\s?\d{3}$/,GB:/^(gir\s?0aa|[a-z]{1,2}\d[\da-z]?\s?(\d[a-z]{2})?)$/i,GR:/^\d{3}\s?\d{2}$/,HR:/^([1-5]\d{4}$)/,HU:I,ID:tt,IE:/^(?!.*(?:o))[A-z]\d[\dw]\s\w{4}$/i,IL:tt,IN:/^((?!10|29|35|54|55|65|66|86|87|88|89)[1-9][0-9]{5})$/,IS:/^\d{3}$/,IT:tt,JP:/^\d{3}\-\d{4}$/,KE:tt,LI:/^(948[5-9]|949[0-7])$/,LT:/^LT\-\d{5}$/,LU:I,LV:/^LV\-\d{4}$/,MX:tt,MT:/^[A-Za-z]{3}\s{0,1}\d{4}$/,NL:/^\d{4}\s?[a-z]{2}$/i,NO:I,NZ:I,PL:/^\d{2}\-\d{3}$/,PR:/^00[679]\d{2}([ -]\d{4})?$/,PT:/^\d{4}\-\d{3}?$/,RO:et,RU:et,SA:tt,SE:/^[1-9]\d{2}\s?\d{2}$/,SI:I,SK:/^\d{3}\s?\d{2}$/,TN:I,TW:/^\d{3}(\d{2})?$/,UA:tt,US:/^\d{5}(-\d{4})?$/,ZA:I,ZM:tt};I=Object.keys(ut);var rt={protocols:["http","https","ftp"],require_tld:!0,require_protocol:!1,require_host:!0,require_valid_protocol:!0,allow_underscores:!1,allow_trailing_dot:!1,allow_protocol_relative_urls:!1},nt=/^\[([^\]]+)\](?::([0-9]+))?$/;return N.extend({isAlphanumeric:function(t){var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:"en-US";if(y(t),e in R)return R[e].test(t);throw Error("Invalid locale '".concat(e,"'"))},isCreditCard:function(t){if(y(t),t=t.replace(/[- ]+/g,""),!L.test(t))return!1;for(var e,u,r=0,n=t.length-1;0<=n;n--)e=t.substring(n,n+1),e=parseInt(e,10),u?r=10<=(e*=2)?r+(e%10+1):r+e:r+=e,u=!u;return!(0!=r%10||!t)},isCurrency:function(t,e){return y(t),function(t){var e="\\d{".concat(t.digits_after_decimal[0],"}");t.digits_after_decimal.forEach((function(t,u){0!==u&&(e="".concat(e,"|\\d{").concat(t,"}"))}));var u="(\\".concat(t.symbol.replace(/\./g,"\\."),")").concat(t.require_symbol?"":"?"),r=["0","[1-9]\\d*","[1-9]\\d{0,2}(\\".concat(t.thousands_separator,"\\d{3})*")];r="(".concat(r.join("|"),")?");var n="(\\".concat(t.decimal_separator,"(").concat(e,"))").concat(t.require_decimal?"":"?");return r+=t.allow_decimal||t.require_decimal?n:"",t.allow_negatives&&!t.parens_for_negatives&&(t.negative_sign_after_digits?r+="-?":t.negative_sign_before_digits&&(r="-?"+r)),t.allow_negative_sign_placeholder?r="( (?!\\-))?".concat(r):t.allow_space_after_symbol?r=" ?".concat(r):t.allow_space_after_digits&&(r+="( (?!$))?"),r=t.symbol_after_digits?r+u:u+r,t.allow_negatives&&(t.parens_for_negatives?r="(\\(".concat(r,"\\)|").concat(r,")"):t.negative_sign_before_digits||t.negative_sign_after_digits||(r="-?"+r)),new RegExp("^(?!-? )(?=.*\\d)".concat(r,"$"))}(e=m(e,C)).test(t)},isEmail:function(t,e){if(y(t),(e=m(e,M)).require_display_name||e.allow_display_name){var u=t.match(q);if(u){if(!(t=Array.isArray(u)?u:void 0))if(Symbol.iterator in Object(u)||"[object Arguments]"===Object.prototype.toString.call(u)){t=[];var r=!0,n=!1,i=void 0;try{for(var o,a=u[Symbol.iterator]();!(r=(o=a.next()).done)&&(t.push(o.value),3!==t.length);r=!0);}catch(t){n=!0,i=t}finally{try{r||null==a.return||a.return()}finally{if(n)throw i}}}else t=void 0;if(!(a=t))throw new TypeError("Invalid attempt to destructure non-iterable instance");if(u=a[1],t=a[2],u.endsWith(" ")&&(u=u.substr(0,u.length-1)),!(a=(u=(a=u).match(/^"(.+)"$/i))?u[1]:a).trim()||/[\.";<>]/.test(a)&&(!u||a.split('"').length!==a.split('\\"').length))return!1}else if(e.require_display_name)return!1}if(!e.ignore_max_length&&254<t.length)return!1;if(a=(u=t.split("@")).pop(),u=u.join("@"),o=a.toLowerCase(),e.domain_specific_validation&&("gmail.com"===o||"googlemail.com"===o)){if(!b((o=(u=u.toLowerCase()).split("+")[0]).replace(".",""),{min:6,max:30}))return!1;for(o=o.split("."),t=0;t<o.length;t++)if(!B.test(o[t]))return!1}if(!b(u,{max:64})||!b(a,{max:254}))return!1;if(!v(a,{require_tld:e.require_tld})){if(!e.allow_ip_domain)return!1;if(!Z(a)){if(!a.startsWith("[")||!a.endsWith("]"))return!1;if(0===(a=a.substr(1,a.length-2)).length||!Z(a))return!1}}if('"'===u[0])return u=u.slice(1,u.length-1),e.allow_utf8_local_part?H.test(u):j.test(u);for(e=e.allow_utf8_local_part?K:z,u=u.split("."),a=0;a<u.length;a++)if(!e.test(u[a]))return!1;return!0},isIP:Z,isIdentityCard:function(t,e){if(y(t),e in k)return k[e](t);if("any"===e){for(var u in k)if(k.hasOwnProperty(u)&&(0,k[u])(t))return!0;return!1}throw Error("Invalid locale '".concat(e,"'"))},isJSON:function(t){y(t);try{var e=JSON.parse(t);return!!e&&"object"===E(e)}catch(t){}return!1},isLocale:function(t){return y(t),"en_US_POSIX"===t||"ca_ES_VALENCIA"===t||Y.test(t)},isMimeType:function(t){return y(t),J.test(t)||W.test(t)||V.test(t)},isMobilePhone:function(t,e,u){if(y(t),u&&u.strictMode&&!t.startsWith("+"))return!1;if(Array.isArray(e))return e.some((function(e){return!(!X.hasOwnProperty(e)||!X[e].test(t))}));if(e in X)return X[e].test(t);if(!e||"any"===e){for(var r in X)if(X.hasOwnProperty(r)&&X[r].test(t))return!0;return!1}throw Error("Invalid locale '".concat(e,"'"))},isPassportNumber:function(t,e){return t=t.replace(/\s/g,"").toUpperCase(),e.toUpperCase()in Q&&Q[e].test(t)},isPostalCode:function(t,e){if(y(t),e in ut)return ut[e].test(t);if("any"===e){for(var u in ut)if(ut.hasOwnProperty(u)&&ut[u].test(t))return!0;return!1}throw Error("Invalid locale '".concat(e,"'"))},isURL:function(t,e){if(y(t),!t||2083<=t.length||/[\s<>]/.test(t)||0===t.indexOf("mailto:"))return!1;e=m(e,rt);var u=t.split("#");if(t=u.shift(),u=t.split("?"),t=u.shift(),1<(u=t.split("://")).length){if(t=u.shift().toLowerCase(),e.require_valid_protocol&&-1===e.protocols.indexOf(t))return!1}else{if(e.require_protocol)return!1;if("//"===t.substr(0,2)){if(!e.allow_protocol_relative_urls)return!1;u[0]=t.substr(2)}}if(""===(t=u.join("://")))return!1;if(u=t.split("/"),""===(t=u.shift())&&!e.require_host)return!0;if(1<(u=t.split("@")).length){if(e.disallow_auth)return!1;if(0<=(t=u.shift()).indexOf(":")&&2<t.split(":").length)return!1}var r=u.join("@"),n=t=null;return(u=r.match(nt))?(r="",n=u[1],t=u[2]||null):(u=r.split(":"),r=u.shift(),u.length&&(t=u.join(":"))),!(null!==t&&(u=parseInt(t,10),!/^[0-9]+$/.test(t)||0>=u||65535<u)||!(Z(r)||v(r,e)||n&&Z(n,6)))&&(r=r||n,!(e.host_whitelist&&!S(r,e.host_whitelist)||e.host_blacklist&&S(r,e.host_blacklist)))}}),t(N,{isAlphanumericLocales:P,isMobilePhoneLocales:T,isPostalCodeLocales:I})}));
