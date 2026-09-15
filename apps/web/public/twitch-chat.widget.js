/* tsr-chat-widget */
"use strict";var TSRChatWidget=(()=>{var Ap=Object.create;var ar=Object.defineProperty;var zp=Object.getOwnPropertyDescriptor;var Lp=Object.getOwnPropertyNames;var Ip=Object.getPrototypeOf,$p=Object.prototype.hasOwnProperty;var Op=(e,t,n)=>t in e?ar(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var dt=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),Bp=(e,t)=>{for(var n in t)ar(e,n,{get:t[n],enumerable:!0})},Ou=(e,t,n,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of Lp(t))!$p.call(e,o)&&o!==n&&ar(e,o,{get:()=>t[o],enumerable:!(r=zp(t,o))||r.enumerable});return e};var B=(e,t,n)=>(n=e!=null?Ap(Ip(e)):{},Ou(t||!e||!e.__esModule?ar(n,"default",{value:e,enumerable:!0}):n,e)),jp=e=>Ou(ar({},"__esModule",{value:!0}),e);var se=(e,t,n)=>Op(e,typeof t!="symbol"?t+"":t,n);var Zu=dt(z=>{"use strict";var cr=Symbol.for("react.element"),Up=Symbol.for("react.portal"),Hp=Symbol.for("react.fragment"),bp=Symbol.for("react.strict_mode"),Vp=Symbol.for("react.profiler"),Wp=Symbol.for("react.provider"),Qp=Symbol.for("react.context"),Kp=Symbol.for("react.forward_ref"),Gp=Symbol.for("react.suspense"),Yp=Symbol.for("react.memo"),Zp=Symbol.for("react.lazy"),Bu=Symbol.iterator;function Xp(e){return e===null||typeof e!="object"?null:(e=Bu&&e[Bu]||e["@@iterator"],typeof e=="function"?e:null)}var Hu={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},bu=Object.assign,Vu={};function kn(e,t,n){this.props=e,this.context=t,this.refs=Vu,this.updater=n||Hu}kn.prototype.isReactComponent={};kn.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};kn.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Wu(){}Wu.prototype=kn.prototype;function li(e,t,n){this.props=e,this.context=t,this.refs=Vu,this.updater=n||Hu}var ii=li.prototype=new Wu;ii.constructor=li;bu(ii,kn.prototype);ii.isPureReactComponent=!0;var ju=Array.isArray,Qu=Object.prototype.hasOwnProperty,si={current:null},Ku={key:!0,ref:!0,__self:!0,__source:!0};function Gu(e,t,n){var r,o={},l=null,i=null;if(t!=null)for(r in t.ref!==void 0&&(i=t.ref),t.key!==void 0&&(l=""+t.key),t)Qu.call(t,r)&&!Ku.hasOwnProperty(r)&&(o[r]=t[r]);var s=arguments.length-2;if(s===1)o.children=n;else if(1<s){for(var u=Array(s),c=0;c<s;c++)u[c]=arguments[c+2];o.children=u}if(e&&e.defaultProps)for(r in s=e.defaultProps,s)o[r]===void 0&&(o[r]=s[r]);return{$$typeof:cr,type:e,key:l,ref:i,props:o,_owner:si.current}}function Jp(e,t){return{$$typeof:cr,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function ui(e){return typeof e=="object"&&e!==null&&e.$$typeof===cr}function qp(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var Uu=/\/+/g;function oi(e,t){return typeof e=="object"&&e!==null&&e.key!=null?qp(""+e.key):t.toString(36)}function mo(e,t,n,r,o){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var i=!1;if(e===null)i=!0;else switch(l){case"string":case"number":i=!0;break;case"object":switch(e.$$typeof){case cr:case Up:i=!0}}if(i)return i=e,o=o(i),e=r===""?"."+oi(i,0):r,ju(o)?(n="",e!=null&&(n=e.replace(Uu,"$&/")+"/"),mo(o,t,n,"",function(c){return c})):o!=null&&(ui(o)&&(o=Jp(o,n+(!o.key||i&&i.key===o.key?"":(""+o.key).replace(Uu,"$&/")+"/")+e)),t.push(o)),1;if(i=0,r=r===""?".":r+":",ju(e))for(var s=0;s<e.length;s++){l=e[s];var u=r+oi(l,s);i+=mo(l,t,n,u,o)}else if(u=Xp(e),typeof u=="function")for(e=u.call(e),s=0;!(l=e.next()).done;)l=l.value,u=r+oi(l,s++),i+=mo(l,t,n,u,o);else if(l==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return i}function ho(e,t,n){if(e==null)return e;var r=[],o=0;return mo(e,r,"","",function(l){return t.call(n,l,o++)}),r}function eh(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var ye={current:null},go={transition:null},th={ReactCurrentDispatcher:ye,ReactCurrentBatchConfig:go,ReactCurrentOwner:si};function Yu(){throw Error("act(...) is not supported in production builds of React.")}z.Children={map:ho,forEach:function(e,t,n){ho(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return ho(e,function(){t++}),t},toArray:function(e){return ho(e,function(t){return t})||[]},only:function(e){if(!ui(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};z.Component=kn;z.Fragment=Hp;z.Profiler=Vp;z.PureComponent=li;z.StrictMode=bp;z.Suspense=Gp;z.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=th;z.act=Yu;z.cloneElement=function(e,t,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=bu({},e.props),o=e.key,l=e.ref,i=e._owner;if(t!=null){if(t.ref!==void 0&&(l=t.ref,i=si.current),t.key!==void 0&&(o=""+t.key),e.type&&e.type.defaultProps)var s=e.type.defaultProps;for(u in t)Qu.call(t,u)&&!Ku.hasOwnProperty(u)&&(r[u]=t[u]===void 0&&s!==void 0?s[u]:t[u])}var u=arguments.length-2;if(u===1)r.children=n;else if(1<u){s=Array(u);for(var c=0;c<u;c++)s[c]=arguments[c+2];r.children=s}return{$$typeof:cr,type:e.type,key:o,ref:l,props:r,_owner:i}};z.createContext=function(e){return e={$$typeof:Qp,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:Wp,_context:e},e.Consumer=e};z.createElement=Gu;z.createFactory=function(e){var t=Gu.bind(null,e);return t.type=e,t};z.createRef=function(){return{current:null}};z.forwardRef=function(e){return{$$typeof:Kp,render:e}};z.isValidElement=ui;z.lazy=function(e){return{$$typeof:Zp,_payload:{_status:-1,_result:e},_init:eh}};z.memo=function(e,t){return{$$typeof:Yp,type:e,compare:t===void 0?null:t}};z.startTransition=function(e){var t=go.transition;go.transition={};try{e()}finally{go.transition=t}};z.unstable_act=Yu;z.useCallback=function(e,t){return ye.current.useCallback(e,t)};z.useContext=function(e){return ye.current.useContext(e)};z.useDebugValue=function(){};z.useDeferredValue=function(e){return ye.current.useDeferredValue(e)};z.useEffect=function(e,t){return ye.current.useEffect(e,t)};z.useId=function(){return ye.current.useId()};z.useImperativeHandle=function(e,t,n){return ye.current.useImperativeHandle(e,t,n)};z.useInsertionEffect=function(e,t){return ye.current.useInsertionEffect(e,t)};z.useLayoutEffect=function(e,t){return ye.current.useLayoutEffect(e,t)};z.useMemo=function(e,t){return ye.current.useMemo(e,t)};z.useReducer=function(e,t,n){return ye.current.useReducer(e,t,n)};z.useRef=function(e){return ye.current.useRef(e)};z.useState=function(e){return ye.current.useState(e)};z.useSyncExternalStore=function(e,t,n){return ye.current.useSyncExternalStore(e,t,n)};z.useTransition=function(){return ye.current.useTransition()};z.version="18.3.1"});var Ge=dt((jg,Xu)=>{"use strict";Xu.exports=Zu()});var sa=dt(U=>{"use strict";function fi(e,t){var n=e.length;e.push(t);e:for(;0<n;){var r=n-1>>>1,o=e[r];if(0<vo(o,t))e[r]=t,e[n]=o,n=r;else break e}}function Ye(e){return e.length===0?null:e[0]}function wo(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;e:for(var r=0,o=e.length,l=o>>>1;r<l;){var i=2*(r+1)-1,s=e[i],u=i+1,c=e[u];if(0>vo(s,n))u<o&&0>vo(c,s)?(e[r]=c,e[u]=n,r=u):(e[r]=s,e[i]=n,r=i);else if(u<o&&0>vo(c,n))e[r]=c,e[u]=n,r=u;else break e}}return t}function vo(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}typeof performance=="object"&&typeof performance.now=="function"?(Ju=performance,U.unstable_now=function(){return Ju.now()}):(ai=Date,qu=ai.now(),U.unstable_now=function(){return ai.now()-qu});var Ju,ai,qu,ot=[],Pt=[],nh=1,Ue=null,pe=3,Co=!1,qt=!1,fr=!1,na=typeof setTimeout=="function"?setTimeout:null,ra=typeof clearTimeout=="function"?clearTimeout:null,ea=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function pi(e){for(var t=Ye(Pt);t!==null;){if(t.callback===null)wo(Pt);else if(t.startTime<=e)wo(Pt),t.sortIndex=t.expirationTime,fi(ot,t);else break;t=Ye(Pt)}}function hi(e){if(fr=!1,pi(e),!qt)if(Ye(ot)!==null)qt=!0,gi(mi);else{var t=Ye(Pt);t!==null&&vi(hi,t.startTime-e)}}function mi(e,t){qt=!1,fr&&(fr=!1,ra(pr),pr=-1),Co=!0;var n=pe;try{for(pi(t),Ue=Ye(ot);Ue!==null&&(!(Ue.expirationTime>t)||e&&!ia());){var r=Ue.callback;if(typeof r=="function"){Ue.callback=null,pe=Ue.priorityLevel;var o=r(Ue.expirationTime<=t);t=U.unstable_now(),typeof o=="function"?Ue.callback=o:Ue===Ye(ot)&&wo(ot),pi(t)}else wo(ot);Ue=Ye(ot)}if(Ue!==null)var l=!0;else{var i=Ye(Pt);i!==null&&vi(hi,i.startTime-t),l=!1}return l}finally{Ue=null,pe=n,Co=!1}}var _o=!1,yo=null,pr=-1,oa=5,la=-1;function ia(){return!(U.unstable_now()-la<oa)}function ci(){if(yo!==null){var e=U.unstable_now();la=e;var t=!0;try{t=yo(!0,e)}finally{t?dr():(_o=!1,yo=null)}}else _o=!1}var dr;typeof ea=="function"?dr=function(){ea(ci)}:typeof MessageChannel<"u"?(di=new MessageChannel,ta=di.port2,di.port1.onmessage=ci,dr=function(){ta.postMessage(null)}):dr=function(){na(ci,0)};var di,ta;function gi(e){yo=e,_o||(_o=!0,dr())}function vi(e,t){pr=na(function(){e(U.unstable_now())},t)}U.unstable_IdlePriority=5;U.unstable_ImmediatePriority=1;U.unstable_LowPriority=4;U.unstable_NormalPriority=3;U.unstable_Profiling=null;U.unstable_UserBlockingPriority=2;U.unstable_cancelCallback=function(e){e.callback=null};U.unstable_continueExecution=function(){qt||Co||(qt=!0,gi(mi))};U.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):oa=0<e?Math.floor(1e3/e):5};U.unstable_getCurrentPriorityLevel=function(){return pe};U.unstable_getFirstCallbackNode=function(){return Ye(ot)};U.unstable_next=function(e){switch(pe){case 1:case 2:case 3:var t=3;break;default:t=pe}var n=pe;pe=t;try{return e()}finally{pe=n}};U.unstable_pauseExecution=function(){};U.unstable_requestPaint=function(){};U.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=pe;pe=e;try{return t()}finally{pe=n}};U.unstable_scheduleCallback=function(e,t,n){var r=U.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?r+n:r):n=r,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=n+o,e={id:nh++,callback:t,priorityLevel:e,startTime:n,expirationTime:o,sortIndex:-1},n>r?(e.sortIndex=n,fi(Pt,e),Ye(ot)===null&&e===Ye(Pt)&&(fr?(ra(pr),pr=-1):fr=!0,vi(hi,n-r))):(e.sortIndex=o,fi(ot,e),qt||Co||(qt=!0,gi(mi))),e};U.unstable_shouldYield=ia;U.unstable_wrapCallback=function(e){var t=pe;return function(){var n=pe;pe=t;try{return e.apply(this,arguments)}finally{pe=n}}}});var aa=dt((Hg,ua)=>{"use strict";ua.exports=sa()});var hf=dt(Le=>{"use strict";var rh=Ge(),Ae=aa();function C(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var gc=new Set,Lr={};function pn(e,t){bn(e,t),bn(e+"Capture",t)}function bn(e,t){for(Lr[e]=t,e=0;e<t.length;e++)gc.add(t[e])}var vt=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),ji=Object.prototype.hasOwnProperty,oh=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,ca={},da={};function lh(e){return ji.call(da,e)?!0:ji.call(ca,e)?!1:oh.test(e)?da[e]=!0:(ca[e]=!0,!1)}function ih(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function sh(e,t,n,r){if(t===null||typeof t>"u"||ih(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function _e(e,t,n,r,o,l,i){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=o,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=l,this.removeEmptyString=i}var fe={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){fe[e]=new _e(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];fe[t]=new _e(t,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){fe[e]=new _e(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){fe[e]=new _e(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){fe[e]=new _e(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){fe[e]=new _e(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){fe[e]=new _e(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){fe[e]=new _e(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){fe[e]=new _e(e,5,!1,e.toLowerCase(),null,!1,!1)});var Ms=/[\-:]([a-z])/g;function As(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Ms,As);fe[t]=new _e(t,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Ms,As);fe[t]=new _e(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Ms,As);fe[t]=new _e(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){fe[e]=new _e(e,1,!1,e.toLowerCase(),null,!1,!1)});fe.xlinkHref=new _e("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){fe[e]=new _e(e,1,!1,e.toLowerCase(),null,!0,!0)});function zs(e,t,n,r){var o=fe.hasOwnProperty(t)?fe[t]:null;(o!==null?o.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(sh(t,n,o,r)&&(n=null),r||o===null?lh(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):o.mustUseProperty?e[o.propertyName]=n===null?o.type===3?!1:"":n:(t=o.attributeName,r=o.attributeNamespace,n===null?e.removeAttribute(t):(o=o.type,n=o===3||o===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var _t=rh.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,ko=Symbol.for("react.element"),Sn=Symbol.for("react.portal"),Dn=Symbol.for("react.fragment"),Ls=Symbol.for("react.strict_mode"),Ui=Symbol.for("react.profiler"),vc=Symbol.for("react.provider"),yc=Symbol.for("react.context"),Is=Symbol.for("react.forward_ref"),Hi=Symbol.for("react.suspense"),bi=Symbol.for("react.suspense_list"),$s=Symbol.for("react.memo"),Tt=Symbol.for("react.lazy");Symbol.for("react.scope");Symbol.for("react.debug_trace_mode");var wc=Symbol.for("react.offscreen");Symbol.for("react.legacy_hidden");Symbol.for("react.cache");Symbol.for("react.tracing_marker");var fa=Symbol.iterator;function hr(e){return e===null||typeof e!="object"?null:(e=fa&&e[fa]||e["@@iterator"],typeof e=="function"?e:null)}var J=Object.assign,yi;function kr(e){if(yi===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);yi=t&&t[1]||""}return`
`+yi+e}var wi=!1;function Ci(e,t){if(!e||wi)return"";wi=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(c){var r=c}Reflect.construct(e,[],t)}else{try{t.call()}catch(c){r=c}e.call(t.prototype)}else{try{throw Error()}catch(c){r=c}e()}}catch(c){if(c&&r&&typeof c.stack=="string"){for(var o=c.stack.split(`
`),l=r.stack.split(`
`),i=o.length-1,s=l.length-1;1<=i&&0<=s&&o[i]!==l[s];)s--;for(;1<=i&&0<=s;i--,s--)if(o[i]!==l[s]){if(i!==1||s!==1)do if(i--,s--,0>s||o[i]!==l[s]){var u=`
`+o[i].replace(" at new "," at ");return e.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",e.displayName)),u}while(1<=i&&0<=s);break}}}finally{wi=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?kr(e):""}function uh(e){switch(e.tag){case 5:return kr(e.type);case 16:return kr("Lazy");case 13:return kr("Suspense");case 19:return kr("SuspenseList");case 0:case 2:case 15:return e=Ci(e.type,!1),e;case 11:return e=Ci(e.type.render,!1),e;case 1:return e=Ci(e.type,!0),e;default:return""}}function Vi(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Dn:return"Fragment";case Sn:return"Portal";case Ui:return"Profiler";case Ls:return"StrictMode";case Hi:return"Suspense";case bi:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case yc:return(e.displayName||"Context")+".Consumer";case vc:return(e._context.displayName||"Context")+".Provider";case Is:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case $s:return t=e.displayName||null,t!==null?t:Vi(e.type)||"Memo";case Tt:t=e._payload,e=e._init;try{return Vi(e(t))}catch{}}return null}function ah(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Vi(t);case 8:return t===Ls?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function Vt(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Cc(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function ch(e){var t=Cc(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,l=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(i){r=""+i,l.call(this,i)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(i){r=""+i},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function xo(e){e._valueTracker||(e._valueTracker=ch(e))}function _c(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=Cc(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function Xo(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Wi(e,t){var n=t.checked;return J({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function pa(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=Vt(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function kc(e,t){t=t.checked,t!=null&&zs(e,"checked",t,!1)}function Qi(e,t){kc(e,t);var n=Vt(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?Ki(e,t.type,n):t.hasOwnProperty("defaultValue")&&Ki(e,t.type,Vt(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function ha(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function Ki(e,t,n){(t!=="number"||Xo(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var xr=Array.isArray;function $n(e,t,n,r){if(e=e.options,t){t={};for(var o=0;o<n.length;o++)t["$"+n[o]]=!0;for(n=0;n<e.length;n++)o=t.hasOwnProperty("$"+e[n].value),e[n].selected!==o&&(e[n].selected=o),o&&r&&(e[n].defaultSelected=!0)}else{for(n=""+Vt(n),t=null,o=0;o<e.length;o++){if(e[o].value===n){e[o].selected=!0,r&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function Gi(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(C(91));return J({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function ma(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(C(92));if(xr(n)){if(1<n.length)throw Error(C(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:Vt(n)}}function xc(e,t){var n=Vt(t.value),r=Vt(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function ga(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function Ec(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Yi(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?Ec(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var Eo,Sc=(function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,o){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,o)})}:e})(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(Eo=Eo||document.createElement("div"),Eo.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=Eo.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function Ir(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Dr={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},dh=["Webkit","ms","Moz","O"];Object.keys(Dr).forEach(function(e){dh.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Dr[t]=Dr[e]})});function Dc(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||Dr.hasOwnProperty(e)&&Dr[e]?(""+t).trim():t+"px"}function Fc(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,o=Dc(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,o):e[n]=o}}var fh=J({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Zi(e,t){if(t){if(fh[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(C(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(C(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(C(61))}if(t.style!=null&&typeof t.style!="object")throw Error(C(62))}}function Xi(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Ji=null;function Os(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var qi=null,On=null,Bn=null;function va(e){if(e=eo(e)){if(typeof qi!="function")throw Error(C(280));var t=e.stateNode;t&&(t=Sl(t),qi(e.stateNode,e.type,t))}}function Pc(e){On?Bn?Bn.push(e):Bn=[e]:On=e}function Nc(){if(On){var e=On,t=Bn;if(Bn=On=null,va(e),t)for(e=0;e<t.length;e++)va(t[e])}}function Tc(e,t){return e(t)}function Rc(){}var _i=!1;function Mc(e,t,n){if(_i)return e(t,n);_i=!0;try{return Tc(e,t,n)}finally{_i=!1,(On!==null||Bn!==null)&&(Rc(),Nc())}}function $r(e,t){var n=e.stateNode;if(n===null)return null;var r=Sl(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(C(231,t,typeof n));return n}var es=!1;if(vt)try{xn={},Object.defineProperty(xn,"passive",{get:function(){es=!0}}),window.addEventListener("test",xn,xn),window.removeEventListener("test",xn,xn)}catch{es=!1}var xn;function ph(e,t,n,r,o,l,i,s,u){var c=Array.prototype.slice.call(arguments,3);try{t.apply(n,c)}catch(h){this.onError(h)}}var Fr=!1,Jo=null,qo=!1,ts=null,hh={onError:function(e){Fr=!0,Jo=e}};function mh(e,t,n,r,o,l,i,s,u){Fr=!1,Jo=null,ph.apply(hh,arguments)}function gh(e,t,n,r,o,l,i,s,u){if(mh.apply(this,arguments),Fr){if(Fr){var c=Jo;Fr=!1,Jo=null}else throw Error(C(198));qo||(qo=!0,ts=c)}}function hn(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function Ac(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function ya(e){if(hn(e)!==e)throw Error(C(188))}function vh(e){var t=e.alternate;if(!t){if(t=hn(e),t===null)throw Error(C(188));return t!==e?null:e}for(var n=e,r=t;;){var o=n.return;if(o===null)break;var l=o.alternate;if(l===null){if(r=o.return,r!==null){n=r;continue}break}if(o.child===l.child){for(l=o.child;l;){if(l===n)return ya(o),e;if(l===r)return ya(o),t;l=l.sibling}throw Error(C(188))}if(n.return!==r.return)n=o,r=l;else{for(var i=!1,s=o.child;s;){if(s===n){i=!0,n=o,r=l;break}if(s===r){i=!0,r=o,n=l;break}s=s.sibling}if(!i){for(s=l.child;s;){if(s===n){i=!0,n=l,r=o;break}if(s===r){i=!0,r=l,n=o;break}s=s.sibling}if(!i)throw Error(C(189))}}if(n.alternate!==r)throw Error(C(190))}if(n.tag!==3)throw Error(C(188));return n.stateNode.current===n?e:t}function zc(e){return e=vh(e),e!==null?Lc(e):null}function Lc(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=Lc(e);if(t!==null)return t;e=e.sibling}return null}var Ic=Ae.unstable_scheduleCallback,wa=Ae.unstable_cancelCallback,yh=Ae.unstable_shouldYield,wh=Ae.unstable_requestPaint,te=Ae.unstable_now,Ch=Ae.unstable_getCurrentPriorityLevel,Bs=Ae.unstable_ImmediatePriority,$c=Ae.unstable_UserBlockingPriority,el=Ae.unstable_NormalPriority,_h=Ae.unstable_LowPriority,Oc=Ae.unstable_IdlePriority,_l=null,ut=null;function kh(e){if(ut&&typeof ut.onCommitFiberRoot=="function")try{ut.onCommitFiberRoot(_l,e,void 0,(e.current.flags&128)===128)}catch{}}var et=Math.clz32?Math.clz32:Sh,xh=Math.log,Eh=Math.LN2;function Sh(e){return e>>>=0,e===0?32:31-(xh(e)/Eh|0)|0}var So=64,Do=4194304;function Er(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function tl(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,o=e.suspendedLanes,l=e.pingedLanes,i=n&268435455;if(i!==0){var s=i&~o;s!==0?r=Er(s):(l&=i,l!==0&&(r=Er(l)))}else i=n&~o,i!==0?r=Er(i):l!==0&&(r=Er(l));if(r===0)return 0;if(t!==0&&t!==r&&(t&o)===0&&(o=r&-r,l=t&-t,o>=l||o===16&&(l&4194240)!==0))return t;if((r&4)!==0&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-et(t),o=1<<n,r|=e[n],t&=~o;return r}function Dh(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Fh(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,o=e.expirationTimes,l=e.pendingLanes;0<l;){var i=31-et(l),s=1<<i,u=o[i];u===-1?((s&n)===0||(s&r)!==0)&&(o[i]=Dh(s,t)):u<=t&&(e.expiredLanes|=s),l&=~s}}function ns(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Bc(){var e=So;return So<<=1,(So&4194240)===0&&(So=64),e}function ki(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Jr(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-et(t),e[t]=n}function Ph(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var o=31-et(n),l=1<<o;t[o]=0,r[o]=-1,e[o]=-1,n&=~l}}function js(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-et(n),o=1<<r;o&t|e[r]&t&&(e[r]|=t),n&=~o}}var O=0;function jc(e){return e&=-e,1<e?4<e?(e&268435455)!==0?16:536870912:4:1}var Uc,Us,Hc,bc,Vc,rs=!1,Fo=[],It=null,$t=null,Ot=null,Or=new Map,Br=new Map,Mt=[],Nh="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Ca(e,t){switch(e){case"focusin":case"focusout":It=null;break;case"dragenter":case"dragleave":$t=null;break;case"mouseover":case"mouseout":Ot=null;break;case"pointerover":case"pointerout":Or.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Br.delete(t.pointerId)}}function mr(e,t,n,r,o,l){return e===null||e.nativeEvent!==l?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:l,targetContainers:[o]},t!==null&&(t=eo(t),t!==null&&Us(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function Th(e,t,n,r,o){switch(t){case"focusin":return It=mr(It,e,t,n,r,o),!0;case"dragenter":return $t=mr($t,e,t,n,r,o),!0;case"mouseover":return Ot=mr(Ot,e,t,n,r,o),!0;case"pointerover":var l=o.pointerId;return Or.set(l,mr(Or.get(l)||null,e,t,n,r,o)),!0;case"gotpointercapture":return l=o.pointerId,Br.set(l,mr(Br.get(l)||null,e,t,n,r,o)),!0}return!1}function Wc(e){var t=nn(e.target);if(t!==null){var n=hn(t);if(n!==null){if(t=n.tag,t===13){if(t=Ac(n),t!==null){e.blockedOn=t,Vc(e.priority,function(){Hc(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Uo(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=os(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);Ji=r,n.target.dispatchEvent(r),Ji=null}else return t=eo(n),t!==null&&Us(t),e.blockedOn=n,!1;t.shift()}return!0}function _a(e,t,n){Uo(e)&&n.delete(t)}function Rh(){rs=!1,It!==null&&Uo(It)&&(It=null),$t!==null&&Uo($t)&&($t=null),Ot!==null&&Uo(Ot)&&(Ot=null),Or.forEach(_a),Br.forEach(_a)}function gr(e,t){e.blockedOn===t&&(e.blockedOn=null,rs||(rs=!0,Ae.unstable_scheduleCallback(Ae.unstable_NormalPriority,Rh)))}function jr(e){function t(o){return gr(o,e)}if(0<Fo.length){gr(Fo[0],e);for(var n=1;n<Fo.length;n++){var r=Fo[n];r.blockedOn===e&&(r.blockedOn=null)}}for(It!==null&&gr(It,e),$t!==null&&gr($t,e),Ot!==null&&gr(Ot,e),Or.forEach(t),Br.forEach(t),n=0;n<Mt.length;n++)r=Mt[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<Mt.length&&(n=Mt[0],n.blockedOn===null);)Wc(n),n.blockedOn===null&&Mt.shift()}var jn=_t.ReactCurrentBatchConfig,nl=!0;function Mh(e,t,n,r){var o=O,l=jn.transition;jn.transition=null;try{O=1,Hs(e,t,n,r)}finally{O=o,jn.transition=l}}function Ah(e,t,n,r){var o=O,l=jn.transition;jn.transition=null;try{O=4,Hs(e,t,n,r)}finally{O=o,jn.transition=l}}function Hs(e,t,n,r){if(nl){var o=os(e,t,n,r);if(o===null)Ni(e,t,r,rl,n),Ca(e,r);else if(Th(o,e,t,n,r))r.stopPropagation();else if(Ca(e,r),t&4&&-1<Nh.indexOf(e)){for(;o!==null;){var l=eo(o);if(l!==null&&Uc(l),l=os(e,t,n,r),l===null&&Ni(e,t,r,rl,n),l===o)break;o=l}o!==null&&r.stopPropagation()}else Ni(e,t,r,null,n)}}var rl=null;function os(e,t,n,r){if(rl=null,e=Os(r),e=nn(e),e!==null)if(t=hn(e),t===null)e=null;else if(n=t.tag,n===13){if(e=Ac(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return rl=e,null}function Qc(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Ch()){case Bs:return 1;case $c:return 4;case el:case _h:return 16;case Oc:return 536870912;default:return 16}default:return 16}}var zt=null,bs=null,Ho=null;function Kc(){if(Ho)return Ho;var e,t=bs,n=t.length,r,o="value"in zt?zt.value:zt.textContent,l=o.length;for(e=0;e<n&&t[e]===o[e];e++);var i=n-e;for(r=1;r<=i&&t[n-r]===o[l-r];r++);return Ho=o.slice(e,1<r?1-r:void 0)}function bo(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Po(){return!0}function ka(){return!1}function ze(e){function t(n,r,o,l,i){this._reactName=n,this._targetInst=o,this.type=r,this.nativeEvent=l,this.target=i,this.currentTarget=null;for(var s in e)e.hasOwnProperty(s)&&(n=e[s],this[s]=n?n(l):l[s]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?Po:ka,this.isPropagationStopped=ka,this}return J(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Po)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Po)},persist:function(){},isPersistent:Po}),t}var Zn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Vs=ze(Zn),qr=J({},Zn,{view:0,detail:0}),zh=ze(qr),xi,Ei,vr,kl=J({},qr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ws,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==vr&&(vr&&e.type==="mousemove"?(xi=e.screenX-vr.screenX,Ei=e.screenY-vr.screenY):Ei=xi=0,vr=e),xi)},movementY:function(e){return"movementY"in e?e.movementY:Ei}}),xa=ze(kl),Lh=J({},kl,{dataTransfer:0}),Ih=ze(Lh),$h=J({},qr,{relatedTarget:0}),Si=ze($h),Oh=J({},Zn,{animationName:0,elapsedTime:0,pseudoElement:0}),Bh=ze(Oh),jh=J({},Zn,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Uh=ze(jh),Hh=J({},Zn,{data:0}),Ea=ze(Hh),bh={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Vh={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Wh={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Qh(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Wh[e])?!!t[e]:!1}function Ws(){return Qh}var Kh=J({},qr,{key:function(e){if(e.key){var t=bh[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=bo(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Vh[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ws,charCode:function(e){return e.type==="keypress"?bo(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?bo(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Gh=ze(Kh),Yh=J({},kl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Sa=ze(Yh),Zh=J({},qr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ws}),Xh=ze(Zh),Jh=J({},Zn,{propertyName:0,elapsedTime:0,pseudoElement:0}),qh=ze(Jh),em=J({},kl,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),tm=ze(em),nm=[9,13,27,32],Qs=vt&&"CompositionEvent"in window,Pr=null;vt&&"documentMode"in document&&(Pr=document.documentMode);var rm=vt&&"TextEvent"in window&&!Pr,Gc=vt&&(!Qs||Pr&&8<Pr&&11>=Pr),Da=" ",Fa=!1;function Yc(e,t){switch(e){case"keyup":return nm.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Zc(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Fn=!1;function om(e,t){switch(e){case"compositionend":return Zc(t);case"keypress":return t.which!==32?null:(Fa=!0,Da);case"textInput":return e=t.data,e===Da&&Fa?null:e;default:return null}}function lm(e,t){if(Fn)return e==="compositionend"||!Qs&&Yc(e,t)?(e=Kc(),Ho=bs=zt=null,Fn=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Gc&&t.locale!=="ko"?null:t.data;default:return null}}var im={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Pa(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!im[e.type]:t==="textarea"}function Xc(e,t,n,r){Pc(r),t=ol(t,"onChange"),0<t.length&&(n=new Vs("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var Nr=null,Ur=null;function sm(e){ud(e,0)}function xl(e){var t=Tn(e);if(_c(t))return e}function um(e,t){if(e==="change")return t}var Jc=!1;vt&&(vt?(To="oninput"in document,To||(Di=document.createElement("div"),Di.setAttribute("oninput","return;"),To=typeof Di.oninput=="function"),No=To):No=!1,Jc=No&&(!document.documentMode||9<document.documentMode));var No,To,Di;function Na(){Nr&&(Nr.detachEvent("onpropertychange",qc),Ur=Nr=null)}function qc(e){if(e.propertyName==="value"&&xl(Ur)){var t=[];Xc(t,Ur,e,Os(e)),Mc(sm,t)}}function am(e,t,n){e==="focusin"?(Na(),Nr=t,Ur=n,Nr.attachEvent("onpropertychange",qc)):e==="focusout"&&Na()}function cm(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return xl(Ur)}function dm(e,t){if(e==="click")return xl(t)}function fm(e,t){if(e==="input"||e==="change")return xl(t)}function pm(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var nt=typeof Object.is=="function"?Object.is:pm;function Hr(e,t){if(nt(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var o=n[r];if(!ji.call(t,o)||!nt(e[o],t[o]))return!1}return!0}function Ta(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Ra(e,t){var n=Ta(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Ta(n)}}function ed(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?ed(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function td(){for(var e=window,t=Xo();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=Xo(e.document)}return t}function Ks(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function hm(e){var t=td(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&ed(n.ownerDocument.documentElement,n)){if(r!==null&&Ks(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var o=n.textContent.length,l=Math.min(r.start,o);r=r.end===void 0?l:Math.min(r.end,o),!e.extend&&l>r&&(o=r,r=l,l=o),o=Ra(n,l);var i=Ra(n,r);o&&i&&(e.rangeCount!==1||e.anchorNode!==o.node||e.anchorOffset!==o.offset||e.focusNode!==i.node||e.focusOffset!==i.offset)&&(t=t.createRange(),t.setStart(o.node,o.offset),e.removeAllRanges(),l>r?(e.addRange(t),e.extend(i.node,i.offset)):(t.setEnd(i.node,i.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var mm=vt&&"documentMode"in document&&11>=document.documentMode,Pn=null,ls=null,Tr=null,is=!1;function Ma(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;is||Pn==null||Pn!==Xo(r)||(r=Pn,"selectionStart"in r&&Ks(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Tr&&Hr(Tr,r)||(Tr=r,r=ol(ls,"onSelect"),0<r.length&&(t=new Vs("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=Pn)))}function Ro(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Nn={animationend:Ro("Animation","AnimationEnd"),animationiteration:Ro("Animation","AnimationIteration"),animationstart:Ro("Animation","AnimationStart"),transitionend:Ro("Transition","TransitionEnd")},Fi={},nd={};vt&&(nd=document.createElement("div").style,"AnimationEvent"in window||(delete Nn.animationend.animation,delete Nn.animationiteration.animation,delete Nn.animationstart.animation),"TransitionEvent"in window||delete Nn.transitionend.transition);function El(e){if(Fi[e])return Fi[e];if(!Nn[e])return e;var t=Nn[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in nd)return Fi[e]=t[n];return e}var rd=El("animationend"),od=El("animationiteration"),ld=El("animationstart"),id=El("transitionend"),sd=new Map,Aa="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Qt(e,t){sd.set(e,t),pn(t,[e])}for(Mo=0;Mo<Aa.length;Mo++)Ao=Aa[Mo],za=Ao.toLowerCase(),La=Ao[0].toUpperCase()+Ao.slice(1),Qt(za,"on"+La);var Ao,za,La,Mo;Qt(rd,"onAnimationEnd");Qt(od,"onAnimationIteration");Qt(ld,"onAnimationStart");Qt("dblclick","onDoubleClick");Qt("focusin","onFocus");Qt("focusout","onBlur");Qt(id,"onTransitionEnd");bn("onMouseEnter",["mouseout","mouseover"]);bn("onMouseLeave",["mouseout","mouseover"]);bn("onPointerEnter",["pointerout","pointerover"]);bn("onPointerLeave",["pointerout","pointerover"]);pn("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));pn("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));pn("onBeforeInput",["compositionend","keypress","textInput","paste"]);pn("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));pn("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));pn("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Sr="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),gm=new Set("cancel close invalid load scroll toggle".split(" ").concat(Sr));function Ia(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,gh(r,t,void 0,e),e.currentTarget=null}function ud(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],o=r.event;r=r.listeners;e:{var l=void 0;if(t)for(var i=r.length-1;0<=i;i--){var s=r[i],u=s.instance,c=s.currentTarget;if(s=s.listener,u!==l&&o.isPropagationStopped())break e;Ia(o,s,c),l=u}else for(i=0;i<r.length;i++){if(s=r[i],u=s.instance,c=s.currentTarget,s=s.listener,u!==l&&o.isPropagationStopped())break e;Ia(o,s,c),l=u}}}if(qo)throw e=ts,qo=!1,ts=null,e}function W(e,t){var n=t[ds];n===void 0&&(n=t[ds]=new Set);var r=e+"__bubble";n.has(r)||(ad(t,e,2,!1),n.add(r))}function Pi(e,t,n){var r=0;t&&(r|=4),ad(n,e,r,t)}var zo="_reactListening"+Math.random().toString(36).slice(2);function br(e){if(!e[zo]){e[zo]=!0,gc.forEach(function(n){n!=="selectionchange"&&(gm.has(n)||Pi(n,!1,e),Pi(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[zo]||(t[zo]=!0,Pi("selectionchange",!1,t))}}function ad(e,t,n,r){switch(Qc(t)){case 1:var o=Mh;break;case 4:o=Ah;break;default:o=Hs}n=o.bind(null,t,n,e),o=void 0,!es||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),r?o!==void 0?e.addEventListener(t,n,{capture:!0,passive:o}):e.addEventListener(t,n,!0):o!==void 0?e.addEventListener(t,n,{passive:o}):e.addEventListener(t,n,!1)}function Ni(e,t,n,r,o){var l=r;if((t&1)===0&&(t&2)===0&&r!==null)e:for(;;){if(r===null)return;var i=r.tag;if(i===3||i===4){var s=r.stateNode.containerInfo;if(s===o||s.nodeType===8&&s.parentNode===o)break;if(i===4)for(i=r.return;i!==null;){var u=i.tag;if((u===3||u===4)&&(u=i.stateNode.containerInfo,u===o||u.nodeType===8&&u.parentNode===o))return;i=i.return}for(;s!==null;){if(i=nn(s),i===null)return;if(u=i.tag,u===5||u===6){r=l=i;continue e}s=s.parentNode}}r=r.return}Mc(function(){var c=l,h=Os(n),g=[];e:{var f=sd.get(e);if(f!==void 0){var m=Vs,w=e;switch(e){case"keypress":if(bo(n)===0)break e;case"keydown":case"keyup":m=Gh;break;case"focusin":w="focus",m=Si;break;case"focusout":w="blur",m=Si;break;case"beforeblur":case"afterblur":m=Si;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":m=xa;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":m=Ih;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":m=Xh;break;case rd:case od:case ld:m=Bh;break;case id:m=qh;break;case"scroll":m=zh;break;case"wheel":m=tm;break;case"copy":case"cut":case"paste":m=Uh;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":m=Sa}var v=(t&4)!==0,k=!v&&e==="scroll",d=v?f!==null?f+"Capture":null:f;v=[];for(var a=c,p;a!==null;){p=a;var y=p.stateNode;if(p.tag===5&&y!==null&&(p=y,d!==null&&(y=$r(a,d),y!=null&&v.push(Vr(a,y,p)))),k)break;a=a.return}0<v.length&&(f=new m(f,w,null,n,h),g.push({event:f,listeners:v}))}}if((t&7)===0){e:{if(f=e==="mouseover"||e==="pointerover",m=e==="mouseout"||e==="pointerout",f&&n!==Ji&&(w=n.relatedTarget||n.fromElement)&&(nn(w)||w[yt]))break e;if((m||f)&&(f=h.window===h?h:(f=h.ownerDocument)?f.defaultView||f.parentWindow:window,m?(w=n.relatedTarget||n.toElement,m=c,w=w?nn(w):null,w!==null&&(k=hn(w),w!==k||w.tag!==5&&w.tag!==6)&&(w=null)):(m=null,w=c),m!==w)){if(v=xa,y="onMouseLeave",d="onMouseEnter",a="mouse",(e==="pointerout"||e==="pointerover")&&(v=Sa,y="onPointerLeave",d="onPointerEnter",a="pointer"),k=m==null?f:Tn(m),p=w==null?f:Tn(w),f=new v(y,a+"leave",m,n,h),f.target=k,f.relatedTarget=p,y=null,nn(h)===c&&(v=new v(d,a+"enter",w,n,h),v.target=p,v.relatedTarget=k,y=v),k=y,m&&w)t:{for(v=m,d=w,a=0,p=v;p;p=En(p))a++;for(p=0,y=d;y;y=En(y))p++;for(;0<a-p;)v=En(v),a--;for(;0<p-a;)d=En(d),p--;for(;a--;){if(v===d||d!==null&&v===d.alternate)break t;v=En(v),d=En(d)}v=null}else v=null;m!==null&&$a(g,f,m,v,!1),w!==null&&k!==null&&$a(g,k,w,v,!0)}}e:{if(f=c?Tn(c):window,m=f.nodeName&&f.nodeName.toLowerCase(),m==="select"||m==="input"&&f.type==="file")var S=um;else if(Pa(f))if(Jc)S=fm;else{S=cm;var _=am}else(m=f.nodeName)&&m.toLowerCase()==="input"&&(f.type==="checkbox"||f.type==="radio")&&(S=dm);if(S&&(S=S(e,c))){Xc(g,S,n,h);break e}_&&_(e,f,c),e==="focusout"&&(_=f._wrapperState)&&_.controlled&&f.type==="number"&&Ki(f,"number",f.value)}switch(_=c?Tn(c):window,e){case"focusin":(Pa(_)||_.contentEditable==="true")&&(Pn=_,ls=c,Tr=null);break;case"focusout":Tr=ls=Pn=null;break;case"mousedown":is=!0;break;case"contextmenu":case"mouseup":case"dragend":is=!1,Ma(g,n,h);break;case"selectionchange":if(mm)break;case"keydown":case"keyup":Ma(g,n,h)}var D;if(Qs)e:{switch(e){case"compositionstart":var N="onCompositionStart";break e;case"compositionend":N="onCompositionEnd";break e;case"compositionupdate":N="onCompositionUpdate";break e}N=void 0}else Fn?Yc(e,n)&&(N="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(N="onCompositionStart");N&&(Gc&&n.locale!=="ko"&&(Fn||N!=="onCompositionStart"?N==="onCompositionEnd"&&Fn&&(D=Kc()):(zt=h,bs="value"in zt?zt.value:zt.textContent,Fn=!0)),_=ol(c,N),0<_.length&&(N=new Ea(N,e,null,n,h),g.push({event:N,listeners:_}),D?N.data=D:(D=Zc(n),D!==null&&(N.data=D)))),(D=rm?om(e,n):lm(e,n))&&(c=ol(c,"onBeforeInput"),0<c.length&&(h=new Ea("onBeforeInput","beforeinput",null,n,h),g.push({event:h,listeners:c}),h.data=D))}ud(g,t)})}function Vr(e,t,n){return{instance:e,listener:t,currentTarget:n}}function ol(e,t){for(var n=t+"Capture",r=[];e!==null;){var o=e,l=o.stateNode;o.tag===5&&l!==null&&(o=l,l=$r(e,n),l!=null&&r.unshift(Vr(e,l,o)),l=$r(e,t),l!=null&&r.push(Vr(e,l,o))),e=e.return}return r}function En(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function $a(e,t,n,r,o){for(var l=t._reactName,i=[];n!==null&&n!==r;){var s=n,u=s.alternate,c=s.stateNode;if(u!==null&&u===r)break;s.tag===5&&c!==null&&(s=c,o?(u=$r(n,l),u!=null&&i.unshift(Vr(n,u,s))):o||(u=$r(n,l),u!=null&&i.push(Vr(n,u,s)))),n=n.return}i.length!==0&&e.push({event:t,listeners:i})}var vm=/\r\n?/g,ym=/\u0000|\uFFFD/g;function Oa(e){return(typeof e=="string"?e:""+e).replace(vm,`
`).replace(ym,"")}function Lo(e,t,n){if(t=Oa(t),Oa(e)!==t&&n)throw Error(C(425))}function ll(){}var ss=null,us=null;function as(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var cs=typeof setTimeout=="function"?setTimeout:void 0,wm=typeof clearTimeout=="function"?clearTimeout:void 0,Ba=typeof Promise=="function"?Promise:void 0,Cm=typeof queueMicrotask=="function"?queueMicrotask:typeof Ba<"u"?function(e){return Ba.resolve(null).then(e).catch(_m)}:cs;function _m(e){setTimeout(function(){throw e})}function Ti(e,t){var n=t,r=0;do{var o=n.nextSibling;if(e.removeChild(n),o&&o.nodeType===8)if(n=o.data,n==="/$"){if(r===0){e.removeChild(o),jr(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=o}while(n);jr(t)}function Bt(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function ja(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var Xn=Math.random().toString(36).slice(2),st="__reactFiber$"+Xn,Wr="__reactProps$"+Xn,yt="__reactContainer$"+Xn,ds="__reactEvents$"+Xn,km="__reactListeners$"+Xn,xm="__reactHandles$"+Xn;function nn(e){var t=e[st];if(t)return t;for(var n=e.parentNode;n;){if(t=n[yt]||n[st]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=ja(e);e!==null;){if(n=e[st])return n;e=ja(e)}return t}e=n,n=e.parentNode}return null}function eo(e){return e=e[st]||e[yt],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Tn(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(C(33))}function Sl(e){return e[Wr]||null}var fs=[],Rn=-1;function Kt(e){return{current:e}}function Q(e){0>Rn||(e.current=fs[Rn],fs[Rn]=null,Rn--)}function H(e,t){Rn++,fs[Rn]=e.current,e.current=t}var Wt={},ve=Kt(Wt),Ee=Kt(!1),un=Wt;function Vn(e,t){var n=e.type.contextTypes;if(!n)return Wt;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var o={},l;for(l in n)o[l]=t[l];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=o),o}function Se(e){return e=e.childContextTypes,e!=null}function il(){Q(Ee),Q(ve)}function Ua(e,t,n){if(ve.current!==Wt)throw Error(C(168));H(ve,t),H(Ee,n)}function cd(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var o in r)if(!(o in t))throw Error(C(108,ah(e)||"Unknown",o));return J({},n,r)}function sl(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Wt,un=ve.current,H(ve,e),H(Ee,Ee.current),!0}function Ha(e,t,n){var r=e.stateNode;if(!r)throw Error(C(169));n?(e=cd(e,t,un),r.__reactInternalMemoizedMergedChildContext=e,Q(Ee),Q(ve),H(ve,e)):Q(Ee),H(Ee,n)}var pt=null,Dl=!1,Ri=!1;function dd(e){pt===null?pt=[e]:pt.push(e)}function Em(e){Dl=!0,dd(e)}function Gt(){if(!Ri&&pt!==null){Ri=!0;var e=0,t=O;try{var n=pt;for(O=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}pt=null,Dl=!1}catch(o){throw pt!==null&&(pt=pt.slice(e+1)),Ic(Bs,Gt),o}finally{O=t,Ri=!1}}return null}var Mn=[],An=0,ul=null,al=0,He=[],be=0,an=null,ht=1,mt="";function en(e,t){Mn[An++]=al,Mn[An++]=ul,ul=e,al=t}function fd(e,t,n){He[be++]=ht,He[be++]=mt,He[be++]=an,an=e;var r=ht;e=mt;var o=32-et(r)-1;r&=~(1<<o),n+=1;var l=32-et(t)+o;if(30<l){var i=o-o%5;l=(r&(1<<i)-1).toString(32),r>>=i,o-=i,ht=1<<32-et(t)+o|n<<o|r,mt=l+e}else ht=1<<l|n<<o|r,mt=e}function Gs(e){e.return!==null&&(en(e,1),fd(e,1,0))}function Ys(e){for(;e===ul;)ul=Mn[--An],Mn[An]=null,al=Mn[--An],Mn[An]=null;for(;e===an;)an=He[--be],He[be]=null,mt=He[--be],He[be]=null,ht=He[--be],He[be]=null}var Me=null,Re=null,K=!1,qe=null;function pd(e,t){var n=Ve(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function ba(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,Me=e,Re=Bt(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,Me=e,Re=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=an!==null?{id:ht,overflow:mt}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=Ve(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,Me=e,Re=null,!0):!1;default:return!1}}function ps(e){return(e.mode&1)!==0&&(e.flags&128)===0}function hs(e){if(K){var t=Re;if(t){var n=t;if(!ba(e,t)){if(ps(e))throw Error(C(418));t=Bt(n.nextSibling);var r=Me;t&&ba(e,t)?pd(r,n):(e.flags=e.flags&-4097|2,K=!1,Me=e)}}else{if(ps(e))throw Error(C(418));e.flags=e.flags&-4097|2,K=!1,Me=e}}}function Va(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;Me=e}function Io(e){if(e!==Me)return!1;if(!K)return Va(e),K=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!as(e.type,e.memoizedProps)),t&&(t=Re)){if(ps(e))throw hd(),Error(C(418));for(;t;)pd(e,t),t=Bt(t.nextSibling)}if(Va(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(C(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){Re=Bt(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}Re=null}}else Re=Me?Bt(e.stateNode.nextSibling):null;return!0}function hd(){for(var e=Re;e;)e=Bt(e.nextSibling)}function Wn(){Re=Me=null,K=!1}function Zs(e){qe===null?qe=[e]:qe.push(e)}var Sm=_t.ReactCurrentBatchConfig;function yr(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(C(309));var r=n.stateNode}if(!r)throw Error(C(147,e));var o=r,l=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===l?t.ref:(t=function(i){var s=o.refs;i===null?delete s[l]:s[l]=i},t._stringRef=l,t)}if(typeof e!="string")throw Error(C(284));if(!n._owner)throw Error(C(290,e))}return e}function $o(e,t){throw e=Object.prototype.toString.call(t),Error(C(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function Wa(e){var t=e._init;return t(e._payload)}function md(e){function t(d,a){if(e){var p=d.deletions;p===null?(d.deletions=[a],d.flags|=16):p.push(a)}}function n(d,a){if(!e)return null;for(;a!==null;)t(d,a),a=a.sibling;return null}function r(d,a){for(d=new Map;a!==null;)a.key!==null?d.set(a.key,a):d.set(a.index,a),a=a.sibling;return d}function o(d,a){return d=bt(d,a),d.index=0,d.sibling=null,d}function l(d,a,p){return d.index=p,e?(p=d.alternate,p!==null?(p=p.index,p<a?(d.flags|=2,a):p):(d.flags|=2,a)):(d.flags|=1048576,a)}function i(d){return e&&d.alternate===null&&(d.flags|=2),d}function s(d,a,p,y){return a===null||a.tag!==6?(a=Oi(p,d.mode,y),a.return=d,a):(a=o(a,p),a.return=d,a)}function u(d,a,p,y){var S=p.type;return S===Dn?h(d,a,p.props.children,y,p.key):a!==null&&(a.elementType===S||typeof S=="object"&&S!==null&&S.$$typeof===Tt&&Wa(S)===a.type)?(y=o(a,p.props),y.ref=yr(d,a,p),y.return=d,y):(y=Zo(p.type,p.key,p.props,null,d.mode,y),y.ref=yr(d,a,p),y.return=d,y)}function c(d,a,p,y){return a===null||a.tag!==4||a.stateNode.containerInfo!==p.containerInfo||a.stateNode.implementation!==p.implementation?(a=Bi(p,d.mode,y),a.return=d,a):(a=o(a,p.children||[]),a.return=d,a)}function h(d,a,p,y,S){return a===null||a.tag!==7?(a=sn(p,d.mode,y,S),a.return=d,a):(a=o(a,p),a.return=d,a)}function g(d,a,p){if(typeof a=="string"&&a!==""||typeof a=="number")return a=Oi(""+a,d.mode,p),a.return=d,a;if(typeof a=="object"&&a!==null){switch(a.$$typeof){case ko:return p=Zo(a.type,a.key,a.props,null,d.mode,p),p.ref=yr(d,null,a),p.return=d,p;case Sn:return a=Bi(a,d.mode,p),a.return=d,a;case Tt:var y=a._init;return g(d,y(a._payload),p)}if(xr(a)||hr(a))return a=sn(a,d.mode,p,null),a.return=d,a;$o(d,a)}return null}function f(d,a,p,y){var S=a!==null?a.key:null;if(typeof p=="string"&&p!==""||typeof p=="number")return S!==null?null:s(d,a,""+p,y);if(typeof p=="object"&&p!==null){switch(p.$$typeof){case ko:return p.key===S?u(d,a,p,y):null;case Sn:return p.key===S?c(d,a,p,y):null;case Tt:return S=p._init,f(d,a,S(p._payload),y)}if(xr(p)||hr(p))return S!==null?null:h(d,a,p,y,null);$o(d,p)}return null}function m(d,a,p,y,S){if(typeof y=="string"&&y!==""||typeof y=="number")return d=d.get(p)||null,s(a,d,""+y,S);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case ko:return d=d.get(y.key===null?p:y.key)||null,u(a,d,y,S);case Sn:return d=d.get(y.key===null?p:y.key)||null,c(a,d,y,S);case Tt:var _=y._init;return m(d,a,p,_(y._payload),S)}if(xr(y)||hr(y))return d=d.get(p)||null,h(a,d,y,S,null);$o(a,y)}return null}function w(d,a,p,y){for(var S=null,_=null,D=a,N=a=0,j=null;D!==null&&N<p.length;N++){D.index>N?(j=D,D=null):j=D.sibling;var A=f(d,D,p[N],y);if(A===null){D===null&&(D=j);break}e&&D&&A.alternate===null&&t(d,D),a=l(A,a,N),_===null?S=A:_.sibling=A,_=A,D=j}if(N===p.length)return n(d,D),K&&en(d,N),S;if(D===null){for(;N<p.length;N++)D=g(d,p[N],y),D!==null&&(a=l(D,a,N),_===null?S=D:_.sibling=D,_=D);return K&&en(d,N),S}for(D=r(d,D);N<p.length;N++)j=m(D,d,N,p[N],y),j!==null&&(e&&j.alternate!==null&&D.delete(j.key===null?N:j.key),a=l(j,a,N),_===null?S=j:_.sibling=j,_=j);return e&&D.forEach(function(G){return t(d,G)}),K&&en(d,N),S}function v(d,a,p,y){var S=hr(p);if(typeof S!="function")throw Error(C(150));if(p=S.call(p),p==null)throw Error(C(151));for(var _=S=null,D=a,N=a=0,j=null,A=p.next();D!==null&&!A.done;N++,A=p.next()){D.index>N?(j=D,D=null):j=D.sibling;var G=f(d,D,A.value,y);if(G===null){D===null&&(D=j);break}e&&D&&G.alternate===null&&t(d,D),a=l(G,a,N),_===null?S=G:_.sibling=G,_=G,D=j}if(A.done)return n(d,D),K&&en(d,N),S;if(D===null){for(;!A.done;N++,A=p.next())A=g(d,A.value,y),A!==null&&(a=l(A,a,N),_===null?S=A:_.sibling=A,_=A);return K&&en(d,N),S}for(D=r(d,D);!A.done;N++,A=p.next())A=m(D,d,N,A.value,y),A!==null&&(e&&A.alternate!==null&&D.delete(A.key===null?N:A.key),a=l(A,a,N),_===null?S=A:_.sibling=A,_=A);return e&&D.forEach(function(yn){return t(d,yn)}),K&&en(d,N),S}function k(d,a,p,y){if(typeof p=="object"&&p!==null&&p.type===Dn&&p.key===null&&(p=p.props.children),typeof p=="object"&&p!==null){switch(p.$$typeof){case ko:e:{for(var S=p.key,_=a;_!==null;){if(_.key===S){if(S=p.type,S===Dn){if(_.tag===7){n(d,_.sibling),a=o(_,p.props.children),a.return=d,d=a;break e}}else if(_.elementType===S||typeof S=="object"&&S!==null&&S.$$typeof===Tt&&Wa(S)===_.type){n(d,_.sibling),a=o(_,p.props),a.ref=yr(d,_,p),a.return=d,d=a;break e}n(d,_);break}else t(d,_);_=_.sibling}p.type===Dn?(a=sn(p.props.children,d.mode,y,p.key),a.return=d,d=a):(y=Zo(p.type,p.key,p.props,null,d.mode,y),y.ref=yr(d,a,p),y.return=d,d=y)}return i(d);case Sn:e:{for(_=p.key;a!==null;){if(a.key===_)if(a.tag===4&&a.stateNode.containerInfo===p.containerInfo&&a.stateNode.implementation===p.implementation){n(d,a.sibling),a=o(a,p.children||[]),a.return=d,d=a;break e}else{n(d,a);break}else t(d,a);a=a.sibling}a=Bi(p,d.mode,y),a.return=d,d=a}return i(d);case Tt:return _=p._init,k(d,a,_(p._payload),y)}if(xr(p))return w(d,a,p,y);if(hr(p))return v(d,a,p,y);$o(d,p)}return typeof p=="string"&&p!==""||typeof p=="number"?(p=""+p,a!==null&&a.tag===6?(n(d,a.sibling),a=o(a,p),a.return=d,d=a):(n(d,a),a=Oi(p,d.mode,y),a.return=d,d=a),i(d)):n(d,a)}return k}var Qn=md(!0),gd=md(!1),cl=Kt(null),dl=null,zn=null,Xs=null;function Js(){Xs=zn=dl=null}function qs(e){var t=cl.current;Q(cl),e._currentValue=t}function ms(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function Un(e,t){dl=e,Xs=zn=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&t)!==0&&(xe=!0),e.firstContext=null)}function Qe(e){var t=e._currentValue;if(Xs!==e)if(e={context:e,memoizedValue:t,next:null},zn===null){if(dl===null)throw Error(C(308));zn=e,dl.dependencies={lanes:0,firstContext:e}}else zn=zn.next=e;return t}var rn=null;function eu(e){rn===null?rn=[e]:rn.push(e)}function vd(e,t,n,r){var o=t.interleaved;return o===null?(n.next=n,eu(t)):(n.next=o.next,o.next=n),t.interleaved=n,wt(e,r)}function wt(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var Rt=!1;function tu(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function yd(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function gt(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function jt(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,(L&2)!==0){var o=r.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),r.pending=t,wt(e,n)}return o=r.interleaved,o===null?(t.next=t,eu(r)):(t.next=o.next,o.next=t),r.interleaved=t,wt(e,n)}function Vo(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,js(e,n)}}function Qa(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var o=null,l=null;if(n=n.firstBaseUpdate,n!==null){do{var i={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};l===null?o=l=i:l=l.next=i,n=n.next}while(n!==null);l===null?o=l=t:l=l.next=t}else o=l=t;n={baseState:r.baseState,firstBaseUpdate:o,lastBaseUpdate:l,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function fl(e,t,n,r){var o=e.updateQueue;Rt=!1;var l=o.firstBaseUpdate,i=o.lastBaseUpdate,s=o.shared.pending;if(s!==null){o.shared.pending=null;var u=s,c=u.next;u.next=null,i===null?l=c:i.next=c,i=u;var h=e.alternate;h!==null&&(h=h.updateQueue,s=h.lastBaseUpdate,s!==i&&(s===null?h.firstBaseUpdate=c:s.next=c,h.lastBaseUpdate=u))}if(l!==null){var g=o.baseState;i=0,h=c=u=null,s=l;do{var f=s.lane,m=s.eventTime;if((r&f)===f){h!==null&&(h=h.next={eventTime:m,lane:0,tag:s.tag,payload:s.payload,callback:s.callback,next:null});e:{var w=e,v=s;switch(f=t,m=n,v.tag){case 1:if(w=v.payload,typeof w=="function"){g=w.call(m,g,f);break e}g=w;break e;case 3:w.flags=w.flags&-65537|128;case 0:if(w=v.payload,f=typeof w=="function"?w.call(m,g,f):w,f==null)break e;g=J({},g,f);break e;case 2:Rt=!0}}s.callback!==null&&s.lane!==0&&(e.flags|=64,f=o.effects,f===null?o.effects=[s]:f.push(s))}else m={eventTime:m,lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},h===null?(c=h=m,u=g):h=h.next=m,i|=f;if(s=s.next,s===null){if(s=o.shared.pending,s===null)break;f=s,s=f.next,f.next=null,o.lastBaseUpdate=f,o.shared.pending=null}}while(!0);if(h===null&&(u=g),o.baseState=u,o.firstBaseUpdate=c,o.lastBaseUpdate=h,t=o.shared.interleaved,t!==null){o=t;do i|=o.lane,o=o.next;while(o!==t)}else l===null&&(o.shared.lanes=0);dn|=i,e.lanes=i,e.memoizedState=g}}function Ka(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],o=r.callback;if(o!==null){if(r.callback=null,r=n,typeof o!="function")throw Error(C(191,o));o.call(r)}}}var to={},at=Kt(to),Qr=Kt(to),Kr=Kt(to);function on(e){if(e===to)throw Error(C(174));return e}function nu(e,t){switch(H(Kr,t),H(Qr,e),H(at,to),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:Yi(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=Yi(t,e)}Q(at),H(at,t)}function Kn(){Q(at),Q(Qr),Q(Kr)}function wd(e){on(Kr.current);var t=on(at.current),n=Yi(t,e.type);t!==n&&(H(Qr,e),H(at,n))}function ru(e){Qr.current===e&&(Q(at),Q(Qr))}var Z=Kt(0);function pl(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Mi=[];function ou(){for(var e=0;e<Mi.length;e++)Mi[e]._workInProgressVersionPrimary=null;Mi.length=0}var Wo=_t.ReactCurrentDispatcher,Ai=_t.ReactCurrentBatchConfig,cn=0,X=null,re=null,ue=null,hl=!1,Rr=!1,Gr=0,Dm=0;function he(){throw Error(C(321))}function lu(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!nt(e[n],t[n]))return!1;return!0}function iu(e,t,n,r,o,l){if(cn=l,X=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Wo.current=e===null||e.memoizedState===null?Tm:Rm,e=n(r,o),Rr){l=0;do{if(Rr=!1,Gr=0,25<=l)throw Error(C(301));l+=1,ue=re=null,t.updateQueue=null,Wo.current=Mm,e=n(r,o)}while(Rr)}if(Wo.current=ml,t=re!==null&&re.next!==null,cn=0,ue=re=X=null,hl=!1,t)throw Error(C(300));return e}function su(){var e=Gr!==0;return Gr=0,e}function it(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ue===null?X.memoizedState=ue=e:ue=ue.next=e,ue}function Ke(){if(re===null){var e=X.alternate;e=e!==null?e.memoizedState:null}else e=re.next;var t=ue===null?X.memoizedState:ue.next;if(t!==null)ue=t,re=e;else{if(e===null)throw Error(C(310));re=e,e={memoizedState:re.memoizedState,baseState:re.baseState,baseQueue:re.baseQueue,queue:re.queue,next:null},ue===null?X.memoizedState=ue=e:ue=ue.next=e}return ue}function Yr(e,t){return typeof t=="function"?t(e):t}function zi(e){var t=Ke(),n=t.queue;if(n===null)throw Error(C(311));n.lastRenderedReducer=e;var r=re,o=r.baseQueue,l=n.pending;if(l!==null){if(o!==null){var i=o.next;o.next=l.next,l.next=i}r.baseQueue=o=l,n.pending=null}if(o!==null){l=o.next,r=r.baseState;var s=i=null,u=null,c=l;do{var h=c.lane;if((cn&h)===h)u!==null&&(u=u.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),r=c.hasEagerState?c.eagerState:e(r,c.action);else{var g={lane:h,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};u===null?(s=u=g,i=r):u=u.next=g,X.lanes|=h,dn|=h}c=c.next}while(c!==null&&c!==l);u===null?i=r:u.next=s,nt(r,t.memoizedState)||(xe=!0),t.memoizedState=r,t.baseState=i,t.baseQueue=u,n.lastRenderedState=r}if(e=n.interleaved,e!==null){o=e;do l=o.lane,X.lanes|=l,dn|=l,o=o.next;while(o!==e)}else o===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function Li(e){var t=Ke(),n=t.queue;if(n===null)throw Error(C(311));n.lastRenderedReducer=e;var r=n.dispatch,o=n.pending,l=t.memoizedState;if(o!==null){n.pending=null;var i=o=o.next;do l=e(l,i.action),i=i.next;while(i!==o);nt(l,t.memoizedState)||(xe=!0),t.memoizedState=l,t.baseQueue===null&&(t.baseState=l),n.lastRenderedState=l}return[l,r]}function Cd(){}function _d(e,t){var n=X,r=Ke(),o=t(),l=!nt(r.memoizedState,o);if(l&&(r.memoizedState=o,xe=!0),r=r.queue,uu(Ed.bind(null,n,r,e),[e]),r.getSnapshot!==t||l||ue!==null&&ue.memoizedState.tag&1){if(n.flags|=2048,Zr(9,xd.bind(null,n,r,o,t),void 0,null),ae===null)throw Error(C(349));(cn&30)!==0||kd(n,t,o)}return o}function kd(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=X.updateQueue,t===null?(t={lastEffect:null,stores:null},X.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function xd(e,t,n,r){t.value=n,t.getSnapshot=r,Sd(t)&&Dd(e)}function Ed(e,t,n){return n(function(){Sd(t)&&Dd(e)})}function Sd(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!nt(e,n)}catch{return!0}}function Dd(e){var t=wt(e,1);t!==null&&tt(t,e,1,-1)}function Ga(e){var t=it();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Yr,lastRenderedState:e},t.queue=e,e=e.dispatch=Nm.bind(null,X,e),[t.memoizedState,e]}function Zr(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=X.updateQueue,t===null?(t={lastEffect:null,stores:null},X.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function Fd(){return Ke().memoizedState}function Qo(e,t,n,r){var o=it();X.flags|=e,o.memoizedState=Zr(1|t,n,void 0,r===void 0?null:r)}function Fl(e,t,n,r){var o=Ke();r=r===void 0?null:r;var l=void 0;if(re!==null){var i=re.memoizedState;if(l=i.destroy,r!==null&&lu(r,i.deps)){o.memoizedState=Zr(t,n,l,r);return}}X.flags|=e,o.memoizedState=Zr(1|t,n,l,r)}function Ya(e,t){return Qo(8390656,8,e,t)}function uu(e,t){return Fl(2048,8,e,t)}function Pd(e,t){return Fl(4,2,e,t)}function Nd(e,t){return Fl(4,4,e,t)}function Td(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Rd(e,t,n){return n=n!=null?n.concat([e]):null,Fl(4,4,Td.bind(null,t,e),n)}function au(){}function Md(e,t){var n=Ke();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&lu(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Ad(e,t){var n=Ke();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&lu(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function zd(e,t,n){return(cn&21)===0?(e.baseState&&(e.baseState=!1,xe=!0),e.memoizedState=n):(nt(n,t)||(n=Bc(),X.lanes|=n,dn|=n,e.baseState=!0),t)}function Fm(e,t){var n=O;O=n!==0&&4>n?n:4,e(!0);var r=Ai.transition;Ai.transition={};try{e(!1),t()}finally{O=n,Ai.transition=r}}function Ld(){return Ke().memoizedState}function Pm(e,t,n){var r=Ht(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},Id(e))$d(t,n);else if(n=vd(e,t,n,r),n!==null){var o=Ce();tt(n,e,r,o),Od(n,t,r)}}function Nm(e,t,n){var r=Ht(e),o={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(Id(e))$d(t,o);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=t.lastRenderedReducer,l!==null))try{var i=t.lastRenderedState,s=l(i,n);if(o.hasEagerState=!0,o.eagerState=s,nt(s,i)){var u=t.interleaved;u===null?(o.next=o,eu(t)):(o.next=u.next,u.next=o),t.interleaved=o;return}}catch{}finally{}n=vd(e,t,o,r),n!==null&&(o=Ce(),tt(n,e,r,o),Od(n,t,r))}}function Id(e){var t=e.alternate;return e===X||t!==null&&t===X}function $d(e,t){Rr=hl=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Od(e,t,n){if((n&4194240)!==0){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,js(e,n)}}var ml={readContext:Qe,useCallback:he,useContext:he,useEffect:he,useImperativeHandle:he,useInsertionEffect:he,useLayoutEffect:he,useMemo:he,useReducer:he,useRef:he,useState:he,useDebugValue:he,useDeferredValue:he,useTransition:he,useMutableSource:he,useSyncExternalStore:he,useId:he,unstable_isNewReconciler:!1},Tm={readContext:Qe,useCallback:function(e,t){return it().memoizedState=[e,t===void 0?null:t],e},useContext:Qe,useEffect:Ya,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Qo(4194308,4,Td.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Qo(4194308,4,e,t)},useInsertionEffect:function(e,t){return Qo(4,2,e,t)},useMemo:function(e,t){var n=it();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=it();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=Pm.bind(null,X,e),[r.memoizedState,e]},useRef:function(e){var t=it();return e={current:e},t.memoizedState=e},useState:Ga,useDebugValue:au,useDeferredValue:function(e){return it().memoizedState=e},useTransition:function(){var e=Ga(!1),t=e[0];return e=Fm.bind(null,e[1]),it().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=X,o=it();if(K){if(n===void 0)throw Error(C(407));n=n()}else{if(n=t(),ae===null)throw Error(C(349));(cn&30)!==0||kd(r,t,n)}o.memoizedState=n;var l={value:n,getSnapshot:t};return o.queue=l,Ya(Ed.bind(null,r,l,e),[e]),r.flags|=2048,Zr(9,xd.bind(null,r,l,n,t),void 0,null),n},useId:function(){var e=it(),t=ae.identifierPrefix;if(K){var n=mt,r=ht;n=(r&~(1<<32-et(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=Gr++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=Dm++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},Rm={readContext:Qe,useCallback:Md,useContext:Qe,useEffect:uu,useImperativeHandle:Rd,useInsertionEffect:Pd,useLayoutEffect:Nd,useMemo:Ad,useReducer:zi,useRef:Fd,useState:function(){return zi(Yr)},useDebugValue:au,useDeferredValue:function(e){var t=Ke();return zd(t,re.memoizedState,e)},useTransition:function(){var e=zi(Yr)[0],t=Ke().memoizedState;return[e,t]},useMutableSource:Cd,useSyncExternalStore:_d,useId:Ld,unstable_isNewReconciler:!1},Mm={readContext:Qe,useCallback:Md,useContext:Qe,useEffect:uu,useImperativeHandle:Rd,useInsertionEffect:Pd,useLayoutEffect:Nd,useMemo:Ad,useReducer:Li,useRef:Fd,useState:function(){return Li(Yr)},useDebugValue:au,useDeferredValue:function(e){var t=Ke();return re===null?t.memoizedState=e:zd(t,re.memoizedState,e)},useTransition:function(){var e=Li(Yr)[0],t=Ke().memoizedState;return[e,t]},useMutableSource:Cd,useSyncExternalStore:_d,useId:Ld,unstable_isNewReconciler:!1};function Xe(e,t){if(e&&e.defaultProps){t=J({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function gs(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:J({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Pl={isMounted:function(e){return(e=e._reactInternals)?hn(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=Ce(),o=Ht(e),l=gt(r,o);l.payload=t,n!=null&&(l.callback=n),t=jt(e,l,o),t!==null&&(tt(t,e,o,r),Vo(t,e,o))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=Ce(),o=Ht(e),l=gt(r,o);l.tag=1,l.payload=t,n!=null&&(l.callback=n),t=jt(e,l,o),t!==null&&(tt(t,e,o,r),Vo(t,e,o))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=Ce(),r=Ht(e),o=gt(n,r);o.tag=2,t!=null&&(o.callback=t),t=jt(e,o,r),t!==null&&(tt(t,e,r,n),Vo(t,e,r))}};function Za(e,t,n,r,o,l,i){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,l,i):t.prototype&&t.prototype.isPureReactComponent?!Hr(n,r)||!Hr(o,l):!0}function Bd(e,t,n){var r=!1,o=Wt,l=t.contextType;return typeof l=="object"&&l!==null?l=Qe(l):(o=Se(t)?un:ve.current,r=t.contextTypes,l=(r=r!=null)?Vn(e,o):Wt),t=new t(n,l),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Pl,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=o,e.__reactInternalMemoizedMaskedChildContext=l),t}function Xa(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Pl.enqueueReplaceState(t,t.state,null)}function vs(e,t,n,r){var o=e.stateNode;o.props=n,o.state=e.memoizedState,o.refs={},tu(e);var l=t.contextType;typeof l=="object"&&l!==null?o.context=Qe(l):(l=Se(t)?un:ve.current,o.context=Vn(e,l)),o.state=e.memoizedState,l=t.getDerivedStateFromProps,typeof l=="function"&&(gs(e,t,l,n),o.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof o.getSnapshotBeforeUpdate=="function"||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(t=o.state,typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount(),t!==o.state&&Pl.enqueueReplaceState(o,o.state,null),fl(e,n,o,r),o.state=e.memoizedState),typeof o.componentDidMount=="function"&&(e.flags|=4194308)}function Gn(e,t){try{var n="",r=t;do n+=uh(r),r=r.return;while(r);var o=n}catch(l){o=`
Error generating stack: `+l.message+`
`+l.stack}return{value:e,source:t,stack:o,digest:null}}function Ii(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function ys(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var Am=typeof WeakMap=="function"?WeakMap:Map;function jd(e,t,n){n=gt(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){vl||(vl=!0,Ps=r),ys(e,t)},n}function Ud(e,t,n){n=gt(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var o=t.value;n.payload=function(){return r(o)},n.callback=function(){ys(e,t)}}var l=e.stateNode;return l!==null&&typeof l.componentDidCatch=="function"&&(n.callback=function(){ys(e,t),typeof r!="function"&&(Ut===null?Ut=new Set([this]):Ut.add(this));var i=t.stack;this.componentDidCatch(t.value,{componentStack:i!==null?i:""})}),n}function Ja(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Am;var o=new Set;r.set(t,o)}else o=r.get(t),o===void 0&&(o=new Set,r.set(t,o));o.has(n)||(o.add(n),e=Km.bind(null,e,t,n),t.then(e,e))}function qa(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function ec(e,t,n,r,o){return(e.mode&1)===0?(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=gt(-1,1),t.tag=2,jt(n,t,1))),n.lanes|=1),e):(e.flags|=65536,e.lanes=o,e)}var zm=_t.ReactCurrentOwner,xe=!1;function we(e,t,n,r){t.child=e===null?gd(t,null,n,r):Qn(t,e.child,n,r)}function tc(e,t,n,r,o){n=n.render;var l=t.ref;return Un(t,o),r=iu(e,t,n,r,l,o),n=su(),e!==null&&!xe?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~o,Ct(e,t,o)):(K&&n&&Gs(t),t.flags|=1,we(e,t,r,o),t.child)}function nc(e,t,n,r,o){if(e===null){var l=n.type;return typeof l=="function"&&!vu(l)&&l.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=l,Hd(e,t,l,r,o)):(e=Zo(n.type,null,r,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(l=e.child,(e.lanes&o)===0){var i=l.memoizedProps;if(n=n.compare,n=n!==null?n:Hr,n(i,r)&&e.ref===t.ref)return Ct(e,t,o)}return t.flags|=1,e=bt(l,r),e.ref=t.ref,e.return=t,t.child=e}function Hd(e,t,n,r,o){if(e!==null){var l=e.memoizedProps;if(Hr(l,r)&&e.ref===t.ref)if(xe=!1,t.pendingProps=r=l,(e.lanes&o)!==0)(e.flags&131072)!==0&&(xe=!0);else return t.lanes=e.lanes,Ct(e,t,o)}return ws(e,t,n,r,o)}function bd(e,t,n){var r=t.pendingProps,o=r.children,l=e!==null?e.memoizedState:null;if(r.mode==="hidden")if((t.mode&1)===0)t.memoizedState={baseLanes:0,cachePool:null,transitions:null},H(In,Te),Te|=n;else{if((n&1073741824)===0)return e=l!==null?l.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,H(In,Te),Te|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=l!==null?l.baseLanes:n,H(In,Te),Te|=r}else l!==null?(r=l.baseLanes|n,t.memoizedState=null):r=n,H(In,Te),Te|=r;return we(e,t,o,n),t.child}function Vd(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function ws(e,t,n,r,o){var l=Se(n)?un:ve.current;return l=Vn(t,l),Un(t,o),n=iu(e,t,n,r,l,o),r=su(),e!==null&&!xe?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~o,Ct(e,t,o)):(K&&r&&Gs(t),t.flags|=1,we(e,t,n,o),t.child)}function rc(e,t,n,r,o){if(Se(n)){var l=!0;sl(t)}else l=!1;if(Un(t,o),t.stateNode===null)Ko(e,t),Bd(t,n,r),vs(t,n,r,o),r=!0;else if(e===null){var i=t.stateNode,s=t.memoizedProps;i.props=s;var u=i.context,c=n.contextType;typeof c=="object"&&c!==null?c=Qe(c):(c=Se(n)?un:ve.current,c=Vn(t,c));var h=n.getDerivedStateFromProps,g=typeof h=="function"||typeof i.getSnapshotBeforeUpdate=="function";g||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(s!==r||u!==c)&&Xa(t,i,r,c),Rt=!1;var f=t.memoizedState;i.state=f,fl(t,r,i,o),u=t.memoizedState,s!==r||f!==u||Ee.current||Rt?(typeof h=="function"&&(gs(t,n,h,r),u=t.memoizedState),(s=Rt||Za(t,n,s,r,f,u,c))?(g||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(t.flags|=4194308)):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=u),i.props=r,i.state=u,i.context=c,r=s):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{i=t.stateNode,yd(e,t),s=t.memoizedProps,c=t.type===t.elementType?s:Xe(t.type,s),i.props=c,g=t.pendingProps,f=i.context,u=n.contextType,typeof u=="object"&&u!==null?u=Qe(u):(u=Se(n)?un:ve.current,u=Vn(t,u));var m=n.getDerivedStateFromProps;(h=typeof m=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(s!==g||f!==u)&&Xa(t,i,r,u),Rt=!1,f=t.memoizedState,i.state=f,fl(t,r,i,o);var w=t.memoizedState;s!==g||f!==w||Ee.current||Rt?(typeof m=="function"&&(gs(t,n,m,r),w=t.memoizedState),(c=Rt||Za(t,n,c,r,f,w,u)||!1)?(h||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(r,w,u),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(r,w,u)),typeof i.componentDidUpdate=="function"&&(t.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof i.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=w),i.props=r,i.state=w,i.context=u,r=c):(typeof i.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return Cs(e,t,n,r,l,o)}function Cs(e,t,n,r,o,l){Vd(e,t);var i=(t.flags&128)!==0;if(!r&&!i)return o&&Ha(t,n,!1),Ct(e,t,l);r=t.stateNode,zm.current=t;var s=i&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&i?(t.child=Qn(t,e.child,null,l),t.child=Qn(t,null,s,l)):we(e,t,s,l),t.memoizedState=r.state,o&&Ha(t,n,!0),t.child}function Wd(e){var t=e.stateNode;t.pendingContext?Ua(e,t.pendingContext,t.pendingContext!==t.context):t.context&&Ua(e,t.context,!1),nu(e,t.containerInfo)}function oc(e,t,n,r,o){return Wn(),Zs(o),t.flags|=256,we(e,t,n,r),t.child}var _s={dehydrated:null,treeContext:null,retryLane:0};function ks(e){return{baseLanes:e,cachePool:null,transitions:null}}function Qd(e,t,n){var r=t.pendingProps,o=Z.current,l=!1,i=(t.flags&128)!==0,s;if((s=i)||(s=e!==null&&e.memoizedState===null?!1:(o&2)!==0),s?(l=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(o|=1),H(Z,o&1),e===null)return hs(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?((t.mode&1)===0?t.lanes=1:e.data==="$!"?t.lanes=8:t.lanes=1073741824,null):(i=r.children,e=r.fallback,l?(r=t.mode,l=t.child,i={mode:"hidden",children:i},(r&1)===0&&l!==null?(l.childLanes=0,l.pendingProps=i):l=Rl(i,r,0,null),e=sn(e,r,n,null),l.return=t,e.return=t,l.sibling=e,t.child=l,t.child.memoizedState=ks(n),t.memoizedState=_s,e):cu(t,i));if(o=e.memoizedState,o!==null&&(s=o.dehydrated,s!==null))return Lm(e,t,i,r,s,o,n);if(l){l=r.fallback,i=t.mode,o=e.child,s=o.sibling;var u={mode:"hidden",children:r.children};return(i&1)===0&&t.child!==o?(r=t.child,r.childLanes=0,r.pendingProps=u,t.deletions=null):(r=bt(o,u),r.subtreeFlags=o.subtreeFlags&14680064),s!==null?l=bt(s,l):(l=sn(l,i,n,null),l.flags|=2),l.return=t,r.return=t,r.sibling=l,t.child=r,r=l,l=t.child,i=e.child.memoizedState,i=i===null?ks(n):{baseLanes:i.baseLanes|n,cachePool:null,transitions:i.transitions},l.memoizedState=i,l.childLanes=e.childLanes&~n,t.memoizedState=_s,r}return l=e.child,e=l.sibling,r=bt(l,{mode:"visible",children:r.children}),(t.mode&1)===0&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function cu(e,t){return t=Rl({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Oo(e,t,n,r){return r!==null&&Zs(r),Qn(t,e.child,null,n),e=cu(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Lm(e,t,n,r,o,l,i){if(n)return t.flags&256?(t.flags&=-257,r=Ii(Error(C(422))),Oo(e,t,i,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(l=r.fallback,o=t.mode,r=Rl({mode:"visible",children:r.children},o,0,null),l=sn(l,o,i,null),l.flags|=2,r.return=t,l.return=t,r.sibling=l,t.child=r,(t.mode&1)!==0&&Qn(t,e.child,null,i),t.child.memoizedState=ks(i),t.memoizedState=_s,l);if((t.mode&1)===0)return Oo(e,t,i,null);if(o.data==="$!"){if(r=o.nextSibling&&o.nextSibling.dataset,r)var s=r.dgst;return r=s,l=Error(C(419)),r=Ii(l,r,void 0),Oo(e,t,i,r)}if(s=(i&e.childLanes)!==0,xe||s){if(r=ae,r!==null){switch(i&-i){case 4:o=2;break;case 16:o=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:o=32;break;case 536870912:o=268435456;break;default:o=0}o=(o&(r.suspendedLanes|i))!==0?0:o,o!==0&&o!==l.retryLane&&(l.retryLane=o,wt(e,o),tt(r,e,o,-1))}return gu(),r=Ii(Error(C(421))),Oo(e,t,i,r)}return o.data==="$?"?(t.flags|=128,t.child=e.child,t=Gm.bind(null,e),o._reactRetry=t,null):(e=l.treeContext,Re=Bt(o.nextSibling),Me=t,K=!0,qe=null,e!==null&&(He[be++]=ht,He[be++]=mt,He[be++]=an,ht=e.id,mt=e.overflow,an=t),t=cu(t,r.children),t.flags|=4096,t)}function lc(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),ms(e.return,t,n)}function $i(e,t,n,r,o){var l=e.memoizedState;l===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:o}:(l.isBackwards=t,l.rendering=null,l.renderingStartTime=0,l.last=r,l.tail=n,l.tailMode=o)}function Kd(e,t,n){var r=t.pendingProps,o=r.revealOrder,l=r.tail;if(we(e,t,r.children,n),r=Z.current,(r&2)!==0)r=r&1|2,t.flags|=128;else{if(e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&lc(e,n,t);else if(e.tag===19)lc(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(H(Z,r),(t.mode&1)===0)t.memoizedState=null;else switch(o){case"forwards":for(n=t.child,o=null;n!==null;)e=n.alternate,e!==null&&pl(e)===null&&(o=n),n=n.sibling;n=o,n===null?(o=t.child,t.child=null):(o=n.sibling,n.sibling=null),$i(t,!1,o,n,l);break;case"backwards":for(n=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&pl(e)===null){t.child=o;break}e=o.sibling,o.sibling=n,n=o,o=e}$i(t,!0,n,null,l);break;case"together":$i(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Ko(e,t){(t.mode&1)===0&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function Ct(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),dn|=t.lanes,(n&t.childLanes)===0)return null;if(e!==null&&t.child!==e.child)throw Error(C(153));if(t.child!==null){for(e=t.child,n=bt(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=bt(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Im(e,t,n){switch(t.tag){case 3:Wd(t),Wn();break;case 5:wd(t);break;case 1:Se(t.type)&&sl(t);break;case 4:nu(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,o=t.memoizedProps.value;H(cl,r._currentValue),r._currentValue=o;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(H(Z,Z.current&1),t.flags|=128,null):(n&t.child.childLanes)!==0?Qd(e,t,n):(H(Z,Z.current&1),e=Ct(e,t,n),e!==null?e.sibling:null);H(Z,Z.current&1);break;case 19:if(r=(n&t.childLanes)!==0,(e.flags&128)!==0){if(r)return Kd(e,t,n);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),H(Z,Z.current),r)break;return null;case 22:case 23:return t.lanes=0,bd(e,t,n)}return Ct(e,t,n)}var Gd,xs,Yd,Zd;Gd=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};xs=function(){};Yd=function(e,t,n,r){var o=e.memoizedProps;if(o!==r){e=t.stateNode,on(at.current);var l=null;switch(n){case"input":o=Wi(e,o),r=Wi(e,r),l=[];break;case"select":o=J({},o,{value:void 0}),r=J({},r,{value:void 0}),l=[];break;case"textarea":o=Gi(e,o),r=Gi(e,r),l=[];break;default:typeof o.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=ll)}Zi(n,r);var i;n=null;for(c in o)if(!r.hasOwnProperty(c)&&o.hasOwnProperty(c)&&o[c]!=null)if(c==="style"){var s=o[c];for(i in s)s.hasOwnProperty(i)&&(n||(n={}),n[i]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(Lr.hasOwnProperty(c)?l||(l=[]):(l=l||[]).push(c,null));for(c in r){var u=r[c];if(s=o?.[c],r.hasOwnProperty(c)&&u!==s&&(u!=null||s!=null))if(c==="style")if(s){for(i in s)!s.hasOwnProperty(i)||u&&u.hasOwnProperty(i)||(n||(n={}),n[i]="");for(i in u)u.hasOwnProperty(i)&&s[i]!==u[i]&&(n||(n={}),n[i]=u[i])}else n||(l||(l=[]),l.push(c,n)),n=u;else c==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,s=s?s.__html:void 0,u!=null&&s!==u&&(l=l||[]).push(c,u)):c==="children"?typeof u!="string"&&typeof u!="number"||(l=l||[]).push(c,""+u):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(Lr.hasOwnProperty(c)?(u!=null&&c==="onScroll"&&W("scroll",e),l||s===u||(l=[])):(l=l||[]).push(c,u))}n&&(l=l||[]).push("style",n);var c=l;(t.updateQueue=c)&&(t.flags|=4)}};Zd=function(e,t,n,r){n!==r&&(t.flags|=4)};function wr(e,t){if(!K)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function me(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var o=e.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags&14680064,r|=o.flags&14680064,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags,r|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function $m(e,t,n){var r=t.pendingProps;switch(Ys(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return me(t),null;case 1:return Se(t.type)&&il(),me(t),null;case 3:return r=t.stateNode,Kn(),Q(Ee),Q(ve),ou(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(Io(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,qe!==null&&(Rs(qe),qe=null))),xs(e,t),me(t),null;case 5:ru(t);var o=on(Kr.current);if(n=t.type,e!==null&&t.stateNode!=null)Yd(e,t,n,r,o),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(C(166));return me(t),null}if(e=on(at.current),Io(t)){r=t.stateNode,n=t.type;var l=t.memoizedProps;switch(r[st]=t,r[Wr]=l,e=(t.mode&1)!==0,n){case"dialog":W("cancel",r),W("close",r);break;case"iframe":case"object":case"embed":W("load",r);break;case"video":case"audio":for(o=0;o<Sr.length;o++)W(Sr[o],r);break;case"source":W("error",r);break;case"img":case"image":case"link":W("error",r),W("load",r);break;case"details":W("toggle",r);break;case"input":pa(r,l),W("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!l.multiple},W("invalid",r);break;case"textarea":ma(r,l),W("invalid",r)}Zi(n,l),o=null;for(var i in l)if(l.hasOwnProperty(i)){var s=l[i];i==="children"?typeof s=="string"?r.textContent!==s&&(l.suppressHydrationWarning!==!0&&Lo(r.textContent,s,e),o=["children",s]):typeof s=="number"&&r.textContent!==""+s&&(l.suppressHydrationWarning!==!0&&Lo(r.textContent,s,e),o=["children",""+s]):Lr.hasOwnProperty(i)&&s!=null&&i==="onScroll"&&W("scroll",r)}switch(n){case"input":xo(r),ha(r,l,!0);break;case"textarea":xo(r),ga(r);break;case"select":case"option":break;default:typeof l.onClick=="function"&&(r.onclick=ll)}r=o,t.updateQueue=r,r!==null&&(t.flags|=4)}else{i=o.nodeType===9?o:o.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=Ec(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=i.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=i.createElement(n,{is:r.is}):(e=i.createElement(n),n==="select"&&(i=e,r.multiple?i.multiple=!0:r.size&&(i.size=r.size))):e=i.createElementNS(e,n),e[st]=t,e[Wr]=r,Gd(e,t,!1,!1),t.stateNode=e;e:{switch(i=Xi(n,r),n){case"dialog":W("cancel",e),W("close",e),o=r;break;case"iframe":case"object":case"embed":W("load",e),o=r;break;case"video":case"audio":for(o=0;o<Sr.length;o++)W(Sr[o],e);o=r;break;case"source":W("error",e),o=r;break;case"img":case"image":case"link":W("error",e),W("load",e),o=r;break;case"details":W("toggle",e),o=r;break;case"input":pa(e,r),o=Wi(e,r),W("invalid",e);break;case"option":o=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},o=J({},r,{value:void 0}),W("invalid",e);break;case"textarea":ma(e,r),o=Gi(e,r),W("invalid",e);break;default:o=r}Zi(n,o),s=o;for(l in s)if(s.hasOwnProperty(l)){var u=s[l];l==="style"?Fc(e,u):l==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,u!=null&&Sc(e,u)):l==="children"?typeof u=="string"?(n!=="textarea"||u!=="")&&Ir(e,u):typeof u=="number"&&Ir(e,""+u):l!=="suppressContentEditableWarning"&&l!=="suppressHydrationWarning"&&l!=="autoFocus"&&(Lr.hasOwnProperty(l)?u!=null&&l==="onScroll"&&W("scroll",e):u!=null&&zs(e,l,u,i))}switch(n){case"input":xo(e),ha(e,r,!1);break;case"textarea":xo(e),ga(e);break;case"option":r.value!=null&&e.setAttribute("value",""+Vt(r.value));break;case"select":e.multiple=!!r.multiple,l=r.value,l!=null?$n(e,!!r.multiple,l,!1):r.defaultValue!=null&&$n(e,!!r.multiple,r.defaultValue,!0);break;default:typeof o.onClick=="function"&&(e.onclick=ll)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return me(t),null;case 6:if(e&&t.stateNode!=null)Zd(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(C(166));if(n=on(Kr.current),on(at.current),Io(t)){if(r=t.stateNode,n=t.memoizedProps,r[st]=t,(l=r.nodeValue!==n)&&(e=Me,e!==null))switch(e.tag){case 3:Lo(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&Lo(r.nodeValue,n,(e.mode&1)!==0)}l&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[st]=t,t.stateNode=r}return me(t),null;case 13:if(Q(Z),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(K&&Re!==null&&(t.mode&1)!==0&&(t.flags&128)===0)hd(),Wn(),t.flags|=98560,l=!1;else if(l=Io(t),r!==null&&r.dehydrated!==null){if(e===null){if(!l)throw Error(C(318));if(l=t.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(C(317));l[st]=t}else Wn(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;me(t),l=!1}else qe!==null&&(Rs(qe),qe=null),l=!0;if(!l)return t.flags&65536?t:null}return(t.flags&128)!==0?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,(t.mode&1)!==0&&(e===null||(Z.current&1)!==0?oe===0&&(oe=3):gu())),t.updateQueue!==null&&(t.flags|=4),me(t),null);case 4:return Kn(),xs(e,t),e===null&&br(t.stateNode.containerInfo),me(t),null;case 10:return qs(t.type._context),me(t),null;case 17:return Se(t.type)&&il(),me(t),null;case 19:if(Q(Z),l=t.memoizedState,l===null)return me(t),null;if(r=(t.flags&128)!==0,i=l.rendering,i===null)if(r)wr(l,!1);else{if(oe!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(i=pl(e),i!==null){for(t.flags|=128,wr(l,!1),r=i.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)l=n,e=r,l.flags&=14680066,i=l.alternate,i===null?(l.childLanes=0,l.lanes=e,l.child=null,l.subtreeFlags=0,l.memoizedProps=null,l.memoizedState=null,l.updateQueue=null,l.dependencies=null,l.stateNode=null):(l.childLanes=i.childLanes,l.lanes=i.lanes,l.child=i.child,l.subtreeFlags=0,l.deletions=null,l.memoizedProps=i.memoizedProps,l.memoizedState=i.memoizedState,l.updateQueue=i.updateQueue,l.type=i.type,e=i.dependencies,l.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return H(Z,Z.current&1|2),t.child}e=e.sibling}l.tail!==null&&te()>Yn&&(t.flags|=128,r=!0,wr(l,!1),t.lanes=4194304)}else{if(!r)if(e=pl(i),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),wr(l,!0),l.tail===null&&l.tailMode==="hidden"&&!i.alternate&&!K)return me(t),null}else 2*te()-l.renderingStartTime>Yn&&n!==1073741824&&(t.flags|=128,r=!0,wr(l,!1),t.lanes=4194304);l.isBackwards?(i.sibling=t.child,t.child=i):(n=l.last,n!==null?n.sibling=i:t.child=i,l.last=i)}return l.tail!==null?(t=l.tail,l.rendering=t,l.tail=t.sibling,l.renderingStartTime=te(),t.sibling=null,n=Z.current,H(Z,r?n&1|2:n&1),t):(me(t),null);case 22:case 23:return mu(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&(t.mode&1)!==0?(Te&1073741824)!==0&&(me(t),t.subtreeFlags&6&&(t.flags|=8192)):me(t),null;case 24:return null;case 25:return null}throw Error(C(156,t.tag))}function Om(e,t){switch(Ys(t),t.tag){case 1:return Se(t.type)&&il(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Kn(),Q(Ee),Q(ve),ou(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 5:return ru(t),null;case 13:if(Q(Z),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(C(340));Wn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Q(Z),null;case 4:return Kn(),null;case 10:return qs(t.type._context),null;case 22:case 23:return mu(),null;case 24:return null;default:return null}}var Bo=!1,ge=!1,Bm=typeof WeakSet=="function"?WeakSet:Set,F=null;function Ln(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){ee(e,t,r)}else n.current=null}function Es(e,t,n){try{n()}catch(r){ee(e,t,r)}}var ic=!1;function jm(e,t){if(ss=nl,e=td(),Ks(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var o=r.anchorOffset,l=r.focusNode;r=r.focusOffset;try{n.nodeType,l.nodeType}catch{n=null;break e}var i=0,s=-1,u=-1,c=0,h=0,g=e,f=null;t:for(;;){for(var m;g!==n||o!==0&&g.nodeType!==3||(s=i+o),g!==l||r!==0&&g.nodeType!==3||(u=i+r),g.nodeType===3&&(i+=g.nodeValue.length),(m=g.firstChild)!==null;)f=g,g=m;for(;;){if(g===e)break t;if(f===n&&++c===o&&(s=i),f===l&&++h===r&&(u=i),(m=g.nextSibling)!==null)break;g=f,f=g.parentNode}g=m}n=s===-1||u===-1?null:{start:s,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(us={focusedElem:e,selectionRange:n},nl=!1,F=t;F!==null;)if(t=F,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,F=e;else for(;F!==null;){t=F;try{var w=t.alternate;if((t.flags&1024)!==0)switch(t.tag){case 0:case 11:case 15:break;case 1:if(w!==null){var v=w.memoizedProps,k=w.memoizedState,d=t.stateNode,a=d.getSnapshotBeforeUpdate(t.elementType===t.type?v:Xe(t.type,v),k);d.__reactInternalSnapshotBeforeUpdate=a}break;case 3:var p=t.stateNode.containerInfo;p.nodeType===1?p.textContent="":p.nodeType===9&&p.documentElement&&p.removeChild(p.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(C(163))}}catch(y){ee(t,t.return,y)}if(e=t.sibling,e!==null){e.return=t.return,F=e;break}F=t.return}return w=ic,ic=!1,w}function Mr(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var o=r=r.next;do{if((o.tag&e)===e){var l=o.destroy;o.destroy=void 0,l!==void 0&&Es(t,n,l)}o=o.next}while(o!==r)}}function Nl(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function Ss(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function Xd(e){var t=e.alternate;t!==null&&(e.alternate=null,Xd(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[st],delete t[Wr],delete t[ds],delete t[km],delete t[xm])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Jd(e){return e.tag===5||e.tag===3||e.tag===4}function sc(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Jd(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Ds(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=ll));else if(r!==4&&(e=e.child,e!==null))for(Ds(e,t,n),e=e.sibling;e!==null;)Ds(e,t,n),e=e.sibling}function Fs(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(Fs(e,t,n),e=e.sibling;e!==null;)Fs(e,t,n),e=e.sibling}var ce=null,Je=!1;function Nt(e,t,n){for(n=n.child;n!==null;)qd(e,t,n),n=n.sibling}function qd(e,t,n){if(ut&&typeof ut.onCommitFiberUnmount=="function")try{ut.onCommitFiberUnmount(_l,n)}catch{}switch(n.tag){case 5:ge||Ln(n,t);case 6:var r=ce,o=Je;ce=null,Nt(e,t,n),ce=r,Je=o,ce!==null&&(Je?(e=ce,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):ce.removeChild(n.stateNode));break;case 18:ce!==null&&(Je?(e=ce,n=n.stateNode,e.nodeType===8?Ti(e.parentNode,n):e.nodeType===1&&Ti(e,n),jr(e)):Ti(ce,n.stateNode));break;case 4:r=ce,o=Je,ce=n.stateNode.containerInfo,Je=!0,Nt(e,t,n),ce=r,Je=o;break;case 0:case 11:case 14:case 15:if(!ge&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){o=r=r.next;do{var l=o,i=l.destroy;l=l.tag,i!==void 0&&((l&2)!==0||(l&4)!==0)&&Es(n,t,i),o=o.next}while(o!==r)}Nt(e,t,n);break;case 1:if(!ge&&(Ln(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(s){ee(n,t,s)}Nt(e,t,n);break;case 21:Nt(e,t,n);break;case 22:n.mode&1?(ge=(r=ge)||n.memoizedState!==null,Nt(e,t,n),ge=r):Nt(e,t,n);break;default:Nt(e,t,n)}}function uc(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new Bm),t.forEach(function(r){var o=Ym.bind(null,e,r);n.has(r)||(n.add(r),r.then(o,o))})}}function Ze(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var o=n[r];try{var l=e,i=t,s=i;e:for(;s!==null;){switch(s.tag){case 5:ce=s.stateNode,Je=!1;break e;case 3:ce=s.stateNode.containerInfo,Je=!0;break e;case 4:ce=s.stateNode.containerInfo,Je=!0;break e}s=s.return}if(ce===null)throw Error(C(160));qd(l,i,o),ce=null,Je=!1;var u=o.alternate;u!==null&&(u.return=null),o.return=null}catch(c){ee(o,t,c)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)ef(t,e),t=t.sibling}function ef(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(Ze(t,e),lt(e),r&4){try{Mr(3,e,e.return),Nl(3,e)}catch(v){ee(e,e.return,v)}try{Mr(5,e,e.return)}catch(v){ee(e,e.return,v)}}break;case 1:Ze(t,e),lt(e),r&512&&n!==null&&Ln(n,n.return);break;case 5:if(Ze(t,e),lt(e),r&512&&n!==null&&Ln(n,n.return),e.flags&32){var o=e.stateNode;try{Ir(o,"")}catch(v){ee(e,e.return,v)}}if(r&4&&(o=e.stateNode,o!=null)){var l=e.memoizedProps,i=n!==null?n.memoizedProps:l,s=e.type,u=e.updateQueue;if(e.updateQueue=null,u!==null)try{s==="input"&&l.type==="radio"&&l.name!=null&&kc(o,l),Xi(s,i);var c=Xi(s,l);for(i=0;i<u.length;i+=2){var h=u[i],g=u[i+1];h==="style"?Fc(o,g):h==="dangerouslySetInnerHTML"?Sc(o,g):h==="children"?Ir(o,g):zs(o,h,g,c)}switch(s){case"input":Qi(o,l);break;case"textarea":xc(o,l);break;case"select":var f=o._wrapperState.wasMultiple;o._wrapperState.wasMultiple=!!l.multiple;var m=l.value;m!=null?$n(o,!!l.multiple,m,!1):f!==!!l.multiple&&(l.defaultValue!=null?$n(o,!!l.multiple,l.defaultValue,!0):$n(o,!!l.multiple,l.multiple?[]:"",!1))}o[Wr]=l}catch(v){ee(e,e.return,v)}}break;case 6:if(Ze(t,e),lt(e),r&4){if(e.stateNode===null)throw Error(C(162));o=e.stateNode,l=e.memoizedProps;try{o.nodeValue=l}catch(v){ee(e,e.return,v)}}break;case 3:if(Ze(t,e),lt(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{jr(t.containerInfo)}catch(v){ee(e,e.return,v)}break;case 4:Ze(t,e),lt(e);break;case 13:Ze(t,e),lt(e),o=e.child,o.flags&8192&&(l=o.memoizedState!==null,o.stateNode.isHidden=l,!l||o.alternate!==null&&o.alternate.memoizedState!==null||(pu=te())),r&4&&uc(e);break;case 22:if(h=n!==null&&n.memoizedState!==null,e.mode&1?(ge=(c=ge)||h,Ze(t,e),ge=c):Ze(t,e),lt(e),r&8192){if(c=e.memoizedState!==null,(e.stateNode.isHidden=c)&&!h&&(e.mode&1)!==0)for(F=e,h=e.child;h!==null;){for(g=F=h;F!==null;){switch(f=F,m=f.child,f.tag){case 0:case 11:case 14:case 15:Mr(4,f,f.return);break;case 1:Ln(f,f.return);var w=f.stateNode;if(typeof w.componentWillUnmount=="function"){r=f,n=f.return;try{t=r,w.props=t.memoizedProps,w.state=t.memoizedState,w.componentWillUnmount()}catch(v){ee(r,n,v)}}break;case 5:Ln(f,f.return);break;case 22:if(f.memoizedState!==null){cc(g);continue}}m!==null?(m.return=f,F=m):cc(g)}h=h.sibling}e:for(h=null,g=e;;){if(g.tag===5){if(h===null){h=g;try{o=g.stateNode,c?(l=o.style,typeof l.setProperty=="function"?l.setProperty("display","none","important"):l.display="none"):(s=g.stateNode,u=g.memoizedProps.style,i=u!=null&&u.hasOwnProperty("display")?u.display:null,s.style.display=Dc("display",i))}catch(v){ee(e,e.return,v)}}}else if(g.tag===6){if(h===null)try{g.stateNode.nodeValue=c?"":g.memoizedProps}catch(v){ee(e,e.return,v)}}else if((g.tag!==22&&g.tag!==23||g.memoizedState===null||g===e)&&g.child!==null){g.child.return=g,g=g.child;continue}if(g===e)break e;for(;g.sibling===null;){if(g.return===null||g.return===e)break e;h===g&&(h=null),g=g.return}h===g&&(h=null),g.sibling.return=g.return,g=g.sibling}}break;case 19:Ze(t,e),lt(e),r&4&&uc(e);break;case 21:break;default:Ze(t,e),lt(e)}}function lt(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(Jd(n)){var r=n;break e}n=n.return}throw Error(C(160))}switch(r.tag){case 5:var o=r.stateNode;r.flags&32&&(Ir(o,""),r.flags&=-33);var l=sc(e);Fs(e,l,o);break;case 3:case 4:var i=r.stateNode.containerInfo,s=sc(e);Ds(e,s,i);break;default:throw Error(C(161))}}catch(u){ee(e,e.return,u)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Um(e,t,n){F=e,tf(e,t,n)}function tf(e,t,n){for(var r=(e.mode&1)!==0;F!==null;){var o=F,l=o.child;if(o.tag===22&&r){var i=o.memoizedState!==null||Bo;if(!i){var s=o.alternate,u=s!==null&&s.memoizedState!==null||ge;s=Bo;var c=ge;if(Bo=i,(ge=u)&&!c)for(F=o;F!==null;)i=F,u=i.child,i.tag===22&&i.memoizedState!==null?dc(o):u!==null?(u.return=i,F=u):dc(o);for(;l!==null;)F=l,tf(l,t,n),l=l.sibling;F=o,Bo=s,ge=c}ac(e,t,n)}else(o.subtreeFlags&8772)!==0&&l!==null?(l.return=o,F=l):ac(e,t,n)}}function ac(e){for(;F!==null;){var t=F;if((t.flags&8772)!==0){var n=t.alternate;try{if((t.flags&8772)!==0)switch(t.tag){case 0:case 11:case 15:ge||Nl(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!ge)if(n===null)r.componentDidMount();else{var o=t.elementType===t.type?n.memoizedProps:Xe(t.type,n.memoizedProps);r.componentDidUpdate(o,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var l=t.updateQueue;l!==null&&Ka(t,l,r);break;case 3:var i=t.updateQueue;if(i!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}Ka(t,i,n)}break;case 5:var s=t.stateNode;if(n===null&&t.flags&4){n=s;var u=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":u.autoFocus&&n.focus();break;case"img":u.src&&(n.src=u.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var c=t.alternate;if(c!==null){var h=c.memoizedState;if(h!==null){var g=h.dehydrated;g!==null&&jr(g)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(C(163))}ge||t.flags&512&&Ss(t)}catch(f){ee(t,t.return,f)}}if(t===e){F=null;break}if(n=t.sibling,n!==null){n.return=t.return,F=n;break}F=t.return}}function cc(e){for(;F!==null;){var t=F;if(t===e){F=null;break}var n=t.sibling;if(n!==null){n.return=t.return,F=n;break}F=t.return}}function dc(e){for(;F!==null;){var t=F;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{Nl(4,t)}catch(u){ee(t,n,u)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var o=t.return;try{r.componentDidMount()}catch(u){ee(t,o,u)}}var l=t.return;try{Ss(t)}catch(u){ee(t,l,u)}break;case 5:var i=t.return;try{Ss(t)}catch(u){ee(t,i,u)}}}catch(u){ee(t,t.return,u)}if(t===e){F=null;break}var s=t.sibling;if(s!==null){s.return=t.return,F=s;break}F=t.return}}var Hm=Math.ceil,gl=_t.ReactCurrentDispatcher,du=_t.ReactCurrentOwner,We=_t.ReactCurrentBatchConfig,L=0,ae=null,ne=null,de=0,Te=0,In=Kt(0),oe=0,Xr=null,dn=0,Tl=0,fu=0,Ar=null,ke=null,pu=0,Yn=1/0,ft=null,vl=!1,Ps=null,Ut=null,jo=!1,Lt=null,yl=0,zr=0,Ns=null,Go=-1,Yo=0;function Ce(){return(L&6)!==0?te():Go!==-1?Go:Go=te()}function Ht(e){return(e.mode&1)===0?1:(L&2)!==0&&de!==0?de&-de:Sm.transition!==null?(Yo===0&&(Yo=Bc()),Yo):(e=O,e!==0||(e=window.event,e=e===void 0?16:Qc(e.type)),e)}function tt(e,t,n,r){if(50<zr)throw zr=0,Ns=null,Error(C(185));Jr(e,n,r),((L&2)===0||e!==ae)&&(e===ae&&((L&2)===0&&(Tl|=n),oe===4&&At(e,de)),De(e,r),n===1&&L===0&&(t.mode&1)===0&&(Yn=te()+500,Dl&&Gt()))}function De(e,t){var n=e.callbackNode;Fh(e,t);var r=tl(e,e===ae?de:0);if(r===0)n!==null&&wa(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&wa(n),t===1)e.tag===0?Em(fc.bind(null,e)):dd(fc.bind(null,e)),Cm(function(){(L&6)===0&&Gt()}),n=null;else{switch(jc(r)){case 1:n=Bs;break;case 4:n=$c;break;case 16:n=el;break;case 536870912:n=Oc;break;default:n=el}n=cf(n,nf.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function nf(e,t){if(Go=-1,Yo=0,(L&6)!==0)throw Error(C(327));var n=e.callbackNode;if(Hn()&&e.callbackNode!==n)return null;var r=tl(e,e===ae?de:0);if(r===0)return null;if((r&30)!==0||(r&e.expiredLanes)!==0||t)t=wl(e,r);else{t=r;var o=L;L|=2;var l=of();(ae!==e||de!==t)&&(ft=null,Yn=te()+500,ln(e,t));do try{Wm();break}catch(s){rf(e,s)}while(!0);Js(),gl.current=l,L=o,ne!==null?t=0:(ae=null,de=0,t=oe)}if(t!==0){if(t===2&&(o=ns(e),o!==0&&(r=o,t=Ts(e,o))),t===1)throw n=Xr,ln(e,0),At(e,r),De(e,te()),n;if(t===6)At(e,r);else{if(o=e.current.alternate,(r&30)===0&&!bm(o)&&(t=wl(e,r),t===2&&(l=ns(e),l!==0&&(r=l,t=Ts(e,l))),t===1))throw n=Xr,ln(e,0),At(e,r),De(e,te()),n;switch(e.finishedWork=o,e.finishedLanes=r,t){case 0:case 1:throw Error(C(345));case 2:tn(e,ke,ft);break;case 3:if(At(e,r),(r&130023424)===r&&(t=pu+500-te(),10<t)){if(tl(e,0)!==0)break;if(o=e.suspendedLanes,(o&r)!==r){Ce(),e.pingedLanes|=e.suspendedLanes&o;break}e.timeoutHandle=cs(tn.bind(null,e,ke,ft),t);break}tn(e,ke,ft);break;case 4:if(At(e,r),(r&4194240)===r)break;for(t=e.eventTimes,o=-1;0<r;){var i=31-et(r);l=1<<i,i=t[i],i>o&&(o=i),r&=~l}if(r=o,r=te()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*Hm(r/1960))-r,10<r){e.timeoutHandle=cs(tn.bind(null,e,ke,ft),r);break}tn(e,ke,ft);break;case 5:tn(e,ke,ft);break;default:throw Error(C(329))}}}return De(e,te()),e.callbackNode===n?nf.bind(null,e):null}function Ts(e,t){var n=Ar;return e.current.memoizedState.isDehydrated&&(ln(e,t).flags|=256),e=wl(e,t),e!==2&&(t=ke,ke=n,t!==null&&Rs(t)),e}function Rs(e){ke===null?ke=e:ke.push.apply(ke,e)}function bm(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var o=n[r],l=o.getSnapshot;o=o.value;try{if(!nt(l(),o))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function At(e,t){for(t&=~fu,t&=~Tl,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-et(t),r=1<<n;e[n]=-1,t&=~r}}function fc(e){if((L&6)!==0)throw Error(C(327));Hn();var t=tl(e,0);if((t&1)===0)return De(e,te()),null;var n=wl(e,t);if(e.tag!==0&&n===2){var r=ns(e);r!==0&&(t=r,n=Ts(e,r))}if(n===1)throw n=Xr,ln(e,0),At(e,t),De(e,te()),n;if(n===6)throw Error(C(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,tn(e,ke,ft),De(e,te()),null}function hu(e,t){var n=L;L|=1;try{return e(t)}finally{L=n,L===0&&(Yn=te()+500,Dl&&Gt())}}function fn(e){Lt!==null&&Lt.tag===0&&(L&6)===0&&Hn();var t=L;L|=1;var n=We.transition,r=O;try{if(We.transition=null,O=1,e)return e()}finally{O=r,We.transition=n,L=t,(L&6)===0&&Gt()}}function mu(){Te=In.current,Q(In)}function ln(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,wm(n)),ne!==null)for(n=ne.return;n!==null;){var r=n;switch(Ys(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&il();break;case 3:Kn(),Q(Ee),Q(ve),ou();break;case 5:ru(r);break;case 4:Kn();break;case 13:Q(Z);break;case 19:Q(Z);break;case 10:qs(r.type._context);break;case 22:case 23:mu()}n=n.return}if(ae=e,ne=e=bt(e.current,null),de=Te=t,oe=0,Xr=null,fu=Tl=dn=0,ke=Ar=null,rn!==null){for(t=0;t<rn.length;t++)if(n=rn[t],r=n.interleaved,r!==null){n.interleaved=null;var o=r.next,l=n.pending;if(l!==null){var i=l.next;l.next=o,r.next=i}n.pending=r}rn=null}return e}function rf(e,t){do{var n=ne;try{if(Js(),Wo.current=ml,hl){for(var r=X.memoizedState;r!==null;){var o=r.queue;o!==null&&(o.pending=null),r=r.next}hl=!1}if(cn=0,ue=re=X=null,Rr=!1,Gr=0,du.current=null,n===null||n.return===null){oe=1,Xr=t,ne=null;break}e:{var l=e,i=n.return,s=n,u=t;if(t=de,s.flags|=32768,u!==null&&typeof u=="object"&&typeof u.then=="function"){var c=u,h=s,g=h.tag;if((h.mode&1)===0&&(g===0||g===11||g===15)){var f=h.alternate;f?(h.updateQueue=f.updateQueue,h.memoizedState=f.memoizedState,h.lanes=f.lanes):(h.updateQueue=null,h.memoizedState=null)}var m=qa(i);if(m!==null){m.flags&=-257,ec(m,i,s,l,t),m.mode&1&&Ja(l,c,t),t=m,u=c;var w=t.updateQueue;if(w===null){var v=new Set;v.add(u),t.updateQueue=v}else w.add(u);break e}else{if((t&1)===0){Ja(l,c,t),gu();break e}u=Error(C(426))}}else if(K&&s.mode&1){var k=qa(i);if(k!==null){(k.flags&65536)===0&&(k.flags|=256),ec(k,i,s,l,t),Zs(Gn(u,s));break e}}l=u=Gn(u,s),oe!==4&&(oe=2),Ar===null?Ar=[l]:Ar.push(l),l=i;do{switch(l.tag){case 3:l.flags|=65536,t&=-t,l.lanes|=t;var d=jd(l,u,t);Qa(l,d);break e;case 1:s=u;var a=l.type,p=l.stateNode;if((l.flags&128)===0&&(typeof a.getDerivedStateFromError=="function"||p!==null&&typeof p.componentDidCatch=="function"&&(Ut===null||!Ut.has(p)))){l.flags|=65536,t&=-t,l.lanes|=t;var y=Ud(l,s,t);Qa(l,y);break e}}l=l.return}while(l!==null)}sf(n)}catch(S){t=S,ne===n&&n!==null&&(ne=n=n.return);continue}break}while(!0)}function of(){var e=gl.current;return gl.current=ml,e===null?ml:e}function gu(){(oe===0||oe===3||oe===2)&&(oe=4),ae===null||(dn&268435455)===0&&(Tl&268435455)===0||At(ae,de)}function wl(e,t){var n=L;L|=2;var r=of();(ae!==e||de!==t)&&(ft=null,ln(e,t));do try{Vm();break}catch(o){rf(e,o)}while(!0);if(Js(),L=n,gl.current=r,ne!==null)throw Error(C(261));return ae=null,de=0,oe}function Vm(){for(;ne!==null;)lf(ne)}function Wm(){for(;ne!==null&&!yh();)lf(ne)}function lf(e){var t=af(e.alternate,e,Te);e.memoizedProps=e.pendingProps,t===null?sf(e):ne=t,du.current=null}function sf(e){var t=e;do{var n=t.alternate;if(e=t.return,(t.flags&32768)===0){if(n=$m(n,t,Te),n!==null){ne=n;return}}else{if(n=Om(n,t),n!==null){n.flags&=32767,ne=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{oe=6,ne=null;return}}if(t=t.sibling,t!==null){ne=t;return}ne=t=e}while(t!==null);oe===0&&(oe=5)}function tn(e,t,n){var r=O,o=We.transition;try{We.transition=null,O=1,Qm(e,t,n,r)}finally{We.transition=o,O=r}return null}function Qm(e,t,n,r){do Hn();while(Lt!==null);if((L&6)!==0)throw Error(C(327));n=e.finishedWork;var o=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(C(177));e.callbackNode=null,e.callbackPriority=0;var l=n.lanes|n.childLanes;if(Ph(e,l),e===ae&&(ne=ae=null,de=0),(n.subtreeFlags&2064)===0&&(n.flags&2064)===0||jo||(jo=!0,cf(el,function(){return Hn(),null})),l=(n.flags&15990)!==0,(n.subtreeFlags&15990)!==0||l){l=We.transition,We.transition=null;var i=O;O=1;var s=L;L|=4,du.current=null,jm(e,n),ef(n,e),hm(us),nl=!!ss,us=ss=null,e.current=n,Um(n,e,o),wh(),L=s,O=i,We.transition=l}else e.current=n;if(jo&&(jo=!1,Lt=e,yl=o),l=e.pendingLanes,l===0&&(Ut=null),kh(n.stateNode,r),De(e,te()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)o=t[n],r(o.value,{componentStack:o.stack,digest:o.digest});if(vl)throw vl=!1,e=Ps,Ps=null,e;return(yl&1)!==0&&e.tag!==0&&Hn(),l=e.pendingLanes,(l&1)!==0?e===Ns?zr++:(zr=0,Ns=e):zr=0,Gt(),null}function Hn(){if(Lt!==null){var e=jc(yl),t=We.transition,n=O;try{if(We.transition=null,O=16>e?16:e,Lt===null)var r=!1;else{if(e=Lt,Lt=null,yl=0,(L&6)!==0)throw Error(C(331));var o=L;for(L|=4,F=e.current;F!==null;){var l=F,i=l.child;if((F.flags&16)!==0){var s=l.deletions;if(s!==null){for(var u=0;u<s.length;u++){var c=s[u];for(F=c;F!==null;){var h=F;switch(h.tag){case 0:case 11:case 15:Mr(8,h,l)}var g=h.child;if(g!==null)g.return=h,F=g;else for(;F!==null;){h=F;var f=h.sibling,m=h.return;if(Xd(h),h===c){F=null;break}if(f!==null){f.return=m,F=f;break}F=m}}}var w=l.alternate;if(w!==null){var v=w.child;if(v!==null){w.child=null;do{var k=v.sibling;v.sibling=null,v=k}while(v!==null)}}F=l}}if((l.subtreeFlags&2064)!==0&&i!==null)i.return=l,F=i;else e:for(;F!==null;){if(l=F,(l.flags&2048)!==0)switch(l.tag){case 0:case 11:case 15:Mr(9,l,l.return)}var d=l.sibling;if(d!==null){d.return=l.return,F=d;break e}F=l.return}}var a=e.current;for(F=a;F!==null;){i=F;var p=i.child;if((i.subtreeFlags&2064)!==0&&p!==null)p.return=i,F=p;else e:for(i=a;F!==null;){if(s=F,(s.flags&2048)!==0)try{switch(s.tag){case 0:case 11:case 15:Nl(9,s)}}catch(S){ee(s,s.return,S)}if(s===i){F=null;break e}var y=s.sibling;if(y!==null){y.return=s.return,F=y;break e}F=s.return}}if(L=o,Gt(),ut&&typeof ut.onPostCommitFiberRoot=="function")try{ut.onPostCommitFiberRoot(_l,e)}catch{}r=!0}return r}finally{O=n,We.transition=t}}return!1}function pc(e,t,n){t=Gn(n,t),t=jd(e,t,1),e=jt(e,t,1),t=Ce(),e!==null&&(Jr(e,1,t),De(e,t))}function ee(e,t,n){if(e.tag===3)pc(e,e,n);else for(;t!==null;){if(t.tag===3){pc(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Ut===null||!Ut.has(r))){e=Gn(n,e),e=Ud(t,e,1),t=jt(t,e,1),e=Ce(),t!==null&&(Jr(t,1,e),De(t,e));break}}t=t.return}}function Km(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=Ce(),e.pingedLanes|=e.suspendedLanes&n,ae===e&&(de&n)===n&&(oe===4||oe===3&&(de&130023424)===de&&500>te()-pu?ln(e,0):fu|=n),De(e,t)}function uf(e,t){t===0&&((e.mode&1)===0?t=1:(t=Do,Do<<=1,(Do&130023424)===0&&(Do=4194304)));var n=Ce();e=wt(e,t),e!==null&&(Jr(e,t,n),De(e,n))}function Gm(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),uf(e,n)}function Ym(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,o=e.memoizedState;o!==null&&(n=o.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(C(314))}r!==null&&r.delete(t),uf(e,n)}var af;af=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||Ee.current)xe=!0;else{if((e.lanes&n)===0&&(t.flags&128)===0)return xe=!1,Im(e,t,n);xe=(e.flags&131072)!==0}else xe=!1,K&&(t.flags&1048576)!==0&&fd(t,al,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;Ko(e,t),e=t.pendingProps;var o=Vn(t,ve.current);Un(t,n),o=iu(null,t,r,e,o,n);var l=su();return t.flags|=1,typeof o=="object"&&o!==null&&typeof o.render=="function"&&o.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,Se(r)?(l=!0,sl(t)):l=!1,t.memoizedState=o.state!==null&&o.state!==void 0?o.state:null,tu(t),o.updater=Pl,t.stateNode=o,o._reactInternals=t,vs(t,r,e,n),t=Cs(null,t,r,!0,l,n)):(t.tag=0,K&&l&&Gs(t),we(null,t,o,n),t=t.child),t;case 16:r=t.elementType;e:{switch(Ko(e,t),e=t.pendingProps,o=r._init,r=o(r._payload),t.type=r,o=t.tag=Xm(r),e=Xe(r,e),o){case 0:t=ws(null,t,r,e,n);break e;case 1:t=rc(null,t,r,e,n);break e;case 11:t=tc(null,t,r,e,n);break e;case 14:t=nc(null,t,r,Xe(r.type,e),n);break e}throw Error(C(306,r,""))}return t;case 0:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Xe(r,o),ws(e,t,r,o,n);case 1:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Xe(r,o),rc(e,t,r,o,n);case 3:e:{if(Wd(t),e===null)throw Error(C(387));r=t.pendingProps,l=t.memoizedState,o=l.element,yd(e,t),fl(t,r,null,n);var i=t.memoizedState;if(r=i.element,l.isDehydrated)if(l={element:r,isDehydrated:!1,cache:i.cache,pendingSuspenseBoundaries:i.pendingSuspenseBoundaries,transitions:i.transitions},t.updateQueue.baseState=l,t.memoizedState=l,t.flags&256){o=Gn(Error(C(423)),t),t=oc(e,t,r,n,o);break e}else if(r!==o){o=Gn(Error(C(424)),t),t=oc(e,t,r,n,o);break e}else for(Re=Bt(t.stateNode.containerInfo.firstChild),Me=t,K=!0,qe=null,n=gd(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Wn(),r===o){t=Ct(e,t,n);break e}we(e,t,r,n)}t=t.child}return t;case 5:return wd(t),e===null&&hs(t),r=t.type,o=t.pendingProps,l=e!==null?e.memoizedProps:null,i=o.children,as(r,o)?i=null:l!==null&&as(r,l)&&(t.flags|=32),Vd(e,t),we(e,t,i,n),t.child;case 6:return e===null&&hs(t),null;case 13:return Qd(e,t,n);case 4:return nu(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Qn(t,null,r,n):we(e,t,r,n),t.child;case 11:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Xe(r,o),tc(e,t,r,o,n);case 7:return we(e,t,t.pendingProps,n),t.child;case 8:return we(e,t,t.pendingProps.children,n),t.child;case 12:return we(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,o=t.pendingProps,l=t.memoizedProps,i=o.value,H(cl,r._currentValue),r._currentValue=i,l!==null)if(nt(l.value,i)){if(l.children===o.children&&!Ee.current){t=Ct(e,t,n);break e}}else for(l=t.child,l!==null&&(l.return=t);l!==null;){var s=l.dependencies;if(s!==null){i=l.child;for(var u=s.firstContext;u!==null;){if(u.context===r){if(l.tag===1){u=gt(-1,n&-n),u.tag=2;var c=l.updateQueue;if(c!==null){c=c.shared;var h=c.pending;h===null?u.next=u:(u.next=h.next,h.next=u),c.pending=u}}l.lanes|=n,u=l.alternate,u!==null&&(u.lanes|=n),ms(l.return,n,t),s.lanes|=n;break}u=u.next}}else if(l.tag===10)i=l.type===t.type?null:l.child;else if(l.tag===18){if(i=l.return,i===null)throw Error(C(341));i.lanes|=n,s=i.alternate,s!==null&&(s.lanes|=n),ms(i,n,t),i=l.sibling}else i=l.child;if(i!==null)i.return=l;else for(i=l;i!==null;){if(i===t){i=null;break}if(l=i.sibling,l!==null){l.return=i.return,i=l;break}i=i.return}l=i}we(e,t,o.children,n),t=t.child}return t;case 9:return o=t.type,r=t.pendingProps.children,Un(t,n),o=Qe(o),r=r(o),t.flags|=1,we(e,t,r,n),t.child;case 14:return r=t.type,o=Xe(r,t.pendingProps),o=Xe(r.type,o),nc(e,t,r,o,n);case 15:return Hd(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Xe(r,o),Ko(e,t),t.tag=1,Se(r)?(e=!0,sl(t)):e=!1,Un(t,n),Bd(t,r,o),vs(t,r,o,n),Cs(null,t,r,!0,e,n);case 19:return Kd(e,t,n);case 22:return bd(e,t,n)}throw Error(C(156,t.tag))};function cf(e,t){return Ic(e,t)}function Zm(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ve(e,t,n,r){return new Zm(e,t,n,r)}function vu(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Xm(e){if(typeof e=="function")return vu(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Is)return 11;if(e===$s)return 14}return 2}function bt(e,t){var n=e.alternate;return n===null?(n=Ve(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function Zo(e,t,n,r,o,l){var i=2;if(r=e,typeof e=="function")vu(e)&&(i=1);else if(typeof e=="string")i=5;else e:switch(e){case Dn:return sn(n.children,o,l,t);case Ls:i=8,o|=8;break;case Ui:return e=Ve(12,n,t,o|2),e.elementType=Ui,e.lanes=l,e;case Hi:return e=Ve(13,n,t,o),e.elementType=Hi,e.lanes=l,e;case bi:return e=Ve(19,n,t,o),e.elementType=bi,e.lanes=l,e;case wc:return Rl(n,o,l,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case vc:i=10;break e;case yc:i=9;break e;case Is:i=11;break e;case $s:i=14;break e;case Tt:i=16,r=null;break e}throw Error(C(130,e==null?e:typeof e,""))}return t=Ve(i,n,t,o),t.elementType=e,t.type=r,t.lanes=l,t}function sn(e,t,n,r){return e=Ve(7,e,r,t),e.lanes=n,e}function Rl(e,t,n,r){return e=Ve(22,e,r,t),e.elementType=wc,e.lanes=n,e.stateNode={isHidden:!1},e}function Oi(e,t,n){return e=Ve(6,e,null,t),e.lanes=n,e}function Bi(e,t,n){return t=Ve(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function Jm(e,t,n,r,o){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=ki(0),this.expirationTimes=ki(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ki(0),this.identifierPrefix=r,this.onRecoverableError=o,this.mutableSourceEagerHydrationData=null}function yu(e,t,n,r,o,l,i,s,u){return e=new Jm(e,t,n,s,u),t===1?(t=1,l===!0&&(t|=8)):t=0,l=Ve(3,null,null,t),e.current=l,l.stateNode=e,l.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},tu(l),e}function qm(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Sn,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function df(e){if(!e)return Wt;e=e._reactInternals;e:{if(hn(e)!==e||e.tag!==1)throw Error(C(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(Se(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(C(171))}if(e.tag===1){var n=e.type;if(Se(n))return cd(e,n,t)}return t}function ff(e,t,n,r,o,l,i,s,u){return e=yu(n,r,!0,e,o,l,i,s,u),e.context=df(null),n=e.current,r=Ce(),o=Ht(n),l=gt(r,o),l.callback=t??null,jt(n,l,o),e.current.lanes=o,Jr(e,o,r),De(e,r),e}function Ml(e,t,n,r){var o=t.current,l=Ce(),i=Ht(o);return n=df(n),t.context===null?t.context=n:t.pendingContext=n,t=gt(l,i),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=jt(o,t,i),e!==null&&(tt(e,o,i,l),Vo(e,o,i)),i}function Cl(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function hc(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function wu(e,t){hc(e,t),(e=e.alternate)&&hc(e,t)}function eg(){return null}var pf=typeof reportError=="function"?reportError:function(e){console.error(e)};function Cu(e){this._internalRoot=e}Al.prototype.render=Cu.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(C(409));Ml(e,t,null,null)};Al.prototype.unmount=Cu.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;fn(function(){Ml(null,e,null,null)}),t[yt]=null}};function Al(e){this._internalRoot=e}Al.prototype.unstable_scheduleHydration=function(e){if(e){var t=bc();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Mt.length&&t!==0&&t<Mt[n].priority;n++);Mt.splice(n,0,e),n===0&&Wc(e)}};function _u(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function zl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function mc(){}function tg(e,t,n,r,o){if(o){if(typeof r=="function"){var l=r;r=function(){var c=Cl(i);l.call(c)}}var i=ff(t,r,e,0,null,!1,!1,"",mc);return e._reactRootContainer=i,e[yt]=i.current,br(e.nodeType===8?e.parentNode:e),fn(),i}for(;o=e.lastChild;)e.removeChild(o);if(typeof r=="function"){var s=r;r=function(){var c=Cl(u);s.call(c)}}var u=yu(e,0,!1,null,null,!1,!1,"",mc);return e._reactRootContainer=u,e[yt]=u.current,br(e.nodeType===8?e.parentNode:e),fn(function(){Ml(t,u,n,r)}),u}function Ll(e,t,n,r,o){var l=n._reactRootContainer;if(l){var i=l;if(typeof o=="function"){var s=o;o=function(){var u=Cl(i);s.call(u)}}Ml(t,i,e,o)}else i=tg(n,t,e,o,r);return Cl(i)}Uc=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=Er(t.pendingLanes);n!==0&&(js(t,n|1),De(t,te()),(L&6)===0&&(Yn=te()+500,Gt()))}break;case 13:fn(function(){var r=wt(e,1);if(r!==null){var o=Ce();tt(r,e,1,o)}}),wu(e,1)}};Us=function(e){if(e.tag===13){var t=wt(e,134217728);if(t!==null){var n=Ce();tt(t,e,134217728,n)}wu(e,134217728)}};Hc=function(e){if(e.tag===13){var t=Ht(e),n=wt(e,t);if(n!==null){var r=Ce();tt(n,e,t,r)}wu(e,t)}};bc=function(){return O};Vc=function(e,t){var n=O;try{return O=e,t()}finally{O=n}};qi=function(e,t,n){switch(t){case"input":if(Qi(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var o=Sl(r);if(!o)throw Error(C(90));_c(r),Qi(r,o)}}}break;case"textarea":xc(e,n);break;case"select":t=n.value,t!=null&&$n(e,!!n.multiple,t,!1)}};Tc=hu;Rc=fn;var ng={usingClientEntryPoint:!1,Events:[eo,Tn,Sl,Pc,Nc,hu]},Cr={findFiberByHostInstance:nn,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},rg={bundleType:Cr.bundleType,version:Cr.version,rendererPackageName:Cr.rendererPackageName,rendererConfig:Cr.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:_t.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=zc(e),e===null?null:e.stateNode},findFiberByHostInstance:Cr.findFiberByHostInstance||eg,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(_r=__REACT_DEVTOOLS_GLOBAL_HOOK__,!_r.isDisabled&&_r.supportsFiber))try{_l=_r.inject(rg),ut=_r}catch{}var _r;Le.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ng;Le.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!_u(t))throw Error(C(200));return qm(e,t,null,n)};Le.createRoot=function(e,t){if(!_u(e))throw Error(C(299));var n=!1,r="",o=pf;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),t=yu(e,1,!1,null,null,n,!1,r,o),e[yt]=t.current,br(e.nodeType===8?e.parentNode:e),new Cu(t)};Le.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(C(188)):(e=Object.keys(e).join(","),Error(C(268,e)));return e=zc(t),e=e===null?null:e.stateNode,e};Le.flushSync=function(e){return fn(e)};Le.hydrate=function(e,t,n){if(!zl(t))throw Error(C(200));return Ll(null,e,t,!0,n)};Le.hydrateRoot=function(e,t,n){if(!_u(e))throw Error(C(405));var r=n!=null&&n.hydratedSources||null,o=!1,l="",i=pf;if(n!=null&&(n.unstable_strictMode===!0&&(o=!0),n.identifierPrefix!==void 0&&(l=n.identifierPrefix),n.onRecoverableError!==void 0&&(i=n.onRecoverableError)),t=ff(t,null,e,1,n??null,o,!1,l,i),e[yt]=t.current,br(e),r)for(e=0;e<r.length;e++)n=r[e],o=n._getVersion,o=o(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,o]:t.mutableSourceEagerHydrationData.push(n,o);return new Al(t)};Le.render=function(e,t,n){if(!zl(t))throw Error(C(200));return Ll(null,e,t,!1,n)};Le.unmountComponentAtNode=function(e){if(!zl(e))throw Error(C(40));return e._reactRootContainer?(fn(function(){Ll(null,null,e,!1,function(){e._reactRootContainer=null,e[yt]=null})}),!0):!1};Le.unstable_batchedUpdates=hu;Le.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!zl(n))throw Error(C(200));if(e==null||e._reactInternals===void 0)throw Error(C(38));return Ll(e,t,n,!1,r)};Le.version="18.3.1-next-f1338f8080-20240426"});var ku=dt((Vg,gf)=>{"use strict";function mf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(mf)}catch(e){console.error(e)}}mf(),gf.exports=hf()});var yf=dt(xu=>{"use strict";var vf=ku();xu.createRoot=vf.createRoot,xu.hydrateRoot=vf.hydrateRoot;var Wg});var Zf=dt(Hl=>{"use strict";var Cg=Ge(),_g=Symbol.for("react.element"),kg=Symbol.for("react.fragment"),xg=Object.prototype.hasOwnProperty,Eg=Cg.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Sg={key:!0,ref:!0,__self:!0,__source:!0};function Yf(e,t,n){var r,o={},l=null,i=null;n!==void 0&&(l=""+n),t.key!==void 0&&(l=""+t.key),t.ref!==void 0&&(i=t.ref);for(r in t)xg.call(t,r)&&!Sg.hasOwnProperty(r)&&(o[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps,t)o[r]===void 0&&(o[r]=t[r]);return{$$typeof:_g,type:e,key:l,ref:i,props:o,_owner:Eg.current}}Hl.Fragment=kg;Hl.jsx=Yf;Hl.jsxs=Yf});var le=dt((m0,Xf)=>{"use strict";Xf.exports=Zf()});var $g={};Bp($g,{mount:()=>Ig});var St=B(Ge()),wp=B(yf());function Il(e,t){return e.currentTime-(e.dataset?.continuousTimeline==="1"?t:0)}function Eu(e,t,n){return t+(e.dataset?.continuousTimeline==="1"?n:0)}function wf(e,t){return Number.isFinite(e.duration)?e.duration-(e.dataset?.continuousTimeline==="1"?t:0):null}var T=B(Ge());var Cf="",_f,kf=(e,t)=>t;function xf(e,t,n){Cf=new URL(e).origin,_f=t,kf=n}function no(e){return Cf+"/api/"+e.replace(/^\/+/,"").replace(/^api\/+/,"")}async function Ie(e,t){let n=e.replace(/^\/+/,"").replace(/^api\/+/,"");if(!n.startsWith("public/streams/"))throw new Error("Unsupported chat endpoint");return kf(n,await _f(no(n)))}var Ef={ru:{afterStream:"\u041F\u043E\u0441\u043B\u0435 \u044D\u0444\u0438\u0440\u0430",playTail:"\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0447\u0430\u0442",pauseTail:"\u041F\u0430\u0443\u0437\u0430",showTail:"\u041A \u043A\u043E\u043D\u0446\u0443 \u0447\u0430\u0442\u0430",tailComplete:"\u041A\u043E\u043D\u0435\u0446 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u043E\u0433\u043E \u0447\u0430\u0442\u0430",title:"\u0427\u0430\u0442",messages:"\u0441\u043E\u043E\u0431\u0449.",offset:"\u0421\u0434\u0432\u0438\u0433",settings:"\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0447\u0430\u0442\u0430",offsetAria:"\u0421\u0434\u0432\u0438\u0433 \u0447\u0430\u0442\u0430 \u0432 \u0441\u0435\u043A\u0443\u043D\u0434\u0430\u0445",showDeleted:"\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0435",banPermanent:"\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0437\u0430\u0431\u0430\u043D\u0435\u043D \u043D\u0430\u0432\u0441\u0435\u0433\u0434\u0430",banTimeout:"\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u0442\u0430\u0439\u043C\u0430\u0443\u0442",firstMessage:"1-\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435",firstMessageTitle:"\u041F\u0435\u0440\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u044D\u0442\u043E\u0433\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0432 \u043A\u0430\u043D\u0430\u043B\u0435",loading:"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u0447\u0430\u0442\u2026",loadError:"\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0447\u0430\u0442. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C.",empty:"\u0414\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u0441\u0442\u0440\u0438\u043C\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0447\u0430\u0442\u0430 \u043D\u0435 \u0437\u0430\u043F\u0438\u0441\u0430\u043B\u0438\u0441\u044C.",waiting:"\u041E\u0436\u0438\u0434\u0430\u044E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u0432\u0438\u0434\u0435\u043E\u2026",paused:"\u041F\u0440\u043E\u043A\u0440\u0443\u0442\u043A\u0430 \u0447\u0430\u0442\u0430 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u2014 \u043A \u043D\u043E\u0432\u044B\u043C \u2193",liveEmotes:"\u0422\u0435\u043A\u0443\u0449\u0438\u0435 \u044D\u043C\u043E\u0443\u0442\u044B \u043A\u0430\u043D\u0430\u043B\u0430",liveEmotesHint:"\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u044D\u043C\u043E\u0443\u0442\u044B \u043D\u0430 \u043C\u043E\u043C\u0435\u043D\u0442 \u0437\u0430\u043F\u0438\u0441\u0438. \u0417\u0434\u0435\u0441\u044C \u2014 \u043D\u0430\u0431\u043E\u0440 \u043A\u0430\u043D\u0430\u043B\u0430 \u043D\u0430 7TV \u043F\u0440\u044F\u043C\u043E \u0441\u0435\u0439\u0447\u0430\u0441: \u043F\u0440\u0438\u0433\u043E\u0434\u0438\u0442\u0441\u044F, \u0435\u0441\u043B\u0438 \u0441\u043D\u0430\u043F\u0448\u043E\u0442 \u043D\u0435 \u0441\u043D\u044F\u043B\u0441\u044F \u0438\u043B\u0438 \u043D\u0430\u0431\u043E\u0440 \u0441 \u0442\u0435\u0445 \u043F\u043E\u0440 \u043F\u043E\u043F\u043E\u043B\u043D\u0438\u043B\u0441\u044F.",liveEmotesLoading:"\u0437\u0430\u0433\u0440\u0443\u0436\u0430\u044E\u2026",liveEmotesError:"\u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C",liveEmotesNone:"\u0443 \u043A\u0430\u043D\u0430\u043B\u0430 \u043D\u0435\u0442 7TV",sectionView:"\u0412\u0438\u0434",sectionHighlight:"\u041F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430",sectionFilter:"\u0424\u0438\u043B\u044C\u0442\u0440\u044B",fontSize:"\u0420\u0430\u0437\u043C\u0435\u0440 \u0442\u0435\u043A\u0441\u0442\u0430",emoteSize:"\u0420\u0430\u0437\u043C\u0435\u0440 \u044D\u043C\u043E\u0443\u0442\u043E\u0432",compact:"\u041F\u043B\u043E\u0442\u043D\u043E",showTimestamps:"\u0412\u0440\u0435\u043C\u044F",stripes:"\u041F\u043E\u043B\u043E\u0441\u044B",readableColors:"\u0427\u0438\u0442\u0430\u0435\u043C\u044B\u0435 \u043D\u0438\u043A\u0438",readableColorsHint:"\u041F\u043E\u0434\u043D\u0438\u043C\u0430\u0435\u0442 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0442\u0451\u043C\u043D\u044B\u0435 \u0446\u0432\u0435\u0442\u0430 \u043D\u0438\u043A\u043E\u0432 \u0434\u043E \u0447\u0438\u0442\u0430\u0435\u043C\u044B\u0445, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044F \u043E\u0442\u0442\u0435\u043D\u043E\u043A.",highlightFirst:"\u041F\u0435\u0440\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435",keywords:"\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430",keywordsPlaceholder:"\u0432\u0430\u0448 \u043D\u0438\u043A, \u0440\u043E\u0437\u044B\u0433\u0440\u044B\u0448",keywordsHint:"\u0427\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E. \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0441 \u044D\u0442\u0438\u043C\u0438 \u0441\u043B\u043E\u0432\u0430\u043C\u0438 \u043F\u043E\u043B\u0443\u0447\u0430\u044E\u0442 \u0430\u043A\u0446\u0435\u043D\u0442\u043D\u0443\u044E \u043F\u043E\u043B\u043E\u0441\u0443.",hideCommands:"\u0421\u043A\u0440\u044B\u0442\u044C !\u043A\u043E\u043C\u0430\u043D\u0434\u044B",hiddenUsers:"\u0421\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439",hiddenUsersPlaceholder:"nightbot, streamelements",search:"\u041F\u043E\u0438\u0441\u043A",searchPlaceholder:"\u0442\u0435\u043A\u0441\u0442 \u0438\u043B\u0438 \u043D\u0438\u043A",reset:"\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",filtered:"\u043E\u0442\u0444\u0438\u043B\u044C\u0442\u0440\u043E\u0432\u0430\u043D\u043E",userCardHistory:"\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u0440\u043E\u0448\u043B\u044B\u0445 \u044D\u0444\u0438\u0440\u043E\u0432",userCardHistoryLoading:"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u043F\u0440\u043E\u0448\u043B\u044B\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F\u2026",userCardHistoryRetry:"\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u043B\u0430\u0441\u044C \u2014 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C",userCardHistoryLimit:"\u043F\u043E\u043A\u0430\u0437\u0430\u043D\u044B \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 1000",userCardPastStream:"\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0438\u0437 \u043F\u0440\u043E\u0448\u043B\u043E\u0433\u043E \u044D\u0444\u0438\u0440\u0430",userCardMore:"\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0435\u0449\u0451 100 (\u0441\u0442\u0430\u0440\u0448\u0435)",userCardTitle:"\u0418\u0441\u0442\u043E\u0440\u0438\u044F",userCardHint:"\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0434\u043E \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u0432\u0438\u0434\u0435\u043E",userCardEmpty:"\u041A \u044D\u0442\u043E\u043C\u0443 \u043C\u043E\u043C\u0435\u043D\u0442\u0443 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0435\u0449\u0451 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043F\u0438\u0441\u0430\u043B.",userCardCount:"\u0441\u043E\u043E\u0431\u0449. \u043A \u044D\u0442\u043E\u043C\u0443 \u043C\u043E\u043C\u0435\u043D\u0442\u0443",userCardTotal:"\u0432\u0441\u0435\u0433\u043E \u0437\u0430 \u044D\u0444\u0438\u0440",userCardFirst:"\u043F\u0435\u0440\u0432\u043E\u0435",userCardClose:"\u0417\u0430\u043A\u0440\u044B\u0442\u044C",userCardSeek:"\u041F\u0435\u0440\u0435\u043C\u043E\u0442\u0430\u0442\u044C \u043A \u044D\u0442\u043E\u043C\u0443 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044E",userCardOtherPart:"\u042D\u0442\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0432 \u0434\u0440\u0443\u0433\u043E\u0439 \u0447\u0430\u0441\u0442\u0438 \u0437\u0430\u043F\u0438\u0441\u0438",userCardDeleted:"\u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0445",userCardDrag:"\u041F\u043E\u0442\u044F\u043D\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438 \u043E\u043A\u043D\u043E",userCardSearch:"\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F\u043C",userCardNoMatch:"\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.",offsetSaved:"\u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D \u0434\u043B\u044F \u044D\u0442\u043E\u0439 \u0437\u0430\u043F\u0438\u0441\u0438",metaViewers:"\u0437\u0440\u0438\u0442\u0435\u043B\u0435\u0439",metaPeak:"\u043F\u0438\u043A",metaNoData:"\u0414\u043B\u044F \u044D\u0442\u043E\u0439 \u0437\u0430\u043F\u0438\u0441\u0438 \u0434\u0430\u043D\u043D\u044B\u0445 \u043E\u0431 \u044D\u0444\u0438\u0440\u0435 \u043D\u0435\u0442.",metaReveal:"\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0435\u0441\u044C \u044D\u0444\u0438\u0440",metaRevealHint:"\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u0432\u0438\u0434\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E, \u0434\u043E \u0447\u0435\u0433\u043E \u0434\u043E\u0438\u0433\u0440\u0430\u043B\u0430 \u0437\u0430\u043F\u0438\u0441\u044C, \u2014 \u0438\u043D\u0430\u0447\u0435 \u043F\u043E\u043B\u043E\u0441\u0430 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u0441\u0440\u0430\u0437\u0443 \u0432\u044B\u0434\u0430\u0451\u0442, \u0447\u0442\u043E \u0431\u0443\u0434\u0435\u0442 \u0434\u0430\u043B\u044C\u0448\u0435.",metaAhead:"\u0434\u0430\u043B\u044C\u0448\u0435",metaCategory:"\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F",eventsShow:"\u0421\u0442\u0430\u0432\u043A\u0438 \u0438 \u043E\u043F\u0440\u043E\u0441\u044B",eventsCollapse:"\u0421\u0432\u043E\u0440\u0430\u0447\u0438\u0432\u0430\u0442\u044C \u0441\u0442\u0430\u0432\u043A\u0438 \u0438 \u043E\u043F\u0440\u043E\u0441\u044B",eventsCollapseHint:"\u041E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u043D\u0435\u0433\u043E, \u0447\u0442\u043E\u0431\u044B \u0440\u0430\u0441\u043A\u0440\u044B\u0442\u044C. \u0412\u044B\u0431\u043E\u0440 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u0434\u043B\u044F \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0445 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u043E\u0432.",eventCollapse:"\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443",eventExpand:"\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443",eventsHint:"\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0441\u0442\u0430\u0432\u043A\u0438 \u0438\u043B\u0438 \u043E\u043F\u0440\u043E\u0441\u0430 \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u0435\u0442 \u0442\u0430\u043C \u0436\u0435, \u0433\u0434\u0435 \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u043B\u0430 \u0432 \u044D\u0444\u0438\u0440\u0435, \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043F\u043E \u0445\u043E\u0434\u0443 \u0437\u0430\u043F\u0438\u0441\u0438. \u0418\u0442\u043E\u0433 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0441\u043B\u0435 \u0442\u043E\u0433\u043E, \u043A\u0430\u043A \u0441\u0442\u0440\u0438\u043C\u0435\u0440 \u0435\u0433\u043E \u043E\u0431\u044A\u044F\u0432\u0438\u043B.",eventPrediction:"\u0421\u0442\u0430\u0432\u043A\u0430",eventPoll:"\u041E\u043F\u0440\u043E\u0441",eventOpen:"\u041F\u0440\u0438\u0451\u043C \u0441\u0442\u0430\u0432\u043E\u043A",eventLocked:"\u0421\u0442\u0430\u0432\u043A\u0438 \u0437\u0430\u043A\u0440\u044B\u0442\u044B",eventResolved:"\u0418\u0442\u043E\u0433",eventCancelled:"\u041E\u0442\u043C\u0435\u043D\u0435\u043D\u043E \u2014 \u043E\u0447\u043A\u0438 \u0432\u0435\u0440\u043D\u0443\u043B\u0438",eventWinner:"\u041F\u043E\u0431\u0435\u0434\u0438\u043B",eventPollDone:"\u041E\u043F\u0440\u043E\u0441 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D",eventPoints:"\u043E\u0447\u043A\u043E\u0432",eventVotes:"\u0433\u043E\u043B\u043E\u0441\u043E\u0432",eventUsers:"\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u043E\u0432",eventBetOn:"\u041F\u043E\u0441\u0442\u0430\u0432\u0438\u043B \u043D\u0430",eventReturn:"\u041A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442",eventAlreadyOpen:"\u0428\u043B\u0430 \u0434\u043E \u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u043F\u0438\u0441\u0438"},en:{afterStream:"After the stream",playTail:"Continue chat",pauseTail:"Pause",showTail:"Jump to chat end",tailComplete:"End of saved chat",title:"Chat",messages:"messages",offset:"Offset",settings:"Chat settings",offsetAria:"Chat offset in seconds",showDeleted:"Show deleted",banPermanent:"User was banned permanently",banTimeout:"User was timed out",firstMessage:"First message",firstMessageTitle:"The author's first ever message in this channel",loading:"Loading chat\u2026",loadError:"Could not load chat. Check the server connection.",empty:"No chat messages were captured for this stream.",waiting:"Waiting for messages at this video time\u2026",paused:"Chat paused \u2014 jump to latest \u2193",liveEmotes:"Channel's current emotes",liveEmotesHint:"By default the emotes are the ones from the time of recording. This shows the channel's 7TV set as it is now \u2014 useful when no snapshot was taken, or the set has grown since.",liveEmotesLoading:"loading\u2026",liveEmotesError:"could not load",liveEmotesNone:"channel has no 7TV",sectionView:"Appearance",sectionHighlight:"Highlighting",sectionFilter:"Filters",fontSize:"Text size",emoteSize:"Emote size",compact:"Compact",showTimestamps:"Timestamps",stripes:"Stripes",readableColors:"Readable names",readableColorsHint:"Lifts author colours that are too dark to read, keeping their hue.",highlightFirst:"First message",keywords:"Keywords",keywordsPlaceholder:"your name, giveaway",keywordsHint:"Comma-separated. Messages containing them get an accent bar.",hideCommands:"Hide !commands",hiddenUsers:"Hide users",hiddenUsersPlaceholder:"nightbot, streamelements",search:"Search",searchPlaceholder:"text or name",reset:"Reset settings",filtered:"filtered",userCardHistory:"Previous broadcasts",userCardHistoryLoading:"Loading earlier messages\u2026",userCardHistoryRetry:"History could not load \u2014 retry",userCardHistoryLimit:"latest 1000 shown",userCardPastStream:"Message from an earlier broadcast",userCardMore:"Show 100 more (older)",userCardTitle:"History",userCardHint:"Messages up to the current video time",userCardEmpty:"This user had not written anything by this point.",userCardCount:"messages so far",userCardTotal:"total this stream",userCardFirst:"first",userCardClose:"Close",userCardSeek:"Jump to this message",userCardOtherPart:"This message is in another part of the recording",userCardDeleted:"deleted",userCardDrag:"Drag to move the window",userCardSearch:"Search messages",userCardNoMatch:"Nothing found.",offsetSaved:"saved for this recording",metaViewers:"viewers",metaPeak:"peak",metaNoData:"No broadcast data was recorded for this stream.",metaReveal:"Reveal whole stream",metaRevealHint:"By default only the part the recording has reached is shown \u2014 otherwise the category strip gives away what happens later.",metaAhead:"ahead",metaCategory:"Category",eventsShow:"Predictions and polls",eventsCollapse:"Collapse predictions and polls",eventsCollapseHint:"Keep only the card header. Click it to expand. Your choice is saved for future visits.",eventCollapse:"Collapse card",eventExpand:"Expand card",eventsHint:"A prediction or poll card appears where it appeared live and updates as the recording plays. The result shows only once the streamer called it.",eventPrediction:"Prediction",eventPoll:"Poll",eventOpen:"Betting open",eventLocked:"Bets closed",eventResolved:"Result",eventCancelled:"Cancelled \u2014 points refunded",eventWinner:"Winner",eventPollDone:"Poll finished",eventPoints:"points",eventVotes:"votes",eventUsers:"backers",eventBetOn:"Bet on",eventReturn:"Return",eventAlreadyOpen:"Was already running when the recording began"}},mn={broadcaster:{ru:"\u0421\u0442\u0440\u0438\u043C\u0435\u0440",en:"Broadcaster",badge:"\u0421\u0422\u0420"},moderator:{ru:"\u041C\u043E\u0434\u0435\u0440\u0430\u0442\u043E\u0440\u044B",en:"Moderators",badge:"MOD"},vip:{ru:"VIP",en:"VIP",badge:"VIP"},subscriber:{ru:"\u041F\u043E\u0434\u043F\u0438\u0441\u0447\u0438\u043A\u0438",en:"Subscribers",badge:"SUB"},verified:{ru:"\u0421\u0442\u0440\u0438\u043C\u0435\u0440\u044B / \u2713",en:"Streamers / \u2713",badge:"\u2713"},staff:{ru:"\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B",en:"Staff",badge:"STAFF"},founder:{ru:"\u041E\u0441\u043D\u043E\u0432\u0430\u0442\u0435\u043B\u0438",en:"Founders",badge:"FND"},og:{ru:"OG",en:"OG",badge:"OG"},sub_gifter:{ru:"\u0414\u0430\u0440\u0438\u0442\u0435\u043B\u0438",en:"Gifters",badge:"GIFT"},turbo:{ru:"Turbo",en:"Turbo",badge:"T"},artist:{ru:"\u0425\u0443\u0434\u043E\u0436\u043D\u0438\u043A\u0438",en:"Artists",badge:"ART"}};var Fe=B(Ge()),Df=["broadcaster","moderator","vip","subscriber","verified","staff"],gn={fontPx:13,emotePx:28,compact:!1,showTimestamps:!0,stripes:!1,readableColors:!0,showDeleted:!0,useLiveEmotes:!1,highlightRoles:["broadcaster","moderator"],highlightFirstMessage:!0,keywords:"",hideCommands:!1,hiddenUsers:"",revealTimeline:!1,showEvents:!0,collapseEvents:!1,showBets:!0},kt={fontPx:{min:10,max:24},emotePx:{min:16,max:64}},Ff="tsr-chat-prefs",og="tsr-chat-show-deleted",lg="tsr-chat-live-emotes";function Sf(e,t,n,r){let o=Number(e);return Number.isFinite(o)?Math.min(n,Math.max(t,Math.round(o))):r}function ig(){if(typeof window>"u")return gn;let e={};try{let t=window.localStorage.getItem(Ff);t&&(e=JSON.parse(t))}catch{}try{e.showDeleted===void 0&&(e.showDeleted=window.localStorage.getItem(og)!=="0"),e.useLiveEmotes===void 0&&(e.useLiveEmotes=window.localStorage.getItem(lg)==="1")}catch{}return{...gn,...e,fontPx:Sf(e.fontPx,kt.fontPx.min,kt.fontPx.max,gn.fontPx),emotePx:Sf(e.emotePx,kt.emotePx.min,kt.emotePx.max,gn.emotePx),highlightRoles:Array.isArray(e.highlightRoles)?e.highlightRoles:gn.highlightRoles}}function Pf(){let[e,t]=(0,Fe.useState)(gn),[n,r]=(0,Fe.useState)(!1);(0,Fe.useEffect)(()=>{t(ig()),r(!0)},[]),(0,Fe.useEffect)(()=>{if(n)try{window.localStorage.setItem(Ff,JSON.stringify(e))}catch{}},[e,n]);let o=(0,Fe.useCallback)((s,u)=>{t(c=>({...c,[s]:u}))},[]),l=(0,Fe.useCallback)(s=>{t(u=>({...u,highlightRoles:u.highlightRoles.includes(s)?u.highlightRoles.filter(c=>c!==s):[...u.highlightRoles,s]}))},[]),i=(0,Fe.useCallback)(()=>t(gn),[]);return{prefs:e,update:o,toggleRole:l,reset:i}}function Nf(e,t){let[n,r]=(0,Fe.useState)(t),[o,l]=(0,Fe.useState)(!1),i=e?`tsr-chat-offset:${e}`:null;return(0,Fe.useEffect)(()=>{if(l(!1),!i){r(t),l(!0);return}let s=null;try{let u=window.localStorage.getItem(i);if(u!==null){let c=Number(u);Number.isFinite(c)&&(s=c)}}catch{}r(s??t),l(!0)},[i,t]),(0,Fe.useEffect)(()=>{if(!(!o||!i))try{n===t?window.localStorage.removeItem(i):window.localStorage.setItem(i,String(n))}catch{}},[n,t,i,o]),[n,r]}function Su(e){return e.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean)}function $l(e){if(!e)return"#9ca3af";let t=/^#?([0-9a-f]{6})$/i.exec(e.trim());if(!t)return e;let n=parseInt(t[1],16),r=n>>16&255,o=n>>8&255,l=n&255,i=(.2126*r+.7152*o+.0722*l)/255;if(i>=.35)return e;let s=.35/Math.max(i,.04);return r=Math.min(255,Math.round(r*s)||90),o=Math.min(255,Math.round(o*s)||90),l=Math.min(255,Math.round(l*s)||90),`rgb(${r}, ${o}, ${l})`}var Tf=/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,Rf=/[\0-\x1F\x7F-\x9F]/;var Mf=/[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B4E\u1B4F\u1B5A-\u1B60\u1B7D-\u1B7F\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDD6E\uDEAD\uDED0\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9\uDFD4\uDFD5\uDFD7\uDFD8]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09\uDFE1]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDD6D-\uDD6F\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD839\uDDFF|\uD83A[\uDD5E\uDD5F]/;var Af=/[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;var sg=class{constructor(e={}){se(this,"src_Any",Tf.source);se(this,"src_Cc",Rf.source);se(this,"src_Z",Af.source);se(this,"src_P",Mf.source);se(this,"src_ZPCc",[this.src_Z,this.src_P,this.src_Cc].join("|"));se(this,"src_ZCc",[this.src_Z,this.src_Cc].join("|"));se(this,"cache",{});se(this,"opts",{maxLength:1e4,urlAuth:!1,schema_names:[]});this.opts={...this.opts,...e}}set(e={}){return this.opts={...this.opts,...e},this.cache={},this}escapeRE(e){return e.replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&")}nestedPairRE(e,t,n=4){let r=this.escapeRE(e),o=this.escapeRE(t),l=`(?:(?!${this.src_ZCc}|${r}|${o}).)`,i=`${r}${l}{0,1000}${o}`;for(let s=2;s<=n;s++)i=`${r}(?:${l}|${i}){0,1000}${o}`;return i}get_text_separators(){var e;return(e=this.cache).text_separators??(e.text_separators=/[><\uff5c]/)}get_pseudo_letter(){var e;return(e=this.cache).src_pseudo_letter??(e.src_pseudo_letter=new RegExp(`(?:(?!${this.get_text_separators().source}|${this.src_ZPCc})${this.src_Any})`))}get_ipv4_addr(){var e;return(e=this.cache).src_ip4??(e.src_ip4=new RegExp("(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])[.]){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])"))}get_ipv6_addr(){var n;let e="[0-9A-Fa-f]{1,4}",t=`(?:(?:${e}:${e})|${this.get_ipv4_addr().source})`;return(n=this.cache).src_ip6_addr??(n.src_ip6_addr=new RegExp(`(?:(?:${e}:){6}${t}|::(?:${e}:){5}${t}|(?:${e})?::(?:${e}:){4}${t}|(?:(?:${e}:){0,1}${e})?::(?:${e}:){3}${t}|(?:(?:${e}:){0,2}${e})?::(?:${e}:){2}${t}|(?:(?:${e}:){0,3}${e})?::${e}:${t}|(?:(?:${e}:){0,4}${e})?::${t}|(?:(?:${e}:){0,5}${e})?::${e}|(?:(?:${e}:){0,6}${e})?::)`))}get_ipv6_url_host(){var e;return(e=this.cache).src_ip6_host??(e.src_ip6_host=new RegExp(`\\[${this.get_ipv6_addr().source}\\]`))}get_ipv6_mail_host(){var e;return(e=this.cache).src_ipv6_mail_host??(e.src_ipv6_mail_host=new RegExp(`\\[IPv6:${this.get_ipv6_addr().source}\\]`))}get_auth(){var e;return(e=this.cache).src_auth??(e.src_auth=new RegExp(`(?:(?:(?!${this.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`))}get_port(){var e;return(e=this.cache).src_port??(e.src_port=new RegExp("(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?"))}get_host_terminator(){var e;return(e=this.cache).src_host_terminator??(e.src_host_terminator=new RegExp(`(?=$|${this.get_text_separators().source}|${this.src_ZPCc})(?!${this.opts["---"]?"-(?!--)|":"-|"}_|:\\d|\\.-|\\.(?!$|${this.src_ZPCc}))`))}get_path_terminator(){var e;return(e=this.cache).src_path_terminator??(e.src_path_terminator=new RegExp(`${this.src_ZPCc}|${this.get_text_separators().source}`))}get_path(){var e;return(e=this.cache).src_path??(e.src_path=new RegExp(`(?:[/?#](?:${this.nestedPairRE("[","]")}|${this.nestedPairRE("(",")")}|${this.nestedPairRE("{","}")}|\\"(?:(?!${this.src_ZCc}|["]).){1,100}\\"|\\'(?:(?!${this.src_ZCc}|[']).){1,100}\\'|\\'(?=${this.get_pseudo_letter().source}|[-])|\\.{2,20}[:]?[a-zA-Z0-9%/&]|\\.(?!${this.src_ZCc}|[.]|$)|`+(this.opts["---"]?"\\-(?!--(?:[^-]|$))(?:-{0,19})|":"\\-{1,20}|")+`,(?!${this.src_ZCc}|$)|;(?!${this.src_ZCc}|$)|\\!{1,20}(?!${this.src_ZCc}|[!]|$)|\\?(?!${this.src_ZCc}|[?]|$)|`+this.get_path_extra().source+`[\\\\/:%@#&=_~*]|(?!${this.get_path_terminator().source}).){1,${this.opts.maxLength}}|\\/)?`))}get_mail_name(){var e;return(e=this.cache).src_mail_name??(e.src_mail_name=new RegExp("[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9](?:[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9]|[.](?=[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9])){0,63}"))}get_xn(){var e;return(e=this.cache).src_xn??(e.src_xn=new RegExp("xn--[a-z0-9\\-]{1,59}"))}get_tld(){if(this.cache.tld)return this.cache.tld;let e=[...new Set(this.opts.tlds||[])].sort().reverse().join("|");return this.cache.tld=new RegExp(`${e||"$#none#$"}|${this.get_xn().source}`),this.cache.tld}get_domain_root(){var e;return(e=this.cache).src_domain_root??(e.src_domain_root=new RegExp("(?:"+this.get_xn().source+`|${this.get_pseudo_letter().source}{1,63})`))}get_domain(){var e;return(e=this.cache).src_domain??(e.src_domain=new RegExp("(?:"+this.get_xn().source+`|(?:${this.get_pseudo_letter().source})|(?:${this.get_pseudo_letter().source}(?:-|${this.get_pseudo_letter().source}){0,61}${this.get_pseudo_letter().source}))`))}get_url_host_port(){var e;return(e=this.cache).url_host_port??(e.url_host_port=new RegExp("(?:"+this.get_ipv6_url_host().source+`|(?:(?:(?:${this.get_domain().source})\\.){0,10}${this.get_domain().source}))`+this.get_port().source+this.get_host_terminator().source))}get_fuzzy_url_host_port(){var e;return(e=this.cache).fuzzy_url_host_port??(e.fuzzy_url_host_port=new RegExp("(?:"+(this.opts.fuzzyIP?this.get_ipv4_addr().source+"|":"")+`(?:(?:(?:${this.get_domain().source})\\.){1,10}(?:${this.get_tld().source})))`+this.get_host_terminator().source))}get_mail_host(){var e;return(e=this.cache).src_mail_host??(e.src_mail_host=new RegExp("(?:"+this.get_ipv6_mail_host().source+`|(?:(?:(?:${this.get_domain().source})\\.){0,4}${this.get_domain().source}))`+this.get_host_terminator().source))}get_fuzzy_mail_host(){var e;return(e=this.cache).src_fuzzy_mail_host??(e.src_fuzzy_mail_host=new RegExp("(?:"+this.get_ipv6_mail_host().source+`|(?:(?:(?:${this.get_domain().source})[.]){1,4}${this.get_domain_root().source}))`+this.get_host_terminator().source))}get_path_extra(){var e;return(e=this.cache).src_path_extra??(e.src_path_extra=new RegExp(""))}get_fuzzy_mail_host_search(){var e;return(e=this.cache).mail_fuzzy_host_search??(e.mail_fuzzy_host_search=new RegExp(`@${this.get_fuzzy_mail_host().source}`,"ig"))}get_fuzzy_link_search(){var e;return(e=this.cache).link_fuzzy_search??(e.link_fuzzy_search=new RegExp(`(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uFF5C]|${this.src_ZPCc}))(?:(?![$+<=>^\`|\uFF5C])${this.get_fuzzy_url_host_port().source}${this.get_path().source})`,"ig"))}get_http_validator(){var e;return(e=this.cache).http_validator??(e.http_validator=new RegExp("\\/\\/"+(this.opts.urlAuth?this.get_auth().source:"")+this.get_url_host_port().source+this.get_path().source,"iy"))}get_relative_proto_validator(){var e;return(e=this.cache).relative_proto_validator??(e.relative_proto_validator=new RegExp((this.opts.urlAuth?this.get_auth().source:"")+`(?:localhost|${this.get_ipv6_url_host().source}|(?:(?:${this.get_domain().source})[.]){1,10}${this.get_domain_root().source})`+this.get_port().source+this.get_host_terminator().source+this.get_path().source,"iy"))}get_mail_name_validator(){var e;return(e=this.cache).mail_name_validator??(e.mail_name_validator=new RegExp(`(?:^|${this.get_text_separators().source}|"|\\(|${this.src_ZCc})(${this.get_mail_name().source})$`))}get_mailto_validator(){var e;return(e=this.cache).mailto_validator??(e.mailto_validator=new RegExp(`${this.get_mail_name().source}@${this.get_mail_host().source}`,"iy"))}get_schema_names(){var e;return(e=this.cache).schema_names??(e.schema_names=new RegExp((this.opts.schema_names||[]).map(t=>this.escapeRE(t)).join("|")))}get_schema_search(){var e;return(e=this.cache).schema_search??(e.schema_search=new RegExp(`(^|(?!_)(?:[><\uFF5C]|${this.src_ZPCc}))(${this.get_schema_names().source})`,"ig"))}get_schema_at_start(){var e;return(e=this.cache).schema_at_start??(e.schema_at_start=new RegExp(`^${this.get_schema_search().source}`,"i"))}},Du={validate:(e,t,n)=>{let r=n.re.get_http_validator();r.lastIndex=t;let o=r.exec(e);return o?o[0].length:0},normalize:(e,t)=>t.normalize(e)},ug={"http:":Du,"https:":Du,"ftp:":Du,"//":{validate:function(e,t,n){let r=n.re.get_relative_proto_validator();r.lastIndex=t;let o=r.exec(e);return o?t>=3&&e[t-3]===":"||t>=3&&e[t-3]==="/"?0:o[0].length:0},normalize:(e,t)=>t.normalize(e)},"mailto:":{validate:function(e,t,n){let r=n.re.get_mailto_validator();r.lastIndex=t;let o=r.exec(e);return o?o[0].length:0},normalize:(e,t)=>t.normalize(e)}},ag="a:cdefgilmnoqrstuwxz|b:abdefghijmnorstvwyz|c:acdfghiklmnoruvwxyz|d:ejkmoz|e:cegrstu|f:ijkmor|g:abdefghilmnpqrstuwy|h:kmnrtu|i:delmnoqrst|j:emop|k:eghimnprwyz|l:abcikrstuvy|m:acdeghklmnopqrstuvwxyz|n:acefgilopruz|o:m|p:aefghklmnrstwy|q:a|r:eosuw|s:abcdeghijklmnortuvxyz|t:cdfghjklmnortvwz|u:agksyz|v:aceginu|w:fs|y:et|z:amw",cg="biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444";function dg(){let e=cg.split("|");return ag.split("|").forEach(t=>{let n=t.indexOf(":"),r=t.slice(0,n);for(let o of t.slice(n+1))e.push(r+o)}),e}var fg={fuzzyLink:!1,fuzzyEmail:!0,fuzzyIP:!1,"---":!1,tlds:dg(),urlAuth:!1,maxLength:1e4},zf=class{constructor(e,t,n,r){se(this,"schema");se(this,"index");se(this,"lastIndex");se(this,"raw");se(this,"text");se(this,"url");let o=e.slice(n,r);this.schema=t.toLowerCase(),this.index=n,this.lastIndex=r,this.raw=o,this.text=o,this.url=o}},Lf=class{constructor(e={}){se(this,"__opts__");se(this,"__schemas__");se(this,"re");let{rebuilder:t,...n}=e;this.__opts__={...fg,...n},this.__schemas__={...ug},this.re=t||new sg,this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)})}add(e,t=null){if(!t)delete this.__schemas__[e];else{let n={normalize:(r,o)=>o.normalize(r),...t};this.__schemas__[e]=n}return this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)}),this}set(e={}){return this.__opts__={...this.__opts__,...e},this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)}),this}test(e){if(!e.length)return!1;let t,n;for(n=this.re.get_schema_search(),n.lastIndex=0;(t=n.exec(e))!==null;)if(this.testSchemaAt(e,t[2],n.lastIndex))return!0;if(this.__opts__.fuzzyLink&&this.__schemas__["http:"]&&(n=this.re.get_fuzzy_link_search(),n.lastIndex=0,n.exec(e)!==null))return!0;if(this.__opts__.fuzzyEmail&&this.__schemas__["mailto:"]&&e.indexOf("@")>=0){let r=this.re.get_fuzzy_mail_host_search(),o=this.re.get_mail_name_validator();for(r.lastIndex=0;(t=r.exec(e))!==null;){let l=e.slice(Math.max(0,t.index-65),t.index);if(o.test(l))return!0}}return!1}testSchemaAt(e,t,n){return this.__schemas__[t.toLowerCase()]?this.__schemas__[t.toLowerCase()].validate(e.slice(0,n+this.__opts__.maxLength),n,this):0}match(e){let t=[],n=this.re.get_schema_search(),r,o,l,i,s,u,c=!1,h=!1,g=!1,f=0;if(!e.length)return null;for(n.lastIndex=0,this.__opts__.fuzzyLink&&this.__schemas__["http:"]&&(r=this.re.get_fuzzy_link_search(),r.lastIndex=0),this.__opts__.fuzzyEmail&&this.__schemas__["mailto:"]&&(o=this.re.get_fuzzy_mail_host_search(),o.lastIndex=0,l=this.re.get_mail_name_validator());;){let m=Math.max(f-1,0);if(o&&l&&!g&&(!s||s.index<f))for(o.lastIndex<m&&(o.lastIndex=m);;){let a=o.exec(e);if(!a){g=!0,s=void 0;break}let p=l.exec(e.slice(Math.max(0,a.index-65),a.index));if(p){if(s={schema:"mailto:",index:a.index-p[1].length,lastIndex:a.index+a[0].length},s.index>=f)break;o.lastIndex<m&&(o.lastIndex=m)}}if(r&&!h&&(!i||i.index<f))for(r.lastIndex<m&&(r.lastIndex=m);;){let a=r.exec(e);if(!a){h=!0,i=void 0;break}if(i={schema:"",index:a.index+a[1].length,lastIndex:a.index+a[0].length},i.index>=f)break;r.lastIndex<m&&(r.lastIndex=m)}let w=s;(!w||i&&(i.index<w.index||i.index===w.index&&i.lastIndex>w.lastIndex))&&(w=i);let v;if(!c)for(;;){if(!u){n.lastIndex<m&&(n.lastIndex=m);let y=n.exec(e);if(!y){c=!0;break}u={schema:y[2],index:y.index+y[1].length,lastIndex:y.index+y[0].length}}if(u.index<f){u=void 0;continue}if(w&&u.index>w.index)break;let a=u;u=void 0;let p=this.testSchemaAt(e,a.schema,a.lastIndex);if(p){v={schema:a.schema,index:a.index,lastIndex:a.lastIndex+p};break}}let k=v;if((!k||s&&(s.index<k.index||s.index===k.index&&s.lastIndex>k.lastIndex))&&(k=s),(!k||i&&(i.index<k.index||i.index===k.index&&i.lastIndex>k.lastIndex))&&(k=i),!k)break;k===s?s=void 0:k===i&&(i=void 0);let d=new zf(e,k.schema,k.index,k.lastIndex);d.schema?this.__schemas__[d.schema].normalize(d,this):this.normalize(d),t.push(d),f=k.lastIndex}return t.length?t:null}matchAtStart(e){if(!e.length)return null;let t=this.re.get_schema_at_start().exec(e);if(!t)return null;let n=this.testSchemaAt(e,t[2],t[0].length);if(!n)return null;let r=new zf(e,t[2],t.index+t[1].length,t.index+t[0].length+n);return this.__schemas__[r.schema].normalize(r,this),r}tlds(e,t=!1){return e=Array.isArray(e)?e:[e],t?this.__opts__.tlds=this.__opts__.tlds.concat(e):this.__opts__.tlds=e,this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)}),this}normalize(e){e.schema||(e.url=`http://${e.url}`),e.schema==="mailto:"&&!/^mailto:/i.test(e.url)&&(e.url=`mailto:${e.url}`)}};var If=["aaa","aarp","abb","abbott","abbvie","abc","able","abogado","abudhabi","ac","academy","accenture","accountant","accountants","aco","actor","ad","ads","adult","ae","aeg","aero","aetna","af","afl","africa","ag","agakhan","agency","ai","aig","airbus","airforce","airtel","akdn","al","alibaba","alipay","allfinanz","allstate","ally","alsace","alstom","am","amazon","americanexpress","americanfamily","amex","amfam","amica","amsterdam","analytics","android","anquan","anz","ao","aol","apartments","app","apple","aq","aquarelle","ar","arab","aramco","archi","army","arpa","art","arte","as","asda","asia","associates","at","athleta","attorney","au","auction","audi","audible","audio","auspost","author","auto","autos","aw","aws","ax","axa","az","azure","ba","baby","baidu","banamex","band","bank","bar","barcelona","barclaycard","barclays","barefoot","bargains","baseball","basketball","bauhaus","bayern","bb","bbc","bbt","bbva","bcg","bcn","bd","be","beats","beauty","beer","berlin","best","bestbuy","bet","bf","bg","bh","bharti","bi","bible","bid","bike","bing","bingo","bio","biz","bj","black","blackfriday","blockbuster","blog","bloomberg","blue","bm","bms","bmw","bn","bnpparibas","bo","boats","boehringer","bofa","bom","bond","boo","book","booking","bosch","bostik","boston","bot","boutique","box","br","bradesco","bridgestone","broadway","broker","brother","brussels","bs","bt","build","builders","business","buy","buzz","bv","bw","by","bz","bzh","ca","cab","cafe","cal","call","calvinklein","cam","camera","camp","canon","capetown","capital","capitalone","car","caravan","cards","care","career","careers","cars","casa","case","cash","casino","cat","catering","catholic","cba","cbn","cbre","cc","cd","center","ceo","cern","cf","cfa","cfd","cg","ch","chanel","channel","charity","chase","chat","cheap","chintai","christmas","chrome","church","ci","cipriani","circle","cisco","citadel","citi","citic","city","ck","cl","claims","cleaning","click","clinic","clinique","clothing","cloud","club","clubmed","cm","cn","co","coach","codes","coffee","college","cologne","com","commbank","community","company","compare","computer","comsec","condos","construction","consulting","contact","contractors","cooking","cool","coop","corsica","country","coupon","coupons","courses","cpa","cr","credit","creditcard","creditunion","cricket","crown","crs","cruise","cruises","cu","cuisinella","cv","cw","cx","cy","cymru","cyou","cz","dad","dance","data","date","dating","datsun","day","dclk","dds","de","deal","dealer","deals","degree","delivery","dell","deloitte","delta","democrat","dental","dentist","desi","design","dev","dhl","diamonds","diet","digital","direct","directory","discount","discover","dish","diy","dj","dk","dm","dnp","do","docs","doctor","dog","domains","dot","download","drive","dtv","dubai","dupont","durban","dvag","dvr","dz","earth","eat","ec","eco","edeka","edu","education","ee","eg","email","emerck","energy","engineer","engineering","enterprises","epson","equipment","er","ericsson","erni","es","esq","estate","et","eu","eurovision","eus","events","exchange","expert","exposed","express","extraspace","fage","fail","fairwinds","faith","family","fan","fans","farm","farmers","fashion","fast","fedex","feedback","ferrari","ferrero","fi","fidelity","fido","film","final","finance","financial","fire","firestone","firmdale","fish","fishing","fit","fitness","fj","fk","flickr","flights","flir","florist","flowers","fly","fm","fo","foo","food","football","ford","forex","forsale","forum","foundation","fox","fr","free","fresenius","frl","frogans","frontier","ftr","fujitsu","fun","fund","furniture","futbol","fyi","ga","gal","gallery","gallo","gallup","game","games","gap","garden","gay","gb","gbiz","gd","gdn","ge","gea","gent","genting","george","gf","gg","ggee","gh","gi","gift","gifts","gives","giving","gl","glass","gle","global","globo","gm","gmail","gmbh","gmo","gmx","gn","godaddy","gold","goldpoint","golf","goo","goodyear","goog","google","gop","got","gov","gp","gq","gr","grainger","graphics","gratis","green","gripe","grocery","group","gs","gt","gu","gucci","guge","guide","guitars","guru","gw","gy","hair","hamburg","hangout","haus","hbo","hdfc","hdfcbank","health","healthcare","help","helsinki","here","hermes","hiphop","hisamitsu","hitachi","hiv","hk","hkt","hm","hn","hockey","holdings","holiday","homedepot","homegoods","homes","homesense","honda","horse","hospital","host","hosting","hot","hotels","hotmail","house","how","hr","hsbc","ht","hu","hughes","hyatt","hyundai","ibm","icbc","ice","icu","id","ie","ieee","ifm","ikano","il","im","imamat","imdb","immo","immobilien","in","inc","industries","infiniti","info","ing","ink","institute","insurance","insure","int","international","intuit","investments","io","ipiranga","iq","ir","irish","is","ismaili","ist","istanbul","it","itau","itv","jaguar","java","jcb","je","jeep","jetzt","jewelry","jio","jll","jm","jmp","jnj","jo","jobs","joburg","jot","joy","jp","jpmorgan","jprs","juegos","juniper","kaufen","kddi","ke","kerryhotels","kerryproperties","kfh","kg","kh","ki","kia","kids","kim","kindle","kitchen","kiwi","km","kn","koeln","komatsu","kosher","kp","kpmg","kpn","kr","krd","kred","kuokgroup","kw","ky","kyoto","kz","la","lacaixa","lamborghini","lamer","land","landrover","lanxess","lasalle","lat","latino","latrobe","law","lawyer","lb","lc","lds","lease","leclerc","lefrak","legal","lego","lexus","lgbt","li","lidl","life","lifeinsurance","lifestyle","lighting","like","lilly","limited","limo","lincoln","link","live","living","lk","llc","llp","loan","loans","locker","locus","lol","london","lotte","lotto","love","lpl","lplfinancial","lr","ls","lt","ltd","ltda","lu","lundbeck","luxe","luxury","lv","ly","ma","madrid","maif","maison","makeup","man","management","mango","map","market","marketing","markets","marriott","marshalls","mattel","mba","mc","mckinsey","md","me","med","media","meet","melbourne","meme","memorial","men","menu","merckmsd","mg","mh","miami","microsoft","mil","mini","mint","mit","mitsubishi","mk","ml","mlb","mls","mm","mma","mn","mo","mobi","mobile","moda","moe","moi","mom","monash","money","monster","mormon","mortgage","moscow","moto","motorcycles","mov","movie","mp","mq","mr","ms","msd","mt","mtn","mtr","mu","museum","music","mv","mw","mx","my","mz","na","nab","nagoya","name","navy","nba","nc","ne","nec","net","netbank","netflix","network","neustar","new","news","next","nextdirect","nexus","nf","nfl","ng","ngo","nhk","ni","nico","nike","nikon","ninja","nissan","nissay","nl","no","nokia","norton","now","nowruz","nowtv","np","nr","nra","nrw","ntt","nu","nyc","nz","obi","observer","office","okinawa","olayan","olayangroup","ollo","om","omega","one","ong","onl","online","ooo","open","oracle","orange","org","organic","origins","osaka","otsuka","ott","ovh","pa","page","panasonic","paris","pars","partners","parts","party","pay","pccw","pe","pet","pf","pfizer","pg","ph","pharmacy","phd","philips","phone","photo","photography","photos","physio","pics","pictet","pictures","pid","pin","ping","pink","pioneer","pizza","pk","pl","place","play","playstation","plumbing","plus","pm","pn","pnc","pohl","poker","politie","porn","post","pr","praxi","press","prime","pro","prod","productions","prof","progressive","promo","properties","property","protection","pru","prudential","ps","pt","pub","pw","pwc","py","qa","qpon","quebec","quest","racing","radio","re","read","realestate","realtor","realty","recipes","red","redumbrella","rehab","reise","reisen","reit","reliance","ren","rent","rentals","repair","report","republican","rest","restaurant","review","reviews","rexroth","rich","richardli","ricoh","ril","rio","rip","ro","rocks","rodeo","rogers","room","rs","rsvp","ru","rugby","ruhr","run","rw","rwe","ryukyu","sa","saarland","safe","safety","sakura","sale","salon","samsclub","samsung","sandvik","sandvikcoromant","sanofi","sap","sarl","sas","save","saxo","sb","sbi","sbs","sc","scb","schaeffler","schmidt","scholarships","school","schule","schwarz","science","scot","sd","se","search","seat","secure","security","seek","select","sener","services","seven","sew","sex","sexy","sfr","sg","sh","shangrila","sharp","shell","shia","shiksha","shoes","shop","shopping","shouji","show","si","silk","sina","singles","site","sj","sk","ski","skin","sky","skype","sl","sling","sm","smart","smile","sn","sncf","so","soccer","social","softbank","software","sohu","solar","solutions","song","sony","soy","spa","space","sport","spot","sr","srl","ss","st","stada","staples","star","statebank","statefarm","stc","stcgroup","stockholm","storage","store","stream","studio","study","style","su","sucks","supplies","supply","support","surf","surgery","suzuki","sv","swatch","swiss","sx","sy","sydney","systems","sz","tab","taipei","talk","taobao","target","tatamotors","tatar","tattoo","tax","taxi","tc","tci","td","tdk","team","tech","technology","tel","temasek","tennis","teva","tf","tg","th","thd","theater","theatre","tiaa","tickets","tienda","tips","tires","tirol","tj","tjmaxx","tjx","tk","tkmaxx","tl","tm","tmall","tn","to","today","tokyo","tools","top","toray","toshiba","total","tours","town","toyota","toys","tr","trade","trading","training","travel","travelers","travelersinsurance","trust","trv","tt","tube","tui","tunes","tushu","tv","tvs","tw","tz","ua","ubank","ubs","ug","uk","unicom","university","uno","uol","ups","us","uy","uz","va","vacations","vana","vanguard","vc","ve","vegas","ventures","verisign","verm\xF6gensberater","verm\xF6gensberatung","versicherung","vet","vg","vi","viajes","video","vig","viking","villas","vin","vip","virgin","visa","vision","viva","vivo","vlaanderen","vn","vodka","volvo","vote","voting","voto","voyage","vu","wales","walmart","walter","wang","wanggou","watch","watches","weather","weatherchannel","webcam","weber","website","wed","wedding","weibo","weir","wf","whoswho","wien","wiki","williamhill","win","windows","wine","winners","wme","wolterskluwer","woodside","work","works","world","wow","ws","wtc","wtf","xbox","xerox","xihuan","xin","xxx","xyz","yachts","yahoo","yamaxun","yandex","ye","yodobashi","yoga","yokohama","you","youtube","yt","yun","za","zappos","zara","zero","zip","zm","zone","zuerich","zw","\u03B5\u03BB","\u03B5\u03C5","\u0431\u0433","\u0431\u0435\u043B","\u0434\u0435\u0442\u0438","\u0435\u044E","\u043A\u0430\u0442\u043E\u043B\u0438\u043A","\u043A\u043E\u043C","\u043C\u043A\u0434","\u043C\u043E\u043D","\u043C\u043E\u0441\u043A\u0432\u0430","\u043E\u043D\u043B\u0430\u0439\u043D","\u043E\u0440\u0433","\u0440\u0443\u0441","\u0440\u0444","\u0441\u0430\u0439\u0442","\u0441\u0440\u0431","\u0443\u043A\u0440","\u049B\u0430\u0437","\u0570\u0561\u0575","\u05D9\u05E9\u05E8\u05D0\u05DC","\u05E7\u05D5\u05DD","\u0627\u0628\u0648\u0638\u0628\u064A","\u0627\u0631\u0627\u0645\u0643\u0648","\u0627\u0644\u0627\u0631\u062F\u0646","\u0627\u0644\u0628\u062D\u0631\u064A\u0646","\u0627\u0644\u062C\u0632\u0627\u0626\u0631","\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629","\u0627\u0644\u0639\u0644\u064A\u0627\u0646","\u0627\u0644\u0645\u063A\u0631\u0628","\u0627\u0645\u0627\u0631\u0627\u062A","\u0627\u06CC\u0631\u0627\u0646","\u0628\u0627\u0631\u062A","\u0628\u0627\u0632\u0627\u0631","\u0628\u064A\u062A\u0643","\u0628\u06BE\u0627\u0631\u062A","\u062A\u0648\u0646\u0633","\u0633\u0648\u062F\u0627\u0646","\u0633\u0648\u0631\u064A\u0629","\u0634\u0628\u0643\u0629","\u0639\u0631\u0627\u0642","\u0639\u0631\u0628","\u0639\u0645\u0627\u0646","\u0641\u0644\u0633\u0637\u064A\u0646","\u0642\u0637\u0631","\u0643\u0627\u062B\u0648\u0644\u064A\u0643","\u0643\u0648\u0645","\u0645\u0635\u0631","\u0645\u0644\u064A\u0633\u064A\u0627","\u0645\u0648\u0631\u064A\u062A\u0627\u0646\u064A\u0627","\u0645\u0648\u0642\u0639","\u0647\u0645\u0631\u0627\u0647","\u067E\u0627\u06A9\u0633\u062A\u0627\u0646","\u0680\u0627\u0631\u062A","\u0915\u0949\u092E","\u0928\u0947\u091F","\u092D\u093E\u0930\u0924","\u092D\u093E\u0930\u0924\u092E\u094D","\u092D\u093E\u0930\u094B\u0924","\u0938\u0902\u0917\u0920\u0928","\u09AC\u09BE\u0982\u09B2\u09BE","\u09AD\u09BE\u09B0\u09A4","\u09AD\u09BE\u09F0\u09A4","\u0A2D\u0A3E\u0A30\u0A24","\u0AAD\u0ABE\u0AB0\u0AA4","\u0B2D\u0B3E\u0B30\u0B24","\u0B87\u0BA8\u0BCD\u0BA4\u0BBF\u0BAF\u0BBE","\u0B87\u0BB2\u0B99\u0BCD\u0B95\u0BC8","\u0B9A\u0BBF\u0B99\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0BC2\u0BB0\u0BCD","\u0C2D\u0C3E\u0C30\u0C24\u0C4D","\u0CAD\u0CBE\u0CB0\u0CA4","\u0D2D\u0D3E\u0D30\u0D24\u0D02","\u0DBD\u0D82\u0D9A\u0DCF","\u0E04\u0E2D\u0E21","\u0E44\u0E17\u0E22","\u0EA5\u0EB2\u0EA7","\u10D2\u10D4","\u307F\u3093\u306A","\u30A2\u30DE\u30BE\u30F3","\u30AF\u30E9\u30A6\u30C9","\u30B0\u30FC\u30B0\u30EB","\u30B3\u30E0","\u30B9\u30C8\u30A2","\u30BB\u30FC\u30EB","\u30D5\u30A1\u30C3\u30B7\u30E7\u30F3","\u30DD\u30A4\u30F3\u30C8","\u4E16\u754C","\u4E2D\u4FE1","\u4E2D\u56FD","\u4E2D\u570B","\u4E2D\u6587\u7F51","\u4E9A\u9A6C\u900A","\u4F01\u4E1A","\u4F5B\u5C71","\u4FE1\u606F","\u5065\u5EB7","\u516B\u5366","\u516C\u53F8","\u516C\u76CA","\u53F0\u6E7E","\u53F0\u7063","\u5546\u57CE","\u5546\u5E97","\u5546\u6807","\u5609\u91CC","\u5609\u91CC\u5927\u9152\u5E97","\u5728\u7EBF","\u5927\u62FF","\u5929\u4E3B\u6559","\u5A31\u4E50","\u5BB6\u96FB","\u5E7F\u4E1C","\u5FAE\u535A","\u6148\u5584","\u6211\u7231\u4F60","\u624B\u673A","\u62DB\u8058","\u653F\u52A1","\u653F\u5E9C","\u65B0\u52A0\u5761","\u65B0\u95FB","\u65F6\u5C1A","\u66F8\u7C4D","\u673A\u6784","\u6DE1\u9A6C\u9521","\u6E38\u620F","\u6FB3\u9580","\u70B9\u770B","\u79FB\u52A8","\u7EC4\u7EC7\u673A\u6784","\u7F51\u5740","\u7F51\u5E97","\u7F51\u7AD9","\u7F51\u7EDC","\u8054\u901A","\u8C37\u6B4C","\u8D2D\u7269","\u901A\u8CA9","\u96C6\u56E2","\u96FB\u8A0A\u76C8\u79D1","\u98DE\u5229\u6D66","\u98DF\u54C1","\u9910\u5385","\u9999\u683C\u91CC\u62C9","\u9999\u6E2F","\uB2F7\uB137","\uB2F7\uCEF4","\uC0BC\uC131","\uD55C\uAD6D"];function $f(e){if(typeof e!="string"||e.length>65536)return[];let t=[];for(let n of e.split(/,(?=\d+-\d+\|)/)){let r=/^(\d+)-(\d+)\|([^|]+)\|(.+)$/.exec(n);if(!r)continue;let o=Number(r[1]),l=Number(r[2]),i=r[4];if(!(!Number.isSafeInteger(o)||!Number.isSafeInteger(l)||l<o||/[\s\u0000-\u001f\u007f]/u.test(i))){try{let s=new URL(i);if(s.protocol!=="https:"||s.username||s.password||s.port||!/^(?:media\d*|i)\.giphy\.com$/i.test(s.hostname))continue}catch{continue}t.push({start:o,end:l,id:r[3],url:i})}}return t}function Of(e,t){if(typeof e!="string")return null;if(/^public\/chat-gifs\/[a-f0-9]{64}$/.test(e))return no(e);if(/^asset:[a-f0-9]{64}$/.test(e)){let n=t?.[e.slice(6)];if(typeof n=="string"&&n.length<=35*1024*1024&&/^data:image\/(?:gif|webp|png|jpeg);base64,[A-Za-z0-9+/]/.test(n))return n}return null}function jf(e,t,n,r,o){if(r?.length)return mg(e,t,r);let l=[...$f(o).map(c=>({...c,type:"gif"})),...yg(n).map(c=>({...c,type:"emote"}))].sort((c,h)=>c.start-h.start);if(l.length===0)return ro(e,t);let i=Array.from(e),s=[],u=0;for(let c of l){if(c.start<u||c.end>=i.length)continue;s.push(...ro(i.slice(u,c.start).join(""),t));let h=i.slice(c.start,c.end+1).join("");c.type==="gif"?s.push({type:"gif",name:h,id:c.id,url:c.url}):s.push({type:"emote",name:h,url:`https://static-cdn.jtvnw.net/emoticons/v2/${c.id}/default/dark/2.0`}),u=c.end+1}return s.push(...ro(i.slice(u).join(""),t)),s}function hg(e){return e.localUrl?e.localUrl.startsWith("data:")?{url:e.localUrl}:{url:no(e.localUrl),fallbackUrl:e.url}:{url:e.url}}function mg(e,t,n){let r=[],o=0;for(let s of[...n].sort((u,c)=>u.start-c.start)){if(!s.name)continue;let u=s.start;if(e.slice(u,u+s.name.length)!==s.name){let c=e.indexOf(s.name,o);if(c<0)continue;u=c}u<o||(r.push({id:s.id,name:s.name,start:u,url:s.url}),o=u+s.name.length)}let l=[],i=0;for(let s of r)l.push(...ro(e.slice(i,s.start),t)),l.push({type:"emote",name:s.name,url:s.url||`https://files.kick.com/emotes/${encodeURIComponent(s.id)}/fullsize`}),i=s.start+s.name.length;return l.push(...ro(e.slice(i),t)),l}var gg=/^@([\p{L}\p{N}_.-]{1,32})([\s\S]*)$/u,vg=new Lf({fuzzyLink:!0,fuzzyEmail:!1}).tlds(If);function ro(e,t){if(!e)return[];let n=e.split(/(\s+)/),r=[],o=i=>{if(!i)return;let s=r[r.length-1];s?.type==="text"?s.value+=i:r.push({type:"text",value:i})},l=i=>{let s=0;for(let u of vg.match(i)??[]){if(!["","//","http:","https:"].includes(u.schema))continue;let c=u.schema===""?`https://${u.raw}`:u.schema==="//"?`https:${u.url}`:u.url,h;try{h=new URL(c)}catch{continue}!["http:","https:"].includes(h.protocol)||!h.hostname||h.username||h.password||(o(i.slice(s,u.index)),r.push({type:"link",value:u.raw,href:h.href}),s=u.lastIndex)}o(i.slice(s))};for(let i of n){if(i.startsWith("@")&&i.length>1){let u=gg.exec(i);if(u){r.push({type:"mention",name:u[1]}),l(u[2]);continue}}let s=t.get(i);s?r.push({type:"emote",name:s.name,...hg(s)}):l(i)}return r}function yg(e){let t=[];for(let n of e?.split("/")??[]){let r=n.indexOf(":");if(r<=0)continue;let o=n.slice(0,r);for(let l of n.slice(r+1).split(",")){let[i,s]=l.split("-"),u=Number.parseInt(i,10),c=Number.parseInt(s,10);Number.isFinite(u)&&Number.isFinite(c)&&c>=u&&t.push({id:o,start:u,end:c})}}return t.sort((n,r)=>n.start-r.start)}var Uf="",Bf=`${Uf}ACTION `;function Ol(e){if(!e.startsWith(Bf))return{text:e,isAction:!1};let t=e.slice(Bf.length);return{text:t.endsWith(Uf)?t.slice(0,-1):t,isAction:!0}}function Bl(e){if(e.roles?.length)return e.roles;if(!e.badges)return[];let t={broadcaster:"broadcaster",moderator:"moderator",vip:"vip",subscriber:"subscriber",founder:"subscriber",staff:"staff",admin:"staff",global_mod:"staff",partner:"verified",turbo:"turbo"},n=new Set;for(let r of e.badges.split(",")){let o=t[r.split("/")[0]];o&&n.add(o)}return[...n]}function oo(e,t){return e.isDeleted?e.deletedAtSec==null?!0:t>=e.deletedAtSec:!1}function Jn(e){let t=Math.max(0,Math.floor(e)),n=Math.floor(t/3600),r=Math.floor(t%3600/60),o=t%60,l=i=>String(i).padStart(2,"0");return n>0?`${n}:${l(r)}:${l(o)}`:`${r}:${l(o)}`}var lo=B(Ge()),jl=(0,lo.createContext)({locale:"ru",spoilerFree:!0});function Hf(){return(0,lo.useContext)(jl)}function bf(){return(0,lo.useContext)(jl)}var Vf="#387aff",Wf="#ff3f97",Ul=["#387aff","#ff3f97","#22c55e","#f59e0b","#a78bfa","#14b8a6","#ef4444","#eab308","#3b82f6","#ec4899"];function Qf(e,t){let n=Gf(e.badgeVersion);return n==="pink"?Wf:n==="blue"&&t===0?Vf:Ul[t%Ul.length]}function Kf(e){let t=Gf(e);if(t==="pink")return Wf;if(t==="blue"){let n=wg(e);return n<=1?Vf:Ul[(n-1)%Ul.length]}return"#9ca3af"}function Gf(e){if(!e)return null;let t=e.indexOf("-");return(t===-1?e:e.slice(0,t)).toLowerCase()}function wg(e){let t=e.indexOf("-");if(t===-1)return 1;let n=Number.parseInt(e.slice(t+1),10);return Number.isFinite(n)?n:1}var P=B(le());function Jf({prefs:e,update:t,toggleRole:n,reset:r,copy:o,locale:l,offset:i,setOffset:s,search:u,setSearch:c,liveEmotesUrl:h,liveEmotesNote:g}){return(0,P.jsxs)("div",{className:"chat-settings thin-scroll",children:[(0,P.jsxs)("div",{className:"chat-offset-row",children:[(0,P.jsx)("span",{className:"chat-offset-label",children:o.offset}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f-5),title:"-5s",children:"\u22125"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f-1),title:"-1s",children:"\u22121"}),(0,P.jsx)("input",{type:"number",className:"offset-input",value:i,onChange:f=>{let m=Number(f.target.value);s(Number.isFinite(m)?m:0)},"aria-label":o.offsetAria}),(0,P.jsx)("span",{style:{color:"var(--text-faint)"},children:"s"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f+1),title:"+1s",children:"+1"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f+5),title:"+5s",children:"+5"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(0),title:"reset",children:"\u21BA"})]}),(0,P.jsx)("div",{className:"chat-settings__section",children:o.sectionView}),(0,P.jsxs)("label",{className:"chat-slider",children:[(0,P.jsxs)("span",{children:[o.fontSize,(0,P.jsxs)("b",{children:[e.fontPx,"px"]})]}),(0,P.jsx)("input",{type:"range",min:kt.fontPx.min,max:kt.fontPx.max,value:e.fontPx,onChange:f=>t("fontPx",Number(f.target.value))})]}),(0,P.jsxs)("label",{className:"chat-slider",children:[(0,P.jsxs)("span",{children:[o.emoteSize,(0,P.jsxs)("b",{children:[e.emotePx,"px"]})]}),(0,P.jsx)("input",{type:"range",min:kt.emotePx.min,max:kt.emotePx.max,value:e.emotePx,onChange:f=>t("emotePx",Number(f.target.value))})]}),(0,P.jsxs)("div",{className:"chat-chip-row",children:[(0,P.jsx)(qn,{active:e.compact,label:o.compact,onClick:()=>t("compact",!e.compact)}),(0,P.jsx)(qn,{active:e.showTimestamps,label:o.showTimestamps,onClick:()=>t("showTimestamps",!e.showTimestamps)}),(0,P.jsx)(qn,{active:e.stripes,label:o.stripes,onClick:()=>t("stripes",!e.stripes)}),(0,P.jsx)(qn,{active:e.readableColors,label:o.readableColors,title:o.readableColorsHint,onClick:()=>t("readableColors",!e.readableColors)})]}),(0,P.jsx)("div",{className:"chat-settings__section",children:o.sectionHighlight}),(0,P.jsxs)("div",{className:"chat-chip-row",children:[Df.map(f=>(0,P.jsx)(qn,{active:e.highlightRoles.includes(f),label:mn[f][l],className:`chat-chip--${f}`,onClick:()=>n(f)},f)),(0,P.jsx)(qn,{active:e.highlightFirstMessage,label:o.highlightFirst,className:"chat-chip--first",onClick:()=>t("highlightFirstMessage",!e.highlightFirstMessage)})]}),(0,P.jsxs)("label",{className:"chat-field",title:o.keywordsHint,children:[(0,P.jsx)("span",{children:o.keywords}),(0,P.jsx)("input",{type:"text",value:e.keywords,placeholder:o.keywordsPlaceholder,onChange:f=>t("keywords",f.target.value)})]}),(0,P.jsx)("div",{className:"chat-settings__section",children:o.sectionFilter}),(0,P.jsxs)("label",{className:"chat-field",children:[(0,P.jsx)("span",{children:o.search}),(0,P.jsx)("input",{type:"search",value:u,placeholder:o.searchPlaceholder,onChange:f=>c(f.target.value)})]}),(0,P.jsxs)("label",{className:"chat-toggle",children:[(0,P.jsx)("input",{type:"checkbox",checked:e.showDeleted,onChange:f=>t("showDeleted",f.target.checked)}),(0,P.jsx)("span",{children:o.showDeleted})]}),(0,P.jsxs)("label",{className:"chat-toggle",children:[(0,P.jsx)("input",{type:"checkbox",checked:e.hideCommands,onChange:f=>t("hideCommands",f.target.checked)}),(0,P.jsx)("span",{children:o.hideCommands})]}),(0,P.jsxs)("label",{className:"chat-toggle",title:o.eventsHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.showEvents,onChange:f=>t("showEvents",f.target.checked)}),(0,P.jsx)("span",{children:o.eventsShow})]}),(0,P.jsxs)("label",{className:"chat-toggle",title:o.eventsCollapseHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.collapseEvents,onChange:f=>t("collapseEvents",f.target.checked)}),(0,P.jsx)("span",{children:o.eventsCollapse})]}),(0,P.jsxs)("label",{className:"chat-toggle",title:o.eventsHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.showBets,onChange:f=>t("showBets",f.target.checked)}),(0,P.jsx)("span",{children:o.eventBetOn})]}),(0,P.jsxs)("label",{className:"chat-field",children:[(0,P.jsx)("span",{children:o.hiddenUsers}),(0,P.jsx)("input",{type:"text",value:e.hiddenUsers,placeholder:o.hiddenUsersPlaceholder,onChange:f=>t("hiddenUsers",f.target.value)})]}),h?(0,P.jsxs)("label",{className:"chat-toggle",title:o.liveEmotesHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.useLiveEmotes,onChange:f=>t("useLiveEmotes",f.target.checked)}),(0,P.jsxs)("span",{children:[o.liveEmotes,g?` \u2014 ${g}`:""]})]}):null,(0,P.jsx)("button",{type:"button",className:"chat-reset",onClick:r,children:o.reset})]})}function qn({active:e,label:t,onClick:n,title:r,className:o=""}){return(0,P.jsx)("button",{type:"button",className:`chat-chip${e?" is-active":""} ${o}`.trim(),onClick:n,title:r,"aria-pressed":e,children:t})}var vn=B(Ge());var $e=B(le()),bl=(0,vn.memo)(function({text:t,emoteMap:n,twitchEmotes:r,inlineEmotes:o,twitchGifs:l,gifUrls:i,gifAssets:s,emotePx:u,selfNames:c,onMentionClick:h,mentionTitle:g}){let f=(0,vn.useMemo)(()=>jf(t,n,r,o,l),[t,n,r,o,l]);return(0,$e.jsx)($e.Fragment,{children:f.map((m,w)=>m.type==="mention"?(0,$e.jsxs)("span",{className:`chat-mention${c?.has(m.name.toLowerCase())?" is-self":""}`,role:h?"button":void 0,tabIndex:h?0:void 0,title:h?g:void 0,onClick:h?v=>{v.stopPropagation(),h(m.name)}:void 0,onKeyDown:h?v=>{v.key!=="Enter"&&v.key!==" "||(v.preventDefault(),v.stopPropagation(),h(m.name))}:void 0,children:["@",m.name]},`mention-${w}`):m.type==="link"?(0,$e.jsx)("a",{className:"chat-link",href:m.href,target:"_blank",rel:"noopener noreferrer",onClick:v=>v.stopPropagation(),onAuxClick:v=>v.stopPropagation(),onKeyDown:v=>v.stopPropagation(),children:m.value},`link-${w}`):m.type==="gif"?(0,$e.jsx)(Dg,{url:m.url,label:m.name,reference:i?.[m.url],assets:s},`gif-${m.id}-${m.url}-${i?.[m.url]}-${w}`):m.type==="emote"?(0,$e.jsx)("img",{src:m.url,alt:m.name,title:m.name,className:"chat-emote",style:{height:`${u}px`},loading:"lazy",onError:m.fallbackUrl?v=>{let k=v.currentTarget;m.fallbackUrl&&k.src!==m.fallbackUrl&&(k.src=m.fallbackUrl)}:void 0},`${m.name}-${w}`):(0,$e.jsx)("span",{children:m.value},`text-${w}`))})});function Dg({url:e,label:t,reference:n,assets:r}){let o=(0,vn.useMemo)(()=>Of(n,r),[n,r]),[l,i]=(0,vn.useState)(0);if(l>=(o?2:1))return(0,$e.jsx)("span",{children:t});let s=o&&l===0?o:e;return(0,$e.jsx)("a",{className:"chat-gif",href:s,target:"_blank",rel:"noopener noreferrer",onClick:u=>u.stopPropagation(),onAuxClick:u=>u.stopPropagation(),onKeyDown:u=>u.stopPropagation(),children:(0,$e.jsx)("img",{src:s,alt:t,title:t,loading:"lazy",decoding:"async",referrerPolicy:"no-referrer",onError:()=>i(u=>u+1)})})}var b=B(Ge()),ep=B(ku());var I=B(le()),er=330,qf="tsr-chat-user-card-pos";function Vl(e,t,n,r){let o=Math.max(4,window.innerWidth-n-4),l=Math.max(4,window.innerHeight-r-4);return{x:Math.min(Math.max(4,e),o),y:Math.min(Math.max(4,t),l)}}function tp({login:e,historyUrl:t,messages:n,thresholdSec:r,emoteMap:o,gifAssets:l,emotePx:i,readableColors:s,copy:u,locale:c,onClose:h,onMentionClick:g,onSeek:f,canSeek:m,toRenderTime:w,anchorEl:v}){let[k,d]=(0,b.useState)(null),[a,p]=(0,b.useState)(null),[y,S]=(0,b.useState)(""),[_,D]=(0,b.useState)(null),[N,j]=(0,b.useState)(!1),[A,G]=(0,b.useState)(0),[yn,tr]=(0,b.useState)(100);(0,b.useEffect)(()=>{if(!t)return;let x=!1;return D(null),j(!1),Ie(t).then($=>{x||D($)}).catch(()=>{x||j(!0)}),()=>{x=!0}},[t,A]),(0,b.useEffect)(()=>{tr(100)},[y]);let ie=(0,b.useRef)(null),wn=(0,b.useRef)(null);(0,b.useEffect)(()=>{let x=()=>{let $=v?.getRootNode();d($?.nodeType===11&&"host"in $?$:document.fullscreenElement??document.body)};return x(),document.addEventListener("fullscreenchange",x),()=>document.removeEventListener("fullscreenchange",x)},[v]),(0,b.useEffect)(()=>{if(!k||a)return;let x=null;try{let Yl=window.localStorage.getItem(qf);Yl&&(x=JSON.parse(Yl))}catch{}let $=Math.min(420,window.innerHeight*.6);if(x&&Number.isFinite(x.x)&&Number.isFinite(x.y)){p(Vl(x.x,x.y,er,$));return}let V=v?.getBoundingClientRect(),Be=V?V.left+V.width/2-er/2:window.innerWidth-er-24,rt=V?V.bottom-$-8:80;p(Vl(Be,rt,er,$))},[k,a,v]),(0,b.useEffect)(()=>{if(!k)return;let x=()=>{let $=ie.current?.getBoundingClientRect();p(V=>V&&Vl(V.x,V.y,$?.width||er,$?.height||420))};return x(),window.addEventListener("resize",x),()=>window.removeEventListener("resize",x)},[k]);let nr=(0,b.useCallback)(x=>{if(x.target.closest("button, input"))return;let $=ie.current;if(!$)return;let V=$.getBoundingClientRect();wn.current={x:x.clientX-V.left,y:x.clientY-V.top},x.currentTarget.setPointerCapture(x.pointerId)},[]),Gl=(0,b.useCallback)(x=>{let $=wn.current,V=ie.current;if(!$||!V)return;x.preventDefault();let Be=V.getBoundingClientRect();p(Vl(x.clientX-$.x,x.clientY-$.y,Be.width,Be.height))},[]),rr=(0,b.useCallback)(x=>{if(wn.current){wn.current=null;try{x.currentTarget.releasePointerCapture(x.pointerId)}catch{}if(a)try{window.localStorage.setItem(qf,JSON.stringify(a))}catch{}}},[a]);(0,b.useEffect)(()=>{let x=$=>{$.key==="Escape"&&h()};return window.addEventListener("keydown",x),()=>window.removeEventListener("keydown",x)},[h]);let Zt=(0,b.useMemo)(()=>n.filter(x=>x.authorLogin.toLowerCase()===e.toLowerCase()).sort((x,$)=>x.relativeTimeSec-$.relativeTimeSec),[n,e]),Pe=(0,b.useMemo)(()=>Zt.filter(x=>x.relativeTimeSec<=r),[Zt,r]),Dt=y.trim().toLowerCase(),or=(0,b.useMemo)(()=>{let x=[...Pe].reverse().concat(_?.messages??[]);return Dt?x.filter($=>$.textRaw.toLowerCase().includes(Dt)):x},[Pe,Dt,_]),Ft=Pe[Pe.length-1]??Zt[0],so=Ft?.authorDisplayName??e,uo=s?$l(Ft?.authorColor):Ft?.authorColor,ct=Ft?Bl(Ft):[],ao=Pe.filter(x=>oo(x,r)).length;return!k||!a?null:(0,ep.createPortal)((0,I.jsxs)("div",{ref:ie,className:"chat-user-card",style:{left:a.x,top:a.y,width:er},role:"dialog","aria-label":`${u.userCardTitle}: ${so}`,children:[(0,I.jsxs)("div",{className:"chat-user-card__head",onPointerDown:nr,onPointerMove:Gl,onPointerUp:rr,onPointerCancel:rr,title:u.userCardDrag,children:[(0,I.jsx)("span",{className:"chat-user-card__grip","aria-hidden":"true",children:"\u283F"}),(0,I.jsx)("span",{className:"chat-user-card__name",style:{color:uo||"#9ca3af"},children:so}),(0,I.jsx)("button",{type:"button",className:"chat-user-card__close",onClick:h,title:u.userCardClose,"aria-label":u.userCardClose,children:"\u2715"})]}),(0,I.jsxs)("div",{className:"chat-user-card__meta",children:[ct.length>0?(0,I.jsx)("div",{className:"chat-user-card__roles",children:ct.map(x=>(0,I.jsx)("span",{className:`chat-badge chat-badge--${x}`,children:mn[x].badge},x))}):null,(0,I.jsxs)("div",{className:"chat-user-card__stats",children:[(0,I.jsx)("b",{children:Pe.length})," ",u.userCardCount,Zt.length!==Pe.length?(0,I.jsxs)(I.Fragment,{children:[" \xB7 ",(0,I.jsx)("b",{children:Zt.length})," ",u.userCardTotal]}):null,ao>0?(0,I.jsxs)(I.Fragment,{children:[" \xB7 ",(0,I.jsx)("b",{children:ao})," ",u.userCardDeleted]}):null]}),(0,I.jsx)("input",{type:"search",className:"chat-user-card__search",value:y,placeholder:u.userCardSearch,onChange:x=>S(x.target.value)}),(0,I.jsx)("div",{className:"chat-user-card__hint",children:u.userCardHint}),t?(0,I.jsx)("div",{className:"chat-user-card__hint",role:"status",children:N?(0,I.jsx)("button",{type:"button",onClick:()=>G(x=>x+1),children:u.userCardHistoryRetry}):_?(0,I.jsxs)(I.Fragment,{children:[u.userCardHistory,": ",_.sessions," \xB7 ",_.messages.length," ",u.messages,_.truncated?` \xB7 ${u.userCardHistoryLimit}`:""]}):u.userCardHistoryLoading}):null]}),(0,I.jsxs)("div",{className:"chat-user-card__list thin-scroll",children:[or.length===0?(0,I.jsx)("div",{className:"chat-empty",children:Dt?u.userCardNoMatch:u.userCardEmpty}):or.slice(0,yn).map(x=>{let $=Ol(x.textRaw),V=!!x.historySessionId,Be=!V&&m(x.relativeTimeSec),rt=oo(x,V?1/0:r);return(0,I.jsxs)("div",{className:`chat-user-card__row${rt?" is-deleted":""}`,title:V?u.userCardPastStream:void 0,children:[V?(0,I.jsx)("span",{className:"chat-time",children:x.messageTimestamp?new Date(x.messageTimestamp).toLocaleString(c==="ru"?"ru-RU":"en-US"):u.userCardPastStream}):(0,I.jsx)("button",{type:"button",className:"chat-user-card__seek chat-time",onClick:()=>f(x.relativeTimeSec),disabled:!Be,title:Be?u.userCardSeek:u.userCardOtherPart,children:Jn(w(x.relativeTimeSec))}),(0,I.jsx)("span",{className:"chat-text",children:(0,I.jsx)(bl,{text:$.text,emoteMap:o,twitchEmotes:x.emotes,inlineEmotes:x.inlineEmotes,twitchGifs:x.gifs,gifUrls:x.gifUrls,gifAssets:l,emotePx:Math.min(i,24),onMentionClick:g,mentionTitle:u.userCardTitle})})]},x.id)}),or.length>yn?(0,I.jsx)("button",{type:"button",className:"chat-user-card__more",onClick:()=>tr(x=>x+100),children:u.userCardMore}):null]})]}),k)}var io=B(le()),Fg={size:16,strokeWidth:1.75,className:""};function Pg({size:e,strokeWidth:t,className:n}){return{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:t,strokeLinecap:"round",strokeLinejoin:"round",className:n}}function Ng(e){return{...Fg,...e}}function np(e){let t=Ng(e);return(0,io.jsxs)("svg",{...Pg(t),children:[(0,io.jsx)("circle",{cx:"12",cy:"12",r:"3"}),(0,io.jsx)("path",{d:"M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"})]})}var Wl=B(le());function Tg({width:e,height:t,radius:n,className:r,style:o}){return(0,Wl.jsx)("span",{className:`skeleton${r?` ${r}`:""}`,style:{width:e,height:t,borderRadius:n,...o},"aria-hidden":!0})}function Fu({width:e="100%",height:t="12px"}){return(0,Wl.jsx)(Tg,{width:e,height:t,radius:"4px",className:"skeleton--text"})}function rp(e){let t=e;if(!t||t.version!==1||!Number.isFinite(t.captureAnchorMs)||!Array.isArray(t.points)||!t.points.length||t.points.length>1e4)return null;for(let n=0;n<t.points.length;n++){let r=t.points[n],o=t.points[n-1];if(!r||!Number.isFinite(r.mediaSec)||!Number.isFinite(r.wallClockMs)||o&&(r.mediaSec<=o.mediaSec||r.wallClockMs<=o.wallClockMs))return null}return t}function op(e,t){if(!t?.points.length)return e;let n=lp(t.points,e,o=>o.mediaSec),r=t.points[n];return(r.wallClockMs-t.captureAnchorMs)/1e3+e-r.mediaSec}function Ql(e,t){if(!t?.points.length)return e;let n=t.captureAnchorMs+e*1e3,r=lp(t.points,n,s=>s.wallClockMs),o=t.points[r],l=t.points[r+1],i=o.mediaSec+(n-o.wallClockMs)/1e3;return l?Math.min(i,l.mediaSec):i}function lp(e,t,n){let r=0,o=e.length;for(;r<o;){let l=r+o>>>1;n(e[l])<=t?r=l+1:o=l}return Math.max(0,r-1)}function ip(e,t,n,r){return Math.min(n,e+Math.max(0,t)*Math.max(0,r))}async function Kl(e,t,n=r=>Ie(r,{cacheable:!0})){let r=null,o=null,l=new Set;do{if(t())return null;let i=`${e}${e.includes("?")?"&":"?"}page=1${o?`&cursor=${encodeURIComponent(o)}`:""}`,s=await n(i);if(t())return null;if(r?r.messages.push(...s.messages):r={messages:[...s.messages],emotes:s.emotes,mediaTimeline:s.mediaTimeline},o=s.nextCursor??null,o&&l.has(o))throw new Error("Chat page cursor did not advance");o&&l.add(o)}while(o);return r}var xt=B(Ge());var q=B(le()),Rg=90;function sp(e,t){return e.toLocaleString(t==="ru"?"ru-RU":"en-US")}function up({eventsUrl:e,chatTimeSec:t,copy:n,locale:r,collapsed:o,onToggleCollapsed:l}){let[i,s]=(0,xt.useState)(null);(0,xt.useEffect)(()=>{if(!e)return;let c=!1;return s(null),(async()=>{try{let h=await Ie(e);c||s(h.events??[])}catch{c||s([])}})(),()=>{c=!0}},[e]);let u=(0,xt.useMemo)(()=>{if(!i?.length)return[];let c=!Number.isFinite(t);return i.filter(g=>c?!0:t<g.startedAtSec?!1:g.endedAtSec===null?!0:t<=g.endedAtSec+Rg).sort((g,f)=>f.startedAtSec-g.startedAtSec).slice(0,2)},[i,t]);return!e||u.length===0?null:(0,q.jsx)("div",{className:"stream-events",children:u.map(c=>(0,q.jsx)(Mg,{event:c,chatTimeSec:t,copy:n,locale:r,collapsed:o,onToggleCollapsed:l},c.id))})}function Mg({event:e,chatTimeSec:t,copy:n,locale:r,collapsed:o,onToggleCollapsed:l}){let i=(0,xt.useId)(),s=(0,xt.useMemo)(()=>{let d=null;for(let a of e.samples){if(a.atSec>t)break;d=a}return d},[e.samples,t]),u=e.endedAtSec!==null&&t>=e.endedAtSec?"ended":e.lockedAtSec!==null&&t>=e.lockedAtSec?"locked":"active",c=u==="ended",h=c&&e.status==="cancelled",g=e.kind==="poll",f=s?.points??e.outcomes.map(()=>0),m=s?.users??e.outcomes.map(()=>0),w=f.reduce((d,a)=>d+a,0),v=m.reduce((d,a)=>d+a,0),k=h?n.eventCancelled:c?g?n.eventPollDone:n.eventResolved:u==="locked"?n.eventLocked:g?n.eventPoll:n.eventOpen;return(0,q.jsxs)("div",{className:`stream-event stream-event--${u}${h?" is-cancelled":""}${o?" is-collapsed":""}`,children:[(0,q.jsxs)("button",{type:"button",className:"stream-event__head",onClick:l,"aria-expanded":!o,"aria-controls":i,"aria-label":`${o?n.eventExpand:n.eventCollapse}: ${e.title}`,title:o?n.eventExpand:n.eventCollapse,children:[(0,q.jsx)("span",{className:`stream-event__kind stream-event__kind--${e.kind}`,children:g?n.eventPoll:n.eventPrediction}),(0,q.jsx)("span",{className:"stream-event__title",title:e.title,children:e.title}),(0,q.jsx)("span",{className:"stream-event__chevron","aria-hidden":"true",children:o?"\u25BE":"\u25B4"}),(0,q.jsx)("span",{className:"stream-event__status",children:k})]}),(0,q.jsxs)("div",{id:i,hidden:o,children:[(0,q.jsx)("div",{className:"stream-event__outcomes",children:e.outcomes.map((d,a)=>{let p=f[a]??0,y=w>0?p/w:0,S=!g&&p>0?w/p:null,_=c&&!h&&e.winningOutcomeId===d.id,D=c&&!h&&e.winningOutcomeId!==null&&!_;return(0,q.jsxs)("div",{className:`stream-event__outcome${_?" is-won":""}${D?" is-lost":""}`,children:[(0,q.jsx)("span",{className:"stream-event__fill",style:{width:`${Math.round(y*100)}%`,background:Qf(d,a)}}),(0,q.jsxs)("span",{className:"stream-event__label",children:[_?(0,q.jsx)("span",{className:"stream-event__crown",children:"\u{1F451}"}):null,d.title]}),(0,q.jsxs)("span",{className:"stream-event__numbers",children:[(0,q.jsxs)("span",{className:"stream-event__share",children:[Math.round(y*100),"%"]}),(0,q.jsxs)("span",{className:"stream-event__count",children:[sp(p,r)," ",g?n.eventVotes:n.eventPoints]}),S!==null?(0,q.jsxs)("span",{className:"stream-event__ratio",title:n.eventReturn,children:["\xD7",S.toFixed(2)]}):null]})]},d.id)})}),(0,q.jsxs)("div",{className:"stream-event__foot",children:[v>0?(0,q.jsxs)("span",{children:[sp(v,r)," ",n.eventUsers]}):null,e.startedAtSec<0?(0,q.jsx)("span",{className:"stream-event__early",title:n.eventAlreadyOpen,children:"\u23F3"}):null]})]})]})}var Et=B(Ge());var Oe=B(le()),ap=["#a78bfa","#22c55e","#f59e0b","#3b82f6","#ec4899","#14b8a6","#ef4444","#eab308"];function cp(e){if(!e)return"#4b5563";let t=0;for(let n=0;n<e.length;n+=1)t=t*31+e.charCodeAt(n)|0;return ap[Math.abs(t)%ap.length]}function dp(e,t){return e.toLocaleString(t==="ru"?"ru-RU":"en-US")}function fp({timelineUrl:e,chatTimeSec:t,reveal:n,onToggleReveal:r,hideScale:o=!1,copy:l,locale:i}){let[s,u]=(0,Et.useState)(null),[c,h]=(0,Et.useState)(!1);(0,Et.useEffect)(()=>{if(!e)return;let v=!1;return u(null),h(!1),(async()=>{try{let k=await Ie(e);v||u(k)}catch{v||h(!0)}})(),()=>{v=!0}},[e]);let g=(0,Et.useMemo)(()=>{if(!s?.points.length)return 0;let v=s.points[s.points.length-1];return Math.max(v.relativeTimeSec,1)},[s]),f=(0,Et.useMemo)(()=>{if(!s?.points.length)return null;let v=null;for(let k of s.points){if(k.relativeTimeSec>t)break;v=k}return v??s.points[0]},[s,t]),m=(0,Et.useMemo)(()=>{if(!s?.points.length)return null;if(n)return s.peakViewers;let v=null;for(let k of s.points){if(k.relativeTimeSec>t)break;typeof k.viewerCount=="number"&&(v===null||k.viewerCount>v)&&(v=k.viewerCount)}return v},[s,t,n]);if(!e||c||!s||s.points.length===0)return null;let w=n?g:Math.min(t,g);return(0,Oe.jsxs)("div",{className:"stream-meta",children:[(0,Oe.jsxs)("div",{className:"stream-meta__row",children:[f?.viewerCount!=null?(0,Oe.jsxs)("span",{className:"stream-meta__viewers",title:l.metaViewers,children:["\u25CF ",dp(f.viewerCount,i)]}):null,m!=null?(0,Oe.jsxs)("span",{className:"stream-meta__peak",children:[l.metaPeak," ",dp(m,i)]}):null,o?null:(0,Oe.jsx)("button",{type:"button",className:`stream-meta__reveal${n?" is-active":""}`,onClick:r,title:l.metaRevealHint,"aria-pressed":n,children:n?"\u{1F441}":"\u{1F648}"})]}),f?.categoryName||f?.title?(0,Oe.jsxs)("div",{className:"stream-meta__now",children:[f.categoryName?(0,Oe.jsx)("span",{className:"stream-meta__category",style:{borderColor:cp(f.categoryName)},children:f.categoryName}):null,f.title?(0,Oe.jsx)("span",{className:"stream-meta__title",children:f.title}):null]}):null,o?null:(0,Oe.jsxs)("div",{className:"stream-meta__bar",role:"img","aria-label":l.metaCategory,title:n?void 0:l.metaRevealHint,children:[s.segments.map(v=>{let k=v.endSec??g,d=Math.min(k,w);if(d<=v.startSec)return null;let a=v.startSec/g*100,p=(d-v.startSec)/g*100;return(0,Oe.jsx)("span",{className:"stream-meta__segment",style:{left:`${a}%`,width:`${p}%`,background:cp(v.categoryName)},title:`${v.categoryName??"\u2014"} \xB7 ${Jn(v.startSec)}`},`${v.startSec}-${v.categoryName??"none"}`)}),!n&&w<g?(0,Oe.jsx)("span",{className:"stream-meta__unknown",style:{left:`${w/g*100}%`,width:`${(g-w)/g*100}%`},title:l.metaRevealHint}):null]})]})}var R=B(le()),pp=200;function hp({archiveId:e,chatUrl:t,historySessionId:n=e,liveEmotesUrl:r,timelineUrl:o,eventsUrl:l,staticData:i,videoElement:s,isLive:u,defaultOffsetSec:c=0,externalOffsetSec:h,onExternalOffsetChange:g,baseOffsetSec:f=0,mediaPartStartSec:m=0,isLastPart:w=!0}){let{locale:v}=Hf(),{spoilerFree:k}=bf(),d=Ef[v],{prefs:a,update:p,toggleRole:y,reset:S}=Pf(),[_,D]=(0,T.useState)(i??null),[N,j]=(0,T.useState)(!i),[A,G]=(0,T.useState)(!1),[yn,tr]=Nf(e??t??null,c),ie=h??yn,wn=(0,T.useCallback)(E=>{let M=typeof E=="function"?E(ie):E;h!==void 0&&g?g(M):tr(M)},[ie,h,g,tr]),[nr,Gl]=(0,T.useState)(!1),[rr,Zt]=(0,T.useState)(""),[Pe,Dt]=(0,T.useState)(null),[or,Ft]=(0,T.useState)(0),[so,uo]=(0,T.useState)(!1),[ct,ao]=(0,T.useState)(0),[x,$]=(0,T.useState)(null),[V,Be]=(0,T.useState)(!1),rt=(0,T.useMemo)(()=>rp(_?.mediaTimeline),[_?.mediaTimeline]),Zl=op((x??or)+f-ie,rt),Pu=_?.messages.at(-1),Xt=Pu?Ql(Pu.relativeTimeSec,rt)+ie-f:0,Xl=w&&!u&&so&&ct>0&&Xt>ct+.001,[Cp,Nu]=(0,T.useState)(!0),lr=(0,T.useRef)(null),Jl=(0,T.useRef)(null),co=(0,T.useRef)(!0),ql=(0,T.useRef)(0),[_p,kp]=(0,T.useState)(null),[Cn,Tu]=(0,T.useState)(null),[Ru,fo]=(0,T.useState)("idle");(0,T.useEffect)(()=>{i&&(D(i),j(!1),G(!1))},[i]);let ir=t??(e?`archives/${e}/chat`:null);(0,T.useEffect)(()=>{if(!ir||i)return;let E=!1;async function M(){j(!0),G(!1),D(null);try{let Y=await Kl(ir,()=>E);E||D(Y)}catch{E||(D({messages:[],emotes:null}),G(!0))}finally{E||j(!1)}}return M(),()=>{E=!0}},[ir,i]),(0,T.useEffect)(()=>{Tu(null),fo("idle")},[r]),(0,T.useEffect)(()=>{if(!a.useLiveEmotes||!r||Cn)return;let E=!1;return fo("loading"),(async()=>{try{let M=await Ie(r);if(E)return;Tu(M.emotes),fo("idle")}catch{E||fo("error")}})(),()=>{E=!0}},[a.useLiveEmotes,r,Cn]),(0,T.useEffect)(()=>{if(!s)return;let E=()=>{$(null),Be(!1),uo(!1)},M=()=>ao(wf(s,m)??0),Y=()=>{M(),Ft(Il(s,m)),uo(!0)};E(),M(),s.ended&&Y();let je=()=>{let _n=s.ended?Il(s,m):Math.floor(Il(s,m));Ft(ur=>ur===_n?ur:_n)};return je(),s.addEventListener("timeupdate",je),s.addEventListener("seeked",je),s.addEventListener("seeking",E),s.addEventListener("playing",E),s.addEventListener("emptied",E),s.addEventListener("ended",Y),s.addEventListener("durationchange",M),je(),()=>{s.removeEventListener("timeupdate",je),s.removeEventListener("seeked",je),s.removeEventListener("seeking",E),s.removeEventListener("playing",E),s.removeEventListener("emptied",E),s.removeEventListener("ended",Y),s.removeEventListener("durationchange",M)}},[s,f,m,ir]),(0,T.useEffect)(()=>{if(!V||!Xl)return;let E=performance.now(),M=window.setInterval(()=>{let Y=performance.now(),je=(Y-E)/1e3;E=Y,$(_n=>ip(_n??ct,je,Xt,s?.playbackRate??1))},200);return()=>window.clearInterval(M)},[V,Xl,ct,Xt,s]),(0,T.useEffect)(()=>{x!==null&&x>=Xt&&Be(!1)},[x,Xt]);let Mu=(0,T.useMemo)(()=>{let E=a.useLiveEmotes&&Cn?Cn:_?.emotes,M=new Map;for(let Y of E?.emotes??[])M.set(Y.name,Y);return M},[_?.emotes,a.useLiveEmotes,Cn]),ei=(0,T.useMemo)(()=>Su(a.keywords),[a.keywords]),xp=(0,T.useMemo)(()=>new Set(ei),[ei]),Au=(0,T.useMemo)(()=>new Set(Su(a.hiddenUsers)),[a.hiddenUsers]),Ep=(0,T.useMemo)(()=>new Set(a.highlightRoles),[a.highlightRoles]),ti=rr.trim().toLowerCase(),Jt=(0,T.useMemo)(()=>(_?.messages??[]).filter(M=>!(!a.showDeleted&&M.isDeleted||Au.has(M.authorLogin.toLowerCase())||a.hideCommands&&M.textRaw.trimStart().startsWith("!")||ti&&!`${M.authorLogin} ${M.authorDisplayName??""} ${M.textRaw}`.toLowerCase().includes(ti))),[_,a.showDeleted,a.hideCommands,Au,ti]),zu=(_?.messages.length??0)-Jt.length,Lu=(0,T.useMemo)(()=>{if(Jt.length===0)return[];let E=(Ne,Mp)=>({message:Ne,renderTime:Ql(Ne.relativeTimeSec,rt)-f+ie,deleted:oo(Ne,Mp)});if(u||!s)return Jt.slice(-pp).map(Ne=>E(Ne,Number.POSITIVE_INFINITY));let M=Zl,Y=0,je=Jt.length;for(;Y<je;){let Ne=Y+je>>>1;Jt[Ne].relativeTimeSec<=M?Y=Ne+1:je=Ne}let _n=Math.max(0,Y-pp),ur=[];for(let Ne=_n;Ne<Y;Ne+=1)ur.push(E(Jt[Ne],M));return ur},[Jt,Zl,rt,ie,f,u,s]),po=(0,T.useCallback)(()=>{let E=lr.current;E&&(E.scrollTop=E.scrollHeight,ql.current=E.scrollTop)},[]);(0,T.useLayoutEffect)(()=>{co.current&&po()}),(0,T.useEffect)(()=>{let E=new ResizeObserver(()=>{co.current&&po()});return lr.current&&E.observe(lr.current),Jl.current&&E.observe(Jl.current),()=>E.disconnect()},[po]);let Sp=()=>{let E=lr.current;if(!E)return;let M=E.scrollHeight-E.scrollTop-E.clientHeight<24,Y=E.scrollTop<ql.current-1;ql.current=E.scrollTop,(M||Y)&&(co.current=M,Nu(M))},Dp=()=>{co.current=!0,po(),Nu(!0)},sr=(0,T.useCallback)(E=>Ql(E,rt)-f+ie,[f,ie,rt]),ni=(0,T.useCallback)(E=>{if(!s||u)return!1;let M=Eu(s,sr(E),m),Y=Number.isFinite(s.duration)?s.duration:null;return M>=0&&(Y===null||M<=Y)},[s,u,sr,m]),Fp=(0,T.useCallback)(E=>{!s||!ni(E)||(s.currentTime=Math.max(0,Eu(s,sr(E),m)))},[s,ni,sr,m]),Pp=_?.messages??[],Iu=(0,T.useMemo)(()=>{let E=new Map;for(let M of _?.messages??[])E.set(M.authorLogin.toLowerCase(),M.authorLogin),M.authorDisplayName&&E.set(M.authorDisplayName.toLowerCase(),M.authorLogin);return E},[_?.messages]),$u=(0,T.useCallback)(E=>Dt(Iu.get(E.toLowerCase())??E.toLowerCase()),[Iu]),ri=u||!s?Number.POSITIVE_INFINITY:Zl,Np=Ru==="loading"?d.liveEmotesLoading:Ru==="error"?d.liveEmotesError:a.useLiveEmotes&&Cn===null?d.liveEmotesNone:null,Tp={"--chat-font":`${a.fontPx}px`,"--chat-emote":`${a.emotePx}px`},Rp=["chat-replay",a.compact?"is-compact":"",a.stripes?"has-stripes":"",a.showTimestamps?"":"no-time"].filter(Boolean).join(" ");return(0,R.jsxs)("div",{className:Rp,style:Tp,children:[(0,R.jsxs)("div",{className:"chat-bar",children:[(0,R.jsx)("strong",{className:"chat-bar__title",children:d.title}),!k&&_?.messages.length?(0,R.jsx)("span",{className:"chat-bar__count",children:_.messages.length}):null,zu>0?(0,R.jsxs)("span",{className:"chat-bar__filtered",title:d.filtered,children:["\u2212",zu]}):null,ie!==0?(0,R.jsxs)("span",{className:"chat-bar__offset",title:d.offset,children:[ie>0?`+${ie}`:ie,"s"]}):null,(0,R.jsx)("button",{type:"button",className:`chat-bar__gear${nr?" is-active":""}`,onClick:()=>Gl(E=>!E),title:d.settings,"aria-expanded":nr,children:(0,R.jsx)(np,{size:14})})]}),_?.missingGifAssets?.length?(0,R.jsx)("div",{className:"chat-empty",role:"status",children:v==="ru"?"\u0412 \u044D\u0442\u043E\u043C \u0444\u0430\u0439\u043B\u0435 \u043D\u0435\u0442 \u043A\u043E\u043F\u0438\u0439 \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u044B\u0445 GIF. \u041E\u043D\u0438 \u043E\u0442\u043A\u0440\u043E\u044E\u0442\u0441\u044F, \u0442\u043E\u043B\u044C\u043A\u043E \u0435\u0441\u043B\u0438 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u044B \u0435\u0449\u0451 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B.":"Some GIF images are missing from this file. They can load only while the originals remain available."}):null,nr?(0,R.jsx)(Jf,{prefs:a,update:p,toggleRole:y,reset:S,copy:d,locale:v,offset:ie,setOffset:wn,search:rr,setSearch:Zt,liveEmotesUrl:r,liveEmotesNote:Np}):null,Xl?(0,R.jsxs)("div",{className:"chat-tail",role:"group","aria-label":d.afterStream,children:[(0,R.jsx)("span",{children:d.afterStream}),(x??ct)<Xt?(0,R.jsxs)(R.Fragment,{children:[(0,R.jsx)("button",{type:"button",className:"button secondary",onClick:()=>{$(E=>E??ct),Be(E=>!E)},children:V?d.pauseTail:d.playTail}),(0,R.jsx)("button",{type:"button",className:"button secondary",onClick:()=>{Be(!1),$(Xt)},children:d.showTail})]}):(0,R.jsx)("span",{children:d.tailComplete})]}):null,(0,R.jsx)(fp,{timelineUrl:o,chatTimeSec:ri,reveal:!k&&a.revealTimeline,onToggleReveal:()=>p("revealTimeline",!a.revealTimeline),hideScale:k,copy:d,locale:v}),a.showEvents?(0,R.jsx)(up,{eventsUrl:l,collapsed:a.collapseEvents,onToggleCollapsed:()=>p("collapseEvents",!a.collapseEvents),chatTimeSec:ri,copy:d,locale:v}):null,(0,R.jsxs)("div",{className:"chat-list-wrap",ref:kp,children:[(0,R.jsx)("div",{ref:lr,className:"chat-list thin-scroll",onScroll:Sp,children:(0,R.jsx)("div",{ref:Jl,className:"chat-list-content",children:N?Array.from({length:16},(E,M)=>(0,R.jsxs)("div",{className:"chat-message chat-message--skeleton",children:[(0,R.jsx)(Fu,{width:`${34+M*17%40}px`}),(0,R.jsx)(Fu,{width:`${45+M*29%45}%`})]},M)):A?(0,R.jsx)("div",{className:"chat-empty chat-empty--error",children:d.loadError}):Lu.length===0?(0,R.jsx)("div",{className:"chat-empty",children:_?.messages.length===0?d.empty:d.waiting}):Lu.map(E=>(0,R.jsx)(Ag,{message:E.message,renderTime:E.renderTime,deleted:E.deleted,emoteMap:Mu,gifAssets:_?.gifAssets,emotePx:a.emotePx,readableColors:a.readableColors,highlightRoles:Ep,highlightFirstMessage:a.highlightFirstMessage,showBets:a.showBets,keywords:ei,selfNames:xp,isActiveUser:Pe===E.message.authorLogin,onAuthorClick:Dt,onMentionClick:$u,locale:v,copy:d},E.message.id))})}),Cp?null:(0,R.jsx)("button",{type:"button",className:"chat-jump-pill",onClick:Dp,children:d.paused}),Pe?(0,R.jsx)(tp,{login:Pe,historyUrl:n?`public/streams/${n}/chat/users/${encodeURIComponent(Pe)}/history`:void 0,messages:Pp,thresholdSec:ri,emoteMap:Mu,gifAssets:_?.gifAssets,emotePx:a.emotePx,readableColors:a.readableColors,copy:d,locale:v,onClose:()=>Dt(null),onMentionClick:$u,onSeek:Fp,canSeek:ni,toRenderTime:sr,anchorEl:_p},`${n??ir??"offline"}:${Pe.toLowerCase()}`):null]})]})}var Ag=(0,T.memo)(function({message:t,renderTime:n,deleted:r,emoteMap:o,gifAssets:l,emotePx:i,readableColors:s,highlightRoles:u,highlightFirstMessage:c,showBets:h,keywords:g,selfNames:f,isActiveUser:m,onAuthorClick:w,onMentionClick:v,locale:k,copy:d}){let a=Ol(t.textRaw),p=Bl(t),y=p.find(G=>u.has(G)),S=g.length>0&&g.some(G=>a.text.toLowerCase().includes(G)),_=["chat-message",r?"is-deleted":"",a.isAction?"is-action":"",c&&t.isFirstMessage?"is-first":"",y?`is-role is-role--${y}`:"",S?"is-keyword":"",m?"is-active-user":""].filter(Boolean).join(" "),D=r?t.banDurationSec??null:null,N=c&&!!t.isFirstMessage,j=s?$l(t.authorColor):t.authorColor,A=h?t.predictionBet??null:null;return(0,R.jsxs)("div",{className:_,children:[(0,R.jsx)("span",{className:"chat-time",title:"Time in video",children:Jn(n)}),N?(0,R.jsx)("span",{className:"chat-first",title:d.firstMessageTitle,children:d.firstMessage}):null,p.length>0?(0,R.jsx)("span",{className:"chat-badges",children:p.map(G=>(0,R.jsx)("span",{className:`chat-badge chat-badge--${G}`,title:mn[G][k],children:mn[G].badge},G))}):null,A?(0,R.jsx)("span",{className:"chat-bet",style:{background:Kf(A.badgeVersion)},title:A.outcomeTitle?`${d.eventBetOn}: ${A.outcomeTitle}`:d.eventPrediction,children:A.outcomeTitle??"\u2022"}):null,(0,R.jsx)("button",{type:"button",className:"chat-author",style:{color:j||"#9ca3af"},onClick:()=>w(t.authorLogin),title:d.userCardTitle,children:t.authorDisplayName??t.authorLogin}),(0,R.jsx)("span",{className:"chat-separator",children:a.isAction?" ":": "}),(0,R.jsx)("span",{className:"chat-text",children:(0,R.jsx)(bl,{text:a.text,emoteMap:o,twitchEmotes:t.emotes,inlineEmotes:t.inlineEmotes,twitchGifs:t.gifs,gifUrls:t.gifUrls,gifAssets:l,emotePx:i,selfNames:f,onMentionClick:v,mentionTitle:d.userCardTitle})}),D!==null?(0,R.jsxs)("span",{className:`chat-ban${D===0?" chat-ban--perma":""}`,title:D===0?d.banPermanent:d.banTimeout,children:[D===0?"\u26D4":"\u23F1"," ",zg(D,k)]}):null]})});function zg(e,t){if(e<=0)return t==="ru"?"\u0431\u0430\u043D":"ban";if(e<60)return t==="ru"?`${e} \u0441\u0435\u043A`:`${e}s`;if(e<3600){let r=Math.round(e/60);return t==="ru"?`${r} \u043C\u0438\u043D`:`${r}m`}if(e<86400){let r=Math.round(e/3600);return t==="ru"?`${r} \u0447`:`${r}h`}let n=Math.round(e/86400);return t==="ru"?`${n} \u0434\u043D`:`${n}d`}function mp(e,t,n){let r=n?.mediaTimeline?.captureAnchorMs||Date.parse(e.recordingStartedAt||e.startedAt||"");return Number.isFinite(r)&&t>0?(r-t)/1e3:0}function gp(e,t,n){return{...e,mediaTimeline:null,messages:e.messages.map(r=>{let o=Date.parse(r.messageTimestamp||"");return{...r,relativeTimeSec:n>0&&Number.isFinite(o)?(o-n)/1e3:r.relativeTimeSec+t,deletedAtSec:r.deletedAtSec==null?r.deletedAtSec:r.deletedAtSec+t}})}}function vp(e){let t=new Map,n=new Map;for(let r of e){for(let o of r.messages){let l=o.id;t.has(l)||t.set(l,o)}for(let o of r.emotes?.emotes??[])n.set(o.name,o)}return{messages:[...t.values()].sort((r,o)=>r.relativeTimeSec-o.relativeTimeSec),emotes:{provider:"7tv",fetchedAt:"",emotes:[...n.values()]},gifAssets:Object.assign({},...e.map(r=>r.gifAssets))}}function yp(e,t,n){let r=o=>o==null?o:o+n;return e.endsWith("/events")?{...t,events:(t.events??[]).map(o=>({...o,startedAtSec:r(o.startedAtSec),lockedAtSec:r(o.lockedAtSec),endedAtSec:r(o.endedAtSec),samples:o.samples.map(l=>({...l,atSec:r(l.atSec)}))}))}:e.endsWith("/timeline")?{...t,points:t.points.map(o=>({...o,relativeTimeSec:r(o.relativeTimeSec)})),segments:t.segments.map(o=>({...o,startSec:r(o.startSec),endSec:r(o.endSec)})),titles:t.titles.map(o=>({...o,atSec:r(o.atSec)}))}:t}var Yt=B(le());function Lg({options:e}){let[t,n]=(0,St.useState)(null),[r,o]=(0,St.useState)(!1),[l,i]=(0,St.useState)(0),[s,u]=(0,St.useState)(""),c=e.sessions.map(f=>f.id).join(",")+":"+e.vodStartMs,[h,g]=(0,St.useState)({});return(0,St.useEffect)(()=>{let f=!1;if(n(null),o(!1),!!e.sessions.length)return(async()=>{let m={},w=[];for(let v of e.sessions){let k=`public/streams/${v.id}`,d;try{d=await Kl(k+"/chat",()=>f,p=>Ie(p))}catch{d=await Ie(k+"/chat-replay")}if(f||!d)return;let a=mp(v,e.vodStartMs,d);m[v.id]=a,w.push(gp(d,a,e.vodStartMs))}f||(g(m),n(vp(w)))})().catch(()=>{f||o(!0)}),()=>{f=!0}},[c,l]),(0,St.useEffect)(()=>{let f=e.video,m=()=>{let w=(f?.currentTime??0)+e.offset,v=e.sessions.slice().sort((d,a)=>(h[d.id]??0)-(h[a.id]??0)),k=v.filter(d=>(h[d.id]??0)<=w).at(-1)??v[0];u(k?.id??"")};return m(),f?.addEventListener("timeupdate",m),f?.addEventListener("seeked",m),()=>{f?.removeEventListener("timeupdate",m),f?.removeEventListener("seeked",m)}},[e.video,e.offset,c,h]),xf(e.server,e.request,(f,m)=>{let w=f.split("/")[2];return yp(f,m,h[w]??0)}),r?(0,Yt.jsxs)("div",{className:"notice error",children:["\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0447\u0430\u0442. ",(0,Yt.jsx)("button",{onClick:()=>i(f=>f+1),children:"\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C"})]}):t?(0,Yt.jsx)(jl.Provider,{value:{locale:e.locale??"ru",spoilerFree:e.spoilerFree},children:(0,Yt.jsx)(hp,{staticData:t,archiveId:`twitch:${c}`,historySessionId:s,liveEmotesUrl:s?`public/streams/${s}/emotes/live`:void 0,timelineUrl:s?`public/streams/${s}/timeline`:void 0,eventsUrl:s?`public/streams/${s}/events`:void 0,videoElement:e.video,isLive:!1,externalOffsetSec:-e.offset,onExternalOffsetChange:f=>e.onOffsetChange(-f)})}):(0,Yt.jsx)("div",{className:"notice",children:e.sessions.length?"\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0447\u0430\u0442\u0430\u2026":"\u0418\u0449\u0443 \u0437\u0430\u043F\u0438\u0441\u044C \u044D\u0442\u043E\u0433\u043E \u044D\u0444\u0438\u0440\u0430\u2026"})}function Ig(e,t){try{if(!localStorage.getItem("tsr-chat-prefs")){let s=JSON.parse(localStorage.getItem("tsr-chat-view")||"null");s&&localStorage.setItem("tsr-chat-prefs",JSON.stringify({fontPx:s.fontPx,emotePx:(s.emoteScale||1.5)*(s.fontPx||13),showTimestamps:s.showTime,stripes:s.zebra,readableColors:s.readable,showDeleted:s.showDeleted,highlightFirstMessage:s.firstMsg,keywords:s.highlight}))}}catch{}let n=e.attachShadow({mode:"open"});n.addEventListener("keydown",s=>s.stopPropagation()),n.addEventListener("keyup",s=>s.stopPropagation());let r=document.createElement("style");r.textContent=`:host {
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
`;let o=document.createElement("div");o.className="tsr-shared-chat",n.append(r,o);let l=(0,wp.createRoot)(o),i=s=>l.render((0,Yt.jsx)(Lg,{options:s},s.sessions.map(u=>u.id).join(",")+":"+s.vodStartMs));return i(t),{update:i,unmount:()=>l.unmount()}}return jp($g);})();
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
