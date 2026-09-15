/* tsr-chat-widget */
"use strict";var TSRChatWidget=(()=>{var Np=Object.create;var ar=Object.defineProperty;var Tp=Object.getOwnPropertyDescriptor;var Rp=Object.getOwnPropertyNames;var Mp=Object.getPrototypeOf,Ap=Object.prototype.hasOwnProperty;var zp=(e,t,n)=>t in e?ar(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var ct=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),Lp=(e,t)=>{for(var n in t)ar(e,n,{get:t[n],enumerable:!0})},Lu=(e,t,n,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of Rp(t))!Ap.call(e,o)&&o!==n&&ar(e,o,{get:()=>t[o],enumerable:!(r=Tp(t,o))||r.enumerable});return e};var B=(e,t,n)=>(n=e!=null?Np(Mp(e)):{},Lu(t||!e||!e.__esModule?ar(n,"default",{value:e,enumerable:!0}):n,e)),Ip=e=>Lu(ar({},"__esModule",{value:!0}),e);var ie=(e,t,n)=>zp(e,typeof t!="symbol"?t+"":t,n);var Ku=ct(z=>{"use strict";var cr=Symbol.for("react.element"),$p=Symbol.for("react.portal"),Op=Symbol.for("react.fragment"),Bp=Symbol.for("react.strict_mode"),jp=Symbol.for("react.profiler"),Up=Symbol.for("react.provider"),Hp=Symbol.for("react.context"),bp=Symbol.for("react.forward_ref"),Vp=Symbol.for("react.suspense"),Wp=Symbol.for("react.memo"),Qp=Symbol.for("react.lazy"),Iu=Symbol.iterator;function Kp(e){return e===null||typeof e!="object"?null:(e=Iu&&e[Iu]||e["@@iterator"],typeof e=="function"?e:null)}var Bu={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},ju=Object.assign,Uu={};function Sn(e,t,n){this.props=e,this.context=t,this.refs=Uu,this.updater=n||Bu}Sn.prototype.isReactComponent={};Sn.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Sn.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Hu(){}Hu.prototype=Sn.prototype;function ri(e,t,n){this.props=e,this.context=t,this.refs=Uu,this.updater=n||Bu}var oi=ri.prototype=new Hu;oi.constructor=ri;ju(oi,Sn.prototype);oi.isPureReactComponent=!0;var $u=Array.isArray,bu=Object.prototype.hasOwnProperty,li={current:null},Vu={key:!0,ref:!0,__self:!0,__source:!0};function Wu(e,t,n){var r,o={},l=null,i=null;if(t!=null)for(r in t.ref!==void 0&&(i=t.ref),t.key!==void 0&&(l=""+t.key),t)bu.call(t,r)&&!Vu.hasOwnProperty(r)&&(o[r]=t[r]);var s=arguments.length-2;if(s===1)o.children=n;else if(1<s){for(var u=Array(s),d=0;d<s;d++)u[d]=arguments[d+2];o.children=u}if(e&&e.defaultProps)for(r in s=e.defaultProps,s)o[r]===void 0&&(o[r]=s[r]);return{$$typeof:cr,type:e,key:l,ref:i,props:o,_owner:li.current}}function Gp(e,t){return{$$typeof:cr,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function ii(e){return typeof e=="object"&&e!==null&&e.$$typeof===cr}function Yp(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var Ou=/\/+/g;function ni(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Yp(""+e.key):t.toString(36)}function go(e,t,n,r,o){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var i=!1;if(e===null)i=!0;else switch(l){case"string":case"number":i=!0;break;case"object":switch(e.$$typeof){case cr:case $p:i=!0}}if(i)return i=e,o=o(i),e=r===""?"."+ni(i,0):r,$u(o)?(n="",e!=null&&(n=e.replace(Ou,"$&/")+"/"),go(o,t,n,"",function(d){return d})):o!=null&&(ii(o)&&(o=Gp(o,n+(!o.key||i&&i.key===o.key?"":(""+o.key).replace(Ou,"$&/")+"/")+e)),t.push(o)),1;if(i=0,r=r===""?".":r+":",$u(e))for(var s=0;s<e.length;s++){l=e[s];var u=r+ni(l,s);i+=go(l,t,n,u,o)}else if(u=Kp(e),typeof u=="function")for(e=u.call(e),s=0;!(l=e.next()).done;)l=l.value,u=r+ni(l,s++),i+=go(l,t,n,u,o);else if(l==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return i}function mo(e,t,n){if(e==null)return e;var r=[],o=0;return go(e,r,"","",function(l){return t.call(n,l,o++)}),r}function Zp(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var ye={current:null},vo={transition:null},Xp={ReactCurrentDispatcher:ye,ReactCurrentBatchConfig:vo,ReactCurrentOwner:li};function Qu(){throw Error("act(...) is not supported in production builds of React.")}z.Children={map:mo,forEach:function(e,t,n){mo(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return mo(e,function(){t++}),t},toArray:function(e){return mo(e,function(t){return t})||[]},only:function(e){if(!ii(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};z.Component=Sn;z.Fragment=Op;z.Profiler=jp;z.PureComponent=ri;z.StrictMode=Bp;z.Suspense=Vp;z.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Xp;z.act=Qu;z.cloneElement=function(e,t,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=ju({},e.props),o=e.key,l=e.ref,i=e._owner;if(t!=null){if(t.ref!==void 0&&(l=t.ref,i=li.current),t.key!==void 0&&(o=""+t.key),e.type&&e.type.defaultProps)var s=e.type.defaultProps;for(u in t)bu.call(t,u)&&!Vu.hasOwnProperty(u)&&(r[u]=t[u]===void 0&&s!==void 0?s[u]:t[u])}var u=arguments.length-2;if(u===1)r.children=n;else if(1<u){s=Array(u);for(var d=0;d<u;d++)s[d]=arguments[d+2];r.children=s}return{$$typeof:cr,type:e.type,key:o,ref:l,props:r,_owner:i}};z.createContext=function(e){return e={$$typeof:Hp,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:Up,_context:e},e.Consumer=e};z.createElement=Wu;z.createFactory=function(e){var t=Wu.bind(null,e);return t.type=e,t};z.createRef=function(){return{current:null}};z.forwardRef=function(e){return{$$typeof:bp,render:e}};z.isValidElement=ii;z.lazy=function(e){return{$$typeof:Qp,_payload:{_status:-1,_result:e},_init:Zp}};z.memo=function(e,t){return{$$typeof:Wp,type:e,compare:t===void 0?null:t}};z.startTransition=function(e){var t=vo.transition;vo.transition={};try{e()}finally{vo.transition=t}};z.unstable_act=Qu;z.useCallback=function(e,t){return ye.current.useCallback(e,t)};z.useContext=function(e){return ye.current.useContext(e)};z.useDebugValue=function(){};z.useDeferredValue=function(e){return ye.current.useDeferredValue(e)};z.useEffect=function(e,t){return ye.current.useEffect(e,t)};z.useId=function(){return ye.current.useId()};z.useImperativeHandle=function(e,t,n){return ye.current.useImperativeHandle(e,t,n)};z.useInsertionEffect=function(e,t){return ye.current.useInsertionEffect(e,t)};z.useLayoutEffect=function(e,t){return ye.current.useLayoutEffect(e,t)};z.useMemo=function(e,t){return ye.current.useMemo(e,t)};z.useReducer=function(e,t,n){return ye.current.useReducer(e,t,n)};z.useRef=function(e){return ye.current.useRef(e)};z.useState=function(e){return ye.current.useState(e)};z.useSyncExternalStore=function(e,t,n){return ye.current.useSyncExternalStore(e,t,n)};z.useTransition=function(){return ye.current.useTransition()};z.version="18.3.1"});var Ye=ct((Ig,Gu)=>{"use strict";Gu.exports=Ku()});var oa=ct(U=>{"use strict";function ci(e,t){var n=e.length;e.push(t);e:for(;0<n;){var r=n-1>>>1,o=e[r];if(0<yo(o,t))e[r]=t,e[n]=o,n=r;else break e}}function Ze(e){return e.length===0?null:e[0]}function Co(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;e:for(var r=0,o=e.length,l=o>>>1;r<l;){var i=2*(r+1)-1,s=e[i],u=i+1,d=e[u];if(0>yo(s,n))u<o&&0>yo(d,s)?(e[r]=d,e[u]=n,r=u):(e[r]=s,e[i]=n,r=i);else if(u<o&&0>yo(d,n))e[r]=d,e[u]=n,r=u;else break e}}return t}function yo(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}typeof performance=="object"&&typeof performance.now=="function"?(Yu=performance,U.unstable_now=function(){return Yu.now()}):(si=Date,Zu=si.now(),U.unstable_now=function(){return si.now()-Zu});var Yu,si,Zu,ot=[],Pt=[],Jp=1,Be=null,pe=3,_o=!1,en=!1,fr=!1,qu=typeof setTimeout=="function"?setTimeout:null,ea=typeof clearTimeout=="function"?clearTimeout:null,Xu=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function di(e){for(var t=Ze(Pt);t!==null;){if(t.callback===null)Co(Pt);else if(t.startTime<=e)Co(Pt),t.sortIndex=t.expirationTime,ci(ot,t);else break;t=Ze(Pt)}}function fi(e){if(fr=!1,di(e),!en)if(Ze(ot)!==null)en=!0,hi(pi);else{var t=Ze(Pt);t!==null&&mi(fi,t.startTime-e)}}function pi(e,t){en=!1,fr&&(fr=!1,ea(pr),pr=-1),_o=!0;var n=pe;try{for(di(t),Be=Ze(ot);Be!==null&&(!(Be.expirationTime>t)||e&&!ra());){var r=Be.callback;if(typeof r=="function"){Be.callback=null,pe=Be.priorityLevel;var o=r(Be.expirationTime<=t);t=U.unstable_now(),typeof o=="function"?Be.callback=o:Be===Ze(ot)&&Co(ot),di(t)}else Co(ot);Be=Ze(ot)}if(Be!==null)var l=!0;else{var i=Ze(Pt);i!==null&&mi(fi,i.startTime-t),l=!1}return l}finally{Be=null,pe=n,_o=!1}}var ko=!1,wo=null,pr=-1,ta=5,na=-1;function ra(){return!(U.unstable_now()-na<ta)}function ui(){if(wo!==null){var e=U.unstable_now();na=e;var t=!0;try{t=wo(!0,e)}finally{t?dr():(ko=!1,wo=null)}}else ko=!1}var dr;typeof Xu=="function"?dr=function(){Xu(ui)}:typeof MessageChannel<"u"?(ai=new MessageChannel,Ju=ai.port2,ai.port1.onmessage=ui,dr=function(){Ju.postMessage(null)}):dr=function(){qu(ui,0)};var ai,Ju;function hi(e){wo=e,ko||(ko=!0,dr())}function mi(e,t){pr=qu(function(){e(U.unstable_now())},t)}U.unstable_IdlePriority=5;U.unstable_ImmediatePriority=1;U.unstable_LowPriority=4;U.unstable_NormalPriority=3;U.unstable_Profiling=null;U.unstable_UserBlockingPriority=2;U.unstable_cancelCallback=function(e){e.callback=null};U.unstable_continueExecution=function(){en||_o||(en=!0,hi(pi))};U.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):ta=0<e?Math.floor(1e3/e):5};U.unstable_getCurrentPriorityLevel=function(){return pe};U.unstable_getFirstCallbackNode=function(){return Ze(ot)};U.unstable_next=function(e){switch(pe){case 1:case 2:case 3:var t=3;break;default:t=pe}var n=pe;pe=t;try{return e()}finally{pe=n}};U.unstable_pauseExecution=function(){};U.unstable_requestPaint=function(){};U.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=pe;pe=e;try{return t()}finally{pe=n}};U.unstable_scheduleCallback=function(e,t,n){var r=U.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?r+n:r):n=r,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=n+o,e={id:Jp++,callback:t,priorityLevel:e,startTime:n,expirationTime:o,sortIndex:-1},n>r?(e.sortIndex=n,ci(Pt,e),Ze(ot)===null&&e===Ze(Pt)&&(fr?(ea(pr),pr=-1):fr=!0,mi(fi,n-r))):(e.sortIndex=o,ci(ot,e),en||_o||(en=!0,hi(pi))),e};U.unstable_shouldYield=ra;U.unstable_wrapCallback=function(e){var t=pe;return function(){var n=pe;pe=t;try{return e.apply(this,arguments)}finally{pe=n}}}});var ia=ct((Og,la)=>{"use strict";la.exports=oa()});var df=ct(Le=>{"use strict";var qp=Ye(),Ae=ia();function _(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var pc=new Set,Lr={};function hn(e,t){Qn(e,t),Qn(e+"Capture",t)}function Qn(e,t){for(Lr[e]=t,e=0;e<t.length;e++)pc.add(t[e])}var gt=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Oi=Object.prototype.hasOwnProperty,eh=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,sa={},ua={};function th(e){return Oi.call(ua,e)?!0:Oi.call(sa,e)?!1:eh.test(e)?ua[e]=!0:(sa[e]=!0,!1)}function nh(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function rh(e,t,n,r){if(t===null||typeof t>"u"||nh(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function _e(e,t,n,r,o,l,i){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=o,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=l,this.removeEmptyString=i}var de={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){de[e]=new _e(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];de[t]=new _e(t,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){de[e]=new _e(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){de[e]=new _e(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){de[e]=new _e(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){de[e]=new _e(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){de[e]=new _e(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){de[e]=new _e(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){de[e]=new _e(e,5,!1,e.toLowerCase(),null,!1,!1)});var Ts=/[\-:]([a-z])/g;function Rs(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Ts,Rs);de[t]=new _e(t,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Ts,Rs);de[t]=new _e(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Ts,Rs);de[t]=new _e(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){de[e]=new _e(e,1,!1,e.toLowerCase(),null,!1,!1)});de.xlinkHref=new _e("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){de[e]=new _e(e,1,!1,e.toLowerCase(),null,!0,!0)});function Ms(e,t,n,r){var o=de.hasOwnProperty(t)?de[t]:null;(o!==null?o.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(rh(t,n,o,r)&&(n=null),r||o===null?th(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):o.mustUseProperty?e[o.propertyName]=n===null?o.type===3?!1:"":n:(t=o.attributeName,r=o.attributeNamespace,n===null?e.removeAttribute(t):(o=o.type,n=o===3||o===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var Ct=qp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,xo=Symbol.for("react.element"),Pn=Symbol.for("react.portal"),Nn=Symbol.for("react.fragment"),As=Symbol.for("react.strict_mode"),Bi=Symbol.for("react.profiler"),hc=Symbol.for("react.provider"),mc=Symbol.for("react.context"),zs=Symbol.for("react.forward_ref"),ji=Symbol.for("react.suspense"),Ui=Symbol.for("react.suspense_list"),Ls=Symbol.for("react.memo"),Tt=Symbol.for("react.lazy");Symbol.for("react.scope");Symbol.for("react.debug_trace_mode");var gc=Symbol.for("react.offscreen");Symbol.for("react.legacy_hidden");Symbol.for("react.cache");Symbol.for("react.tracing_marker");var aa=Symbol.iterator;function hr(e){return e===null||typeof e!="object"?null:(e=aa&&e[aa]||e["@@iterator"],typeof e=="function"?e:null)}var X=Object.assign,gi;function kr(e){if(gi===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);gi=t&&t[1]||""}return`
`+gi+e}var vi=!1;function yi(e,t){if(!e||vi)return"";vi=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(d){var r=d}Reflect.construct(e,[],t)}else{try{t.call()}catch(d){r=d}e.call(t.prototype)}else{try{throw Error()}catch(d){r=d}e()}}catch(d){if(d&&r&&typeof d.stack=="string"){for(var o=d.stack.split(`
`),l=r.stack.split(`
`),i=o.length-1,s=l.length-1;1<=i&&0<=s&&o[i]!==l[s];)s--;for(;1<=i&&0<=s;i--,s--)if(o[i]!==l[s]){if(i!==1||s!==1)do if(i--,s--,0>s||o[i]!==l[s]){var u=`
`+o[i].replace(" at new "," at ");return e.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",e.displayName)),u}while(1<=i&&0<=s);break}}}finally{vi=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?kr(e):""}function oh(e){switch(e.tag){case 5:return kr(e.type);case 16:return kr("Lazy");case 13:return kr("Suspense");case 19:return kr("SuspenseList");case 0:case 2:case 15:return e=yi(e.type,!1),e;case 11:return e=yi(e.type.render,!1),e;case 1:return e=yi(e.type,!0),e;default:return""}}function Hi(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Nn:return"Fragment";case Pn:return"Portal";case Bi:return"Profiler";case As:return"StrictMode";case ji:return"Suspense";case Ui:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case mc:return(e.displayName||"Context")+".Consumer";case hc:return(e._context.displayName||"Context")+".Provider";case zs:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Ls:return t=e.displayName||null,t!==null?t:Hi(e.type)||"Memo";case Tt:t=e._payload,e=e._init;try{return Hi(e(t))}catch{}}return null}function lh(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Hi(t);case 8:return t===As?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function Vt(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function vc(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function ih(e){var t=vc(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,l=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(i){r=""+i,l.call(this,i)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(i){r=""+i},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Eo(e){e._valueTracker||(e._valueTracker=ih(e))}function yc(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=vc(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function Jo(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function bi(e,t){var n=t.checked;return X({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function ca(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=Vt(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function wc(e,t){t=t.checked,t!=null&&Ms(e,"checked",t,!1)}function Vi(e,t){wc(e,t);var n=Vt(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?Wi(e,t.type,n):t.hasOwnProperty("defaultValue")&&Wi(e,t.type,Vt(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function da(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function Wi(e,t,n){(t!=="number"||Jo(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var xr=Array.isArray;function jn(e,t,n,r){if(e=e.options,t){t={};for(var o=0;o<n.length;o++)t["$"+n[o]]=!0;for(n=0;n<e.length;n++)o=t.hasOwnProperty("$"+e[n].value),e[n].selected!==o&&(e[n].selected=o),o&&r&&(e[n].defaultSelected=!0)}else{for(n=""+Vt(n),t=null,o=0;o<e.length;o++){if(e[o].value===n){e[o].selected=!0,r&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function Qi(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(_(91));return X({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function fa(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(_(92));if(xr(n)){if(1<n.length)throw Error(_(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:Vt(n)}}function Cc(e,t){var n=Vt(t.value),r=Vt(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function pa(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function _c(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Ki(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?_c(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var So,kc=(function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,o){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,o)})}:e})(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(So=So||document.createElement("div"),So.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=So.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function Ir(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Dr={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},sh=["Webkit","ms","Moz","O"];Object.keys(Dr).forEach(function(e){sh.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Dr[t]=Dr[e]})});function xc(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||Dr.hasOwnProperty(e)&&Dr[e]?(""+t).trim():t+"px"}function Ec(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,o=xc(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,o):e[n]=o}}var uh=X({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Gi(e,t){if(t){if(uh[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(_(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(_(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(_(61))}if(t.style!=null&&typeof t.style!="object")throw Error(_(62))}}function Yi(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Zi=null;function Is(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Xi=null,Un=null,Hn=null;function ha(e){if(e=eo(e)){if(typeof Xi!="function")throw Error(_(280));var t=e.stateNode;t&&(t=Dl(t),Xi(e.stateNode,e.type,t))}}function Sc(e){Un?Hn?Hn.push(e):Hn=[e]:Un=e}function Dc(){if(Un){var e=Un,t=Hn;if(Hn=Un=null,ha(e),t)for(e=0;e<t.length;e++)ha(t[e])}}function Fc(e,t){return e(t)}function Pc(){}var wi=!1;function Nc(e,t,n){if(wi)return e(t,n);wi=!0;try{return Fc(e,t,n)}finally{wi=!1,(Un!==null||Hn!==null)&&(Pc(),Dc())}}function $r(e,t){var n=e.stateNode;if(n===null)return null;var r=Dl(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(_(231,t,typeof n));return n}var Ji=!1;if(gt)try{Dn={},Object.defineProperty(Dn,"passive",{get:function(){Ji=!0}}),window.addEventListener("test",Dn,Dn),window.removeEventListener("test",Dn,Dn)}catch{Ji=!1}var Dn;function ah(e,t,n,r,o,l,i,s,u){var d=Array.prototype.slice.call(arguments,3);try{t.apply(n,d)}catch(h){this.onError(h)}}var Fr=!1,qo=null,el=!1,qi=null,ch={onError:function(e){Fr=!0,qo=e}};function dh(e,t,n,r,o,l,i,s,u){Fr=!1,qo=null,ah.apply(ch,arguments)}function fh(e,t,n,r,o,l,i,s,u){if(dh.apply(this,arguments),Fr){if(Fr){var d=qo;Fr=!1,qo=null}else throw Error(_(198));el||(el=!0,qi=d)}}function mn(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function Tc(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function ma(e){if(mn(e)!==e)throw Error(_(188))}function ph(e){var t=e.alternate;if(!t){if(t=mn(e),t===null)throw Error(_(188));return t!==e?null:e}for(var n=e,r=t;;){var o=n.return;if(o===null)break;var l=o.alternate;if(l===null){if(r=o.return,r!==null){n=r;continue}break}if(o.child===l.child){for(l=o.child;l;){if(l===n)return ma(o),e;if(l===r)return ma(o),t;l=l.sibling}throw Error(_(188))}if(n.return!==r.return)n=o,r=l;else{for(var i=!1,s=o.child;s;){if(s===n){i=!0,n=o,r=l;break}if(s===r){i=!0,r=o,n=l;break}s=s.sibling}if(!i){for(s=l.child;s;){if(s===n){i=!0,n=l,r=o;break}if(s===r){i=!0,r=l,n=o;break}s=s.sibling}if(!i)throw Error(_(189))}}if(n.alternate!==r)throw Error(_(190))}if(n.tag!==3)throw Error(_(188));return n.stateNode.current===n?e:t}function Rc(e){return e=ph(e),e!==null?Mc(e):null}function Mc(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=Mc(e);if(t!==null)return t;e=e.sibling}return null}var Ac=Ae.unstable_scheduleCallback,ga=Ae.unstable_cancelCallback,hh=Ae.unstable_shouldYield,mh=Ae.unstable_requestPaint,te=Ae.unstable_now,gh=Ae.unstable_getCurrentPriorityLevel,$s=Ae.unstable_ImmediatePriority,zc=Ae.unstable_UserBlockingPriority,tl=Ae.unstable_NormalPriority,vh=Ae.unstable_LowPriority,Lc=Ae.unstable_IdlePriority,kl=null,ut=null;function yh(e){if(ut&&typeof ut.onCommitFiberRoot=="function")try{ut.onCommitFiberRoot(kl,e,void 0,(e.current.flags&128)===128)}catch{}}var tt=Math.clz32?Math.clz32:_h,wh=Math.log,Ch=Math.LN2;function _h(e){return e>>>=0,e===0?32:31-(wh(e)/Ch|0)|0}var Do=64,Fo=4194304;function Er(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function nl(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,o=e.suspendedLanes,l=e.pingedLanes,i=n&268435455;if(i!==0){var s=i&~o;s!==0?r=Er(s):(l&=i,l!==0&&(r=Er(l)))}else i=n&~o,i!==0?r=Er(i):l!==0&&(r=Er(l));if(r===0)return 0;if(t!==0&&t!==r&&(t&o)===0&&(o=r&-r,l=t&-t,o>=l||o===16&&(l&4194240)!==0))return t;if((r&4)!==0&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-tt(t),o=1<<n,r|=e[n],t&=~o;return r}function kh(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function xh(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,o=e.expirationTimes,l=e.pendingLanes;0<l;){var i=31-tt(l),s=1<<i,u=o[i];u===-1?((s&n)===0||(s&r)!==0)&&(o[i]=kh(s,t)):u<=t&&(e.expiredLanes|=s),l&=~s}}function es(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Ic(){var e=Do;return Do<<=1,(Do&4194240)===0&&(Do=64),e}function Ci(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Jr(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-tt(t),e[t]=n}function Eh(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var o=31-tt(n),l=1<<o;t[o]=0,r[o]=-1,e[o]=-1,n&=~l}}function Os(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-tt(n),o=1<<r;o&t|e[r]&t&&(e[r]|=t),n&=~o}}var O=0;function $c(e){return e&=-e,1<e?4<e?(e&268435455)!==0?16:536870912:4:1}var Oc,Bs,Bc,jc,Uc,ts=!1,Po=[],It=null,$t=null,Ot=null,Or=new Map,Br=new Map,Mt=[],Sh="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function va(e,t){switch(e){case"focusin":case"focusout":It=null;break;case"dragenter":case"dragleave":$t=null;break;case"mouseover":case"mouseout":Ot=null;break;case"pointerover":case"pointerout":Or.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Br.delete(t.pointerId)}}function mr(e,t,n,r,o,l){return e===null||e.nativeEvent!==l?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:l,targetContainers:[o]},t!==null&&(t=eo(t),t!==null&&Bs(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function Dh(e,t,n,r,o){switch(t){case"focusin":return It=mr(It,e,t,n,r,o),!0;case"dragenter":return $t=mr($t,e,t,n,r,o),!0;case"mouseover":return Ot=mr(Ot,e,t,n,r,o),!0;case"pointerover":var l=o.pointerId;return Or.set(l,mr(Or.get(l)||null,e,t,n,r,o)),!0;case"gotpointercapture":return l=o.pointerId,Br.set(l,mr(Br.get(l)||null,e,t,n,r,o)),!0}return!1}function Hc(e){var t=rn(e.target);if(t!==null){var n=mn(t);if(n!==null){if(t=n.tag,t===13){if(t=Tc(n),t!==null){e.blockedOn=t,Uc(e.priority,function(){Bc(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Ho(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=ns(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);Zi=r,n.target.dispatchEvent(r),Zi=null}else return t=eo(n),t!==null&&Bs(t),e.blockedOn=n,!1;t.shift()}return!0}function ya(e,t,n){Ho(e)&&n.delete(t)}function Fh(){ts=!1,It!==null&&Ho(It)&&(It=null),$t!==null&&Ho($t)&&($t=null),Ot!==null&&Ho(Ot)&&(Ot=null),Or.forEach(ya),Br.forEach(ya)}function gr(e,t){e.blockedOn===t&&(e.blockedOn=null,ts||(ts=!0,Ae.unstable_scheduleCallback(Ae.unstable_NormalPriority,Fh)))}function jr(e){function t(o){return gr(o,e)}if(0<Po.length){gr(Po[0],e);for(var n=1;n<Po.length;n++){var r=Po[n];r.blockedOn===e&&(r.blockedOn=null)}}for(It!==null&&gr(It,e),$t!==null&&gr($t,e),Ot!==null&&gr(Ot,e),Or.forEach(t),Br.forEach(t),n=0;n<Mt.length;n++)r=Mt[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<Mt.length&&(n=Mt[0],n.blockedOn===null);)Hc(n),n.blockedOn===null&&Mt.shift()}var bn=Ct.ReactCurrentBatchConfig,rl=!0;function Ph(e,t,n,r){var o=O,l=bn.transition;bn.transition=null;try{O=1,js(e,t,n,r)}finally{O=o,bn.transition=l}}function Nh(e,t,n,r){var o=O,l=bn.transition;bn.transition=null;try{O=4,js(e,t,n,r)}finally{O=o,bn.transition=l}}function js(e,t,n,r){if(rl){var o=ns(e,t,n,r);if(o===null)Fi(e,t,r,ol,n),va(e,r);else if(Dh(o,e,t,n,r))r.stopPropagation();else if(va(e,r),t&4&&-1<Sh.indexOf(e)){for(;o!==null;){var l=eo(o);if(l!==null&&Oc(l),l=ns(e,t,n,r),l===null&&Fi(e,t,r,ol,n),l===o)break;o=l}o!==null&&r.stopPropagation()}else Fi(e,t,r,null,n)}}var ol=null;function ns(e,t,n,r){if(ol=null,e=Is(r),e=rn(e),e!==null)if(t=mn(e),t===null)e=null;else if(n=t.tag,n===13){if(e=Tc(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return ol=e,null}function bc(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(gh()){case $s:return 1;case zc:return 4;case tl:case vh:return 16;case Lc:return 536870912;default:return 16}default:return 16}}var zt=null,Us=null,bo=null;function Vc(){if(bo)return bo;var e,t=Us,n=t.length,r,o="value"in zt?zt.value:zt.textContent,l=o.length;for(e=0;e<n&&t[e]===o[e];e++);var i=n-e;for(r=1;r<=i&&t[n-r]===o[l-r];r++);return bo=o.slice(e,1<r?1-r:void 0)}function Vo(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function No(){return!0}function wa(){return!1}function ze(e){function t(n,r,o,l,i){this._reactName=n,this._targetInst=o,this.type=r,this.nativeEvent=l,this.target=i,this.currentTarget=null;for(var s in e)e.hasOwnProperty(s)&&(n=e[s],this[s]=n?n(l):l[s]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?No:wa,this.isPropagationStopped=wa,this}return X(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=No)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=No)},persist:function(){},isPersistent:No}),t}var qn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Hs=ze(qn),qr=X({},qn,{view:0,detail:0}),Th=ze(qr),_i,ki,vr,xl=X({},qr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:bs,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==vr&&(vr&&e.type==="mousemove"?(_i=e.screenX-vr.screenX,ki=e.screenY-vr.screenY):ki=_i=0,vr=e),_i)},movementY:function(e){return"movementY"in e?e.movementY:ki}}),Ca=ze(xl),Rh=X({},xl,{dataTransfer:0}),Mh=ze(Rh),Ah=X({},qr,{relatedTarget:0}),xi=ze(Ah),zh=X({},qn,{animationName:0,elapsedTime:0,pseudoElement:0}),Lh=ze(zh),Ih=X({},qn,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),$h=ze(Ih),Oh=X({},qn,{data:0}),_a=ze(Oh),Bh={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},jh={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Uh={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Hh(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Uh[e])?!!t[e]:!1}function bs(){return Hh}var bh=X({},qr,{key:function(e){if(e.key){var t=Bh[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Vo(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?jh[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:bs,charCode:function(e){return e.type==="keypress"?Vo(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Vo(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Vh=ze(bh),Wh=X({},xl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),ka=ze(Wh),Qh=X({},qr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:bs}),Kh=ze(Qh),Gh=X({},qn,{propertyName:0,elapsedTime:0,pseudoElement:0}),Yh=ze(Gh),Zh=X({},xl,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),Xh=ze(Zh),Jh=[9,13,27,32],Vs=gt&&"CompositionEvent"in window,Pr=null;gt&&"documentMode"in document&&(Pr=document.documentMode);var qh=gt&&"TextEvent"in window&&!Pr,Wc=gt&&(!Vs||Pr&&8<Pr&&11>=Pr),xa=" ",Ea=!1;function Qc(e,t){switch(e){case"keyup":return Jh.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Kc(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Tn=!1;function em(e,t){switch(e){case"compositionend":return Kc(t);case"keypress":return t.which!==32?null:(Ea=!0,xa);case"textInput":return e=t.data,e===xa&&Ea?null:e;default:return null}}function tm(e,t){if(Tn)return e==="compositionend"||!Vs&&Qc(e,t)?(e=Vc(),bo=Us=zt=null,Tn=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Wc&&t.locale!=="ko"?null:t.data;default:return null}}var nm={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Sa(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!nm[e.type]:t==="textarea"}function Gc(e,t,n,r){Sc(r),t=ll(t,"onChange"),0<t.length&&(n=new Hs("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var Nr=null,Ur=null;function rm(e){ld(e,0)}function El(e){var t=An(e);if(yc(t))return e}function om(e,t){if(e==="change")return t}var Yc=!1;gt&&(gt?(Ro="oninput"in document,Ro||(Ei=document.createElement("div"),Ei.setAttribute("oninput","return;"),Ro=typeof Ei.oninput=="function"),To=Ro):To=!1,Yc=To&&(!document.documentMode||9<document.documentMode));var To,Ro,Ei;function Da(){Nr&&(Nr.detachEvent("onpropertychange",Zc),Ur=Nr=null)}function Zc(e){if(e.propertyName==="value"&&El(Ur)){var t=[];Gc(t,Ur,e,Is(e)),Nc(rm,t)}}function lm(e,t,n){e==="focusin"?(Da(),Nr=t,Ur=n,Nr.attachEvent("onpropertychange",Zc)):e==="focusout"&&Da()}function im(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return El(Ur)}function sm(e,t){if(e==="click")return El(t)}function um(e,t){if(e==="input"||e==="change")return El(t)}function am(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var rt=typeof Object.is=="function"?Object.is:am;function Hr(e,t){if(rt(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var o=n[r];if(!Oi.call(t,o)||!rt(e[o],t[o]))return!1}return!0}function Fa(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Pa(e,t){var n=Fa(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Fa(n)}}function Xc(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Xc(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Jc(){for(var e=window,t=Jo();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=Jo(e.document)}return t}function Ws(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function cm(e){var t=Jc(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&Xc(n.ownerDocument.documentElement,n)){if(r!==null&&Ws(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var o=n.textContent.length,l=Math.min(r.start,o);r=r.end===void 0?l:Math.min(r.end,o),!e.extend&&l>r&&(o=r,r=l,l=o),o=Pa(n,l);var i=Pa(n,r);o&&i&&(e.rangeCount!==1||e.anchorNode!==o.node||e.anchorOffset!==o.offset||e.focusNode!==i.node||e.focusOffset!==i.offset)&&(t=t.createRange(),t.setStart(o.node,o.offset),e.removeAllRanges(),l>r?(e.addRange(t),e.extend(i.node,i.offset)):(t.setEnd(i.node,i.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var dm=gt&&"documentMode"in document&&11>=document.documentMode,Rn=null,rs=null,Tr=null,os=!1;function Na(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;os||Rn==null||Rn!==Jo(r)||(r=Rn,"selectionStart"in r&&Ws(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Tr&&Hr(Tr,r)||(Tr=r,r=ll(rs,"onSelect"),0<r.length&&(t=new Hs("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=Rn)))}function Mo(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Mn={animationend:Mo("Animation","AnimationEnd"),animationiteration:Mo("Animation","AnimationIteration"),animationstart:Mo("Animation","AnimationStart"),transitionend:Mo("Transition","TransitionEnd")},Si={},qc={};gt&&(qc=document.createElement("div").style,"AnimationEvent"in window||(delete Mn.animationend.animation,delete Mn.animationiteration.animation,delete Mn.animationstart.animation),"TransitionEvent"in window||delete Mn.transitionend.transition);function Sl(e){if(Si[e])return Si[e];if(!Mn[e])return e;var t=Mn[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in qc)return Si[e]=t[n];return e}var ed=Sl("animationend"),td=Sl("animationiteration"),nd=Sl("animationstart"),rd=Sl("transitionend"),od=new Map,Ta="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Qt(e,t){od.set(e,t),hn(t,[e])}for(Ao=0;Ao<Ta.length;Ao++)zo=Ta[Ao],Ra=zo.toLowerCase(),Ma=zo[0].toUpperCase()+zo.slice(1),Qt(Ra,"on"+Ma);var zo,Ra,Ma,Ao;Qt(ed,"onAnimationEnd");Qt(td,"onAnimationIteration");Qt(nd,"onAnimationStart");Qt("dblclick","onDoubleClick");Qt("focusin","onFocus");Qt("focusout","onBlur");Qt(rd,"onTransitionEnd");Qn("onMouseEnter",["mouseout","mouseover"]);Qn("onMouseLeave",["mouseout","mouseover"]);Qn("onPointerEnter",["pointerout","pointerover"]);Qn("onPointerLeave",["pointerout","pointerover"]);hn("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));hn("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));hn("onBeforeInput",["compositionend","keypress","textInput","paste"]);hn("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));hn("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));hn("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Sr="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),fm=new Set("cancel close invalid load scroll toggle".split(" ").concat(Sr));function Aa(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,fh(r,t,void 0,e),e.currentTarget=null}function ld(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],o=r.event;r=r.listeners;e:{var l=void 0;if(t)for(var i=r.length-1;0<=i;i--){var s=r[i],u=s.instance,d=s.currentTarget;if(s=s.listener,u!==l&&o.isPropagationStopped())break e;Aa(o,s,d),l=u}else for(i=0;i<r.length;i++){if(s=r[i],u=s.instance,d=s.currentTarget,s=s.listener,u!==l&&o.isPropagationStopped())break e;Aa(o,s,d),l=u}}}if(el)throw e=qi,el=!1,qi=null,e}function W(e,t){var n=t[as];n===void 0&&(n=t[as]=new Set);var r=e+"__bubble";n.has(r)||(id(t,e,2,!1),n.add(r))}function Di(e,t,n){var r=0;t&&(r|=4),id(n,e,r,t)}var Lo="_reactListening"+Math.random().toString(36).slice(2);function br(e){if(!e[Lo]){e[Lo]=!0,pc.forEach(function(n){n!=="selectionchange"&&(fm.has(n)||Di(n,!1,e),Di(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Lo]||(t[Lo]=!0,Di("selectionchange",!1,t))}}function id(e,t,n,r){switch(bc(t)){case 1:var o=Ph;break;case 4:o=Nh;break;default:o=js}n=o.bind(null,t,n,e),o=void 0,!Ji||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),r?o!==void 0?e.addEventListener(t,n,{capture:!0,passive:o}):e.addEventListener(t,n,!0):o!==void 0?e.addEventListener(t,n,{passive:o}):e.addEventListener(t,n,!1)}function Fi(e,t,n,r,o){var l=r;if((t&1)===0&&(t&2)===0&&r!==null)e:for(;;){if(r===null)return;var i=r.tag;if(i===3||i===4){var s=r.stateNode.containerInfo;if(s===o||s.nodeType===8&&s.parentNode===o)break;if(i===4)for(i=r.return;i!==null;){var u=i.tag;if((u===3||u===4)&&(u=i.stateNode.containerInfo,u===o||u.nodeType===8&&u.parentNode===o))return;i=i.return}for(;s!==null;){if(i=rn(s),i===null)return;if(u=i.tag,u===5||u===6){r=l=i;continue e}s=s.parentNode}}r=r.return}Nc(function(){var d=l,h=Is(n),m=[];e:{var f=od.get(e);if(f!==void 0){var g=Hs,w=e;switch(e){case"keypress":if(Vo(n)===0)break e;case"keydown":case"keyup":g=Vh;break;case"focusin":w="focus",g=xi;break;case"focusout":w="blur",g=xi;break;case"beforeblur":case"afterblur":g=xi;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":g=Ca;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":g=Mh;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":g=Kh;break;case ed:case td:case nd:g=Lh;break;case rd:g=Yh;break;case"scroll":g=Th;break;case"wheel":g=Xh;break;case"copy":case"cut":case"paste":g=$h;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":g=ka}var v=(t&4)!==0,C=!v&&e==="scroll",c=v?f!==null?f+"Capture":null:f;v=[];for(var a=d,p;a!==null;){p=a;var y=p.stateNode;if(p.tag===5&&y!==null&&(p=y,c!==null&&(y=$r(a,c),y!=null&&v.push(Vr(a,y,p)))),C)break;a=a.return}0<v.length&&(f=new g(f,w,null,n,h),m.push({event:f,listeners:v}))}}if((t&7)===0){e:{if(f=e==="mouseover"||e==="pointerover",g=e==="mouseout"||e==="pointerout",f&&n!==Zi&&(w=n.relatedTarget||n.fromElement)&&(rn(w)||w[vt]))break e;if((g||f)&&(f=h.window===h?h:(f=h.ownerDocument)?f.defaultView||f.parentWindow:window,g?(w=n.relatedTarget||n.toElement,g=d,w=w?rn(w):null,w!==null&&(C=mn(w),w!==C||w.tag!==5&&w.tag!==6)&&(w=null)):(g=null,w=d),g!==w)){if(v=Ca,y="onMouseLeave",c="onMouseEnter",a="mouse",(e==="pointerout"||e==="pointerover")&&(v=ka,y="onPointerLeave",c="onPointerEnter",a="pointer"),C=g==null?f:An(g),p=w==null?f:An(w),f=new v(y,a+"leave",g,n,h),f.target=C,f.relatedTarget=p,y=null,rn(h)===d&&(v=new v(c,a+"enter",w,n,h),v.target=p,v.relatedTarget=C,y=v),C=y,g&&w)t:{for(v=g,c=w,a=0,p=v;p;p=Fn(p))a++;for(p=0,y=c;y;y=Fn(y))p++;for(;0<a-p;)v=Fn(v),a--;for(;0<p-a;)c=Fn(c),p--;for(;a--;){if(v===c||c!==null&&v===c.alternate)break t;v=Fn(v),c=Fn(c)}v=null}else v=null;g!==null&&za(m,f,g,v,!1),w!==null&&C!==null&&za(m,C,w,v,!0)}}e:{if(f=d?An(d):window,g=f.nodeName&&f.nodeName.toLowerCase(),g==="select"||g==="input"&&f.type==="file")var k=om;else if(Sa(f))if(Yc)k=um;else{k=im;var S=lm}else(g=f.nodeName)&&g.toLowerCase()==="input"&&(f.type==="checkbox"||f.type==="radio")&&(k=sm);if(k&&(k=k(e,d))){Gc(m,k,n,h);break e}S&&S(e,f,d),e==="focusout"&&(S=f._wrapperState)&&S.controlled&&f.type==="number"&&Wi(f,"number",f.value)}switch(S=d?An(d):window,e){case"focusin":(Sa(S)||S.contentEditable==="true")&&(Rn=S,rs=d,Tr=null);break;case"focusout":Tr=rs=Rn=null;break;case"mousedown":os=!0;break;case"contextmenu":case"mouseup":case"dragend":os=!1,Na(m,n,h);break;case"selectionchange":if(dm)break;case"keydown":case"keyup":Na(m,n,h)}var F;if(Vs)e:{switch(e){case"compositionstart":var N="onCompositionStart";break e;case"compositionend":N="onCompositionEnd";break e;case"compositionupdate":N="onCompositionUpdate";break e}N=void 0}else Tn?Qc(e,n)&&(N="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(N="onCompositionStart");N&&(Wc&&n.locale!=="ko"&&(Tn||N!=="onCompositionStart"?N==="onCompositionEnd"&&Tn&&(F=Vc()):(zt=h,Us="value"in zt?zt.value:zt.textContent,Tn=!0)),S=ll(d,N),0<S.length&&(N=new _a(N,e,null,n,h),m.push({event:N,listeners:S}),F?N.data=F:(F=Kc(n),F!==null&&(N.data=F)))),(F=qh?em(e,n):tm(e,n))&&(d=ll(d,"onBeforeInput"),0<d.length&&(h=new _a("onBeforeInput","beforeinput",null,n,h),m.push({event:h,listeners:d}),h.data=F))}ld(m,t)})}function Vr(e,t,n){return{instance:e,listener:t,currentTarget:n}}function ll(e,t){for(var n=t+"Capture",r=[];e!==null;){var o=e,l=o.stateNode;o.tag===5&&l!==null&&(o=l,l=$r(e,n),l!=null&&r.unshift(Vr(e,l,o)),l=$r(e,t),l!=null&&r.push(Vr(e,l,o))),e=e.return}return r}function Fn(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function za(e,t,n,r,o){for(var l=t._reactName,i=[];n!==null&&n!==r;){var s=n,u=s.alternate,d=s.stateNode;if(u!==null&&u===r)break;s.tag===5&&d!==null&&(s=d,o?(u=$r(n,l),u!=null&&i.unshift(Vr(n,u,s))):o||(u=$r(n,l),u!=null&&i.push(Vr(n,u,s)))),n=n.return}i.length!==0&&e.push({event:t,listeners:i})}var pm=/\r\n?/g,hm=/\u0000|\uFFFD/g;function La(e){return(typeof e=="string"?e:""+e).replace(pm,`
`).replace(hm,"")}function Io(e,t,n){if(t=La(t),La(e)!==t&&n)throw Error(_(425))}function il(){}var ls=null,is=null;function ss(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var us=typeof setTimeout=="function"?setTimeout:void 0,mm=typeof clearTimeout=="function"?clearTimeout:void 0,Ia=typeof Promise=="function"?Promise:void 0,gm=typeof queueMicrotask=="function"?queueMicrotask:typeof Ia<"u"?function(e){return Ia.resolve(null).then(e).catch(vm)}:us;function vm(e){setTimeout(function(){throw e})}function Pi(e,t){var n=t,r=0;do{var o=n.nextSibling;if(e.removeChild(n),o&&o.nodeType===8)if(n=o.data,n==="/$"){if(r===0){e.removeChild(o),jr(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=o}while(n);jr(t)}function Bt(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function $a(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var er=Math.random().toString(36).slice(2),st="__reactFiber$"+er,Wr="__reactProps$"+er,vt="__reactContainer$"+er,as="__reactEvents$"+er,ym="__reactListeners$"+er,wm="__reactHandles$"+er;function rn(e){var t=e[st];if(t)return t;for(var n=e.parentNode;n;){if(t=n[vt]||n[st]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=$a(e);e!==null;){if(n=e[st])return n;e=$a(e)}return t}e=n,n=e.parentNode}return null}function eo(e){return e=e[st]||e[vt],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function An(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(_(33))}function Dl(e){return e[Wr]||null}var cs=[],zn=-1;function Kt(e){return{current:e}}function Q(e){0>zn||(e.current=cs[zn],cs[zn]=null,zn--)}function H(e,t){zn++,cs[zn]=e.current,e.current=t}var Wt={},ve=Kt(Wt),Se=Kt(!1),an=Wt;function Kn(e,t){var n=e.type.contextTypes;if(!n)return Wt;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var o={},l;for(l in n)o[l]=t[l];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=o),o}function De(e){return e=e.childContextTypes,e!=null}function sl(){Q(Se),Q(ve)}function Oa(e,t,n){if(ve.current!==Wt)throw Error(_(168));H(ve,t),H(Se,n)}function sd(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var o in r)if(!(o in t))throw Error(_(108,lh(e)||"Unknown",o));return X({},n,r)}function ul(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Wt,an=ve.current,H(ve,e),H(Se,Se.current),!0}function Ba(e,t,n){var r=e.stateNode;if(!r)throw Error(_(169));n?(e=sd(e,t,an),r.__reactInternalMemoizedMergedChildContext=e,Q(Se),Q(ve),H(ve,e)):Q(Se),H(Se,n)}var ft=null,Fl=!1,Ni=!1;function ud(e){ft===null?ft=[e]:ft.push(e)}function Cm(e){Fl=!0,ud(e)}function Gt(){if(!Ni&&ft!==null){Ni=!0;var e=0,t=O;try{var n=ft;for(O=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}ft=null,Fl=!1}catch(o){throw ft!==null&&(ft=ft.slice(e+1)),Ac($s,Gt),o}finally{O=t,Ni=!1}}return null}var Ln=[],In=0,al=null,cl=0,je=[],Ue=0,cn=null,pt=1,ht="";function tn(e,t){Ln[In++]=cl,Ln[In++]=al,al=e,cl=t}function ad(e,t,n){je[Ue++]=pt,je[Ue++]=ht,je[Ue++]=cn,cn=e;var r=pt;e=ht;var o=32-tt(r)-1;r&=~(1<<o),n+=1;var l=32-tt(t)+o;if(30<l){var i=o-o%5;l=(r&(1<<i)-1).toString(32),r>>=i,o-=i,pt=1<<32-tt(t)+o|n<<o|r,ht=l+e}else pt=1<<l|n<<o|r,ht=e}function Qs(e){e.return!==null&&(tn(e,1),ad(e,1,0))}function Ks(e){for(;e===al;)al=Ln[--In],Ln[In]=null,cl=Ln[--In],Ln[In]=null;for(;e===cn;)cn=je[--Ue],je[Ue]=null,ht=je[--Ue],je[Ue]=null,pt=je[--Ue],je[Ue]=null}var Me=null,Re=null,K=!1,et=null;function cd(e,t){var n=He(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function ja(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,Me=e,Re=Bt(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,Me=e,Re=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=cn!==null?{id:pt,overflow:ht}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=He(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,Me=e,Re=null,!0):!1;default:return!1}}function ds(e){return(e.mode&1)!==0&&(e.flags&128)===0}function fs(e){if(K){var t=Re;if(t){var n=t;if(!ja(e,t)){if(ds(e))throw Error(_(418));t=Bt(n.nextSibling);var r=Me;t&&ja(e,t)?cd(r,n):(e.flags=e.flags&-4097|2,K=!1,Me=e)}}else{if(ds(e))throw Error(_(418));e.flags=e.flags&-4097|2,K=!1,Me=e}}}function Ua(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;Me=e}function $o(e){if(e!==Me)return!1;if(!K)return Ua(e),K=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!ss(e.type,e.memoizedProps)),t&&(t=Re)){if(ds(e))throw dd(),Error(_(418));for(;t;)cd(e,t),t=Bt(t.nextSibling)}if(Ua(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(_(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){Re=Bt(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}Re=null}}else Re=Me?Bt(e.stateNode.nextSibling):null;return!0}function dd(){for(var e=Re;e;)e=Bt(e.nextSibling)}function Gn(){Re=Me=null,K=!1}function Gs(e){et===null?et=[e]:et.push(e)}var _m=Ct.ReactCurrentBatchConfig;function yr(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(_(309));var r=n.stateNode}if(!r)throw Error(_(147,e));var o=r,l=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===l?t.ref:(t=function(i){var s=o.refs;i===null?delete s[l]:s[l]=i},t._stringRef=l,t)}if(typeof e!="string")throw Error(_(284));if(!n._owner)throw Error(_(290,e))}return e}function Oo(e,t){throw e=Object.prototype.toString.call(t),Error(_(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function Ha(e){var t=e._init;return t(e._payload)}function fd(e){function t(c,a){if(e){var p=c.deletions;p===null?(c.deletions=[a],c.flags|=16):p.push(a)}}function n(c,a){if(!e)return null;for(;a!==null;)t(c,a),a=a.sibling;return null}function r(c,a){for(c=new Map;a!==null;)a.key!==null?c.set(a.key,a):c.set(a.index,a),a=a.sibling;return c}function o(c,a){return c=bt(c,a),c.index=0,c.sibling=null,c}function l(c,a,p){return c.index=p,e?(p=c.alternate,p!==null?(p=p.index,p<a?(c.flags|=2,a):p):(c.flags|=2,a)):(c.flags|=1048576,a)}function i(c){return e&&c.alternate===null&&(c.flags|=2),c}function s(c,a,p,y){return a===null||a.tag!==6?(a=Ii(p,c.mode,y),a.return=c,a):(a=o(a,p),a.return=c,a)}function u(c,a,p,y){var k=p.type;return k===Nn?h(c,a,p.props.children,y,p.key):a!==null&&(a.elementType===k||typeof k=="object"&&k!==null&&k.$$typeof===Tt&&Ha(k)===a.type)?(y=o(a,p.props),y.ref=yr(c,a,p),y.return=c,y):(y=Xo(p.type,p.key,p.props,null,c.mode,y),y.ref=yr(c,a,p),y.return=c,y)}function d(c,a,p,y){return a===null||a.tag!==4||a.stateNode.containerInfo!==p.containerInfo||a.stateNode.implementation!==p.implementation?(a=$i(p,c.mode,y),a.return=c,a):(a=o(a,p.children||[]),a.return=c,a)}function h(c,a,p,y,k){return a===null||a.tag!==7?(a=un(p,c.mode,y,k),a.return=c,a):(a=o(a,p),a.return=c,a)}function m(c,a,p){if(typeof a=="string"&&a!==""||typeof a=="number")return a=Ii(""+a,c.mode,p),a.return=c,a;if(typeof a=="object"&&a!==null){switch(a.$$typeof){case xo:return p=Xo(a.type,a.key,a.props,null,c.mode,p),p.ref=yr(c,null,a),p.return=c,p;case Pn:return a=$i(a,c.mode,p),a.return=c,a;case Tt:var y=a._init;return m(c,y(a._payload),p)}if(xr(a)||hr(a))return a=un(a,c.mode,p,null),a.return=c,a;Oo(c,a)}return null}function f(c,a,p,y){var k=a!==null?a.key:null;if(typeof p=="string"&&p!==""||typeof p=="number")return k!==null?null:s(c,a,""+p,y);if(typeof p=="object"&&p!==null){switch(p.$$typeof){case xo:return p.key===k?u(c,a,p,y):null;case Pn:return p.key===k?d(c,a,p,y):null;case Tt:return k=p._init,f(c,a,k(p._payload),y)}if(xr(p)||hr(p))return k!==null?null:h(c,a,p,y,null);Oo(c,p)}return null}function g(c,a,p,y,k){if(typeof y=="string"&&y!==""||typeof y=="number")return c=c.get(p)||null,s(a,c,""+y,k);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case xo:return c=c.get(y.key===null?p:y.key)||null,u(a,c,y,k);case Pn:return c=c.get(y.key===null?p:y.key)||null,d(a,c,y,k);case Tt:var S=y._init;return g(c,a,p,S(y._payload),k)}if(xr(y)||hr(y))return c=c.get(p)||null,h(a,c,y,k,null);Oo(a,y)}return null}function w(c,a,p,y){for(var k=null,S=null,F=a,N=a=0,V=null;F!==null&&N<p.length;N++){F.index>N?(V=F,F=null):V=F.sibling;var R=f(c,F,p[N],y);if(R===null){F===null&&(F=V);break}e&&F&&R.alternate===null&&t(c,F),a=l(R,a,N),S===null?k=R:S.sibling=R,S=R,F=V}if(N===p.length)return n(c,F),K&&tn(c,N),k;if(F===null){for(;N<p.length;N++)F=m(c,p[N],y),F!==null&&(a=l(F,a,N),S===null?k=F:S.sibling=F,S=F);return K&&tn(c,N),k}for(F=r(c,F);N<p.length;N++)V=g(F,c,N,p[N],y),V!==null&&(e&&V.alternate!==null&&F.delete(V.key===null?N:V.key),a=l(V,a,N),S===null?k=V:S.sibling=V,S=V);return e&&F.forEach(function(ee){return t(c,ee)}),K&&tn(c,N),k}function v(c,a,p,y){var k=hr(p);if(typeof k!="function")throw Error(_(150));if(p=k.call(p),p==null)throw Error(_(151));for(var S=k=null,F=a,N=a=0,V=null,R=p.next();F!==null&&!R.done;N++,R=p.next()){F.index>N?(V=F,F=null):V=F.sibling;var ee=f(c,F,R.value,y);if(ee===null){F===null&&(F=V);break}e&&F&&ee.alternate===null&&t(c,F),a=l(ee,a,N),S===null?k=ee:S.sibling=ee,S=ee,F=V}if(R.done)return n(c,F),K&&tn(c,N),k;if(F===null){for(;!R.done;N++,R=p.next())R=m(c,R.value,y),R!==null&&(a=l(R,a,N),S===null?k=R:S.sibling=R,S=R);return K&&tn(c,N),k}for(F=r(c,F);!R.done;N++,R=p.next())R=g(F,c,N,R.value,y),R!==null&&(e&&R.alternate!==null&&F.delete(R.key===null?N:R.key),a=l(R,a,N),S===null?k=R:S.sibling=R,S=R);return e&&F.forEach(function(Zt){return t(c,Zt)}),K&&tn(c,N),k}function C(c,a,p,y){if(typeof p=="object"&&p!==null&&p.type===Nn&&p.key===null&&(p=p.props.children),typeof p=="object"&&p!==null){switch(p.$$typeof){case xo:e:{for(var k=p.key,S=a;S!==null;){if(S.key===k){if(k=p.type,k===Nn){if(S.tag===7){n(c,S.sibling),a=o(S,p.props.children),a.return=c,c=a;break e}}else if(S.elementType===k||typeof k=="object"&&k!==null&&k.$$typeof===Tt&&Ha(k)===S.type){n(c,S.sibling),a=o(S,p.props),a.ref=yr(c,S,p),a.return=c,c=a;break e}n(c,S);break}else t(c,S);S=S.sibling}p.type===Nn?(a=un(p.props.children,c.mode,y,p.key),a.return=c,c=a):(y=Xo(p.type,p.key,p.props,null,c.mode,y),y.ref=yr(c,a,p),y.return=c,c=y)}return i(c);case Pn:e:{for(S=p.key;a!==null;){if(a.key===S)if(a.tag===4&&a.stateNode.containerInfo===p.containerInfo&&a.stateNode.implementation===p.implementation){n(c,a.sibling),a=o(a,p.children||[]),a.return=c,c=a;break e}else{n(c,a);break}else t(c,a);a=a.sibling}a=$i(p,c.mode,y),a.return=c,c=a}return i(c);case Tt:return S=p._init,C(c,a,S(p._payload),y)}if(xr(p))return w(c,a,p,y);if(hr(p))return v(c,a,p,y);Oo(c,p)}return typeof p=="string"&&p!==""||typeof p=="number"?(p=""+p,a!==null&&a.tag===6?(n(c,a.sibling),a=o(a,p),a.return=c,c=a):(n(c,a),a=Ii(p,c.mode,y),a.return=c,c=a),i(c)):n(c,a)}return C}var Yn=fd(!0),pd=fd(!1),dl=Kt(null),fl=null,$n=null,Ys=null;function Zs(){Ys=$n=fl=null}function Xs(e){var t=dl.current;Q(dl),e._currentValue=t}function ps(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function Vn(e,t){fl=e,Ys=$n=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&t)!==0&&(Ee=!0),e.firstContext=null)}function Ve(e){var t=e._currentValue;if(Ys!==e)if(e={context:e,memoizedValue:t,next:null},$n===null){if(fl===null)throw Error(_(308));$n=e,fl.dependencies={lanes:0,firstContext:e}}else $n=$n.next=e;return t}var on=null;function Js(e){on===null?on=[e]:on.push(e)}function hd(e,t,n,r){var o=t.interleaved;return o===null?(n.next=n,Js(t)):(n.next=o.next,o.next=n),t.interleaved=n,yt(e,r)}function yt(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var Rt=!1;function qs(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function md(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function mt(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function jt(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,(L&2)!==0){var o=r.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),r.pending=t,yt(e,n)}return o=r.interleaved,o===null?(t.next=t,Js(r)):(t.next=o.next,o.next=t),r.interleaved=t,yt(e,n)}function Wo(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Os(e,n)}}function ba(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var o=null,l=null;if(n=n.firstBaseUpdate,n!==null){do{var i={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};l===null?o=l=i:l=l.next=i,n=n.next}while(n!==null);l===null?o=l=t:l=l.next=t}else o=l=t;n={baseState:r.baseState,firstBaseUpdate:o,lastBaseUpdate:l,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function pl(e,t,n,r){var o=e.updateQueue;Rt=!1;var l=o.firstBaseUpdate,i=o.lastBaseUpdate,s=o.shared.pending;if(s!==null){o.shared.pending=null;var u=s,d=u.next;u.next=null,i===null?l=d:i.next=d,i=u;var h=e.alternate;h!==null&&(h=h.updateQueue,s=h.lastBaseUpdate,s!==i&&(s===null?h.firstBaseUpdate=d:s.next=d,h.lastBaseUpdate=u))}if(l!==null){var m=o.baseState;i=0,h=d=u=null,s=l;do{var f=s.lane,g=s.eventTime;if((r&f)===f){h!==null&&(h=h.next={eventTime:g,lane:0,tag:s.tag,payload:s.payload,callback:s.callback,next:null});e:{var w=e,v=s;switch(f=t,g=n,v.tag){case 1:if(w=v.payload,typeof w=="function"){m=w.call(g,m,f);break e}m=w;break e;case 3:w.flags=w.flags&-65537|128;case 0:if(w=v.payload,f=typeof w=="function"?w.call(g,m,f):w,f==null)break e;m=X({},m,f);break e;case 2:Rt=!0}}s.callback!==null&&s.lane!==0&&(e.flags|=64,f=o.effects,f===null?o.effects=[s]:f.push(s))}else g={eventTime:g,lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},h===null?(d=h=g,u=m):h=h.next=g,i|=f;if(s=s.next,s===null){if(s=o.shared.pending,s===null)break;f=s,s=f.next,f.next=null,o.lastBaseUpdate=f,o.shared.pending=null}}while(!0);if(h===null&&(u=m),o.baseState=u,o.firstBaseUpdate=d,o.lastBaseUpdate=h,t=o.shared.interleaved,t!==null){o=t;do i|=o.lane,o=o.next;while(o!==t)}else l===null&&(o.shared.lanes=0);fn|=i,e.lanes=i,e.memoizedState=m}}function Va(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],o=r.callback;if(o!==null){if(r.callback=null,r=n,typeof o!="function")throw Error(_(191,o));o.call(r)}}}var to={},at=Kt(to),Qr=Kt(to),Kr=Kt(to);function ln(e){if(e===to)throw Error(_(174));return e}function eu(e,t){switch(H(Kr,t),H(Qr,e),H(at,to),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:Ki(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=Ki(t,e)}Q(at),H(at,t)}function Zn(){Q(at),Q(Qr),Q(Kr)}function gd(e){ln(Kr.current);var t=ln(at.current),n=Ki(t,e.type);t!==n&&(H(Qr,e),H(at,n))}function tu(e){Qr.current===e&&(Q(at),Q(Qr))}var Y=Kt(0);function hl(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Ti=[];function nu(){for(var e=0;e<Ti.length;e++)Ti[e]._workInProgressVersionPrimary=null;Ti.length=0}var Qo=Ct.ReactCurrentDispatcher,Ri=Ct.ReactCurrentBatchConfig,dn=0,Z=null,re=null,se=null,ml=!1,Rr=!1,Gr=0,km=0;function he(){throw Error(_(321))}function ru(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!rt(e[n],t[n]))return!1;return!0}function ou(e,t,n,r,o,l){if(dn=l,Z=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Qo.current=e===null||e.memoizedState===null?Dm:Fm,e=n(r,o),Rr){l=0;do{if(Rr=!1,Gr=0,25<=l)throw Error(_(301));l+=1,se=re=null,t.updateQueue=null,Qo.current=Pm,e=n(r,o)}while(Rr)}if(Qo.current=gl,t=re!==null&&re.next!==null,dn=0,se=re=Z=null,ml=!1,t)throw Error(_(300));return e}function lu(){var e=Gr!==0;return Gr=0,e}function it(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return se===null?Z.memoizedState=se=e:se=se.next=e,se}function We(){if(re===null){var e=Z.alternate;e=e!==null?e.memoizedState:null}else e=re.next;var t=se===null?Z.memoizedState:se.next;if(t!==null)se=t,re=e;else{if(e===null)throw Error(_(310));re=e,e={memoizedState:re.memoizedState,baseState:re.baseState,baseQueue:re.baseQueue,queue:re.queue,next:null},se===null?Z.memoizedState=se=e:se=se.next=e}return se}function Yr(e,t){return typeof t=="function"?t(e):t}function Mi(e){var t=We(),n=t.queue;if(n===null)throw Error(_(311));n.lastRenderedReducer=e;var r=re,o=r.baseQueue,l=n.pending;if(l!==null){if(o!==null){var i=o.next;o.next=l.next,l.next=i}r.baseQueue=o=l,n.pending=null}if(o!==null){l=o.next,r=r.baseState;var s=i=null,u=null,d=l;do{var h=d.lane;if((dn&h)===h)u!==null&&(u=u.next={lane:0,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null}),r=d.hasEagerState?d.eagerState:e(r,d.action);else{var m={lane:h,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null};u===null?(s=u=m,i=r):u=u.next=m,Z.lanes|=h,fn|=h}d=d.next}while(d!==null&&d!==l);u===null?i=r:u.next=s,rt(r,t.memoizedState)||(Ee=!0),t.memoizedState=r,t.baseState=i,t.baseQueue=u,n.lastRenderedState=r}if(e=n.interleaved,e!==null){o=e;do l=o.lane,Z.lanes|=l,fn|=l,o=o.next;while(o!==e)}else o===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function Ai(e){var t=We(),n=t.queue;if(n===null)throw Error(_(311));n.lastRenderedReducer=e;var r=n.dispatch,o=n.pending,l=t.memoizedState;if(o!==null){n.pending=null;var i=o=o.next;do l=e(l,i.action),i=i.next;while(i!==o);rt(l,t.memoizedState)||(Ee=!0),t.memoizedState=l,t.baseQueue===null&&(t.baseState=l),n.lastRenderedState=l}return[l,r]}function vd(){}function yd(e,t){var n=Z,r=We(),o=t(),l=!rt(r.memoizedState,o);if(l&&(r.memoizedState=o,Ee=!0),r=r.queue,iu(_d.bind(null,n,r,e),[e]),r.getSnapshot!==t||l||se!==null&&se.memoizedState.tag&1){if(n.flags|=2048,Zr(9,Cd.bind(null,n,r,o,t),void 0,null),ue===null)throw Error(_(349));(dn&30)!==0||wd(n,t,o)}return o}function wd(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Z.updateQueue,t===null?(t={lastEffect:null,stores:null},Z.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Cd(e,t,n,r){t.value=n,t.getSnapshot=r,kd(t)&&xd(e)}function _d(e,t,n){return n(function(){kd(t)&&xd(e)})}function kd(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!rt(e,n)}catch{return!0}}function xd(e){var t=yt(e,1);t!==null&&nt(t,e,1,-1)}function Wa(e){var t=it();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Yr,lastRenderedState:e},t.queue=e,e=e.dispatch=Sm.bind(null,Z,e),[t.memoizedState,e]}function Zr(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=Z.updateQueue,t===null?(t={lastEffect:null,stores:null},Z.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function Ed(){return We().memoizedState}function Ko(e,t,n,r){var o=it();Z.flags|=e,o.memoizedState=Zr(1|t,n,void 0,r===void 0?null:r)}function Pl(e,t,n,r){var o=We();r=r===void 0?null:r;var l=void 0;if(re!==null){var i=re.memoizedState;if(l=i.destroy,r!==null&&ru(r,i.deps)){o.memoizedState=Zr(t,n,l,r);return}}Z.flags|=e,o.memoizedState=Zr(1|t,n,l,r)}function Qa(e,t){return Ko(8390656,8,e,t)}function iu(e,t){return Pl(2048,8,e,t)}function Sd(e,t){return Pl(4,2,e,t)}function Dd(e,t){return Pl(4,4,e,t)}function Fd(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Pd(e,t,n){return n=n!=null?n.concat([e]):null,Pl(4,4,Fd.bind(null,t,e),n)}function su(){}function Nd(e,t){var n=We();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&ru(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Td(e,t){var n=We();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&ru(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function Rd(e,t,n){return(dn&21)===0?(e.baseState&&(e.baseState=!1,Ee=!0),e.memoizedState=n):(rt(n,t)||(n=Ic(),Z.lanes|=n,fn|=n,e.baseState=!0),t)}function xm(e,t){var n=O;O=n!==0&&4>n?n:4,e(!0);var r=Ri.transition;Ri.transition={};try{e(!1),t()}finally{O=n,Ri.transition=r}}function Md(){return We().memoizedState}function Em(e,t,n){var r=Ht(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},Ad(e))zd(t,n);else if(n=hd(e,t,n,r),n!==null){var o=Ce();nt(n,e,r,o),Ld(n,t,r)}}function Sm(e,t,n){var r=Ht(e),o={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(Ad(e))zd(t,o);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=t.lastRenderedReducer,l!==null))try{var i=t.lastRenderedState,s=l(i,n);if(o.hasEagerState=!0,o.eagerState=s,rt(s,i)){var u=t.interleaved;u===null?(o.next=o,Js(t)):(o.next=u.next,u.next=o),t.interleaved=o;return}}catch{}finally{}n=hd(e,t,o,r),n!==null&&(o=Ce(),nt(n,e,r,o),Ld(n,t,r))}}function Ad(e){var t=e.alternate;return e===Z||t!==null&&t===Z}function zd(e,t){Rr=ml=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Ld(e,t,n){if((n&4194240)!==0){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Os(e,n)}}var gl={readContext:Ve,useCallback:he,useContext:he,useEffect:he,useImperativeHandle:he,useInsertionEffect:he,useLayoutEffect:he,useMemo:he,useReducer:he,useRef:he,useState:he,useDebugValue:he,useDeferredValue:he,useTransition:he,useMutableSource:he,useSyncExternalStore:he,useId:he,unstable_isNewReconciler:!1},Dm={readContext:Ve,useCallback:function(e,t){return it().memoizedState=[e,t===void 0?null:t],e},useContext:Ve,useEffect:Qa,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Ko(4194308,4,Fd.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Ko(4194308,4,e,t)},useInsertionEffect:function(e,t){return Ko(4,2,e,t)},useMemo:function(e,t){var n=it();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=it();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=Em.bind(null,Z,e),[r.memoizedState,e]},useRef:function(e){var t=it();return e={current:e},t.memoizedState=e},useState:Wa,useDebugValue:su,useDeferredValue:function(e){return it().memoizedState=e},useTransition:function(){var e=Wa(!1),t=e[0];return e=xm.bind(null,e[1]),it().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=Z,o=it();if(K){if(n===void 0)throw Error(_(407));n=n()}else{if(n=t(),ue===null)throw Error(_(349));(dn&30)!==0||wd(r,t,n)}o.memoizedState=n;var l={value:n,getSnapshot:t};return o.queue=l,Qa(_d.bind(null,r,l,e),[e]),r.flags|=2048,Zr(9,Cd.bind(null,r,l,n,t),void 0,null),n},useId:function(){var e=it(),t=ue.identifierPrefix;if(K){var n=ht,r=pt;n=(r&~(1<<32-tt(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=Gr++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=km++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},Fm={readContext:Ve,useCallback:Nd,useContext:Ve,useEffect:iu,useImperativeHandle:Pd,useInsertionEffect:Sd,useLayoutEffect:Dd,useMemo:Td,useReducer:Mi,useRef:Ed,useState:function(){return Mi(Yr)},useDebugValue:su,useDeferredValue:function(e){var t=We();return Rd(t,re.memoizedState,e)},useTransition:function(){var e=Mi(Yr)[0],t=We().memoizedState;return[e,t]},useMutableSource:vd,useSyncExternalStore:yd,useId:Md,unstable_isNewReconciler:!1},Pm={readContext:Ve,useCallback:Nd,useContext:Ve,useEffect:iu,useImperativeHandle:Pd,useInsertionEffect:Sd,useLayoutEffect:Dd,useMemo:Td,useReducer:Ai,useRef:Ed,useState:function(){return Ai(Yr)},useDebugValue:su,useDeferredValue:function(e){var t=We();return re===null?t.memoizedState=e:Rd(t,re.memoizedState,e)},useTransition:function(){var e=Ai(Yr)[0],t=We().memoizedState;return[e,t]},useMutableSource:vd,useSyncExternalStore:yd,useId:Md,unstable_isNewReconciler:!1};function Je(e,t){if(e&&e.defaultProps){t=X({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function hs(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:X({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Nl={isMounted:function(e){return(e=e._reactInternals)?mn(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=Ce(),o=Ht(e),l=mt(r,o);l.payload=t,n!=null&&(l.callback=n),t=jt(e,l,o),t!==null&&(nt(t,e,o,r),Wo(t,e,o))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=Ce(),o=Ht(e),l=mt(r,o);l.tag=1,l.payload=t,n!=null&&(l.callback=n),t=jt(e,l,o),t!==null&&(nt(t,e,o,r),Wo(t,e,o))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=Ce(),r=Ht(e),o=mt(n,r);o.tag=2,t!=null&&(o.callback=t),t=jt(e,o,r),t!==null&&(nt(t,e,r,n),Wo(t,e,r))}};function Ka(e,t,n,r,o,l,i){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,l,i):t.prototype&&t.prototype.isPureReactComponent?!Hr(n,r)||!Hr(o,l):!0}function Id(e,t,n){var r=!1,o=Wt,l=t.contextType;return typeof l=="object"&&l!==null?l=Ve(l):(o=De(t)?an:ve.current,r=t.contextTypes,l=(r=r!=null)?Kn(e,o):Wt),t=new t(n,l),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Nl,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=o,e.__reactInternalMemoizedMaskedChildContext=l),t}function Ga(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Nl.enqueueReplaceState(t,t.state,null)}function ms(e,t,n,r){var o=e.stateNode;o.props=n,o.state=e.memoizedState,o.refs={},qs(e);var l=t.contextType;typeof l=="object"&&l!==null?o.context=Ve(l):(l=De(t)?an:ve.current,o.context=Kn(e,l)),o.state=e.memoizedState,l=t.getDerivedStateFromProps,typeof l=="function"&&(hs(e,t,l,n),o.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof o.getSnapshotBeforeUpdate=="function"||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(t=o.state,typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount(),t!==o.state&&Nl.enqueueReplaceState(o,o.state,null),pl(e,n,o,r),o.state=e.memoizedState),typeof o.componentDidMount=="function"&&(e.flags|=4194308)}function Xn(e,t){try{var n="",r=t;do n+=oh(r),r=r.return;while(r);var o=n}catch(l){o=`
Error generating stack: `+l.message+`
`+l.stack}return{value:e,source:t,stack:o,digest:null}}function zi(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function gs(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var Nm=typeof WeakMap=="function"?WeakMap:Map;function $d(e,t,n){n=mt(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){yl||(yl=!0,Ds=r),gs(e,t)},n}function Od(e,t,n){n=mt(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var o=t.value;n.payload=function(){return r(o)},n.callback=function(){gs(e,t)}}var l=e.stateNode;return l!==null&&typeof l.componentDidCatch=="function"&&(n.callback=function(){gs(e,t),typeof r!="function"&&(Ut===null?Ut=new Set([this]):Ut.add(this));var i=t.stack;this.componentDidCatch(t.value,{componentStack:i!==null?i:""})}),n}function Ya(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Nm;var o=new Set;r.set(t,o)}else o=r.get(t),o===void 0&&(o=new Set,r.set(t,o));o.has(n)||(o.add(n),e=bm.bind(null,e,t,n),t.then(e,e))}function Za(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function Xa(e,t,n,r,o){return(e.mode&1)===0?(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=mt(-1,1),t.tag=2,jt(n,t,1))),n.lanes|=1),e):(e.flags|=65536,e.lanes=o,e)}var Tm=Ct.ReactCurrentOwner,Ee=!1;function we(e,t,n,r){t.child=e===null?pd(t,null,n,r):Yn(t,e.child,n,r)}function Ja(e,t,n,r,o){n=n.render;var l=t.ref;return Vn(t,o),r=ou(e,t,n,r,l,o),n=lu(),e!==null&&!Ee?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~o,wt(e,t,o)):(K&&n&&Qs(t),t.flags|=1,we(e,t,r,o),t.child)}function qa(e,t,n,r,o){if(e===null){var l=n.type;return typeof l=="function"&&!mu(l)&&l.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=l,Bd(e,t,l,r,o)):(e=Xo(n.type,null,r,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(l=e.child,(e.lanes&o)===0){var i=l.memoizedProps;if(n=n.compare,n=n!==null?n:Hr,n(i,r)&&e.ref===t.ref)return wt(e,t,o)}return t.flags|=1,e=bt(l,r),e.ref=t.ref,e.return=t,t.child=e}function Bd(e,t,n,r,o){if(e!==null){var l=e.memoizedProps;if(Hr(l,r)&&e.ref===t.ref)if(Ee=!1,t.pendingProps=r=l,(e.lanes&o)!==0)(e.flags&131072)!==0&&(Ee=!0);else return t.lanes=e.lanes,wt(e,t,o)}return vs(e,t,n,r,o)}function jd(e,t,n){var r=t.pendingProps,o=r.children,l=e!==null?e.memoizedState:null;if(r.mode==="hidden")if((t.mode&1)===0)t.memoizedState={baseLanes:0,cachePool:null,transitions:null},H(Bn,Te),Te|=n;else{if((n&1073741824)===0)return e=l!==null?l.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,H(Bn,Te),Te|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=l!==null?l.baseLanes:n,H(Bn,Te),Te|=r}else l!==null?(r=l.baseLanes|n,t.memoizedState=null):r=n,H(Bn,Te),Te|=r;return we(e,t,o,n),t.child}function Ud(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function vs(e,t,n,r,o){var l=De(n)?an:ve.current;return l=Kn(t,l),Vn(t,o),n=ou(e,t,n,r,l,o),r=lu(),e!==null&&!Ee?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~o,wt(e,t,o)):(K&&r&&Qs(t),t.flags|=1,we(e,t,n,o),t.child)}function ec(e,t,n,r,o){if(De(n)){var l=!0;ul(t)}else l=!1;if(Vn(t,o),t.stateNode===null)Go(e,t),Id(t,n,r),ms(t,n,r,o),r=!0;else if(e===null){var i=t.stateNode,s=t.memoizedProps;i.props=s;var u=i.context,d=n.contextType;typeof d=="object"&&d!==null?d=Ve(d):(d=De(n)?an:ve.current,d=Kn(t,d));var h=n.getDerivedStateFromProps,m=typeof h=="function"||typeof i.getSnapshotBeforeUpdate=="function";m||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(s!==r||u!==d)&&Ga(t,i,r,d),Rt=!1;var f=t.memoizedState;i.state=f,pl(t,r,i,o),u=t.memoizedState,s!==r||f!==u||Se.current||Rt?(typeof h=="function"&&(hs(t,n,h,r),u=t.memoizedState),(s=Rt||Ka(t,n,s,r,f,u,d))?(m||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(t.flags|=4194308)):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=u),i.props=r,i.state=u,i.context=d,r=s):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{i=t.stateNode,md(e,t),s=t.memoizedProps,d=t.type===t.elementType?s:Je(t.type,s),i.props=d,m=t.pendingProps,f=i.context,u=n.contextType,typeof u=="object"&&u!==null?u=Ve(u):(u=De(n)?an:ve.current,u=Kn(t,u));var g=n.getDerivedStateFromProps;(h=typeof g=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(s!==m||f!==u)&&Ga(t,i,r,u),Rt=!1,f=t.memoizedState,i.state=f,pl(t,r,i,o);var w=t.memoizedState;s!==m||f!==w||Se.current||Rt?(typeof g=="function"&&(hs(t,n,g,r),w=t.memoizedState),(d=Rt||Ka(t,n,d,r,f,w,u)||!1)?(h||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(r,w,u),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(r,w,u)),typeof i.componentDidUpdate=="function"&&(t.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof i.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=w),i.props=r,i.state=w,i.context=u,r=d):(typeof i.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return ys(e,t,n,r,l,o)}function ys(e,t,n,r,o,l){Ud(e,t);var i=(t.flags&128)!==0;if(!r&&!i)return o&&Ba(t,n,!1),wt(e,t,l);r=t.stateNode,Tm.current=t;var s=i&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&i?(t.child=Yn(t,e.child,null,l),t.child=Yn(t,null,s,l)):we(e,t,s,l),t.memoizedState=r.state,o&&Ba(t,n,!0),t.child}function Hd(e){var t=e.stateNode;t.pendingContext?Oa(e,t.pendingContext,t.pendingContext!==t.context):t.context&&Oa(e,t.context,!1),eu(e,t.containerInfo)}function tc(e,t,n,r,o){return Gn(),Gs(o),t.flags|=256,we(e,t,n,r),t.child}var ws={dehydrated:null,treeContext:null,retryLane:0};function Cs(e){return{baseLanes:e,cachePool:null,transitions:null}}function bd(e,t,n){var r=t.pendingProps,o=Y.current,l=!1,i=(t.flags&128)!==0,s;if((s=i)||(s=e!==null&&e.memoizedState===null?!1:(o&2)!==0),s?(l=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(o|=1),H(Y,o&1),e===null)return fs(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?((t.mode&1)===0?t.lanes=1:e.data==="$!"?t.lanes=8:t.lanes=1073741824,null):(i=r.children,e=r.fallback,l?(r=t.mode,l=t.child,i={mode:"hidden",children:i},(r&1)===0&&l!==null?(l.childLanes=0,l.pendingProps=i):l=Ml(i,r,0,null),e=un(e,r,n,null),l.return=t,e.return=t,l.sibling=e,t.child=l,t.child.memoizedState=Cs(n),t.memoizedState=ws,e):uu(t,i));if(o=e.memoizedState,o!==null&&(s=o.dehydrated,s!==null))return Rm(e,t,i,r,s,o,n);if(l){l=r.fallback,i=t.mode,o=e.child,s=o.sibling;var u={mode:"hidden",children:r.children};return(i&1)===0&&t.child!==o?(r=t.child,r.childLanes=0,r.pendingProps=u,t.deletions=null):(r=bt(o,u),r.subtreeFlags=o.subtreeFlags&14680064),s!==null?l=bt(s,l):(l=un(l,i,n,null),l.flags|=2),l.return=t,r.return=t,r.sibling=l,t.child=r,r=l,l=t.child,i=e.child.memoizedState,i=i===null?Cs(n):{baseLanes:i.baseLanes|n,cachePool:null,transitions:i.transitions},l.memoizedState=i,l.childLanes=e.childLanes&~n,t.memoizedState=ws,r}return l=e.child,e=l.sibling,r=bt(l,{mode:"visible",children:r.children}),(t.mode&1)===0&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function uu(e,t){return t=Ml({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Bo(e,t,n,r){return r!==null&&Gs(r),Yn(t,e.child,null,n),e=uu(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Rm(e,t,n,r,o,l,i){if(n)return t.flags&256?(t.flags&=-257,r=zi(Error(_(422))),Bo(e,t,i,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(l=r.fallback,o=t.mode,r=Ml({mode:"visible",children:r.children},o,0,null),l=un(l,o,i,null),l.flags|=2,r.return=t,l.return=t,r.sibling=l,t.child=r,(t.mode&1)!==0&&Yn(t,e.child,null,i),t.child.memoizedState=Cs(i),t.memoizedState=ws,l);if((t.mode&1)===0)return Bo(e,t,i,null);if(o.data==="$!"){if(r=o.nextSibling&&o.nextSibling.dataset,r)var s=r.dgst;return r=s,l=Error(_(419)),r=zi(l,r,void 0),Bo(e,t,i,r)}if(s=(i&e.childLanes)!==0,Ee||s){if(r=ue,r!==null){switch(i&-i){case 4:o=2;break;case 16:o=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:o=32;break;case 536870912:o=268435456;break;default:o=0}o=(o&(r.suspendedLanes|i))!==0?0:o,o!==0&&o!==l.retryLane&&(l.retryLane=o,yt(e,o),nt(r,e,o,-1))}return hu(),r=zi(Error(_(421))),Bo(e,t,i,r)}return o.data==="$?"?(t.flags|=128,t.child=e.child,t=Vm.bind(null,e),o._reactRetry=t,null):(e=l.treeContext,Re=Bt(o.nextSibling),Me=t,K=!0,et=null,e!==null&&(je[Ue++]=pt,je[Ue++]=ht,je[Ue++]=cn,pt=e.id,ht=e.overflow,cn=t),t=uu(t,r.children),t.flags|=4096,t)}function nc(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),ps(e.return,t,n)}function Li(e,t,n,r,o){var l=e.memoizedState;l===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:o}:(l.isBackwards=t,l.rendering=null,l.renderingStartTime=0,l.last=r,l.tail=n,l.tailMode=o)}function Vd(e,t,n){var r=t.pendingProps,o=r.revealOrder,l=r.tail;if(we(e,t,r.children,n),r=Y.current,(r&2)!==0)r=r&1|2,t.flags|=128;else{if(e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&nc(e,n,t);else if(e.tag===19)nc(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(H(Y,r),(t.mode&1)===0)t.memoizedState=null;else switch(o){case"forwards":for(n=t.child,o=null;n!==null;)e=n.alternate,e!==null&&hl(e)===null&&(o=n),n=n.sibling;n=o,n===null?(o=t.child,t.child=null):(o=n.sibling,n.sibling=null),Li(t,!1,o,n,l);break;case"backwards":for(n=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&hl(e)===null){t.child=o;break}e=o.sibling,o.sibling=n,n=o,o=e}Li(t,!0,n,null,l);break;case"together":Li(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Go(e,t){(t.mode&1)===0&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function wt(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),fn|=t.lanes,(n&t.childLanes)===0)return null;if(e!==null&&t.child!==e.child)throw Error(_(153));if(t.child!==null){for(e=t.child,n=bt(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=bt(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Mm(e,t,n){switch(t.tag){case 3:Hd(t),Gn();break;case 5:gd(t);break;case 1:De(t.type)&&ul(t);break;case 4:eu(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,o=t.memoizedProps.value;H(dl,r._currentValue),r._currentValue=o;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(H(Y,Y.current&1),t.flags|=128,null):(n&t.child.childLanes)!==0?bd(e,t,n):(H(Y,Y.current&1),e=wt(e,t,n),e!==null?e.sibling:null);H(Y,Y.current&1);break;case 19:if(r=(n&t.childLanes)!==0,(e.flags&128)!==0){if(r)return Vd(e,t,n);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),H(Y,Y.current),r)break;return null;case 22:case 23:return t.lanes=0,jd(e,t,n)}return wt(e,t,n)}var Wd,_s,Qd,Kd;Wd=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};_s=function(){};Qd=function(e,t,n,r){var o=e.memoizedProps;if(o!==r){e=t.stateNode,ln(at.current);var l=null;switch(n){case"input":o=bi(e,o),r=bi(e,r),l=[];break;case"select":o=X({},o,{value:void 0}),r=X({},r,{value:void 0}),l=[];break;case"textarea":o=Qi(e,o),r=Qi(e,r),l=[];break;default:typeof o.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=il)}Gi(n,r);var i;n=null;for(d in o)if(!r.hasOwnProperty(d)&&o.hasOwnProperty(d)&&o[d]!=null)if(d==="style"){var s=o[d];for(i in s)s.hasOwnProperty(i)&&(n||(n={}),n[i]="")}else d!=="dangerouslySetInnerHTML"&&d!=="children"&&d!=="suppressContentEditableWarning"&&d!=="suppressHydrationWarning"&&d!=="autoFocus"&&(Lr.hasOwnProperty(d)?l||(l=[]):(l=l||[]).push(d,null));for(d in r){var u=r[d];if(s=o?.[d],r.hasOwnProperty(d)&&u!==s&&(u!=null||s!=null))if(d==="style")if(s){for(i in s)!s.hasOwnProperty(i)||u&&u.hasOwnProperty(i)||(n||(n={}),n[i]="");for(i in u)u.hasOwnProperty(i)&&s[i]!==u[i]&&(n||(n={}),n[i]=u[i])}else n||(l||(l=[]),l.push(d,n)),n=u;else d==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,s=s?s.__html:void 0,u!=null&&s!==u&&(l=l||[]).push(d,u)):d==="children"?typeof u!="string"&&typeof u!="number"||(l=l||[]).push(d,""+u):d!=="suppressContentEditableWarning"&&d!=="suppressHydrationWarning"&&(Lr.hasOwnProperty(d)?(u!=null&&d==="onScroll"&&W("scroll",e),l||s===u||(l=[])):(l=l||[]).push(d,u))}n&&(l=l||[]).push("style",n);var d=l;(t.updateQueue=d)&&(t.flags|=4)}};Kd=function(e,t,n,r){n!==r&&(t.flags|=4)};function wr(e,t){if(!K)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function me(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var o=e.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags&14680064,r|=o.flags&14680064,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags,r|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Am(e,t,n){var r=t.pendingProps;switch(Ks(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return me(t),null;case 1:return De(t.type)&&sl(),me(t),null;case 3:return r=t.stateNode,Zn(),Q(Se),Q(ve),nu(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&($o(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,et!==null&&(Ns(et),et=null))),_s(e,t),me(t),null;case 5:tu(t);var o=ln(Kr.current);if(n=t.type,e!==null&&t.stateNode!=null)Qd(e,t,n,r,o),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(_(166));return me(t),null}if(e=ln(at.current),$o(t)){r=t.stateNode,n=t.type;var l=t.memoizedProps;switch(r[st]=t,r[Wr]=l,e=(t.mode&1)!==0,n){case"dialog":W("cancel",r),W("close",r);break;case"iframe":case"object":case"embed":W("load",r);break;case"video":case"audio":for(o=0;o<Sr.length;o++)W(Sr[o],r);break;case"source":W("error",r);break;case"img":case"image":case"link":W("error",r),W("load",r);break;case"details":W("toggle",r);break;case"input":ca(r,l),W("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!l.multiple},W("invalid",r);break;case"textarea":fa(r,l),W("invalid",r)}Gi(n,l),o=null;for(var i in l)if(l.hasOwnProperty(i)){var s=l[i];i==="children"?typeof s=="string"?r.textContent!==s&&(l.suppressHydrationWarning!==!0&&Io(r.textContent,s,e),o=["children",s]):typeof s=="number"&&r.textContent!==""+s&&(l.suppressHydrationWarning!==!0&&Io(r.textContent,s,e),o=["children",""+s]):Lr.hasOwnProperty(i)&&s!=null&&i==="onScroll"&&W("scroll",r)}switch(n){case"input":Eo(r),da(r,l,!0);break;case"textarea":Eo(r),pa(r);break;case"select":case"option":break;default:typeof l.onClick=="function"&&(r.onclick=il)}r=o,t.updateQueue=r,r!==null&&(t.flags|=4)}else{i=o.nodeType===9?o:o.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=_c(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=i.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=i.createElement(n,{is:r.is}):(e=i.createElement(n),n==="select"&&(i=e,r.multiple?i.multiple=!0:r.size&&(i.size=r.size))):e=i.createElementNS(e,n),e[st]=t,e[Wr]=r,Wd(e,t,!1,!1),t.stateNode=e;e:{switch(i=Yi(n,r),n){case"dialog":W("cancel",e),W("close",e),o=r;break;case"iframe":case"object":case"embed":W("load",e),o=r;break;case"video":case"audio":for(o=0;o<Sr.length;o++)W(Sr[o],e);o=r;break;case"source":W("error",e),o=r;break;case"img":case"image":case"link":W("error",e),W("load",e),o=r;break;case"details":W("toggle",e),o=r;break;case"input":ca(e,r),o=bi(e,r),W("invalid",e);break;case"option":o=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},o=X({},r,{value:void 0}),W("invalid",e);break;case"textarea":fa(e,r),o=Qi(e,r),W("invalid",e);break;default:o=r}Gi(n,o),s=o;for(l in s)if(s.hasOwnProperty(l)){var u=s[l];l==="style"?Ec(e,u):l==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,u!=null&&kc(e,u)):l==="children"?typeof u=="string"?(n!=="textarea"||u!=="")&&Ir(e,u):typeof u=="number"&&Ir(e,""+u):l!=="suppressContentEditableWarning"&&l!=="suppressHydrationWarning"&&l!=="autoFocus"&&(Lr.hasOwnProperty(l)?u!=null&&l==="onScroll"&&W("scroll",e):u!=null&&Ms(e,l,u,i))}switch(n){case"input":Eo(e),da(e,r,!1);break;case"textarea":Eo(e),pa(e);break;case"option":r.value!=null&&e.setAttribute("value",""+Vt(r.value));break;case"select":e.multiple=!!r.multiple,l=r.value,l!=null?jn(e,!!r.multiple,l,!1):r.defaultValue!=null&&jn(e,!!r.multiple,r.defaultValue,!0);break;default:typeof o.onClick=="function"&&(e.onclick=il)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return me(t),null;case 6:if(e&&t.stateNode!=null)Kd(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(_(166));if(n=ln(Kr.current),ln(at.current),$o(t)){if(r=t.stateNode,n=t.memoizedProps,r[st]=t,(l=r.nodeValue!==n)&&(e=Me,e!==null))switch(e.tag){case 3:Io(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&Io(r.nodeValue,n,(e.mode&1)!==0)}l&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[st]=t,t.stateNode=r}return me(t),null;case 13:if(Q(Y),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(K&&Re!==null&&(t.mode&1)!==0&&(t.flags&128)===0)dd(),Gn(),t.flags|=98560,l=!1;else if(l=$o(t),r!==null&&r.dehydrated!==null){if(e===null){if(!l)throw Error(_(318));if(l=t.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(_(317));l[st]=t}else Gn(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;me(t),l=!1}else et!==null&&(Ns(et),et=null),l=!0;if(!l)return t.flags&65536?t:null}return(t.flags&128)!==0?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,(t.mode&1)!==0&&(e===null||(Y.current&1)!==0?oe===0&&(oe=3):hu())),t.updateQueue!==null&&(t.flags|=4),me(t),null);case 4:return Zn(),_s(e,t),e===null&&br(t.stateNode.containerInfo),me(t),null;case 10:return Xs(t.type._context),me(t),null;case 17:return De(t.type)&&sl(),me(t),null;case 19:if(Q(Y),l=t.memoizedState,l===null)return me(t),null;if(r=(t.flags&128)!==0,i=l.rendering,i===null)if(r)wr(l,!1);else{if(oe!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(i=hl(e),i!==null){for(t.flags|=128,wr(l,!1),r=i.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)l=n,e=r,l.flags&=14680066,i=l.alternate,i===null?(l.childLanes=0,l.lanes=e,l.child=null,l.subtreeFlags=0,l.memoizedProps=null,l.memoizedState=null,l.updateQueue=null,l.dependencies=null,l.stateNode=null):(l.childLanes=i.childLanes,l.lanes=i.lanes,l.child=i.child,l.subtreeFlags=0,l.deletions=null,l.memoizedProps=i.memoizedProps,l.memoizedState=i.memoizedState,l.updateQueue=i.updateQueue,l.type=i.type,e=i.dependencies,l.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return H(Y,Y.current&1|2),t.child}e=e.sibling}l.tail!==null&&te()>Jn&&(t.flags|=128,r=!0,wr(l,!1),t.lanes=4194304)}else{if(!r)if(e=hl(i),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),wr(l,!0),l.tail===null&&l.tailMode==="hidden"&&!i.alternate&&!K)return me(t),null}else 2*te()-l.renderingStartTime>Jn&&n!==1073741824&&(t.flags|=128,r=!0,wr(l,!1),t.lanes=4194304);l.isBackwards?(i.sibling=t.child,t.child=i):(n=l.last,n!==null?n.sibling=i:t.child=i,l.last=i)}return l.tail!==null?(t=l.tail,l.rendering=t,l.tail=t.sibling,l.renderingStartTime=te(),t.sibling=null,n=Y.current,H(Y,r?n&1|2:n&1),t):(me(t),null);case 22:case 23:return pu(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&(t.mode&1)!==0?(Te&1073741824)!==0&&(me(t),t.subtreeFlags&6&&(t.flags|=8192)):me(t),null;case 24:return null;case 25:return null}throw Error(_(156,t.tag))}function zm(e,t){switch(Ks(t),t.tag){case 1:return De(t.type)&&sl(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Zn(),Q(Se),Q(ve),nu(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 5:return tu(t),null;case 13:if(Q(Y),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(_(340));Gn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Q(Y),null;case 4:return Zn(),null;case 10:return Xs(t.type._context),null;case 22:case 23:return pu(),null;case 24:return null;default:return null}}var jo=!1,ge=!1,Lm=typeof WeakSet=="function"?WeakSet:Set,D=null;function On(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){q(e,t,r)}else n.current=null}function ks(e,t,n){try{n()}catch(r){q(e,t,r)}}var rc=!1;function Im(e,t){if(ls=rl,e=Jc(),Ws(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var o=r.anchorOffset,l=r.focusNode;r=r.focusOffset;try{n.nodeType,l.nodeType}catch{n=null;break e}var i=0,s=-1,u=-1,d=0,h=0,m=e,f=null;t:for(;;){for(var g;m!==n||o!==0&&m.nodeType!==3||(s=i+o),m!==l||r!==0&&m.nodeType!==3||(u=i+r),m.nodeType===3&&(i+=m.nodeValue.length),(g=m.firstChild)!==null;)f=m,m=g;for(;;){if(m===e)break t;if(f===n&&++d===o&&(s=i),f===l&&++h===r&&(u=i),(g=m.nextSibling)!==null)break;m=f,f=m.parentNode}m=g}n=s===-1||u===-1?null:{start:s,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(is={focusedElem:e,selectionRange:n},rl=!1,D=t;D!==null;)if(t=D,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,D=e;else for(;D!==null;){t=D;try{var w=t.alternate;if((t.flags&1024)!==0)switch(t.tag){case 0:case 11:case 15:break;case 1:if(w!==null){var v=w.memoizedProps,C=w.memoizedState,c=t.stateNode,a=c.getSnapshotBeforeUpdate(t.elementType===t.type?v:Je(t.type,v),C);c.__reactInternalSnapshotBeforeUpdate=a}break;case 3:var p=t.stateNode.containerInfo;p.nodeType===1?p.textContent="":p.nodeType===9&&p.documentElement&&p.removeChild(p.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(_(163))}}catch(y){q(t,t.return,y)}if(e=t.sibling,e!==null){e.return=t.return,D=e;break}D=t.return}return w=rc,rc=!1,w}function Mr(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var o=r=r.next;do{if((o.tag&e)===e){var l=o.destroy;o.destroy=void 0,l!==void 0&&ks(t,n,l)}o=o.next}while(o!==r)}}function Tl(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function xs(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function Gd(e){var t=e.alternate;t!==null&&(e.alternate=null,Gd(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[st],delete t[Wr],delete t[as],delete t[ym],delete t[wm])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Yd(e){return e.tag===5||e.tag===3||e.tag===4}function oc(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Yd(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Es(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=il));else if(r!==4&&(e=e.child,e!==null))for(Es(e,t,n),e=e.sibling;e!==null;)Es(e,t,n),e=e.sibling}function Ss(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(Ss(e,t,n),e=e.sibling;e!==null;)Ss(e,t,n),e=e.sibling}var ae=null,qe=!1;function Nt(e,t,n){for(n=n.child;n!==null;)Zd(e,t,n),n=n.sibling}function Zd(e,t,n){if(ut&&typeof ut.onCommitFiberUnmount=="function")try{ut.onCommitFiberUnmount(kl,n)}catch{}switch(n.tag){case 5:ge||On(n,t);case 6:var r=ae,o=qe;ae=null,Nt(e,t,n),ae=r,qe=o,ae!==null&&(qe?(e=ae,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):ae.removeChild(n.stateNode));break;case 18:ae!==null&&(qe?(e=ae,n=n.stateNode,e.nodeType===8?Pi(e.parentNode,n):e.nodeType===1&&Pi(e,n),jr(e)):Pi(ae,n.stateNode));break;case 4:r=ae,o=qe,ae=n.stateNode.containerInfo,qe=!0,Nt(e,t,n),ae=r,qe=o;break;case 0:case 11:case 14:case 15:if(!ge&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){o=r=r.next;do{var l=o,i=l.destroy;l=l.tag,i!==void 0&&((l&2)!==0||(l&4)!==0)&&ks(n,t,i),o=o.next}while(o!==r)}Nt(e,t,n);break;case 1:if(!ge&&(On(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(s){q(n,t,s)}Nt(e,t,n);break;case 21:Nt(e,t,n);break;case 22:n.mode&1?(ge=(r=ge)||n.memoizedState!==null,Nt(e,t,n),ge=r):Nt(e,t,n);break;default:Nt(e,t,n)}}function lc(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new Lm),t.forEach(function(r){var o=Wm.bind(null,e,r);n.has(r)||(n.add(r),r.then(o,o))})}}function Xe(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var o=n[r];try{var l=e,i=t,s=i;e:for(;s!==null;){switch(s.tag){case 5:ae=s.stateNode,qe=!1;break e;case 3:ae=s.stateNode.containerInfo,qe=!0;break e;case 4:ae=s.stateNode.containerInfo,qe=!0;break e}s=s.return}if(ae===null)throw Error(_(160));Zd(l,i,o),ae=null,qe=!1;var u=o.alternate;u!==null&&(u.return=null),o.return=null}catch(d){q(o,t,d)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)Xd(t,e),t=t.sibling}function Xd(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(Xe(t,e),lt(e),r&4){try{Mr(3,e,e.return),Tl(3,e)}catch(v){q(e,e.return,v)}try{Mr(5,e,e.return)}catch(v){q(e,e.return,v)}}break;case 1:Xe(t,e),lt(e),r&512&&n!==null&&On(n,n.return);break;case 5:if(Xe(t,e),lt(e),r&512&&n!==null&&On(n,n.return),e.flags&32){var o=e.stateNode;try{Ir(o,"")}catch(v){q(e,e.return,v)}}if(r&4&&(o=e.stateNode,o!=null)){var l=e.memoizedProps,i=n!==null?n.memoizedProps:l,s=e.type,u=e.updateQueue;if(e.updateQueue=null,u!==null)try{s==="input"&&l.type==="radio"&&l.name!=null&&wc(o,l),Yi(s,i);var d=Yi(s,l);for(i=0;i<u.length;i+=2){var h=u[i],m=u[i+1];h==="style"?Ec(o,m):h==="dangerouslySetInnerHTML"?kc(o,m):h==="children"?Ir(o,m):Ms(o,h,m,d)}switch(s){case"input":Vi(o,l);break;case"textarea":Cc(o,l);break;case"select":var f=o._wrapperState.wasMultiple;o._wrapperState.wasMultiple=!!l.multiple;var g=l.value;g!=null?jn(o,!!l.multiple,g,!1):f!==!!l.multiple&&(l.defaultValue!=null?jn(o,!!l.multiple,l.defaultValue,!0):jn(o,!!l.multiple,l.multiple?[]:"",!1))}o[Wr]=l}catch(v){q(e,e.return,v)}}break;case 6:if(Xe(t,e),lt(e),r&4){if(e.stateNode===null)throw Error(_(162));o=e.stateNode,l=e.memoizedProps;try{o.nodeValue=l}catch(v){q(e,e.return,v)}}break;case 3:if(Xe(t,e),lt(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{jr(t.containerInfo)}catch(v){q(e,e.return,v)}break;case 4:Xe(t,e),lt(e);break;case 13:Xe(t,e),lt(e),o=e.child,o.flags&8192&&(l=o.memoizedState!==null,o.stateNode.isHidden=l,!l||o.alternate!==null&&o.alternate.memoizedState!==null||(du=te())),r&4&&lc(e);break;case 22:if(h=n!==null&&n.memoizedState!==null,e.mode&1?(ge=(d=ge)||h,Xe(t,e),ge=d):Xe(t,e),lt(e),r&8192){if(d=e.memoizedState!==null,(e.stateNode.isHidden=d)&&!h&&(e.mode&1)!==0)for(D=e,h=e.child;h!==null;){for(m=D=h;D!==null;){switch(f=D,g=f.child,f.tag){case 0:case 11:case 14:case 15:Mr(4,f,f.return);break;case 1:On(f,f.return);var w=f.stateNode;if(typeof w.componentWillUnmount=="function"){r=f,n=f.return;try{t=r,w.props=t.memoizedProps,w.state=t.memoizedState,w.componentWillUnmount()}catch(v){q(r,n,v)}}break;case 5:On(f,f.return);break;case 22:if(f.memoizedState!==null){sc(m);continue}}g!==null?(g.return=f,D=g):sc(m)}h=h.sibling}e:for(h=null,m=e;;){if(m.tag===5){if(h===null){h=m;try{o=m.stateNode,d?(l=o.style,typeof l.setProperty=="function"?l.setProperty("display","none","important"):l.display="none"):(s=m.stateNode,u=m.memoizedProps.style,i=u!=null&&u.hasOwnProperty("display")?u.display:null,s.style.display=xc("display",i))}catch(v){q(e,e.return,v)}}}else if(m.tag===6){if(h===null)try{m.stateNode.nodeValue=d?"":m.memoizedProps}catch(v){q(e,e.return,v)}}else if((m.tag!==22&&m.tag!==23||m.memoizedState===null||m===e)&&m.child!==null){m.child.return=m,m=m.child;continue}if(m===e)break e;for(;m.sibling===null;){if(m.return===null||m.return===e)break e;h===m&&(h=null),m=m.return}h===m&&(h=null),m.sibling.return=m.return,m=m.sibling}}break;case 19:Xe(t,e),lt(e),r&4&&lc(e);break;case 21:break;default:Xe(t,e),lt(e)}}function lt(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(Yd(n)){var r=n;break e}n=n.return}throw Error(_(160))}switch(r.tag){case 5:var o=r.stateNode;r.flags&32&&(Ir(o,""),r.flags&=-33);var l=oc(e);Ss(e,l,o);break;case 3:case 4:var i=r.stateNode.containerInfo,s=oc(e);Es(e,s,i);break;default:throw Error(_(161))}}catch(u){q(e,e.return,u)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function $m(e,t,n){D=e,Jd(e,t,n)}function Jd(e,t,n){for(var r=(e.mode&1)!==0;D!==null;){var o=D,l=o.child;if(o.tag===22&&r){var i=o.memoizedState!==null||jo;if(!i){var s=o.alternate,u=s!==null&&s.memoizedState!==null||ge;s=jo;var d=ge;if(jo=i,(ge=u)&&!d)for(D=o;D!==null;)i=D,u=i.child,i.tag===22&&i.memoizedState!==null?uc(o):u!==null?(u.return=i,D=u):uc(o);for(;l!==null;)D=l,Jd(l,t,n),l=l.sibling;D=o,jo=s,ge=d}ic(e,t,n)}else(o.subtreeFlags&8772)!==0&&l!==null?(l.return=o,D=l):ic(e,t,n)}}function ic(e){for(;D!==null;){var t=D;if((t.flags&8772)!==0){var n=t.alternate;try{if((t.flags&8772)!==0)switch(t.tag){case 0:case 11:case 15:ge||Tl(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!ge)if(n===null)r.componentDidMount();else{var o=t.elementType===t.type?n.memoizedProps:Je(t.type,n.memoizedProps);r.componentDidUpdate(o,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var l=t.updateQueue;l!==null&&Va(t,l,r);break;case 3:var i=t.updateQueue;if(i!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}Va(t,i,n)}break;case 5:var s=t.stateNode;if(n===null&&t.flags&4){n=s;var u=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":u.autoFocus&&n.focus();break;case"img":u.src&&(n.src=u.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var d=t.alternate;if(d!==null){var h=d.memoizedState;if(h!==null){var m=h.dehydrated;m!==null&&jr(m)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(_(163))}ge||t.flags&512&&xs(t)}catch(f){q(t,t.return,f)}}if(t===e){D=null;break}if(n=t.sibling,n!==null){n.return=t.return,D=n;break}D=t.return}}function sc(e){for(;D!==null;){var t=D;if(t===e){D=null;break}var n=t.sibling;if(n!==null){n.return=t.return,D=n;break}D=t.return}}function uc(e){for(;D!==null;){var t=D;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{Tl(4,t)}catch(u){q(t,n,u)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var o=t.return;try{r.componentDidMount()}catch(u){q(t,o,u)}}var l=t.return;try{xs(t)}catch(u){q(t,l,u)}break;case 5:var i=t.return;try{xs(t)}catch(u){q(t,i,u)}}}catch(u){q(t,t.return,u)}if(t===e){D=null;break}var s=t.sibling;if(s!==null){s.return=t.return,D=s;break}D=t.return}}var Om=Math.ceil,vl=Ct.ReactCurrentDispatcher,au=Ct.ReactCurrentOwner,be=Ct.ReactCurrentBatchConfig,L=0,ue=null,ne=null,ce=0,Te=0,Bn=Kt(0),oe=0,Xr=null,fn=0,Rl=0,cu=0,Ar=null,xe=null,du=0,Jn=1/0,dt=null,yl=!1,Ds=null,Ut=null,Uo=!1,Lt=null,wl=0,zr=0,Fs=null,Yo=-1,Zo=0;function Ce(){return(L&6)!==0?te():Yo!==-1?Yo:Yo=te()}function Ht(e){return(e.mode&1)===0?1:(L&2)!==0&&ce!==0?ce&-ce:_m.transition!==null?(Zo===0&&(Zo=Ic()),Zo):(e=O,e!==0||(e=window.event,e=e===void 0?16:bc(e.type)),e)}function nt(e,t,n,r){if(50<zr)throw zr=0,Fs=null,Error(_(185));Jr(e,n,r),((L&2)===0||e!==ue)&&(e===ue&&((L&2)===0&&(Rl|=n),oe===4&&At(e,ce)),Fe(e,r),n===1&&L===0&&(t.mode&1)===0&&(Jn=te()+500,Fl&&Gt()))}function Fe(e,t){var n=e.callbackNode;xh(e,t);var r=nl(e,e===ue?ce:0);if(r===0)n!==null&&ga(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&ga(n),t===1)e.tag===0?Cm(ac.bind(null,e)):ud(ac.bind(null,e)),gm(function(){(L&6)===0&&Gt()}),n=null;else{switch($c(r)){case 1:n=$s;break;case 4:n=zc;break;case 16:n=tl;break;case 536870912:n=Lc;break;default:n=tl}n=sf(n,qd.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function qd(e,t){if(Yo=-1,Zo=0,(L&6)!==0)throw Error(_(327));var n=e.callbackNode;if(Wn()&&e.callbackNode!==n)return null;var r=nl(e,e===ue?ce:0);if(r===0)return null;if((r&30)!==0||(r&e.expiredLanes)!==0||t)t=Cl(e,r);else{t=r;var o=L;L|=2;var l=tf();(ue!==e||ce!==t)&&(dt=null,Jn=te()+500,sn(e,t));do try{Um();break}catch(s){ef(e,s)}while(!0);Zs(),vl.current=l,L=o,ne!==null?t=0:(ue=null,ce=0,t=oe)}if(t!==0){if(t===2&&(o=es(e),o!==0&&(r=o,t=Ps(e,o))),t===1)throw n=Xr,sn(e,0),At(e,r),Fe(e,te()),n;if(t===6)At(e,r);else{if(o=e.current.alternate,(r&30)===0&&!Bm(o)&&(t=Cl(e,r),t===2&&(l=es(e),l!==0&&(r=l,t=Ps(e,l))),t===1))throw n=Xr,sn(e,0),At(e,r),Fe(e,te()),n;switch(e.finishedWork=o,e.finishedLanes=r,t){case 0:case 1:throw Error(_(345));case 2:nn(e,xe,dt);break;case 3:if(At(e,r),(r&130023424)===r&&(t=du+500-te(),10<t)){if(nl(e,0)!==0)break;if(o=e.suspendedLanes,(o&r)!==r){Ce(),e.pingedLanes|=e.suspendedLanes&o;break}e.timeoutHandle=us(nn.bind(null,e,xe,dt),t);break}nn(e,xe,dt);break;case 4:if(At(e,r),(r&4194240)===r)break;for(t=e.eventTimes,o=-1;0<r;){var i=31-tt(r);l=1<<i,i=t[i],i>o&&(o=i),r&=~l}if(r=o,r=te()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*Om(r/1960))-r,10<r){e.timeoutHandle=us(nn.bind(null,e,xe,dt),r);break}nn(e,xe,dt);break;case 5:nn(e,xe,dt);break;default:throw Error(_(329))}}}return Fe(e,te()),e.callbackNode===n?qd.bind(null,e):null}function Ps(e,t){var n=Ar;return e.current.memoizedState.isDehydrated&&(sn(e,t).flags|=256),e=Cl(e,t),e!==2&&(t=xe,xe=n,t!==null&&Ns(t)),e}function Ns(e){xe===null?xe=e:xe.push.apply(xe,e)}function Bm(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var o=n[r],l=o.getSnapshot;o=o.value;try{if(!rt(l(),o))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function At(e,t){for(t&=~cu,t&=~Rl,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-tt(t),r=1<<n;e[n]=-1,t&=~r}}function ac(e){if((L&6)!==0)throw Error(_(327));Wn();var t=nl(e,0);if((t&1)===0)return Fe(e,te()),null;var n=Cl(e,t);if(e.tag!==0&&n===2){var r=es(e);r!==0&&(t=r,n=Ps(e,r))}if(n===1)throw n=Xr,sn(e,0),At(e,t),Fe(e,te()),n;if(n===6)throw Error(_(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,nn(e,xe,dt),Fe(e,te()),null}function fu(e,t){var n=L;L|=1;try{return e(t)}finally{L=n,L===0&&(Jn=te()+500,Fl&&Gt())}}function pn(e){Lt!==null&&Lt.tag===0&&(L&6)===0&&Wn();var t=L;L|=1;var n=be.transition,r=O;try{if(be.transition=null,O=1,e)return e()}finally{O=r,be.transition=n,L=t,(L&6)===0&&Gt()}}function pu(){Te=Bn.current,Q(Bn)}function sn(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,mm(n)),ne!==null)for(n=ne.return;n!==null;){var r=n;switch(Ks(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&sl();break;case 3:Zn(),Q(Se),Q(ve),nu();break;case 5:tu(r);break;case 4:Zn();break;case 13:Q(Y);break;case 19:Q(Y);break;case 10:Xs(r.type._context);break;case 22:case 23:pu()}n=n.return}if(ue=e,ne=e=bt(e.current,null),ce=Te=t,oe=0,Xr=null,cu=Rl=fn=0,xe=Ar=null,on!==null){for(t=0;t<on.length;t++)if(n=on[t],r=n.interleaved,r!==null){n.interleaved=null;var o=r.next,l=n.pending;if(l!==null){var i=l.next;l.next=o,r.next=i}n.pending=r}on=null}return e}function ef(e,t){do{var n=ne;try{if(Zs(),Qo.current=gl,ml){for(var r=Z.memoizedState;r!==null;){var o=r.queue;o!==null&&(o.pending=null),r=r.next}ml=!1}if(dn=0,se=re=Z=null,Rr=!1,Gr=0,au.current=null,n===null||n.return===null){oe=1,Xr=t,ne=null;break}e:{var l=e,i=n.return,s=n,u=t;if(t=ce,s.flags|=32768,u!==null&&typeof u=="object"&&typeof u.then=="function"){var d=u,h=s,m=h.tag;if((h.mode&1)===0&&(m===0||m===11||m===15)){var f=h.alternate;f?(h.updateQueue=f.updateQueue,h.memoizedState=f.memoizedState,h.lanes=f.lanes):(h.updateQueue=null,h.memoizedState=null)}var g=Za(i);if(g!==null){g.flags&=-257,Xa(g,i,s,l,t),g.mode&1&&Ya(l,d,t),t=g,u=d;var w=t.updateQueue;if(w===null){var v=new Set;v.add(u),t.updateQueue=v}else w.add(u);break e}else{if((t&1)===0){Ya(l,d,t),hu();break e}u=Error(_(426))}}else if(K&&s.mode&1){var C=Za(i);if(C!==null){(C.flags&65536)===0&&(C.flags|=256),Xa(C,i,s,l,t),Gs(Xn(u,s));break e}}l=u=Xn(u,s),oe!==4&&(oe=2),Ar===null?Ar=[l]:Ar.push(l),l=i;do{switch(l.tag){case 3:l.flags|=65536,t&=-t,l.lanes|=t;var c=$d(l,u,t);ba(l,c);break e;case 1:s=u;var a=l.type,p=l.stateNode;if((l.flags&128)===0&&(typeof a.getDerivedStateFromError=="function"||p!==null&&typeof p.componentDidCatch=="function"&&(Ut===null||!Ut.has(p)))){l.flags|=65536,t&=-t,l.lanes|=t;var y=Od(l,s,t);ba(l,y);break e}}l=l.return}while(l!==null)}rf(n)}catch(k){t=k,ne===n&&n!==null&&(ne=n=n.return);continue}break}while(!0)}function tf(){var e=vl.current;return vl.current=gl,e===null?gl:e}function hu(){(oe===0||oe===3||oe===2)&&(oe=4),ue===null||(fn&268435455)===0&&(Rl&268435455)===0||At(ue,ce)}function Cl(e,t){var n=L;L|=2;var r=tf();(ue!==e||ce!==t)&&(dt=null,sn(e,t));do try{jm();break}catch(o){ef(e,o)}while(!0);if(Zs(),L=n,vl.current=r,ne!==null)throw Error(_(261));return ue=null,ce=0,oe}function jm(){for(;ne!==null;)nf(ne)}function Um(){for(;ne!==null&&!hh();)nf(ne)}function nf(e){var t=lf(e.alternate,e,Te);e.memoizedProps=e.pendingProps,t===null?rf(e):ne=t,au.current=null}function rf(e){var t=e;do{var n=t.alternate;if(e=t.return,(t.flags&32768)===0){if(n=Am(n,t,Te),n!==null){ne=n;return}}else{if(n=zm(n,t),n!==null){n.flags&=32767,ne=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{oe=6,ne=null;return}}if(t=t.sibling,t!==null){ne=t;return}ne=t=e}while(t!==null);oe===0&&(oe=5)}function nn(e,t,n){var r=O,o=be.transition;try{be.transition=null,O=1,Hm(e,t,n,r)}finally{be.transition=o,O=r}return null}function Hm(e,t,n,r){do Wn();while(Lt!==null);if((L&6)!==0)throw Error(_(327));n=e.finishedWork;var o=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(_(177));e.callbackNode=null,e.callbackPriority=0;var l=n.lanes|n.childLanes;if(Eh(e,l),e===ue&&(ne=ue=null,ce=0),(n.subtreeFlags&2064)===0&&(n.flags&2064)===0||Uo||(Uo=!0,sf(tl,function(){return Wn(),null})),l=(n.flags&15990)!==0,(n.subtreeFlags&15990)!==0||l){l=be.transition,be.transition=null;var i=O;O=1;var s=L;L|=4,au.current=null,Im(e,n),Xd(n,e),cm(is),rl=!!ls,is=ls=null,e.current=n,$m(n,e,o),mh(),L=s,O=i,be.transition=l}else e.current=n;if(Uo&&(Uo=!1,Lt=e,wl=o),l=e.pendingLanes,l===0&&(Ut=null),yh(n.stateNode,r),Fe(e,te()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)o=t[n],r(o.value,{componentStack:o.stack,digest:o.digest});if(yl)throw yl=!1,e=Ds,Ds=null,e;return(wl&1)!==0&&e.tag!==0&&Wn(),l=e.pendingLanes,(l&1)!==0?e===Fs?zr++:(zr=0,Fs=e):zr=0,Gt(),null}function Wn(){if(Lt!==null){var e=$c(wl),t=be.transition,n=O;try{if(be.transition=null,O=16>e?16:e,Lt===null)var r=!1;else{if(e=Lt,Lt=null,wl=0,(L&6)!==0)throw Error(_(331));var o=L;for(L|=4,D=e.current;D!==null;){var l=D,i=l.child;if((D.flags&16)!==0){var s=l.deletions;if(s!==null){for(var u=0;u<s.length;u++){var d=s[u];for(D=d;D!==null;){var h=D;switch(h.tag){case 0:case 11:case 15:Mr(8,h,l)}var m=h.child;if(m!==null)m.return=h,D=m;else for(;D!==null;){h=D;var f=h.sibling,g=h.return;if(Gd(h),h===d){D=null;break}if(f!==null){f.return=g,D=f;break}D=g}}}var w=l.alternate;if(w!==null){var v=w.child;if(v!==null){w.child=null;do{var C=v.sibling;v.sibling=null,v=C}while(v!==null)}}D=l}}if((l.subtreeFlags&2064)!==0&&i!==null)i.return=l,D=i;else e:for(;D!==null;){if(l=D,(l.flags&2048)!==0)switch(l.tag){case 0:case 11:case 15:Mr(9,l,l.return)}var c=l.sibling;if(c!==null){c.return=l.return,D=c;break e}D=l.return}}var a=e.current;for(D=a;D!==null;){i=D;var p=i.child;if((i.subtreeFlags&2064)!==0&&p!==null)p.return=i,D=p;else e:for(i=a;D!==null;){if(s=D,(s.flags&2048)!==0)try{switch(s.tag){case 0:case 11:case 15:Tl(9,s)}}catch(k){q(s,s.return,k)}if(s===i){D=null;break e}var y=s.sibling;if(y!==null){y.return=s.return,D=y;break e}D=s.return}}if(L=o,Gt(),ut&&typeof ut.onPostCommitFiberRoot=="function")try{ut.onPostCommitFiberRoot(kl,e)}catch{}r=!0}return r}finally{O=n,be.transition=t}}return!1}function cc(e,t,n){t=Xn(n,t),t=$d(e,t,1),e=jt(e,t,1),t=Ce(),e!==null&&(Jr(e,1,t),Fe(e,t))}function q(e,t,n){if(e.tag===3)cc(e,e,n);else for(;t!==null;){if(t.tag===3){cc(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Ut===null||!Ut.has(r))){e=Xn(n,e),e=Od(t,e,1),t=jt(t,e,1),e=Ce(),t!==null&&(Jr(t,1,e),Fe(t,e));break}}t=t.return}}function bm(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=Ce(),e.pingedLanes|=e.suspendedLanes&n,ue===e&&(ce&n)===n&&(oe===4||oe===3&&(ce&130023424)===ce&&500>te()-du?sn(e,0):cu|=n),Fe(e,t)}function of(e,t){t===0&&((e.mode&1)===0?t=1:(t=Fo,Fo<<=1,(Fo&130023424)===0&&(Fo=4194304)));var n=Ce();e=yt(e,t),e!==null&&(Jr(e,t,n),Fe(e,n))}function Vm(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),of(e,n)}function Wm(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,o=e.memoizedState;o!==null&&(n=o.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(_(314))}r!==null&&r.delete(t),of(e,n)}var lf;lf=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||Se.current)Ee=!0;else{if((e.lanes&n)===0&&(t.flags&128)===0)return Ee=!1,Mm(e,t,n);Ee=(e.flags&131072)!==0}else Ee=!1,K&&(t.flags&1048576)!==0&&ad(t,cl,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;Go(e,t),e=t.pendingProps;var o=Kn(t,ve.current);Vn(t,n),o=ou(null,t,r,e,o,n);var l=lu();return t.flags|=1,typeof o=="object"&&o!==null&&typeof o.render=="function"&&o.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,De(r)?(l=!0,ul(t)):l=!1,t.memoizedState=o.state!==null&&o.state!==void 0?o.state:null,qs(t),o.updater=Nl,t.stateNode=o,o._reactInternals=t,ms(t,r,e,n),t=ys(null,t,r,!0,l,n)):(t.tag=0,K&&l&&Qs(t),we(null,t,o,n),t=t.child),t;case 16:r=t.elementType;e:{switch(Go(e,t),e=t.pendingProps,o=r._init,r=o(r._payload),t.type=r,o=t.tag=Km(r),e=Je(r,e),o){case 0:t=vs(null,t,r,e,n);break e;case 1:t=ec(null,t,r,e,n);break e;case 11:t=Ja(null,t,r,e,n);break e;case 14:t=qa(null,t,r,Je(r.type,e),n);break e}throw Error(_(306,r,""))}return t;case 0:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Je(r,o),vs(e,t,r,o,n);case 1:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Je(r,o),ec(e,t,r,o,n);case 3:e:{if(Hd(t),e===null)throw Error(_(387));r=t.pendingProps,l=t.memoizedState,o=l.element,md(e,t),pl(t,r,null,n);var i=t.memoizedState;if(r=i.element,l.isDehydrated)if(l={element:r,isDehydrated:!1,cache:i.cache,pendingSuspenseBoundaries:i.pendingSuspenseBoundaries,transitions:i.transitions},t.updateQueue.baseState=l,t.memoizedState=l,t.flags&256){o=Xn(Error(_(423)),t),t=tc(e,t,r,n,o);break e}else if(r!==o){o=Xn(Error(_(424)),t),t=tc(e,t,r,n,o);break e}else for(Re=Bt(t.stateNode.containerInfo.firstChild),Me=t,K=!0,et=null,n=pd(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Gn(),r===o){t=wt(e,t,n);break e}we(e,t,r,n)}t=t.child}return t;case 5:return gd(t),e===null&&fs(t),r=t.type,o=t.pendingProps,l=e!==null?e.memoizedProps:null,i=o.children,ss(r,o)?i=null:l!==null&&ss(r,l)&&(t.flags|=32),Ud(e,t),we(e,t,i,n),t.child;case 6:return e===null&&fs(t),null;case 13:return bd(e,t,n);case 4:return eu(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Yn(t,null,r,n):we(e,t,r,n),t.child;case 11:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Je(r,o),Ja(e,t,r,o,n);case 7:return we(e,t,t.pendingProps,n),t.child;case 8:return we(e,t,t.pendingProps.children,n),t.child;case 12:return we(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,o=t.pendingProps,l=t.memoizedProps,i=o.value,H(dl,r._currentValue),r._currentValue=i,l!==null)if(rt(l.value,i)){if(l.children===o.children&&!Se.current){t=wt(e,t,n);break e}}else for(l=t.child,l!==null&&(l.return=t);l!==null;){var s=l.dependencies;if(s!==null){i=l.child;for(var u=s.firstContext;u!==null;){if(u.context===r){if(l.tag===1){u=mt(-1,n&-n),u.tag=2;var d=l.updateQueue;if(d!==null){d=d.shared;var h=d.pending;h===null?u.next=u:(u.next=h.next,h.next=u),d.pending=u}}l.lanes|=n,u=l.alternate,u!==null&&(u.lanes|=n),ps(l.return,n,t),s.lanes|=n;break}u=u.next}}else if(l.tag===10)i=l.type===t.type?null:l.child;else if(l.tag===18){if(i=l.return,i===null)throw Error(_(341));i.lanes|=n,s=i.alternate,s!==null&&(s.lanes|=n),ps(i,n,t),i=l.sibling}else i=l.child;if(i!==null)i.return=l;else for(i=l;i!==null;){if(i===t){i=null;break}if(l=i.sibling,l!==null){l.return=i.return,i=l;break}i=i.return}l=i}we(e,t,o.children,n),t=t.child}return t;case 9:return o=t.type,r=t.pendingProps.children,Vn(t,n),o=Ve(o),r=r(o),t.flags|=1,we(e,t,r,n),t.child;case 14:return r=t.type,o=Je(r,t.pendingProps),o=Je(r.type,o),qa(e,t,r,o,n);case 15:return Bd(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Je(r,o),Go(e,t),t.tag=1,De(r)?(e=!0,ul(t)):e=!1,Vn(t,n),Id(t,r,o),ms(t,r,o,n),ys(null,t,r,!0,e,n);case 19:return Vd(e,t,n);case 22:return jd(e,t,n)}throw Error(_(156,t.tag))};function sf(e,t){return Ac(e,t)}function Qm(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function He(e,t,n,r){return new Qm(e,t,n,r)}function mu(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Km(e){if(typeof e=="function")return mu(e)?1:0;if(e!=null){if(e=e.$$typeof,e===zs)return 11;if(e===Ls)return 14}return 2}function bt(e,t){var n=e.alternate;return n===null?(n=He(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function Xo(e,t,n,r,o,l){var i=2;if(r=e,typeof e=="function")mu(e)&&(i=1);else if(typeof e=="string")i=5;else e:switch(e){case Nn:return un(n.children,o,l,t);case As:i=8,o|=8;break;case Bi:return e=He(12,n,t,o|2),e.elementType=Bi,e.lanes=l,e;case ji:return e=He(13,n,t,o),e.elementType=ji,e.lanes=l,e;case Ui:return e=He(19,n,t,o),e.elementType=Ui,e.lanes=l,e;case gc:return Ml(n,o,l,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case hc:i=10;break e;case mc:i=9;break e;case zs:i=11;break e;case Ls:i=14;break e;case Tt:i=16,r=null;break e}throw Error(_(130,e==null?e:typeof e,""))}return t=He(i,n,t,o),t.elementType=e,t.type=r,t.lanes=l,t}function un(e,t,n,r){return e=He(7,e,r,t),e.lanes=n,e}function Ml(e,t,n,r){return e=He(22,e,r,t),e.elementType=gc,e.lanes=n,e.stateNode={isHidden:!1},e}function Ii(e,t,n){return e=He(6,e,null,t),e.lanes=n,e}function $i(e,t,n){return t=He(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function Gm(e,t,n,r,o){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Ci(0),this.expirationTimes=Ci(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ci(0),this.identifierPrefix=r,this.onRecoverableError=o,this.mutableSourceEagerHydrationData=null}function gu(e,t,n,r,o,l,i,s,u){return e=new Gm(e,t,n,s,u),t===1?(t=1,l===!0&&(t|=8)):t=0,l=He(3,null,null,t),e.current=l,l.stateNode=e,l.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},qs(l),e}function Ym(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Pn,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function uf(e){if(!e)return Wt;e=e._reactInternals;e:{if(mn(e)!==e||e.tag!==1)throw Error(_(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(De(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(_(171))}if(e.tag===1){var n=e.type;if(De(n))return sd(e,n,t)}return t}function af(e,t,n,r,o,l,i,s,u){return e=gu(n,r,!0,e,o,l,i,s,u),e.context=uf(null),n=e.current,r=Ce(),o=Ht(n),l=mt(r,o),l.callback=t??null,jt(n,l,o),e.current.lanes=o,Jr(e,o,r),Fe(e,r),e}function Al(e,t,n,r){var o=t.current,l=Ce(),i=Ht(o);return n=uf(n),t.context===null?t.context=n:t.pendingContext=n,t=mt(l,i),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=jt(o,t,i),e!==null&&(nt(e,o,i,l),Wo(e,o,i)),i}function _l(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function dc(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function vu(e,t){dc(e,t),(e=e.alternate)&&dc(e,t)}function Zm(){return null}var cf=typeof reportError=="function"?reportError:function(e){console.error(e)};function yu(e){this._internalRoot=e}zl.prototype.render=yu.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(_(409));Al(e,t,null,null)};zl.prototype.unmount=yu.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;pn(function(){Al(null,e,null,null)}),t[vt]=null}};function zl(e){this._internalRoot=e}zl.prototype.unstable_scheduleHydration=function(e){if(e){var t=jc();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Mt.length&&t!==0&&t<Mt[n].priority;n++);Mt.splice(n,0,e),n===0&&Hc(e)}};function wu(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Ll(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function fc(){}function Xm(e,t,n,r,o){if(o){if(typeof r=="function"){var l=r;r=function(){var d=_l(i);l.call(d)}}var i=af(t,r,e,0,null,!1,!1,"",fc);return e._reactRootContainer=i,e[vt]=i.current,br(e.nodeType===8?e.parentNode:e),pn(),i}for(;o=e.lastChild;)e.removeChild(o);if(typeof r=="function"){var s=r;r=function(){var d=_l(u);s.call(d)}}var u=gu(e,0,!1,null,null,!1,!1,"",fc);return e._reactRootContainer=u,e[vt]=u.current,br(e.nodeType===8?e.parentNode:e),pn(function(){Al(t,u,n,r)}),u}function Il(e,t,n,r,o){var l=n._reactRootContainer;if(l){var i=l;if(typeof o=="function"){var s=o;o=function(){var u=_l(i);s.call(u)}}Al(t,i,e,o)}else i=Xm(n,t,e,o,r);return _l(i)}Oc=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=Er(t.pendingLanes);n!==0&&(Os(t,n|1),Fe(t,te()),(L&6)===0&&(Jn=te()+500,Gt()))}break;case 13:pn(function(){var r=yt(e,1);if(r!==null){var o=Ce();nt(r,e,1,o)}}),vu(e,1)}};Bs=function(e){if(e.tag===13){var t=yt(e,134217728);if(t!==null){var n=Ce();nt(t,e,134217728,n)}vu(e,134217728)}};Bc=function(e){if(e.tag===13){var t=Ht(e),n=yt(e,t);if(n!==null){var r=Ce();nt(n,e,t,r)}vu(e,t)}};jc=function(){return O};Uc=function(e,t){var n=O;try{return O=e,t()}finally{O=n}};Xi=function(e,t,n){switch(t){case"input":if(Vi(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var o=Dl(r);if(!o)throw Error(_(90));yc(r),Vi(r,o)}}}break;case"textarea":Cc(e,n);break;case"select":t=n.value,t!=null&&jn(e,!!n.multiple,t,!1)}};Fc=fu;Pc=pn;var Jm={usingClientEntryPoint:!1,Events:[eo,An,Dl,Sc,Dc,fu]},Cr={findFiberByHostInstance:rn,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},qm={bundleType:Cr.bundleType,version:Cr.version,rendererPackageName:Cr.rendererPackageName,rendererConfig:Cr.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Ct.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=Rc(e),e===null?null:e.stateNode},findFiberByHostInstance:Cr.findFiberByHostInstance||Zm,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(_r=__REACT_DEVTOOLS_GLOBAL_HOOK__,!_r.isDisabled&&_r.supportsFiber))try{kl=_r.inject(qm),ut=_r}catch{}var _r;Le.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Jm;Le.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!wu(t))throw Error(_(200));return Ym(e,t,null,n)};Le.createRoot=function(e,t){if(!wu(e))throw Error(_(299));var n=!1,r="",o=cf;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),t=gu(e,1,!1,null,null,n,!1,r,o),e[vt]=t.current,br(e.nodeType===8?e.parentNode:e),new yu(t)};Le.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(_(188)):(e=Object.keys(e).join(","),Error(_(268,e)));return e=Rc(t),e=e===null?null:e.stateNode,e};Le.flushSync=function(e){return pn(e)};Le.hydrate=function(e,t,n){if(!Ll(t))throw Error(_(200));return Il(null,e,t,!0,n)};Le.hydrateRoot=function(e,t,n){if(!wu(e))throw Error(_(405));var r=n!=null&&n.hydratedSources||null,o=!1,l="",i=cf;if(n!=null&&(n.unstable_strictMode===!0&&(o=!0),n.identifierPrefix!==void 0&&(l=n.identifierPrefix),n.onRecoverableError!==void 0&&(i=n.onRecoverableError)),t=af(t,null,e,1,n??null,o,!1,l,i),e[vt]=t.current,br(e),r)for(e=0;e<r.length;e++)n=r[e],o=n._getVersion,o=o(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,o]:t.mutableSourceEagerHydrationData.push(n,o);return new zl(t)};Le.render=function(e,t,n){if(!Ll(t))throw Error(_(200));return Il(null,e,t,!1,n)};Le.unmountComponentAtNode=function(e){if(!Ll(e))throw Error(_(40));return e._reactRootContainer?(pn(function(){Il(null,null,e,!1,function(){e._reactRootContainer=null,e[vt]=null})}),!0):!1};Le.unstable_batchedUpdates=fu;Le.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!Ll(n))throw Error(_(200));if(e==null||e._reactInternals===void 0)throw Error(_(38));return Il(e,t,n,!1,r)};Le.version="18.3.1-next-f1338f8080-20240426"});var Cu=ct((jg,pf)=>{"use strict";function ff(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(ff)}catch(e){console.error(e)}}ff(),pf.exports=df()});var mf=ct(_u=>{"use strict";var hf=Cu();_u.createRoot=hf.createRoot,_u.hydrateRoot=hf.hydrateRoot;var Ug});var Qf=ct(Hl=>{"use strict";var gg=Ye(),vg=Symbol.for("react.element"),yg=Symbol.for("react.fragment"),wg=Object.prototype.hasOwnProperty,Cg=gg.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,_g={key:!0,ref:!0,__self:!0,__source:!0};function Wf(e,t,n){var r,o={},l=null,i=null;n!==void 0&&(l=""+n),t.key!==void 0&&(l=""+t.key),t.ref!==void 0&&(i=t.ref);for(r in t)wg.call(t,r)&&!_g.hasOwnProperty(r)&&(o[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps,t)o[r]===void 0&&(o[r]=t[r]);return{$$typeof:vg,type:e,key:l,ref:i,props:o,_owner:Cg.current}}Hl.Fragment=yg;Hl.jsx=Wf;Hl.jsxs=Wf});var le=ct((c0,Kf)=>{"use strict";Kf.exports=Qf()});var Ag={};Lp(Ag,{mount:()=>Mg});var Et=B(Ye()),mp=B(mf());var T=B(Ye());var gf="",vf,yf=(e,t)=>t;function wf(e,t,n){gf=new URL(e).origin,vf=t,yf=n}function no(e){return gf+"/api/"+e.replace(/^\/+/,"").replace(/^api\/+/,"")}async function Ie(e,t){let n=e.replace(/^\/+/,"").replace(/^api\/+/,"");if(!n.startsWith("public/streams/"))throw new Error("Unsupported chat endpoint");return yf(n,await vf(no(n)))}var Cf={ru:{afterStream:"\u041F\u043E\u0441\u043B\u0435 \u044D\u0444\u0438\u0440\u0430",playTail:"\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0447\u0430\u0442",pauseTail:"\u041F\u0430\u0443\u0437\u0430",showTail:"\u041A \u043A\u043E\u043D\u0446\u0443 \u0447\u0430\u0442\u0430",tailComplete:"\u041A\u043E\u043D\u0435\u0446 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u043E\u0433\u043E \u0447\u0430\u0442\u0430",title:"\u0427\u0430\u0442",messages:"\u0441\u043E\u043E\u0431\u0449.",offset:"\u0421\u0434\u0432\u0438\u0433",settings:"\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0447\u0430\u0442\u0430",offsetAria:"\u0421\u0434\u0432\u0438\u0433 \u0447\u0430\u0442\u0430 \u0432 \u0441\u0435\u043A\u0443\u043D\u0434\u0430\u0445",showDeleted:"\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0435",banPermanent:"\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0437\u0430\u0431\u0430\u043D\u0435\u043D \u043D\u0430\u0432\u0441\u0435\u0433\u0434\u0430",banTimeout:"\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u0442\u0430\u0439\u043C\u0430\u0443\u0442",firstMessage:"1-\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435",firstMessageTitle:"\u041F\u0435\u0440\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u044D\u0442\u043E\u0433\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0432 \u043A\u0430\u043D\u0430\u043B\u0435",loading:"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u0447\u0430\u0442\u2026",loadError:"\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0447\u0430\u0442. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C.",empty:"\u0414\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u0441\u0442\u0440\u0438\u043C\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0447\u0430\u0442\u0430 \u043D\u0435 \u0437\u0430\u043F\u0438\u0441\u0430\u043B\u0438\u0441\u044C.",waiting:"\u041E\u0436\u0438\u0434\u0430\u044E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u0432\u0438\u0434\u0435\u043E\u2026",paused:"\u041F\u0440\u043E\u043A\u0440\u0443\u0442\u043A\u0430 \u0447\u0430\u0442\u0430 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u2014 \u043A \u043D\u043E\u0432\u044B\u043C \u2193",liveEmotes:"\u0422\u0435\u043A\u0443\u0449\u0438\u0435 \u044D\u043C\u043E\u0443\u0442\u044B \u043A\u0430\u043D\u0430\u043B\u0430",liveEmotesHint:"\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u044D\u043C\u043E\u0443\u0442\u044B \u043D\u0430 \u043C\u043E\u043C\u0435\u043D\u0442 \u0437\u0430\u043F\u0438\u0441\u0438. \u0417\u0434\u0435\u0441\u044C \u2014 \u043D\u0430\u0431\u043E\u0440 \u043A\u0430\u043D\u0430\u043B\u0430 \u043D\u0430 7TV \u043F\u0440\u044F\u043C\u043E \u0441\u0435\u0439\u0447\u0430\u0441: \u043F\u0440\u0438\u0433\u043E\u0434\u0438\u0442\u0441\u044F, \u0435\u0441\u043B\u0438 \u0441\u043D\u0430\u043F\u0448\u043E\u0442 \u043D\u0435 \u0441\u043D\u044F\u043B\u0441\u044F \u0438\u043B\u0438 \u043D\u0430\u0431\u043E\u0440 \u0441 \u0442\u0435\u0445 \u043F\u043E\u0440 \u043F\u043E\u043F\u043E\u043B\u043D\u0438\u043B\u0441\u044F.",liveEmotesLoading:"\u0437\u0430\u0433\u0440\u0443\u0436\u0430\u044E\u2026",liveEmotesError:"\u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C",liveEmotesNone:"\u0443 \u043A\u0430\u043D\u0430\u043B\u0430 \u043D\u0435\u0442 7TV",sectionView:"\u0412\u0438\u0434",sectionHighlight:"\u041F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430",sectionFilter:"\u0424\u0438\u043B\u044C\u0442\u0440\u044B",fontSize:"\u0420\u0430\u0437\u043C\u0435\u0440 \u0442\u0435\u043A\u0441\u0442\u0430",emoteSize:"\u0420\u0430\u0437\u043C\u0435\u0440 \u044D\u043C\u043E\u0443\u0442\u043E\u0432",compact:"\u041F\u043B\u043E\u0442\u043D\u043E",showTimestamps:"\u0412\u0440\u0435\u043C\u044F",stripes:"\u041F\u043E\u043B\u043E\u0441\u044B",readableColors:"\u0427\u0438\u0442\u0430\u0435\u043C\u044B\u0435 \u043D\u0438\u043A\u0438",readableColorsHint:"\u041F\u043E\u0434\u043D\u0438\u043C\u0430\u0435\u0442 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0442\u0451\u043C\u043D\u044B\u0435 \u0446\u0432\u0435\u0442\u0430 \u043D\u0438\u043A\u043E\u0432 \u0434\u043E \u0447\u0438\u0442\u0430\u0435\u043C\u044B\u0445, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044F \u043E\u0442\u0442\u0435\u043D\u043E\u043A.",highlightFirst:"\u041F\u0435\u0440\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435",keywords:"\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430",keywordsPlaceholder:"\u0432\u0430\u0448 \u043D\u0438\u043A, \u0440\u043E\u0437\u044B\u0433\u0440\u044B\u0448",keywordsHint:"\u0427\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E. \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0441 \u044D\u0442\u0438\u043C\u0438 \u0441\u043B\u043E\u0432\u0430\u043C\u0438 \u043F\u043E\u043B\u0443\u0447\u0430\u044E\u0442 \u0430\u043A\u0446\u0435\u043D\u0442\u043D\u0443\u044E \u043F\u043E\u043B\u043E\u0441\u0443.",hideCommands:"\u0421\u043A\u0440\u044B\u0442\u044C !\u043A\u043E\u043C\u0430\u043D\u0434\u044B",hiddenUsers:"\u0421\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439",hiddenUsersPlaceholder:"nightbot, streamelements",search:"\u041F\u043E\u0438\u0441\u043A",searchPlaceholder:"\u0442\u0435\u043A\u0441\u0442 \u0438\u043B\u0438 \u043D\u0438\u043A",reset:"\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",filtered:"\u043E\u0442\u0444\u0438\u043B\u044C\u0442\u0440\u043E\u0432\u0430\u043D\u043E",userCardHistory:"\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u0440\u043E\u0448\u043B\u044B\u0445 \u044D\u0444\u0438\u0440\u043E\u0432",userCardHistoryLoading:"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u043F\u0440\u043E\u0448\u043B\u044B\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F\u2026",userCardHistoryRetry:"\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u043B\u0430\u0441\u044C \u2014 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C",userCardHistoryLimit:"\u043F\u043E\u043A\u0430\u0437\u0430\u043D\u044B \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 1000",userCardPastStream:"\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0438\u0437 \u043F\u0440\u043E\u0448\u043B\u043E\u0433\u043E \u044D\u0444\u0438\u0440\u0430",userCardMore:"\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0435\u0449\u0451 100 (\u0441\u0442\u0430\u0440\u0448\u0435)",userCardTitle:"\u0418\u0441\u0442\u043E\u0440\u0438\u044F",userCardHint:"\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0434\u043E \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u0432\u0438\u0434\u0435\u043E",userCardEmpty:"\u041A \u044D\u0442\u043E\u043C\u0443 \u043C\u043E\u043C\u0435\u043D\u0442\u0443 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0435\u0449\u0451 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043F\u0438\u0441\u0430\u043B.",userCardCount:"\u0441\u043E\u043E\u0431\u0449. \u043A \u044D\u0442\u043E\u043C\u0443 \u043C\u043E\u043C\u0435\u043D\u0442\u0443",userCardTotal:"\u0432\u0441\u0435\u0433\u043E \u0437\u0430 \u044D\u0444\u0438\u0440",userCardFirst:"\u043F\u0435\u0440\u0432\u043E\u0435",userCardClose:"\u0417\u0430\u043A\u0440\u044B\u0442\u044C",userCardSeek:"\u041F\u0435\u0440\u0435\u043C\u043E\u0442\u0430\u0442\u044C \u043A \u044D\u0442\u043E\u043C\u0443 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044E",userCardOtherPart:"\u042D\u0442\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0432 \u0434\u0440\u0443\u0433\u043E\u0439 \u0447\u0430\u0441\u0442\u0438 \u0437\u0430\u043F\u0438\u0441\u0438",userCardDeleted:"\u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0445",userCardDrag:"\u041F\u043E\u0442\u044F\u043D\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438 \u043E\u043A\u043D\u043E",userCardSearch:"\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F\u043C",userCardNoMatch:"\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.",offsetSaved:"\u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D \u0434\u043B\u044F \u044D\u0442\u043E\u0439 \u0437\u0430\u043F\u0438\u0441\u0438",metaViewers:"\u0437\u0440\u0438\u0442\u0435\u043B\u0435\u0439",metaPeak:"\u043F\u0438\u043A",metaNoData:"\u0414\u043B\u044F \u044D\u0442\u043E\u0439 \u0437\u0430\u043F\u0438\u0441\u0438 \u0434\u0430\u043D\u043D\u044B\u0445 \u043E\u0431 \u044D\u0444\u0438\u0440\u0435 \u043D\u0435\u0442.",metaReveal:"\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0435\u0441\u044C \u044D\u0444\u0438\u0440",metaRevealHint:"\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u0432\u0438\u0434\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E, \u0434\u043E \u0447\u0435\u0433\u043E \u0434\u043E\u0438\u0433\u0440\u0430\u043B\u0430 \u0437\u0430\u043F\u0438\u0441\u044C, \u2014 \u0438\u043D\u0430\u0447\u0435 \u043F\u043E\u043B\u043E\u0441\u0430 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u0441\u0440\u0430\u0437\u0443 \u0432\u044B\u0434\u0430\u0451\u0442, \u0447\u0442\u043E \u0431\u0443\u0434\u0435\u0442 \u0434\u0430\u043B\u044C\u0448\u0435.",metaAhead:"\u0434\u0430\u043B\u044C\u0448\u0435",metaCategory:"\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F",eventsShow:"\u0421\u0442\u0430\u0432\u043A\u0438 \u0438 \u043E\u043F\u0440\u043E\u0441\u044B",eventsCollapse:"\u0421\u0432\u043E\u0440\u0430\u0447\u0438\u0432\u0430\u0442\u044C \u0441\u0442\u0430\u0432\u043A\u0438 \u0438 \u043E\u043F\u0440\u043E\u0441\u044B",eventsCollapseHint:"\u041E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u043D\u0435\u0433\u043E, \u0447\u0442\u043E\u0431\u044B \u0440\u0430\u0441\u043A\u0440\u044B\u0442\u044C. \u0412\u044B\u0431\u043E\u0440 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u0434\u043B\u044F \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0445 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u043E\u0432.",eventCollapse:"\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443",eventExpand:"\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443",eventsHint:"\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0441\u0442\u0430\u0432\u043A\u0438 \u0438\u043B\u0438 \u043E\u043F\u0440\u043E\u0441\u0430 \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u0435\u0442 \u0442\u0430\u043C \u0436\u0435, \u0433\u0434\u0435 \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u043B\u0430 \u0432 \u044D\u0444\u0438\u0440\u0435, \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043F\u043E \u0445\u043E\u0434\u0443 \u0437\u0430\u043F\u0438\u0441\u0438. \u0418\u0442\u043E\u0433 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0441\u043B\u0435 \u0442\u043E\u0433\u043E, \u043A\u0430\u043A \u0441\u0442\u0440\u0438\u043C\u0435\u0440 \u0435\u0433\u043E \u043E\u0431\u044A\u044F\u0432\u0438\u043B.",eventPrediction:"\u0421\u0442\u0430\u0432\u043A\u0430",eventPoll:"\u041E\u043F\u0440\u043E\u0441",eventOpen:"\u041F\u0440\u0438\u0451\u043C \u0441\u0442\u0430\u0432\u043E\u043A",eventLocked:"\u0421\u0442\u0430\u0432\u043A\u0438 \u0437\u0430\u043A\u0440\u044B\u0442\u044B",eventResolved:"\u0418\u0442\u043E\u0433",eventCancelled:"\u041E\u0442\u043C\u0435\u043D\u0435\u043D\u043E \u2014 \u043E\u0447\u043A\u0438 \u0432\u0435\u0440\u043D\u0443\u043B\u0438",eventWinner:"\u041F\u043E\u0431\u0435\u0434\u0438\u043B",eventPollDone:"\u041E\u043F\u0440\u043E\u0441 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D",eventPoints:"\u043E\u0447\u043A\u043E\u0432",eventVotes:"\u0433\u043E\u043B\u043E\u0441\u043E\u0432",eventUsers:"\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u043E\u0432",eventBetOn:"\u041F\u043E\u0441\u0442\u0430\u0432\u0438\u043B \u043D\u0430",eventReturn:"\u041A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442",eventAlreadyOpen:"\u0428\u043B\u0430 \u0434\u043E \u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u043F\u0438\u0441\u0438"},en:{afterStream:"After the stream",playTail:"Continue chat",pauseTail:"Pause",showTail:"Jump to chat end",tailComplete:"End of saved chat",title:"Chat",messages:"messages",offset:"Offset",settings:"Chat settings",offsetAria:"Chat offset in seconds",showDeleted:"Show deleted",banPermanent:"User was banned permanently",banTimeout:"User was timed out",firstMessage:"First message",firstMessageTitle:"The author's first ever message in this channel",loading:"Loading chat\u2026",loadError:"Could not load chat. Check the server connection.",empty:"No chat messages were captured for this stream.",waiting:"Waiting for messages at this video time\u2026",paused:"Chat paused \u2014 jump to latest \u2193",liveEmotes:"Channel's current emotes",liveEmotesHint:"By default the emotes are the ones from the time of recording. This shows the channel's 7TV set as it is now \u2014 useful when no snapshot was taken, or the set has grown since.",liveEmotesLoading:"loading\u2026",liveEmotesError:"could not load",liveEmotesNone:"channel has no 7TV",sectionView:"Appearance",sectionHighlight:"Highlighting",sectionFilter:"Filters",fontSize:"Text size",emoteSize:"Emote size",compact:"Compact",showTimestamps:"Timestamps",stripes:"Stripes",readableColors:"Readable names",readableColorsHint:"Lifts author colours that are too dark to read, keeping their hue.",highlightFirst:"First message",keywords:"Keywords",keywordsPlaceholder:"your name, giveaway",keywordsHint:"Comma-separated. Messages containing them get an accent bar.",hideCommands:"Hide !commands",hiddenUsers:"Hide users",hiddenUsersPlaceholder:"nightbot, streamelements",search:"Search",searchPlaceholder:"text or name",reset:"Reset settings",filtered:"filtered",userCardHistory:"Previous broadcasts",userCardHistoryLoading:"Loading earlier messages\u2026",userCardHistoryRetry:"History could not load \u2014 retry",userCardHistoryLimit:"latest 1000 shown",userCardPastStream:"Message from an earlier broadcast",userCardMore:"Show 100 more (older)",userCardTitle:"History",userCardHint:"Messages up to the current video time",userCardEmpty:"This user had not written anything by this point.",userCardCount:"messages so far",userCardTotal:"total this stream",userCardFirst:"first",userCardClose:"Close",userCardSeek:"Jump to this message",userCardOtherPart:"This message is in another part of the recording",userCardDeleted:"deleted",userCardDrag:"Drag to move the window",userCardSearch:"Search messages",userCardNoMatch:"Nothing found.",offsetSaved:"saved for this recording",metaViewers:"viewers",metaPeak:"peak",metaNoData:"No broadcast data was recorded for this stream.",metaReveal:"Reveal whole stream",metaRevealHint:"By default only the part the recording has reached is shown \u2014 otherwise the category strip gives away what happens later.",metaAhead:"ahead",metaCategory:"Category",eventsShow:"Predictions and polls",eventsCollapse:"Collapse predictions and polls",eventsCollapseHint:"Keep only the card header. Click it to expand. Your choice is saved for future visits.",eventCollapse:"Collapse card",eventExpand:"Expand card",eventsHint:"A prediction or poll card appears where it appeared live and updates as the recording plays. The result shows only once the streamer called it.",eventPrediction:"Prediction",eventPoll:"Poll",eventOpen:"Betting open",eventLocked:"Bets closed",eventResolved:"Result",eventCancelled:"Cancelled \u2014 points refunded",eventWinner:"Winner",eventPollDone:"Poll finished",eventPoints:"points",eventVotes:"votes",eventUsers:"backers",eventBetOn:"Bet on",eventReturn:"Return",eventAlreadyOpen:"Was already running when the recording began"}},gn={broadcaster:{ru:"\u0421\u0442\u0440\u0438\u043C\u0435\u0440",en:"Broadcaster",badge:"\u0421\u0422\u0420"},moderator:{ru:"\u041C\u043E\u0434\u0435\u0440\u0430\u0442\u043E\u0440\u044B",en:"Moderators",badge:"MOD"},vip:{ru:"VIP",en:"VIP",badge:"VIP"},subscriber:{ru:"\u041F\u043E\u0434\u043F\u0438\u0441\u0447\u0438\u043A\u0438",en:"Subscribers",badge:"SUB"},verified:{ru:"\u0421\u0442\u0440\u0438\u043C\u0435\u0440\u044B / \u2713",en:"Streamers / \u2713",badge:"\u2713"},staff:{ru:"\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B",en:"Staff",badge:"STAFF"},founder:{ru:"\u041E\u0441\u043D\u043E\u0432\u0430\u0442\u0435\u043B\u0438",en:"Founders",badge:"FND"},og:{ru:"OG",en:"OG",badge:"OG"},sub_gifter:{ru:"\u0414\u0430\u0440\u0438\u0442\u0435\u043B\u0438",en:"Gifters",badge:"GIFT"},turbo:{ru:"Turbo",en:"Turbo",badge:"T"},artist:{ru:"\u0425\u0443\u0434\u043E\u0436\u043D\u0438\u043A\u0438",en:"Artists",badge:"ART"}};var Pe=B(Ye()),kf=["broadcaster","moderator","vip","subscriber","verified","staff"],vn={fontPx:13,emotePx:28,compact:!1,showTimestamps:!0,stripes:!1,readableColors:!0,showDeleted:!0,useLiveEmotes:!1,highlightRoles:["broadcaster","moderator"],highlightFirstMessage:!0,keywords:"",hideCommands:!1,hiddenUsers:"",revealTimeline:!1,showEvents:!0,collapseEvents:!1,showBets:!0},_t={fontPx:{min:10,max:24},emotePx:{min:16,max:64}},xf="tsr-chat-prefs",eg="tsr-chat-show-deleted",tg="tsr-chat-live-emotes";function _f(e,t,n,r){let o=Number(e);return Number.isFinite(o)?Math.min(n,Math.max(t,Math.round(o))):r}function ng(){if(typeof window>"u")return vn;let e={};try{let t=window.localStorage.getItem(xf);t&&(e=JSON.parse(t))}catch{}try{e.showDeleted===void 0&&(e.showDeleted=window.localStorage.getItem(eg)!=="0"),e.useLiveEmotes===void 0&&(e.useLiveEmotes=window.localStorage.getItem(tg)==="1")}catch{}return{...vn,...e,fontPx:_f(e.fontPx,_t.fontPx.min,_t.fontPx.max,vn.fontPx),emotePx:_f(e.emotePx,_t.emotePx.min,_t.emotePx.max,vn.emotePx),highlightRoles:Array.isArray(e.highlightRoles)?e.highlightRoles:vn.highlightRoles}}function Ef(){let[e,t]=(0,Pe.useState)(vn),[n,r]=(0,Pe.useState)(!1);(0,Pe.useEffect)(()=>{t(ng()),r(!0)},[]),(0,Pe.useEffect)(()=>{if(n)try{window.localStorage.setItem(xf,JSON.stringify(e))}catch{}},[e,n]);let o=(0,Pe.useCallback)((s,u)=>{t(d=>({...d,[s]:u}))},[]),l=(0,Pe.useCallback)(s=>{t(u=>({...u,highlightRoles:u.highlightRoles.includes(s)?u.highlightRoles.filter(d=>d!==s):[...u.highlightRoles,s]}))},[]),i=(0,Pe.useCallback)(()=>t(vn),[]);return{prefs:e,update:o,toggleRole:l,reset:i}}function Sf(e,t){let[n,r]=(0,Pe.useState)(t),[o,l]=(0,Pe.useState)(!1),i=e?`tsr-chat-offset:${e}`:null;return(0,Pe.useEffect)(()=>{if(l(!1),!i){r(t),l(!0);return}let s=null;try{let u=window.localStorage.getItem(i);if(u!==null){let d=Number(u);Number.isFinite(d)&&(s=d)}}catch{}r(s??t),l(!0)},[i,t]),(0,Pe.useEffect)(()=>{if(!(!o||!i))try{n===t?window.localStorage.removeItem(i):window.localStorage.setItem(i,String(n))}catch{}},[n,t,i,o]),[n,r]}function ku(e){return e.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean)}function $l(e){if(!e)return"#9ca3af";let t=/^#?([0-9a-f]{6})$/i.exec(e.trim());if(!t)return e;let n=parseInt(t[1],16),r=n>>16&255,o=n>>8&255,l=n&255,i=(.2126*r+.7152*o+.0722*l)/255;if(i>=.35)return e;let s=.35/Math.max(i,.04);return r=Math.min(255,Math.round(r*s)||90),o=Math.min(255,Math.round(o*s)||90),l=Math.min(255,Math.round(l*s)||90),`rgb(${r}, ${o}, ${l})`}var Df=/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Ff=/[\0-\x1F\x7F-\x9F]/;var Pf=/[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B4E\u1B4F\u1B5A-\u1B60\u1B7D-\u1B7F\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDD6E\uDEAD\uDED0\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9\uDFD4\uDFD5\uDFD7\uDFD8]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09\uDFE1]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDD6D-\uDD6F\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD839\uDDFF|\uD83A[\uDD5E\uDD5F]/;var Nf=/[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;var rg=class{constructor(e={}){ie(this,"src_Any",Df.source);ie(this,"src_Cc",Ff.source);ie(this,"src_Z",Nf.source);ie(this,"src_P",Pf.source);ie(this,"src_ZPCc",[this.src_Z,this.src_P,this.src_Cc].join("|"));ie(this,"src_ZCc",[this.src_Z,this.src_Cc].join("|"));ie(this,"cache",{});ie(this,"opts",{maxLength:1e4,urlAuth:!1,schema_names:[]});this.opts={...this.opts,...e}}set(e={}){return this.opts={...this.opts,...e},this.cache={},this}escapeRE(e){return e.replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&")}nestedPairRE(e,t,n=4){let r=this.escapeRE(e),o=this.escapeRE(t),l=`(?:(?!${this.src_ZCc}|${r}|${o}).)`,i=`${r}${l}{0,1000}${o}`;for(let s=2;s<=n;s++)i=`${r}(?:${l}|${i}){0,1000}${o}`;return i}get_text_separators(){var e;return(e=this.cache).text_separators??(e.text_separators=/[><\uff5c]/)}get_pseudo_letter(){var e;return(e=this.cache).src_pseudo_letter??(e.src_pseudo_letter=new RegExp(`(?:(?!${this.get_text_separators().source}|${this.src_ZPCc})${this.src_Any})`))}get_ipv4_addr(){var e;return(e=this.cache).src_ip4??(e.src_ip4=new RegExp("(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])[.]){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])"))}get_ipv6_addr(){var n;let e="[0-9A-Fa-f]{1,4}",t=`(?:(?:${e}:${e})|${this.get_ipv4_addr().source})`;return(n=this.cache).src_ip6_addr??(n.src_ip6_addr=new RegExp(`(?:(?:${e}:){6}${t}|::(?:${e}:){5}${t}|(?:${e})?::(?:${e}:){4}${t}|(?:(?:${e}:){0,1}${e})?::(?:${e}:){3}${t}|(?:(?:${e}:){0,2}${e})?::(?:${e}:){2}${t}|(?:(?:${e}:){0,3}${e})?::${e}:${t}|(?:(?:${e}:){0,4}${e})?::${t}|(?:(?:${e}:){0,5}${e})?::${e}|(?:(?:${e}:){0,6}${e})?::)`))}get_ipv6_url_host(){var e;return(e=this.cache).src_ip6_host??(e.src_ip6_host=new RegExp(`\\[${this.get_ipv6_addr().source}\\]`))}get_ipv6_mail_host(){var e;return(e=this.cache).src_ipv6_mail_host??(e.src_ipv6_mail_host=new RegExp(`\\[IPv6:${this.get_ipv6_addr().source}\\]`))}get_auth(){var e;return(e=this.cache).src_auth??(e.src_auth=new RegExp(`(?:(?:(?!${this.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`))}get_port(){var e;return(e=this.cache).src_port??(e.src_port=new RegExp("(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?"))}get_host_terminator(){var e;return(e=this.cache).src_host_terminator??(e.src_host_terminator=new RegExp(`(?=$|${this.get_text_separators().source}|${this.src_ZPCc})(?!${this.opts["---"]?"-(?!--)|":"-|"}_|:\\d|\\.-|\\.(?!$|${this.src_ZPCc}))`))}get_path_terminator(){var e;return(e=this.cache).src_path_terminator??(e.src_path_terminator=new RegExp(`${this.src_ZPCc}|${this.get_text_separators().source}`))}get_path(){var e;return(e=this.cache).src_path??(e.src_path=new RegExp(`(?:[/?#](?:${this.nestedPairRE("[","]")}|${this.nestedPairRE("(",")")}|${this.nestedPairRE("{","}")}|\\"(?:(?!${this.src_ZCc}|["]).){1,100}\\"|\\'(?:(?!${this.src_ZCc}|[']).){1,100}\\'|\\'(?=${this.get_pseudo_letter().source}|[-])|\\.{2,20}[:]?[a-zA-Z0-9%/&]|\\.(?!${this.src_ZCc}|[.]|$)|`+(this.opts["---"]?"\\-(?!--(?:[^-]|$))(?:-{0,19})|":"\\-{1,20}|")+`,(?!${this.src_ZCc}|$)|;(?!${this.src_ZCc}|$)|\\!{1,20}(?!${this.src_ZCc}|[!]|$)|\\?(?!${this.src_ZCc}|[?]|$)|`+this.get_path_extra().source+`[\\\\/:%@#&=_~*]|(?!${this.get_path_terminator().source}).){1,${this.opts.maxLength}}|\\/)?`))}get_mail_name(){var e;return(e=this.cache).src_mail_name??(e.src_mail_name=new RegExp("[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9](?:[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9]|[.](?=[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9])){0,63}"))}get_xn(){var e;return(e=this.cache).src_xn??(e.src_xn=new RegExp("xn--[a-z0-9\\-]{1,59}"))}get_tld(){if(this.cache.tld)return this.cache.tld;let e=[...new Set(this.opts.tlds||[])].sort().reverse().join("|");return this.cache.tld=new RegExp(`${e||"$#none#$"}|${this.get_xn().source}`),this.cache.tld}get_domain_root(){var e;return(e=this.cache).src_domain_root??(e.src_domain_root=new RegExp("(?:"+this.get_xn().source+`|${this.get_pseudo_letter().source}{1,63})`))}get_domain(){var e;return(e=this.cache).src_domain??(e.src_domain=new RegExp("(?:"+this.get_xn().source+`|(?:${this.get_pseudo_letter().source})|(?:${this.get_pseudo_letter().source}(?:-|${this.get_pseudo_letter().source}){0,61}${this.get_pseudo_letter().source}))`))}get_url_host_port(){var e;return(e=this.cache).url_host_port??(e.url_host_port=new RegExp("(?:"+this.get_ipv6_url_host().source+`|(?:(?:(?:${this.get_domain().source})\\.){0,10}${this.get_domain().source}))`+this.get_port().source+this.get_host_terminator().source))}get_fuzzy_url_host_port(){var e;return(e=this.cache).fuzzy_url_host_port??(e.fuzzy_url_host_port=new RegExp("(?:"+(this.opts.fuzzyIP?this.get_ipv4_addr().source+"|":"")+`(?:(?:(?:${this.get_domain().source})\\.){1,10}(?:${this.get_tld().source})))`+this.get_host_terminator().source))}get_mail_host(){var e;return(e=this.cache).src_mail_host??(e.src_mail_host=new RegExp("(?:"+this.get_ipv6_mail_host().source+`|(?:(?:(?:${this.get_domain().source})\\.){0,4}${this.get_domain().source}))`+this.get_host_terminator().source))}get_fuzzy_mail_host(){var e;return(e=this.cache).src_fuzzy_mail_host??(e.src_fuzzy_mail_host=new RegExp("(?:"+this.get_ipv6_mail_host().source+`|(?:(?:(?:${this.get_domain().source})[.]){1,4}${this.get_domain_root().source}))`+this.get_host_terminator().source))}get_path_extra(){var e;return(e=this.cache).src_path_extra??(e.src_path_extra=new RegExp(""))}get_fuzzy_mail_host_search(){var e;return(e=this.cache).mail_fuzzy_host_search??(e.mail_fuzzy_host_search=new RegExp(`@${this.get_fuzzy_mail_host().source}`,"ig"))}get_fuzzy_link_search(){var e;return(e=this.cache).link_fuzzy_search??(e.link_fuzzy_search=new RegExp(`(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uFF5C]|${this.src_ZPCc}))(?:(?![$+<=>^\`|\uFF5C])${this.get_fuzzy_url_host_port().source}${this.get_path().source})`,"ig"))}get_http_validator(){var e;return(e=this.cache).http_validator??(e.http_validator=new RegExp("\\/\\/"+(this.opts.urlAuth?this.get_auth().source:"")+this.get_url_host_port().source+this.get_path().source,"iy"))}get_relative_proto_validator(){var e;return(e=this.cache).relative_proto_validator??(e.relative_proto_validator=new RegExp((this.opts.urlAuth?this.get_auth().source:"")+`(?:localhost|${this.get_ipv6_url_host().source}|(?:(?:${this.get_domain().source})[.]){1,10}${this.get_domain_root().source})`+this.get_port().source+this.get_host_terminator().source+this.get_path().source,"iy"))}get_mail_name_validator(){var e;return(e=this.cache).mail_name_validator??(e.mail_name_validator=new RegExp(`(?:^|${this.get_text_separators().source}|"|\\(|${this.src_ZCc})(${this.get_mail_name().source})$`))}get_mailto_validator(){var e;return(e=this.cache).mailto_validator??(e.mailto_validator=new RegExp(`${this.get_mail_name().source}@${this.get_mail_host().source}`,"iy"))}get_schema_names(){var e;return(e=this.cache).schema_names??(e.schema_names=new RegExp((this.opts.schema_names||[]).map(t=>this.escapeRE(t)).join("|")))}get_schema_search(){var e;return(e=this.cache).schema_search??(e.schema_search=new RegExp(`(^|(?!_)(?:[><\uFF5C]|${this.src_ZPCc}))(${this.get_schema_names().source})`,"ig"))}get_schema_at_start(){var e;return(e=this.cache).schema_at_start??(e.schema_at_start=new RegExp(`^${this.get_schema_search().source}`,"i"))}},xu={validate:(e,t,n)=>{let r=n.re.get_http_validator();r.lastIndex=t;let o=r.exec(e);return o?o[0].length:0},normalize:(e,t)=>t.normalize(e)},og={"http:":xu,"https:":xu,"ftp:":xu,"//":{validate:function(e,t,n){let r=n.re.get_relative_proto_validator();r.lastIndex=t;let o=r.exec(e);return o?t>=3&&e[t-3]===":"||t>=3&&e[t-3]==="/"?0:o[0].length:0},normalize:(e,t)=>t.normalize(e)},"mailto:":{validate:function(e,t,n){let r=n.re.get_mailto_validator();r.lastIndex=t;let o=r.exec(e);return o?o[0].length:0},normalize:(e,t)=>t.normalize(e)}},lg="a:cdefgilmnoqrstuwxz|b:abdefghijmnorstvwyz|c:acdfghiklmnoruvwxyz|d:ejkmoz|e:cegrstu|f:ijkmor|g:abdefghilmnpqrstuwy|h:kmnrtu|i:delmnoqrst|j:emop|k:eghimnprwyz|l:abcikrstuvy|m:acdeghklmnopqrstuvwxyz|n:acefgilopruz|o:m|p:aefghklmnrstwy|q:a|r:eosuw|s:abcdeghijklmnortuvxyz|t:cdfghjklmnortvwz|u:agksyz|v:aceginu|w:fs|y:et|z:amw",ig="biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444";function sg(){let e=ig.split("|");return lg.split("|").forEach(t=>{let n=t.indexOf(":"),r=t.slice(0,n);for(let o of t.slice(n+1))e.push(r+o)}),e}var ug={fuzzyLink:!1,fuzzyEmail:!0,fuzzyIP:!1,"---":!1,tlds:sg(),urlAuth:!1,maxLength:1e4},Tf=class{constructor(e,t,n,r){ie(this,"schema");ie(this,"index");ie(this,"lastIndex");ie(this,"raw");ie(this,"text");ie(this,"url");let o=e.slice(n,r);this.schema=t.toLowerCase(),this.index=n,this.lastIndex=r,this.raw=o,this.text=o,this.url=o}},Rf=class{constructor(e={}){ie(this,"__opts__");ie(this,"__schemas__");ie(this,"re");let{rebuilder:t,...n}=e;this.__opts__={...ug,...n},this.__schemas__={...og},this.re=t||new rg,this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)})}add(e,t=null){if(!t)delete this.__schemas__[e];else{let n={normalize:(r,o)=>o.normalize(r),...t};this.__schemas__[e]=n}return this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)}),this}set(e={}){return this.__opts__={...this.__opts__,...e},this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)}),this}test(e){if(!e.length)return!1;let t,n;for(n=this.re.get_schema_search(),n.lastIndex=0;(t=n.exec(e))!==null;)if(this.testSchemaAt(e,t[2],n.lastIndex))return!0;if(this.__opts__.fuzzyLink&&this.__schemas__["http:"]&&(n=this.re.get_fuzzy_link_search(),n.lastIndex=0,n.exec(e)!==null))return!0;if(this.__opts__.fuzzyEmail&&this.__schemas__["mailto:"]&&e.indexOf("@")>=0){let r=this.re.get_fuzzy_mail_host_search(),o=this.re.get_mail_name_validator();for(r.lastIndex=0;(t=r.exec(e))!==null;){let l=e.slice(Math.max(0,t.index-65),t.index);if(o.test(l))return!0}}return!1}testSchemaAt(e,t,n){return this.__schemas__[t.toLowerCase()]?this.__schemas__[t.toLowerCase()].validate(e.slice(0,n+this.__opts__.maxLength),n,this):0}match(e){let t=[],n=this.re.get_schema_search(),r,o,l,i,s,u,d=!1,h=!1,m=!1,f=0;if(!e.length)return null;for(n.lastIndex=0,this.__opts__.fuzzyLink&&this.__schemas__["http:"]&&(r=this.re.get_fuzzy_link_search(),r.lastIndex=0),this.__opts__.fuzzyEmail&&this.__schemas__["mailto:"]&&(o=this.re.get_fuzzy_mail_host_search(),o.lastIndex=0,l=this.re.get_mail_name_validator());;){let g=Math.max(f-1,0);if(o&&l&&!m&&(!s||s.index<f))for(o.lastIndex<g&&(o.lastIndex=g);;){let a=o.exec(e);if(!a){m=!0,s=void 0;break}let p=l.exec(e.slice(Math.max(0,a.index-65),a.index));if(p){if(s={schema:"mailto:",index:a.index-p[1].length,lastIndex:a.index+a[0].length},s.index>=f)break;o.lastIndex<g&&(o.lastIndex=g)}}if(r&&!h&&(!i||i.index<f))for(r.lastIndex<g&&(r.lastIndex=g);;){let a=r.exec(e);if(!a){h=!0,i=void 0;break}if(i={schema:"",index:a.index+a[1].length,lastIndex:a.index+a[0].length},i.index>=f)break;r.lastIndex<g&&(r.lastIndex=g)}let w=s;(!w||i&&(i.index<w.index||i.index===w.index&&i.lastIndex>w.lastIndex))&&(w=i);let v;if(!d)for(;;){if(!u){n.lastIndex<g&&(n.lastIndex=g);let y=n.exec(e);if(!y){d=!0;break}u={schema:y[2],index:y.index+y[1].length,lastIndex:y.index+y[0].length}}if(u.index<f){u=void 0;continue}if(w&&u.index>w.index)break;let a=u;u=void 0;let p=this.testSchemaAt(e,a.schema,a.lastIndex);if(p){v={schema:a.schema,index:a.index,lastIndex:a.lastIndex+p};break}}let C=v;if((!C||s&&(s.index<C.index||s.index===C.index&&s.lastIndex>C.lastIndex))&&(C=s),(!C||i&&(i.index<C.index||i.index===C.index&&i.lastIndex>C.lastIndex))&&(C=i),!C)break;C===s?s=void 0:C===i&&(i=void 0);let c=new Tf(e,C.schema,C.index,C.lastIndex);c.schema?this.__schemas__[c.schema].normalize(c,this):this.normalize(c),t.push(c),f=C.lastIndex}return t.length?t:null}matchAtStart(e){if(!e.length)return null;let t=this.re.get_schema_at_start().exec(e);if(!t)return null;let n=this.testSchemaAt(e,t[2],t[0].length);if(!n)return null;let r=new Tf(e,t[2],t.index+t[1].length,t.index+t[0].length+n);return this.__schemas__[r.schema].normalize(r,this),r}tlds(e,t=!1){return e=Array.isArray(e)?e:[e],t?this.__opts__.tlds=this.__opts__.tlds.concat(e):this.__opts__.tlds=e,this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)}),this}normalize(e){e.schema||(e.url=`http://${e.url}`),e.schema==="mailto:"&&!/^mailto:/i.test(e.url)&&(e.url=`mailto:${e.url}`)}};var Mf=["aaa","aarp","abb","abbott","abbvie","abc","able","abogado","abudhabi","ac","academy","accenture","accountant","accountants","aco","actor","ad","ads","adult","ae","aeg","aero","aetna","af","afl","africa","ag","agakhan","agency","ai","aig","airbus","airforce","airtel","akdn","al","alibaba","alipay","allfinanz","allstate","ally","alsace","alstom","am","amazon","americanexpress","americanfamily","amex","amfam","amica","amsterdam","analytics","android","anquan","anz","ao","aol","apartments","app","apple","aq","aquarelle","ar","arab","aramco","archi","army","arpa","art","arte","as","asda","asia","associates","at","athleta","attorney","au","auction","audi","audible","audio","auspost","author","auto","autos","aw","aws","ax","axa","az","azure","ba","baby","baidu","banamex","band","bank","bar","barcelona","barclaycard","barclays","barefoot","bargains","baseball","basketball","bauhaus","bayern","bb","bbc","bbt","bbva","bcg","bcn","bd","be","beats","beauty","beer","berlin","best","bestbuy","bet","bf","bg","bh","bharti","bi","bible","bid","bike","bing","bingo","bio","biz","bj","black","blackfriday","blockbuster","blog","bloomberg","blue","bm","bms","bmw","bn","bnpparibas","bo","boats","boehringer","bofa","bom","bond","boo","book","booking","bosch","bostik","boston","bot","boutique","box","br","bradesco","bridgestone","broadway","broker","brother","brussels","bs","bt","build","builders","business","buy","buzz","bv","bw","by","bz","bzh","ca","cab","cafe","cal","call","calvinklein","cam","camera","camp","canon","capetown","capital","capitalone","car","caravan","cards","care","career","careers","cars","casa","case","cash","casino","cat","catering","catholic","cba","cbn","cbre","cc","cd","center","ceo","cern","cf","cfa","cfd","cg","ch","chanel","channel","charity","chase","chat","cheap","chintai","christmas","chrome","church","ci","cipriani","circle","cisco","citadel","citi","citic","city","ck","cl","claims","cleaning","click","clinic","clinique","clothing","cloud","club","clubmed","cm","cn","co","coach","codes","coffee","college","cologne","com","commbank","community","company","compare","computer","comsec","condos","construction","consulting","contact","contractors","cooking","cool","coop","corsica","country","coupon","coupons","courses","cpa","cr","credit","creditcard","creditunion","cricket","crown","crs","cruise","cruises","cu","cuisinella","cv","cw","cx","cy","cymru","cyou","cz","dad","dance","data","date","dating","datsun","day","dclk","dds","de","deal","dealer","deals","degree","delivery","dell","deloitte","delta","democrat","dental","dentist","desi","design","dev","dhl","diamonds","diet","digital","direct","directory","discount","discover","dish","diy","dj","dk","dm","dnp","do","docs","doctor","dog","domains","dot","download","drive","dtv","dubai","dupont","durban","dvag","dvr","dz","earth","eat","ec","eco","edeka","edu","education","ee","eg","email","emerck","energy","engineer","engineering","enterprises","epson","equipment","er","ericsson","erni","es","esq","estate","et","eu","eurovision","eus","events","exchange","expert","exposed","express","extraspace","fage","fail","fairwinds","faith","family","fan","fans","farm","farmers","fashion","fast","fedex","feedback","ferrari","ferrero","fi","fidelity","fido","film","final","finance","financial","fire","firestone","firmdale","fish","fishing","fit","fitness","fj","fk","flickr","flights","flir","florist","flowers","fly","fm","fo","foo","food","football","ford","forex","forsale","forum","foundation","fox","fr","free","fresenius","frl","frogans","frontier","ftr","fujitsu","fun","fund","furniture","futbol","fyi","ga","gal","gallery","gallo","gallup","game","games","gap","garden","gay","gb","gbiz","gd","gdn","ge","gea","gent","genting","george","gf","gg","ggee","gh","gi","gift","gifts","gives","giving","gl","glass","gle","global","globo","gm","gmail","gmbh","gmo","gmx","gn","godaddy","gold","goldpoint","golf","goo","goodyear","goog","google","gop","got","gov","gp","gq","gr","grainger","graphics","gratis","green","gripe","grocery","group","gs","gt","gu","gucci","guge","guide","guitars","guru","gw","gy","hair","hamburg","hangout","haus","hbo","hdfc","hdfcbank","health","healthcare","help","helsinki","here","hermes","hiphop","hisamitsu","hitachi","hiv","hk","hkt","hm","hn","hockey","holdings","holiday","homedepot","homegoods","homes","homesense","honda","horse","hospital","host","hosting","hot","hotels","hotmail","house","how","hr","hsbc","ht","hu","hughes","hyatt","hyundai","ibm","icbc","ice","icu","id","ie","ieee","ifm","ikano","il","im","imamat","imdb","immo","immobilien","in","inc","industries","infiniti","info","ing","ink","institute","insurance","insure","int","international","intuit","investments","io","ipiranga","iq","ir","irish","is","ismaili","ist","istanbul","it","itau","itv","jaguar","java","jcb","je","jeep","jetzt","jewelry","jio","jll","jm","jmp","jnj","jo","jobs","joburg","jot","joy","jp","jpmorgan","jprs","juegos","juniper","kaufen","kddi","ke","kerryhotels","kerryproperties","kfh","kg","kh","ki","kia","kids","kim","kindle","kitchen","kiwi","km","kn","koeln","komatsu","kosher","kp","kpmg","kpn","kr","krd","kred","kuokgroup","kw","ky","kyoto","kz","la","lacaixa","lamborghini","lamer","land","landrover","lanxess","lasalle","lat","latino","latrobe","law","lawyer","lb","lc","lds","lease","leclerc","lefrak","legal","lego","lexus","lgbt","li","lidl","life","lifeinsurance","lifestyle","lighting","like","lilly","limited","limo","lincoln","link","live","living","lk","llc","llp","loan","loans","locker","locus","lol","london","lotte","lotto","love","lpl","lplfinancial","lr","ls","lt","ltd","ltda","lu","lundbeck","luxe","luxury","lv","ly","ma","madrid","maif","maison","makeup","man","management","mango","map","market","marketing","markets","marriott","marshalls","mattel","mba","mc","mckinsey","md","me","med","media","meet","melbourne","meme","memorial","men","menu","merckmsd","mg","mh","miami","microsoft","mil","mini","mint","mit","mitsubishi","mk","ml","mlb","mls","mm","mma","mn","mo","mobi","mobile","moda","moe","moi","mom","monash","money","monster","mormon","mortgage","moscow","moto","motorcycles","mov","movie","mp","mq","mr","ms","msd","mt","mtn","mtr","mu","museum","music","mv","mw","mx","my","mz","na","nab","nagoya","name","navy","nba","nc","ne","nec","net","netbank","netflix","network","neustar","new","news","next","nextdirect","nexus","nf","nfl","ng","ngo","nhk","ni","nico","nike","nikon","ninja","nissan","nissay","nl","no","nokia","norton","now","nowruz","nowtv","np","nr","nra","nrw","ntt","nu","nyc","nz","obi","observer","office","okinawa","olayan","olayangroup","ollo","om","omega","one","ong","onl","online","ooo","open","oracle","orange","org","organic","origins","osaka","otsuka","ott","ovh","pa","page","panasonic","paris","pars","partners","parts","party","pay","pccw","pe","pet","pf","pfizer","pg","ph","pharmacy","phd","philips","phone","photo","photography","photos","physio","pics","pictet","pictures","pid","pin","ping","pink","pioneer","pizza","pk","pl","place","play","playstation","plumbing","plus","pm","pn","pnc","pohl","poker","politie","porn","post","pr","praxi","press","prime","pro","prod","productions","prof","progressive","promo","properties","property","protection","pru","prudential","ps","pt","pub","pw","pwc","py","qa","qpon","quebec","quest","racing","radio","re","read","realestate","realtor","realty","recipes","red","redumbrella","rehab","reise","reisen","reit","reliance","ren","rent","rentals","repair","report","republican","rest","restaurant","review","reviews","rexroth","rich","richardli","ricoh","ril","rio","rip","ro","rocks","rodeo","rogers","room","rs","rsvp","ru","rugby","ruhr","run","rw","rwe","ryukyu","sa","saarland","safe","safety","sakura","sale","salon","samsclub","samsung","sandvik","sandvikcoromant","sanofi","sap","sarl","sas","save","saxo","sb","sbi","sbs","sc","scb","schaeffler","schmidt","scholarships","school","schule","schwarz","science","scot","sd","se","search","seat","secure","security","seek","select","sener","services","seven","sew","sex","sexy","sfr","sg","sh","shangrila","sharp","shell","shia","shiksha","shoes","shop","shopping","shouji","show","si","silk","sina","singles","site","sj","sk","ski","skin","sky","skype","sl","sling","sm","smart","smile","sn","sncf","so","soccer","social","softbank","software","sohu","solar","solutions","song","sony","soy","spa","space","sport","spot","sr","srl","ss","st","stada","staples","star","statebank","statefarm","stc","stcgroup","stockholm","storage","store","stream","studio","study","style","su","sucks","supplies","supply","support","surf","surgery","suzuki","sv","swatch","swiss","sx","sy","sydney","systems","sz","tab","taipei","talk","taobao","target","tatamotors","tatar","tattoo","tax","taxi","tc","tci","td","tdk","team","tech","technology","tel","temasek","tennis","teva","tf","tg","th","thd","theater","theatre","tiaa","tickets","tienda","tips","tires","tirol","tj","tjmaxx","tjx","tk","tkmaxx","tl","tm","tmall","tn","to","today","tokyo","tools","top","toray","toshiba","total","tours","town","toyota","toys","tr","trade","trading","training","travel","travelers","travelersinsurance","trust","trv","tt","tube","tui","tunes","tushu","tv","tvs","tw","tz","ua","ubank","ubs","ug","uk","unicom","university","uno","uol","ups","us","uy","uz","va","vacations","vana","vanguard","vc","ve","vegas","ventures","verisign","verm\xF6gensberater","verm\xF6gensberatung","versicherung","vet","vg","vi","viajes","video","vig","viking","villas","vin","vip","virgin","visa","vision","viva","vivo","vlaanderen","vn","vodka","volvo","vote","voting","voto","voyage","vu","wales","walmart","walter","wang","wanggou","watch","watches","weather","weatherchannel","webcam","weber","website","wed","wedding","weibo","weir","wf","whoswho","wien","wiki","williamhill","win","windows","wine","winners","wme","wolterskluwer","woodside","work","works","world","wow","ws","wtc","wtf","xbox","xerox","xihuan","xin","xxx","xyz","yachts","yahoo","yamaxun","yandex","ye","yodobashi","yoga","yokohama","you","youtube","yt","yun","za","zappos","zara","zero","zip","zm","zone","zuerich","zw","\u03B5\u03BB","\u03B5\u03C5","\u0431\u0433","\u0431\u0435\u043B","\u0434\u0435\u0442\u0438","\u0435\u044E","\u043A\u0430\u0442\u043E\u043B\u0438\u043A","\u043A\u043E\u043C","\u043C\u043A\u0434","\u043C\u043E\u043D","\u043C\u043E\u0441\u043A\u0432\u0430","\u043E\u043D\u043B\u0430\u0439\u043D","\u043E\u0440\u0433","\u0440\u0443\u0441","\u0440\u0444","\u0441\u0430\u0439\u0442","\u0441\u0440\u0431","\u0443\u043A\u0440","\u049B\u0430\u0437","\u0570\u0561\u0575","\u05D9\u05E9\u05E8\u05D0\u05DC","\u05E7\u05D5\u05DD","\u0627\u0628\u0648\u0638\u0628\u064A","\u0627\u0631\u0627\u0645\u0643\u0648","\u0627\u0644\u0627\u0631\u062F\u0646","\u0627\u0644\u0628\u062D\u0631\u064A\u0646","\u0627\u0644\u062C\u0632\u0627\u0626\u0631","\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629","\u0627\u0644\u0639\u0644\u064A\u0627\u0646","\u0627\u0644\u0645\u063A\u0631\u0628","\u0627\u0645\u0627\u0631\u0627\u062A","\u0627\u06CC\u0631\u0627\u0646","\u0628\u0627\u0631\u062A","\u0628\u0627\u0632\u0627\u0631","\u0628\u064A\u062A\u0643","\u0628\u06BE\u0627\u0631\u062A","\u062A\u0648\u0646\u0633","\u0633\u0648\u062F\u0627\u0646","\u0633\u0648\u0631\u064A\u0629","\u0634\u0628\u0643\u0629","\u0639\u0631\u0627\u0642","\u0639\u0631\u0628","\u0639\u0645\u0627\u0646","\u0641\u0644\u0633\u0637\u064A\u0646","\u0642\u0637\u0631","\u0643\u0627\u062B\u0648\u0644\u064A\u0643","\u0643\u0648\u0645","\u0645\u0635\u0631","\u0645\u0644\u064A\u0633\u064A\u0627","\u0645\u0648\u0631\u064A\u062A\u0627\u0646\u064A\u0627","\u0645\u0648\u0642\u0639","\u0647\u0645\u0631\u0627\u0647","\u067E\u0627\u06A9\u0633\u062A\u0627\u0646","\u0680\u0627\u0631\u062A","\u0915\u0949\u092E","\u0928\u0947\u091F","\u092D\u093E\u0930\u0924","\u092D\u093E\u0930\u0924\u092E\u094D","\u092D\u093E\u0930\u094B\u0924","\u0938\u0902\u0917\u0920\u0928","\u09AC\u09BE\u0982\u09B2\u09BE","\u09AD\u09BE\u09B0\u09A4","\u09AD\u09BE\u09F0\u09A4","\u0A2D\u0A3E\u0A30\u0A24","\u0AAD\u0ABE\u0AB0\u0AA4","\u0B2D\u0B3E\u0B30\u0B24","\u0B87\u0BA8\u0BCD\u0BA4\u0BBF\u0BAF\u0BBE","\u0B87\u0BB2\u0B99\u0BCD\u0B95\u0BC8","\u0B9A\u0BBF\u0B99\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0BC2\u0BB0\u0BCD","\u0C2D\u0C3E\u0C30\u0C24\u0C4D","\u0CAD\u0CBE\u0CB0\u0CA4","\u0D2D\u0D3E\u0D30\u0D24\u0D02","\u0DBD\u0D82\u0D9A\u0DCF","\u0E04\u0E2D\u0E21","\u0E44\u0E17\u0E22","\u0EA5\u0EB2\u0EA7","\u10D2\u10D4","\u307F\u3093\u306A","\u30A2\u30DE\u30BE\u30F3","\u30AF\u30E9\u30A6\u30C9","\u30B0\u30FC\u30B0\u30EB","\u30B3\u30E0","\u30B9\u30C8\u30A2","\u30BB\u30FC\u30EB","\u30D5\u30A1\u30C3\u30B7\u30E7\u30F3","\u30DD\u30A4\u30F3\u30C8","\u4E16\u754C","\u4E2D\u4FE1","\u4E2D\u56FD","\u4E2D\u570B","\u4E2D\u6587\u7F51","\u4E9A\u9A6C\u900A","\u4F01\u4E1A","\u4F5B\u5C71","\u4FE1\u606F","\u5065\u5EB7","\u516B\u5366","\u516C\u53F8","\u516C\u76CA","\u53F0\u6E7E","\u53F0\u7063","\u5546\u57CE","\u5546\u5E97","\u5546\u6807","\u5609\u91CC","\u5609\u91CC\u5927\u9152\u5E97","\u5728\u7EBF","\u5927\u62FF","\u5929\u4E3B\u6559","\u5A31\u4E50","\u5BB6\u96FB","\u5E7F\u4E1C","\u5FAE\u535A","\u6148\u5584","\u6211\u7231\u4F60","\u624B\u673A","\u62DB\u8058","\u653F\u52A1","\u653F\u5E9C","\u65B0\u52A0\u5761","\u65B0\u95FB","\u65F6\u5C1A","\u66F8\u7C4D","\u673A\u6784","\u6DE1\u9A6C\u9521","\u6E38\u620F","\u6FB3\u9580","\u70B9\u770B","\u79FB\u52A8","\u7EC4\u7EC7\u673A\u6784","\u7F51\u5740","\u7F51\u5E97","\u7F51\u7AD9","\u7F51\u7EDC","\u8054\u901A","\u8C37\u6B4C","\u8D2D\u7269","\u901A\u8CA9","\u96C6\u56E2","\u96FB\u8A0A\u76C8\u79D1","\u98DE\u5229\u6D66","\u98DF\u54C1","\u9910\u5385","\u9999\u683C\u91CC\u62C9","\u9999\u6E2F","\uB2F7\uB137","\uB2F7\uCEF4","\uC0BC\uC131","\uD55C\uAD6D"];function Af(e){if(typeof e!="string"||e.length>65536)return[];let t=[];for(let n of e.split(/,(?=\d+-\d+\|)/)){let r=/^(\d+)-(\d+)\|([^|]+)\|(.+)$/.exec(n);if(!r)continue;let o=Number(r[1]),l=Number(r[2]),i=r[4];if(!(!Number.isSafeInteger(o)||!Number.isSafeInteger(l)||l<o||/[\s\u0000-\u001f\u007f]/u.test(i))){try{let s=new URL(i);if(s.protocol!=="https:"||s.username||s.password||s.port||!/^(?:media\d*|i)\.giphy\.com$/i.test(s.hostname))continue}catch{continue}t.push({start:o,end:l,id:r[3],url:i})}}return t}function zf(e,t){if(typeof e!="string")return null;if(/^public\/chat-gifs\/[a-f0-9]{64}$/.test(e))return no(e);if(/^asset:[a-f0-9]{64}$/.test(e)){let n=t?.[e.slice(6)];if(typeof n=="string"&&n.length<=35*1024*1024&&/^data:image\/(?:gif|webp|png|jpeg);base64,[A-Za-z0-9+/]/.test(n))return n}return null}function If(e,t,n,r,o){if(r?.length)return dg(e,t,r);let l=[...Af(o).map(d=>({...d,type:"gif"})),...hg(n).map(d=>({...d,type:"emote"}))].sort((d,h)=>d.start-h.start);if(l.length===0)return ro(e,t);let i=Array.from(e),s=[],u=0;for(let d of l){if(d.start<u||d.end>=i.length)continue;s.push(...ro(i.slice(u,d.start).join(""),t));let h=i.slice(d.start,d.end+1).join("");d.type==="gif"?s.push({type:"gif",name:h,id:d.id,url:d.url}):s.push({type:"emote",name:h,url:`https://static-cdn.jtvnw.net/emoticons/v2/${d.id}/default/dark/2.0`}),u=d.end+1}return s.push(...ro(i.slice(u).join(""),t)),s}function cg(e){return e.localUrl?e.localUrl.startsWith("data:")?{url:e.localUrl}:{url:no(e.localUrl),fallbackUrl:e.url}:{url:e.url}}function dg(e,t,n){let r=[],o=0;for(let s of[...n].sort((u,d)=>u.start-d.start)){if(!s.name)continue;let u=s.start;if(e.slice(u,u+s.name.length)!==s.name){let d=e.indexOf(s.name,o);if(d<0)continue;u=d}u<o||(r.push({id:s.id,name:s.name,start:u,url:s.url}),o=u+s.name.length)}let l=[],i=0;for(let s of r)l.push(...ro(e.slice(i,s.start),t)),l.push({type:"emote",name:s.name,url:s.url||`https://files.kick.com/emotes/${encodeURIComponent(s.id)}/fullsize`}),i=s.start+s.name.length;return l.push(...ro(e.slice(i),t)),l}var fg=/^@([\p{L}\p{N}_.-]{1,32})([\s\S]*)$/u,pg=new Rf({fuzzyLink:!0,fuzzyEmail:!1}).tlds(Mf);function ro(e,t){if(!e)return[];let n=e.split(/(\s+)/),r=[],o=i=>{if(!i)return;let s=r[r.length-1];s?.type==="text"?s.value+=i:r.push({type:"text",value:i})},l=i=>{let s=0;for(let u of pg.match(i)??[]){if(!["","//","http:","https:"].includes(u.schema))continue;let d=u.schema===""?`https://${u.raw}`:u.schema==="//"?`https:${u.url}`:u.url,h;try{h=new URL(d)}catch{continue}!["http:","https:"].includes(h.protocol)||!h.hostname||h.username||h.password||(o(i.slice(s,u.index)),r.push({type:"link",value:u.raw,href:h.href}),s=u.lastIndex)}o(i.slice(s))};for(let i of n){if(i.startsWith("@")&&i.length>1){let u=fg.exec(i);if(u){r.push({type:"mention",name:u[1]}),l(u[2]);continue}}let s=t.get(i);s?r.push({type:"emote",name:s.name,...cg(s)}):l(i)}return r}function hg(e){let t=[];for(let n of e?.split("/")??[]){let r=n.indexOf(":");if(r<=0)continue;let o=n.slice(0,r);for(let l of n.slice(r+1).split(",")){let[i,s]=l.split("-"),u=Number.parseInt(i,10),d=Number.parseInt(s,10);Number.isFinite(u)&&Number.isFinite(d)&&d>=u&&t.push({id:o,start:u,end:d})}}return t.sort((n,r)=>n.start-r.start)}var $f="",Lf=`${$f}ACTION `;function Ol(e){if(!e.startsWith(Lf))return{text:e,isAction:!1};let t=e.slice(Lf.length);return{text:t.endsWith($f)?t.slice(0,-1):t,isAction:!0}}function Bl(e){if(e.roles?.length)return e.roles;if(!e.badges)return[];let t={broadcaster:"broadcaster",moderator:"moderator",vip:"vip",subscriber:"subscriber",founder:"subscriber",staff:"staff",admin:"staff",global_mod:"staff",partner:"verified",turbo:"turbo"},n=new Set;for(let r of e.badges.split(",")){let o=t[r.split("/")[0]];o&&n.add(o)}return[...n]}function oo(e,t){return e.isDeleted?e.deletedAtSec==null?!0:t>=e.deletedAtSec:!1}function tr(e){let t=Math.max(0,Math.floor(e)),n=Math.floor(t/3600),r=Math.floor(t%3600/60),o=t%60,l=i=>String(i).padStart(2,"0");return n>0?`${n}:${l(r)}:${l(o)}`:`${r}:${l(o)}`}var lo=B(Ye()),jl=(0,lo.createContext)({locale:"ru",spoilerFree:!0});function Of(){return(0,lo.useContext)(jl)}function Bf(){return(0,lo.useContext)(jl)}var jf="#387aff",Uf="#ff3f97",Ul=["#387aff","#ff3f97","#22c55e","#f59e0b","#a78bfa","#14b8a6","#ef4444","#eab308","#3b82f6","#ec4899"];function Hf(e,t){let n=Vf(e.badgeVersion);return n==="pink"?Uf:n==="blue"&&t===0?jf:Ul[t%Ul.length]}function bf(e){let t=Vf(e);if(t==="pink")return Uf;if(t==="blue"){let n=mg(e);return n<=1?jf:Ul[(n-1)%Ul.length]}return"#9ca3af"}function Vf(e){if(!e)return null;let t=e.indexOf("-");return(t===-1?e:e.slice(0,t)).toLowerCase()}function mg(e){let t=e.indexOf("-");if(t===-1)return 1;let n=Number.parseInt(e.slice(t+1),10);return Number.isFinite(n)?n:1}var P=B(le());function Gf({prefs:e,update:t,toggleRole:n,reset:r,copy:o,locale:l,offset:i,setOffset:s,search:u,setSearch:d,liveEmotesUrl:h,liveEmotesNote:m}){return(0,P.jsxs)("div",{className:"chat-settings thin-scroll",children:[(0,P.jsxs)("div",{className:"chat-offset-row",children:[(0,P.jsx)("span",{className:"chat-offset-label",children:o.offset}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f-5),title:"-5s",children:"\u22125"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f-1),title:"-1s",children:"\u22121"}),(0,P.jsx)("input",{type:"number",className:"offset-input",value:i,onChange:f=>{let g=Number(f.target.value);s(Number.isFinite(g)?g:0)},"aria-label":o.offsetAria}),(0,P.jsx)("span",{style:{color:"var(--text-faint)"},children:"s"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f+1),title:"+1s",children:"+1"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f+5),title:"+5s",children:"+5"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(0),title:"reset",children:"\u21BA"})]}),(0,P.jsx)("div",{className:"chat-settings__section",children:o.sectionView}),(0,P.jsxs)("label",{className:"chat-slider",children:[(0,P.jsxs)("span",{children:[o.fontSize,(0,P.jsxs)("b",{children:[e.fontPx,"px"]})]}),(0,P.jsx)("input",{type:"range",min:_t.fontPx.min,max:_t.fontPx.max,value:e.fontPx,onChange:f=>t("fontPx",Number(f.target.value))})]}),(0,P.jsxs)("label",{className:"chat-slider",children:[(0,P.jsxs)("span",{children:[o.emoteSize,(0,P.jsxs)("b",{children:[e.emotePx,"px"]})]}),(0,P.jsx)("input",{type:"range",min:_t.emotePx.min,max:_t.emotePx.max,value:e.emotePx,onChange:f=>t("emotePx",Number(f.target.value))})]}),(0,P.jsxs)("div",{className:"chat-chip-row",children:[(0,P.jsx)(nr,{active:e.compact,label:o.compact,onClick:()=>t("compact",!e.compact)}),(0,P.jsx)(nr,{active:e.showTimestamps,label:o.showTimestamps,onClick:()=>t("showTimestamps",!e.showTimestamps)}),(0,P.jsx)(nr,{active:e.stripes,label:o.stripes,onClick:()=>t("stripes",!e.stripes)}),(0,P.jsx)(nr,{active:e.readableColors,label:o.readableColors,title:o.readableColorsHint,onClick:()=>t("readableColors",!e.readableColors)})]}),(0,P.jsx)("div",{className:"chat-settings__section",children:o.sectionHighlight}),(0,P.jsxs)("div",{className:"chat-chip-row",children:[kf.map(f=>(0,P.jsx)(nr,{active:e.highlightRoles.includes(f),label:gn[f][l],className:`chat-chip--${f}`,onClick:()=>n(f)},f)),(0,P.jsx)(nr,{active:e.highlightFirstMessage,label:o.highlightFirst,className:"chat-chip--first",onClick:()=>t("highlightFirstMessage",!e.highlightFirstMessage)})]}),(0,P.jsxs)("label",{className:"chat-field",title:o.keywordsHint,children:[(0,P.jsx)("span",{children:o.keywords}),(0,P.jsx)("input",{type:"text",value:e.keywords,placeholder:o.keywordsPlaceholder,onChange:f=>t("keywords",f.target.value)})]}),(0,P.jsx)("div",{className:"chat-settings__section",children:o.sectionFilter}),(0,P.jsxs)("label",{className:"chat-field",children:[(0,P.jsx)("span",{children:o.search}),(0,P.jsx)("input",{type:"search",value:u,placeholder:o.searchPlaceholder,onChange:f=>d(f.target.value)})]}),(0,P.jsxs)("label",{className:"chat-toggle",children:[(0,P.jsx)("input",{type:"checkbox",checked:e.showDeleted,onChange:f=>t("showDeleted",f.target.checked)}),(0,P.jsx)("span",{children:o.showDeleted})]}),(0,P.jsxs)("label",{className:"chat-toggle",children:[(0,P.jsx)("input",{type:"checkbox",checked:e.hideCommands,onChange:f=>t("hideCommands",f.target.checked)}),(0,P.jsx)("span",{children:o.hideCommands})]}),(0,P.jsxs)("label",{className:"chat-toggle",title:o.eventsHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.showEvents,onChange:f=>t("showEvents",f.target.checked)}),(0,P.jsx)("span",{children:o.eventsShow})]}),(0,P.jsxs)("label",{className:"chat-toggle",title:o.eventsCollapseHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.collapseEvents,onChange:f=>t("collapseEvents",f.target.checked)}),(0,P.jsx)("span",{children:o.eventsCollapse})]}),(0,P.jsxs)("label",{className:"chat-toggle",title:o.eventsHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.showBets,onChange:f=>t("showBets",f.target.checked)}),(0,P.jsx)("span",{children:o.eventBetOn})]}),(0,P.jsxs)("label",{className:"chat-field",children:[(0,P.jsx)("span",{children:o.hiddenUsers}),(0,P.jsx)("input",{type:"text",value:e.hiddenUsers,placeholder:o.hiddenUsersPlaceholder,onChange:f=>t("hiddenUsers",f.target.value)})]}),h?(0,P.jsxs)("label",{className:"chat-toggle",title:o.liveEmotesHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.useLiveEmotes,onChange:f=>t("useLiveEmotes",f.target.checked)}),(0,P.jsxs)("span",{children:[o.liveEmotes,m?` \u2014 ${m}`:""]})]}):null,(0,P.jsx)("button",{type:"button",className:"chat-reset",onClick:r,children:o.reset})]})}function nr({active:e,label:t,onClick:n,title:r,className:o=""}){return(0,P.jsx)("button",{type:"button",className:`chat-chip${e?" is-active":""} ${o}`.trim(),onClick:n,title:r,"aria-pressed":e,children:t})}var yn=B(Ye());var $e=B(le()),bl=(0,yn.memo)(function({text:t,emoteMap:n,twitchEmotes:r,inlineEmotes:o,twitchGifs:l,gifUrls:i,gifAssets:s,emotePx:u,selfNames:d,onMentionClick:h,mentionTitle:m}){let f=(0,yn.useMemo)(()=>If(t,n,r,o,l),[t,n,r,o,l]);return(0,$e.jsx)($e.Fragment,{children:f.map((g,w)=>g.type==="mention"?(0,$e.jsxs)("span",{className:`chat-mention${d?.has(g.name.toLowerCase())?" is-self":""}`,role:h?"button":void 0,tabIndex:h?0:void 0,title:h?m:void 0,onClick:h?v=>{v.stopPropagation(),h(g.name)}:void 0,onKeyDown:h?v=>{v.key!=="Enter"&&v.key!==" "||(v.preventDefault(),v.stopPropagation(),h(g.name))}:void 0,children:["@",g.name]},`mention-${w}`):g.type==="link"?(0,$e.jsx)("a",{className:"chat-link",href:g.href,target:"_blank",rel:"noopener noreferrer",onClick:v=>v.stopPropagation(),onAuxClick:v=>v.stopPropagation(),onKeyDown:v=>v.stopPropagation(),children:g.value},`link-${w}`):g.type==="gif"?(0,$e.jsx)(kg,{url:g.url,label:g.name,reference:i?.[g.url],assets:s},`gif-${g.id}-${g.url}-${i?.[g.url]}-${w}`):g.type==="emote"?(0,$e.jsx)("img",{src:g.url,alt:g.name,title:g.name,className:"chat-emote",style:{height:`${u}px`},loading:"lazy",onError:g.fallbackUrl?v=>{let C=v.currentTarget;g.fallbackUrl&&C.src!==g.fallbackUrl&&(C.src=g.fallbackUrl)}:void 0},`${g.name}-${w}`):(0,$e.jsx)("span",{children:g.value},`text-${w}`))})});function kg({url:e,label:t,reference:n,assets:r}){let o=(0,yn.useMemo)(()=>zf(n,r),[n,r]),[l,i]=(0,yn.useState)(0);if(l>=(o?2:1))return(0,$e.jsx)("span",{children:t});let s=o&&l===0?o:e;return(0,$e.jsx)("a",{className:"chat-gif",href:s,target:"_blank",rel:"noopener noreferrer",onClick:u=>u.stopPropagation(),onAuxClick:u=>u.stopPropagation(),onKeyDown:u=>u.stopPropagation(),children:(0,$e.jsx)("img",{src:s,alt:t,title:t,loading:"lazy",decoding:"async",referrerPolicy:"no-referrer",onError:()=>i(u=>u+1)})})}var b=B(Ye()),Zf=B(Cu());var I=B(le()),rr=330,Yf="tsr-chat-user-card-pos";function Vl(e,t,n,r){let o=Math.max(4,window.innerWidth-n-4),l=Math.max(4,window.innerHeight-r-4);return{x:Math.min(Math.max(4,e),o),y:Math.min(Math.max(4,t),l)}}function Xf({login:e,historyUrl:t,messages:n,thresholdSec:r,emoteMap:o,gifAssets:l,emotePx:i,readableColors:s,copy:u,locale:d,onClose:h,onMentionClick:m,onSeek:f,canSeek:g,toRenderTime:w,anchorEl:v}){let[C,c]=(0,b.useState)(null),[a,p]=(0,b.useState)(null),[y,k]=(0,b.useState)(""),[S,F]=(0,b.useState)(null),[N,V]=(0,b.useState)(!1),[R,ee]=(0,b.useState)(0),[Zt,fe]=(0,b.useState)(100);(0,b.useEffect)(()=>{if(!t)return;let x=!1;return F(null),V(!1),Ie(t).then($=>{x||F($)}).catch(()=>{x||V(!0)}),()=>{x=!0}},[t,R]),(0,b.useEffect)(()=>{fe(100)},[y]);let wn=(0,b.useRef)(null),St=(0,b.useRef)(null);(0,b.useEffect)(()=>{let x=()=>{let $=v?.getRootNode();c($?.nodeType===11&&"host"in $?$:document.fullscreenElement??document.body)};return x(),document.addEventListener("fullscreenchange",x),()=>document.removeEventListener("fullscreenchange",x)},[v]),(0,b.useEffect)(()=>{if(!C||a)return;let x=null;try{let kn=window.localStorage.getItem(Yf);kn&&(x=JSON.parse(kn))}catch{}let $=Math.min(420,window.innerHeight*.6);if(x&&Number.isFinite(x.x)&&Number.isFinite(x.y)){p(Vl(x.x,x.y,rr,$));return}let j=v?.getBoundingClientRect(),ke=j?j.left+j.width/2-rr/2:window.innerWidth-rr-24,co=j?j.bottom-$-8:80;p(Vl(ke,co,rr,$))},[C,a,v]),(0,b.useEffect)(()=>{if(!C)return;let x=()=>{let $=wn.current?.getBoundingClientRect();p(j=>j&&Vl(j.x,j.y,$?.width||rr,$?.height||420))};return x(),window.addEventListener("resize",x),()=>window.removeEventListener("resize",x)},[C]);let Gl=(0,b.useCallback)(x=>{if(x.target.closest("button, input"))return;let $=wn.current;if(!$)return;let j=$.getBoundingClientRect();St.current={x:x.clientX-j.left,y:x.clientY-j.top},x.currentTarget.setPointerCapture(x.pointerId)},[]),so=(0,b.useCallback)(x=>{let $=St.current,j=wn.current;if(!$||!j)return;x.preventDefault();let ke=j.getBoundingClientRect();p(Vl(x.clientX-$.x,x.clientY-$.y,ke.width,ke.height))},[]),uo=(0,b.useCallback)(x=>{if(St.current){St.current=null;try{x.currentTarget.releasePointerCapture(x.pointerId)}catch{}if(a)try{window.localStorage.setItem(Yf,JSON.stringify(a))}catch{}}},[a]);(0,b.useEffect)(()=>{let x=$=>{$.key==="Escape"&&h()};return window.addEventListener("keydown",x),()=>window.removeEventListener("keydown",x)},[h]);let Qe=(0,b.useMemo)(()=>n.filter(x=>x.authorLogin.toLowerCase()===e.toLowerCase()).sort((x,$)=>x.relativeTimeSec-$.relativeTimeSec),[n,e]),Ke=(0,b.useMemo)(()=>Qe.filter(x=>x.relativeTimeSec<=r),[Qe,r]),Cn=y.trim().toLowerCase(),_n=(0,b.useMemo)(()=>{let x=[...Ke].reverse().concat(S?.messages??[]);return Cn?x.filter($=>$.textRaw.toLowerCase().includes(Cn)):x},[Ke,Cn,S]),Xt=Ke[Ke.length-1]??Qe[0],or=Xt?.authorDisplayName??e,Dt=s?$l(Xt?.authorColor):Xt?.authorColor,ao=Xt?Bl(Xt):[],Ft=Ke.filter(x=>oo(x,r)).length;return!C||!a?null:(0,Zf.createPortal)((0,I.jsxs)("div",{ref:wn,className:"chat-user-card",style:{left:a.x,top:a.y,width:rr},role:"dialog","aria-label":`${u.userCardTitle}: ${or}`,children:[(0,I.jsxs)("div",{className:"chat-user-card__head",onPointerDown:Gl,onPointerMove:so,onPointerUp:uo,onPointerCancel:uo,title:u.userCardDrag,children:[(0,I.jsx)("span",{className:"chat-user-card__grip","aria-hidden":"true",children:"\u283F"}),(0,I.jsx)("span",{className:"chat-user-card__name",style:{color:Dt||"#9ca3af"},children:or}),(0,I.jsx)("button",{type:"button",className:"chat-user-card__close",onClick:h,title:u.userCardClose,"aria-label":u.userCardClose,children:"\u2715"})]}),(0,I.jsxs)("div",{className:"chat-user-card__meta",children:[ao.length>0?(0,I.jsx)("div",{className:"chat-user-card__roles",children:ao.map(x=>(0,I.jsx)("span",{className:`chat-badge chat-badge--${x}`,children:gn[x].badge},x))}):null,(0,I.jsxs)("div",{className:"chat-user-card__stats",children:[(0,I.jsx)("b",{children:Ke.length})," ",u.userCardCount,Qe.length!==Ke.length?(0,I.jsxs)(I.Fragment,{children:[" \xB7 ",(0,I.jsx)("b",{children:Qe.length})," ",u.userCardTotal]}):null,Ft>0?(0,I.jsxs)(I.Fragment,{children:[" \xB7 ",(0,I.jsx)("b",{children:Ft})," ",u.userCardDeleted]}):null]}),(0,I.jsx)("input",{type:"search",className:"chat-user-card__search",value:y,placeholder:u.userCardSearch,onChange:x=>k(x.target.value)}),(0,I.jsx)("div",{className:"chat-user-card__hint",children:u.userCardHint}),t?(0,I.jsx)("div",{className:"chat-user-card__hint",role:"status",children:N?(0,I.jsx)("button",{type:"button",onClick:()=>ee(x=>x+1),children:u.userCardHistoryRetry}):S?(0,I.jsxs)(I.Fragment,{children:[u.userCardHistory,": ",S.sessions," \xB7 ",S.messages.length," ",u.messages,S.truncated?` \xB7 ${u.userCardHistoryLimit}`:""]}):u.userCardHistoryLoading}):null]}),(0,I.jsxs)("div",{className:"chat-user-card__list thin-scroll",children:[_n.length===0?(0,I.jsx)("div",{className:"chat-empty",children:Cn?u.userCardNoMatch:u.userCardEmpty}):_n.slice(0,Zt).map(x=>{let $=Ol(x.textRaw),j=!!x.historySessionId,ke=!j&&g(x.relativeTimeSec),co=oo(x,j?1/0:r);return(0,I.jsxs)("div",{className:`chat-user-card__row${co?" is-deleted":""}`,title:j?u.userCardPastStream:void 0,children:[j?(0,I.jsx)("span",{className:"chat-time",children:x.messageTimestamp?new Date(x.messageTimestamp).toLocaleString(d==="ru"?"ru-RU":"en-US"):u.userCardPastStream}):(0,I.jsx)("button",{type:"button",className:"chat-user-card__seek chat-time",onClick:()=>f(x.relativeTimeSec),disabled:!ke,title:ke?u.userCardSeek:u.userCardOtherPart,children:tr(w(x.relativeTimeSec))}),(0,I.jsx)("span",{className:"chat-text",children:(0,I.jsx)(bl,{text:$.text,emoteMap:o,twitchEmotes:x.emotes,inlineEmotes:x.inlineEmotes,twitchGifs:x.gifs,gifUrls:x.gifUrls,gifAssets:l,emotePx:Math.min(i,24),onMentionClick:m,mentionTitle:u.userCardTitle})})]},x.id)}),_n.length>Zt?(0,I.jsx)("button",{type:"button",className:"chat-user-card__more",onClick:()=>fe(x=>x+100),children:u.userCardMore}):null]})]}),C)}var io=B(le()),xg={size:16,strokeWidth:1.75,className:""};function Eg({size:e,strokeWidth:t,className:n}){return{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:t,strokeLinecap:"round",strokeLinejoin:"round",className:n}}function Sg(e){return{...xg,...e}}function Jf(e){let t=Sg(e);return(0,io.jsxs)("svg",{...Eg(t),children:[(0,io.jsx)("circle",{cx:"12",cy:"12",r:"3"}),(0,io.jsx)("path",{d:"M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"})]})}var Wl=B(le());function Dg({width:e,height:t,radius:n,className:r,style:o}){return(0,Wl.jsx)("span",{className:`skeleton${r?` ${r}`:""}`,style:{width:e,height:t,borderRadius:n,...o},"aria-hidden":!0})}function Eu({width:e="100%",height:t="12px"}){return(0,Wl.jsx)(Dg,{width:e,height:t,radius:"4px",className:"skeleton--text"})}function qf(e){let t=e;if(!t||t.version!==1||!Number.isFinite(t.captureAnchorMs)||!Array.isArray(t.points)||!t.points.length||t.points.length>1e4)return null;for(let n=0;n<t.points.length;n++){let r=t.points[n],o=t.points[n-1];if(!r||!Number.isFinite(r.mediaSec)||!Number.isFinite(r.wallClockMs)||o&&(r.mediaSec<=o.mediaSec||r.wallClockMs<=o.wallClockMs))return null}return t}function ep(e,t){if(!t?.points.length)return e;let n=tp(t.points,e,o=>o.mediaSec),r=t.points[n];return(r.wallClockMs-t.captureAnchorMs)/1e3+e-r.mediaSec}function Ql(e,t){if(!t?.points.length)return e;let n=t.captureAnchorMs+e*1e3,r=tp(t.points,n,s=>s.wallClockMs),o=t.points[r],l=t.points[r+1],i=o.mediaSec+(n-o.wallClockMs)/1e3;return l?Math.min(i,l.mediaSec):i}function tp(e,t,n){let r=0,o=e.length;for(;r<o;){let l=r+o>>>1;n(e[l])<=t?r=l+1:o=l}return Math.max(0,r-1)}function np(e,t,n,r){return Math.min(n,e+Math.max(0,t)*Math.max(0,r))}async function Kl(e,t,n=r=>Ie(r,{cacheable:!0})){let r=null,o=null,l=new Set;do{if(t())return null;let i=`${e}${e.includes("?")?"&":"?"}page=1${o?`&cursor=${encodeURIComponent(o)}`:""}`,s=await n(i);if(t())return null;if(r?r.messages.push(...s.messages):r={messages:[...s.messages],emotes:s.emotes,mediaTimeline:s.mediaTimeline},o=s.nextCursor??null,o&&l.has(o))throw new Error("Chat page cursor did not advance");o&&l.add(o)}while(o);return r}var kt=B(Ye());var J=B(le()),Fg=90;function rp(e,t){return e.toLocaleString(t==="ru"?"ru-RU":"en-US")}function op({eventsUrl:e,chatTimeSec:t,copy:n,locale:r,collapsed:o,onToggleCollapsed:l}){let[i,s]=(0,kt.useState)(null);(0,kt.useEffect)(()=>{if(!e)return;let d=!1;return s(null),(async()=>{try{let h=await Ie(e);d||s(h.events??[])}catch{d||s([])}})(),()=>{d=!0}},[e]);let u=(0,kt.useMemo)(()=>{if(!i?.length)return[];let d=!Number.isFinite(t);return i.filter(m=>d?!0:t<m.startedAtSec?!1:m.endedAtSec===null?!0:t<=m.endedAtSec+Fg).sort((m,f)=>f.startedAtSec-m.startedAtSec).slice(0,2)},[i,t]);return!e||u.length===0?null:(0,J.jsx)("div",{className:"stream-events",children:u.map(d=>(0,J.jsx)(Pg,{event:d,chatTimeSec:t,copy:n,locale:r,collapsed:o,onToggleCollapsed:l},d.id))})}function Pg({event:e,chatTimeSec:t,copy:n,locale:r,collapsed:o,onToggleCollapsed:l}){let i=(0,kt.useId)(),s=(0,kt.useMemo)(()=>{let c=null;for(let a of e.samples){if(a.atSec>t)break;c=a}return c},[e.samples,t]),u=e.endedAtSec!==null&&t>=e.endedAtSec?"ended":e.lockedAtSec!==null&&t>=e.lockedAtSec?"locked":"active",d=u==="ended",h=d&&e.status==="cancelled",m=e.kind==="poll",f=s?.points??e.outcomes.map(()=>0),g=s?.users??e.outcomes.map(()=>0),w=f.reduce((c,a)=>c+a,0),v=g.reduce((c,a)=>c+a,0),C=h?n.eventCancelled:d?m?n.eventPollDone:n.eventResolved:u==="locked"?n.eventLocked:m?n.eventPoll:n.eventOpen;return(0,J.jsxs)("div",{className:`stream-event stream-event--${u}${h?" is-cancelled":""}${o?" is-collapsed":""}`,children:[(0,J.jsxs)("button",{type:"button",className:"stream-event__head",onClick:l,"aria-expanded":!o,"aria-controls":i,"aria-label":`${o?n.eventExpand:n.eventCollapse}: ${e.title}`,title:o?n.eventExpand:n.eventCollapse,children:[(0,J.jsx)("span",{className:`stream-event__kind stream-event__kind--${e.kind}`,children:m?n.eventPoll:n.eventPrediction}),(0,J.jsx)("span",{className:"stream-event__title",title:e.title,children:e.title}),(0,J.jsx)("span",{className:"stream-event__chevron","aria-hidden":"true",children:o?"\u25BE":"\u25B4"}),(0,J.jsx)("span",{className:"stream-event__status",children:C})]}),(0,J.jsxs)("div",{id:i,hidden:o,children:[(0,J.jsx)("div",{className:"stream-event__outcomes",children:e.outcomes.map((c,a)=>{let p=f[a]??0,y=w>0?p/w:0,k=!m&&p>0?w/p:null,S=d&&!h&&e.winningOutcomeId===c.id,F=d&&!h&&e.winningOutcomeId!==null&&!S;return(0,J.jsxs)("div",{className:`stream-event__outcome${S?" is-won":""}${F?" is-lost":""}`,children:[(0,J.jsx)("span",{className:"stream-event__fill",style:{width:`${Math.round(y*100)}%`,background:Hf(c,a)}}),(0,J.jsxs)("span",{className:"stream-event__label",children:[S?(0,J.jsx)("span",{className:"stream-event__crown",children:"\u{1F451}"}):null,c.title]}),(0,J.jsxs)("span",{className:"stream-event__numbers",children:[(0,J.jsxs)("span",{className:"stream-event__share",children:[Math.round(y*100),"%"]}),(0,J.jsxs)("span",{className:"stream-event__count",children:[rp(p,r)," ",m?n.eventVotes:n.eventPoints]}),k!==null?(0,J.jsxs)("span",{className:"stream-event__ratio",title:n.eventReturn,children:["\xD7",k.toFixed(2)]}):null]})]},c.id)})}),(0,J.jsxs)("div",{className:"stream-event__foot",children:[v>0?(0,J.jsxs)("span",{children:[rp(v,r)," ",n.eventUsers]}):null,e.startedAtSec<0?(0,J.jsx)("span",{className:"stream-event__early",title:n.eventAlreadyOpen,children:"\u23F3"}):null]})]})]})}var xt=B(Ye());var Oe=B(le()),lp=["#a78bfa","#22c55e","#f59e0b","#3b82f6","#ec4899","#14b8a6","#ef4444","#eab308"];function ip(e){if(!e)return"#4b5563";let t=0;for(let n=0;n<e.length;n+=1)t=t*31+e.charCodeAt(n)|0;return lp[Math.abs(t)%lp.length]}function sp(e,t){return e.toLocaleString(t==="ru"?"ru-RU":"en-US")}function up({timelineUrl:e,chatTimeSec:t,reveal:n,onToggleReveal:r,hideScale:o=!1,copy:l,locale:i}){let[s,u]=(0,xt.useState)(null),[d,h]=(0,xt.useState)(!1);(0,xt.useEffect)(()=>{if(!e)return;let v=!1;return u(null),h(!1),(async()=>{try{let C=await Ie(e);v||u(C)}catch{v||h(!0)}})(),()=>{v=!0}},[e]);let m=(0,xt.useMemo)(()=>{if(!s?.points.length)return 0;let v=s.points[s.points.length-1];return Math.max(v.relativeTimeSec,1)},[s]),f=(0,xt.useMemo)(()=>{if(!s?.points.length)return null;let v=null;for(let C of s.points){if(C.relativeTimeSec>t)break;v=C}return v??s.points[0]},[s,t]),g=(0,xt.useMemo)(()=>{if(!s?.points.length)return null;if(n)return s.peakViewers;let v=null;for(let C of s.points){if(C.relativeTimeSec>t)break;typeof C.viewerCount=="number"&&(v===null||C.viewerCount>v)&&(v=C.viewerCount)}return v},[s,t,n]);if(!e||d||!s||s.points.length===0)return null;let w=n?m:Math.min(t,m);return(0,Oe.jsxs)("div",{className:"stream-meta",children:[(0,Oe.jsxs)("div",{className:"stream-meta__row",children:[f?.viewerCount!=null?(0,Oe.jsxs)("span",{className:"stream-meta__viewers",title:l.metaViewers,children:["\u25CF ",sp(f.viewerCount,i)]}):null,g!=null?(0,Oe.jsxs)("span",{className:"stream-meta__peak",children:[l.metaPeak," ",sp(g,i)]}):null,o?null:(0,Oe.jsx)("button",{type:"button",className:`stream-meta__reveal${n?" is-active":""}`,onClick:r,title:l.metaRevealHint,"aria-pressed":n,children:n?"\u{1F441}":"\u{1F648}"})]}),f?.categoryName||f?.title?(0,Oe.jsxs)("div",{className:"stream-meta__now",children:[f.categoryName?(0,Oe.jsx)("span",{className:"stream-meta__category",style:{borderColor:ip(f.categoryName)},children:f.categoryName}):null,f.title?(0,Oe.jsx)("span",{className:"stream-meta__title",children:f.title}):null]}):null,o?null:(0,Oe.jsxs)("div",{className:"stream-meta__bar",role:"img","aria-label":l.metaCategory,title:n?void 0:l.metaRevealHint,children:[s.segments.map(v=>{let C=v.endSec??m,c=Math.min(C,w);if(c<=v.startSec)return null;let a=v.startSec/m*100,p=(c-v.startSec)/m*100;return(0,Oe.jsx)("span",{className:"stream-meta__segment",style:{left:`${a}%`,width:`${p}%`,background:ip(v.categoryName)},title:`${v.categoryName??"\u2014"} \xB7 ${tr(v.startSec)}`},`${v.startSec}-${v.categoryName??"none"}`)}),!n&&w<m?(0,Oe.jsx)("span",{className:"stream-meta__unknown",style:{left:`${w/m*100}%`,width:`${(m-w)/m*100}%`},title:l.metaRevealHint}):null]})]})}var M=B(le()),ap=200;function cp({archiveId:e,chatUrl:t,historySessionId:n=e,liveEmotesUrl:r,timelineUrl:o,eventsUrl:l,staticData:i,videoElement:s,isLive:u,defaultOffsetSec:d=0,externalOffsetSec:h,onExternalOffsetChange:m,baseOffsetSec:f=0,isLastPart:g=!0}){let{locale:w}=Of(),{spoilerFree:v}=Bf(),C=Cf[w],{prefs:c,update:a,toggleRole:p,reset:y}=Ef(),[k,S]=(0,T.useState)(i??null),[F,N]=(0,T.useState)(!i),[V,R]=(0,T.useState)(!1),[ee,Zt]=Sf(e??t??null,d),fe=h??ee,wn=(0,T.useCallback)(E=>{let A=typeof E=="function"?E(fe):E;h!==void 0&&m?m(A):Zt(A)},[fe,h,m,Zt]),[St,Gl]=(0,T.useState)(!1),[so,uo]=(0,T.useState)(""),[Qe,Ke]=(0,T.useState)(null),[Cn,_n]=(0,T.useState)(0),[Xt,or]=(0,T.useState)(!1),[Dt,ao]=(0,T.useState)(0),[Ft,x]=(0,T.useState)(null),[$,j]=(0,T.useState)(!1),ke=(0,T.useMemo)(()=>qf(k?.mediaTimeline),[k?.mediaTimeline]),kn=ep((Ft??Cn)+f-fe,ke),Su=k?.messages.at(-1),Jt=Su?Ql(Su.relativeTimeSec,ke)+fe-f:0,Yl=g&&!u&&Xt&&Dt>0&&Jt>Dt+.001,[gp,Du]=(0,T.useState)(!0),lr=(0,T.useRef)(null),Zl=(0,T.useRef)(null),fo=(0,T.useRef)(!0),Xl=(0,T.useRef)(0),[vp,yp]=(0,T.useState)(null),[xn,Fu]=(0,T.useState)(null),[Pu,po]=(0,T.useState)("idle");(0,T.useEffect)(()=>{i&&(S(i),N(!1),R(!1))},[i]);let ir=t??(e?`archives/${e}/chat`:null);(0,T.useEffect)(()=>{if(!ir||i)return;let E=!1;async function A(){N(!0),R(!1),S(null);try{let G=await Kl(ir,()=>E);E||S(G)}catch{E||(S({messages:[],emotes:null}),R(!0))}finally{E||N(!1)}}return A(),()=>{E=!0}},[ir,i]),(0,T.useEffect)(()=>{Fu(null),po("idle")},[r]),(0,T.useEffect)(()=>{if(!c.useLiveEmotes||!r||xn)return;let E=!1;return po("loading"),(async()=>{try{let A=await Ie(r);if(E)return;Fu(A.emotes),po("idle")}catch{E||po("error")}})(),()=>{E=!0}},[c.useLiveEmotes,r,xn]),(0,T.useEffect)(()=>{if(!s)return;let E=()=>{x(null),j(!1),or(!1)},A=()=>ao(Number.isFinite(s.duration)?s.duration:0),G=()=>{A(),_n(s.currentTime),or(!0)};E(),A(),s.ended&&G();let Ge=()=>{let En=s.ended?s.currentTime:Math.floor(s.currentTime);_n(ur=>ur===En?ur:En)};return s.addEventListener("timeupdate",Ge),s.addEventListener("seeked",Ge),s.addEventListener("seeking",E),s.addEventListener("playing",E),s.addEventListener("emptied",E),s.addEventListener("ended",G),s.addEventListener("durationchange",A),Ge(),()=>{s.removeEventListener("timeupdate",Ge),s.removeEventListener("seeked",Ge),s.removeEventListener("seeking",E),s.removeEventListener("playing",E),s.removeEventListener("emptied",E),s.removeEventListener("ended",G),s.removeEventListener("durationchange",A)}},[s,f,ir]),(0,T.useEffect)(()=>{if(!$||!Yl)return;let E=performance.now(),A=window.setInterval(()=>{let G=performance.now(),Ge=(G-E)/1e3;E=G,x(En=>np(En??Dt,Ge,Jt,s?.playbackRate??1))},200);return()=>window.clearInterval(A)},[$,Yl,Dt,Jt,s]),(0,T.useEffect)(()=>{Ft!==null&&Ft>=Jt&&j(!1)},[Ft,Jt]);let Nu=(0,T.useMemo)(()=>{let E=c.useLiveEmotes&&xn?xn:k?.emotes,A=new Map;for(let G of E?.emotes??[])A.set(G.name,G);return A},[k?.emotes,c.useLiveEmotes,xn]),Jl=(0,T.useMemo)(()=>ku(c.keywords),[c.keywords]),wp=(0,T.useMemo)(()=>new Set(Jl),[Jl]),Tu=(0,T.useMemo)(()=>new Set(ku(c.hiddenUsers)),[c.hiddenUsers]),Cp=(0,T.useMemo)(()=>new Set(c.highlightRoles),[c.highlightRoles]),ql=so.trim().toLowerCase(),qt=(0,T.useMemo)(()=>(k?.messages??[]).filter(A=>!(!c.showDeleted&&A.isDeleted||Tu.has(A.authorLogin.toLowerCase())||c.hideCommands&&A.textRaw.trimStart().startsWith("!")||ql&&!`${A.authorLogin} ${A.authorDisplayName??""} ${A.textRaw}`.toLowerCase().includes(ql))),[k,c.showDeleted,c.hideCommands,Tu,ql]),Ru=(k?.messages.length??0)-qt.length,Mu=(0,T.useMemo)(()=>{if(qt.length===0)return[];let E=(Ne,Pp)=>({message:Ne,renderTime:Ql(Ne.relativeTimeSec,ke)-f+fe,deleted:oo(Ne,Pp)});if(u||!s)return qt.slice(-ap).map(Ne=>E(Ne,Number.POSITIVE_INFINITY));let A=kn,G=0,Ge=qt.length;for(;G<Ge;){let Ne=G+Ge>>>1;qt[Ne].relativeTimeSec<=A?G=Ne+1:Ge=Ne}let En=Math.max(0,G-ap),ur=[];for(let Ne=En;Ne<G;Ne+=1)ur.push(E(qt[Ne],A));return ur},[qt,kn,ke,fe,f,u,s]),ho=(0,T.useCallback)(()=>{let E=lr.current;E&&(E.scrollTop=E.scrollHeight,Xl.current=E.scrollTop)},[]);(0,T.useLayoutEffect)(()=>{fo.current&&ho()}),(0,T.useEffect)(()=>{let E=new ResizeObserver(()=>{fo.current&&ho()});return lr.current&&E.observe(lr.current),Zl.current&&E.observe(Zl.current),()=>E.disconnect()},[ho]);let _p=()=>{let E=lr.current;if(!E)return;let A=E.scrollHeight-E.scrollTop-E.clientHeight<24,G=E.scrollTop<Xl.current-1;Xl.current=E.scrollTop,(A||G)&&(fo.current=A,Du(A))},kp=()=>{fo.current=!0,ho(),Du(!0)},sr=(0,T.useCallback)(E=>Ql(E,ke)-f+fe,[f,fe,ke]),ei=(0,T.useCallback)(E=>{if(!s||u)return!1;let A=sr(E),G=Number.isFinite(s.duration)?s.duration:null;return A>=0&&(G===null||A<=G)},[s,u,sr]),xp=(0,T.useCallback)(E=>{!s||!ei(E)||(s.currentTime=Math.max(0,sr(E)))},[s,ei,sr]),Ep=k?.messages??[],Au=(0,T.useMemo)(()=>{let E=new Map;for(let A of k?.messages??[])E.set(A.authorLogin.toLowerCase(),A.authorLogin),A.authorDisplayName&&E.set(A.authorDisplayName.toLowerCase(),A.authorLogin);return E},[k?.messages]),zu=(0,T.useCallback)(E=>Ke(Au.get(E.toLowerCase())??E.toLowerCase()),[Au]),ti=u||!s?Number.POSITIVE_INFINITY:kn,Sp=Pu==="loading"?C.liveEmotesLoading:Pu==="error"?C.liveEmotesError:c.useLiveEmotes&&xn===null?C.liveEmotesNone:null,Dp={"--chat-font":`${c.fontPx}px`,"--chat-emote":`${c.emotePx}px`},Fp=["chat-replay",c.compact?"is-compact":"",c.stripes?"has-stripes":"",c.showTimestamps?"":"no-time"].filter(Boolean).join(" ");return(0,M.jsxs)("div",{className:Fp,style:Dp,children:[(0,M.jsxs)("div",{className:"chat-bar",children:[(0,M.jsx)("strong",{className:"chat-bar__title",children:C.title}),!v&&k?.messages.length?(0,M.jsx)("span",{className:"chat-bar__count",children:k.messages.length}):null,Ru>0?(0,M.jsxs)("span",{className:"chat-bar__filtered",title:C.filtered,children:["\u2212",Ru]}):null,fe!==0?(0,M.jsxs)("span",{className:"chat-bar__offset",title:C.offset,children:[fe>0?`+${fe}`:fe,"s"]}):null,(0,M.jsx)("button",{type:"button",className:`chat-bar__gear${St?" is-active":""}`,onClick:()=>Gl(E=>!E),title:C.settings,"aria-expanded":St,children:(0,M.jsx)(Jf,{size:14})})]}),k?.missingGifAssets?.length?(0,M.jsx)("div",{className:"chat-empty",role:"status",children:w==="ru"?"\u0412 \u044D\u0442\u043E\u043C \u0444\u0430\u0439\u043B\u0435 \u043D\u0435\u0442 \u043A\u043E\u043F\u0438\u0439 \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u044B\u0445 GIF. \u041E\u043D\u0438 \u043E\u0442\u043A\u0440\u043E\u044E\u0442\u0441\u044F, \u0442\u043E\u043B\u044C\u043A\u043E \u0435\u0441\u043B\u0438 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u044B \u0435\u0449\u0451 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B.":"Some GIF images are missing from this file. They can load only while the originals remain available."}):null,St?(0,M.jsx)(Gf,{prefs:c,update:a,toggleRole:p,reset:y,copy:C,locale:w,offset:fe,setOffset:wn,search:so,setSearch:uo,liveEmotesUrl:r,liveEmotesNote:Sp}):null,Yl?(0,M.jsxs)("div",{className:"chat-tail",role:"group","aria-label":C.afterStream,children:[(0,M.jsx)("span",{children:C.afterStream}),(Ft??Dt)<Jt?(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)("button",{type:"button",className:"button secondary",onClick:()=>{x(E=>E??Dt),j(E=>!E)},children:$?C.pauseTail:C.playTail}),(0,M.jsx)("button",{type:"button",className:"button secondary",onClick:()=>{j(!1),x(Jt)},children:C.showTail})]}):(0,M.jsx)("span",{children:C.tailComplete})]}):null,(0,M.jsx)(up,{timelineUrl:o,chatTimeSec:ti,reveal:!v&&c.revealTimeline,onToggleReveal:()=>a("revealTimeline",!c.revealTimeline),hideScale:v,copy:C,locale:w}),c.showEvents?(0,M.jsx)(op,{eventsUrl:l,collapsed:c.collapseEvents,onToggleCollapsed:()=>a("collapseEvents",!c.collapseEvents),chatTimeSec:ti,copy:C,locale:w}):null,(0,M.jsxs)("div",{className:"chat-list-wrap",ref:yp,children:[(0,M.jsx)("div",{ref:lr,className:"chat-list thin-scroll",onScroll:_p,children:(0,M.jsx)("div",{ref:Zl,className:"chat-list-content",children:F?Array.from({length:16},(E,A)=>(0,M.jsxs)("div",{className:"chat-message chat-message--skeleton",children:[(0,M.jsx)(Eu,{width:`${34+A*17%40}px`}),(0,M.jsx)(Eu,{width:`${45+A*29%45}%`})]},A)):V?(0,M.jsx)("div",{className:"chat-empty chat-empty--error",children:C.loadError}):Mu.length===0?(0,M.jsx)("div",{className:"chat-empty",children:k?.messages.length===0?C.empty:C.waiting}):Mu.map(E=>(0,M.jsx)(Ng,{message:E.message,renderTime:E.renderTime,deleted:E.deleted,emoteMap:Nu,gifAssets:k?.gifAssets,emotePx:c.emotePx,readableColors:c.readableColors,highlightRoles:Cp,highlightFirstMessage:c.highlightFirstMessage,showBets:c.showBets,keywords:Jl,selfNames:wp,isActiveUser:Qe===E.message.authorLogin,onAuthorClick:Ke,onMentionClick:zu,locale:w,copy:C},E.message.id))})}),gp?null:(0,M.jsx)("button",{type:"button",className:"chat-jump-pill",onClick:kp,children:C.paused}),Qe?(0,M.jsx)(Xf,{login:Qe,historyUrl:n?`public/streams/${n}/chat/users/${encodeURIComponent(Qe)}/history`:void 0,messages:Ep,thresholdSec:ti,emoteMap:Nu,gifAssets:k?.gifAssets,emotePx:c.emotePx,readableColors:c.readableColors,copy:C,locale:w,onClose:()=>Ke(null),onMentionClick:zu,onSeek:xp,canSeek:ei,toRenderTime:sr,anchorEl:vp},`${n??ir??"offline"}:${Qe.toLowerCase()}`):null]})]})}var Ng=(0,T.memo)(function({message:t,renderTime:n,deleted:r,emoteMap:o,gifAssets:l,emotePx:i,readableColors:s,highlightRoles:u,highlightFirstMessage:d,showBets:h,keywords:m,selfNames:f,isActiveUser:g,onAuthorClick:w,onMentionClick:v,locale:C,copy:c}){let a=Ol(t.textRaw),p=Bl(t),y=p.find(ee=>u.has(ee)),k=m.length>0&&m.some(ee=>a.text.toLowerCase().includes(ee)),S=["chat-message",r?"is-deleted":"",a.isAction?"is-action":"",d&&t.isFirstMessage?"is-first":"",y?`is-role is-role--${y}`:"",k?"is-keyword":"",g?"is-active-user":""].filter(Boolean).join(" "),F=r?t.banDurationSec??null:null,N=d&&!!t.isFirstMessage,V=s?$l(t.authorColor):t.authorColor,R=h?t.predictionBet??null:null;return(0,M.jsxs)("div",{className:S,children:[(0,M.jsx)("span",{className:"chat-time",title:"Time in video",children:tr(n)}),N?(0,M.jsx)("span",{className:"chat-first",title:c.firstMessageTitle,children:c.firstMessage}):null,p.length>0?(0,M.jsx)("span",{className:"chat-badges",children:p.map(ee=>(0,M.jsx)("span",{className:`chat-badge chat-badge--${ee}`,title:gn[ee][C],children:gn[ee].badge},ee))}):null,R?(0,M.jsx)("span",{className:"chat-bet",style:{background:bf(R.badgeVersion)},title:R.outcomeTitle?`${c.eventBetOn}: ${R.outcomeTitle}`:c.eventPrediction,children:R.outcomeTitle??"\u2022"}):null,(0,M.jsx)("button",{type:"button",className:"chat-author",style:{color:V||"#9ca3af"},onClick:()=>w(t.authorLogin),title:c.userCardTitle,children:t.authorDisplayName??t.authorLogin}),(0,M.jsx)("span",{className:"chat-separator",children:a.isAction?" ":": "}),(0,M.jsx)("span",{className:"chat-text",children:(0,M.jsx)(bl,{text:a.text,emoteMap:o,twitchEmotes:t.emotes,inlineEmotes:t.inlineEmotes,twitchGifs:t.gifs,gifUrls:t.gifUrls,gifAssets:l,emotePx:i,selfNames:f,onMentionClick:v,mentionTitle:c.userCardTitle})}),F!==null?(0,M.jsxs)("span",{className:`chat-ban${F===0?" chat-ban--perma":""}`,title:F===0?c.banPermanent:c.banTimeout,children:[F===0?"\u26D4":"\u23F1"," ",Tg(F,C)]}):null]})});function Tg(e,t){if(e<=0)return t==="ru"?"\u0431\u0430\u043D":"ban";if(e<60)return t==="ru"?`${e} \u0441\u0435\u043A`:`${e}s`;if(e<3600){let r=Math.round(e/60);return t==="ru"?`${r} \u043C\u0438\u043D`:`${r}m`}if(e<86400){let r=Math.round(e/3600);return t==="ru"?`${r} \u0447`:`${r}h`}let n=Math.round(e/86400);return t==="ru"?`${n} \u0434\u043D`:`${n}d`}function dp(e,t,n){let r=n?.mediaTimeline?.captureAnchorMs||Date.parse(e.recordingStartedAt||e.startedAt||"");return Number.isFinite(r)&&t>0?(r-t)/1e3:0}function fp(e,t,n){return{...e,mediaTimeline:null,messages:e.messages.map(r=>{let o=Date.parse(r.messageTimestamp||"");return{...r,relativeTimeSec:n>0&&Number.isFinite(o)?(o-n)/1e3:r.relativeTimeSec+t,deletedAtSec:r.deletedAtSec==null?r.deletedAtSec:r.deletedAtSec+t}})}}function pp(e){let t=new Map,n=new Map;for(let r of e){for(let o of r.messages){let l=o.id;t.has(l)||t.set(l,o)}for(let o of r.emotes?.emotes??[])n.set(o.name,o)}return{messages:[...t.values()].sort((r,o)=>r.relativeTimeSec-o.relativeTimeSec),emotes:{provider:"7tv",fetchedAt:"",emotes:[...n.values()]},gifAssets:Object.assign({},...e.map(r=>r.gifAssets))}}function hp(e,t,n){let r=o=>o==null?o:o+n;return e.endsWith("/events")?{...t,events:(t.events??[]).map(o=>({...o,startedAtSec:r(o.startedAtSec),lockedAtSec:r(o.lockedAtSec),endedAtSec:r(o.endedAtSec),samples:o.samples.map(l=>({...l,atSec:r(l.atSec)}))}))}:e.endsWith("/timeline")?{...t,points:t.points.map(o=>({...o,relativeTimeSec:r(o.relativeTimeSec)})),segments:t.segments.map(o=>({...o,startSec:r(o.startSec),endSec:r(o.endSec)})),titles:t.titles.map(o=>({...o,atSec:r(o.atSec)}))}:t}var Yt=B(le());function Rg({options:e}){let[t,n]=(0,Et.useState)(null),[r,o]=(0,Et.useState)(!1),[l,i]=(0,Et.useState)(0),[s,u]=(0,Et.useState)(""),d=e.sessions.map(f=>f.id).join(",")+":"+e.vodStartMs,[h,m]=(0,Et.useState)({});return(0,Et.useEffect)(()=>{let f=!1;if(n(null),o(!1),!!e.sessions.length)return(async()=>{let g={},w=[];for(let v of e.sessions){let C=`public/streams/${v.id}`,c;try{c=await Kl(C+"/chat",()=>f,p=>Ie(p))}catch{c=await Ie(C+"/chat-replay")}if(f||!c)return;let a=dp(v,e.vodStartMs,c);g[v.id]=a,w.push(fp(c,a,e.vodStartMs))}f||(m(g),n(pp(w)))})().catch(()=>{f||o(!0)}),()=>{f=!0}},[d,l]),(0,Et.useEffect)(()=>{let f=e.video,g=()=>{let w=(f?.currentTime??0)+e.offset,v=e.sessions.slice().sort((c,a)=>(h[c.id]??0)-(h[a.id]??0)),C=v.filter(c=>(h[c.id]??0)<=w).at(-1)??v[0];u(C?.id??"")};return g(),f?.addEventListener("timeupdate",g),f?.addEventListener("seeked",g),()=>{f?.removeEventListener("timeupdate",g),f?.removeEventListener("seeked",g)}},[e.video,e.offset,d,h]),wf(e.server,e.request,(f,g)=>{let w=f.split("/")[2];return hp(f,g,h[w]??0)}),r?(0,Yt.jsxs)("div",{className:"notice error",children:["\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0447\u0430\u0442. ",(0,Yt.jsx)("button",{onClick:()=>i(f=>f+1),children:"\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C"})]}):t?(0,Yt.jsx)(jl.Provider,{value:{locale:e.locale??"ru",spoilerFree:e.spoilerFree},children:(0,Yt.jsx)(cp,{staticData:t,archiveId:`twitch:${d}`,historySessionId:s,liveEmotesUrl:s?`public/streams/${s}/emotes/live`:void 0,timelineUrl:s?`public/streams/${s}/timeline`:void 0,eventsUrl:s?`public/streams/${s}/events`:void 0,videoElement:e.video,isLive:!1,externalOffsetSec:-e.offset,onExternalOffsetChange:f=>e.onOffsetChange(-f)})}):(0,Yt.jsx)("div",{className:"notice",children:e.sessions.length?"\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0447\u0430\u0442\u0430\u2026":"\u0418\u0449\u0443 \u0437\u0430\u043F\u0438\u0441\u044C \u044D\u0442\u043E\u0433\u043E \u044D\u0444\u0438\u0440\u0430\u2026"})}function Mg(e,t){try{if(!localStorage.getItem("tsr-chat-prefs")){let s=JSON.parse(localStorage.getItem("tsr-chat-view")||"null");s&&localStorage.setItem("tsr-chat-prefs",JSON.stringify({fontPx:s.fontPx,emotePx:(s.emoteScale||1.5)*(s.fontPx||13),showTimestamps:s.showTime,stripes:s.zebra,readableColors:s.readable,showDeleted:s.showDeleted,highlightFirstMessage:s.firstMsg,keywords:s.highlight}))}}catch{}let n=e.attachShadow({mode:"open"});n.addEventListener("keydown",s=>s.stopPropagation()),n.addEventListener("keyup",s=>s.stopPropagation());let r=document.createElement("style");r.textContent=`:host {
  --bg: #0b0d10;
  --panel: #11141a;
  --panel-2: #161a21;
  --border: #1f2530;
  --border-strong: #2a3140;
  --text: #e6e9ef;
  --text-dim: #8a93a3;
  --text-faint: #5a6272;
  --accent: #a78bfa;
  --accent-soft: rgba(167, 139, 250, 0.15);
  --live: #ef4444;
  --live-soft: rgba(239, 68, 68, 0.15);
  --warn: #f59e0b;
  --warn-soft: rgba(245, 158, 11, 0.12);
  --ok: #22c55e;
  --ok-soft: rgba(34, 197, 94, 0.12);
  --danger: #ef4444;
  --danger-soft: rgba(239, 68, 68, 0.12);
  --radius-sm: 6px;
  --radius: 10px;
  --radius-lg: 14px;
}

* {
  box-sizing: border-box;
}

:host {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

/* ---------- Layout ---------- */

.app-frame {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}

.sidebar {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  padding: 18px 14px;
  gap: 18px;
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 8px 14px;
  border-bottom: 1px solid var(--border);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Burger toggle: hidden on desktop, shown by the mobile top-bar layout. */
.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  background: var(--panel-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 7px 9px;
  cursor: pointer;
}

.brand-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.02em;
}

.brand-eyebrow {
  font-size: 10px;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-group-title {
  margin: 10px 10px 4px;
  font-size: 10px;
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.nav-group:first-child .nav-group-title {
  margin-top: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  color: var(--text-dim);
  font-size: 13px;
  transition: background 0.15s, color 0.15s;
}

.nav-link:hover {
  background: var(--panel-2);
  color: var(--text);
}

.nav-link.active {
  background: var(--accent-soft);
  color: var(--text);
}

.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.storage-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--panel);
}

.storage-tier + .storage-tier {
  margin-top: 12px;
}

/* The sidebar is narrow, so the label gets its own line. Sharing one with the
   number truncated both to "\u0414\u0438\u0441\u043A \u0441\u0435\u0440\u0432..." \u2014 an abbreviation that carries less
   than the space it saved. */
.storage-tier-name {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-dim);
  font-size: 11px;
  margin-bottom: 6px;
}

.storage-tier-meta {
  margin-top: 5px;
  font-size: 11px;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
}

/* Free space is the number being looked for; the total is the context that
   makes it mean something, so both are on the line and only the first is
   emphasised. */
.storage-tier-meta strong {
  color: var(--text);
  font-weight: 600;
}

/* A hairline, not a progress bar: at a glance it reads as "how full", and it
   stays out of the way the rest of the time. */
.storage-bar {
  height: 3px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}

.storage-bar-fill {
  height: 100%;
  background: var(--text-dim);
  transition: width 0.3s;
}

/* Colour is a signal here, never decoration: neutral until the disk is
   genuinely worth looking at. */
.storage-bar-fill.warn {
  background: var(--warn);
}

.storage-bar-fill.danger {
  background: var(--danger);
}

.storage-tier.offline .storage-bar-fill {
  background: repeating-linear-gradient(
    90deg,
    var(--border) 0 4px,
    transparent 4px 8px
  );
}

.storage-tier.offline .storage-tier-meta {
  color: var(--danger);
}

.lang-row {
  display: flex;
  gap: 4px;
}

.lang-row button {
  flex: 1;
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: var(--radius-sm);
  padding: 6px 0;
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.08em;
}

.lang-row button:hover {
  border-color: var(--border-strong);
  color: var(--text);
}

.lang-row button.active {
  background: var(--accent-soft);
  border-color: transparent;
  color: var(--text);
}

.content-area {
  padding: 20px 28px 40px;
  overflow-x: hidden;
}

/* ---------- Headings ---------- */

.page-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 1400px;
}

/* Replay-with-chat: break out of the 1400px cap and use the full
   width that the layout shell provides. */
.page-shell--wide {
  max-width: none;
}

.page-shell--wide .replay-video {
  max-height: calc(100vh - 220px);
  object-fit: contain;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 8px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.01em;
}

.page-copy {
  margin: 4px 0 0;
  color: var(--text-dim);
  font-size: 13px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ---------- Cards / Stats ---------- */

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.stat-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--panel);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.stat-value.live {
  color: var(--live);
}

.stat-value.recording {
  color: var(--accent);
}

/* ---------- Panels ---------- */

.panel {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--panel);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.panel-body {
  padding: 16px;
}

.panel-body.no-padding {
  padding: 0;
}

/* ---------- Tables ---------- */

.table-wrap {
  width: 100%;
  overflow-x: auto;
  /* Required, not redundant: with overflow-x set and overflow-y left at
     "visible", CSS computes overflow-y to "auto" as well \u2014 so a single pixel
     of extra height (a sticky header, a negative margin) grew a full vertical
     scrollbar with arrows inside the box. */
  overflow-y: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th,
.table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.table th {
  background: transparent;
  color: var(--text-dim);
  font-weight: 500;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--border-strong);
  position: sticky;
  top: 0;
  background: var(--panel);
}

.table tbody tr {
  transition: background 0.1s;
}

.table tbody tr:hover {
  background: var(--panel-2);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table .col-actions {
  text-align: right;
  width: 1%;
  white-space: nowrap;
}

.table .col-status {
  width: 1%;
  white-space: nowrap;
}

.table .col-meta {
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.table .col-truncate {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- Cells ---------- */

.cell-channel {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--panel-2);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dim);
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cell-name {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cell-name strong {
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-name span {
  font-size: 11px;
  color: var(--text-dim);
}

/* ---------- Badges ---------- */

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  color: var(--text-dim);
  font-weight: 500;
  white-space: nowrap;
}

.badge.live {
  background: var(--live-soft);
  border-color: transparent;
  color: var(--live);
}

.badge.live::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--live);
  animation: pulse 1.4s ease-in-out infinite;
}

.badge.recording {
  background: var(--accent-soft);
  border-color: transparent;
  color: var(--accent);
}

.badge.recording::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 1.4s ease-in-out infinite;
}

.badge.warn {
  background: var(--warn-soft);
  border-color: transparent;
  color: var(--warn);
}

.badge.ok {
  background: var(--ok-soft);
  border-color: transparent;
  color: var(--ok);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* ---------- Buttons ---------- */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  background: var(--panel-2);
  border-color: var(--border-strong);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #0b0d10;
}

.btn.primary:hover:not(:disabled) {
  background: #b89cfb;
  border-color: #b89cfb;
}

.btn.danger {
  background: var(--danger);
  border-color: var(--danger);
  color: #fff;
}

.btn.danger:hover:not(:disabled) {
  background: #f87171;
  border-color: #f87171;
}

/* Icon-only button */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.icon-btn:hover:not(:disabled) {
  background: var(--panel-2);
  color: var(--text);
  border-color: var(--border);
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icon-btn.live {
  color: var(--accent);
}

.icon-btn.live:hover:not(:disabled) {
  background: var(--accent-soft);
  color: var(--accent);
}

.icon-btn.danger {
  color: var(--text-dim);
}

.icon-btn.danger:hover:not(:disabled) {
  background: var(--danger-soft);
  color: var(--danger);
  border-color: transparent;
}

.icon-btn.stop {
  color: var(--live);
}

.icon-btn.stop:hover:not(:disabled) {
  background: var(--live-soft);
  border-color: transparent;
}

.action-row {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}

/* ---------- Spinner & loading feedback ---------- */

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 0.8s linear infinite;
}

.icon-btn.is-loading {
  background: var(--panel-2);
  border-color: var(--border);
  color: var(--accent);
}

.btn.is-loading {
  position: relative;
  color: transparent !important;
  pointer-events: none;
}

.btn.is-loading::after {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  color: var(--text);
  top: 50%;
  left: 50%;
  margin-top: -7px;
  margin-left: -7px;
}

.btn.primary.is-loading::after {
  color: #0b0d10;
}

/* Click feedback: briefly press */
.icon-btn:active:not(:disabled),
.btn:active:not(:disabled) {
  transform: scale(0.96);
}

/* ---------- Pagination ---------- */

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-dim);
}

.pagination-info {
  font-variant-numeric: tabular-nums;
}

.pagination-controls {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pagination-controls button {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: var(--radius-sm);
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pagination-controls button:hover:not(:disabled) {
  background: var(--panel-2);
  color: var(--text);
}

.pagination-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-controls .page-num {
  min-width: 28px;
  padding: 0 8px;
  height: 28px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.pagination-controls .page-num.active {
  background: var(--accent-soft);
  border-color: transparent;
  color: var(--text);
}

/* ---------- Replay stage (replay page wrapper, 3 modes) ---------- */

/* Two columns and nothing else: everything that is not chat lives in
   .replay-stage__main. This used to be a grid with named areas for
   header/player/chat only, so notices and the part selector were auto-placed
   into implicit rows AFTER them \u2014 an error about the archive rendered below
   the video instead of above it. */
.replay-stage {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
}

.replay-stage__main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
}

.replay-stage__player {
  min-width: 0;
}

.replay-stage__chat {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

/* ---- Compact header: one row, title + context + actions ---- */

.replay-stage__header {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.replay-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--panel);
  color: var(--text-dim);
  font-size: 16px;
  line-height: 1;
  text-decoration: none;
  transition: border-color 120ms ease, color 120ms ease;
}

.replay-back:hover {
  border-color: var(--border-strong);
  color: var(--text);
}

.replay-titles {
  min-width: 0;
  flex: 1;
}

.replay-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.replay-subtitle {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-dim);
}

.replay-subtitle > span + span::before {
  content: "\\00b7";
  margin-right: 10px;
  color: var(--text-faint);
}

.replay-subtitle .badge::before {
  content: none;
}

.replay-stage__header .action-row {
  flex: none;
}

/* ---- Facts strip under the video ---- */

.replay-facts {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: 12px;
  color: var(--text-dim);
}

.replay-facts__source {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.replay-facts__part {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.replay-facts__part select {
  padding: 2px 6px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--panel-2);
  color: var(--text);
  font-size: 12px;
}

/* ---- Normal mode: video and chat fill the viewport height ---- */

.replay-stage--normal.has-chat {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--chat-width, 340px);
  /* Stretch, not start: the chat column takes exactly the height of the main
     column, so its top and bottom line up with the content instead of ending
     somewhere in the middle of the video. */
  align-items: stretch;
}

/* Capped by the space actually left below the page header rather than a magic
   constant, so the video neither clips nor leaves a gap. */
.replay-stage--normal .vp {
  max-height: calc(100vh - var(--replay-chrome, 230px));
}

/* Height comes from the grid row (i.e. from the video), so there is no second
   viewport calculation to disagree with the player's. */
.replay-stage--normal .replay-stage__chat {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--panel);
  overflow: hidden;
  min-height: 360px;
}

/* The chat is taken out of flow so it cannot inflate the row it shares with the
   video. An auto grid row is as tall as its TALLEST item, so an in-flow chat
   sized itself from its own message list (200 rendered messages \u2248 4400px), the
   row grew to match, and the video column was stretched with dead space below
   it \u2014 measured 4434px for both columns against a 208px video. "overflow:
   hidden" could not help: the element itself was that tall, so nothing
   overflowed it. Out of flow it contributes no height, the row is sized by the
   video alone, and .chat-list finally has a bounded parent to scroll inside. */
.replay-stage--normal .replay-stage__chat > .chat-replay {
  position: absolute;
  inset: 0;
}

.replay-stage--normal:not(.has-chat) .replay-stage__player {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* ---- Theater: player + chat, nothing else ---- */

.replay-stage--theater {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #000;
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--chat-width, 340px);
  grid-template-rows: 100%;
  gap: 0;
  overflow: hidden;
}

.replay-stage--theater:not(.has-chat) {
  grid-template-columns: 1fr;
}

.replay-stage--theater .replay-stage__main {
  gap: 0;
  height: 100%;
  min-height: 0;
}

.replay-stage--theater .replay-stage__header,
.replay-stage--theater .replay-facts,
.replay-stage--theater .notice {
  display: none;
}

.replay-stage--theater .replay-stage__player {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.replay-stage--theater .replay-stage__chat {
  background: var(--panel);
  border-left: 1px solid var(--border);
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* ---- Mobile portrait: video on top, chat filling the rest ---- */
@media (max-width: 900px) and (orientation: portrait) {
  .replay-stage--normal.has-chat {
    grid-template-columns: minmax(0, 1fr);
  }

  /* One column here, so there is no video row to borrow a height from, and the
     out-of-flow chat would collapse to its min-height. Give it a definite one:
     55vh is what the old content-driven sizing was capped at anyway. */
  .replay-stage--normal .replay-stage__chat {
    height: 55vh;
    min-height: 320px;
  }

  .replay-title {
    white-space: normal;
  }

  .replay-stage--theater.has-chat {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .replay-stage--theater.has-chat .replay-stage__player {
    height: auto;
  }

  .replay-stage--theater.has-chat .vp {
    aspect-ratio: 16 / 9;
    height: auto;
  }

  .replay-stage--theater .replay-stage__chat {
    border-left: none;
    border-top: 1px solid var(--border);
  }
}

/* ---- Mobile landscape: keep two columns, narrower chat ---- */
@media (max-width: 900px) and (orientation: landscape) {
  .replay-stage--normal.has-chat,
  .replay-stage--theater.has-chat {
    --chat-width: 250px;
  }

  .replay-stage--normal .replay-stage__chat {
    min-height: 0;
  }
}

/* ---- Screen-fit stage (public watch page) ---- */

/* The stage takes exactly the viewport height and the two columns divide it:
   video with its info on the left, chat on the right. Heights flow strictly
   top-down (viewport -> stage -> row -> column -> list), so no column can be
   sized by its own content and inflate the page \u2014 the page never scrolls, only
   the lists inside do. Scoped to --fit so the admin replay keeps its in-page
   layout. Theater mode is untouched: that stage is already position: fixed
   with a definite 100% row. */
.replay-stage--fit.replay-stage--normal {
  height: calc(100vh - 2 * var(--shell-pad, 16px));
  height: calc(100dvh - 2 * var(--shell-pad, 16px));
  overflow: hidden;
}

.replay-stage--fit.replay-stage--normal.has-chat {
  grid-template-rows: minmax(0, 1fr);
}

.replay-stage--fit.replay-stage--normal .replay-stage__main {
  height: 100%;
  min-height: 0;
}

/* The player absorbs whatever height the header and notices leave over. */
.replay-stage--fit.replay-stage--normal .replay-stage__player {
  flex: 1;
  min-height: 0;
  display: flex;
}

/* Height now comes from the column, not from the width: without this the
   16:9 aspect ratio dictated the height, and on a wide window the video alone
   was taller than the screen. object-fit: contain letterboxes inside \u2014 the
   same mechanism theater mode already uses. */
.replay-stage--fit.replay-stage--normal .vp {
  aspect-ratio: auto;
  height: 100%;
  max-height: none;
}

.replay-stage--fit.replay-stage--normal .replay-stage__chat {
  min-height: 0;
}

/* One column on portrait: the video keeps its natural 16:9 height and the
   chat gets everything below it, still inside the one-screen stage. */
@media (max-width: 900px) and (orientation: portrait) {
  .replay-stage--fit.replay-stage--normal.has-chat {
    grid-template-rows: auto minmax(0, 1fr);
  }

  .replay-stage--fit.replay-stage--normal .replay-stage__main {
    height: auto;
  }

  .replay-stage--fit.replay-stage--normal .replay-stage__player {
    flex: none;
    display: block;
  }

  .replay-stage--fit.replay-stage--normal .vp {
    aspect-ratio: 16 / 9;
    height: auto;
  }

  .replay-stage--fit.replay-stage--normal .replay-stage__chat {
    height: auto;
    min-height: 0;
  }
}

/* ---- Screen-fit stage inside the admin shell ---- */

/* The admin replay can't use the watch page's own "100dvh minus padding"
   calc: the shell around it has an asymmetric .content-area padding and, on
   mobile, a sticky sidebar bar of unknown height. So when the shell hosts a
   fit stage, the frame is pinned to the viewport and the height flows DOWN
   through the chain (frame \u2192 content \u2192 page \u2192 stage) instead of the stage
   computing it from the viewport a second time. */
.app-frame:has(.replay-stage--fit) {
  height: 100vh;
  height: 100dvh;
}

.app-frame:has(.replay-stage--fit) .sidebar {
  overflow-y: auto;
}

.app-frame:has(.replay-stage--fit) .content-area {
  display: flex;
  flex-direction: column;
  min-height: 0;
  /* The 40px bottom pad is chrome for scrolling list pages; under a
     one-screen stage it was exactly the dead strip below video and chat. */
  padding-bottom: 20px;
}

.app-frame:has(.replay-stage--fit) .content-area > * {
  flex: 1;
  min-height: 0;
}

/* Inherit the height from the shell chain instead of the watch calc. */
.content-area .replay-stage--fit.replay-stage--normal {
  height: auto;
  flex: 1;
  min-height: 0;
}

@media (max-width: 900px) {
  /* Mobile stacks the sidebar bar above the content: give the content row
     the remainder explicitly \u2014 auto rows would size to content and the
     stage would lose its definite height. */
  .app-frame:has(.replay-stage--fit) {
    grid-template-rows: auto minmax(0, 1fr);
  }

  .app-frame:has(.replay-stage--fit) .content-area {
    padding-bottom: 14px;
  }
}


/* ---------- VideoPlayer ---------- */

.vp {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: var(--radius);
  overflow: hidden;
  aspect-ratio: 16 / 9;
  color: #fff;
  user-select: none;
  /* Kill double-tap-to-zoom so double-tap seeking works on touch screens. */
  touch-action: manipulation;
}

/* Phones: hardware buttons control volume; the slider only wastes space. */
@media (max-width: 720px) {
  .vp__volume-slider,
  .vp__volume-pct {
    display: none;
  }
}

.vp--theater,
.vp--fullscreen {
  border-radius: 0;
  aspect-ratio: auto;
  height: 100%;
  width: 100%;
}

.vp__video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: #000;
  cursor: pointer;
}

.vp__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-style: italic;
}

/* ---- Audio-only recordings ----
   An audio archive has no picture, so the player must not pretend to be a
   video stage: no 16:9 black box, no theater / fullscreen, no letterboxing to
   the viewport height. It renders as a compact cover strip (avatar + the same
   waveform the archive card draws) with the usual transport controls under
   it. The selectors repeat the stage prefixes because .replay-stage--fit and
   theater mode stretch ".vp" with a higher specificity. */
.vp--audio,
.replay-stage--fit.replay-stage--normal .vp--audio,
.replay-stage--theater .vp--audio {
  aspect-ratio: auto;
  height: auto;
  max-height: none;
  align-self: start;
  border-radius: var(--radius);
  background: linear-gradient(135deg, #1a1725 0%, #10131a 55%, #121a17 100%);
}

.vp__audio-stage {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 168px;
  /* Leave the bottom free for the controls dock, which floats over it. */
  padding: 0 20px 46px;
  cursor: pointer;
}

.vp__audio-media {
  display: none;
}

.vp__audio-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-strong);
  flex: none;
}

.vp__audio-glyph {
  font-size: 40px;
  line-height: 1;
  flex: none;
}

.vp__audio-wave {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 64px;
  overflow: hidden;
}

.vp__audio-wave i {
  display: block;
  width: 4px;
  border-radius: 2px;
  background: var(--accent);
  opacity: 0.55;
}

.vp--audio.vp--playing .vp__audio-wave i {
  animation: vp-wave 1.1s ease-in-out infinite alternate;
}

@keyframes vp-wave {
  from { transform: scaleY(0.4); opacity: 0.35; }
  to { transform: scaleY(1); opacity: 0.85; }
}

@media (prefers-reduced-motion: reduce) {
  .vp--audio.vp--playing .vp__audio-wave i {
    animation: none;
  }
}

@media (max-width: 720px) {
  .vp__audio-stage {
    height: 132px;
    gap: 12px;
    padding: 0 12px 46px;
  }

  .vp__audio-avatar {
    width: 48px;
    height: 48px;
  }
}

/* Top bar (theater / fullscreen) */
.vp__top-bar {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 4;
  pointer-events: none;
  transition: opacity 0.2s, transform 0.2s;
}

.vp__top-bar > * { pointer-events: auto; }

.vp__top-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s;
}

.vp__top-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.vp__top-title {
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 13px;
  color: #fff;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vp--hide.vp--playing .vp__top-bar {
  opacity: 0;
  transform: translateY(-6px);
  pointer-events: none;
}

/* Buffering spinner */
.vp__buffering {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  pointer-events: none;
  z-index: 3;
}

/* Playback error overlay */
.vp__error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  z-index: 5;
  padding: 24px;
  text-align: center;
}

.vp__error-text {
  font-size: 14px;
  max-width: 420px;
  line-height: 1.5;
}

.vp__error-retry {
  background: var(--accent);
  color: #0b0d10;
  border: none;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 20px;
  cursor: pointer;
  transition: filter 0.15s, transform 0.15s;
}

.vp__error-retry:hover {
  filter: brightness(1.1);
  transform: scale(1.03);
}

/* Center play/pause flash */
.vp__center-hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 3;
}

.vp__center-hint > svg {
  width: 64px;
  height: 64px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 50%;
  padding: 16px;
  color: #fff;
  animation: vp-flash 0.45s ease-out forwards;
}

@keyframes vp-flash {
  0% { opacity: 0.95; transform: scale(0.85); }
  100% { opacity: 0; transform: scale(1.1); }
}

@media (prefers-reduced-motion: reduce) {
  .vp__center-hint > svg { animation: none; }
}

/* Big initial play button */
.vp__big-play {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, transform 0.15s;
  z-index: 3;
}

.vp__big-play:hover {
  background: var(--accent);
  color: #0b0d10;
  transform: translate(-50%, -50%) scale(1.05);
}

/* Controls dock */
.vp__controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 12px 6px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0));
  z-index: 4;
  transition: opacity 0.2s, transform 0.2s;
}

.vp--hide.vp--playing .vp__controls {
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
}

.vp--hide.vp--playing { cursor: none; }

/* Progress bar */
.vp__progress {
  position: relative;
  height: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  /* Pointer-driven scrubbing: don't let touch gestures scroll the page. */
  touch-action: none;
}

.vp__progress-track,
.vp__progress-buffered,
.vp__progress-played {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  border-radius: 2px;
  pointer-events: none;
  transition: height 0.15s;
}

.vp__progress-track {
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
}

/* Already-downloaded range: clearly lighter than the empty track so the
   preload progress is visible at a glance. */
.vp__progress-buffered {
  background: rgba(255, 255, 255, 0.55);
}

.vp__progress-played {
  background: var(--accent);
}

.vp__progress:hover .vp__progress-track,
.vp__progress:hover .vp__progress-buffered,
.vp__progress:hover .vp__progress-played {
  height: 6px;
}

.vp__progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: var(--accent);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  pointer-events: none;
  transition: transform 0.15s ease;
  box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.25);
}

.vp__progress:hover .vp__progress-thumb {
  transform: translate(-50%, -50%) scale(1);
}

.vp__scrub-preview {
  position: absolute;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 11px;
  padding: 4px;
  border-radius: 6px;
  transform: translateX(-50%);
  pointer-events: none;
  font-variant-numeric: tabular-nums;
}

.vp__scrub-video {
  width: 160px;
  height: 90px;
  object-fit: cover;
  border-radius: 4px;
  background: #000;
  display: block;
}

@media (max-width: 720px) {
  .vp__scrub-video {
    width: 120px;
    height: 68px;
  }
}

.vp__scrub-time {
  line-height: 1;
  padding-bottom: 2px;
  white-space: nowrap;
}

/* Wall-clock time of the hovered position, under the video-relative one. */
.vp__scrub-clock {
  display: block;
  margin-top: 3px;
  font-size: 10px;
  opacity: 0.65;
}

/* Audio has no frame to preview \u2014 the tooltip shrinks to the timestamp. */
.vp__scrub-preview--time {
  padding: 3px 7px;
}

.vp__scrub-preview--time .vp__scrub-time {
  padding-bottom: 0;
}

/* Bottom bar */
.vp__bar {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #fff;
  font-size: 13px;
  height: 40px;
}

.vp__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s, transform 0.1s;
}

.vp__btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.vp__btn:active {
  transform: scale(0.92);
}

.vp__btn--text {
  width: auto;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.vp__btn--active {
  color: var(--accent);
}

/* Volume */
.vp__volume {
  display: inline-flex;
  align-items: center;
}

.vp__volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 0;
  max-width: 0;
  height: 4px;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  margin: 0;
  /* Collapsed for real: without this the 12px thumb kept rendering next to
     the icon as a lone white dot even though the track had zero width. */
  opacity: 0;
  visibility: hidden;
  background: rgba(255, 255, 255, 0.3);
  transition: width 0.2s, max-width 0.2s, margin 0.2s;
  vertical-align: middle;
}

.vp__volume:hover .vp__volume-slider,
.vp__volume:focus-within .vp__volume-slider {
  width: 80px;
  max-width: 80px;
  margin: 0 8px 0 4px;
  opacity: 1;
  visibility: visible;
}

/* Numeric loudness readout. Hidden until the group is hovered \u2014 except when
   boosted past 100%, where it stays visible as a reminder that gain is on. */
.vp__volume-pct {
  display: none;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
  white-space: nowrap;
  margin-right: 4px;
}

.vp__volume:hover .vp__volume-pct,
.vp__volume:focus-within .vp__volume-pct,
.vp__volume-pct--boost {
  display: inline;
}

.vp__volume-pct--boost {
  color: var(--warn, #fbbf24);
  opacity: 1;
}

.vp__volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  border: none;
}

.vp__volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  border: none;
}

/* Time / live */
.vp__time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  padding: 0 8px;
  white-space: nowrap;
}

.vp__time-sep { opacity: 0.5; margin: 0 2px; }

/* Wall-clock time of the current position, next to the video-relative one. */
.vp__time-clock {
  margin-left: 6px;
  font-size: 11px;
  opacity: 0.55;
}

.vp__live-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--live);
  margin-right: 4px;
  animation: pulse 1.4s ease-in-out infinite;
}

.vp__spacer { flex: 1; }

/* Playback rate menu */
.vp__rate-wrap { position: relative; }

.vp__menu {
  position: absolute;
  bottom: calc(100% + 6px);
  right: 0;
  background: rgba(20, 22, 27, 0.96);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  min-width: 92px;
  z-index: 5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.vp__menu-item {
  background: transparent;
  border: none;
  color: #fff;
  padding: 6px 10px;
  font-size: 13px;
  text-align: right;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.vp__menu-item:hover {
  background: rgba(255, 255, 255, 0.12);
}

.vp__menu-item.is-active {
  color: var(--accent);
  font-weight: 700;
}

/* Native fullscreen target */
.vp:fullscreen,
.vp:-webkit-full-screen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  aspect-ratio: auto;
}

/* Manual offset input */
.offset-input {
  width: 60px;
  background: var(--panel-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.offset-input:focus {
  outline: none;
  border-color: var(--accent);
}

/* ---------- Forms ---------- */

.input-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.input,
.input-row input,
.input-row select {
  flex: 1;
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s;
}

.input:focus,
.input-row input:focus,
.input-row select:focus {
  border-color: var(--accent);
}

.input::placeholder,
.input-row input::placeholder {
  color: var(--text-faint);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-dim);
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.toggle-row:last-child {
  border-bottom: none;
}

.toggle-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-copy strong {
  font-size: 13px;
  font-weight: 500;
}

.toggle-copy span {
  font-size: 12px;
  color: var(--text-dim);
}

/* Switch toggle */
.switch {
  position: relative;
  /* <label> is inline by default, which ignores width/height and collapses
     the absolutely-positioned slider \u2014 the toggle looked broken in tables. */
  display: inline-block;
  vertical-align: middle;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch .slider {
  position: absolute;
  inset: 0;
  background: var(--border-strong);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s;
}

.switch .slider::before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  left: 3px;
  top: 3px;
  background: var(--text);
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}

.switch input:checked + .slider {
  background: var(--accent);
}

.switch input:checked + .slider::before {
  transform: translateX(18px);
  background: #0b0d10;
}

.switch input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---------- Modal ---------- */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-panel {
  width: 100%;
  max-width: 460px;
  max-height: 85vh;
  overflow-y: auto;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.modal-row-label {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.modal-part-links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
}

/* ---------- Notices ---------- */

.notice {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  border: 1px solid transparent;
}

.notice.error {
  background: var(--danger-soft);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.notice.success {
  background: var(--ok-soft);
  border-color: rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.notice.warn {
  background: var(--warn-soft);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}

.notice.info {
  background: var(--accent-soft);
  border-color: rgba(167, 139, 250, 0.3);
  color: #c4b5fd;
}

/* ---------- Empty state ---------- */

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-dim);
  font-size: 13px;
}

/* ---------- Replay page ---------- */

.replay-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.replay-grid.with-chat {
  grid-template-columns: minmax(0, 1fr) 360px;
}

.replay-video {
  width: 100%;
  display: block;
  background: #000;
  border-radius: var(--radius);
}

.replay-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: var(--text-dim);
}

.replay-meta strong {
  color: var(--text);
  font-weight: 500;
  margin-left: 4px;
}

/* Height is owned by .replay-stage__chat. Two competing sets of min/max
   heights (one here, one on the stage) used to fight and leave the chat column
   a different height from the video. */
.chat-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.chat-replay {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* One row instead of a heading plus an always-open settings block: those cost
   115px of a 595px panel before the first message became visible. */
.chat-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  flex: none;
}

.chat-bar__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.chat-bar__count {
  font-size: 11px;
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}

.chat-bar__offset {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  border-radius: 999px;
  padding: 1px 7px;
  font-variant-numeric: tabular-nums;
}

.chat-bar__gear {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex: none;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  transition: color 120ms ease, border-color 120ms ease, background 120ms ease;
}

.chat-bar__gear:hover {
  color: var(--text);
  border-color: var(--border);
}

.chat-bar__gear.is-active {
  color: var(--accent);
  background: var(--accent-soft);
  border-color: transparent;
}

.chat-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--panel-2);
  flex: none;
}

.chat-offset-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--text-dim);
}

.chat-offset-row button {
  background: var(--panel);
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 3px 8px;
  cursor: pointer;
}

.chat-offset-row button:hover {
  border-color: var(--border-strong);
  color: var(--text);
}

.chat-offset-label {
  margin-right: auto;
  font-weight: 500;
  color: var(--text);
}

.chat-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-dim);
}


.chat-list-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
}

.chat-jump-pill {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  background: var(--accent);
  color: #0b0d12;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: 999px;
  padding: 6px 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  white-space: nowrap;
  z-index: 2;
  transition: transform 120ms ease, opacity 120ms ease;
}

.chat-jump-pill:hover {
  transform: translateX(-50%) translateY(-1px);
  opacity: 0.95;
}

.chat-list {
  overflow-anchor: none;
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.5;
  /* Scrollbar styling comes from .thin-scroll \u2014 one source of truth. */
}

/* Thin themed scrollbar, applied through .thin-scroll so every scrollable
   chat surface looks the same instead of only the message list carrying it.
   The two engines are kept apart on purpose: Chromium ignores
   ::-webkit-scrollbar entirely once scrollbar-width is set, which silently
   forced the bar back to its own ~10px "thin" instead of these 6px. */
@supports (-moz-appearance: none) {
  .thin-scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--border-strong) transparent;
  }
}

.thin-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.thin-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.thin-scroll::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 3px;
}

.thin-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
}

.chat-message {
  word-wrap: break-word;
  word-break: break-word;
  /* The list clips overflow, so an unbroken 40-character word would have its
     tail cut off rather than wrapped. Force the break. */
  overflow-wrap: anywhere;
}

.chat-message.is-deleted {
  opacity: 0.45;
  text-decoration: line-through;
}

/* First-ever message of the author in this channel (Twitch first-msg),
   highlighted 7tv-style: green accent bar + soft tint + underlined text. */
.chat-message.is-first {
  box-shadow: inset 2px 0 0 #22c55e;
  background: rgba(34, 197, 94, 0.07);
  border-radius: 3px;
  padding-left: 4px;
}

.chat-message.is-first .chat-text {
  text-decoration: underline;
  text-decoration-color: rgba(34, 197, 94, 0.65);
  text-underline-offset: 2px;
}

/* The label that names that highlight, so a green row is not just "green". */
.chat-first {
  display: inline-block;
  vertical-align: baseline;
  margin-right: 4px;
  padding: 0 4px;
  border-radius: 3px;
  background: rgba(34, 197, 94, 0.18);
  color: #4ade80;
  font-size: 0.8em;
  font-weight: 700;
  white-space: nowrap;
}

/* Timeout / ban length chip on messages a moderation action wiped. The chip
   itself must stay readable, so the row's strikethrough is not inherited. */
.chat-ban {
  display: inline-block;
  margin-left: 6px;
  padding: 0 5px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 16px;
  white-space: nowrap;
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
  text-decoration: none;
}

.chat-ban--perma {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.chat-message.is-action .chat-text,
.chat-message.is-action .chat-separator {
  color: inherit;
  font-style: italic;
}

.chat-time {
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  margin-right: 6px;
}

.chat-author {
  font-weight: 600;
}

.chat-badges {
  display: inline-flex;
  gap: 2px;
  margin-right: 4px;
  vertical-align: 1px;
}

.chat-badge {
  display: inline-block;
  padding: 0 3px;
  border-radius: 2px;
  background: #53535f;
  color: #fff;
  font-size: 8px;
  font-weight: 800;
  line-height: 14px;
}

.chat-badge--moderator { background: #00ad96; }
.chat-badge--vip { background: #e91916; }
.chat-badge--broadcaster { background: #e91916; }

.chat-separator {
  color: var(--text-faint);
}

.chat-emote {
  height: 28px;
  vertical-align: middle;
  margin: 0 1px;
}

.chat-empty {
  color: var(--text-dim);
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

.chat-empty--error {
  color: var(--danger);
  font-style: normal;
}

/* ---------- Chat customization ----------
   Font and emote size are driven by two custom properties set on the root of
   the replay, so a slider change is one style recalculation instead of a
   re-render of every row. */

.chat-replay {
  --chat-font: 13px;
  --chat-emote: 28px;
}

.chat-list {
  font-size: var(--chat-font);
}

.chat-message {
  padding: 2px 0;
  line-height: 1.45;
}

.chat-tail {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-muted);
}

.chat-tail .button {
  padding: 4px 8px;
  font-size: 12px;
}

.chat-replay.is-compact .chat-message {
  padding: 0;
  line-height: 1.25;
}

.chat-replay.has-stripes .chat-message:nth-child(even) {
  background: rgba(255, 255, 255, 0.025);
}

.chat-replay.no-time .chat-time {
  display: none;
}

/* The author is a button now (it opens the history card) but must still read
   as plain inline text inside the message. */
.chat-author {
  font-weight: 600;
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
}

.chat-author:hover {
  text-decoration: underline;
}

/* Row highlights. Each is a left bar plus a wash, in the spirit of the
   existing first-message style, so several can be told apart at a glance. */
.chat-message.is-role {
  border-radius: 3px;
  padding-left: 4px;
}

.chat-message.is-role--broadcaster {
  box-shadow: inset 2px 0 0 #e91916;
  background: rgba(233, 25, 22, 0.08);
}

.chat-message.is-role--moderator {
  box-shadow: inset 2px 0 0 #00ad96;
  background: rgba(0, 173, 150, 0.08);
}

.chat-message.is-role--vip {
  box-shadow: inset 2px 0 0 #e005b9;
  background: rgba(224, 5, 185, 0.08);
}

.chat-message.is-role--subscriber {
  box-shadow: inset 2px 0 0 #8b5cf6;
  background: rgba(139, 92, 246, 0.07);
}

.chat-message.is-role--verified {
  box-shadow: inset 2px 0 0 #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.chat-message.is-role--staff {
  box-shadow: inset 2px 0 0 #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}

.chat-message.is-keyword {
  background: rgba(250, 204, 21, 0.14);
  box-shadow: inset 2px 0 0 #facc15;
  border-radius: 3px;
  padding-left: 4px;
}

.chat-message.is-active-user {
  background: rgba(96, 165, 250, 0.16);
  border-radius: 3px;
}

.chat-link {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
  overflow-wrap: anywhere;
}

.chat-gif {
  display: block;
  width: min(220px, 100%);
  margin: 4px 0;
}

.chat-gif img {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 220px;
  border-radius: 5px;
}

.chat-gif:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.chat-link:hover {
  text-decoration-thickness: 2px;
}

.chat-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 2px;
}

/* @mention \u2014 makes it obvious at a glance whether someone was tagged, and
   whether the tag was aimed at you (a name listed in the keywords). */
.chat-mention {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.16);
  border-radius: 3px;
  padding: 0 3px;
  font-weight: 600;
}

.chat-mention.is-self {
  color: #0b0d12;
  background: #facc15;
}

/* Clickable only where a handler was passed \u2014 role="button" marks exactly that. */
.chat-mention[role="button"] {
  cursor: pointer;
}

.chat-mention[role="button"]:hover {
  filter: brightness(1.15);
  text-decoration: underline;
}

.chat-badge--subscriber { background: #8b5cf6; }
.chat-badge--verified { background: #3b82f6; }
.chat-badge--staff { background: #f59e0b; color: #1f1300; }
.chat-badge--founder { background: #d97706; }
.chat-badge--og { background: #0ea5e9; }
.chat-badge--sub_gifter { background: #ec4899; }
.chat-badge--artist { background: #14b8a6; }
.chat-badge--turbo { background: #6366f1; }

/* ---------- Chat settings panel ---------- */

.chat-settings {
  max-height: 45vh;
  overflow-y: auto;
}

.chat-settings__section {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-faint);
  margin-top: 2px;
}

.chat-slider {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: var(--text-dim);
}

.chat-slider > span {
  display: flex;
  justify-content: space-between;
}

.chat-slider b {
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.chat-slider input[type="range"] {
  width: 100%;
  accent-color: var(--accent);
}

.chat-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chat-chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text-dim);
  cursor: pointer;
  transition: color 120ms ease, border-color 120ms ease, background 120ms ease;
}

.chat-chip:hover {
  border-color: var(--border-strong);
  color: var(--text);
}

.chat-chip.is-active {
  background: var(--accent-soft);
  border-color: transparent;
  color: var(--accent);
  font-weight: 600;
}

.chat-chip--broadcaster.is-active { background: rgba(233, 25, 22, 0.16); color: #f87171; }
.chat-chip--moderator.is-active { background: rgba(0, 173, 150, 0.16); color: #2dd4bf; }
.chat-chip--vip.is-active { background: rgba(224, 5, 185, 0.16); color: #f472b6; }
.chat-chip--subscriber.is-active { background: rgba(139, 92, 246, 0.16); color: #a78bfa; }
.chat-chip--verified.is-active { background: rgba(59, 130, 246, 0.16); color: #60a5fa; }
.chat-chip--staff.is-active { background: rgba(245, 158, 11, 0.16); color: #fbbf24; }
.chat-chip--first.is-active { background: rgba(34, 197, 94, 0.16); color: #4ade80; }

.chat-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: var(--text-dim);
}

.chat-field input {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  padding: 4px 7px;
  font-size: 12px;
}

.chat-field input:focus {
  outline: none;
  border-color: var(--accent);
}

.chat-reset {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 11px;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.chat-reset:hover {
  color: var(--text);
}

.chat-bar__filtered {
  font-size: 11px;
  color: var(--warn);
  font-variant-numeric: tabular-nums;
}

/* ---------- Broadcast metadata strip ----------
   Viewers / title / category at the point the recording has reached. Clipped
   to "so far" by default so the category bar does not announce what the
   streamer switches to later. */

.stream-meta {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 12px 8px;
  border-bottom: 1px solid var(--border);
  background: var(--panel-2);
}

.stream-meta__row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.stream-meta__viewers {
  color: var(--live);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.stream-meta__peak {
  color: var(--text-faint);
  font-variant-numeric: tabular-nums;
}

.stream-meta__reveal {
  margin-left: auto;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  padding: 2px 5px;
}

.stream-meta__reveal:hover {
  border-color: var(--border);
}

.stream-meta__reveal.is-active {
  background: var(--accent-soft);
}

.stream-meta__now {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.stream-meta__category {
  flex: none;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-dim);
  border: 1px solid;
  border-radius: 999px;
  padding: 0 6px;
  line-height: 15px;
  white-space: nowrap;
}

.stream-meta__title {
  font-size: 11px;
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stream-meta__bar {
  position: relative;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  overflow: hidden;
}

.stream-meta__segment {
  position: absolute;
  top: 0;
  bottom: 0;
}

/* The part not played yet: a flat neutral block, deliberately carrying no
   information about which categories are still to come. */
.stream-meta__unknown {
  position: absolute;
  top: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    var(--border) 0 3px,
    var(--border-strong) 3px 6px
  );
  opacity: 0.6;
}

/* ---------- Predictions and polls ----------
   Sits between the metadata strip and the messages, where Twitch puts its own
   card: above the chat, pushing it down, rather than floating over it. */
.stream-events {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 8px 6px;
}

.stream-event {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-2, rgba(255, 255, 255, 0.02));
  padding: 7px 8px;
  font-size: 12px;
}

.stream-event--locked {
  border-color: var(--warn);
}

.stream-event--ended {
  opacity: 0.9;
}

.stream-event__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  margin-bottom: 6px;
}

.stream-event__head:focus-visible {
  outline: 2px solid var(--accent, #7c5cff);
  outline-offset: 3px;
  border-radius: 3px;
}

.stream-event__chevron {
  font-size: 16px;
  color: var(--muted);
}

.stream-event.is-collapsed .stream-event__head {
  margin-bottom: 0;
}

.stream-event.is-collapsed .stream-event__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stream-event.is-collapsed .stream-event__status {
  display: none;
}

.stream-event__kind {
  flex: none;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--accent, #7c5cff);
  color: #fff;
}

.stream-event__kind--poll {
  background: #14b8a6;
}

.stream-event__title {
  flex: 1 1 auto;
  font-weight: 600;
  /* Titles are free text and routinely long; wrap rather than scroll the
     panel sideways. */
  overflow-wrap: anywhere;
}

.stream-event__status {
  grid-column: 1 / -1;
  flex: none;
  font-size: 10px;
  color: var(--muted);
  white-space: nowrap;
}

.stream-event--locked .stream-event__status {
  color: var(--warn);
}

.stream-event__outcomes {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stream-event__outcome {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 6px;
  border-radius: 4px;
  background: var(--border);
  overflow: hidden;
}

/* The bar itself, behind the text \u2014 the numbers must stay readable whatever
   the fill width is. */
.stream-event__fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  opacity: 0.35;
  transition: width 0.4s ease;
}

.stream-event__outcome.is-won .stream-event__fill {
  opacity: 0.55;
}

.stream-event__outcome.is-lost {
  opacity: 0.45;
}

.stream-event__label {
  position: relative;
  flex: 1 1 auto;
  overflow-wrap: anywhere;
}

.stream-event__crown {
  margin-right: 4px;
}

.stream-event__numbers {
  position: relative;
  flex: none;
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}

.stream-event__share {
  font-weight: 600;
}

.stream-event__count,
.stream-event__ratio {
  font-size: 10px;
  color: var(--muted);
}

.stream-event__foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  font-size: 10px;
  color: var(--muted);
}

/* The "bet on X" chip before a nick. Capped in width: an outcome title can be
   a whole sentence, and it must not push the message text off the row. */
.chat-bet {
  display: inline-block;
  max-width: 8em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: baseline;
  margin-right: 4px;
  padding: 0 4px;
  border-radius: 3px;
  font-size: 0.8em;
  font-weight: 600;
  color: #fff;
}

/* ---------- Per-user history card ----------
   Docked inside the chat panel rather than beside it: the column is ~340px on
   desktop and narrower on mobile, so there is no room for a second one. */

.chat-user-card {
  position: fixed;
  max-height: min(60vh, 460px);
  display: flex;
  flex-direction: column;
  background: var(--panel-2);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55);
  /* The theater stage is at 100; user history must stay above the video. */
  z-index: 120;
  overflow: hidden;
}

.chat-user-card__head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border-bottom: 1px solid var(--border);
  background: var(--panel);
  cursor: move;
  touch-action: none;
  user-select: none;
}

.chat-user-card__grip {
  color: var(--text-faint);
  font-size: 12px;
  line-height: 1;
  letter-spacing: -1px;
}

.chat-user-card__meta {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 7px 9px;
  border-bottom: 1px solid var(--border);
}

.chat-user-card__search {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  padding: 4px 7px;
  font-size: 12px;
  width: 100%;
}

.chat-user-card__search:focus {
  outline: none;
  border-color: var(--accent);
}

.chat-user-card__name {
  font-weight: 700;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-user-card__close {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--text-faint);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 2px 4px;
}

.chat-user-card__close:hover {
  color: var(--text);
}

.chat-user-card__roles {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.chat-user-card__stats {
  font-size: 11px;
  color: var(--text-dim);
}

.chat-user-card__stats b {
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.chat-user-card__hint {
  font-size: 10px;
  color: var(--text-faint);
  font-style: italic;
}

.chat-user-card__list {
  overflow-y: auto;
  /* Never sideways: chat is full of unbroken strings like "\u042B\u0412\u0417\u0410\u0425\u042B\u0412\u0417\u0410\u0425\u042B\u0412\u0410",
     and letting them widen the box turns every row into a scroll. */
  overflow-x: hidden;
  padding: 4px 6px 6px;
  font-size: 12px;
}

.chat-user-card__row {
  display: block;
  width: 100%;
  max-width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: var(--text);
  padding: 3px 4px;
  border-radius: 3px;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  line-height: 1.35;
  white-space: normal;
  /* "anywhere" and not "break-word": a single 40-character word with no
     spaces has to break mid-word, which break-word alone will not do here. */
  overflow-wrap: anywhere;
  word-break: break-word;
}

.chat-user-card__row .chat-text {
  display: inline;
}

.chat-user-card__row .chat-emote {
  max-width: 100%;
}

.chat-user-card__row:hover:not(:disabled) {
  background: var(--accent-soft);
}

.chat-user-card__row:disabled {
  cursor: default;
  opacity: 0.75;
}

.chat-user-card__row.is-deleted {
  opacity: 0.5;
  text-decoration: line-through;
}

/* ---------- Settings page ---------- */

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.settings-group-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

/* Tab bar of a panel: sits between the panel edge and its body. */
.tab-bar {
  display: flex;
  gap: 4px;
  padding: 8px 12px 0;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  /* Same trap as .table-wrap: .tab-btn carries margin-bottom -1px to sit on
     the bar's border, and that alone was enough to make the browser draw a
     vertical scrollbar across the tab row. */
  overflow-y: hidden;
  /* Few tabs, and they wrap on mobile \u2014 a horizontal bar under them is noise. */
  scrollbar-width: none;
}

.tab-bar::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  border: none;
  /* Overlaps the bar's own 1px border, so the active underline replaces it. */
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: none;
  color: var(--text-dim);
  padding: 8px 12px 10px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;
}

.tab-btn:hover {
  color: var(--text);
}

.tab-btn.active {
  border-bottom-color: var(--accent);
  color: var(--text);
}

/* Number input with a trailing unit ("30 \u0434\u043D.") inside an .input-row. */
.input-suffix {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}

.input-suffix input {
  width: 90px;
  flex: 0 0 auto;
}

.input-suffix span {
  font-size: 12px;
  color: var(--text-dim);
}

/* ---------- Tooltips (basic) ---------- */

[title] {
  cursor: help;
}

.icon-btn[title] {
  cursor: pointer;
}

/* ---------- Responsive ---------- */

/* Mobile shell: the sidebar becomes a sticky top bar with a burger menu;
   the nav groups and footer blocks drop down only while the menu is open. */
@media (max-width: 900px) {
  .app-frame {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: sticky;
    top: 0;
    z-index: 60;
    height: auto;
    gap: 0;
    padding: 10px 14px;
    background: var(--bg);
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .brand-block {
    padding: 0;
    border-bottom: none;
  }

  .menu-toggle {
    display: inline-flex;
  }

  .sidebar .nav-list,
  .sidebar .sidebar-footer {
    display: none;
  }

  .sidebar--open .nav-list {
    display: flex;
    padding-top: 12px;
  }

  .sidebar--open .sidebar-footer {
    display: flex;
    margin-top: 0;
    padding-top: 12px;
  }

  .content-area {
    padding: 14px 12px 32px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .table th,
  .table td {
    padding: 8px;
  }

  .replay-grid.with-chat {
    grid-template-columns: 1fr;
  }
}

/* =================================================================
 * Auth + admin shell additions (login, account, users, access)
 * Public landing + watch page styles.
 * ================================================================= */

/* ---------- Sidebar user block ---------- */

.user-block {
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-block-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ---------- Form helpers ---------- */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-items: end;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.form-row-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
}

.form-label {
  font-size: 12px;
  color: var(--text-dim);
}

.form-row input,
.form-row select,
.form-row textarea {
  background: var(--panel-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  outline: none;
  transition: border-color 120ms ease;
}

.form-row input:focus,
.form-row select:focus,
.form-row textarea:focus {
  border-color: var(--accent);
}

@media (max-width: 720px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* ---------- Auth (login) page ---------- */

.auth-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: var(--bg);
}

.auth-card {
  width: 100%;
  max-width: 380px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.auth-brand {
  margin-bottom: 4px;
}

.auth-card .form-row input {
  padding: 10px 12px;
}

.auth-back {
  text-align: center;
  margin-top: 4px;
  color: var(--text-faint);
  font-size: 12px;
}

.auth-back:hover {
  color: var(--text);
}

/* ---------- Public site (landing + watch) ---------- */

.public-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 24px 80px;
}

@media (max-width: 720px) {
  .public-shell {
    padding: 14px 12px 60px;
  }
}

/* The watch page hosts a screen-fit stage: symmetric slim padding (the stage
   height is computed from --shell-pad) and the full window width, because the
   1280px cap wasted the player's room on wide screens. */
.public-shell--watch {
  --shell-pad: 16px;
  max-width: none;
  padding: var(--shell-pad);
}

@media (max-width: 720px) {
  .public-shell--watch {
    --shell-pad: 10px;
  }
}

.public-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.public-brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.public-brand .brand-title {
  font-size: 20px;
}

.public-tagline {
  color: var(--text-dim);
  margin: 4px 0 0;
}

.public-header-actions {
  display: flex;
  gap: 8px;
}

.public-search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}

.public-search-input {
  flex: 1;
  background: var(--panel-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  transition: border-color 120ms ease;
}

.public-search-input:focus {
  border-color: var(--accent);
}

/* Card grid for stream recordings */

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.stream-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 120ms ease, transform 120ms ease;
  color: inherit;
}

.stream-card:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}

.stream-card-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--panel-2);
  overflow: hidden;
}

.stream-card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.stream-card-thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: var(--text-faint);
  background: linear-gradient(135deg, var(--panel-2), var(--panel));
}

.stream-card-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-variant-numeric: tabular-nums;
}

.stream-card-body {
  padding: 12px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stream-card-channel {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-dim);
  font-size: 12px;
}

.stream-card-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--panel-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-faint);
  font-weight: 600;
  font-size: 11px;
}

.stream-card-avatar.fallback {
  border: 1px solid var(--border);
}

.stream-card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stream-card-meta {
  color: var(--text-faint);
  font-size: 12px;
}

/* Watch page */

.watch-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.watch-player {
  position: relative;
  background: #000;
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.watch-player > * {
  width: 100%;
  height: 100%;
}

.watch-meta {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.watch-channel-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.watch-channel-row .stream-card-avatar {
  width: 36px;
  height: 36px;
  font-size: 14px;
}

.meta-list {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 12px;
  margin: 0;
  font-size: 13px;
}

.meta-list dt {
  color: var(--text-faint);
}

.meta-list dd {
  margin: 0;
  color: var(--text);
}

@media (max-width: 900px) {
  .watch-layout {
    grid-template-columns: 1fr;
  }
}

/* ---------- Access page (role editor) ---------- */

.role-name-input {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
}

.role-name-input:hover,
.role-name-input:focus {
  border-color: var(--border);
  background: var(--panel-2);
  outline: none;
}

.role-desc-input {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-dim);
  font-size: 13px;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
}

.role-desc-input:hover,
.role-desc-input:focus {
  border-color: var(--border);
  background: var(--panel-2);
  outline: none;
  color: var(--text);
}

.permissions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 12px;
}

.perm-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 10px;
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 120ms ease;
}

.perm-row:hover {
  border-color: var(--accent);
}

.perm-row input[type="checkbox"] {
  margin-top: 3px;
  accent-color: var(--accent);
}

/* ---------- Archive cards ---------- */
/* The archive list is a gallery, not a spreadsheet: a cover frame identifies a
   recording far faster than a row of timestamps. Audio-only captures get their
   own block and their own cover treatment \u2014 they are a different artefact
   (a track that overlays a Twitch VOD), not a recording without a picture. */

.archive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  padding: 16px;
}

.archive-grid.audio {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.archive-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--panel-2);
  overflow: hidden;
  transition: border-color 120ms ease, transform 120ms ease;
}

.archive-card:hover {
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

/* The card itself is the link to the recording: an overlay over cover, title
   and meta. The footer with the buttons is lifted above it. */
.archive-card-hit {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
}

.archive-card-hit:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.archive-cover {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #1b2030, #11141a);
  overflow: hidden;
}

.archive-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.archive-card.audio .archive-cover {
  aspect-ratio: 3 / 1;
  background: linear-gradient(135deg, var(--accent-soft), rgba(34, 197, 94, 0.10));
}

/* Audio has no frame to show: a waveform-ish glyph over the channel avatar
   reads as "sound" at a glance and keeps the block visually distinct. */
.archive-cover-audio {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  padding: 0 16px;
}

.archive-cover-audio .avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-strong);
  flex: none;
}

.archive-cover-audio .glyph {
  font-size: 22px;
  line-height: 1;
  flex: none;
}

.archive-cover-audio .bars {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 28px;
  flex: 1;
  overflow: hidden;
}

.archive-cover-audio .bars i {
  display: block;
  width: 3px;
  border-radius: 2px;
  background: var(--accent);
  opacity: 0.55;
}

.archive-cover-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.archive-cover-source {
  position: absolute;
  top: 6px;
  left: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.6);
  color: var(--text-dim);
  font-size: 11px;
}

.archive-cover-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-faint);
  font-size: 12px;
}

.archive-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px 12px;
  flex: 1;
}

.archive-card-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.archive-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  font-size: 11px;
  color: var(--text-dim);
}

.archive-card-foot {
  /* Above .archive-card-hit: these buttons do their own thing, not "open". */
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.archive-card-foot .action-row {
  gap: 4px;
}

/* Account page: identity and session controls. Two label-and-control rows,
   the same shape as the rest of the settings forms. */
.account-session-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.account-session-row + .account-session-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.account-identity {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.account-session-label {
  color: var(--text-dim);
  font-size: 12px;
}

.account-session .lang-row {
  flex: 0 0 auto;
  width: 120px;
}

/* ---------------------------------------------------------------------------
   Shared page furniture.

   These exist because the same handful of shapes \u2014 a titled panel, a row of
   filters, a numeric table column \u2014 were being rebuilt inline on every page
   with slightly different numbers. That is what made the panel look crooked:
   .page-shell already puts 18px between sections, so a panel that also carried
   style={{ marginTop: 16 }} sat 34px from its neighbour while the one next to
   it sat at 18px.
   ------------------------------------------------------------------------- */

.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text);
}

.section-sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-dim);
}

/* Title on the left, actions on the right, baselines aligned. */
.panel-head {
  gap: 12px;
  flex-wrap: wrap;
}

.panel-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* A row of controls above a table: search, toggles, counters. Wraps instead of
   overflowing, and every child sits on the same baseline. */
.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
}

.filter-row .input,
.filter-row input[type="search"] {
  flex: 1 1 200px;
  min-width: 0;
}

.filter-spacer {
  flex: 1 1 auto;
}

.filter-note {
  font-size: 12px;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
}

/* Numbers line up on their digits or they are noise. */
.table .col-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.table th.col-num {
  text-align: right;
}

/* Proportion inside a table cell \u2014 how much of the disk one directory holds.
   Same hairline as the sidebar meter so "how full" reads identically wherever
   it appears. */
.share {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.share-bar {
  width: 72px;
  height: 3px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
  flex-shrink: 0;
}

.share-bar-fill {
  height: 100%;
  background: var(--text-faint);
}

.share-value {
  font-variant-numeric: tabular-nums;
  color: var(--text-dim);
  font-size: 12px;
  min-width: 38px;
  text-align: right;
}

/* Dense label/value pairs for the detail blocks that used to be prose. */
.kv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 10px 20px;
}

.kv {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
  min-width: 0;
}

.kv-key {
  color: var(--text-dim);
  font-size: 12px;
  white-space: nowrap;
}

.kv-value {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Pagination sits inside the panel it belongs to, not floating after it. */
.panel-foot {
  padding: 10px 16px;
  border-top: 1px solid var(--border);
}

.panel-foot .pagination {
  margin: 0;
}

/* Small status word next to a row. Replaces the ad-hoc inline colours that
   made the same state look different on every page. */
.tag {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 999px;
  border: 1px solid var(--border-strong);
  background: var(--panel-2);
  color: var(--text-dim);
  font-size: 11px;
  line-height: 17px;
  white-space: nowrap;
}

.tag.warn {
  border-color: transparent;
  background: var(--warn-soft);
  color: var(--warn);
}

.tag.danger {
  border-color: transparent;
  background: var(--danger-soft);
  color: var(--danger);
}

.tag.ok {
  border-color: transparent;
  background: var(--ok-soft);
  color: var(--ok);
}

.checkbox-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-dim);
  white-space: nowrap;
}

/* Row count next to a tab label: tells you where the data is before you click. */
.tab-count {
  display: inline-block;
  margin-left: 6px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--panel-2);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  font-variant-numeric: tabular-nums;
  vertical-align: 1px;
}

.tab-btn.active .tab-count {
  border-color: var(--border-strong);
  color: var(--text);
}

/* Only for a tab hiding something that needs attention \u2014 orphans, losses. */
.tab-count.alert {
  border-color: transparent;
  background: var(--danger-soft);
  color: var(--danger);
}

.muted {
  color: var(--text-faint);
}

/* ---------------------------------------------------------------------------
   Scrollbars.

   The default ones are drawn by the OS: light, chunky, with arrow buttons \u2014
   they read as a Windows dialog dropped into a dark panel. These match the
   surface they sit on and take a third of the width.
   ------------------------------------------------------------------------- */

* {
  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
}

*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 999px;
}

*::-webkit-scrollbar-thumb:hover {
  background: var(--text-faint);
}

/* Chromium draws stepper arrows unless they are explicitly zero-sized. */
*::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}

*::-webkit-scrollbar-corner {
  background: transparent;
}

/* ---------- Loading skeletons ---------- */

/* The shimmer is one moving highlight over a flat block. \`background-position\`
   animates on the compositor, so a screen full of these costs nothing \u2014 a
   version built on animating \`opacity\` per element made the card grid drop
   frames on the phone. */
.skeleton {
  display: block;
  background-color: var(--panel-2);
  background-image: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 45%,
    rgba(255, 255, 255, 0.05) 55%,
    transparent 100%
  );
  background-size: 220% 100%;
  background-repeat: no-repeat;
  border-radius: var(--radius-sm);
  animation: skeleton-sweep 1.5s ease-in-out infinite;
}

.skeleton--text {
  display: block;
  margin: 3px 0;
}

/* Fills the 16:9 slot the player will take, so nothing shifts when it mounts. */
.skeleton--stage {
  aspect-ratio: 16 / 9;
  height: auto;
}

@keyframes skeleton-sweep {
  from {
    background-position: 160% 0;
  }
  to {
    background-position: -60% 0;
  }
}

/* Respect the system setting: a shimmer is decoration, and for people who
   asked for less motion a plain block says the same thing. */
@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}

.stream-card--skeleton {
  pointer-events: none;
}

.stream-card--skeleton:hover {
  border-color: var(--border);
  transform: none;
}

.chat-message--skeleton {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
}

.skeleton-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.skeleton-table__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 16px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}

.skeleton-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.skeleton-stats__item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
}

/* Refetch in flight (next page, new search) \u2014 the old cards stay put and fade
   instead of being replaced by skeletons. */
.card-grid.is-refreshing {
  opacity: 0.5;
  transition: opacity 150ms ease;
  pointer-events: none;
}

/* ---------- Spoiler-free mode ---------- */

/* The fog: a fixed strip at the right end of the timeline standing for
   everything not yet watched. Not a remainder \u2014 its width is constant, so it
   cannot be read as "this much is left". */
.vp__progress-fog {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  border-radius: 2px;
  pointer-events: none;
  transition: height 0.15s;
  background: repeating-linear-gradient(
      115deg,
      rgba(255, 255, 255, 0.16) 0 3px,
      rgba(255, 255, 255, 0.05) 3px 7px
    ),
    linear-gradient(to right, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.06));
  /* Softens into the clear zone instead of butting against it with a line
     that would itself mark "you are exactly here". */
  mask-image: linear-gradient(to right, transparent, #000 22%, #000 100%);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 22%, #000 100%);
}

.vp__progress:hover .vp__progress-fog {
  height: 6px;
}

/* Hovering the fog: no frame, just how far ahead the jump would be. */
.vp__scrub-preview--fog .vp__scrub-time {
  background: rgba(20, 24, 32, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
}

.spoiler-toggle.is-active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

/* A value the mode is deliberately not showing. Keeps the row from collapsing
   and reads as "withheld" rather than "missing". */
.spoiler-hidden {
  color: var(--text-faint);
  font-style: italic;
}

/* The way out of the panel, at the foot of the sidebar. Bordered rather than
   flush so it reads as leaving rather than as one more section. */
.nav-link--out {
  border: 1px solid var(--border);
  justify-content: flex-start;
}

.nav-link--out span {
  flex: 1;
}

.nav-link--out:hover {
  border-color: var(--border-strong);
}

/* Observe the actual content height as late emotes load. */
.chat-list-content { display: flex; flex-direction: column; gap: 2px; flex: none; }
.chat-user-card__seek { background: none; border: 0; padding: 0; color: inherit; font: inherit; cursor: pointer; }
.chat-user-card__seek:disabled { cursor: default; opacity: .65; }
.chat-user-card__more { display: block; margin: 8px auto; }

/* Recording copies remain visible independently from the selected source. */
.recording-storage { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.storage-copy { display: inline-flex; align-items: center; gap: 5px; padding: 4px 7px; border: 1px solid var(--border); border-radius: 6px; font-size: 11px; line-height: 1.4; color: var(--text-faint); }
.storage-copy__status { opacity: .9; }
.storage-copy--saved { color: #57c99d; border-color: #57c99d40; background: #57c99d09; }
.storage-copy--saving, .storage-copy--partial { color: #e2b963; border-color: #e2b96340; }
.storage-copy--error, .storage-copy--unavailable { color: #e88f94; border-color: #e88f9440; }
.playback-source { display: flex; align-items: center; gap: 6px; min-width: 0; color: #eee; font-size: 11px; }
.playback-source select { color: #eee; background: #24252b; border: 1px solid #ffffff35; border-radius: 6px; padding: 5px 6px; max-width: 160px; font: inherit; cursor: pointer; }
.playback-source select:focus-visible { outline: 2px solid #9782ff; outline-offset: 2px; }
.playback-source option:disabled { color: #999; }
@media (max-width: 700px) { .playback-source > span { display: none; } .playback-source select { max-width: 110px; padding: 4px; } }

.replay-source-toolbar { display: flex; align-items: center; flex: 0 0 auto; min-width: 0; padding: 8px 12px; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; }
.replay-source-toolbar .playback-source { flex-wrap: wrap; font-size: 13px; gap: 8px; }
.replay-source-toolbar .playback-source > span { display: inline; }
.replay-source-toolbar .playback-source select { max-width: 100%; min-height: 36px; padding: 6px 10px; }
.replay-stage--theater .replay-source-toolbar,
.replay-stage.has-chat .replay-source-toolbar { display: none; }
.replay-stage--theater .replay-stage__player { flex: 1; height: auto; }

.replay-stage__header--sources { flex-wrap: wrap; gap: 8px 12px; }
.replay-stage__header--sources > .recording-storage { flex-basis: 100%; margin-top: 0; }
.replay-stage__header--sources > .watch-channel-row { flex: 1; min-width: 0; }
.replay-stage__header--sources > .watch-channel-row > div { min-width: 0; }
.replay-stage__header--sources .page-title { font-size: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.replay-stage__header--sources > .replay-meta { flex-basis: 100%; }

.broadcast-summary { flex-basis: 100%; color: var(--text-dim); font-size: 12px; }
.broadcast-summary summary { cursor: pointer; color: var(--text); padding: 4px 0; }
.broadcast-summary ol { padding-left: 24px; margin: 6px 0; }
.broadcast-summary li { margin: 5px 0; }
.broadcast-summary p { margin: 5px 0; }
.broadcast-card-note { color: var(--text-dim); font-size: 11px; margin-top: 6px; }

:host { all: initial; display: block; height: 100%; font: 14px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #e6e9ef; }
.tsr-shared-chat { height: 100%; min-height: 0; display: flex; flex-direction: column; background: var(--panel); }
.tsr-shared-chat > .chat-replay { flex: 1; height: 100%; min-height: 0; border-radius: 0; border: 0; }
`;let o=document.createElement("div");o.className="tsr-shared-chat",n.append(r,o);let l=(0,mp.createRoot)(o),i=s=>l.render((0,Yt.jsx)(Rg,{options:s},s.sessions.map(u=>u.id).join(",")+":"+s.vodStartMs));return i(t),{update:i,unmount:()=>l.unmount()}}return Ip(Ag);})();
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.min.js:
  (**
   * @license React
   * scheduler.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.min.js:
  (**
   * @license React
   * react-dom.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
