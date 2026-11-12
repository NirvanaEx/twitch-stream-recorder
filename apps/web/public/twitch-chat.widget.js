/* tsr-chat-widget */
var TSRChatWidget=(()=>{var Wp=Object.create;var dr=Object.defineProperty;var Qp=Object.getOwnPropertyDescriptor;var Kp=Object.getOwnPropertyNames;var Gp=Object.getPrototypeOf,Yp=Object.prototype.hasOwnProperty;var Zp=(e,t,n)=>t in e?dr(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var ft=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),Xp=(e,t)=>{for(var n in t)dr(e,n,{get:t[n],enumerable:!0})},Ku=(e,t,n,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of Kp(t))!Yp.call(e,o)&&o!==n&&dr(e,o,{get:()=>t[o],enumerable:!(r=Qp(t,o))||r.enumerable});return e};var B=(e,t,n)=>(n=e!=null?Wp(Gp(e)):{},Ku(t||!e||!e.__esModule?dr(n,"default",{value:e,enumerable:!0}):n,e)),Jp=e=>Ku(dr({},"__esModule",{value:!0}),e);var se=(e,t,n)=>Zp(e,typeof t!="symbol"?t+"":t,n);var la=ft(z=>{"use strict";var fr=Symbol.for("react.element"),qp=Symbol.for("react.portal"),eh=Symbol.for("react.fragment"),th=Symbol.for("react.strict_mode"),nh=Symbol.for("react.profiler"),rh=Symbol.for("react.provider"),oh=Symbol.for("react.context"),lh=Symbol.for("react.forward_ref"),ih=Symbol.for("react.suspense"),sh=Symbol.for("react.memo"),uh=Symbol.for("react.lazy"),Gu=Symbol.iterator;function ah(e){return e===null||typeof e!="object"?null:(e=Gu&&e[Gu]||e["@@iterator"],typeof e=="function"?e:null)}var Xu={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Ju=Object.assign,qu={};function En(e,t,n){this.props=e,this.context=t,this.refs=qu,this.updater=n||Xu}En.prototype.isReactComponent={};En.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};En.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function ea(){}ea.prototype=En.prototype;function fi(e,t,n){this.props=e,this.context=t,this.refs=qu,this.updater=n||Xu}var pi=fi.prototype=new ea;pi.constructor=fi;Ju(pi,En.prototype);pi.isPureReactComponent=!0;var Yu=Array.isArray,ta=Object.prototype.hasOwnProperty,hi={current:null},na={key:!0,ref:!0,__self:!0,__source:!0};function ra(e,t,n){var r,o={},l=null,i=null;if(t!=null)for(r in t.ref!==void 0&&(i=t.ref),t.key!==void 0&&(l=""+t.key),t)ta.call(t,r)&&!na.hasOwnProperty(r)&&(o[r]=t[r]);var s=arguments.length-2;if(s===1)o.children=n;else if(1<s){for(var u=Array(s),a=0;a<s;a++)u[a]=arguments[a+2];o.children=u}if(e&&e.defaultProps)for(r in s=e.defaultProps,s)o[r]===void 0&&(o[r]=s[r]);return{$$typeof:fr,type:e,key:l,ref:i,props:o,_owner:hi.current}}function ch(e,t){return{$$typeof:fr,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function mi(e){return typeof e=="object"&&e!==null&&e.$$typeof===fr}function dh(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var Zu=/\/+/g;function di(e,t){return typeof e=="object"&&e!==null&&e.key!=null?dh(""+e.key):t.toString(36)}function Co(e,t,n,r,o){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var i=!1;if(e===null)i=!0;else switch(l){case"string":case"number":i=!0;break;case"object":switch(e.$$typeof){case fr:case qp:i=!0}}if(i)return i=e,o=o(i),e=r===""?"."+di(i,0):r,Yu(o)?(n="",e!=null&&(n=e.replace(Zu,"$&/")+"/"),Co(o,t,n,"",function(a){return a})):o!=null&&(mi(o)&&(o=ch(o,n+(!o.key||i&&i.key===o.key?"":(""+o.key).replace(Zu,"$&/")+"/")+e)),t.push(o)),1;if(i=0,r=r===""?".":r+":",Yu(e))for(var s=0;s<e.length;s++){l=e[s];var u=r+di(l,s);i+=Co(l,t,n,u,o)}else if(u=ah(e),typeof u=="function")for(e=u.call(e),s=0;!(l=e.next()).done;)l=l.value,u=r+di(l,s++),i+=Co(l,t,n,u,o);else if(l==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return i}function wo(e,t,n){if(e==null)return e;var r=[],o=0;return Co(e,r,"","",function(l){return t.call(n,l,o++)}),r}function fh(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var ye={current:null},_o={transition:null},ph={ReactCurrentDispatcher:ye,ReactCurrentBatchConfig:_o,ReactCurrentOwner:hi};function oa(){throw Error("act(...) is not supported in production builds of React.")}z.Children={map:wo,forEach:function(e,t,n){wo(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return wo(e,function(){t++}),t},toArray:function(e){return wo(e,function(t){return t})||[]},only:function(e){if(!mi(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};z.Component=En;z.Fragment=eh;z.Profiler=nh;z.PureComponent=fi;z.StrictMode=th;z.Suspense=ih;z.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=ph;z.act=oa;z.cloneElement=function(e,t,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=Ju({},e.props),o=e.key,l=e.ref,i=e._owner;if(t!=null){if(t.ref!==void 0&&(l=t.ref,i=hi.current),t.key!==void 0&&(o=""+t.key),e.type&&e.type.defaultProps)var s=e.type.defaultProps;for(u in t)ta.call(t,u)&&!na.hasOwnProperty(u)&&(r[u]=t[u]===void 0&&s!==void 0?s[u]:t[u])}var u=arguments.length-2;if(u===1)r.children=n;else if(1<u){s=Array(u);for(var a=0;a<u;a++)s[a]=arguments[a+2];r.children=s}return{$$typeof:fr,type:e.type,key:o,ref:l,props:r,_owner:i}};z.createContext=function(e){return e={$$typeof:oh,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:rh,_context:e},e.Consumer=e};z.createElement=ra;z.createFactory=function(e){var t=ra.bind(null,e);return t.type=e,t};z.createRef=function(){return{current:null}};z.forwardRef=function(e){return{$$typeof:lh,render:e}};z.isValidElement=mi;z.lazy=function(e){return{$$typeof:uh,_payload:{_status:-1,_result:e},_init:fh}};z.memo=function(e,t){return{$$typeof:sh,type:e,compare:t===void 0?null:t}};z.startTransition=function(e){var t=_o.transition;_o.transition={};try{e()}finally{_o.transition=t}};z.unstable_act=oa;z.useCallback=function(e,t){return ye.current.useCallback(e,t)};z.useContext=function(e){return ye.current.useContext(e)};z.useDebugValue=function(){};z.useDeferredValue=function(e){return ye.current.useDeferredValue(e)};z.useEffect=function(e,t){return ye.current.useEffect(e,t)};z.useId=function(){return ye.current.useId()};z.useImperativeHandle=function(e,t,n){return ye.current.useImperativeHandle(e,t,n)};z.useInsertionEffect=function(e,t){return ye.current.useInsertionEffect(e,t)};z.useLayoutEffect=function(e,t){return ye.current.useLayoutEffect(e,t)};z.useMemo=function(e,t){return ye.current.useMemo(e,t)};z.useReducer=function(e,t,n){return ye.current.useReducer(e,t,n)};z.useRef=function(e){return ye.current.useRef(e)};z.useState=function(e){return ye.current.useState(e)};z.useSyncExternalStore=function(e,t,n){return ye.current.useSyncExternalStore(e,t,n)};z.useTransition=function(){return ye.current.useTransition()};z.version="18.3.1"});var Ke=ft((r0,ia)=>{"use strict";ia.exports=la()});var ga=ft(j=>{"use strict";function wi(e,t){var n=e.length;e.push(t);e:for(;0<n;){var r=n-1>>>1,o=e[r];if(0<ko(o,t))e[r]=t,e[n]=o,n=r;else break e}}function Ge(e){return e.length===0?null:e[0]}function Eo(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;e:for(var r=0,o=e.length,l=o>>>1;r<l;){var i=2*(r+1)-1,s=e[i],u=i+1,a=e[u];if(0>ko(s,n))u<o&&0>ko(a,s)?(e[r]=a,e[u]=n,r=u):(e[r]=s,e[i]=n,r=i);else if(u<o&&0>ko(a,n))e[r]=a,e[u]=n,r=u;else break e}}return t}function ko(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}typeof performance=="object"&&typeof performance.now=="function"?(sa=performance,j.unstable_now=function(){return sa.now()}):(gi=Date,ua=gi.now(),j.unstable_now=function(){return gi.now()-ua});var sa,gi,ua,rt=[],Nt=[],hh=1,be=null,pe=3,Do=!1,tn=!1,hr=!1,da=typeof setTimeout=="function"?setTimeout:null,fa=typeof clearTimeout=="function"?clearTimeout:null,aa=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function Ci(e){for(var t=Ge(Nt);t!==null;){if(t.callback===null)Eo(Nt);else if(t.startTime<=e)Eo(Nt),t.sortIndex=t.expirationTime,wi(rt,t);else break;t=Ge(Nt)}}function _i(e){if(hr=!1,Ci(e),!tn)if(Ge(rt)!==null)tn=!0,xi(ki);else{var t=Ge(Nt);t!==null&&Ei(_i,t.startTime-e)}}function ki(e,t){tn=!1,hr&&(hr=!1,fa(mr),mr=-1),Do=!0;var n=pe;try{for(Ci(t),be=Ge(rt);be!==null&&(!(be.expirationTime>t)||e&&!ma());){var r=be.callback;if(typeof r=="function"){be.callback=null,pe=be.priorityLevel;var o=r(be.expirationTime<=t);t=j.unstable_now(),typeof o=="function"?be.callback=o:be===Ge(rt)&&Eo(rt),Ci(t)}else Eo(rt);be=Ge(rt)}if(be!==null)var l=!0;else{var i=Ge(Nt);i!==null&&Ei(_i,i.startTime-t),l=!1}return l}finally{be=null,pe=n,Do=!1}}var So=!1,xo=null,mr=-1,pa=5,ha=-1;function ma(){return!(j.unstable_now()-ha<pa)}function vi(){if(xo!==null){var e=j.unstable_now();ha=e;var t=!0;try{t=xo(!0,e)}finally{t?pr():(So=!1,xo=null)}}else So=!1}var pr;typeof aa=="function"?pr=function(){aa(vi)}:typeof MessageChannel<"u"?(yi=new MessageChannel,ca=yi.port2,yi.port1.onmessage=vi,pr=function(){ca.postMessage(null)}):pr=function(){da(vi,0)};var yi,ca;function xi(e){xo=e,So||(So=!0,pr())}function Ei(e,t){mr=da(function(){e(j.unstable_now())},t)}j.unstable_IdlePriority=5;j.unstable_ImmediatePriority=1;j.unstable_LowPriority=4;j.unstable_NormalPriority=3;j.unstable_Profiling=null;j.unstable_UserBlockingPriority=2;j.unstable_cancelCallback=function(e){e.callback=null};j.unstable_continueExecution=function(){tn||Do||(tn=!0,xi(ki))};j.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):pa=0<e?Math.floor(1e3/e):5};j.unstable_getCurrentPriorityLevel=function(){return pe};j.unstable_getFirstCallbackNode=function(){return Ge(rt)};j.unstable_next=function(e){switch(pe){case 1:case 2:case 3:var t=3;break;default:t=pe}var n=pe;pe=t;try{return e()}finally{pe=n}};j.unstable_pauseExecution=function(){};j.unstable_requestPaint=function(){};j.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=pe;pe=e;try{return t()}finally{pe=n}};j.unstable_scheduleCallback=function(e,t,n){var r=j.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?r+n:r):n=r,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=n+o,e={id:hh++,callback:t,priorityLevel:e,startTime:n,expirationTime:o,sortIndex:-1},n>r?(e.sortIndex=n,wi(Nt,e),Ge(rt)===null&&e===Ge(Nt)&&(hr?(fa(mr),mr=-1):hr=!0,Ei(_i,n-r))):(e.sortIndex=o,wi(rt,e),tn||Do||(tn=!0,xi(ki))),e};j.unstable_shouldYield=ma;j.unstable_wrapCallback=function(e){var t=pe;return function(){var n=pe;pe=t;try{return e.apply(this,arguments)}finally{pe=n}}}});var ya=ft((l0,va)=>{"use strict";va.exports=ga()});var xf=ft(Ie=>{"use strict";var mh=Ke(),ze=ya();function C(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Dc=new Set,$r={};function mn(e,t){Wn(e,t),Wn(e+"Capture",t)}function Wn(e,t){for($r[e]=t,e=0;e<t.length;e++)Dc.add(t[e])}var yt=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Ki=Object.prototype.hasOwnProperty,gh=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,wa={},Ca={};function vh(e){return Ki.call(Ca,e)?!0:Ki.call(wa,e)?!1:gh.test(e)?Ca[e]=!0:(wa[e]=!0,!1)}function yh(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function wh(e,t,n,r){if(t===null||typeof t>"u"||yh(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function _e(e,t,n,r,o,l,i){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=o,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=l,this.removeEmptyString=i}var fe={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){fe[e]=new _e(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];fe[t]=new _e(t,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){fe[e]=new _e(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){fe[e]=new _e(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){fe[e]=new _e(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){fe[e]=new _e(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){fe[e]=new _e(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){fe[e]=new _e(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){fe[e]=new _e(e,5,!1,e.toLowerCase(),null,!1,!1)});var Bs=/[\-:]([a-z])/g;function bs(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Bs,bs);fe[t]=new _e(t,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Bs,bs);fe[t]=new _e(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Bs,bs);fe[t]=new _e(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){fe[e]=new _e(e,1,!1,e.toLowerCase(),null,!1,!1)});fe.xlinkHref=new _e("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){fe[e]=new _e(e,1,!1,e.toLowerCase(),null,!0,!0)});function js(e,t,n,r){var o=fe.hasOwnProperty(t)?fe[t]:null;(o!==null?o.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(wh(t,n,o,r)&&(n=null),r||o===null?vh(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):o.mustUseProperty?e[o.propertyName]=n===null?o.type===3?!1:"":n:(t=o.attributeName,r=o.attributeNamespace,n===null?e.removeAttribute(t):(o=o.type,n=o===3||o===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var kt=mh.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Fo=Symbol.for("react.element"),Fn=Symbol.for("react.portal"),Pn=Symbol.for("react.fragment"),Us=Symbol.for("react.strict_mode"),Gi=Symbol.for("react.profiler"),Sc=Symbol.for("react.provider"),Fc=Symbol.for("react.context"),Hs=Symbol.for("react.forward_ref"),Yi=Symbol.for("react.suspense"),Zi=Symbol.for("react.suspense_list"),Vs=Symbol.for("react.memo"),Rt=Symbol.for("react.lazy"),Pc=Symbol.for("react.offscreen"),_a=Symbol.iterator;function gr(e){return e===null||typeof e!="object"?null:(e=_a&&e[_a]||e["@@iterator"],typeof e=="function"?e:null)}var J=Object.assign,Di;function Er(e){if(Di===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);Di=t&&t[1]||""}return`
`+Di+e}var Si=!1;function Fi(e,t){if(!e||Si)return"";Si=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(a){var r=a}Reflect.construct(e,[],t)}else{try{t.call()}catch(a){r=a}e.call(t.prototype)}else{try{throw Error()}catch(a){r=a}e()}}catch(a){if(a&&r&&typeof a.stack=="string"){for(var o=a.stack.split(`
`),l=r.stack.split(`
`),i=o.length-1,s=l.length-1;1<=i&&0<=s&&o[i]!==l[s];)s--;for(;1<=i&&0<=s;i--,s--)if(o[i]!==l[s]){if(i!==1||s!==1)do if(i--,s--,0>s||o[i]!==l[s]){var u=`
`+o[i].replace(" at new "," at ");return e.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",e.displayName)),u}while(1<=i&&0<=s);break}}}finally{Si=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?Er(e):""}function Ch(e){switch(e.tag){case 5:return Er(e.type);case 16:return Er("Lazy");case 13:return Er("Suspense");case 19:return Er("SuspenseList");case 0:case 2:case 15:return e=Fi(e.type,!1),e;case 11:return e=Fi(e.type.render,!1),e;case 1:return e=Fi(e.type,!0),e;default:return""}}function Xi(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Pn:return"Fragment";case Fn:return"Portal";case Gi:return"Profiler";case Us:return"StrictMode";case Yi:return"Suspense";case Zi:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case Fc:return(e.displayName||"Context")+".Consumer";case Sc:return(e._context.displayName||"Context")+".Provider";case Hs:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Vs:return t=e.displayName||null,t!==null?t:Xi(e.type)||"Memo";case Rt:t=e._payload,e=e._init;try{return Xi(e(t))}catch{}}return null}function _h(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Xi(t);case 8:return t===Us?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function Wt(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Nc(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function kh(e){var t=Nc(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,l=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(i){r=""+i,l.call(this,i)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(i){r=""+i},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Po(e){e._valueTracker||(e._valueTracker=kh(e))}function Tc(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=Nc(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function nl(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Ji(e,t){var n=t.checked;return J({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function ka(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=Wt(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function Rc(e,t){t=t.checked,t!=null&&js(e,"checked",t,!1)}function qi(e,t){Rc(e,t);var n=Wt(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?es(e,t.type,n):t.hasOwnProperty("defaultValue")&&es(e,t.type,Wt(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function xa(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function es(e,t,n){(t!=="number"||nl(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var Dr=Array.isArray;function Bn(e,t,n,r){if(e=e.options,t){t={};for(var o=0;o<n.length;o++)t["$"+n[o]]=!0;for(n=0;n<e.length;n++)o=t.hasOwnProperty("$"+e[n].value),e[n].selected!==o&&(e[n].selected=o),o&&r&&(e[n].defaultSelected=!0)}else{for(n=""+Wt(n),t=null,o=0;o<e.length;o++){if(e[o].value===n){e[o].selected=!0,r&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function ts(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(C(91));return J({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function Ea(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(C(92));if(Dr(n)){if(1<n.length)throw Error(C(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:Wt(n)}}function Mc(e,t){var n=Wt(t.value),r=Wt(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function Da(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function Ac(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function ns(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?Ac(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var No,zc=(function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,o){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,o)})}:e})(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(No=No||document.createElement("div"),No.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=No.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function Or(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Pr={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},xh=["Webkit","ms","Moz","O"];Object.keys(Pr).forEach(function(e){xh.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Pr[t]=Pr[e]})});function Lc(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||Pr.hasOwnProperty(e)&&Pr[e]?(""+t).trim():t+"px"}function Ic(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,o=Lc(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,o):e[n]=o}}var Eh=J({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function rs(e,t){if(t){if(Eh[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(C(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(C(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(C(61))}if(t.style!=null&&typeof t.style!="object")throw Error(C(62))}}function os(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var ls=null;function Ws(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var is=null,bn=null,jn=null;function Sa(e){if(e=no(e)){if(typeof is!="function")throw Error(C(280));var t=e.stateNode;t&&(t=Tl(t),is(e.stateNode,e.type,t))}}function $c(e){bn?jn?jn.push(e):jn=[e]:bn=e}function Oc(){if(bn){var e=bn,t=jn;if(jn=bn=null,Sa(e),t)for(e=0;e<t.length;e++)Sa(t[e])}}function Bc(e,t){return e(t)}function bc(){}var Pi=!1;function jc(e,t,n){if(Pi)return e(t,n);Pi=!0;try{return Bc(e,t,n)}finally{Pi=!1,(bn!==null||jn!==null)&&(bc(),Oc())}}function Br(e,t){var n=e.stateNode;if(n===null)return null;var r=Tl(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(C(231,t,typeof n));return n}var ss=!1;if(yt)try{Dn={},Object.defineProperty(Dn,"passive",{get:function(){ss=!0}}),window.addEventListener("test",Dn,Dn),window.removeEventListener("test",Dn,Dn)}catch{ss=!1}var Dn;function Dh(e,t,n,r,o,l,i,s,u){var a=Array.prototype.slice.call(arguments,3);try{t.apply(n,a)}catch(h){this.onError(h)}}var Nr=!1,rl=null,ol=!1,us=null,Sh={onError:function(e){Nr=!0,rl=e}};function Fh(e,t,n,r,o,l,i,s,u){Nr=!1,rl=null,Dh.apply(Sh,arguments)}function Ph(e,t,n,r,o,l,i,s,u){if(Fh.apply(this,arguments),Nr){if(Nr){var a=rl;Nr=!1,rl=null}else throw Error(C(198));ol||(ol=!0,us=a)}}function gn(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function Uc(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Fa(e){if(gn(e)!==e)throw Error(C(188))}function Nh(e){var t=e.alternate;if(!t){if(t=gn(e),t===null)throw Error(C(188));return t!==e?null:e}for(var n=e,r=t;;){var o=n.return;if(o===null)break;var l=o.alternate;if(l===null){if(r=o.return,r!==null){n=r;continue}break}if(o.child===l.child){for(l=o.child;l;){if(l===n)return Fa(o),e;if(l===r)return Fa(o),t;l=l.sibling}throw Error(C(188))}if(n.return!==r.return)n=o,r=l;else{for(var i=!1,s=o.child;s;){if(s===n){i=!0,n=o,r=l;break}if(s===r){i=!0,r=o,n=l;break}s=s.sibling}if(!i){for(s=l.child;s;){if(s===n){i=!0,n=l,r=o;break}if(s===r){i=!0,r=l,n=o;break}s=s.sibling}if(!i)throw Error(C(189))}}if(n.alternate!==r)throw Error(C(190))}if(n.tag!==3)throw Error(C(188));return n.stateNode.current===n?e:t}function Hc(e){return e=Nh(e),e!==null?Vc(e):null}function Vc(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=Vc(e);if(t!==null)return t;e=e.sibling}return null}var Wc=ze.unstable_scheduleCallback,Pa=ze.unstable_cancelCallback,Th=ze.unstable_shouldYield,Rh=ze.unstable_requestPaint,te=ze.unstable_now,Mh=ze.unstable_getCurrentPriorityLevel,Qs=ze.unstable_ImmediatePriority,Qc=ze.unstable_UserBlockingPriority,ll=ze.unstable_NormalPriority,Ah=ze.unstable_LowPriority,Kc=ze.unstable_IdlePriority,Sl=null,st=null;function zh(e){if(st&&typeof st.onCommitFiberRoot=="function")try{st.onCommitFiberRoot(Sl,e,void 0,(e.current.flags&128)===128)}catch{}}var qe=Math.clz32?Math.clz32:$h,Lh=Math.log,Ih=Math.LN2;function $h(e){return e>>>=0,e===0?32:31-(Lh(e)/Ih|0)|0}var To=64,Ro=4194304;function Sr(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function il(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,o=e.suspendedLanes,l=e.pingedLanes,i=n&268435455;if(i!==0){var s=i&~o;s!==0?r=Sr(s):(l&=i,l!==0&&(r=Sr(l)))}else i=n&~o,i!==0?r=Sr(i):l!==0&&(r=Sr(l));if(r===0)return 0;if(t!==0&&t!==r&&(t&o)===0&&(o=r&-r,l=t&-t,o>=l||o===16&&(l&4194240)!==0))return t;if((r&4)!==0&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-qe(t),o=1<<n,r|=e[n],t&=~o;return r}function Oh(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Bh(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,o=e.expirationTimes,l=e.pendingLanes;0<l;){var i=31-qe(l),s=1<<i,u=o[i];u===-1?((s&n)===0||(s&r)!==0)&&(o[i]=Oh(s,t)):u<=t&&(e.expiredLanes|=s),l&=~s}}function as(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Gc(){var e=To;return To<<=1,(To&4194240)===0&&(To=64),e}function Ni(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function eo(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-qe(t),e[t]=n}function bh(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var o=31-qe(n),l=1<<o;t[o]=0,r[o]=-1,e[o]=-1,n&=~l}}function Ks(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-qe(n),o=1<<r;o&t|e[r]&t&&(e[r]|=t),n&=~o}}var O=0;function Yc(e){return e&=-e,1<e?4<e?(e&268435455)!==0?16:536870912:4:1}var Zc,Gs,Xc,Jc,qc,cs=!1,Mo=[],$t=null,Ot=null,Bt=null,br=new Map,jr=new Map,At=[],jh="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Na(e,t){switch(e){case"focusin":case"focusout":$t=null;break;case"dragenter":case"dragleave":Ot=null;break;case"mouseover":case"mouseout":Bt=null;break;case"pointerover":case"pointerout":br.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":jr.delete(t.pointerId)}}function vr(e,t,n,r,o,l){return e===null||e.nativeEvent!==l?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:l,targetContainers:[o]},t!==null&&(t=no(t),t!==null&&Gs(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function Uh(e,t,n,r,o){switch(t){case"focusin":return $t=vr($t,e,t,n,r,o),!0;case"dragenter":return Ot=vr(Ot,e,t,n,r,o),!0;case"mouseover":return Bt=vr(Bt,e,t,n,r,o),!0;case"pointerover":var l=o.pointerId;return br.set(l,vr(br.get(l)||null,e,t,n,r,o)),!0;case"gotpointercapture":return l=o.pointerId,jr.set(l,vr(jr.get(l)||null,e,t,n,r,o)),!0}return!1}function ed(e){var t=on(e.target);if(t!==null){var n=gn(t);if(n!==null){if(t=n.tag,t===13){if(t=Uc(n),t!==null){e.blockedOn=t,qc(e.priority,function(){Xc(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Qo(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=ds(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);ls=r,n.target.dispatchEvent(r),ls=null}else return t=no(n),t!==null&&Gs(t),e.blockedOn=n,!1;t.shift()}return!0}function Ta(e,t,n){Qo(e)&&n.delete(t)}function Hh(){cs=!1,$t!==null&&Qo($t)&&($t=null),Ot!==null&&Qo(Ot)&&(Ot=null),Bt!==null&&Qo(Bt)&&(Bt=null),br.forEach(Ta),jr.forEach(Ta)}function yr(e,t){e.blockedOn===t&&(e.blockedOn=null,cs||(cs=!0,ze.unstable_scheduleCallback(ze.unstable_NormalPriority,Hh)))}function Ur(e){function t(o){return yr(o,e)}if(0<Mo.length){yr(Mo[0],e);for(var n=1;n<Mo.length;n++){var r=Mo[n];r.blockedOn===e&&(r.blockedOn=null)}}for($t!==null&&yr($t,e),Ot!==null&&yr(Ot,e),Bt!==null&&yr(Bt,e),br.forEach(t),jr.forEach(t),n=0;n<At.length;n++)r=At[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<At.length&&(n=At[0],n.blockedOn===null);)ed(n),n.blockedOn===null&&At.shift()}var Un=kt.ReactCurrentBatchConfig,sl=!0;function Vh(e,t,n,r){var o=O,l=Un.transition;Un.transition=null;try{O=1,Ys(e,t,n,r)}finally{O=o,Un.transition=l}}function Wh(e,t,n,r){var o=O,l=Un.transition;Un.transition=null;try{O=4,Ys(e,t,n,r)}finally{O=o,Un.transition=l}}function Ys(e,t,n,r){if(sl){var o=ds(e,t,n,r);if(o===null)Ii(e,t,r,ul,n),Na(e,r);else if(Uh(o,e,t,n,r))r.stopPropagation();else if(Na(e,r),t&4&&-1<jh.indexOf(e)){for(;o!==null;){var l=no(o);if(l!==null&&Zc(l),l=ds(e,t,n,r),l===null&&Ii(e,t,r,ul,n),l===o)break;o=l}o!==null&&r.stopPropagation()}else Ii(e,t,r,null,n)}}var ul=null;function ds(e,t,n,r){if(ul=null,e=Ws(r),e=on(e),e!==null)if(t=gn(e),t===null)e=null;else if(n=t.tag,n===13){if(e=Uc(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return ul=e,null}function td(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Mh()){case Qs:return 1;case Qc:return 4;case ll:case Ah:return 16;case Kc:return 536870912;default:return 16}default:return 16}}var Lt=null,Zs=null,Ko=null;function nd(){if(Ko)return Ko;var e,t=Zs,n=t.length,r,o="value"in Lt?Lt.value:Lt.textContent,l=o.length;for(e=0;e<n&&t[e]===o[e];e++);var i=n-e;for(r=1;r<=i&&t[n-r]===o[l-r];r++);return Ko=o.slice(e,1<r?1-r:void 0)}function Go(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Ao(){return!0}function Ra(){return!1}function Le(e){function t(n,r,o,l,i){this._reactName=n,this._targetInst=o,this.type=r,this.nativeEvent=l,this.target=i,this.currentTarget=null;for(var s in e)e.hasOwnProperty(s)&&(n=e[s],this[s]=n?n(l):l[s]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?Ao:Ra,this.isPropagationStopped=Ra,this}return J(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Ao)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Ao)},persist:function(){},isPersistent:Ao}),t}var Jn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Xs=Le(Jn),to=J({},Jn,{view:0,detail:0}),Qh=Le(to),Ti,Ri,wr,Fl=J({},to,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Js,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==wr&&(wr&&e.type==="mousemove"?(Ti=e.screenX-wr.screenX,Ri=e.screenY-wr.screenY):Ri=Ti=0,wr=e),Ti)},movementY:function(e){return"movementY"in e?e.movementY:Ri}}),Ma=Le(Fl),Kh=J({},Fl,{dataTransfer:0}),Gh=Le(Kh),Yh=J({},to,{relatedTarget:0}),Mi=Le(Yh),Zh=J({},Jn,{animationName:0,elapsedTime:0,pseudoElement:0}),Xh=Le(Zh),Jh=J({},Jn,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),qh=Le(Jh),em=J({},Jn,{data:0}),Aa=Le(em),tm={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},nm={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},rm={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function om(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=rm[e])?!!t[e]:!1}function Js(){return om}var lm=J({},to,{key:function(e){if(e.key){var t=tm[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Go(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?nm[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Js,charCode:function(e){return e.type==="keypress"?Go(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Go(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),im=Le(lm),sm=J({},Fl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),za=Le(sm),um=J({},to,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Js}),am=Le(um),cm=J({},Jn,{propertyName:0,elapsedTime:0,pseudoElement:0}),dm=Le(cm),fm=J({},Fl,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),pm=Le(fm),hm=[9,13,27,32],qs=yt&&"CompositionEvent"in window,Tr=null;yt&&"documentMode"in document&&(Tr=document.documentMode);var mm=yt&&"TextEvent"in window&&!Tr,rd=yt&&(!qs||Tr&&8<Tr&&11>=Tr),La=" ",Ia=!1;function od(e,t){switch(e){case"keyup":return hm.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function ld(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Nn=!1;function gm(e,t){switch(e){case"compositionend":return ld(t);case"keypress":return t.which!==32?null:(Ia=!0,La);case"textInput":return e=t.data,e===La&&Ia?null:e;default:return null}}function vm(e,t){if(Nn)return e==="compositionend"||!qs&&od(e,t)?(e=nd(),Ko=Zs=Lt=null,Nn=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return rd&&t.locale!=="ko"?null:t.data;default:return null}}var ym={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function $a(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!ym[e.type]:t==="textarea"}function id(e,t,n,r){$c(r),t=al(t,"onChange"),0<t.length&&(n=new Xs("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var Rr=null,Hr=null;function wm(e){vd(e,0)}function Pl(e){var t=Mn(e);if(Tc(t))return e}function Cm(e,t){if(e==="change")return t}var sd=!1;yt&&(yt?(Lo="oninput"in document,Lo||(Ai=document.createElement("div"),Ai.setAttribute("oninput","return;"),Lo=typeof Ai.oninput=="function"),zo=Lo):zo=!1,sd=zo&&(!document.documentMode||9<document.documentMode));var zo,Lo,Ai;function Oa(){Rr&&(Rr.detachEvent("onpropertychange",ud),Hr=Rr=null)}function ud(e){if(e.propertyName==="value"&&Pl(Hr)){var t=[];id(t,Hr,e,Ws(e)),jc(wm,t)}}function _m(e,t,n){e==="focusin"?(Oa(),Rr=t,Hr=n,Rr.attachEvent("onpropertychange",ud)):e==="focusout"&&Oa()}function km(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Pl(Hr)}function xm(e,t){if(e==="click")return Pl(t)}function Em(e,t){if(e==="input"||e==="change")return Pl(t)}function Dm(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var tt=typeof Object.is=="function"?Object.is:Dm;function Vr(e,t){if(tt(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var o=n[r];if(!Ki.call(t,o)||!tt(e[o],t[o]))return!1}return!0}function Ba(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function ba(e,t){var n=Ba(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Ba(n)}}function ad(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?ad(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function cd(){for(var e=window,t=nl();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=nl(e.document)}return t}function eu(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function Sm(e){var t=cd(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&ad(n.ownerDocument.documentElement,n)){if(r!==null&&eu(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var o=n.textContent.length,l=Math.min(r.start,o);r=r.end===void 0?l:Math.min(r.end,o),!e.extend&&l>r&&(o=r,r=l,l=o),o=ba(n,l);var i=ba(n,r);o&&i&&(e.rangeCount!==1||e.anchorNode!==o.node||e.anchorOffset!==o.offset||e.focusNode!==i.node||e.focusOffset!==i.offset)&&(t=t.createRange(),t.setStart(o.node,o.offset),e.removeAllRanges(),l>r?(e.addRange(t),e.extend(i.node,i.offset)):(t.setEnd(i.node,i.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var Fm=yt&&"documentMode"in document&&11>=document.documentMode,Tn=null,fs=null,Mr=null,ps=!1;function ja(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;ps||Tn==null||Tn!==nl(r)||(r=Tn,"selectionStart"in r&&eu(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Mr&&Vr(Mr,r)||(Mr=r,r=al(fs,"onSelect"),0<r.length&&(t=new Xs("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=Tn)))}function Io(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Rn={animationend:Io("Animation","AnimationEnd"),animationiteration:Io("Animation","AnimationIteration"),animationstart:Io("Animation","AnimationStart"),transitionend:Io("Transition","TransitionEnd")},zi={},dd={};yt&&(dd=document.createElement("div").style,"AnimationEvent"in window||(delete Rn.animationend.animation,delete Rn.animationiteration.animation,delete Rn.animationstart.animation),"TransitionEvent"in window||delete Rn.transitionend.transition);function Nl(e){if(zi[e])return zi[e];if(!Rn[e])return e;var t=Rn[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in dd)return zi[e]=t[n];return e}var fd=Nl("animationend"),pd=Nl("animationiteration"),hd=Nl("animationstart"),md=Nl("transitionend"),gd=new Map,Ua="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Kt(e,t){gd.set(e,t),mn(t,[e])}for($o=0;$o<Ua.length;$o++)Oo=Ua[$o],Ha=Oo.toLowerCase(),Va=Oo[0].toUpperCase()+Oo.slice(1),Kt(Ha,"on"+Va);var Oo,Ha,Va,$o;Kt(fd,"onAnimationEnd");Kt(pd,"onAnimationIteration");Kt(hd,"onAnimationStart");Kt("dblclick","onDoubleClick");Kt("focusin","onFocus");Kt("focusout","onBlur");Kt(md,"onTransitionEnd");Wn("onMouseEnter",["mouseout","mouseover"]);Wn("onMouseLeave",["mouseout","mouseover"]);Wn("onPointerEnter",["pointerout","pointerover"]);Wn("onPointerLeave",["pointerout","pointerover"]);mn("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));mn("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));mn("onBeforeInput",["compositionend","keypress","textInput","paste"]);mn("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));mn("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));mn("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Fr="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Pm=new Set("cancel close invalid load scroll toggle".split(" ").concat(Fr));function Wa(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,Ph(r,t,void 0,e),e.currentTarget=null}function vd(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],o=r.event;r=r.listeners;e:{var l=void 0;if(t)for(var i=r.length-1;0<=i;i--){var s=r[i],u=s.instance,a=s.currentTarget;if(s=s.listener,u!==l&&o.isPropagationStopped())break e;Wa(o,s,a),l=u}else for(i=0;i<r.length;i++){if(s=r[i],u=s.instance,a=s.currentTarget,s=s.listener,u!==l&&o.isPropagationStopped())break e;Wa(o,s,a),l=u}}}if(ol)throw e=us,ol=!1,us=null,e}function W(e,t){var n=t[ys];n===void 0&&(n=t[ys]=new Set);var r=e+"__bubble";n.has(r)||(yd(t,e,2,!1),n.add(r))}function Li(e,t,n){var r=0;t&&(r|=4),yd(n,e,r,t)}var Bo="_reactListening"+Math.random().toString(36).slice(2);function Wr(e){if(!e[Bo]){e[Bo]=!0,Dc.forEach(function(n){n!=="selectionchange"&&(Pm.has(n)||Li(n,!1,e),Li(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Bo]||(t[Bo]=!0,Li("selectionchange",!1,t))}}function yd(e,t,n,r){switch(td(t)){case 1:var o=Vh;break;case 4:o=Wh;break;default:o=Ys}n=o.bind(null,t,n,e),o=void 0,!ss||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),r?o!==void 0?e.addEventListener(t,n,{capture:!0,passive:o}):e.addEventListener(t,n,!0):o!==void 0?e.addEventListener(t,n,{passive:o}):e.addEventListener(t,n,!1)}function Ii(e,t,n,r,o){var l=r;if((t&1)===0&&(t&2)===0&&r!==null)e:for(;;){if(r===null)return;var i=r.tag;if(i===3||i===4){var s=r.stateNode.containerInfo;if(s===o||s.nodeType===8&&s.parentNode===o)break;if(i===4)for(i=r.return;i!==null;){var u=i.tag;if((u===3||u===4)&&(u=i.stateNode.containerInfo,u===o||u.nodeType===8&&u.parentNode===o))return;i=i.return}for(;s!==null;){if(i=on(s),i===null)return;if(u=i.tag,u===5||u===6){r=l=i;continue e}s=s.parentNode}}r=r.return}jc(function(){var a=l,h=Ws(n),m=[];e:{var f=gd.get(e);if(f!==void 0){var g=Xs,w=e;switch(e){case"keypress":if(Go(n)===0)break e;case"keydown":case"keyup":g=im;break;case"focusin":w="focus",g=Mi;break;case"focusout":w="blur",g=Mi;break;case"beforeblur":case"afterblur":g=Mi;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":g=Ma;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":g=Gh;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":g=am;break;case fd:case pd:case hd:g=Xh;break;case md:g=dm;break;case"scroll":g=Qh;break;case"wheel":g=pm;break;case"copy":case"cut":case"paste":g=qh;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":g=za}var v=(t&4)!==0,E=!v&&e==="scroll",d=v?f!==null?f+"Capture":null:f;v=[];for(var c=a,p;c!==null;){p=c;var y=p.stateNode;if(p.tag===5&&y!==null&&(p=y,d!==null&&(y=Br(c,d),y!=null&&v.push(Qr(c,y,p)))),E)break;c=c.return}0<v.length&&(f=new g(f,w,null,n,h),m.push({event:f,listeners:v}))}}if((t&7)===0){e:{if(f=e==="mouseover"||e==="pointerover",g=e==="mouseout"||e==="pointerout",f&&n!==ls&&(w=n.relatedTarget||n.fromElement)&&(on(w)||w[wt]))break e;if((g||f)&&(f=h.window===h?h:(f=h.ownerDocument)?f.defaultView||f.parentWindow:window,g?(w=n.relatedTarget||n.toElement,g=a,w=w?on(w):null,w!==null&&(E=gn(w),w!==E||w.tag!==5&&w.tag!==6)&&(w=null)):(g=null,w=a),g!==w)){if(v=Ma,y="onMouseLeave",d="onMouseEnter",c="mouse",(e==="pointerout"||e==="pointerover")&&(v=za,y="onPointerLeave",d="onPointerEnter",c="pointer"),E=g==null?f:Mn(g),p=w==null?f:Mn(w),f=new v(y,c+"leave",g,n,h),f.target=E,f.relatedTarget=p,y=null,on(h)===a&&(v=new v(d,c+"enter",w,n,h),v.target=p,v.relatedTarget=E,y=v),E=y,g&&w)t:{for(v=g,d=w,c=0,p=v;p;p=Sn(p))c++;for(p=0,y=d;y;y=Sn(y))p++;for(;0<c-p;)v=Sn(v),c--;for(;0<p-c;)d=Sn(d),p--;for(;c--;){if(v===d||d!==null&&v===d.alternate)break t;v=Sn(v),d=Sn(d)}v=null}else v=null;g!==null&&Qa(m,f,g,v,!1),w!==null&&E!==null&&Qa(m,E,w,v,!0)}}e:{if(f=a?Mn(a):window,g=f.nodeName&&f.nodeName.toLowerCase(),g==="select"||g==="input"&&f.type==="file")var D=Cm;else if($a(f))if(sd)D=Em;else{D=km;var _=_m}else(g=f.nodeName)&&g.toLowerCase()==="input"&&(f.type==="checkbox"||f.type==="radio")&&(D=xm);if(D&&(D=D(e,a))){id(m,D,n,h);break e}_&&_(e,f,a),e==="focusout"&&(_=f._wrapperState)&&_.controlled&&f.type==="number"&&es(f,"number",f.value)}switch(_=a?Mn(a):window,e){case"focusin":($a(_)||_.contentEditable==="true")&&(Tn=_,fs=a,Mr=null);break;case"focusout":Mr=fs=Tn=null;break;case"mousedown":ps=!0;break;case"contextmenu":case"mouseup":case"dragend":ps=!1,ja(m,n,h);break;case"selectionchange":if(Fm)break;case"keydown":case"keyup":ja(m,n,h)}var S;if(qs)e:{switch(e){case"compositionstart":var N="onCompositionStart";break e;case"compositionend":N="onCompositionEnd";break e;case"compositionupdate":N="onCompositionUpdate";break e}N=void 0}else Nn?od(e,n)&&(N="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(N="onCompositionStart");N&&(rd&&n.locale!=="ko"&&(Nn||N!=="onCompositionStart"?N==="onCompositionEnd"&&Nn&&(S=nd()):(Lt=h,Zs="value"in Lt?Lt.value:Lt.textContent,Nn=!0)),_=al(a,N),0<_.length&&(N=new Aa(N,e,null,n,h),m.push({event:N,listeners:_}),S?N.data=S:(S=ld(n),S!==null&&(N.data=S)))),(S=mm?gm(e,n):vm(e,n))&&(a=al(a,"onBeforeInput"),0<a.length&&(h=new Aa("onBeforeInput","beforeinput",null,n,h),m.push({event:h,listeners:a}),h.data=S))}vd(m,t)})}function Qr(e,t,n){return{instance:e,listener:t,currentTarget:n}}function al(e,t){for(var n=t+"Capture",r=[];e!==null;){var o=e,l=o.stateNode;o.tag===5&&l!==null&&(o=l,l=Br(e,n),l!=null&&r.unshift(Qr(e,l,o)),l=Br(e,t),l!=null&&r.push(Qr(e,l,o))),e=e.return}return r}function Sn(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function Qa(e,t,n,r,o){for(var l=t._reactName,i=[];n!==null&&n!==r;){var s=n,u=s.alternate,a=s.stateNode;if(u!==null&&u===r)break;s.tag===5&&a!==null&&(s=a,o?(u=Br(n,l),u!=null&&i.unshift(Qr(n,u,s))):o||(u=Br(n,l),u!=null&&i.push(Qr(n,u,s)))),n=n.return}i.length!==0&&e.push({event:t,listeners:i})}var Nm=/\r\n?/g,Tm=/\u0000|\uFFFD/g;function Ka(e){return(typeof e=="string"?e:""+e).replace(Nm,`
`).replace(Tm,"")}function bo(e,t,n){if(t=Ka(t),Ka(e)!==t&&n)throw Error(C(425))}function cl(){}var hs=null,ms=null;function gs(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var vs=typeof setTimeout=="function"?setTimeout:void 0,Rm=typeof clearTimeout=="function"?clearTimeout:void 0,Ga=typeof Promise=="function"?Promise:void 0,Mm=typeof queueMicrotask=="function"?queueMicrotask:typeof Ga<"u"?function(e){return Ga.resolve(null).then(e).catch(Am)}:vs;function Am(e){setTimeout(function(){throw e})}function $i(e,t){var n=t,r=0;do{var o=n.nextSibling;if(e.removeChild(n),o&&o.nodeType===8)if(n=o.data,n==="/$"){if(r===0){e.removeChild(o),Ur(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=o}while(n);Ur(t)}function bt(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function Ya(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var qn=Math.random().toString(36).slice(2),it="__reactFiber$"+qn,Kr="__reactProps$"+qn,wt="__reactContainer$"+qn,ys="__reactEvents$"+qn,zm="__reactListeners$"+qn,Lm="__reactHandles$"+qn;function on(e){var t=e[it];if(t)return t;for(var n=e.parentNode;n;){if(t=n[wt]||n[it]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=Ya(e);e!==null;){if(n=e[it])return n;e=Ya(e)}return t}e=n,n=e.parentNode}return null}function no(e){return e=e[it]||e[wt],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Mn(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(C(33))}function Tl(e){return e[Kr]||null}var ws=[],An=-1;function Gt(e){return{current:e}}function Q(e){0>An||(e.current=ws[An],ws[An]=null,An--)}function U(e,t){An++,ws[An]=e.current,e.current=t}var Qt={},ve=Gt(Qt),Ee=Gt(!1),cn=Qt;function Qn(e,t){var n=e.type.contextTypes;if(!n)return Qt;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var o={},l;for(l in n)o[l]=t[l];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=o),o}function De(e){return e=e.childContextTypes,e!=null}function dl(){Q(Ee),Q(ve)}function Za(e,t,n){if(ve.current!==Qt)throw Error(C(168));U(ve,t),U(Ee,n)}function wd(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var o in r)if(!(o in t))throw Error(C(108,_h(e)||"Unknown",o));return J({},n,r)}function fl(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Qt,cn=ve.current,U(ve,e),U(Ee,Ee.current),!0}function Xa(e,t,n){var r=e.stateNode;if(!r)throw Error(C(169));n?(e=wd(e,t,cn),r.__reactInternalMemoizedMergedChildContext=e,Q(Ee),Q(ve),U(ve,e)):Q(Ee),U(Ee,n)}var ht=null,Rl=!1,Oi=!1;function Cd(e){ht===null?ht=[e]:ht.push(e)}function Im(e){Rl=!0,Cd(e)}function Yt(){if(!Oi&&ht!==null){Oi=!0;var e=0,t=O;try{var n=ht;for(O=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}ht=null,Rl=!1}catch(o){throw ht!==null&&(ht=ht.slice(e+1)),Wc(Qs,Yt),o}finally{O=t,Oi=!1}}return null}var zn=[],Ln=0,pl=null,hl=0,je=[],Ue=0,dn=null,mt=1,gt="";function nn(e,t){zn[Ln++]=hl,zn[Ln++]=pl,pl=e,hl=t}function _d(e,t,n){je[Ue++]=mt,je[Ue++]=gt,je[Ue++]=dn,dn=e;var r=mt;e=gt;var o=32-qe(r)-1;r&=~(1<<o),n+=1;var l=32-qe(t)+o;if(30<l){var i=o-o%5;l=(r&(1<<i)-1).toString(32),r>>=i,o-=i,mt=1<<32-qe(t)+o|n<<o|r,gt=l+e}else mt=1<<l|n<<o|r,gt=e}function tu(e){e.return!==null&&(nn(e,1),_d(e,1,0))}function nu(e){for(;e===pl;)pl=zn[--Ln],zn[Ln]=null,hl=zn[--Ln],zn[Ln]=null;for(;e===dn;)dn=je[--Ue],je[Ue]=null,gt=je[--Ue],je[Ue]=null,mt=je[--Ue],je[Ue]=null}var Ae=null,Me=null,K=!1,Je=null;function kd(e,t){var n=He(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function Ja(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,Ae=e,Me=bt(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,Ae=e,Me=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=dn!==null?{id:mt,overflow:gt}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=He(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,Ae=e,Me=null,!0):!1;default:return!1}}function Cs(e){return(e.mode&1)!==0&&(e.flags&128)===0}function _s(e){if(K){var t=Me;if(t){var n=t;if(!Ja(e,t)){if(Cs(e))throw Error(C(418));t=bt(n.nextSibling);var r=Ae;t&&Ja(e,t)?kd(r,n):(e.flags=e.flags&-4097|2,K=!1,Ae=e)}}else{if(Cs(e))throw Error(C(418));e.flags=e.flags&-4097|2,K=!1,Ae=e}}}function qa(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;Ae=e}function jo(e){if(e!==Ae)return!1;if(!K)return qa(e),K=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!gs(e.type,e.memoizedProps)),t&&(t=Me)){if(Cs(e))throw xd(),Error(C(418));for(;t;)kd(e,t),t=bt(t.nextSibling)}if(qa(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(C(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){Me=bt(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}Me=null}}else Me=Ae?bt(e.stateNode.nextSibling):null;return!0}function xd(){for(var e=Me;e;)e=bt(e.nextSibling)}function Kn(){Me=Ae=null,K=!1}function ru(e){Je===null?Je=[e]:Je.push(e)}var $m=kt.ReactCurrentBatchConfig;function Cr(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(C(309));var r=n.stateNode}if(!r)throw Error(C(147,e));var o=r,l=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===l?t.ref:(t=function(i){var s=o.refs;i===null?delete s[l]:s[l]=i},t._stringRef=l,t)}if(typeof e!="string")throw Error(C(284));if(!n._owner)throw Error(C(290,e))}return e}function Uo(e,t){throw e=Object.prototype.toString.call(t),Error(C(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function ec(e){var t=e._init;return t(e._payload)}function Ed(e){function t(d,c){if(e){var p=d.deletions;p===null?(d.deletions=[c],d.flags|=16):p.push(c)}}function n(d,c){if(!e)return null;for(;c!==null;)t(d,c),c=c.sibling;return null}function r(d,c){for(d=new Map;c!==null;)c.key!==null?d.set(c.key,c):d.set(c.index,c),c=c.sibling;return d}function o(d,c){return d=Vt(d,c),d.index=0,d.sibling=null,d}function l(d,c,p){return d.index=p,e?(p=d.alternate,p!==null?(p=p.index,p<c?(d.flags|=2,c):p):(d.flags|=2,c)):(d.flags|=1048576,c)}function i(d){return e&&d.alternate===null&&(d.flags|=2),d}function s(d,c,p,y){return c===null||c.tag!==6?(c=Wi(p,d.mode,y),c.return=d,c):(c=o(c,p),c.return=d,c)}function u(d,c,p,y){var D=p.type;return D===Pn?h(d,c,p.props.children,y,p.key):c!==null&&(c.elementType===D||typeof D=="object"&&D!==null&&D.$$typeof===Rt&&ec(D)===c.type)?(y=o(c,p.props),y.ref=Cr(d,c,p),y.return=d,y):(y=tl(p.type,p.key,p.props,null,d.mode,y),y.ref=Cr(d,c,p),y.return=d,y)}function a(d,c,p,y){return c===null||c.tag!==4||c.stateNode.containerInfo!==p.containerInfo||c.stateNode.implementation!==p.implementation?(c=Qi(p,d.mode,y),c.return=d,c):(c=o(c,p.children||[]),c.return=d,c)}function h(d,c,p,y,D){return c===null||c.tag!==7?(c=an(p,d.mode,y,D),c.return=d,c):(c=o(c,p),c.return=d,c)}function m(d,c,p){if(typeof c=="string"&&c!==""||typeof c=="number")return c=Wi(""+c,d.mode,p),c.return=d,c;if(typeof c=="object"&&c!==null){switch(c.$$typeof){case Fo:return p=tl(c.type,c.key,c.props,null,d.mode,p),p.ref=Cr(d,null,c),p.return=d,p;case Fn:return c=Qi(c,d.mode,p),c.return=d,c;case Rt:var y=c._init;return m(d,y(c._payload),p)}if(Dr(c)||gr(c))return c=an(c,d.mode,p,null),c.return=d,c;Uo(d,c)}return null}function f(d,c,p,y){var D=c!==null?c.key:null;if(typeof p=="string"&&p!==""||typeof p=="number")return D!==null?null:s(d,c,""+p,y);if(typeof p=="object"&&p!==null){switch(p.$$typeof){case Fo:return p.key===D?u(d,c,p,y):null;case Fn:return p.key===D?a(d,c,p,y):null;case Rt:return D=p._init,f(d,c,D(p._payload),y)}if(Dr(p)||gr(p))return D!==null?null:h(d,c,p,y,null);Uo(d,p)}return null}function g(d,c,p,y,D){if(typeof y=="string"&&y!==""||typeof y=="number")return d=d.get(p)||null,s(c,d,""+y,D);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Fo:return d=d.get(y.key===null?p:y.key)||null,u(c,d,y,D);case Fn:return d=d.get(y.key===null?p:y.key)||null,a(c,d,y,D);case Rt:var _=y._init;return g(d,c,p,_(y._payload),D)}if(Dr(y)||gr(y))return d=d.get(p)||null,h(c,d,y,D,null);Uo(c,y)}return null}function w(d,c,p,y){for(var D=null,_=null,S=c,N=c=0,b=null;S!==null&&N<p.length;N++){S.index>N?(b=S,S=null):b=S.sibling;var A=f(d,S,p[N],y);if(A===null){S===null&&(S=b);break}e&&S&&A.alternate===null&&t(d,S),c=l(A,c,N),_===null?D=A:_.sibling=A,_=A,S=b}if(N===p.length)return n(d,S),K&&nn(d,N),D;if(S===null){for(;N<p.length;N++)S=m(d,p[N],y),S!==null&&(c=l(S,c,N),_===null?D=S:_.sibling=S,_=S);return K&&nn(d,N),D}for(S=r(d,S);N<p.length;N++)b=g(S,d,N,p[N],y),b!==null&&(e&&b.alternate!==null&&S.delete(b.key===null?N:b.key),c=l(b,c,N),_===null?D=b:_.sibling=b,_=b);return e&&S.forEach(function(G){return t(d,G)}),K&&nn(d,N),D}function v(d,c,p,y){var D=gr(p);if(typeof D!="function")throw Error(C(150));if(p=D.call(p),p==null)throw Error(C(151));for(var _=D=null,S=c,N=c=0,b=null,A=p.next();S!==null&&!A.done;N++,A=p.next()){S.index>N?(b=S,S=null):b=S.sibling;var G=f(d,S,A.value,y);if(G===null){S===null&&(S=b);break}e&&S&&G.alternate===null&&t(d,S),c=l(G,c,N),_===null?D=G:_.sibling=G,_=G,S=b}if(A.done)return n(d,S),K&&nn(d,N),D;if(S===null){for(;!A.done;N++,A=p.next())A=m(d,A.value,y),A!==null&&(c=l(A,c,N),_===null?D=A:_.sibling=A,_=A);return K&&nn(d,N),D}for(S=r(d,S);!A.done;N++,A=p.next())A=g(S,d,N,A.value,y),A!==null&&(e&&A.alternate!==null&&S.delete(A.key===null?N:A.key),c=l(A,c,N),_===null?D=A:_.sibling=A,_=A);return e&&S.forEach(function(wn){return t(d,wn)}),K&&nn(d,N),D}function E(d,c,p,y){if(typeof p=="object"&&p!==null&&p.type===Pn&&p.key===null&&(p=p.props.children),typeof p=="object"&&p!==null){switch(p.$$typeof){case Fo:e:{for(var D=p.key,_=c;_!==null;){if(_.key===D){if(D=p.type,D===Pn){if(_.tag===7){n(d,_.sibling),c=o(_,p.props.children),c.return=d,d=c;break e}}else if(_.elementType===D||typeof D=="object"&&D!==null&&D.$$typeof===Rt&&ec(D)===_.type){n(d,_.sibling),c=o(_,p.props),c.ref=Cr(d,_,p),c.return=d,d=c;break e}n(d,_);break}else t(d,_);_=_.sibling}p.type===Pn?(c=an(p.props.children,d.mode,y,p.key),c.return=d,d=c):(y=tl(p.type,p.key,p.props,null,d.mode,y),y.ref=Cr(d,c,p),y.return=d,d=y)}return i(d);case Fn:e:{for(_=p.key;c!==null;){if(c.key===_)if(c.tag===4&&c.stateNode.containerInfo===p.containerInfo&&c.stateNode.implementation===p.implementation){n(d,c.sibling),c=o(c,p.children||[]),c.return=d,d=c;break e}else{n(d,c);break}else t(d,c);c=c.sibling}c=Qi(p,d.mode,y),c.return=d,d=c}return i(d);case Rt:return _=p._init,E(d,c,_(p._payload),y)}if(Dr(p))return w(d,c,p,y);if(gr(p))return v(d,c,p,y);Uo(d,p)}return typeof p=="string"&&p!==""||typeof p=="number"?(p=""+p,c!==null&&c.tag===6?(n(d,c.sibling),c=o(c,p),c.return=d,d=c):(n(d,c),c=Wi(p,d.mode,y),c.return=d,d=c),i(d)):n(d,c)}return E}var Gn=Ed(!0),Dd=Ed(!1),ml=Gt(null),gl=null,In=null,ou=null;function lu(){ou=In=gl=null}function iu(e){var t=ml.current;Q(ml),e._currentValue=t}function ks(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function Hn(e,t){gl=e,ou=In=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&t)!==0&&(xe=!0),e.firstContext=null)}function We(e){var t=e._currentValue;if(ou!==e)if(e={context:e,memoizedValue:t,next:null},In===null){if(gl===null)throw Error(C(308));In=e,gl.dependencies={lanes:0,firstContext:e}}else In=In.next=e;return t}var ln=null;function su(e){ln===null?ln=[e]:ln.push(e)}function Sd(e,t,n,r){var o=t.interleaved;return o===null?(n.next=n,su(t)):(n.next=o.next,o.next=n),t.interleaved=n,Ct(e,r)}function Ct(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var Mt=!1;function uu(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Fd(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function vt(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function jt(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,(L&2)!==0){var o=r.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),r.pending=t,Ct(e,n)}return o=r.interleaved,o===null?(t.next=t,su(r)):(t.next=o.next,o.next=t),r.interleaved=t,Ct(e,n)}function Yo(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Ks(e,n)}}function tc(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var o=null,l=null;if(n=n.firstBaseUpdate,n!==null){do{var i={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};l===null?o=l=i:l=l.next=i,n=n.next}while(n!==null);l===null?o=l=t:l=l.next=t}else o=l=t;n={baseState:r.baseState,firstBaseUpdate:o,lastBaseUpdate:l,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function vl(e,t,n,r){var o=e.updateQueue;Mt=!1;var l=o.firstBaseUpdate,i=o.lastBaseUpdate,s=o.shared.pending;if(s!==null){o.shared.pending=null;var u=s,a=u.next;u.next=null,i===null?l=a:i.next=a,i=u;var h=e.alternate;h!==null&&(h=h.updateQueue,s=h.lastBaseUpdate,s!==i&&(s===null?h.firstBaseUpdate=a:s.next=a,h.lastBaseUpdate=u))}if(l!==null){var m=o.baseState;i=0,h=a=u=null,s=l;do{var f=s.lane,g=s.eventTime;if((r&f)===f){h!==null&&(h=h.next={eventTime:g,lane:0,tag:s.tag,payload:s.payload,callback:s.callback,next:null});e:{var w=e,v=s;switch(f=t,g=n,v.tag){case 1:if(w=v.payload,typeof w=="function"){m=w.call(g,m,f);break e}m=w;break e;case 3:w.flags=w.flags&-65537|128;case 0:if(w=v.payload,f=typeof w=="function"?w.call(g,m,f):w,f==null)break e;m=J({},m,f);break e;case 2:Mt=!0}}s.callback!==null&&s.lane!==0&&(e.flags|=64,f=o.effects,f===null?o.effects=[s]:f.push(s))}else g={eventTime:g,lane:f,tag:s.tag,payload:s.payload,callback:s.callback,next:null},h===null?(a=h=g,u=m):h=h.next=g,i|=f;if(s=s.next,s===null){if(s=o.shared.pending,s===null)break;f=s,s=f.next,f.next=null,o.lastBaseUpdate=f,o.shared.pending=null}}while(!0);if(h===null&&(u=m),o.baseState=u,o.firstBaseUpdate=a,o.lastBaseUpdate=h,t=o.shared.interleaved,t!==null){o=t;do i|=o.lane,o=o.next;while(o!==t)}else l===null&&(o.shared.lanes=0);pn|=i,e.lanes=i,e.memoizedState=m}}function nc(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],o=r.callback;if(o!==null){if(r.callback=null,r=n,typeof o!="function")throw Error(C(191,o));o.call(r)}}}var ro={},ut=Gt(ro),Gr=Gt(ro),Yr=Gt(ro);function sn(e){if(e===ro)throw Error(C(174));return e}function au(e,t){switch(U(Yr,t),U(Gr,e),U(ut,ro),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:ns(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=ns(t,e)}Q(ut),U(ut,t)}function Yn(){Q(ut),Q(Gr),Q(Yr)}function Pd(e){sn(Yr.current);var t=sn(ut.current),n=ns(t,e.type);t!==n&&(U(Gr,e),U(ut,n))}function cu(e){Gr.current===e&&(Q(ut),Q(Gr))}var Z=Gt(0);function yl(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Bi=[];function du(){for(var e=0;e<Bi.length;e++)Bi[e]._workInProgressVersionPrimary=null;Bi.length=0}var Zo=kt.ReactCurrentDispatcher,bi=kt.ReactCurrentBatchConfig,fn=0,X=null,re=null,ue=null,wl=!1,Ar=!1,Zr=0,Om=0;function he(){throw Error(C(321))}function fu(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!tt(e[n],t[n]))return!1;return!0}function pu(e,t,n,r,o,l){if(fn=l,X=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Zo.current=e===null||e.memoizedState===null?Um:Hm,e=n(r,o),Ar){l=0;do{if(Ar=!1,Zr=0,25<=l)throw Error(C(301));l+=1,ue=re=null,t.updateQueue=null,Zo.current=Vm,e=n(r,o)}while(Ar)}if(Zo.current=Cl,t=re!==null&&re.next!==null,fn=0,ue=re=X=null,wl=!1,t)throw Error(C(300));return e}function hu(){var e=Zr!==0;return Zr=0,e}function lt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ue===null?X.memoizedState=ue=e:ue=ue.next=e,ue}function Qe(){if(re===null){var e=X.alternate;e=e!==null?e.memoizedState:null}else e=re.next;var t=ue===null?X.memoizedState:ue.next;if(t!==null)ue=t,re=e;else{if(e===null)throw Error(C(310));re=e,e={memoizedState:re.memoizedState,baseState:re.baseState,baseQueue:re.baseQueue,queue:re.queue,next:null},ue===null?X.memoizedState=ue=e:ue=ue.next=e}return ue}function Xr(e,t){return typeof t=="function"?t(e):t}function ji(e){var t=Qe(),n=t.queue;if(n===null)throw Error(C(311));n.lastRenderedReducer=e;var r=re,o=r.baseQueue,l=n.pending;if(l!==null){if(o!==null){var i=o.next;o.next=l.next,l.next=i}r.baseQueue=o=l,n.pending=null}if(o!==null){l=o.next,r=r.baseState;var s=i=null,u=null,a=l;do{var h=a.lane;if((fn&h)===h)u!==null&&(u=u.next={lane:0,action:a.action,hasEagerState:a.hasEagerState,eagerState:a.eagerState,next:null}),r=a.hasEagerState?a.eagerState:e(r,a.action);else{var m={lane:h,action:a.action,hasEagerState:a.hasEagerState,eagerState:a.eagerState,next:null};u===null?(s=u=m,i=r):u=u.next=m,X.lanes|=h,pn|=h}a=a.next}while(a!==null&&a!==l);u===null?i=r:u.next=s,tt(r,t.memoizedState)||(xe=!0),t.memoizedState=r,t.baseState=i,t.baseQueue=u,n.lastRenderedState=r}if(e=n.interleaved,e!==null){o=e;do l=o.lane,X.lanes|=l,pn|=l,o=o.next;while(o!==e)}else o===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function Ui(e){var t=Qe(),n=t.queue;if(n===null)throw Error(C(311));n.lastRenderedReducer=e;var r=n.dispatch,o=n.pending,l=t.memoizedState;if(o!==null){n.pending=null;var i=o=o.next;do l=e(l,i.action),i=i.next;while(i!==o);tt(l,t.memoizedState)||(xe=!0),t.memoizedState=l,t.baseQueue===null&&(t.baseState=l),n.lastRenderedState=l}return[l,r]}function Nd(){}function Td(e,t){var n=X,r=Qe(),o=t(),l=!tt(r.memoizedState,o);if(l&&(r.memoizedState=o,xe=!0),r=r.queue,mu(Ad.bind(null,n,r,e),[e]),r.getSnapshot!==t||l||ue!==null&&ue.memoizedState.tag&1){if(n.flags|=2048,Jr(9,Md.bind(null,n,r,o,t),void 0,null),ae===null)throw Error(C(349));(fn&30)!==0||Rd(n,t,o)}return o}function Rd(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=X.updateQueue,t===null?(t={lastEffect:null,stores:null},X.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Md(e,t,n,r){t.value=n,t.getSnapshot=r,zd(t)&&Ld(e)}function Ad(e,t,n){return n(function(){zd(t)&&Ld(e)})}function zd(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!tt(e,n)}catch{return!0}}function Ld(e){var t=Ct(e,1);t!==null&&et(t,e,1,-1)}function rc(e){var t=lt();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Xr,lastRenderedState:e},t.queue=e,e=e.dispatch=jm.bind(null,X,e),[t.memoizedState,e]}function Jr(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=X.updateQueue,t===null?(t={lastEffect:null,stores:null},X.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function Id(){return Qe().memoizedState}function Xo(e,t,n,r){var o=lt();X.flags|=e,o.memoizedState=Jr(1|t,n,void 0,r===void 0?null:r)}function Ml(e,t,n,r){var o=Qe();r=r===void 0?null:r;var l=void 0;if(re!==null){var i=re.memoizedState;if(l=i.destroy,r!==null&&fu(r,i.deps)){o.memoizedState=Jr(t,n,l,r);return}}X.flags|=e,o.memoizedState=Jr(1|t,n,l,r)}function oc(e,t){return Xo(8390656,8,e,t)}function mu(e,t){return Ml(2048,8,e,t)}function $d(e,t){return Ml(4,2,e,t)}function Od(e,t){return Ml(4,4,e,t)}function Bd(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function bd(e,t,n){return n=n!=null?n.concat([e]):null,Ml(4,4,Bd.bind(null,t,e),n)}function gu(){}function jd(e,t){var n=Qe();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&fu(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Ud(e,t){var n=Qe();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&fu(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function Hd(e,t,n){return(fn&21)===0?(e.baseState&&(e.baseState=!1,xe=!0),e.memoizedState=n):(tt(n,t)||(n=Gc(),X.lanes|=n,pn|=n,e.baseState=!0),t)}function Bm(e,t){var n=O;O=n!==0&&4>n?n:4,e(!0);var r=bi.transition;bi.transition={};try{e(!1),t()}finally{O=n,bi.transition=r}}function Vd(){return Qe().memoizedState}function bm(e,t,n){var r=Ht(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},Wd(e))Qd(t,n);else if(n=Sd(e,t,n,r),n!==null){var o=Ce();et(n,e,r,o),Kd(n,t,r)}}function jm(e,t,n){var r=Ht(e),o={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(Wd(e))Qd(t,o);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=t.lastRenderedReducer,l!==null))try{var i=t.lastRenderedState,s=l(i,n);if(o.hasEagerState=!0,o.eagerState=s,tt(s,i)){var u=t.interleaved;u===null?(o.next=o,su(t)):(o.next=u.next,u.next=o),t.interleaved=o;return}}catch{}n=Sd(e,t,o,r),n!==null&&(o=Ce(),et(n,e,r,o),Kd(n,t,r))}}function Wd(e){var t=e.alternate;return e===X||t!==null&&t===X}function Qd(e,t){Ar=wl=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Kd(e,t,n){if((n&4194240)!==0){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Ks(e,n)}}var Cl={readContext:We,useCallback:he,useContext:he,useEffect:he,useImperativeHandle:he,useInsertionEffect:he,useLayoutEffect:he,useMemo:he,useReducer:he,useRef:he,useState:he,useDebugValue:he,useDeferredValue:he,useTransition:he,useMutableSource:he,useSyncExternalStore:he,useId:he,unstable_isNewReconciler:!1},Um={readContext:We,useCallback:function(e,t){return lt().memoizedState=[e,t===void 0?null:t],e},useContext:We,useEffect:oc,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Xo(4194308,4,Bd.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Xo(4194308,4,e,t)},useInsertionEffect:function(e,t){return Xo(4,2,e,t)},useMemo:function(e,t){var n=lt();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=lt();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=bm.bind(null,X,e),[r.memoizedState,e]},useRef:function(e){var t=lt();return e={current:e},t.memoizedState=e},useState:rc,useDebugValue:gu,useDeferredValue:function(e){return lt().memoizedState=e},useTransition:function(){var e=rc(!1),t=e[0];return e=Bm.bind(null,e[1]),lt().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=X,o=lt();if(K){if(n===void 0)throw Error(C(407));n=n()}else{if(n=t(),ae===null)throw Error(C(349));(fn&30)!==0||Rd(r,t,n)}o.memoizedState=n;var l={value:n,getSnapshot:t};return o.queue=l,oc(Ad.bind(null,r,l,e),[e]),r.flags|=2048,Jr(9,Md.bind(null,r,l,n,t),void 0,null),n},useId:function(){var e=lt(),t=ae.identifierPrefix;if(K){var n=gt,r=mt;n=(r&~(1<<32-qe(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=Zr++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=Om++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},Hm={readContext:We,useCallback:jd,useContext:We,useEffect:mu,useImperativeHandle:bd,useInsertionEffect:$d,useLayoutEffect:Od,useMemo:Ud,useReducer:ji,useRef:Id,useState:function(){return ji(Xr)},useDebugValue:gu,useDeferredValue:function(e){var t=Qe();return Hd(t,re.memoizedState,e)},useTransition:function(){var e=ji(Xr)[0],t=Qe().memoizedState;return[e,t]},useMutableSource:Nd,useSyncExternalStore:Td,useId:Vd,unstable_isNewReconciler:!1},Vm={readContext:We,useCallback:jd,useContext:We,useEffect:mu,useImperativeHandle:bd,useInsertionEffect:$d,useLayoutEffect:Od,useMemo:Ud,useReducer:Ui,useRef:Id,useState:function(){return Ui(Xr)},useDebugValue:gu,useDeferredValue:function(e){var t=Qe();return re===null?t.memoizedState=e:Hd(t,re.memoizedState,e)},useTransition:function(){var e=Ui(Xr)[0],t=Qe().memoizedState;return[e,t]},useMutableSource:Nd,useSyncExternalStore:Td,useId:Vd,unstable_isNewReconciler:!1};function Ze(e,t){if(e&&e.defaultProps){t=J({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function xs(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:J({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Al={isMounted:function(e){return(e=e._reactInternals)?gn(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=Ce(),o=Ht(e),l=vt(r,o);l.payload=t,n!=null&&(l.callback=n),t=jt(e,l,o),t!==null&&(et(t,e,o,r),Yo(t,e,o))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=Ce(),o=Ht(e),l=vt(r,o);l.tag=1,l.payload=t,n!=null&&(l.callback=n),t=jt(e,l,o),t!==null&&(et(t,e,o,r),Yo(t,e,o))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=Ce(),r=Ht(e),o=vt(n,r);o.tag=2,t!=null&&(o.callback=t),t=jt(e,o,r),t!==null&&(et(t,e,r,n),Yo(t,e,r))}};function lc(e,t,n,r,o,l,i){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,l,i):t.prototype&&t.prototype.isPureReactComponent?!Vr(n,r)||!Vr(o,l):!0}function Gd(e,t,n){var r=!1,o=Qt,l=t.contextType;return typeof l=="object"&&l!==null?l=We(l):(o=De(t)?cn:ve.current,r=t.contextTypes,l=(r=r!=null)?Qn(e,o):Qt),t=new t(n,l),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Al,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=o,e.__reactInternalMemoizedMaskedChildContext=l),t}function ic(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Al.enqueueReplaceState(t,t.state,null)}function Es(e,t,n,r){var o=e.stateNode;o.props=n,o.state=e.memoizedState,o.refs={},uu(e);var l=t.contextType;typeof l=="object"&&l!==null?o.context=We(l):(l=De(t)?cn:ve.current,o.context=Qn(e,l)),o.state=e.memoizedState,l=t.getDerivedStateFromProps,typeof l=="function"&&(xs(e,t,l,n),o.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof o.getSnapshotBeforeUpdate=="function"||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(t=o.state,typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount(),t!==o.state&&Al.enqueueReplaceState(o,o.state,null),vl(e,n,o,r),o.state=e.memoizedState),typeof o.componentDidMount=="function"&&(e.flags|=4194308)}function Zn(e,t){try{var n="",r=t;do n+=Ch(r),r=r.return;while(r);var o=n}catch(l){o=`
Error generating stack: `+l.message+`
`+l.stack}return{value:e,source:t,stack:o,digest:null}}function Hi(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function Ds(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var Wm=typeof WeakMap=="function"?WeakMap:Map;function Yd(e,t,n){n=vt(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){kl||(kl=!0,Ls=r),Ds(e,t)},n}function Zd(e,t,n){n=vt(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var o=t.value;n.payload=function(){return r(o)},n.callback=function(){Ds(e,t)}}var l=e.stateNode;return l!==null&&typeof l.componentDidCatch=="function"&&(n.callback=function(){Ds(e,t),typeof r!="function"&&(Ut===null?Ut=new Set([this]):Ut.add(this));var i=t.stack;this.componentDidCatch(t.value,{componentStack:i!==null?i:""})}),n}function sc(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Wm;var o=new Set;r.set(t,o)}else o=r.get(t),o===void 0&&(o=new Set,r.set(t,o));o.has(n)||(o.add(n),e=lg.bind(null,e,t,n),t.then(e,e))}function uc(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function ac(e,t,n,r,o){return(e.mode&1)===0?(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=vt(-1,1),t.tag=2,jt(n,t,1))),n.lanes|=1),e):(e.flags|=65536,e.lanes=o,e)}var Qm=kt.ReactCurrentOwner,xe=!1;function we(e,t,n,r){t.child=e===null?Dd(t,null,n,r):Gn(t,e.child,n,r)}function cc(e,t,n,r,o){n=n.render;var l=t.ref;return Hn(t,o),r=pu(e,t,n,r,l,o),n=hu(),e!==null&&!xe?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~o,_t(e,t,o)):(K&&n&&tu(t),t.flags|=1,we(e,t,r,o),t.child)}function dc(e,t,n,r,o){if(e===null){var l=n.type;return typeof l=="function"&&!Eu(l)&&l.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=l,Xd(e,t,l,r,o)):(e=tl(n.type,null,r,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(l=e.child,(e.lanes&o)===0){var i=l.memoizedProps;if(n=n.compare,n=n!==null?n:Vr,n(i,r)&&e.ref===t.ref)return _t(e,t,o)}return t.flags|=1,e=Vt(l,r),e.ref=t.ref,e.return=t,t.child=e}function Xd(e,t,n,r,o){if(e!==null){var l=e.memoizedProps;if(Vr(l,r)&&e.ref===t.ref)if(xe=!1,t.pendingProps=r=l,(e.lanes&o)!==0)(e.flags&131072)!==0&&(xe=!0);else return t.lanes=e.lanes,_t(e,t,o)}return Ss(e,t,n,r,o)}function Jd(e,t,n){var r=t.pendingProps,o=r.children,l=e!==null?e.memoizedState:null;if(r.mode==="hidden")if((t.mode&1)===0)t.memoizedState={baseLanes:0,cachePool:null,transitions:null},U(On,Re),Re|=n;else{if((n&1073741824)===0)return e=l!==null?l.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,U(On,Re),Re|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=l!==null?l.baseLanes:n,U(On,Re),Re|=r}else l!==null?(r=l.baseLanes|n,t.memoizedState=null):r=n,U(On,Re),Re|=r;return we(e,t,o,n),t.child}function qd(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function Ss(e,t,n,r,o){var l=De(n)?cn:ve.current;return l=Qn(t,l),Hn(t,o),n=pu(e,t,n,r,l,o),r=hu(),e!==null&&!xe?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~o,_t(e,t,o)):(K&&r&&tu(t),t.flags|=1,we(e,t,n,o),t.child)}function fc(e,t,n,r,o){if(De(n)){var l=!0;fl(t)}else l=!1;if(Hn(t,o),t.stateNode===null)Jo(e,t),Gd(t,n,r),Es(t,n,r,o),r=!0;else if(e===null){var i=t.stateNode,s=t.memoizedProps;i.props=s;var u=i.context,a=n.contextType;typeof a=="object"&&a!==null?a=We(a):(a=De(n)?cn:ve.current,a=Qn(t,a));var h=n.getDerivedStateFromProps,m=typeof h=="function"||typeof i.getSnapshotBeforeUpdate=="function";m||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(s!==r||u!==a)&&ic(t,i,r,a),Mt=!1;var f=t.memoizedState;i.state=f,vl(t,r,i,o),u=t.memoizedState,s!==r||f!==u||Ee.current||Mt?(typeof h=="function"&&(xs(t,n,h,r),u=t.memoizedState),(s=Mt||lc(t,n,s,r,f,u,a))?(m||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(t.flags|=4194308)):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=u),i.props=r,i.state=u,i.context=a,r=s):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{i=t.stateNode,Fd(e,t),s=t.memoizedProps,a=t.type===t.elementType?s:Ze(t.type,s),i.props=a,m=t.pendingProps,f=i.context,u=n.contextType,typeof u=="object"&&u!==null?u=We(u):(u=De(n)?cn:ve.current,u=Qn(t,u));var g=n.getDerivedStateFromProps;(h=typeof g=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(s!==m||f!==u)&&ic(t,i,r,u),Mt=!1,f=t.memoizedState,i.state=f,vl(t,r,i,o);var w=t.memoizedState;s!==m||f!==w||Ee.current||Mt?(typeof g=="function"&&(xs(t,n,g,r),w=t.memoizedState),(a=Mt||lc(t,n,a,r,f,w,u)||!1)?(h||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(r,w,u),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(r,w,u)),typeof i.componentDidUpdate=="function"&&(t.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof i.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=w),i.props=r,i.state=w,i.context=u,r=a):(typeof i.componentDidUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||s===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),r=!1)}return Fs(e,t,n,r,l,o)}function Fs(e,t,n,r,o,l){qd(e,t);var i=(t.flags&128)!==0;if(!r&&!i)return o&&Xa(t,n,!1),_t(e,t,l);r=t.stateNode,Qm.current=t;var s=i&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&i?(t.child=Gn(t,e.child,null,l),t.child=Gn(t,null,s,l)):we(e,t,s,l),t.memoizedState=r.state,o&&Xa(t,n,!0),t.child}function ef(e){var t=e.stateNode;t.pendingContext?Za(e,t.pendingContext,t.pendingContext!==t.context):t.context&&Za(e,t.context,!1),au(e,t.containerInfo)}function pc(e,t,n,r,o){return Kn(),ru(o),t.flags|=256,we(e,t,n,r),t.child}var Ps={dehydrated:null,treeContext:null,retryLane:0};function Ns(e){return{baseLanes:e,cachePool:null,transitions:null}}function tf(e,t,n){var r=t.pendingProps,o=Z.current,l=!1,i=(t.flags&128)!==0,s;if((s=i)||(s=e!==null&&e.memoizedState===null?!1:(o&2)!==0),s?(l=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(o|=1),U(Z,o&1),e===null)return _s(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?((t.mode&1)===0?t.lanes=1:e.data==="$!"?t.lanes=8:t.lanes=1073741824,null):(i=r.children,e=r.fallback,l?(r=t.mode,l=t.child,i={mode:"hidden",children:i},(r&1)===0&&l!==null?(l.childLanes=0,l.pendingProps=i):l=Il(i,r,0,null),e=an(e,r,n,null),l.return=t,e.return=t,l.sibling=e,t.child=l,t.child.memoizedState=Ns(n),t.memoizedState=Ps,e):vu(t,i));if(o=e.memoizedState,o!==null&&(s=o.dehydrated,s!==null))return Km(e,t,i,r,s,o,n);if(l){l=r.fallback,i=t.mode,o=e.child,s=o.sibling;var u={mode:"hidden",children:r.children};return(i&1)===0&&t.child!==o?(r=t.child,r.childLanes=0,r.pendingProps=u,t.deletions=null):(r=Vt(o,u),r.subtreeFlags=o.subtreeFlags&14680064),s!==null?l=Vt(s,l):(l=an(l,i,n,null),l.flags|=2),l.return=t,r.return=t,r.sibling=l,t.child=r,r=l,l=t.child,i=e.child.memoizedState,i=i===null?Ns(n):{baseLanes:i.baseLanes|n,cachePool:null,transitions:i.transitions},l.memoizedState=i,l.childLanes=e.childLanes&~n,t.memoizedState=Ps,r}return l=e.child,e=l.sibling,r=Vt(l,{mode:"visible",children:r.children}),(t.mode&1)===0&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function vu(e,t){return t=Il({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Ho(e,t,n,r){return r!==null&&ru(r),Gn(t,e.child,null,n),e=vu(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Km(e,t,n,r,o,l,i){if(n)return t.flags&256?(t.flags&=-257,r=Hi(Error(C(422))),Ho(e,t,i,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(l=r.fallback,o=t.mode,r=Il({mode:"visible",children:r.children},o,0,null),l=an(l,o,i,null),l.flags|=2,r.return=t,l.return=t,r.sibling=l,t.child=r,(t.mode&1)!==0&&Gn(t,e.child,null,i),t.child.memoizedState=Ns(i),t.memoizedState=Ps,l);if((t.mode&1)===0)return Ho(e,t,i,null);if(o.data==="$!"){if(r=o.nextSibling&&o.nextSibling.dataset,r)var s=r.dgst;return r=s,l=Error(C(419)),r=Hi(l,r,void 0),Ho(e,t,i,r)}if(s=(i&e.childLanes)!==0,xe||s){if(r=ae,r!==null){switch(i&-i){case 4:o=2;break;case 16:o=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:o=32;break;case 536870912:o=268435456;break;default:o=0}o=(o&(r.suspendedLanes|i))!==0?0:o,o!==0&&o!==l.retryLane&&(l.retryLane=o,Ct(e,o),et(r,e,o,-1))}return xu(),r=Hi(Error(C(421))),Ho(e,t,i,r)}return o.data==="$?"?(t.flags|=128,t.child=e.child,t=ig.bind(null,e),o._reactRetry=t,null):(e=l.treeContext,Me=bt(o.nextSibling),Ae=t,K=!0,Je=null,e!==null&&(je[Ue++]=mt,je[Ue++]=gt,je[Ue++]=dn,mt=e.id,gt=e.overflow,dn=t),t=vu(t,r.children),t.flags|=4096,t)}function hc(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),ks(e.return,t,n)}function Vi(e,t,n,r,o){var l=e.memoizedState;l===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:o}:(l.isBackwards=t,l.rendering=null,l.renderingStartTime=0,l.last=r,l.tail=n,l.tailMode=o)}function nf(e,t,n){var r=t.pendingProps,o=r.revealOrder,l=r.tail;if(we(e,t,r.children,n),r=Z.current,(r&2)!==0)r=r&1|2,t.flags|=128;else{if(e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&hc(e,n,t);else if(e.tag===19)hc(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(U(Z,r),(t.mode&1)===0)t.memoizedState=null;else switch(o){case"forwards":for(n=t.child,o=null;n!==null;)e=n.alternate,e!==null&&yl(e)===null&&(o=n),n=n.sibling;n=o,n===null?(o=t.child,t.child=null):(o=n.sibling,n.sibling=null),Vi(t,!1,o,n,l);break;case"backwards":for(n=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&yl(e)===null){t.child=o;break}e=o.sibling,o.sibling=n,n=o,o=e}Vi(t,!0,n,null,l);break;case"together":Vi(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Jo(e,t){(t.mode&1)===0&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function _t(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),pn|=t.lanes,(n&t.childLanes)===0)return null;if(e!==null&&t.child!==e.child)throw Error(C(153));if(t.child!==null){for(e=t.child,n=Vt(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Vt(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Gm(e,t,n){switch(t.tag){case 3:ef(t),Kn();break;case 5:Pd(t);break;case 1:De(t.type)&&fl(t);break;case 4:au(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,o=t.memoizedProps.value;U(ml,r._currentValue),r._currentValue=o;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(U(Z,Z.current&1),t.flags|=128,null):(n&t.child.childLanes)!==0?tf(e,t,n):(U(Z,Z.current&1),e=_t(e,t,n),e!==null?e.sibling:null);U(Z,Z.current&1);break;case 19:if(r=(n&t.childLanes)!==0,(e.flags&128)!==0){if(r)return nf(e,t,n);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),U(Z,Z.current),r)break;return null;case 22:case 23:return t.lanes=0,Jd(e,t,n)}return _t(e,t,n)}var rf,Ts,of,lf;rf=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};Ts=function(){};of=function(e,t,n,r){var o=e.memoizedProps;if(o!==r){e=t.stateNode,sn(ut.current);var l=null;switch(n){case"input":o=Ji(e,o),r=Ji(e,r),l=[];break;case"select":o=J({},o,{value:void 0}),r=J({},r,{value:void 0}),l=[];break;case"textarea":o=ts(e,o),r=ts(e,r),l=[];break;default:typeof o.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=cl)}rs(n,r);var i;n=null;for(a in o)if(!r.hasOwnProperty(a)&&o.hasOwnProperty(a)&&o[a]!=null)if(a==="style"){var s=o[a];for(i in s)s.hasOwnProperty(i)&&(n||(n={}),n[i]="")}else a!=="dangerouslySetInnerHTML"&&a!=="children"&&a!=="suppressContentEditableWarning"&&a!=="suppressHydrationWarning"&&a!=="autoFocus"&&($r.hasOwnProperty(a)?l||(l=[]):(l=l||[]).push(a,null));for(a in r){var u=r[a];if(s=o?.[a],r.hasOwnProperty(a)&&u!==s&&(u!=null||s!=null))if(a==="style")if(s){for(i in s)!s.hasOwnProperty(i)||u&&u.hasOwnProperty(i)||(n||(n={}),n[i]="");for(i in u)u.hasOwnProperty(i)&&s[i]!==u[i]&&(n||(n={}),n[i]=u[i])}else n||(l||(l=[]),l.push(a,n)),n=u;else a==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,s=s?s.__html:void 0,u!=null&&s!==u&&(l=l||[]).push(a,u)):a==="children"?typeof u!="string"&&typeof u!="number"||(l=l||[]).push(a,""+u):a!=="suppressContentEditableWarning"&&a!=="suppressHydrationWarning"&&($r.hasOwnProperty(a)?(u!=null&&a==="onScroll"&&W("scroll",e),l||s===u||(l=[])):(l=l||[]).push(a,u))}n&&(l=l||[]).push("style",n);var a=l;(t.updateQueue=a)&&(t.flags|=4)}};lf=function(e,t,n,r){n!==r&&(t.flags|=4)};function _r(e,t){if(!K)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function me(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var o=e.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags&14680064,r|=o.flags&14680064,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags,r|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Ym(e,t,n){var r=t.pendingProps;switch(nu(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return me(t),null;case 1:return De(t.type)&&dl(),me(t),null;case 3:return r=t.stateNode,Yn(),Q(Ee),Q(ve),du(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(jo(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Je!==null&&(Os(Je),Je=null))),Ts(e,t),me(t),null;case 5:cu(t);var o=sn(Yr.current);if(n=t.type,e!==null&&t.stateNode!=null)of(e,t,n,r,o),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(C(166));return me(t),null}if(e=sn(ut.current),jo(t)){r=t.stateNode,n=t.type;var l=t.memoizedProps;switch(r[it]=t,r[Kr]=l,e=(t.mode&1)!==0,n){case"dialog":W("cancel",r),W("close",r);break;case"iframe":case"object":case"embed":W("load",r);break;case"video":case"audio":for(o=0;o<Fr.length;o++)W(Fr[o],r);break;case"source":W("error",r);break;case"img":case"image":case"link":W("error",r),W("load",r);break;case"details":W("toggle",r);break;case"input":ka(r,l),W("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!l.multiple},W("invalid",r);break;case"textarea":Ea(r,l),W("invalid",r)}rs(n,l),o=null;for(var i in l)if(l.hasOwnProperty(i)){var s=l[i];i==="children"?typeof s=="string"?r.textContent!==s&&(l.suppressHydrationWarning!==!0&&bo(r.textContent,s,e),o=["children",s]):typeof s=="number"&&r.textContent!==""+s&&(l.suppressHydrationWarning!==!0&&bo(r.textContent,s,e),o=["children",""+s]):$r.hasOwnProperty(i)&&s!=null&&i==="onScroll"&&W("scroll",r)}switch(n){case"input":Po(r),xa(r,l,!0);break;case"textarea":Po(r),Da(r);break;case"select":case"option":break;default:typeof l.onClick=="function"&&(r.onclick=cl)}r=o,t.updateQueue=r,r!==null&&(t.flags|=4)}else{i=o.nodeType===9?o:o.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=Ac(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=i.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=i.createElement(n,{is:r.is}):(e=i.createElement(n),n==="select"&&(i=e,r.multiple?i.multiple=!0:r.size&&(i.size=r.size))):e=i.createElementNS(e,n),e[it]=t,e[Kr]=r,rf(e,t,!1,!1),t.stateNode=e;e:{switch(i=os(n,r),n){case"dialog":W("cancel",e),W("close",e),o=r;break;case"iframe":case"object":case"embed":W("load",e),o=r;break;case"video":case"audio":for(o=0;o<Fr.length;o++)W(Fr[o],e);o=r;break;case"source":W("error",e),o=r;break;case"img":case"image":case"link":W("error",e),W("load",e),o=r;break;case"details":W("toggle",e),o=r;break;case"input":ka(e,r),o=Ji(e,r),W("invalid",e);break;case"option":o=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},o=J({},r,{value:void 0}),W("invalid",e);break;case"textarea":Ea(e,r),o=ts(e,r),W("invalid",e);break;default:o=r}rs(n,o),s=o;for(l in s)if(s.hasOwnProperty(l)){var u=s[l];l==="style"?Ic(e,u):l==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,u!=null&&zc(e,u)):l==="children"?typeof u=="string"?(n!=="textarea"||u!=="")&&Or(e,u):typeof u=="number"&&Or(e,""+u):l!=="suppressContentEditableWarning"&&l!=="suppressHydrationWarning"&&l!=="autoFocus"&&($r.hasOwnProperty(l)?u!=null&&l==="onScroll"&&W("scroll",e):u!=null&&js(e,l,u,i))}switch(n){case"input":Po(e),xa(e,r,!1);break;case"textarea":Po(e),Da(e);break;case"option":r.value!=null&&e.setAttribute("value",""+Wt(r.value));break;case"select":e.multiple=!!r.multiple,l=r.value,l!=null?Bn(e,!!r.multiple,l,!1):r.defaultValue!=null&&Bn(e,!!r.multiple,r.defaultValue,!0);break;default:typeof o.onClick=="function"&&(e.onclick=cl)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return me(t),null;case 6:if(e&&t.stateNode!=null)lf(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(C(166));if(n=sn(Yr.current),sn(ut.current),jo(t)){if(r=t.stateNode,n=t.memoizedProps,r[it]=t,(l=r.nodeValue!==n)&&(e=Ae,e!==null))switch(e.tag){case 3:bo(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&bo(r.nodeValue,n,(e.mode&1)!==0)}l&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[it]=t,t.stateNode=r}return me(t),null;case 13:if(Q(Z),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(K&&Me!==null&&(t.mode&1)!==0&&(t.flags&128)===0)xd(),Kn(),t.flags|=98560,l=!1;else if(l=jo(t),r!==null&&r.dehydrated!==null){if(e===null){if(!l)throw Error(C(318));if(l=t.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(C(317));l[it]=t}else Kn(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;me(t),l=!1}else Je!==null&&(Os(Je),Je=null),l=!0;if(!l)return t.flags&65536?t:null}return(t.flags&128)!==0?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,(t.mode&1)!==0&&(e===null||(Z.current&1)!==0?oe===0&&(oe=3):xu())),t.updateQueue!==null&&(t.flags|=4),me(t),null);case 4:return Yn(),Ts(e,t),e===null&&Wr(t.stateNode.containerInfo),me(t),null;case 10:return iu(t.type._context),me(t),null;case 17:return De(t.type)&&dl(),me(t),null;case 19:if(Q(Z),l=t.memoizedState,l===null)return me(t),null;if(r=(t.flags&128)!==0,i=l.rendering,i===null)if(r)_r(l,!1);else{if(oe!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(i=yl(e),i!==null){for(t.flags|=128,_r(l,!1),r=i.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)l=n,e=r,l.flags&=14680066,i=l.alternate,i===null?(l.childLanes=0,l.lanes=e,l.child=null,l.subtreeFlags=0,l.memoizedProps=null,l.memoizedState=null,l.updateQueue=null,l.dependencies=null,l.stateNode=null):(l.childLanes=i.childLanes,l.lanes=i.lanes,l.child=i.child,l.subtreeFlags=0,l.deletions=null,l.memoizedProps=i.memoizedProps,l.memoizedState=i.memoizedState,l.updateQueue=i.updateQueue,l.type=i.type,e=i.dependencies,l.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return U(Z,Z.current&1|2),t.child}e=e.sibling}l.tail!==null&&te()>Xn&&(t.flags|=128,r=!0,_r(l,!1),t.lanes=4194304)}else{if(!r)if(e=yl(i),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),_r(l,!0),l.tail===null&&l.tailMode==="hidden"&&!i.alternate&&!K)return me(t),null}else 2*te()-l.renderingStartTime>Xn&&n!==1073741824&&(t.flags|=128,r=!0,_r(l,!1),t.lanes=4194304);l.isBackwards?(i.sibling=t.child,t.child=i):(n=l.last,n!==null?n.sibling=i:t.child=i,l.last=i)}return l.tail!==null?(t=l.tail,l.rendering=t,l.tail=t.sibling,l.renderingStartTime=te(),t.sibling=null,n=Z.current,U(Z,r?n&1|2:n&1),t):(me(t),null);case 22:case 23:return ku(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&(t.mode&1)!==0?(Re&1073741824)!==0&&(me(t),t.subtreeFlags&6&&(t.flags|=8192)):me(t),null;case 24:return null;case 25:return null}throw Error(C(156,t.tag))}function Zm(e,t){switch(nu(t),t.tag){case 1:return De(t.type)&&dl(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Yn(),Q(Ee),Q(ve),du(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 5:return cu(t),null;case 13:if(Q(Z),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(C(340));Kn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Q(Z),null;case 4:return Yn(),null;case 10:return iu(t.type._context),null;case 22:case 23:return ku(),null;case 24:return null;default:return null}}var Vo=!1,ge=!1,Xm=typeof WeakSet=="function"?WeakSet:Set,F=null;function $n(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){ee(e,t,r)}else n.current=null}function Rs(e,t,n){try{n()}catch(r){ee(e,t,r)}}var mc=!1;function Jm(e,t){if(hs=sl,e=cd(),eu(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var o=r.anchorOffset,l=r.focusNode;r=r.focusOffset;try{n.nodeType,l.nodeType}catch{n=null;break e}var i=0,s=-1,u=-1,a=0,h=0,m=e,f=null;t:for(;;){for(var g;m!==n||o!==0&&m.nodeType!==3||(s=i+o),m!==l||r!==0&&m.nodeType!==3||(u=i+r),m.nodeType===3&&(i+=m.nodeValue.length),(g=m.firstChild)!==null;)f=m,m=g;for(;;){if(m===e)break t;if(f===n&&++a===o&&(s=i),f===l&&++h===r&&(u=i),(g=m.nextSibling)!==null)break;m=f,f=m.parentNode}m=g}n=s===-1||u===-1?null:{start:s,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(ms={focusedElem:e,selectionRange:n},sl=!1,F=t;F!==null;)if(t=F,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,F=e;else for(;F!==null;){t=F;try{var w=t.alternate;if((t.flags&1024)!==0)switch(t.tag){case 0:case 11:case 15:break;case 1:if(w!==null){var v=w.memoizedProps,E=w.memoizedState,d=t.stateNode,c=d.getSnapshotBeforeUpdate(t.elementType===t.type?v:Ze(t.type,v),E);d.__reactInternalSnapshotBeforeUpdate=c}break;case 3:var p=t.stateNode.containerInfo;p.nodeType===1?p.textContent="":p.nodeType===9&&p.documentElement&&p.removeChild(p.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(C(163))}}catch(y){ee(t,t.return,y)}if(e=t.sibling,e!==null){e.return=t.return,F=e;break}F=t.return}return w=mc,mc=!1,w}function zr(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var o=r=r.next;do{if((o.tag&e)===e){var l=o.destroy;o.destroy=void 0,l!==void 0&&Rs(t,n,l)}o=o.next}while(o!==r)}}function zl(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function Ms(e){var t=e.ref;if(t!==null){var n=e.stateNode;e.tag,e=n,typeof t=="function"?t(e):t.current=e}}function sf(e){var t=e.alternate;t!==null&&(e.alternate=null,sf(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[it],delete t[Kr],delete t[ys],delete t[zm],delete t[Lm])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function uf(e){return e.tag===5||e.tag===3||e.tag===4}function gc(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||uf(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function As(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=cl));else if(r!==4&&(e=e.child,e!==null))for(As(e,t,n),e=e.sibling;e!==null;)As(e,t,n),e=e.sibling}function zs(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(zs(e,t,n),e=e.sibling;e!==null;)zs(e,t,n),e=e.sibling}var ce=null,Xe=!1;function Tt(e,t,n){for(n=n.child;n!==null;)af(e,t,n),n=n.sibling}function af(e,t,n){if(st&&typeof st.onCommitFiberUnmount=="function")try{st.onCommitFiberUnmount(Sl,n)}catch{}switch(n.tag){case 5:ge||$n(n,t);case 6:var r=ce,o=Xe;ce=null,Tt(e,t,n),ce=r,Xe=o,ce!==null&&(Xe?(e=ce,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):ce.removeChild(n.stateNode));break;case 18:ce!==null&&(Xe?(e=ce,n=n.stateNode,e.nodeType===8?$i(e.parentNode,n):e.nodeType===1&&$i(e,n),Ur(e)):$i(ce,n.stateNode));break;case 4:r=ce,o=Xe,ce=n.stateNode.containerInfo,Xe=!0,Tt(e,t,n),ce=r,Xe=o;break;case 0:case 11:case 14:case 15:if(!ge&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){o=r=r.next;do{var l=o,i=l.destroy;l=l.tag,i!==void 0&&((l&2)!==0||(l&4)!==0)&&Rs(n,t,i),o=o.next}while(o!==r)}Tt(e,t,n);break;case 1:if(!ge&&($n(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(s){ee(n,t,s)}Tt(e,t,n);break;case 21:Tt(e,t,n);break;case 22:n.mode&1?(ge=(r=ge)||n.memoizedState!==null,Tt(e,t,n),ge=r):Tt(e,t,n);break;default:Tt(e,t,n)}}function vc(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new Xm),t.forEach(function(r){var o=sg.bind(null,e,r);n.has(r)||(n.add(r),r.then(o,o))})}}function Ye(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var o=n[r];try{var l=e,i=t,s=i;e:for(;s!==null;){switch(s.tag){case 5:ce=s.stateNode,Xe=!1;break e;case 3:ce=s.stateNode.containerInfo,Xe=!0;break e;case 4:ce=s.stateNode.containerInfo,Xe=!0;break e}s=s.return}if(ce===null)throw Error(C(160));af(l,i,o),ce=null,Xe=!1;var u=o.alternate;u!==null&&(u.return=null),o.return=null}catch(a){ee(o,t,a)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)cf(t,e),t=t.sibling}function cf(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(Ye(t,e),ot(e),r&4){try{zr(3,e,e.return),zl(3,e)}catch(v){ee(e,e.return,v)}try{zr(5,e,e.return)}catch(v){ee(e,e.return,v)}}break;case 1:Ye(t,e),ot(e),r&512&&n!==null&&$n(n,n.return);break;case 5:if(Ye(t,e),ot(e),r&512&&n!==null&&$n(n,n.return),e.flags&32){var o=e.stateNode;try{Or(o,"")}catch(v){ee(e,e.return,v)}}if(r&4&&(o=e.stateNode,o!=null)){var l=e.memoizedProps,i=n!==null?n.memoizedProps:l,s=e.type,u=e.updateQueue;if(e.updateQueue=null,u!==null)try{s==="input"&&l.type==="radio"&&l.name!=null&&Rc(o,l),os(s,i);var a=os(s,l);for(i=0;i<u.length;i+=2){var h=u[i],m=u[i+1];h==="style"?Ic(o,m):h==="dangerouslySetInnerHTML"?zc(o,m):h==="children"?Or(o,m):js(o,h,m,a)}switch(s){case"input":qi(o,l);break;case"textarea":Mc(o,l);break;case"select":var f=o._wrapperState.wasMultiple;o._wrapperState.wasMultiple=!!l.multiple;var g=l.value;g!=null?Bn(o,!!l.multiple,g,!1):f!==!!l.multiple&&(l.defaultValue!=null?Bn(o,!!l.multiple,l.defaultValue,!0):Bn(o,!!l.multiple,l.multiple?[]:"",!1))}o[Kr]=l}catch(v){ee(e,e.return,v)}}break;case 6:if(Ye(t,e),ot(e),r&4){if(e.stateNode===null)throw Error(C(162));o=e.stateNode,l=e.memoizedProps;try{o.nodeValue=l}catch(v){ee(e,e.return,v)}}break;case 3:if(Ye(t,e),ot(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Ur(t.containerInfo)}catch(v){ee(e,e.return,v)}break;case 4:Ye(t,e),ot(e);break;case 13:Ye(t,e),ot(e),o=e.child,o.flags&8192&&(l=o.memoizedState!==null,o.stateNode.isHidden=l,!l||o.alternate!==null&&o.alternate.memoizedState!==null||(Cu=te())),r&4&&vc(e);break;case 22:if(h=n!==null&&n.memoizedState!==null,e.mode&1?(ge=(a=ge)||h,Ye(t,e),ge=a):Ye(t,e),ot(e),r&8192){if(a=e.memoizedState!==null,(e.stateNode.isHidden=a)&&!h&&(e.mode&1)!==0)for(F=e,h=e.child;h!==null;){for(m=F=h;F!==null;){switch(f=F,g=f.child,f.tag){case 0:case 11:case 14:case 15:zr(4,f,f.return);break;case 1:$n(f,f.return);var w=f.stateNode;if(typeof w.componentWillUnmount=="function"){r=f,n=f.return;try{t=r,w.props=t.memoizedProps,w.state=t.memoizedState,w.componentWillUnmount()}catch(v){ee(r,n,v)}}break;case 5:$n(f,f.return);break;case 22:if(f.memoizedState!==null){wc(m);continue}}g!==null?(g.return=f,F=g):wc(m)}h=h.sibling}e:for(h=null,m=e;;){if(m.tag===5){if(h===null){h=m;try{o=m.stateNode,a?(l=o.style,typeof l.setProperty=="function"?l.setProperty("display","none","important"):l.display="none"):(s=m.stateNode,u=m.memoizedProps.style,i=u!=null&&u.hasOwnProperty("display")?u.display:null,s.style.display=Lc("display",i))}catch(v){ee(e,e.return,v)}}}else if(m.tag===6){if(h===null)try{m.stateNode.nodeValue=a?"":m.memoizedProps}catch(v){ee(e,e.return,v)}}else if((m.tag!==22&&m.tag!==23||m.memoizedState===null||m===e)&&m.child!==null){m.child.return=m,m=m.child;continue}if(m===e)break e;for(;m.sibling===null;){if(m.return===null||m.return===e)break e;h===m&&(h=null),m=m.return}h===m&&(h=null),m.sibling.return=m.return,m=m.sibling}}break;case 19:Ye(t,e),ot(e),r&4&&vc(e);break;case 21:break;default:Ye(t,e),ot(e)}}function ot(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(uf(n)){var r=n;break e}n=n.return}throw Error(C(160))}switch(r.tag){case 5:var o=r.stateNode;r.flags&32&&(Or(o,""),r.flags&=-33);var l=gc(e);zs(e,l,o);break;case 3:case 4:var i=r.stateNode.containerInfo,s=gc(e);As(e,s,i);break;default:throw Error(C(161))}}catch(u){ee(e,e.return,u)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function qm(e,t,n){F=e,df(e,t,n)}function df(e,t,n){for(var r=(e.mode&1)!==0;F!==null;){var o=F,l=o.child;if(o.tag===22&&r){var i=o.memoizedState!==null||Vo;if(!i){var s=o.alternate,u=s!==null&&s.memoizedState!==null||ge;s=Vo;var a=ge;if(Vo=i,(ge=u)&&!a)for(F=o;F!==null;)i=F,u=i.child,i.tag===22&&i.memoizedState!==null?Cc(o):u!==null?(u.return=i,F=u):Cc(o);for(;l!==null;)F=l,df(l,t,n),l=l.sibling;F=o,Vo=s,ge=a}yc(e,t,n)}else(o.subtreeFlags&8772)!==0&&l!==null?(l.return=o,F=l):yc(e,t,n)}}function yc(e){for(;F!==null;){var t=F;if((t.flags&8772)!==0){var n=t.alternate;try{if((t.flags&8772)!==0)switch(t.tag){case 0:case 11:case 15:ge||zl(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!ge)if(n===null)r.componentDidMount();else{var o=t.elementType===t.type?n.memoizedProps:Ze(t.type,n.memoizedProps);r.componentDidUpdate(o,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var l=t.updateQueue;l!==null&&nc(t,l,r);break;case 3:var i=t.updateQueue;if(i!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}nc(t,i,n)}break;case 5:var s=t.stateNode;if(n===null&&t.flags&4){n=s;var u=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":u.autoFocus&&n.focus();break;case"img":u.src&&(n.src=u.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var a=t.alternate;if(a!==null){var h=a.memoizedState;if(h!==null){var m=h.dehydrated;m!==null&&Ur(m)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(C(163))}ge||t.flags&512&&Ms(t)}catch(f){ee(t,t.return,f)}}if(t===e){F=null;break}if(n=t.sibling,n!==null){n.return=t.return,F=n;break}F=t.return}}function wc(e){for(;F!==null;){var t=F;if(t===e){F=null;break}var n=t.sibling;if(n!==null){n.return=t.return,F=n;break}F=t.return}}function Cc(e){for(;F!==null;){var t=F;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{zl(4,t)}catch(u){ee(t,n,u)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var o=t.return;try{r.componentDidMount()}catch(u){ee(t,o,u)}}var l=t.return;try{Ms(t)}catch(u){ee(t,l,u)}break;case 5:var i=t.return;try{Ms(t)}catch(u){ee(t,i,u)}}}catch(u){ee(t,t.return,u)}if(t===e){F=null;break}var s=t.sibling;if(s!==null){s.return=t.return,F=s;break}F=t.return}}var eg=Math.ceil,_l=kt.ReactCurrentDispatcher,yu=kt.ReactCurrentOwner,Ve=kt.ReactCurrentBatchConfig,L=0,ae=null,ne=null,de=0,Re=0,On=Gt(0),oe=0,qr=null,pn=0,Ll=0,wu=0,Lr=null,ke=null,Cu=0,Xn=1/0,pt=null,kl=!1,Ls=null,Ut=null,Wo=!1,It=null,xl=0,Ir=0,Is=null,qo=-1,el=0;function Ce(){return(L&6)!==0?te():qo!==-1?qo:qo=te()}function Ht(e){return(e.mode&1)===0?1:(L&2)!==0&&de!==0?de&-de:$m.transition!==null?(el===0&&(el=Gc()),el):(e=O,e!==0||(e=window.event,e=e===void 0?16:td(e.type)),e)}function et(e,t,n,r){if(50<Ir)throw Ir=0,Is=null,Error(C(185));eo(e,n,r),((L&2)===0||e!==ae)&&(e===ae&&((L&2)===0&&(Ll|=n),oe===4&&zt(e,de)),Se(e,r),n===1&&L===0&&(t.mode&1)===0&&(Xn=te()+500,Rl&&Yt()))}function Se(e,t){var n=e.callbackNode;Bh(e,t);var r=il(e,e===ae?de:0);if(r===0)n!==null&&Pa(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&Pa(n),t===1)e.tag===0?Im(_c.bind(null,e)):Cd(_c.bind(null,e)),Mm(function(){(L&6)===0&&Yt()}),n=null;else{switch(Yc(r)){case 1:n=Qs;break;case 4:n=Qc;break;case 16:n=ll;break;case 536870912:n=Kc;break;default:n=ll}n=wf(n,ff.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function ff(e,t){if(qo=-1,el=0,(L&6)!==0)throw Error(C(327));var n=e.callbackNode;if(Vn()&&e.callbackNode!==n)return null;var r=il(e,e===ae?de:0);if(r===0)return null;if((r&30)!==0||(r&e.expiredLanes)!==0||t)t=El(e,r);else{t=r;var o=L;L|=2;var l=hf();(ae!==e||de!==t)&&(pt=null,Xn=te()+500,un(e,t));do try{rg();break}catch(s){pf(e,s)}while(!0);lu(),_l.current=l,L=o,ne!==null?t=0:(ae=null,de=0,t=oe)}if(t!==0){if(t===2&&(o=as(e),o!==0&&(r=o,t=$s(e,o))),t===1)throw n=qr,un(e,0),zt(e,r),Se(e,te()),n;if(t===6)zt(e,r);else{if(o=e.current.alternate,(r&30)===0&&!tg(o)&&(t=El(e,r),t===2&&(l=as(e),l!==0&&(r=l,t=$s(e,l))),t===1))throw n=qr,un(e,0),zt(e,r),Se(e,te()),n;switch(e.finishedWork=o,e.finishedLanes=r,t){case 0:case 1:throw Error(C(345));case 2:rn(e,ke,pt);break;case 3:if(zt(e,r),(r&130023424)===r&&(t=Cu+500-te(),10<t)){if(il(e,0)!==0)break;if(o=e.suspendedLanes,(o&r)!==r){Ce(),e.pingedLanes|=e.suspendedLanes&o;break}e.timeoutHandle=vs(rn.bind(null,e,ke,pt),t);break}rn(e,ke,pt);break;case 4:if(zt(e,r),(r&4194240)===r)break;for(t=e.eventTimes,o=-1;0<r;){var i=31-qe(r);l=1<<i,i=t[i],i>o&&(o=i),r&=~l}if(r=o,r=te()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*eg(r/1960))-r,10<r){e.timeoutHandle=vs(rn.bind(null,e,ke,pt),r);break}rn(e,ke,pt);break;case 5:rn(e,ke,pt);break;default:throw Error(C(329))}}}return Se(e,te()),e.callbackNode===n?ff.bind(null,e):null}function $s(e,t){var n=Lr;return e.current.memoizedState.isDehydrated&&(un(e,t).flags|=256),e=El(e,t),e!==2&&(t=ke,ke=n,t!==null&&Os(t)),e}function Os(e){ke===null?ke=e:ke.push.apply(ke,e)}function tg(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var o=n[r],l=o.getSnapshot;o=o.value;try{if(!tt(l(),o))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function zt(e,t){for(t&=~wu,t&=~Ll,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-qe(t),r=1<<n;e[n]=-1,t&=~r}}function _c(e){if((L&6)!==0)throw Error(C(327));Vn();var t=il(e,0);if((t&1)===0)return Se(e,te()),null;var n=El(e,t);if(e.tag!==0&&n===2){var r=as(e);r!==0&&(t=r,n=$s(e,r))}if(n===1)throw n=qr,un(e,0),zt(e,t),Se(e,te()),n;if(n===6)throw Error(C(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,rn(e,ke,pt),Se(e,te()),null}function _u(e,t){var n=L;L|=1;try{return e(t)}finally{L=n,L===0&&(Xn=te()+500,Rl&&Yt())}}function hn(e){It!==null&&It.tag===0&&(L&6)===0&&Vn();var t=L;L|=1;var n=Ve.transition,r=O;try{if(Ve.transition=null,O=1,e)return e()}finally{O=r,Ve.transition=n,L=t,(L&6)===0&&Yt()}}function ku(){Re=On.current,Q(On)}function un(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,Rm(n)),ne!==null)for(n=ne.return;n!==null;){var r=n;switch(nu(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&dl();break;case 3:Yn(),Q(Ee),Q(ve),du();break;case 5:cu(r);break;case 4:Yn();break;case 13:Q(Z);break;case 19:Q(Z);break;case 10:iu(r.type._context);break;case 22:case 23:ku()}n=n.return}if(ae=e,ne=e=Vt(e.current,null),de=Re=t,oe=0,qr=null,wu=Ll=pn=0,ke=Lr=null,ln!==null){for(t=0;t<ln.length;t++)if(n=ln[t],r=n.interleaved,r!==null){n.interleaved=null;var o=r.next,l=n.pending;if(l!==null){var i=l.next;l.next=o,r.next=i}n.pending=r}ln=null}return e}function pf(e,t){do{var n=ne;try{if(lu(),Zo.current=Cl,wl){for(var r=X.memoizedState;r!==null;){var o=r.queue;o!==null&&(o.pending=null),r=r.next}wl=!1}if(fn=0,ue=re=X=null,Ar=!1,Zr=0,yu.current=null,n===null||n.return===null){oe=1,qr=t,ne=null;break}e:{var l=e,i=n.return,s=n,u=t;if(t=de,s.flags|=32768,u!==null&&typeof u=="object"&&typeof u.then=="function"){var a=u,h=s,m=h.tag;if((h.mode&1)===0&&(m===0||m===11||m===15)){var f=h.alternate;f?(h.updateQueue=f.updateQueue,h.memoizedState=f.memoizedState,h.lanes=f.lanes):(h.updateQueue=null,h.memoizedState=null)}var g=uc(i);if(g!==null){g.flags&=-257,ac(g,i,s,l,t),g.mode&1&&sc(l,a,t),t=g,u=a;var w=t.updateQueue;if(w===null){var v=new Set;v.add(u),t.updateQueue=v}else w.add(u);break e}else{if((t&1)===0){sc(l,a,t),xu();break e}u=Error(C(426))}}else if(K&&s.mode&1){var E=uc(i);if(E!==null){(E.flags&65536)===0&&(E.flags|=256),ac(E,i,s,l,t),ru(Zn(u,s));break e}}l=u=Zn(u,s),oe!==4&&(oe=2),Lr===null?Lr=[l]:Lr.push(l),l=i;do{switch(l.tag){case 3:l.flags|=65536,t&=-t,l.lanes|=t;var d=Yd(l,u,t);tc(l,d);break e;case 1:s=u;var c=l.type,p=l.stateNode;if((l.flags&128)===0&&(typeof c.getDerivedStateFromError=="function"||p!==null&&typeof p.componentDidCatch=="function"&&(Ut===null||!Ut.has(p)))){l.flags|=65536,t&=-t,l.lanes|=t;var y=Zd(l,s,t);tc(l,y);break e}}l=l.return}while(l!==null)}gf(n)}catch(D){t=D,ne===n&&n!==null&&(ne=n=n.return);continue}break}while(!0)}function hf(){var e=_l.current;return _l.current=Cl,e===null?Cl:e}function xu(){(oe===0||oe===3||oe===2)&&(oe=4),ae===null||(pn&268435455)===0&&(Ll&268435455)===0||zt(ae,de)}function El(e,t){var n=L;L|=2;var r=hf();(ae!==e||de!==t)&&(pt=null,un(e,t));do try{ng();break}catch(o){pf(e,o)}while(!0);if(lu(),L=n,_l.current=r,ne!==null)throw Error(C(261));return ae=null,de=0,oe}function ng(){for(;ne!==null;)mf(ne)}function rg(){for(;ne!==null&&!Th();)mf(ne)}function mf(e){var t=yf(e.alternate,e,Re);e.memoizedProps=e.pendingProps,t===null?gf(e):ne=t,yu.current=null}function gf(e){var t=e;do{var n=t.alternate;if(e=t.return,(t.flags&32768)===0){if(n=Ym(n,t,Re),n!==null){ne=n;return}}else{if(n=Zm(n,t),n!==null){n.flags&=32767,ne=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{oe=6,ne=null;return}}if(t=t.sibling,t!==null){ne=t;return}ne=t=e}while(t!==null);oe===0&&(oe=5)}function rn(e,t,n){var r=O,o=Ve.transition;try{Ve.transition=null,O=1,og(e,t,n,r)}finally{Ve.transition=o,O=r}return null}function og(e,t,n,r){do Vn();while(It!==null);if((L&6)!==0)throw Error(C(327));n=e.finishedWork;var o=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(C(177));e.callbackNode=null,e.callbackPriority=0;var l=n.lanes|n.childLanes;if(bh(e,l),e===ae&&(ne=ae=null,de=0),(n.subtreeFlags&2064)===0&&(n.flags&2064)===0||Wo||(Wo=!0,wf(ll,function(){return Vn(),null})),l=(n.flags&15990)!==0,(n.subtreeFlags&15990)!==0||l){l=Ve.transition,Ve.transition=null;var i=O;O=1;var s=L;L|=4,yu.current=null,Jm(e,n),cf(n,e),Sm(ms),sl=!!hs,ms=hs=null,e.current=n,qm(n,e,o),Rh(),L=s,O=i,Ve.transition=l}else e.current=n;if(Wo&&(Wo=!1,It=e,xl=o),l=e.pendingLanes,l===0&&(Ut=null),zh(n.stateNode,r),Se(e,te()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)o=t[n],r(o.value,{componentStack:o.stack,digest:o.digest});if(kl)throw kl=!1,e=Ls,Ls=null,e;return(xl&1)!==0&&e.tag!==0&&Vn(),l=e.pendingLanes,(l&1)!==0?e===Is?Ir++:(Ir=0,Is=e):Ir=0,Yt(),null}function Vn(){if(It!==null){var e=Yc(xl),t=Ve.transition,n=O;try{if(Ve.transition=null,O=16>e?16:e,It===null)var r=!1;else{if(e=It,It=null,xl=0,(L&6)!==0)throw Error(C(331));var o=L;for(L|=4,F=e.current;F!==null;){var l=F,i=l.child;if((F.flags&16)!==0){var s=l.deletions;if(s!==null){for(var u=0;u<s.length;u++){var a=s[u];for(F=a;F!==null;){var h=F;switch(h.tag){case 0:case 11:case 15:zr(8,h,l)}var m=h.child;if(m!==null)m.return=h,F=m;else for(;F!==null;){h=F;var f=h.sibling,g=h.return;if(sf(h),h===a){F=null;break}if(f!==null){f.return=g,F=f;break}F=g}}}var w=l.alternate;if(w!==null){var v=w.child;if(v!==null){w.child=null;do{var E=v.sibling;v.sibling=null,v=E}while(v!==null)}}F=l}}if((l.subtreeFlags&2064)!==0&&i!==null)i.return=l,F=i;else e:for(;F!==null;){if(l=F,(l.flags&2048)!==0)switch(l.tag){case 0:case 11:case 15:zr(9,l,l.return)}var d=l.sibling;if(d!==null){d.return=l.return,F=d;break e}F=l.return}}var c=e.current;for(F=c;F!==null;){i=F;var p=i.child;if((i.subtreeFlags&2064)!==0&&p!==null)p.return=i,F=p;else e:for(i=c;F!==null;){if(s=F,(s.flags&2048)!==0)try{switch(s.tag){case 0:case 11:case 15:zl(9,s)}}catch(D){ee(s,s.return,D)}if(s===i){F=null;break e}var y=s.sibling;if(y!==null){y.return=s.return,F=y;break e}F=s.return}}if(L=o,Yt(),st&&typeof st.onPostCommitFiberRoot=="function")try{st.onPostCommitFiberRoot(Sl,e)}catch{}r=!0}return r}finally{O=n,Ve.transition=t}}return!1}function kc(e,t,n){t=Zn(n,t),t=Yd(e,t,1),e=jt(e,t,1),t=Ce(),e!==null&&(eo(e,1,t),Se(e,t))}function ee(e,t,n){if(e.tag===3)kc(e,e,n);else for(;t!==null;){if(t.tag===3){kc(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Ut===null||!Ut.has(r))){e=Zn(n,e),e=Zd(t,e,1),t=jt(t,e,1),e=Ce(),t!==null&&(eo(t,1,e),Se(t,e));break}}t=t.return}}function lg(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=Ce(),e.pingedLanes|=e.suspendedLanes&n,ae===e&&(de&n)===n&&(oe===4||oe===3&&(de&130023424)===de&&500>te()-Cu?un(e,0):wu|=n),Se(e,t)}function vf(e,t){t===0&&((e.mode&1)===0?t=1:(t=Ro,Ro<<=1,(Ro&130023424)===0&&(Ro=4194304)));var n=Ce();e=Ct(e,t),e!==null&&(eo(e,t,n),Se(e,n))}function ig(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),vf(e,n)}function sg(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,o=e.memoizedState;o!==null&&(n=o.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(C(314))}r!==null&&r.delete(t),vf(e,n)}var yf;yf=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||Ee.current)xe=!0;else{if((e.lanes&n)===0&&(t.flags&128)===0)return xe=!1,Gm(e,t,n);xe=(e.flags&131072)!==0}else xe=!1,K&&(t.flags&1048576)!==0&&_d(t,hl,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;Jo(e,t),e=t.pendingProps;var o=Qn(t,ve.current);Hn(t,n),o=pu(null,t,r,e,o,n);var l=hu();return t.flags|=1,typeof o=="object"&&o!==null&&typeof o.render=="function"&&o.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,De(r)?(l=!0,fl(t)):l=!1,t.memoizedState=o.state!==null&&o.state!==void 0?o.state:null,uu(t),o.updater=Al,t.stateNode=o,o._reactInternals=t,Es(t,r,e,n),t=Fs(null,t,r,!0,l,n)):(t.tag=0,K&&l&&tu(t),we(null,t,o,n),t=t.child),t;case 16:r=t.elementType;e:{switch(Jo(e,t),e=t.pendingProps,o=r._init,r=o(r._payload),t.type=r,o=t.tag=ag(r),e=Ze(r,e),o){case 0:t=Ss(null,t,r,e,n);break e;case 1:t=fc(null,t,r,e,n);break e;case 11:t=cc(null,t,r,e,n);break e;case 14:t=dc(null,t,r,Ze(r.type,e),n);break e}throw Error(C(306,r,""))}return t;case 0:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Ze(r,o),Ss(e,t,r,o,n);case 1:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Ze(r,o),fc(e,t,r,o,n);case 3:e:{if(ef(t),e===null)throw Error(C(387));r=t.pendingProps,l=t.memoizedState,o=l.element,Fd(e,t),vl(t,r,null,n);var i=t.memoizedState;if(r=i.element,l.isDehydrated)if(l={element:r,isDehydrated:!1,cache:i.cache,pendingSuspenseBoundaries:i.pendingSuspenseBoundaries,transitions:i.transitions},t.updateQueue.baseState=l,t.memoizedState=l,t.flags&256){o=Zn(Error(C(423)),t),t=pc(e,t,r,n,o);break e}else if(r!==o){o=Zn(Error(C(424)),t),t=pc(e,t,r,n,o);break e}else for(Me=bt(t.stateNode.containerInfo.firstChild),Ae=t,K=!0,Je=null,n=Dd(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Kn(),r===o){t=_t(e,t,n);break e}we(e,t,r,n)}t=t.child}return t;case 5:return Pd(t),e===null&&_s(t),r=t.type,o=t.pendingProps,l=e!==null?e.memoizedProps:null,i=o.children,gs(r,o)?i=null:l!==null&&gs(r,l)&&(t.flags|=32),qd(e,t),we(e,t,i,n),t.child;case 6:return e===null&&_s(t),null;case 13:return tf(e,t,n);case 4:return au(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Gn(t,null,r,n):we(e,t,r,n),t.child;case 11:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Ze(r,o),cc(e,t,r,o,n);case 7:return we(e,t,t.pendingProps,n),t.child;case 8:return we(e,t,t.pendingProps.children,n),t.child;case 12:return we(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,o=t.pendingProps,l=t.memoizedProps,i=o.value,U(ml,r._currentValue),r._currentValue=i,l!==null)if(tt(l.value,i)){if(l.children===o.children&&!Ee.current){t=_t(e,t,n);break e}}else for(l=t.child,l!==null&&(l.return=t);l!==null;){var s=l.dependencies;if(s!==null){i=l.child;for(var u=s.firstContext;u!==null;){if(u.context===r){if(l.tag===1){u=vt(-1,n&-n),u.tag=2;var a=l.updateQueue;if(a!==null){a=a.shared;var h=a.pending;h===null?u.next=u:(u.next=h.next,h.next=u),a.pending=u}}l.lanes|=n,u=l.alternate,u!==null&&(u.lanes|=n),ks(l.return,n,t),s.lanes|=n;break}u=u.next}}else if(l.tag===10)i=l.type===t.type?null:l.child;else if(l.tag===18){if(i=l.return,i===null)throw Error(C(341));i.lanes|=n,s=i.alternate,s!==null&&(s.lanes|=n),ks(i,n,t),i=l.sibling}else i=l.child;if(i!==null)i.return=l;else for(i=l;i!==null;){if(i===t){i=null;break}if(l=i.sibling,l!==null){l.return=i.return,i=l;break}i=i.return}l=i}we(e,t,o.children,n),t=t.child}return t;case 9:return o=t.type,r=t.pendingProps.children,Hn(t,n),o=We(o),r=r(o),t.flags|=1,we(e,t,r,n),t.child;case 14:return r=t.type,o=Ze(r,t.pendingProps),o=Ze(r.type,o),dc(e,t,r,o,n);case 15:return Xd(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:Ze(r,o),Jo(e,t),t.tag=1,De(r)?(e=!0,fl(t)):e=!1,Hn(t,n),Gd(t,r,o),Es(t,r,o,n),Fs(null,t,r,!0,e,n);case 19:return nf(e,t,n);case 22:return Jd(e,t,n)}throw Error(C(156,t.tag))};function wf(e,t){return Wc(e,t)}function ug(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function He(e,t,n,r){return new ug(e,t,n,r)}function Eu(e){return e=e.prototype,!(!e||!e.isReactComponent)}function ag(e){if(typeof e=="function")return Eu(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Hs)return 11;if(e===Vs)return 14}return 2}function Vt(e,t){var n=e.alternate;return n===null?(n=He(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function tl(e,t,n,r,o,l){var i=2;if(r=e,typeof e=="function")Eu(e)&&(i=1);else if(typeof e=="string")i=5;else e:switch(e){case Pn:return an(n.children,o,l,t);case Us:i=8,o|=8;break;case Gi:return e=He(12,n,t,o|2),e.elementType=Gi,e.lanes=l,e;case Yi:return e=He(13,n,t,o),e.elementType=Yi,e.lanes=l,e;case Zi:return e=He(19,n,t,o),e.elementType=Zi,e.lanes=l,e;case Pc:return Il(n,o,l,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Sc:i=10;break e;case Fc:i=9;break e;case Hs:i=11;break e;case Vs:i=14;break e;case Rt:i=16,r=null;break e}throw Error(C(130,e==null?e:typeof e,""))}return t=He(i,n,t,o),t.elementType=e,t.type=r,t.lanes=l,t}function an(e,t,n,r){return e=He(7,e,r,t),e.lanes=n,e}function Il(e,t,n,r){return e=He(22,e,r,t),e.elementType=Pc,e.lanes=n,e.stateNode={isHidden:!1},e}function Wi(e,t,n){return e=He(6,e,null,t),e.lanes=n,e}function Qi(e,t,n){return t=He(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function cg(e,t,n,r,o){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Ni(0),this.expirationTimes=Ni(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ni(0),this.identifierPrefix=r,this.onRecoverableError=o,this.mutableSourceEagerHydrationData=null}function Du(e,t,n,r,o,l,i,s,u){return e=new cg(e,t,n,s,u),t===1?(t=1,l===!0&&(t|=8)):t=0,l=He(3,null,null,t),e.current=l,l.stateNode=e,l.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},uu(l),e}function dg(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Fn,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function Cf(e){if(!e)return Qt;e=e._reactInternals;e:{if(gn(e)!==e||e.tag!==1)throw Error(C(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(De(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(C(171))}if(e.tag===1){var n=e.type;if(De(n))return wd(e,n,t)}return t}function _f(e,t,n,r,o,l,i,s,u){return e=Du(n,r,!0,e,o,l,i,s,u),e.context=Cf(null),n=e.current,r=Ce(),o=Ht(n),l=vt(r,o),l.callback=t??null,jt(n,l,o),e.current.lanes=o,eo(e,o,r),Se(e,r),e}function $l(e,t,n,r){var o=t.current,l=Ce(),i=Ht(o);return n=Cf(n),t.context===null?t.context=n:t.pendingContext=n,t=vt(l,i),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=jt(o,t,i),e!==null&&(et(e,o,i,l),Yo(e,o,i)),i}function Dl(e){return e=e.current,e.child?(e.child.tag===5,e.child.stateNode):null}function xc(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function Su(e,t){xc(e,t),(e=e.alternate)&&xc(e,t)}function fg(){return null}var kf=typeof reportError=="function"?reportError:function(e){console.error(e)};function Fu(e){this._internalRoot=e}Ol.prototype.render=Fu.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(C(409));$l(e,t,null,null)};Ol.prototype.unmount=Fu.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;hn(function(){$l(null,e,null,null)}),t[wt]=null}};function Ol(e){this._internalRoot=e}Ol.prototype.unstable_scheduleHydration=function(e){if(e){var t=Jc();e={blockedOn:null,target:e,priority:t};for(var n=0;n<At.length&&t!==0&&t<At[n].priority;n++);At.splice(n,0,e),n===0&&ed(e)}};function Pu(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Bl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function Ec(){}function pg(e,t,n,r,o){if(o){if(typeof r=="function"){var l=r;r=function(){var a=Dl(i);l.call(a)}}var i=_f(t,r,e,0,null,!1,!1,"",Ec);return e._reactRootContainer=i,e[wt]=i.current,Wr(e.nodeType===8?e.parentNode:e),hn(),i}for(;o=e.lastChild;)e.removeChild(o);if(typeof r=="function"){var s=r;r=function(){var a=Dl(u);s.call(a)}}var u=Du(e,0,!1,null,null,!1,!1,"",Ec);return e._reactRootContainer=u,e[wt]=u.current,Wr(e.nodeType===8?e.parentNode:e),hn(function(){$l(t,u,n,r)}),u}function bl(e,t,n,r,o){var l=n._reactRootContainer;if(l){var i=l;if(typeof o=="function"){var s=o;o=function(){var u=Dl(i);s.call(u)}}$l(t,i,e,o)}else i=pg(n,t,e,o,r);return Dl(i)}Zc=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=Sr(t.pendingLanes);n!==0&&(Ks(t,n|1),Se(t,te()),(L&6)===0&&(Xn=te()+500,Yt()))}break;case 13:hn(function(){var r=Ct(e,1);if(r!==null){var o=Ce();et(r,e,1,o)}}),Su(e,1)}};Gs=function(e){if(e.tag===13){var t=Ct(e,134217728);if(t!==null){var n=Ce();et(t,e,134217728,n)}Su(e,134217728)}};Xc=function(e){if(e.tag===13){var t=Ht(e),n=Ct(e,t);if(n!==null){var r=Ce();et(n,e,t,r)}Su(e,t)}};Jc=function(){return O};qc=function(e,t){var n=O;try{return O=e,t()}finally{O=n}};is=function(e,t,n){switch(t){case"input":if(qi(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var o=Tl(r);if(!o)throw Error(C(90));Tc(r),qi(r,o)}}}break;case"textarea":Mc(e,n);break;case"select":t=n.value,t!=null&&Bn(e,!!n.multiple,t,!1)}};Bc=_u;bc=hn;var hg={usingClientEntryPoint:!1,Events:[no,Mn,Tl,$c,Oc,_u]},kr={findFiberByHostInstance:on,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},mg={bundleType:kr.bundleType,version:kr.version,rendererPackageName:kr.rendererPackageName,rendererConfig:kr.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:kt.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=Hc(e),e===null?null:e.stateNode},findFiberByHostInstance:kr.findFiberByHostInstance||fg,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(xr=__REACT_DEVTOOLS_GLOBAL_HOOK__,!xr.isDisabled&&xr.supportsFiber))try{Sl=xr.inject(mg),st=xr}catch{}var xr;Ie.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=hg;Ie.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Pu(t))throw Error(C(200));return dg(e,t,null,n)};Ie.createRoot=function(e,t){if(!Pu(e))throw Error(C(299));var n=!1,r="",o=kf;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),t=Du(e,1,!1,null,null,n,!1,r,o),e[wt]=t.current,Wr(e.nodeType===8?e.parentNode:e),new Fu(t)};Ie.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(C(188)):(e=Object.keys(e).join(","),Error(C(268,e)));return e=Hc(t),e=e===null?null:e.stateNode,e};Ie.flushSync=function(e){return hn(e)};Ie.hydrate=function(e,t,n){if(!Bl(t))throw Error(C(200));return bl(null,e,t,!0,n)};Ie.hydrateRoot=function(e,t,n){if(!Pu(e))throw Error(C(405));var r=n!=null&&n.hydratedSources||null,o=!1,l="",i=kf;if(n!=null&&(n.unstable_strictMode===!0&&(o=!0),n.identifierPrefix!==void 0&&(l=n.identifierPrefix),n.onRecoverableError!==void 0&&(i=n.onRecoverableError)),t=_f(t,null,e,1,n??null,o,!1,l,i),e[wt]=t.current,Wr(e),r)for(e=0;e<r.length;e++)n=r[e],o=n._getVersion,o=o(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,o]:t.mutableSourceEagerHydrationData.push(n,o);return new Ol(t)};Ie.render=function(e,t,n){if(!Bl(t))throw Error(C(200));return bl(null,e,t,!1,n)};Ie.unmountComponentAtNode=function(e){if(!Bl(e))throw Error(C(40));return e._reactRootContainer?(hn(function(){bl(null,null,e,!1,function(){e._reactRootContainer=null,e[wt]=null})}),!0):!1};Ie.unstable_batchedUpdates=_u;Ie.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!Bl(n))throw Error(C(200));if(e==null||e._reactInternals===void 0)throw Error(C(38));return bl(e,t,n,!1,r)};Ie.version="18.3.1-next-f1338f8080-20240426"});var Nu=ft((s0,Df)=>{"use strict";function Ef(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Ef)}catch(e){console.error(e)}}Ef(),Df.exports=xf()});var Ff=ft(Tu=>{"use strict";var Sf=Nu();Tu.createRoot=Sf.createRoot,Tu.hydrateRoot=Sf.hydrateRoot;var u0});var op=ft(Yl=>{"use strict";var Mg=Ke(),Ag=Symbol.for("react.element"),zg=Symbol.for("react.fragment"),Lg=Object.prototype.hasOwnProperty,Ig=Mg.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,$g={key:!0,ref:!0,__self:!0,__source:!0};function rp(e,t,n){var r,o={},l=null,i=null;n!==void 0&&(l=""+n),t.key!==void 0&&(l=""+t.key),t.ref!==void 0&&(i=t.ref);for(r in t)Lg.call(t,r)&&!$g.hasOwnProperty(r)&&(o[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps,t)o[r]===void 0&&(o[r]=t[r]);return{$$typeof:Ag,type:e,key:l,ref:i,props:o,_owner:Ig.current}}Yl.Fragment=zg;Yl.jsx=rp;Yl.jsxs=rp});var le=ft((M0,lp)=>{"use strict";lp.exports=op()});var e0={};Xp(e0,{mount:()=>qg});var St=B(Ke()),Tp=B(Ff());function jl(e,t){return e.currentTime-(e.dataset?.continuousTimeline==="1"?t:0)}function Ul(e,t,n){return t+(e.dataset?.continuousTimeline==="1"?n:0)}function Pf(e,t){return Number.isFinite(e.duration)?e.duration-(e.dataset?.continuousTimeline==="1"?t:0):null}var T=B(Ke());var Nf="",Tf,Rf=(e,t)=>t,Zt=new Map;function Mf(e,t,n){Nf=new URL(e).origin,Tf=t,Rf=n}function oo(e){return Nf+"/api/"+e.replace(/^\/+/,"").replace(/^api\/+/,"")}async function at(e,t){let n=e.replace(/^\/+/,"").replace(/^api\/+/,"");if(!n.startsWith("public/streams/"))throw new Error("Unsupported chat endpoint");let r=oo(n),o=/\/(timeline|events)$/.test(n)?3e5:n.endsWith("/emotes/live")?6e4:0,l=Zt.get(r);if((!o||!l||l.until<=Date.now())&&(l={until:Date.now()+o,value:Tf(r)},o)){Zt.delete(r),Zt.set(r,l),Zt.size>24&&Zt.delete(Zt.keys().next().value);let i=l;l.value.catch(()=>{Zt.get(r)===i&&Zt.delete(r)})}return Rf(n,await l.value)}var Af={ru:{afterStream:"\u041F\u043E\u0441\u043B\u0435 \u044D\u0444\u0438\u0440\u0430",playTail:"\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0447\u0430\u0442",pauseTail:"\u041F\u0430\u0443\u0437\u0430",showTail:"\u041A \u043A\u043E\u043D\u0446\u0443 \u0447\u0430\u0442\u0430",tailComplete:"\u041A\u043E\u043D\u0435\u0446 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u043E\u0433\u043E \u0447\u0430\u0442\u0430",title:"\u0427\u0430\u0442",messages:"\u0441\u043E\u043E\u0431\u0449.",offset:"\u0421\u0434\u0432\u0438\u0433",settings:"\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0447\u0430\u0442\u0430",offsetAria:"\u0421\u0434\u0432\u0438\u0433 \u0447\u0430\u0442\u0430 \u0432 \u0441\u0435\u043A\u0443\u043D\u0434\u0430\u0445",showDeleted:"\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0435",banPermanent:"\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0437\u0430\u0431\u0430\u043D\u0435\u043D \u043D\u0430\u0432\u0441\u0435\u0433\u0434\u0430",banTimeout:"\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u0442\u0430\u0439\u043C\u0430\u0443\u0442",firstMessage:"1-\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435",firstMessageTitle:"\u041F\u0435\u0440\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u044D\u0442\u043E\u0433\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0432 \u043A\u0430\u043D\u0430\u043B\u0435",loading:"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u0447\u0430\u0442\u2026",loadError:"\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0447\u0430\u0442. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0435 \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C.",empty:"\u0414\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u0441\u0442\u0440\u0438\u043C\u0430 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0447\u0430\u0442\u0430 \u043D\u0435 \u0437\u0430\u043F\u0438\u0441\u0430\u043B\u0438\u0441\u044C.",waiting:"\u041E\u0436\u0438\u0434\u0430\u044E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0434\u043B\u044F \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u0432\u0438\u0434\u0435\u043E\u2026",paused:"\u041F\u0440\u043E\u043A\u0440\u0443\u0442\u043A\u0430 \u0447\u0430\u0442\u0430 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0430 \u2014 \u043A \u043D\u043E\u0432\u044B\u043C \u2193",liveEmotes:"\u0422\u0435\u043A\u0443\u0449\u0438\u0435 \u044D\u043C\u043E\u0443\u0442\u044B \u043A\u0430\u043D\u0430\u043B\u0430",liveEmotesHint:"\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u044D\u043C\u043E\u0443\u0442\u044B \u043D\u0430 \u043C\u043E\u043C\u0435\u043D\u0442 \u0437\u0430\u043F\u0438\u0441\u0438. \u0417\u0434\u0435\u0441\u044C \u2014 \u043D\u0430\u0431\u043E\u0440 \u043A\u0430\u043D\u0430\u043B\u0430 \u043D\u0430 7TV \u043F\u0440\u044F\u043C\u043E \u0441\u0435\u0439\u0447\u0430\u0441: \u043F\u0440\u0438\u0433\u043E\u0434\u0438\u0442\u0441\u044F, \u0435\u0441\u043B\u0438 \u0441\u043D\u0430\u043F\u0448\u043E\u0442 \u043D\u0435 \u0441\u043D\u044F\u043B\u0441\u044F \u0438\u043B\u0438 \u043D\u0430\u0431\u043E\u0440 \u0441 \u0442\u0435\u0445 \u043F\u043E\u0440 \u043F\u043E\u043F\u043E\u043B\u043D\u0438\u043B\u0441\u044F.",liveEmotesLoading:"\u0437\u0430\u0433\u0440\u0443\u0436\u0430\u044E\u2026",liveEmotesError:"\u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C",liveEmotesNone:"\u0443 \u043A\u0430\u043D\u0430\u043B\u0430 \u043D\u0435\u0442 7TV",sectionView:"\u0412\u0438\u0434",sectionHighlight:"\u041F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430",sectionFilter:"\u0424\u0438\u043B\u044C\u0442\u0440\u044B",fontSize:"\u0420\u0430\u0437\u043C\u0435\u0440 \u0442\u0435\u043A\u0441\u0442\u0430",emoteSize:"\u0420\u0430\u0437\u043C\u0435\u0440 \u044D\u043C\u043E\u0443\u0442\u043E\u0432",compact:"\u041F\u043B\u043E\u0442\u043D\u043E",showTimestamps:"\u0412\u0440\u0435\u043C\u044F",stripes:"\u041F\u043E\u043B\u043E\u0441\u044B",readableColors:"\u0427\u0438\u0442\u0430\u0435\u043C\u044B\u0435 \u043D\u0438\u043A\u0438",readableColorsHint:"\u041F\u043E\u0434\u043D\u0438\u043C\u0430\u0435\u0442 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0442\u0451\u043C\u043D\u044B\u0435 \u0446\u0432\u0435\u0442\u0430 \u043D\u0438\u043A\u043E\u0432 \u0434\u043E \u0447\u0438\u0442\u0430\u0435\u043C\u044B\u0445, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044F \u043E\u0442\u0442\u0435\u043D\u043E\u043A.",highlightFirst:"\u041F\u0435\u0440\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435",keywords:"\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u0441\u043B\u043E\u0432\u0430",keywordsPlaceholder:"\u0432\u0430\u0448 \u043D\u0438\u043A, \u0440\u043E\u0437\u044B\u0433\u0440\u044B\u0448",keywordsHint:"\u0427\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E. \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0441 \u044D\u0442\u0438\u043C\u0438 \u0441\u043B\u043E\u0432\u0430\u043C\u0438 \u043F\u043E\u043B\u0443\u0447\u0430\u044E\u0442 \u0430\u043A\u0446\u0435\u043D\u0442\u043D\u0443\u044E \u043F\u043E\u043B\u043E\u0441\u0443.",hideCommands:"\u0421\u043A\u0440\u044B\u0442\u044C !\u043A\u043E\u043C\u0430\u043D\u0434\u044B",hiddenUsers:"\u0421\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439",hiddenUsersPlaceholder:"nightbot, streamelements",search:"\u041F\u043E\u0438\u0441\u043A",searchPlaceholder:"\u0442\u0435\u043A\u0441\u0442 \u0438\u043B\u0438 \u043D\u0438\u043A",reset:"\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",filtered:"\u043E\u0442\u0444\u0438\u043B\u044C\u0442\u0440\u043E\u0432\u0430\u043D\u043E",userCardHistory:"\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u0440\u043E\u0448\u043B\u044B\u0445 \u044D\u0444\u0438\u0440\u043E\u0432",userCardHistoryLoading:"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u043F\u0440\u043E\u0448\u043B\u044B\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F\u2026",userCardHistoryRetry:"\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u043B\u0430\u0441\u044C \u2014 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C",userCardHistoryLimit:"\u043F\u043E\u043A\u0430\u0437\u0430\u043D\u044B \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 1000",userCardPastStream:"\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0438\u0437 \u043F\u0440\u043E\u0448\u043B\u043E\u0433\u043E \u044D\u0444\u0438\u0440\u0430",userCardMore:"\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0435\u0449\u0451 100 (\u0441\u0442\u0430\u0440\u0448\u0435)",userCardTitle:"\u0418\u0441\u0442\u043E\u0440\u0438\u044F",userCardHint:"\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0434\u043E \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430 \u0432\u0438\u0434\u0435\u043E",userCardEmpty:"\u041A \u044D\u0442\u043E\u043C\u0443 \u043C\u043E\u043C\u0435\u043D\u0442\u0443 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0435\u0449\u0451 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043F\u0438\u0441\u0430\u043B.",userCardCount:"\u0441\u043E\u043E\u0431\u0449. \u043A \u044D\u0442\u043E\u043C\u0443 \u043C\u043E\u043C\u0435\u043D\u0442\u0443",userCardTotal:"\u0432\u0441\u0435\u0433\u043E \u0437\u0430 \u044D\u0444\u0438\u0440",userCardFirst:"\u043F\u0435\u0440\u0432\u043E\u0435",userCardClose:"\u0417\u0430\u043A\u0440\u044B\u0442\u044C",userCardSeek:"\u041F\u0435\u0440\u0435\u043C\u043E\u0442\u0430\u0442\u044C \u043A \u044D\u0442\u043E\u043C\u0443 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044E",userCardOtherPart:"\u042D\u0442\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0432 \u0434\u0440\u0443\u0433\u043E\u0439 \u0447\u0430\u0441\u0442\u0438 \u0437\u0430\u043F\u0438\u0441\u0438",userCardDeleted:"\u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0445",userCardDrag:"\u041F\u043E\u0442\u044F\u043D\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u043F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438 \u043E\u043A\u043D\u043E",userCardSearch:"\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F\u043C",userCardNoMatch:"\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E.",offsetSaved:"\u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D \u0434\u043B\u044F \u044D\u0442\u043E\u0439 \u0437\u0430\u043F\u0438\u0441\u0438",metaViewers:"\u0437\u0440\u0438\u0442\u0435\u043B\u0435\u0439",metaPeak:"\u043F\u0438\u043A",metaNoData:"\u0414\u043B\u044F \u044D\u0442\u043E\u0439 \u0437\u0430\u043F\u0438\u0441\u0438 \u0434\u0430\u043D\u043D\u044B\u0445 \u043E\u0431 \u044D\u0444\u0438\u0440\u0435 \u043D\u0435\u0442.",metaReveal:"\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0435\u0441\u044C \u044D\u0444\u0438\u0440",metaRevealHint:"\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u0432\u0438\u0434\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E, \u0434\u043E \u0447\u0435\u0433\u043E \u0434\u043E\u0438\u0433\u0440\u0430\u043B\u0430 \u0437\u0430\u043F\u0438\u0441\u044C, \u2014 \u0438\u043D\u0430\u0447\u0435 \u043F\u043E\u043B\u043E\u0441\u0430 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u0441\u0440\u0430\u0437\u0443 \u0432\u044B\u0434\u0430\u0451\u0442, \u0447\u0442\u043E \u0431\u0443\u0434\u0435\u0442 \u0434\u0430\u043B\u044C\u0448\u0435.",metaAhead:"\u0434\u0430\u043B\u044C\u0448\u0435",metaCategory:"\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F",eventsShow:"\u0421\u0442\u0430\u0432\u043A\u0438 \u0438 \u043E\u043F\u0440\u043E\u0441\u044B",eventsCollapse:"\u0421\u0432\u043E\u0440\u0430\u0447\u0438\u0432\u0430\u0442\u044C \u0441\u0442\u0430\u0432\u043A\u0438 \u0438 \u043E\u043F\u0440\u043E\u0441\u044B",eventsCollapseHint:"\u041E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u043D\u0435\u0433\u043E, \u0447\u0442\u043E\u0431\u044B \u0440\u0430\u0441\u043A\u0440\u044B\u0442\u044C. \u0412\u044B\u0431\u043E\u0440 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u0434\u043B\u044F \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0445 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u043E\u0432.",eventCollapse:"\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443",eventExpand:"\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0443",eventsHint:"\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0441\u0442\u0430\u0432\u043A\u0438 \u0438\u043B\u0438 \u043E\u043F\u0440\u043E\u0441\u0430 \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u0435\u0442 \u0442\u0430\u043C \u0436\u0435, \u0433\u0434\u0435 \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u043B\u0430 \u0432 \u044D\u0444\u0438\u0440\u0435, \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043F\u043E \u0445\u043E\u0434\u0443 \u0437\u0430\u043F\u0438\u0441\u0438. \u0418\u0442\u043E\u0433 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0441\u043B\u0435 \u0442\u043E\u0433\u043E, \u043A\u0430\u043A \u0441\u0442\u0440\u0438\u043C\u0435\u0440 \u0435\u0433\u043E \u043E\u0431\u044A\u044F\u0432\u0438\u043B.",eventPrediction:"\u0421\u0442\u0430\u0432\u043A\u0430",eventPoll:"\u041E\u043F\u0440\u043E\u0441",eventOpen:"\u041F\u0440\u0438\u0451\u043C \u0441\u0442\u0430\u0432\u043E\u043A",eventLocked:"\u0421\u0442\u0430\u0432\u043A\u0438 \u0437\u0430\u043A\u0440\u044B\u0442\u044B",eventResolved:"\u0418\u0442\u043E\u0433",eventCancelled:"\u041E\u0442\u043C\u0435\u043D\u0435\u043D\u043E \u2014 \u043E\u0447\u043A\u0438 \u0432\u0435\u0440\u043D\u0443\u043B\u0438",eventWinner:"\u041F\u043E\u0431\u0435\u0434\u0438\u043B",eventPollDone:"\u041E\u043F\u0440\u043E\u0441 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D",eventPoints:"\u043E\u0447\u043A\u043E\u0432",eventVotes:"\u0433\u043E\u043B\u043E\u0441\u043E\u0432",eventUsers:"\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u043E\u0432",eventBetOn:"\u041F\u043E\u0441\u0442\u0430\u0432\u0438\u043B \u043D\u0430",eventReturn:"\u041A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442",eventAlreadyOpen:"\u0428\u043B\u0430 \u0434\u043E \u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u043F\u0438\u0441\u0438"},en:{afterStream:"After the stream",playTail:"Continue chat",pauseTail:"Pause",showTail:"Jump to chat end",tailComplete:"End of saved chat",title:"Chat",messages:"messages",offset:"Offset",settings:"Chat settings",offsetAria:"Chat offset in seconds",showDeleted:"Show deleted",banPermanent:"User was banned permanently",banTimeout:"User was timed out",firstMessage:"First message",firstMessageTitle:"The author's first ever message in this channel",loading:"Loading chat\u2026",loadError:"Could not load chat. Check the server connection.",empty:"No chat messages were captured for this stream.",waiting:"Waiting for messages at this video time\u2026",paused:"Chat paused \u2014 jump to latest \u2193",liveEmotes:"Channel's current emotes",liveEmotesHint:"By default the emotes are the ones from the time of recording. This shows the channel's 7TV set as it is now \u2014 useful when no snapshot was taken, or the set has grown since.",liveEmotesLoading:"loading\u2026",liveEmotesError:"could not load",liveEmotesNone:"channel has no 7TV",sectionView:"Appearance",sectionHighlight:"Highlighting",sectionFilter:"Filters",fontSize:"Text size",emoteSize:"Emote size",compact:"Compact",showTimestamps:"Timestamps",stripes:"Stripes",readableColors:"Readable names",readableColorsHint:"Lifts author colours that are too dark to read, keeping their hue.",highlightFirst:"First message",keywords:"Keywords",keywordsPlaceholder:"your name, giveaway",keywordsHint:"Comma-separated. Messages containing them get an accent bar.",hideCommands:"Hide !commands",hiddenUsers:"Hide users",hiddenUsersPlaceholder:"nightbot, streamelements",search:"Search",searchPlaceholder:"text or name",reset:"Reset settings",filtered:"filtered",userCardHistory:"Previous broadcasts",userCardHistoryLoading:"Loading earlier messages\u2026",userCardHistoryRetry:"History could not load \u2014 retry",userCardHistoryLimit:"latest 1000 shown",userCardPastStream:"Message from an earlier broadcast",userCardMore:"Show 100 more (older)",userCardTitle:"History",userCardHint:"Messages up to the current video time",userCardEmpty:"This user had not written anything by this point.",userCardCount:"messages so far",userCardTotal:"total this stream",userCardFirst:"first",userCardClose:"Close",userCardSeek:"Jump to this message",userCardOtherPart:"This message is in another part of the recording",userCardDeleted:"deleted",userCardDrag:"Drag to move the window",userCardSearch:"Search messages",userCardNoMatch:"Nothing found.",offsetSaved:"saved for this recording",metaViewers:"viewers",metaPeak:"peak",metaNoData:"No broadcast data was recorded for this stream.",metaReveal:"Reveal whole stream",metaRevealHint:"By default only the part the recording has reached is shown \u2014 otherwise the category strip gives away what happens later.",metaAhead:"ahead",metaCategory:"Category",eventsShow:"Predictions and polls",eventsCollapse:"Collapse predictions and polls",eventsCollapseHint:"Keep only the card header. Click it to expand. Your choice is saved for future visits.",eventCollapse:"Collapse card",eventExpand:"Expand card",eventsHint:"A prediction or poll card appears where it appeared live and updates as the recording plays. The result shows only once the streamer called it.",eventPrediction:"Prediction",eventPoll:"Poll",eventOpen:"Betting open",eventLocked:"Bets closed",eventResolved:"Result",eventCancelled:"Cancelled \u2014 points refunded",eventWinner:"Winner",eventPollDone:"Poll finished",eventPoints:"points",eventVotes:"votes",eventUsers:"backers",eventBetOn:"Bet on",eventReturn:"Return",eventAlreadyOpen:"Was already running when the recording began"}},vn={broadcaster:{ru:"\u0421\u0442\u0440\u0438\u043C\u0435\u0440",en:"Broadcaster",badge:"\u0421\u0422\u0420"},moderator:{ru:"\u041C\u043E\u0434\u0435\u0440\u0430\u0442\u043E\u0440\u044B",en:"Moderators",badge:"MOD"},vip:{ru:"VIP",en:"VIP",badge:"VIP"},subscriber:{ru:"\u041F\u043E\u0434\u043F\u0438\u0441\u0447\u0438\u043A\u0438",en:"Subscribers",badge:"SUB"},verified:{ru:"\u0421\u0442\u0440\u0438\u043C\u0435\u0440\u044B / \u2713",en:"Streamers / \u2713",badge:"\u2713"},staff:{ru:"\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B",en:"Staff",badge:"STAFF"},founder:{ru:"\u041E\u0441\u043D\u043E\u0432\u0430\u0442\u0435\u043B\u0438",en:"Founders",badge:"FND"},og:{ru:"OG",en:"OG",badge:"OG"},sub_gifter:{ru:"\u0414\u0430\u0440\u0438\u0442\u0435\u043B\u0438",en:"Gifters",badge:"GIFT"},turbo:{ru:"Turbo",en:"Turbo",badge:"T"},artist:{ru:"\u0425\u0443\u0434\u043E\u0436\u043D\u0438\u043A\u0438",en:"Artists",badge:"ART"}};var Fe=B(Ke()),Lf=["broadcaster","moderator","vip","subscriber","verified","staff"],yn={fontPx:13,emotePx:28,compact:!1,showTimestamps:!0,stripes:!1,readableColors:!0,showDeleted:!0,useLiveEmotes:!1,highlightRoles:["broadcaster","moderator"],highlightFirstMessage:!0,keywords:"",hideCommands:!1,hiddenUsers:"",revealTimeline:!1,showEvents:!0,collapseEvents:!1,showBets:!0},xt={fontPx:{min:10,max:24},emotePx:{min:16,max:64}},If="tsr-chat-prefs",gg="tsr-chat-show-deleted",vg="tsr-chat-live-emotes";function zf(e,t,n,r){let o=Number(e);return Number.isFinite(o)?Math.min(n,Math.max(t,Math.round(o))):r}function yg(){if(typeof window>"u")return yn;let e={};try{let t=window.localStorage.getItem(If);t&&(e=JSON.parse(t))}catch{}try{e.showDeleted===void 0&&(e.showDeleted=window.localStorage.getItem(gg)!=="0"),e.useLiveEmotes===void 0&&(e.useLiveEmotes=window.localStorage.getItem(vg)==="1")}catch{}return{...yn,...e,fontPx:zf(e.fontPx,xt.fontPx.min,xt.fontPx.max,yn.fontPx),emotePx:zf(e.emotePx,xt.emotePx.min,xt.emotePx.max,yn.emotePx),highlightRoles:Array.isArray(e.highlightRoles)?e.highlightRoles:yn.highlightRoles}}function $f(){let[e,t]=(0,Fe.useState)(yn),[n,r]=(0,Fe.useState)(!1);(0,Fe.useEffect)(()=>{t(yg()),r(!0)},[]),(0,Fe.useEffect)(()=>{if(n)try{window.localStorage.setItem(If,JSON.stringify(e))}catch{}},[e,n]);let o=(0,Fe.useCallback)((s,u)=>{t(a=>({...a,[s]:u}))},[]),l=(0,Fe.useCallback)(s=>{t(u=>({...u,highlightRoles:u.highlightRoles.includes(s)?u.highlightRoles.filter(a=>a!==s):[...u.highlightRoles,s]}))},[]),i=(0,Fe.useCallback)(()=>t(yn),[]);return{prefs:e,update:o,toggleRole:l,reset:i}}function Of(e,t){let[n,r]=(0,Fe.useState)(t),[o,l]=(0,Fe.useState)(!1),i=e?`tsr-chat-offset:${e}`:null;return(0,Fe.useEffect)(()=>{if(l(!1),!i){r(t),l(!0);return}let s=null;try{let u=window.localStorage.getItem(i);if(u!==null){let a=Number(u);Number.isFinite(a)&&(s=a)}}catch{}r(s??t),l(!0)},[i,t]),(0,Fe.useEffect)(()=>{if(!(!o||!i))try{n===t?window.localStorage.removeItem(i):window.localStorage.setItem(i,String(n))}catch{}},[n,t,i,o]),[n,r]}function Ru(e){return e.split(",").map(t=>t.trim().toLowerCase()).filter(Boolean)}function Hl(e){if(!e)return"#9ca3af";let t=/^#?([0-9a-f]{6})$/i.exec(e.trim());if(!t)return e;let n=parseInt(t[1],16),r=n>>16&255,o=n>>8&255,l=n&255,i=(.2126*r+.7152*o+.0722*l)/255;if(i>=.35)return e;let s=.35/Math.max(i,.04);return r=Math.min(255,Math.round(r*s)||90),o=Math.min(255,Math.round(o*s)||90),l=Math.min(255,Math.round(l*s)||90),`rgb(${r}, ${o}, ${l})`}var Bf=/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,bf=/[\0-\x1F\x7F-\x9F]/;var jf=/[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B4E\u1B4F\u1B5A-\u1B60\u1B7D-\u1B7F\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDD6E\uDEAD\uDED0\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9\uDFD4\uDFD5\uDFD7\uDFD8]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09\uDFE1]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDD6D-\uDD6F\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD839\uDDFF|\uD83A[\uDD5E\uDD5F]/;var Uf=/[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;var wg=class{constructor(e={}){se(this,"src_Any",Bf.source);se(this,"src_Cc",bf.source);se(this,"src_Z",Uf.source);se(this,"src_P",jf.source);se(this,"src_ZPCc",[this.src_Z,this.src_P,this.src_Cc].join("|"));se(this,"src_ZCc",[this.src_Z,this.src_Cc].join("|"));se(this,"cache",{});se(this,"opts",{maxLength:1e4,urlAuth:!1,schema_names:[]});this.opts={...this.opts,...e}}set(e={}){return this.opts={...this.opts,...e},this.cache={},this}escapeRE(e){return e.replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&")}nestedPairRE(e,t,n=4){let r=this.escapeRE(e),o=this.escapeRE(t),l=`(?:(?!${this.src_ZCc}|${r}|${o}).)`,i=`${r}${l}{0,1000}${o}`;for(let s=2;s<=n;s++)i=`${r}(?:${l}|${i}){0,1000}${o}`;return i}get_text_separators(){var e;return(e=this.cache).text_separators??(e.text_separators=/[><\uff5c]/)}get_pseudo_letter(){var e;return(e=this.cache).src_pseudo_letter??(e.src_pseudo_letter=new RegExp(`(?:(?!${this.get_text_separators().source}|${this.src_ZPCc})${this.src_Any})`))}get_ipv4_addr(){var e;return(e=this.cache).src_ip4??(e.src_ip4=new RegExp("(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])[.]){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])"))}get_ipv6_addr(){var n;let e="[0-9A-Fa-f]{1,4}",t=`(?:(?:${e}:${e})|${this.get_ipv4_addr().source})`;return(n=this.cache).src_ip6_addr??(n.src_ip6_addr=new RegExp(`(?:(?:${e}:){6}${t}|::(?:${e}:){5}${t}|(?:${e})?::(?:${e}:){4}${t}|(?:(?:${e}:){0,1}${e})?::(?:${e}:){3}${t}|(?:(?:${e}:){0,2}${e})?::(?:${e}:){2}${t}|(?:(?:${e}:){0,3}${e})?::${e}:${t}|(?:(?:${e}:){0,4}${e})?::${t}|(?:(?:${e}:){0,5}${e})?::${e}|(?:(?:${e}:){0,6}${e})?::)`))}get_ipv6_url_host(){var e;return(e=this.cache).src_ip6_host??(e.src_ip6_host=new RegExp(`\\[${this.get_ipv6_addr().source}\\]`))}get_ipv6_mail_host(){var e;return(e=this.cache).src_ipv6_mail_host??(e.src_ipv6_mail_host=new RegExp(`\\[IPv6:${this.get_ipv6_addr().source}\\]`))}get_auth(){var e;return(e=this.cache).src_auth??(e.src_auth=new RegExp(`(?:(?:(?!${this.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`))}get_port(){var e;return(e=this.cache).src_port??(e.src_port=new RegExp("(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?"))}get_host_terminator(){var e;return(e=this.cache).src_host_terminator??(e.src_host_terminator=new RegExp(`(?=$|${this.get_text_separators().source}|${this.src_ZPCc})(?!${this.opts["---"]?"-(?!--)|":"-|"}_|:\\d|\\.-|\\.(?!$|${this.src_ZPCc}))`))}get_path_terminator(){var e;return(e=this.cache).src_path_terminator??(e.src_path_terminator=new RegExp(`${this.src_ZPCc}|${this.get_text_separators().source}`))}get_path(){var e;return(e=this.cache).src_path??(e.src_path=new RegExp(`(?:[/?#](?:${this.nestedPairRE("[","]")}|${this.nestedPairRE("(",")")}|${this.nestedPairRE("{","}")}|\\"(?:(?!${this.src_ZCc}|["]).){1,100}\\"|\\'(?:(?!${this.src_ZCc}|[']).){1,100}\\'|\\'(?=${this.get_pseudo_letter().source}|[-])|\\.{2,20}[:]?[a-zA-Z0-9%/&]|\\.(?!${this.src_ZCc}|[.]|$)|`+(this.opts["---"]?"\\-(?!--(?:[^-]|$))(?:-{0,19})|":"\\-{1,20}|")+`,(?!${this.src_ZCc}|$)|;(?!${this.src_ZCc}|$)|\\!{1,20}(?!${this.src_ZCc}|[!]|$)|\\?(?!${this.src_ZCc}|[?]|$)|`+this.get_path_extra().source+`[\\\\/:%@#&=_~*]|(?!${this.get_path_terminator().source}).){1,${this.opts.maxLength}}|\\/)?`))}get_mail_name(){var e;return(e=this.cache).src_mail_name??(e.src_mail_name=new RegExp("[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9](?:[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9]|[.](?=[-!#$%&'*+/=?^_`{|}~a-zA-Z0-9])){0,63}"))}get_xn(){var e;return(e=this.cache).src_xn??(e.src_xn=new RegExp("xn--[a-z0-9\\-]{1,59}"))}get_tld(){if(this.cache.tld)return this.cache.tld;let e=[...new Set(this.opts.tlds||[])].sort().reverse().join("|");return this.cache.tld=new RegExp(`${e||"$#none#$"}|${this.get_xn().source}`),this.cache.tld}get_domain_root(){var e;return(e=this.cache).src_domain_root??(e.src_domain_root=new RegExp("(?:"+this.get_xn().source+`|${this.get_pseudo_letter().source}{1,63})`))}get_domain(){var e;return(e=this.cache).src_domain??(e.src_domain=new RegExp("(?:"+this.get_xn().source+`|(?:${this.get_pseudo_letter().source})|(?:${this.get_pseudo_letter().source}(?:-|${this.get_pseudo_letter().source}){0,61}${this.get_pseudo_letter().source}))`))}get_url_host_port(){var e;return(e=this.cache).url_host_port??(e.url_host_port=new RegExp("(?:"+this.get_ipv6_url_host().source+`|(?:(?:(?:${this.get_domain().source})\\.){0,10}${this.get_domain().source}))`+this.get_port().source+this.get_host_terminator().source))}get_fuzzy_url_host_port(){var e;return(e=this.cache).fuzzy_url_host_port??(e.fuzzy_url_host_port=new RegExp("(?:"+(this.opts.fuzzyIP?this.get_ipv4_addr().source+"|":"")+`(?:(?:(?:${this.get_domain().source})\\.){1,10}(?:${this.get_tld().source})))`+this.get_host_terminator().source))}get_mail_host(){var e;return(e=this.cache).src_mail_host??(e.src_mail_host=new RegExp("(?:"+this.get_ipv6_mail_host().source+`|(?:(?:(?:${this.get_domain().source})\\.){0,4}${this.get_domain().source}))`+this.get_host_terminator().source))}get_fuzzy_mail_host(){var e;return(e=this.cache).src_fuzzy_mail_host??(e.src_fuzzy_mail_host=new RegExp("(?:"+this.get_ipv6_mail_host().source+`|(?:(?:(?:${this.get_domain().source})[.]){1,4}${this.get_domain_root().source}))`+this.get_host_terminator().source))}get_path_extra(){var e;return(e=this.cache).src_path_extra??(e.src_path_extra=new RegExp(""))}get_fuzzy_mail_host_search(){var e;return(e=this.cache).mail_fuzzy_host_search??(e.mail_fuzzy_host_search=new RegExp(`@${this.get_fuzzy_mail_host().source}`,"ig"))}get_fuzzy_link_search(){var e;return(e=this.cache).link_fuzzy_search??(e.link_fuzzy_search=new RegExp(`(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uFF5C]|${this.src_ZPCc}))(?:(?![$+<=>^\`|\uFF5C])${this.get_fuzzy_url_host_port().source}${this.get_path().source})`,"ig"))}get_http_validator(){var e;return(e=this.cache).http_validator??(e.http_validator=new RegExp("\\/\\/"+(this.opts.urlAuth?this.get_auth().source:"")+this.get_url_host_port().source+this.get_path().source,"iy"))}get_relative_proto_validator(){var e;return(e=this.cache).relative_proto_validator??(e.relative_proto_validator=new RegExp((this.opts.urlAuth?this.get_auth().source:"")+`(?:localhost|${this.get_ipv6_url_host().source}|(?:(?:${this.get_domain().source})[.]){1,10}${this.get_domain_root().source})`+this.get_port().source+this.get_host_terminator().source+this.get_path().source,"iy"))}get_mail_name_validator(){var e;return(e=this.cache).mail_name_validator??(e.mail_name_validator=new RegExp(`(?:^|${this.get_text_separators().source}|"|\\(|${this.src_ZCc})(${this.get_mail_name().source})$`))}get_mailto_validator(){var e;return(e=this.cache).mailto_validator??(e.mailto_validator=new RegExp(`${this.get_mail_name().source}@${this.get_mail_host().source}`,"iy"))}get_schema_names(){var e;return(e=this.cache).schema_names??(e.schema_names=new RegExp((this.opts.schema_names||[]).map(t=>this.escapeRE(t)).join("|")))}get_schema_search(){var e;return(e=this.cache).schema_search??(e.schema_search=new RegExp(`(^|(?!_)(?:[><\uFF5C]|${this.src_ZPCc}))(${this.get_schema_names().source})`,"ig"))}get_schema_at_start(){var e;return(e=this.cache).schema_at_start??(e.schema_at_start=new RegExp(`^${this.get_schema_search().source}`,"i"))}},Mu={validate:(e,t,n)=>{let r=n.re.get_http_validator();r.lastIndex=t;let o=r.exec(e);return o?o[0].length:0},normalize:(e,t)=>t.normalize(e)},Cg={"http:":Mu,"https:":Mu,"ftp:":Mu,"//":{validate:function(e,t,n){let r=n.re.get_relative_proto_validator();r.lastIndex=t;let o=r.exec(e);return o?t>=3&&e[t-3]===":"||t>=3&&e[t-3]==="/"?0:o[0].length:0},normalize:(e,t)=>t.normalize(e)},"mailto:":{validate:function(e,t,n){let r=n.re.get_mailto_validator();r.lastIndex=t;let o=r.exec(e);return o?o[0].length:0},normalize:(e,t)=>t.normalize(e)}},_g="a:cdefgilmnoqrstuwxz|b:abdefghijmnorstvwyz|c:acdfghiklmnoruvwxyz|d:ejkmoz|e:cegrstu|f:ijkmor|g:abdefghilmnpqrstuwy|h:kmnrtu|i:delmnoqrst|j:emop|k:eghimnprwyz|l:abcikrstuvy|m:acdeghklmnopqrstuvwxyz|n:acefgilopruz|o:m|p:aefghklmnrstwy|q:a|r:eosuw|s:abcdeghijklmnortuvxyz|t:cdfghjklmnortvwz|u:agksyz|v:aceginu|w:fs|y:et|z:amw",kg="biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444";function xg(){let e=kg.split("|");return _g.split("|").forEach(t=>{let n=t.indexOf(":"),r=t.slice(0,n);for(let o of t.slice(n+1))e.push(r+o)}),e}var Eg={fuzzyLink:!1,fuzzyEmail:!0,fuzzyIP:!1,"---":!1,tlds:xg(),urlAuth:!1,maxLength:1e4},Hf=class{constructor(e,t,n,r){se(this,"schema");se(this,"index");se(this,"lastIndex");se(this,"raw");se(this,"text");se(this,"url");let o=e.slice(n,r);this.schema=t.toLowerCase(),this.index=n,this.lastIndex=r,this.raw=o,this.text=o,this.url=o}},Vf=class{constructor(e={}){se(this,"__opts__");se(this,"__schemas__");se(this,"re");let{rebuilder:t,...n}=e;this.__opts__={...Eg,...n},this.__schemas__={...Cg},this.re=t||new wg,this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)})}add(e,t=null){if(!t)delete this.__schemas__[e];else{let n={normalize:(r,o)=>o.normalize(r),...t};this.__schemas__[e]=n}return this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)}),this}set(e={}){return this.__opts__={...this.__opts__,...e},this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)}),this}test(e){if(!e.length)return!1;let t,n;for(n=this.re.get_schema_search(),n.lastIndex=0;(t=n.exec(e))!==null;)if(this.testSchemaAt(e,t[2],n.lastIndex))return!0;if(this.__opts__.fuzzyLink&&this.__schemas__["http:"]&&(n=this.re.get_fuzzy_link_search(),n.lastIndex=0,n.exec(e)!==null))return!0;if(this.__opts__.fuzzyEmail&&this.__schemas__["mailto:"]&&e.indexOf("@")>=0){let r=this.re.get_fuzzy_mail_host_search(),o=this.re.get_mail_name_validator();for(r.lastIndex=0;(t=r.exec(e))!==null;){let l=e.slice(Math.max(0,t.index-65),t.index);if(o.test(l))return!0}}return!1}testSchemaAt(e,t,n){return this.__schemas__[t.toLowerCase()]?this.__schemas__[t.toLowerCase()].validate(e.slice(0,n+this.__opts__.maxLength),n,this):0}match(e){let t=[],n=this.re.get_schema_search(),r,o,l,i,s,u,a=!1,h=!1,m=!1,f=0;if(!e.length)return null;for(n.lastIndex=0,this.__opts__.fuzzyLink&&this.__schemas__["http:"]&&(r=this.re.get_fuzzy_link_search(),r.lastIndex=0),this.__opts__.fuzzyEmail&&this.__schemas__["mailto:"]&&(o=this.re.get_fuzzy_mail_host_search(),o.lastIndex=0,l=this.re.get_mail_name_validator());;){let g=Math.max(f-1,0);if(o&&l&&!m&&(!s||s.index<f))for(o.lastIndex<g&&(o.lastIndex=g);;){let c=o.exec(e);if(!c){m=!0,s=void 0;break}let p=l.exec(e.slice(Math.max(0,c.index-65),c.index));if(p){if(s={schema:"mailto:",index:c.index-p[1].length,lastIndex:c.index+c[0].length},s.index>=f)break;o.lastIndex<g&&(o.lastIndex=g)}}if(r&&!h&&(!i||i.index<f))for(r.lastIndex<g&&(r.lastIndex=g);;){let c=r.exec(e);if(!c){h=!0,i=void 0;break}if(i={schema:"",index:c.index+c[1].length,lastIndex:c.index+c[0].length},i.index>=f)break;r.lastIndex<g&&(r.lastIndex=g)}let w=s;(!w||i&&(i.index<w.index||i.index===w.index&&i.lastIndex>w.lastIndex))&&(w=i);let v;if(!a)for(;;){if(!u){n.lastIndex<g&&(n.lastIndex=g);let y=n.exec(e);if(!y){a=!0;break}u={schema:y[2],index:y.index+y[1].length,lastIndex:y.index+y[0].length}}if(u.index<f){u=void 0;continue}if(w&&u.index>w.index)break;let c=u;u=void 0;let p=this.testSchemaAt(e,c.schema,c.lastIndex);if(p){v={schema:c.schema,index:c.index,lastIndex:c.lastIndex+p};break}}let E=v;if((!E||s&&(s.index<E.index||s.index===E.index&&s.lastIndex>E.lastIndex))&&(E=s),(!E||i&&(i.index<E.index||i.index===E.index&&i.lastIndex>E.lastIndex))&&(E=i),!E)break;E===s?s=void 0:E===i&&(i=void 0);let d=new Hf(e,E.schema,E.index,E.lastIndex);d.schema?this.__schemas__[d.schema].normalize(d,this):this.normalize(d),t.push(d),f=E.lastIndex}return t.length?t:null}matchAtStart(e){if(!e.length)return null;let t=this.re.get_schema_at_start().exec(e);if(!t)return null;let n=this.testSchemaAt(e,t[2],t[0].length);if(!n)return null;let r=new Hf(e,t[2],t.index+t[1].length,t.index+t[0].length+n);return this.__schemas__[r.schema].normalize(r,this),r}tlds(e,t=!1){return e=Array.isArray(e)?e:[e],t?this.__opts__.tlds=this.__opts__.tlds.concat(e):this.__opts__.tlds=e,this.re.set({...this.__opts__,schema_names:Object.keys(this.__schemas__)}),this}normalize(e){e.schema||(e.url=`http://${e.url}`),e.schema==="mailto:"&&!/^mailto:/i.test(e.url)&&(e.url=`mailto:${e.url}`)}};var Wf=["aaa","aarp","abb","abbott","abbvie","abc","able","abogado","abudhabi","ac","academy","accenture","accountant","accountants","aco","actor","ad","ads","adult","ae","aeg","aero","aetna","af","afl","africa","ag","agakhan","agency","ai","aig","airbus","airforce","airtel","akdn","al","alibaba","alipay","allfinanz","allstate","ally","alsace","alstom","am","amazon","americanexpress","americanfamily","amex","amfam","amica","amsterdam","analytics","android","anquan","anz","ao","aol","apartments","app","apple","aq","aquarelle","ar","arab","aramco","archi","army","arpa","art","arte","as","asda","asia","associates","at","athleta","attorney","au","auction","audi","audible","audio","auspost","author","auto","autos","aw","aws","ax","axa","az","azure","ba","baby","baidu","banamex","band","bank","bar","barcelona","barclaycard","barclays","barefoot","bargains","baseball","basketball","bauhaus","bayern","bb","bbc","bbt","bbva","bcg","bcn","bd","be","beats","beauty","beer","berlin","best","bestbuy","bet","bf","bg","bh","bharti","bi","bible","bid","bike","bing","bingo","bio","biz","bj","black","blackfriday","blockbuster","blog","bloomberg","blue","bm","bms","bmw","bn","bnpparibas","bo","boats","boehringer","bofa","bom","bond","boo","book","booking","bosch","bostik","boston","bot","boutique","box","br","bradesco","bridgestone","broadway","broker","brother","brussels","bs","bt","build","builders","business","buy","buzz","bv","bw","by","bz","bzh","ca","cab","cafe","cal","call","calvinklein","cam","camera","camp","canon","capetown","capital","capitalone","car","caravan","cards","care","career","careers","cars","casa","case","cash","casino","cat","catering","catholic","cba","cbn","cbre","cc","cd","center","ceo","cern","cf","cfa","cfd","cg","ch","chanel","channel","charity","chase","chat","cheap","chintai","christmas","chrome","church","ci","cipriani","circle","cisco","citadel","citi","citic","city","ck","cl","claims","cleaning","click","clinic","clinique","clothing","cloud","club","clubmed","cm","cn","co","coach","codes","coffee","college","cologne","com","commbank","community","company","compare","computer","comsec","condos","construction","consulting","contact","contractors","cooking","cool","coop","corsica","country","coupon","coupons","courses","cpa","cr","credit","creditcard","creditunion","cricket","crown","crs","cruise","cruises","cu","cuisinella","cv","cw","cx","cy","cymru","cyou","cz","dad","dance","data","date","dating","datsun","day","dclk","dds","de","deal","dealer","deals","degree","delivery","dell","deloitte","delta","democrat","dental","dentist","desi","design","dev","dhl","diamonds","diet","digital","direct","directory","discount","discover","dish","diy","dj","dk","dm","dnp","do","docs","doctor","dog","domains","dot","download","drive","dtv","dubai","dupont","durban","dvag","dvr","dz","earth","eat","ec","eco","edeka","edu","education","ee","eg","email","emerck","energy","engineer","engineering","enterprises","epson","equipment","er","ericsson","erni","es","esq","estate","et","eu","eurovision","eus","events","exchange","expert","exposed","express","extraspace","fage","fail","fairwinds","faith","family","fan","fans","farm","farmers","fashion","fast","fedex","feedback","ferrari","ferrero","fi","fidelity","fido","film","final","finance","financial","fire","firestone","firmdale","fish","fishing","fit","fitness","fj","fk","flickr","flights","flir","florist","flowers","fly","fm","fo","foo","food","football","ford","forex","forsale","forum","foundation","fox","fr","free","fresenius","frl","frogans","frontier","ftr","fujitsu","fun","fund","furniture","futbol","fyi","ga","gal","gallery","gallo","gallup","game","games","gap","garden","gay","gb","gbiz","gd","gdn","ge","gea","gent","genting","george","gf","gg","ggee","gh","gi","gift","gifts","gives","giving","gl","glass","gle","global","globo","gm","gmail","gmbh","gmo","gmx","gn","godaddy","gold","goldpoint","golf","goo","goodyear","goog","google","gop","got","gov","gp","gq","gr","grainger","graphics","gratis","green","gripe","grocery","group","gs","gt","gu","gucci","guge","guide","guitars","guru","gw","gy","hair","hamburg","hangout","haus","hbo","hdfc","hdfcbank","health","healthcare","help","helsinki","here","hermes","hiphop","hisamitsu","hitachi","hiv","hk","hkt","hm","hn","hockey","holdings","holiday","homedepot","homegoods","homes","homesense","honda","horse","hospital","host","hosting","hot","hotels","hotmail","house","how","hr","hsbc","ht","hu","hughes","hyatt","hyundai","ibm","icbc","ice","icu","id","ie","ieee","ifm","ikano","il","im","imamat","imdb","immo","immobilien","in","inc","industries","infiniti","info","ing","ink","institute","insurance","insure","int","international","intuit","investments","io","ipiranga","iq","ir","irish","is","ismaili","ist","istanbul","it","itau","itv","jaguar","java","jcb","je","jeep","jetzt","jewelry","jio","jll","jm","jmp","jnj","jo","jobs","joburg","jot","joy","jp","jpmorgan","jprs","juegos","juniper","kaufen","kddi","ke","kerryhotels","kerryproperties","kfh","kg","kh","ki","kia","kids","kim","kindle","kitchen","kiwi","km","kn","koeln","komatsu","kosher","kp","kpmg","kpn","kr","krd","kred","kuokgroup","kw","ky","kyoto","kz","la","lacaixa","lamborghini","lamer","land","landrover","lanxess","lasalle","lat","latino","latrobe","law","lawyer","lb","lc","lds","lease","leclerc","lefrak","legal","lego","lexus","lgbt","li","lidl","life","lifeinsurance","lifestyle","lighting","like","lilly","limited","limo","lincoln","link","live","living","lk","llc","llp","loan","loans","locker","locus","lol","london","lotte","lotto","love","lpl","lplfinancial","lr","ls","lt","ltd","ltda","lu","lundbeck","luxe","luxury","lv","ly","ma","madrid","maif","maison","makeup","man","management","mango","map","market","marketing","markets","marriott","marshalls","mattel","mba","mc","mckinsey","md","me","med","media","meet","melbourne","meme","memorial","men","menu","merckmsd","mg","mh","miami","microsoft","mil","mini","mint","mit","mitsubishi","mk","ml","mlb","mls","mm","mma","mn","mo","mobi","mobile","moda","moe","moi","mom","monash","money","monster","mormon","mortgage","moscow","moto","motorcycles","mov","movie","mp","mq","mr","ms","msd","mt","mtn","mtr","mu","museum","music","mv","mw","mx","my","mz","na","nab","nagoya","name","navy","nba","nc","ne","nec","net","netbank","netflix","network","neustar","new","news","next","nextdirect","nexus","nf","nfl","ng","ngo","nhk","ni","nico","nike","nikon","ninja","nissan","nissay","nl","no","nokia","norton","now","nowruz","nowtv","np","nr","nra","nrw","ntt","nu","nyc","nz","obi","observer","office","okinawa","olayan","olayangroup","ollo","om","omega","one","ong","onl","online","ooo","open","oracle","orange","org","organic","origins","osaka","otsuka","ott","ovh","pa","page","panasonic","paris","pars","partners","parts","party","pay","pccw","pe","pet","pf","pfizer","pg","ph","pharmacy","phd","philips","phone","photo","photography","photos","physio","pics","pictet","pictures","pid","pin","ping","pink","pioneer","pizza","pk","pl","place","play","playstation","plumbing","plus","pm","pn","pnc","pohl","poker","politie","porn","post","pr","praxi","press","prime","pro","prod","productions","prof","progressive","promo","properties","property","protection","pru","prudential","ps","pt","pub","pw","pwc","py","qa","qpon","quebec","quest","racing","radio","re","read","realestate","realtor","realty","recipes","red","redumbrella","rehab","reise","reisen","reit","reliance","ren","rent","rentals","repair","report","republican","rest","restaurant","review","reviews","rexroth","rich","richardli","ricoh","ril","rio","rip","ro","rocks","rodeo","rogers","room","rs","rsvp","ru","rugby","ruhr","run","rw","rwe","ryukyu","sa","saarland","safe","safety","sakura","sale","salon","samsclub","samsung","sandvik","sandvikcoromant","sanofi","sap","sarl","sas","save","saxo","sb","sbi","sbs","sc","scb","schaeffler","schmidt","scholarships","school","schule","schwarz","science","scot","sd","se","search","seat","secure","security","seek","select","sener","services","seven","sew","sex","sexy","sfr","sg","sh","shangrila","sharp","shell","shia","shiksha","shoes","shop","shopping","shouji","show","si","silk","sina","singles","site","sj","sk","ski","skin","sky","skype","sl","sling","sm","smart","smile","sn","sncf","so","soccer","social","softbank","software","sohu","solar","solutions","song","sony","soy","spa","space","sport","spot","sr","srl","ss","st","stada","staples","star","statebank","statefarm","stc","stcgroup","stockholm","storage","store","stream","studio","study","style","su","sucks","supplies","supply","support","surf","surgery","suzuki","sv","swatch","swiss","sx","sy","sydney","systems","sz","tab","taipei","talk","taobao","target","tatamotors","tatar","tattoo","tax","taxi","tc","tci","td","tdk","team","tech","technology","tel","temasek","tennis","teva","tf","tg","th","thd","theater","theatre","tiaa","tickets","tienda","tips","tires","tirol","tj","tjmaxx","tjx","tk","tkmaxx","tl","tm","tmall","tn","to","today","tokyo","tools","top","toray","toshiba","total","tours","town","toyota","toys","tr","trade","trading","training","travel","travelers","travelersinsurance","trust","trv","tt","tube","tui","tunes","tushu","tv","tvs","tw","tz","ua","ubank","ubs","ug","uk","unicom","university","uno","uol","ups","us","uy","uz","va","vacations","vana","vanguard","vc","ve","vegas","ventures","verisign","verm\xF6gensberater","verm\xF6gensberatung","versicherung","vet","vg","vi","viajes","video","vig","viking","villas","vin","vip","virgin","visa","vision","viva","vivo","vlaanderen","vn","vodka","volvo","vote","voting","voto","voyage","vu","wales","walmart","walter","wang","wanggou","watch","watches","weather","weatherchannel","webcam","weber","website","wed","wedding","weibo","weir","wf","whoswho","wien","wiki","williamhill","win","windows","wine","winners","wme","wolterskluwer","woodside","work","works","world","wow","ws","wtc","wtf","xbox","xerox","xihuan","xin","xxx","xyz","yachts","yahoo","yamaxun","yandex","ye","yodobashi","yoga","yokohama","you","youtube","yt","yun","za","zappos","zara","zero","zip","zm","zone","zuerich","zw","\u03B5\u03BB","\u03B5\u03C5","\u0431\u0433","\u0431\u0435\u043B","\u0434\u0435\u0442\u0438","\u0435\u044E","\u043A\u0430\u0442\u043E\u043B\u0438\u043A","\u043A\u043E\u043C","\u043C\u043A\u0434","\u043C\u043E\u043D","\u043C\u043E\u0441\u043A\u0432\u0430","\u043E\u043D\u043B\u0430\u0439\u043D","\u043E\u0440\u0433","\u0440\u0443\u0441","\u0440\u0444","\u0441\u0430\u0439\u0442","\u0441\u0440\u0431","\u0443\u043A\u0440","\u049B\u0430\u0437","\u0570\u0561\u0575","\u05D9\u05E9\u05E8\u05D0\u05DC","\u05E7\u05D5\u05DD","\u0627\u0628\u0648\u0638\u0628\u064A","\u0627\u0631\u0627\u0645\u0643\u0648","\u0627\u0644\u0627\u0631\u062F\u0646","\u0627\u0644\u0628\u062D\u0631\u064A\u0646","\u0627\u0644\u062C\u0632\u0627\u0626\u0631","\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629","\u0627\u0644\u0639\u0644\u064A\u0627\u0646","\u0627\u0644\u0645\u063A\u0631\u0628","\u0627\u0645\u0627\u0631\u0627\u062A","\u0627\u06CC\u0631\u0627\u0646","\u0628\u0627\u0631\u062A","\u0628\u0627\u0632\u0627\u0631","\u0628\u064A\u062A\u0643","\u0628\u06BE\u0627\u0631\u062A","\u062A\u0648\u0646\u0633","\u0633\u0648\u062F\u0627\u0646","\u0633\u0648\u0631\u064A\u0629","\u0634\u0628\u0643\u0629","\u0639\u0631\u0627\u0642","\u0639\u0631\u0628","\u0639\u0645\u0627\u0646","\u0641\u0644\u0633\u0637\u064A\u0646","\u0642\u0637\u0631","\u0643\u0627\u062B\u0648\u0644\u064A\u0643","\u0643\u0648\u0645","\u0645\u0635\u0631","\u0645\u0644\u064A\u0633\u064A\u0627","\u0645\u0648\u0631\u064A\u062A\u0627\u0646\u064A\u0627","\u0645\u0648\u0642\u0639","\u0647\u0645\u0631\u0627\u0647","\u067E\u0627\u06A9\u0633\u062A\u0627\u0646","\u0680\u0627\u0631\u062A","\u0915\u0949\u092E","\u0928\u0947\u091F","\u092D\u093E\u0930\u0924","\u092D\u093E\u0930\u0924\u092E\u094D","\u092D\u093E\u0930\u094B\u0924","\u0938\u0902\u0917\u0920\u0928","\u09AC\u09BE\u0982\u09B2\u09BE","\u09AD\u09BE\u09B0\u09A4","\u09AD\u09BE\u09F0\u09A4","\u0A2D\u0A3E\u0A30\u0A24","\u0AAD\u0ABE\u0AB0\u0AA4","\u0B2D\u0B3E\u0B30\u0B24","\u0B87\u0BA8\u0BCD\u0BA4\u0BBF\u0BAF\u0BBE","\u0B87\u0BB2\u0B99\u0BCD\u0B95\u0BC8","\u0B9A\u0BBF\u0B99\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0BC2\u0BB0\u0BCD","\u0C2D\u0C3E\u0C30\u0C24\u0C4D","\u0CAD\u0CBE\u0CB0\u0CA4","\u0D2D\u0D3E\u0D30\u0D24\u0D02","\u0DBD\u0D82\u0D9A\u0DCF","\u0E04\u0E2D\u0E21","\u0E44\u0E17\u0E22","\u0EA5\u0EB2\u0EA7","\u10D2\u10D4","\u307F\u3093\u306A","\u30A2\u30DE\u30BE\u30F3","\u30AF\u30E9\u30A6\u30C9","\u30B0\u30FC\u30B0\u30EB","\u30B3\u30E0","\u30B9\u30C8\u30A2","\u30BB\u30FC\u30EB","\u30D5\u30A1\u30C3\u30B7\u30E7\u30F3","\u30DD\u30A4\u30F3\u30C8","\u4E16\u754C","\u4E2D\u4FE1","\u4E2D\u56FD","\u4E2D\u570B","\u4E2D\u6587\u7F51","\u4E9A\u9A6C\u900A","\u4F01\u4E1A","\u4F5B\u5C71","\u4FE1\u606F","\u5065\u5EB7","\u516B\u5366","\u516C\u53F8","\u516C\u76CA","\u53F0\u6E7E","\u53F0\u7063","\u5546\u57CE","\u5546\u5E97","\u5546\u6807","\u5609\u91CC","\u5609\u91CC\u5927\u9152\u5E97","\u5728\u7EBF","\u5927\u62FF","\u5929\u4E3B\u6559","\u5A31\u4E50","\u5BB6\u96FB","\u5E7F\u4E1C","\u5FAE\u535A","\u6148\u5584","\u6211\u7231\u4F60","\u624B\u673A","\u62DB\u8058","\u653F\u52A1","\u653F\u5E9C","\u65B0\u52A0\u5761","\u65B0\u95FB","\u65F6\u5C1A","\u66F8\u7C4D","\u673A\u6784","\u6DE1\u9A6C\u9521","\u6E38\u620F","\u6FB3\u9580","\u70B9\u770B","\u79FB\u52A8","\u7EC4\u7EC7\u673A\u6784","\u7F51\u5740","\u7F51\u5E97","\u7F51\u7AD9","\u7F51\u7EDC","\u8054\u901A","\u8C37\u6B4C","\u8D2D\u7269","\u901A\u8CA9","\u96C6\u56E2","\u96FB\u8A0A\u76C8\u79D1","\u98DE\u5229\u6D66","\u98DF\u54C1","\u9910\u5385","\u9999\u683C\u91CC\u62C9","\u9999\u6E2F","\uB2F7\uB137","\uB2F7\uCEF4","\uC0BC\uC131","\uD55C\uAD6D"];function Qf(e){if(typeof e!="string"||e.length>65536)return[];let t=[];for(let n of e.split(/,(?=\d+-\d+\|)/)){let r=/^(\d+)-(\d+)\|([^|]+)\|(.+)$/.exec(n);if(!r)continue;let o=Number(r[1]),l=Number(r[2]),i=r[4];if(!(!Number.isSafeInteger(o)||!Number.isSafeInteger(l)||l<o||/[\s\u0000-\u001f\u007f]/u.test(i))){try{let s=new URL(i);if(s.protocol!=="https:"||s.username||s.password||s.port||!/^(?:media\d*|i)\.giphy\.com$/i.test(s.hostname))continue}catch{continue}t.push({start:o,end:l,id:r[3],url:i})}}return t}function Kf(e,t){if(typeof e!="string")return null;if(/^public\/chat-gifs\/[a-f0-9]{64}$/.test(e))return oo(e);if(/^asset:[a-f0-9]{64}$/.test(e)){let n=t?.[e.slice(6)];if(typeof n=="string"&&n.length<=35*1024*1024&&/^data:image\/(?:gif|webp|png|jpeg);base64,[A-Za-z0-9+/]/.test(n))return n}return null}function Vl(e,t,n,r,o){if(r?.length)return Fg(e,t,r);let l=[...Qf(o).map(a=>({...a,type:"gif"})),...Tg(n).map(a=>({...a,type:"emote"}))].sort((a,h)=>a.start-h.start);if(l.length===0)return lo(e,t);let i=Array.from(e),s=[],u=0;for(let a of l){if(a.start<u||a.end>=i.length)continue;s.push(...lo(i.slice(u,a.start).join(""),t));let h=i.slice(a.start,a.end+1).join("");a.type==="gif"?s.push({type:"gif",name:h,id:a.id,url:a.url}):s.push({type:"emote",name:h,url:`https://static-cdn.jtvnw.net/emoticons/v2/${a.id}/default/dark/2.0`}),u=a.end+1}return s.push(...lo(i.slice(u).join(""),t)),s}function Sg(e){return e.localUrl?e.localUrl.startsWith("data:")?{url:e.localUrl}:{url:oo(e.localUrl),fallbackUrl:e.url}:{url:e.url}}function Fg(e,t,n){let r=[],o=0;for(let s of[...n].sort((u,a)=>u.start-a.start)){if(!s.name)continue;let u=s.start;if(e.slice(u,u+s.name.length)!==s.name){let a=e.indexOf(s.name,o);if(a<0)continue;u=a}u<o||(r.push({id:s.id,name:s.name,start:u,url:s.url}),o=u+s.name.length)}let l=[],i=0;for(let s of r)l.push(...lo(e.slice(i,s.start),t)),l.push({type:"emote",name:s.name,url:s.url||`https://files.kick.com/emotes/${encodeURIComponent(s.id)}/fullsize`}),i=s.start+s.name.length;return l.push(...lo(e.slice(i),t)),l}var Pg=/^@([\p{L}\p{N}_.-]{1,32})([\s\S]*)$/u,Ng=new Vf({fuzzyLink:!0,fuzzyEmail:!1}).tlds(Wf);function lo(e,t){if(!e)return[];let n=e.split(/(\s+)/),r=[],o=i=>{if(!i)return;let s=r[r.length-1];s?.type==="text"?s.value+=i:r.push({type:"text",value:i})},l=i=>{let s=0;for(let u of Ng.match(i)??[]){if(!["","//","http:","https:"].includes(u.schema))continue;let a=u.schema===""?`https://${u.raw}`:u.schema==="//"?`https:${u.url}`:u.url,h;try{h=new URL(a)}catch{continue}!["http:","https:"].includes(h.protocol)||!h.hostname||h.username||h.password||(o(i.slice(s,u.index)),r.push({type:"link",value:u.raw,href:h.href}),s=u.lastIndex)}o(i.slice(s))};for(let i of n){if(i.startsWith("@")&&i.length>1){let u=Pg.exec(i);if(u){r.push({type:"mention",name:u[1]}),l(u[2]);continue}}let s=t.get(i);s?r.push({type:"emote",name:s.name,...Sg(s)}):l(i)}return r}function Tg(e){let t=[];for(let n of e?.split("/")??[]){let r=n.indexOf(":");if(r<=0)continue;let o=n.slice(0,r);for(let l of n.slice(r+1).split(",")){let[i,s]=l.split("-"),u=Number.parseInt(i,10),a=Number.parseInt(s,10);Number.isFinite(u)&&Number.isFinite(a)&&a>=u&&t.push({id:o,start:u,end:a})}}return t.sort((n,r)=>n.start-r.start)}var Yf="",Gf=`${Yf}ACTION `;function Wl(e){if(!e.startsWith(Gf))return{text:e,isAction:!1};let t=e.slice(Gf.length);return{text:t.endsWith(Yf)?t.slice(0,-1):t,isAction:!0}}function Ql(e){if(e.roles?.length)return e.roles;if(!e.badges)return[];let t={broadcaster:"broadcaster",moderator:"moderator",vip:"vip",subscriber:"subscriber",founder:"subscriber",staff:"staff",admin:"staff",global_mod:"staff",partner:"verified",turbo:"turbo"},n=new Set;for(let r of e.badges.split(",")){let o=t[r.split("/")[0]];o&&n.add(o)}return[...n]}function io(e,t){return e.isDeleted?e.deletedAtSec==null?!0:t>=e.deletedAtSec:!1}function er(e){let t=Math.max(0,Math.floor(e)),n=Math.floor(t/3600),r=Math.floor(t%3600/60),o=t%60,l=i=>String(i).padStart(2,"0");return n>0?`${n}:${l(r)}:${l(o)}`:`${r}:${l(o)}`}var so=B(Ke()),Kl=(0,so.createContext)({locale:"ru",spoilerFree:!0});function Zf(){return(0,so.useContext)(Kl)}function Xf(){return(0,so.useContext)(Kl)}var Jf="#387aff",qf="#ff3f97",Gl=["#387aff","#ff3f97","#22c55e","#f59e0b","#a78bfa","#14b8a6","#ef4444","#eab308","#3b82f6","#ec4899"];function ep(e,t){let n=np(e.badgeVersion);return n==="pink"?qf:n==="blue"&&t===0?Jf:Gl[t%Gl.length]}function tp(e){let t=np(e);if(t==="pink")return qf;if(t==="blue"){let n=Rg(e);return n<=1?Jf:Gl[(n-1)%Gl.length]}return"#9ca3af"}function np(e){if(!e)return null;let t=e.indexOf("-");return(t===-1?e:e.slice(0,t)).toLowerCase()}function Rg(e){let t=e.indexOf("-");if(t===-1)return 1;let n=Number.parseInt(e.slice(t+1),10);return Number.isFinite(n)?n:1}var P=B(le());function ip({prefs:e,update:t,toggleRole:n,reset:r,copy:o,locale:l,offset:i,setOffset:s,search:u,setSearch:a,liveEmotesUrl:h,liveEmotesNote:m}){return(0,P.jsxs)("div",{className:"chat-settings thin-scroll",children:[(0,P.jsxs)("div",{className:"chat-offset-row",children:[(0,P.jsx)("span",{className:"chat-offset-label",children:o.offset}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f-5),title:"-5s",children:"\u22125"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f-1),title:"-1s",children:"\u22121"}),(0,P.jsx)("input",{type:"number",className:"offset-input",value:i,onChange:f=>{let g=Number(f.target.value);s(Number.isFinite(g)?g:0)},"aria-label":o.offsetAria}),(0,P.jsx)("span",{style:{color:"var(--text-faint)"},children:"s"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f+1),title:"+1s",children:"+1"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(f=>f+5),title:"+5s",children:"+5"}),(0,P.jsx)("button",{type:"button",onClick:()=>s(0),title:"reset",children:"\u21BA"})]}),(0,P.jsx)("div",{className:"chat-settings__section",children:o.sectionView}),(0,P.jsxs)("label",{className:"chat-slider",children:[(0,P.jsxs)("span",{children:[o.fontSize,(0,P.jsxs)("b",{children:[e.fontPx,"px"]})]}),(0,P.jsx)("input",{type:"range",min:xt.fontPx.min,max:xt.fontPx.max,value:e.fontPx,onChange:f=>t("fontPx",Number(f.target.value))})]}),(0,P.jsxs)("label",{className:"chat-slider",children:[(0,P.jsxs)("span",{children:[o.emoteSize,(0,P.jsxs)("b",{children:[e.emotePx,"px"]})]}),(0,P.jsx)("input",{type:"range",min:xt.emotePx.min,max:xt.emotePx.max,value:e.emotePx,onChange:f=>t("emotePx",Number(f.target.value))})]}),(0,P.jsxs)("div",{className:"chat-chip-row",children:[(0,P.jsx)(tr,{active:e.compact,label:o.compact,onClick:()=>t("compact",!e.compact)}),(0,P.jsx)(tr,{active:e.showTimestamps,label:o.showTimestamps,onClick:()=>t("showTimestamps",!e.showTimestamps)}),(0,P.jsx)(tr,{active:e.stripes,label:o.stripes,onClick:()=>t("stripes",!e.stripes)}),(0,P.jsx)(tr,{active:e.readableColors,label:o.readableColors,title:o.readableColorsHint,onClick:()=>t("readableColors",!e.readableColors)})]}),(0,P.jsx)("div",{className:"chat-settings__section",children:o.sectionHighlight}),(0,P.jsxs)("div",{className:"chat-chip-row",children:[Lf.map(f=>(0,P.jsx)(tr,{active:e.highlightRoles.includes(f),label:vn[f][l],className:`chat-chip--${f}`,onClick:()=>n(f)},f)),(0,P.jsx)(tr,{active:e.highlightFirstMessage,label:o.highlightFirst,className:"chat-chip--first",onClick:()=>t("highlightFirstMessage",!e.highlightFirstMessage)})]}),(0,P.jsxs)("label",{className:"chat-field",title:o.keywordsHint,children:[(0,P.jsx)("span",{children:o.keywords}),(0,P.jsx)("input",{type:"text",value:e.keywords,placeholder:o.keywordsPlaceholder,onChange:f=>t("keywords",f.target.value)})]}),(0,P.jsx)("div",{className:"chat-settings__section",children:o.sectionFilter}),(0,P.jsxs)("label",{className:"chat-field",children:[(0,P.jsx)("span",{children:o.search}),(0,P.jsx)("input",{type:"search",value:u,placeholder:o.searchPlaceholder,onChange:f=>a(f.target.value)})]}),(0,P.jsxs)("label",{className:"chat-toggle",children:[(0,P.jsx)("input",{type:"checkbox",checked:e.showDeleted,onChange:f=>t("showDeleted",f.target.checked)}),(0,P.jsx)("span",{children:o.showDeleted})]}),(0,P.jsxs)("label",{className:"chat-toggle",children:[(0,P.jsx)("input",{type:"checkbox",checked:e.hideCommands,onChange:f=>t("hideCommands",f.target.checked)}),(0,P.jsx)("span",{children:o.hideCommands})]}),(0,P.jsxs)("label",{className:"chat-toggle",title:o.eventsHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.showEvents,onChange:f=>t("showEvents",f.target.checked)}),(0,P.jsx)("span",{children:o.eventsShow})]}),(0,P.jsxs)("label",{className:"chat-toggle",title:o.eventsCollapseHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.collapseEvents,onChange:f=>t("collapseEvents",f.target.checked)}),(0,P.jsx)("span",{children:o.eventsCollapse})]}),(0,P.jsxs)("label",{className:"chat-toggle",title:o.eventsHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.showBets,onChange:f=>t("showBets",f.target.checked)}),(0,P.jsx)("span",{children:o.eventBetOn})]}),(0,P.jsxs)("label",{className:"chat-field",children:[(0,P.jsx)("span",{children:o.hiddenUsers}),(0,P.jsx)("input",{type:"text",value:e.hiddenUsers,placeholder:o.hiddenUsersPlaceholder,onChange:f=>t("hiddenUsers",f.target.value)})]}),h?(0,P.jsxs)("label",{className:"chat-toggle",title:o.liveEmotesHint,children:[(0,P.jsx)("input",{type:"checkbox",checked:e.useLiveEmotes,onChange:f=>t("useLiveEmotes",f.target.checked)}),(0,P.jsxs)("span",{children:[o.liveEmotes,m?` \u2014 ${m}`:""]})]}):null,(0,P.jsx)("button",{type:"button",className:"chat-reset",onClick:r,children:o.reset})]})}function tr({active:e,label:t,onClick:n,title:r,className:o=""}){return(0,P.jsx)("button",{type:"button",className:`chat-chip${e?" is-active":""} ${o}`.trim(),onClick:n,title:r,"aria-pressed":e,children:t})}var Xt=B(Ke());function Og(e=()=>new window.Image){let t=new Map,n=new Map,r=new Map,o=new Set,l=0;function i(a,h){n.delete(a),n.set(a,{url:h,until:Date.now()+6e4}),n.size>128&&n.delete(n.keys().next().value)}function s(a){let h=n.get(a);return h&&h.until>Date.now()?h.url:(n.delete(a),a)}function u(){for(;l<4&&r.size;){let[a,h]=r.entries().next().value;if(r.delete(a),t.has(a)||o.has(a))continue;o.add(a),l++;let m=e();m.decoding="async",m.loading="eager",m.fetchPriority="low";let f=!1,g=v=>{f||(f=!0,window.clearTimeout(w),m.onload=m.onerror=null,v?(t.set(a,m),t.size>64&&t.delete(t.keys().next().value)):m.removeAttribute("src"),o.delete(a),l--,u())},w=window.setTimeout(()=>g(!1),15e3);m.onload=()=>{typeof m.decode=="function"?m.decode().then(()=>g(!0),()=>g(!0)):g(!0)},m.onerror=()=>{h.fallbackUrl&&m.src!==h.fallbackUrl?(i(h.url,h.fallbackUrl),m.src=h.fallbackUrl):g(!1)},m.src=s(h.url)}}return{source:s,rememberFallback:i,warm(a){for(let h of a){let m=t.get(h.url);if(m){t.delete(h.url),t.set(h.url,m);continue}o.has(h.url)||(r.set(h.url,h),r.size>48&&r.delete(r.keys().next().value))}u()}}}var uo=Og();function sp(e,t,n,r){let o=n+Math.min(60,Math.max(15,r*15)),l=0,i=e.length;for(;l<i;){let u=l+i>>>1;e[u].relativeTimeSec<=n?l=u+1:i=u}let s=new Map;for(let u=l;u<Math.min(e.length,l+300)&&e[u].relativeTimeSec<=o;u++){let a=e[u];for(let h of Vl(a.textRaw,t,a.emotes,a.inlineEmotes,a.gifs))if(h.type==="emote"&&s.set(h.url,{url:h.url,fallbackUrl:h.fallbackUrl}),s.size>=32)return[...s.values()]}return[...s.values()]}var Pe=B(le()),Zl=(0,Xt.memo)(function({text:t,emoteMap:n,twitchEmotes:r,inlineEmotes:o,twitchGifs:l,gifUrls:i,gifAssets:s,emotePx:u,selfNames:a,onMentionClick:h,mentionTitle:m}){let f=(0,Xt.useMemo)(()=>Vl(t,n,r,o,l),[t,n,r,o,l]);return(0,Pe.jsx)(Pe.Fragment,{children:f.map((g,w)=>g.type==="mention"?(0,Pe.jsxs)("span",{className:`chat-mention${a?.has(g.name.toLowerCase())?" is-self":""}`,role:h?"button":void 0,tabIndex:h?0:void 0,title:h?m:void 0,onClick:h?v=>{v.stopPropagation(),h(g.name)}:void 0,onKeyDown:h?v=>{v.key!=="Enter"&&v.key!==" "||(v.preventDefault(),v.stopPropagation(),h(g.name))}:void 0,children:["@",g.name]},`mention-${w}`):g.type==="link"?(0,Pe.jsx)("a",{className:"chat-link",href:g.href,target:"_blank",rel:"noopener noreferrer",onClick:v=>v.stopPropagation(),onAuxClick:v=>v.stopPropagation(),onKeyDown:v=>v.stopPropagation(),children:g.value},`link-${w}`):g.type==="gif"?(0,Pe.jsx)(bg,{url:g.url,label:g.name,reference:i?.[g.url],assets:s},`gif-${g.id}-${g.url}-${i?.[g.url]}-${w}`):g.type==="emote"?(0,Pe.jsx)(Bg,{url:g.url,fallbackUrl:g.fallbackUrl,name:g.name,height:u},`${g.url}-${w}`):(0,Pe.jsx)("span",{children:g.value},`text-${w}`))})});function Bg({url:e,fallbackUrl:t,name:n,height:r}){let[o,l]=(0,Xt.useState)(!1),i=o&&t?t:uo.source(e);return(0,Pe.jsx)("img",{src:i,alt:n,title:n,className:"chat-emote",style:{height:`${r}px`},loading:"eager",decoding:"async",onError:t&&i!==t?()=>{uo.rememberFallback(e,t),l(!0)}:void 0})}function bg({url:e,label:t,reference:n,assets:r}){let o=(0,Xt.useMemo)(()=>Kf(n,r),[n,r]),[l,i]=(0,Xt.useState)(0);if(l>=(o?2:1))return(0,Pe.jsx)("span",{children:t});let s=o&&l===0?o:e;return(0,Pe.jsx)("a",{className:"chat-gif",href:s,target:"_blank",rel:"noopener noreferrer",onClick:u=>u.stopPropagation(),onAuxClick:u=>u.stopPropagation(),onKeyDown:u=>u.stopPropagation(),children:(0,Pe.jsx)("img",{src:s,alt:t,title:t,loading:"lazy",decoding:"async",referrerPolicy:"no-referrer",onError:()=>i(u=>u+1)})})}var H=B(Ke()),ap=B(Nu());var I=B(le()),nr=330,up="tsr-chat-user-card-pos";function Xl(e,t,n,r){let o=Math.max(4,window.innerWidth-n-4),l=Math.max(4,window.innerHeight-r-4);return{x:Math.min(Math.max(4,e),o),y:Math.min(Math.max(4,t),l)}}function cp({login:e,historyUrl:t,messages:n,thresholdSec:r,emoteMap:o,gifAssets:l,emotePx:i,readableColors:s,copy:u,locale:a,onClose:h,onMentionClick:m,onSeek:f,canSeek:g,toRenderTime:w,anchorEl:v}){let[E,d]=(0,H.useState)(null),[c,p]=(0,H.useState)(null),[y,D]=(0,H.useState)(""),[_,S]=(0,H.useState)(null),[N,b]=(0,H.useState)(!1),[A,G]=(0,H.useState)(0),[wn,rr]=(0,H.useState)(100);(0,H.useEffect)(()=>{if(!t)return;let k=!1;return S(null),b(!1),at(t).then($=>{k||S($)}).catch(()=>{k||b(!0)}),()=>{k=!0}},[t,A]),(0,H.useEffect)(()=>{rr(100)},[y]);let ie=(0,H.useRef)(null),Cn=(0,H.useRef)(null);(0,H.useEffect)(()=>{let k=()=>{let $=v?.getRootNode();d($?.nodeType===11&&"host"in $?$:document.fullscreenElement??document.body)};return k(),document.addEventListener("fullscreenchange",k),()=>document.removeEventListener("fullscreenchange",k)},[v]),(0,H.useEffect)(()=>{if(!E||c)return;let k=null;try{let ri=window.localStorage.getItem(up);ri&&(k=JSON.parse(ri))}catch{}let $=Math.min(420,window.innerHeight*.6);if(k&&Number.isFinite(k.x)&&Number.isFinite(k.y)){p(Xl(k.x,k.y,nr,$));return}let V=v?.getBoundingClientRect(),Oe=V?V.left+V.width/2-nr/2:window.innerWidth-nr-24,nt=V?V.bottom-$-8:80;p(Xl(Oe,nt,nr,$))},[E,c,v]),(0,H.useEffect)(()=>{if(!E)return;let k=()=>{let $=ie.current?.getBoundingClientRect();p(V=>V&&Xl(V.x,V.y,$?.width||nr,$?.height||420))};return k(),window.addEventListener("resize",k),()=>window.removeEventListener("resize",k)},[E]);let or=(0,H.useCallback)(k=>{if(k.target.closest("button, input"))return;let $=ie.current;if(!$)return;let V=$.getBoundingClientRect();Cn.current={x:k.clientX-V.left,y:k.clientY-V.top},k.currentTarget.setPointerCapture(k.pointerId)},[]),ni=(0,H.useCallback)(k=>{let $=Cn.current,V=ie.current;if(!$||!V)return;k.preventDefault();let Oe=V.getBoundingClientRect();p(Xl(k.clientX-$.x,k.clientY-$.y,Oe.width,Oe.height))},[]),lr=(0,H.useCallback)(k=>{if(Cn.current){Cn.current=null;try{k.currentTarget.releasePointerCapture(k.pointerId)}catch{}if(c)try{window.localStorage.setItem(up,JSON.stringify(c))}catch{}}},[c]);(0,H.useEffect)(()=>{let k=$=>{$.key==="Escape"&&h()};return window.addEventListener("keydown",k),()=>window.removeEventListener("keydown",k)},[h]);let qt=(0,H.useMemo)(()=>n.filter(k=>k.authorLogin.toLowerCase()===e.toLowerCase()).sort((k,$)=>k.relativeTimeSec-$.relativeTimeSec),[n,e]),Ne=(0,H.useMemo)(()=>qt.filter(k=>k.relativeTimeSec<=r),[qt,r]),Ft=y.trim().toLowerCase(),ir=(0,H.useMemo)(()=>{let k=[...Ne].reverse().concat(_?.messages??[]);return Ft?k.filter($=>$.textRaw.toLowerCase().includes(Ft)):k},[Ne,Ft,_]),Pt=Ne[Ne.length-1]??qt[0],fo=Pt?.authorDisplayName??e,po=s?Hl(Pt?.authorColor):Pt?.authorColor,ct=Pt?Ql(Pt):[],ho=Ne.filter(k=>io(k,r)).length;return!E||!c?null:(0,ap.createPortal)((0,I.jsxs)("div",{ref:ie,className:"chat-user-card",style:{left:c.x,top:c.y,width:nr},role:"dialog","aria-label":`${u.userCardTitle}: ${fo}`,children:[(0,I.jsxs)("div",{className:"chat-user-card__head",onPointerDown:or,onPointerMove:ni,onPointerUp:lr,onPointerCancel:lr,title:u.userCardDrag,children:[(0,I.jsx)("span",{className:"chat-user-card__grip","aria-hidden":"true",children:"\u283F"}),(0,I.jsx)("span",{className:"chat-user-card__name",style:{color:po||"#9ca3af"},children:fo}),(0,I.jsx)("button",{type:"button",className:"chat-user-card__close",onClick:h,title:u.userCardClose,"aria-label":u.userCardClose,children:"\u2715"})]}),(0,I.jsxs)("div",{className:"chat-user-card__meta",children:[ct.length>0?(0,I.jsx)("div",{className:"chat-user-card__roles",children:ct.map(k=>(0,I.jsx)("span",{className:`chat-badge chat-badge--${k}`,children:vn[k].badge},k))}):null,(0,I.jsxs)("div",{className:"chat-user-card__stats",children:[(0,I.jsx)("b",{children:Ne.length})," ",u.userCardCount,qt.length!==Ne.length?(0,I.jsxs)(I.Fragment,{children:[" \xB7 ",(0,I.jsx)("b",{children:qt.length})," ",u.userCardTotal]}):null,ho>0?(0,I.jsxs)(I.Fragment,{children:[" \xB7 ",(0,I.jsx)("b",{children:ho})," ",u.userCardDeleted]}):null]}),(0,I.jsx)("input",{type:"search",className:"chat-user-card__search",value:y,placeholder:u.userCardSearch,onChange:k=>D(k.target.value)}),(0,I.jsx)("div",{className:"chat-user-card__hint",children:u.userCardHint}),t?(0,I.jsx)("div",{className:"chat-user-card__hint",role:"status",children:N?(0,I.jsx)("button",{type:"button",onClick:()=>G(k=>k+1),children:u.userCardHistoryRetry}):_?(0,I.jsxs)(I.Fragment,{children:[u.userCardHistory,": ",_.sessions," \xB7 ",_.messages.length," ",u.messages,_.truncated?` \xB7 ${u.userCardHistoryLimit}`:""]}):u.userCardHistoryLoading}):null]}),(0,I.jsxs)("div",{className:"chat-user-card__list thin-scroll",children:[ir.length===0?(0,I.jsx)("div",{className:"chat-empty",children:Ft?u.userCardNoMatch:u.userCardEmpty}):ir.slice(0,wn).map(k=>{let $=Wl(k.textRaw),V=!!k.historySessionId,Oe=!V&&g(k.relativeTimeSec),nt=io(k,V?1/0:r);return(0,I.jsxs)("div",{className:`chat-user-card__row${nt?" is-deleted":""}`,title:V?u.userCardPastStream:void 0,children:[V?(0,I.jsx)("span",{className:"chat-time",children:k.messageTimestamp?new Date(k.messageTimestamp).toLocaleString(a==="ru"?"ru-RU":"en-US"):u.userCardPastStream}):(0,I.jsx)("button",{type:"button",className:"chat-user-card__seek chat-time",onClick:()=>f(k.relativeTimeSec),disabled:!Oe,title:Oe?u.userCardSeek:u.userCardOtherPart,children:er(w(k.relativeTimeSec))}),(0,I.jsx)("span",{className:"chat-text",children:(0,I.jsx)(Zl,{text:$.text,emoteMap:o,twitchEmotes:k.emotes,inlineEmotes:k.inlineEmotes,twitchGifs:k.gifs,gifUrls:k.gifUrls,gifAssets:l,emotePx:Math.min(i,24),onMentionClick:m,mentionTitle:u.userCardTitle})})]},k.id)}),ir.length>wn?(0,I.jsx)("button",{type:"button",className:"chat-user-card__more",onClick:()=>rr(k=>k+100),children:u.userCardMore}):null]})]}),E)}var ao=B(le()),jg={size:16,strokeWidth:1.75,className:""};function Ug({size:e,strokeWidth:t,className:n}){return{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:t,strokeLinecap:"round",strokeLinejoin:"round",className:n}}function Hg(e){return{...jg,...e}}function dp(e){let t=Hg(e);return(0,ao.jsxs)("svg",{...Ug(t),children:[(0,ao.jsx)("circle",{cx:"12",cy:"12",r:"3"}),(0,ao.jsx)("path",{d:"M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"})]})}var Jl=B(le());function Vg({width:e,height:t,radius:n,className:r,style:o}){return(0,Jl.jsx)("span",{className:`skeleton${r?` ${r}`:""}`,style:{width:e,height:t,borderRadius:n,...o},"aria-hidden":!0})}function Au({width:e="100%",height:t="12px"}){return(0,Jl.jsx)(Vg,{width:e,height:t,radius:"4px",className:"skeleton--text"})}function fp(e){let t=e;if(!t||t.version!==1||!Number.isFinite(t.captureAnchorMs)||!Array.isArray(t.points)||!t.points.length||t.points.length>1e4)return null;for(let n=0;n<t.points.length;n++){let r=t.points[n],o=t.points[n-1];if(!r||!Number.isFinite(r.mediaSec)||!Number.isFinite(r.wallClockMs)||o&&(r.mediaSec<=o.mediaSec||r.wallClockMs<=o.wallClockMs))return null}return t}function pp(e,t){if(!t?.points.length)return e;let n=hp(t.points,e,o=>o.mediaSec),r=t.points[n];return(r.wallClockMs-t.captureAnchorMs)/1e3+e-r.mediaSec}function ql(e,t){if(!t?.points.length)return e;let n=t.captureAnchorMs+e*1e3,r=hp(t.points,n,s=>s.wallClockMs),o=t.points[r],l=t.points[r+1],i=o.mediaSec+(n-o.wallClockMs)/1e3;return l?Math.min(i,l.mediaSec):i}function hp(e,t,n){let r=0,o=e.length;for(;r<o;){let l=r+o>>>1;n(e[l])<=t?r=l+1:o=l}return Math.max(0,r-1)}function mp(e,t,n,r){return Math.min(n,e+Math.max(0,t)*Math.max(0,r))}async function ei(e,t,n=r=>at(r,{cacheable:!0})){let r=null,o=null,l=new Set;do{if(t())return null;let i=`${e}${e.includes("?")?"&":"?"}page=1${o?`&cursor=${encodeURIComponent(o)}`:""}`,s=await n(i);if(t())return null;if(r?r.messages.push(...s.messages):r={messages:[...s.messages],emotes:s.emotes,mediaTimeline:s.mediaTimeline},o=s.nextCursor??null,o&&l.has(o))throw new Error("Chat page cursor did not advance");o&&l.add(o)}while(o);return r}var Et=B(Ke());var q=B(le()),Wg=90;function gp(e,t){return e.toLocaleString(t==="ru"?"ru-RU":"en-US")}function vp({eventsUrl:e,chatTimeSec:t,copy:n,locale:r,collapsed:o,onToggleCollapsed:l}){let[i,s]=(0,Et.useState)(null);(0,Et.useEffect)(()=>{if(!e)return;let a=!1;return s(null),(async()=>{try{let h=await at(e);a||s(h.events??[])}catch{a||s([])}})(),()=>{a=!0}},[e]);let u=(0,Et.useMemo)(()=>{if(!i?.length)return[];let a=!Number.isFinite(t);return i.filter(m=>a?!0:t<m.startedAtSec?!1:m.endedAtSec===null?!0:t<=m.endedAtSec+Wg).sort((m,f)=>f.startedAtSec-m.startedAtSec).slice(0,2)},[i,t]);return!e||u.length===0?null:(0,q.jsx)("div",{className:"stream-events",children:u.map(a=>(0,q.jsx)(Qg,{event:a,chatTimeSec:t,copy:n,locale:r,collapsed:o,onToggleCollapsed:l},a.id))})}function Qg({event:e,chatTimeSec:t,copy:n,locale:r,collapsed:o,onToggleCollapsed:l}){let i=(0,Et.useId)(),s=(0,Et.useMemo)(()=>{let d=null;for(let c of e.samples){if(c.atSec>t)break;d=c}return d},[e.samples,t]),u=e.endedAtSec!==null&&t>=e.endedAtSec?"ended":e.lockedAtSec!==null&&t>=e.lockedAtSec?"locked":"active",a=u==="ended",h=a&&e.status==="cancelled",m=e.kind==="poll",f=s?.points??e.outcomes.map(()=>0),g=s?.users??e.outcomes.map(()=>0),w=f.reduce((d,c)=>d+c,0),v=g.reduce((d,c)=>d+c,0),E=h?n.eventCancelled:a?m?n.eventPollDone:n.eventResolved:u==="locked"?n.eventLocked:m?n.eventPoll:n.eventOpen;return(0,q.jsxs)("div",{className:`stream-event stream-event--${u}${h?" is-cancelled":""}${o?" is-collapsed":""}`,children:[(0,q.jsxs)("button",{type:"button",className:"stream-event__head",onClick:l,"aria-expanded":!o,"aria-controls":i,"aria-label":`${o?n.eventExpand:n.eventCollapse}: ${e.title}`,title:o?n.eventExpand:n.eventCollapse,children:[(0,q.jsx)("span",{className:`stream-event__kind stream-event__kind--${e.kind}`,children:m?n.eventPoll:n.eventPrediction}),(0,q.jsx)("span",{className:"stream-event__title",title:e.title,children:e.title}),(0,q.jsx)("span",{className:"stream-event__chevron","aria-hidden":"true",children:o?"\u25BE":"\u25B4"}),(0,q.jsx)("span",{className:"stream-event__status",children:E})]}),(0,q.jsxs)("div",{id:i,hidden:o,children:[(0,q.jsx)("div",{className:"stream-event__outcomes",children:e.outcomes.map((d,c)=>{let p=f[c]??0,y=w>0?p/w:0,D=!m&&p>0?w/p:null,_=a&&!h&&e.winningOutcomeId===d.id,S=a&&!h&&e.winningOutcomeId!==null&&!_;return(0,q.jsxs)("div",{className:`stream-event__outcome${_?" is-won":""}${S?" is-lost":""}`,children:[(0,q.jsx)("span",{className:"stream-event__fill",style:{width:`${Math.round(y*100)}%`,background:ep(d,c)}}),(0,q.jsxs)("span",{className:"stream-event__label",children:[_?(0,q.jsx)("span",{className:"stream-event__crown",children:"\u{1F451}"}):null,d.title]}),(0,q.jsxs)("span",{className:"stream-event__numbers",children:[(0,q.jsxs)("span",{className:"stream-event__share",children:[Math.round(y*100),"%"]}),(0,q.jsxs)("span",{className:"stream-event__count",children:[gp(p,r)," ",m?n.eventVotes:n.eventPoints]}),D!==null?(0,q.jsxs)("span",{className:"stream-event__ratio",title:n.eventReturn,children:["\xD7",D.toFixed(2)]}):null]})]},d.id)})}),(0,q.jsxs)("div",{className:"stream-event__foot",children:[v>0?(0,q.jsxs)("span",{children:[gp(v,r)," ",n.eventUsers]}):null,e.startedAtSec<0?(0,q.jsx)("span",{className:"stream-event__early",title:n.eventAlreadyOpen,children:"\u23F3"}):null]})]})]})}var Dt=B(Ke());var $e=B(le()),yp=["#a78bfa","#22c55e","#f59e0b","#3b82f6","#ec4899","#14b8a6","#ef4444","#eab308"];function wp(e){if(!e)return"#4b5563";let t=0;for(let n=0;n<e.length;n+=1)t=t*31+e.charCodeAt(n)|0;return yp[Math.abs(t)%yp.length]}function Cp(e,t){return e.toLocaleString(t==="ru"?"ru-RU":"en-US")}function _p({timelineUrl:e,chatTimeSec:t,reveal:n,onToggleReveal:r,hideScale:o=!1,copy:l,locale:i}){let[s,u]=(0,Dt.useState)(null),[a,h]=(0,Dt.useState)(!1);(0,Dt.useEffect)(()=>{if(!e)return;let v=!1;return u(null),h(!1),(async()=>{try{let E=await at(e);v||u(E)}catch{v||h(!0)}})(),()=>{v=!0}},[e]);let m=(0,Dt.useMemo)(()=>{if(!s?.points.length)return 0;let v=s.points[s.points.length-1];return Math.max(v.relativeTimeSec,1)},[s]),f=(0,Dt.useMemo)(()=>{if(!s?.points.length)return null;let v=null;for(let E of s.points){if(E.relativeTimeSec>t)break;v=E}return v??s.points[0]},[s,t]),g=(0,Dt.useMemo)(()=>{if(!s?.points.length)return null;if(n)return s.peakViewers;let v=null;for(let E of s.points){if(E.relativeTimeSec>t)break;typeof E.viewerCount=="number"&&(v===null||E.viewerCount>v)&&(v=E.viewerCount)}return v},[s,t,n]);if(!e||a||!s||s.points.length===0)return null;let w=n?m:Math.min(t,m);return(0,$e.jsxs)("div",{className:"stream-meta",children:[(0,$e.jsxs)("div",{className:"stream-meta__row",children:[f?.viewerCount!=null?(0,$e.jsxs)("span",{className:"stream-meta__viewers",title:l.metaViewers,children:["\u25CF ",Cp(f.viewerCount,i)]}):null,g!=null?(0,$e.jsxs)("span",{className:"stream-meta__peak",children:[l.metaPeak," ",Cp(g,i)]}):null,o?null:(0,$e.jsx)("button",{type:"button",className:`stream-meta__reveal${n?" is-active":""}`,onClick:r,title:l.metaRevealHint,"aria-pressed":n,children:n?"\u{1F441}":"\u{1F648}"})]}),f?.categoryName||f?.title?(0,$e.jsxs)("div",{className:"stream-meta__now",children:[f.categoryName?(0,$e.jsx)("span",{className:"stream-meta__category",style:{borderColor:wp(f.categoryName)},children:f.categoryName}):null,f.title?(0,$e.jsx)("span",{className:"stream-meta__title",children:f.title}):null]}):null,o?null:(0,$e.jsxs)("div",{className:"stream-meta__bar",role:"img","aria-label":l.metaCategory,title:n?void 0:l.metaRevealHint,children:[s.segments.map(v=>{let E=v.endSec??m,d=Math.min(E,w);if(d<=v.startSec)return null;let c=v.startSec/m*100,p=(d-v.startSec)/m*100;return(0,$e.jsx)("span",{className:"stream-meta__segment",style:{left:`${c}%`,width:`${p}%`,background:wp(v.categoryName)},title:`${v.categoryName??"\u2014"} \xB7 ${er(v.startSec)}`},`${v.startSec}-${v.categoryName??"none"}`)}),!n&&w<m?(0,$e.jsx)("span",{className:"stream-meta__unknown",style:{left:`${w/m*100}%`,width:`${(m-w)/m*100}%`},title:l.metaRevealHint}):null]})]})}var M=B(le()),kp=200;function xp({archiveId:e,chatUrl:t,historySessionId:n=e,liveEmotesUrl:r,timelineUrl:o,eventsUrl:l,staticData:i,videoElement:s,isLive:u,defaultOffsetSec:a=0,externalOffsetSec:h,onExternalOffsetChange:m,baseOffsetSec:f=0,mediaPartStartSec:g=0,isLastPart:w=!0}){let{locale:v}=Zf(),{spoilerFree:E}=Xf(),d=Af[v],{prefs:c,update:p,toggleRole:y,reset:D}=$f(),[_,S]=(0,T.useState)(i??null),[N,b]=(0,T.useState)(!i),[A,G]=(0,T.useState)(!1),[wn,rr]=Of(e??t??null,a),ie=h??wn,Cn=(0,T.useCallback)(x=>{let R=typeof x=="function"?x(ie):x;h!==void 0&&m?m(R):rr(R)},[ie,h,m,rr]),[or,ni]=(0,T.useState)(!1),[lr,qt]=(0,T.useState)(""),[Ne,Ft]=(0,T.useState)(null),[ir,Pt]=(0,T.useState)(0),[fo,po]=(0,T.useState)(!1),[ct,ho]=(0,T.useState)(0),[k,$]=(0,T.useState)(null),[V,Oe]=(0,T.useState)(!1),nt=(0,T.useMemo)(()=>fp(_?.mediaTimeline),[_?.mediaTimeline]),sr=pp((k??ir)+f-ie,nt),$u=_?.messages.at(-1),en=$u?ql($u.relativeTimeSec,nt)+ie-f:0,oi=w&&!u&&fo&&ct>0&&en>ct+.001,[Mp,Ou]=(0,T.useState)(!0),ur=(0,T.useRef)(null),li=(0,T.useRef)(null),mo=(0,T.useRef)(!0),ii=(0,T.useRef)(0),[Ap,zp]=(0,T.useState)(null),[_n,Bu]=(0,T.useState)(null),[bu,go]=(0,T.useState)("idle");(0,T.useEffect)(()=>{i&&(S(i),b(!1),G(!1))},[i]);let ar=t??(e?`archives/${e}/chat`:null);(0,T.useEffect)(()=>{if(!ar||i)return;let x=!1;async function R(){b(!0),G(!1),S(null);try{let Y=await ei(ar,()=>x);x||S(Y)}catch{x||(S({messages:[],emotes:null}),G(!0))}finally{x||b(!1)}}return R(),()=>{x=!0}},[ar,i]),(0,T.useEffect)(()=>{Bu(null),go("idle")},[r]),(0,T.useEffect)(()=>{if(!c.useLiveEmotes||!r||_n)return;let x=!1;return go("loading"),(async()=>{try{let R=await at(r);if(x)return;Bu(R.emotes),go("idle")}catch{x||go("error")}})(),()=>{x=!0}},[c.useLiveEmotes,r,_n]),(0,T.useEffect)(()=>{if(!s)return;let x=()=>{$(null),Oe(!1),po(!1)},R=()=>ho(Pf(s,g)??0),Y=()=>{R(),Pt(jl(s,g)),po(!0)};x(),R(),s.ended&&Y();let Be=()=>{let xn=s.ended?jl(s,g):Math.floor(jl(s,g));Pt(cr=>cr===xn?cr:xn)};return Be(),s.addEventListener("timeupdate",Be),s.addEventListener("seeked",Be),s.addEventListener("seeking",x),s.addEventListener("playing",x),s.addEventListener("emptied",x),s.addEventListener("ended",Y),s.addEventListener("durationchange",R),Be(),()=>{s.removeEventListener("timeupdate",Be),s.removeEventListener("seeked",Be),s.removeEventListener("seeking",x),s.removeEventListener("playing",x),s.removeEventListener("emptied",x),s.removeEventListener("ended",Y),s.removeEventListener("durationchange",R)}},[s,f,g,ar]),(0,T.useEffect)(()=>{if(!V||!oi)return;let x=performance.now(),R=window.setInterval(()=>{let Y=performance.now(),Be=(Y-x)/1e3;x=Y,$(xn=>mp(xn??ct,Be,en,s?.playbackRate??1))},200);return()=>window.clearInterval(R)},[V,oi,ct,en,s]),(0,T.useEffect)(()=>{k!==null&&k>=en&&Oe(!1)},[k,en]);let vo=(0,T.useMemo)(()=>{let x=c.useLiveEmotes&&_n?_n:_?.emotes,R=new Map;for(let Y of x?.emotes??[])R.set(Y.name,Y);return R},[_?.emotes,c.useLiveEmotes,_n]),si=(0,T.useMemo)(()=>Ru(c.keywords),[c.keywords]),Lp=(0,T.useMemo)(()=>new Set(si),[si]),ju=(0,T.useMemo)(()=>new Set(Ru(c.hiddenUsers)),[c.hiddenUsers]),Ip=(0,T.useMemo)(()=>new Set(c.highlightRoles),[c.highlightRoles]),ui=lr.trim().toLowerCase(),dt=(0,T.useMemo)(()=>(_?.messages??[]).filter(R=>!(!c.showDeleted&&R.isDeleted||ju.has(R.authorLogin.toLowerCase())||c.hideCommands&&R.textRaw.trimStart().startsWith("!")||ui&&!`${R.authorLogin} ${R.authorDisplayName??""} ${R.textRaw}`.toLowerCase().includes(ui))),[_,c.showDeleted,c.hideCommands,ju,ui]),Uu=(_?.messages.length??0)-dt.length;(0,T.useEffect)(()=>{u||!s||uo.warm(sp(dt,vo,sr,s.playbackRate))},[dt,vo,sr,u,s]);let Hu=(0,T.useMemo)(()=>{if(dt.length===0)return[];let x=(Te,Vp)=>({message:Te,renderTime:ql(Te.relativeTimeSec,nt)-f+ie,deleted:io(Te,Vp)});if(u||!s)return dt.slice(-kp).map(Te=>x(Te,Number.POSITIVE_INFINITY));let R=sr,Y=0,Be=dt.length;for(;Y<Be;){let Te=Y+Be>>>1;dt[Te].relativeTimeSec<=R?Y=Te+1:Be=Te}let xn=Math.max(0,Y-kp),cr=[];for(let Te=xn;Te<Y;Te+=1)cr.push(x(dt[Te],R));return cr},[dt,sr,nt,ie,f,u,s]),yo=(0,T.useCallback)(()=>{let x=ur.current;x&&(x.scrollTop=x.scrollHeight,ii.current=x.scrollTop)},[]);(0,T.useLayoutEffect)(()=>{mo.current&&yo()}),(0,T.useEffect)(()=>{let x=new ResizeObserver(()=>{mo.current&&yo()});return ur.current&&x.observe(ur.current),li.current&&x.observe(li.current),()=>x.disconnect()},[yo]);let $p=()=>{let x=ur.current;if(!x)return;let R=x.scrollHeight-x.scrollTop-x.clientHeight<24,Y=x.scrollTop<ii.current-1;ii.current=x.scrollTop,(R||Y)&&(mo.current=R,Ou(R))},Op=()=>{mo.current=!0,yo(),Ou(!0)},kn=(0,T.useCallback)(x=>ql(x,nt)-f+ie,[f,ie,nt]),Vu=(0,T.useCallback)(x=>{let R=kn(x);return s?Ul(s,R,g):R},[kn,s,g]),ai=(0,T.useCallback)(x=>{if(!s||u)return!1;let R=Ul(s,kn(x),g),Y=Number.isFinite(s.duration)?s.duration:null;return R>=0&&(Y===null||R<=Y)},[s,u,kn,g]),Bp=(0,T.useCallback)(x=>{!s||!ai(x)||(s.currentTime=Math.max(0,Ul(s,kn(x),g)))},[s,ai,kn,g]),bp=_?.messages??[],Wu=(0,T.useMemo)(()=>{let x=new Map;for(let R of _?.messages??[])x.set(R.authorLogin.toLowerCase(),R.authorLogin),R.authorDisplayName&&x.set(R.authorDisplayName.toLowerCase(),R.authorLogin);return x},[_?.messages]),Qu=(0,T.useCallback)(x=>Ft(Wu.get(x.toLowerCase())??x.toLowerCase()),[Wu]),ci=u||!s?Number.POSITIVE_INFINITY:sr,jp=bu==="loading"?d.liveEmotesLoading:bu==="error"?d.liveEmotesError:c.useLiveEmotes&&_n===null?d.liveEmotesNone:null,Up={"--chat-font":`${c.fontPx}px`,"--chat-emote":`${c.emotePx}px`},Hp=["chat-replay",c.compact?"is-compact":"",c.stripes?"has-stripes":"",c.showTimestamps?"":"no-time"].filter(Boolean).join(" ");return(0,M.jsxs)("div",{className:Hp,style:Up,children:[(0,M.jsxs)("div",{className:"chat-bar",children:[(0,M.jsx)("strong",{className:"chat-bar__title",children:d.title}),!E&&_?.messages.length?(0,M.jsx)("span",{className:"chat-bar__count",children:_.messages.length}):null,Uu>0?(0,M.jsxs)("span",{className:"chat-bar__filtered",title:d.filtered,children:["\u2212",Uu]}):null,ie!==0?(0,M.jsxs)("span",{className:"chat-bar__offset",title:d.offset,children:[ie>0?`+${ie}`:ie,"s"]}):null,(0,M.jsx)("button",{type:"button",className:`chat-bar__gear${or?" is-active":""}`,onClick:()=>ni(x=>!x),title:d.settings,"aria-expanded":or,children:(0,M.jsx)(dp,{size:14})})]}),_?.missingGifAssets?.length?(0,M.jsx)("div",{className:"chat-empty",role:"status",children:v==="ru"?"\u0412 \u044D\u0442\u043E\u043C \u0444\u0430\u0439\u043B\u0435 \u043D\u0435\u0442 \u043A\u043E\u043F\u0438\u0439 \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u044B\u0445 GIF. \u041E\u043D\u0438 \u043E\u0442\u043A\u0440\u043E\u044E\u0442\u0441\u044F, \u0442\u043E\u043B\u044C\u043A\u043E \u0435\u0441\u043B\u0438 \u043E\u0440\u0438\u0433\u0438\u043D\u0430\u043B\u044B \u0435\u0449\u0451 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B.":"Some GIF images are missing from this file. They can load only while the originals remain available."}):null,or?(0,M.jsx)(ip,{prefs:c,update:p,toggleRole:y,reset:D,copy:d,locale:v,offset:ie,setOffset:Cn,search:lr,setSearch:qt,liveEmotesUrl:r,liveEmotesNote:jp}):null,oi?(0,M.jsxs)("div",{className:"chat-tail",role:"group","aria-label":d.afterStream,children:[(0,M.jsx)("span",{children:d.afterStream}),(k??ct)<en?(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)("button",{type:"button",className:"button secondary",onClick:()=>{$(x=>x??ct),Oe(x=>!x)},children:V?d.pauseTail:d.playTail}),(0,M.jsx)("button",{type:"button",className:"button secondary",onClick:()=>{Oe(!1),$(en)},children:d.showTail})]}):(0,M.jsx)("span",{children:d.tailComplete})]}):null,(0,M.jsx)(_p,{timelineUrl:o,chatTimeSec:ci,reveal:!E&&c.revealTimeline,onToggleReveal:()=>p("revealTimeline",!c.revealTimeline),hideScale:E,copy:d,locale:v}),c.showEvents?(0,M.jsx)(vp,{eventsUrl:l,collapsed:c.collapseEvents,onToggleCollapsed:()=>p("collapseEvents",!c.collapseEvents),chatTimeSec:ci,copy:d,locale:v}):null,(0,M.jsxs)("div",{className:"chat-list-wrap",ref:zp,children:[(0,M.jsx)("div",{ref:ur,className:"chat-list thin-scroll",onScroll:$p,children:(0,M.jsx)("div",{ref:li,className:"chat-list-content",children:N?Array.from({length:16},(x,R)=>(0,M.jsxs)("div",{className:"chat-message chat-message--skeleton",children:[(0,M.jsx)(Au,{width:`${34+R*17%40}px`}),(0,M.jsx)(Au,{width:`${45+R*29%45}%`})]},R)):A?(0,M.jsx)("div",{className:"chat-empty chat-empty--error",children:d.loadError}):Hu.length===0?(0,M.jsx)("div",{className:"chat-empty",children:_?.messages.length===0?d.empty:d.waiting}):Hu.map(x=>(0,M.jsx)(Kg,{message:x.message,renderTime:Vu(x.message.relativeTimeSec),deleted:x.deleted,emoteMap:vo,gifAssets:_?.gifAssets,emotePx:c.emotePx,readableColors:c.readableColors,highlightRoles:Ip,highlightFirstMessage:c.highlightFirstMessage,showBets:c.showBets,keywords:si,selfNames:Lp,isActiveUser:Ne===x.message.authorLogin,onAuthorClick:Ft,onMentionClick:Qu,locale:v,copy:d},x.message.id))})}),Mp?null:(0,M.jsx)("button",{type:"button",className:"chat-jump-pill",onClick:Op,children:d.paused}),Ne?(0,M.jsx)(cp,{login:Ne,historyUrl:n?`public/streams/${n}/chat/users/${encodeURIComponent(Ne)}/history`:void 0,messages:bp,thresholdSec:ci,emoteMap:vo,gifAssets:_?.gifAssets,emotePx:c.emotePx,readableColors:c.readableColors,copy:d,locale:v,onClose:()=>Ft(null),onMentionClick:Qu,onSeek:Bp,canSeek:ai,toRenderTime:Vu,anchorEl:Ap},`${n??ar??"offline"}:${Ne.toLowerCase()}`):null]})]})}var Kg=(0,T.memo)(function({message:t,renderTime:n,deleted:r,emoteMap:o,gifAssets:l,emotePx:i,readableColors:s,highlightRoles:u,highlightFirstMessage:a,showBets:h,keywords:m,selfNames:f,isActiveUser:g,onAuthorClick:w,onMentionClick:v,locale:E,copy:d}){let c=Wl(t.textRaw),p=Ql(t),y=p.find(G=>u.has(G)),D=m.length>0&&m.some(G=>c.text.toLowerCase().includes(G)),_=["chat-message",r?"is-deleted":"",c.isAction?"is-action":"",a&&t.isFirstMessage?"is-first":"",y?`is-role is-role--${y}`:"",D?"is-keyword":"",g?"is-active-user":""].filter(Boolean).join(" "),S=r?t.banDurationSec??null:null,N=a&&!!t.isFirstMessage,b=s?Hl(t.authorColor):t.authorColor,A=h?t.predictionBet??null:null;return(0,M.jsxs)("div",{className:_,children:[(0,M.jsx)("span",{className:"chat-time",title:"Time in video",children:er(n)}),N?(0,M.jsx)("span",{className:"chat-first",title:d.firstMessageTitle,children:d.firstMessage}):null,p.length>0?(0,M.jsx)("span",{className:"chat-badges",children:p.map(G=>(0,M.jsx)("span",{className:`chat-badge chat-badge--${G}`,title:vn[G][E],children:vn[G].badge},G))}):null,A?(0,M.jsx)("span",{className:"chat-bet",style:{background:tp(A.badgeVersion)},title:A.outcomeTitle?`${d.eventBetOn}: ${A.outcomeTitle}`:d.eventPrediction,children:A.outcomeTitle??"\u2022"}):null,(0,M.jsx)("button",{type:"button",className:"chat-author",style:{color:b||"#9ca3af"},onClick:()=>w(t.authorLogin),title:d.userCardTitle,children:t.authorDisplayName??t.authorLogin}),(0,M.jsx)("span",{className:"chat-separator",children:c.isAction?" ":": "}),(0,M.jsx)("span",{className:"chat-text",children:(0,M.jsx)(Zl,{text:c.text,emoteMap:o,twitchEmotes:t.emotes,inlineEmotes:t.inlineEmotes,twitchGifs:t.gifs,gifUrls:t.gifUrls,gifAssets:l,emotePx:i,selfNames:f,onMentionClick:v,mentionTitle:d.userCardTitle})}),S!==null?(0,M.jsxs)("span",{className:`chat-ban${S===0?" chat-ban--perma":""}`,title:S===0?d.banPermanent:d.banTimeout,children:[S===0?"\u26D4":"\u23F1"," ",Gg(S,E)]}):null]})});function Gg(e,t){if(e<=0)return t==="ru"?"\u0431\u0430\u043D":"ban";if(e<60)return t==="ru"?`${e} \u0441\u0435\u043A`:`${e}s`;if(e<3600){let r=Math.round(e/60);return t==="ru"?`${r} \u043C\u0438\u043D`:`${r}m`}if(e<86400){let r=Math.round(e/3600);return t==="ru"?`${r} \u0447`:`${r}h`}let n=Math.round(e/86400);return t==="ru"?`${n} \u0434\u043D`:`${n}d`}var co=new Map,ti=new Map,Lu=864e5,Iu=3e5,Yg;function Ep(){return Yg??(Yg=new Promise(e=>{let t=setTimeout(()=>e(null),1e3),n=r=>{clearTimeout(t),e(r)};try{let r=indexedDB.open("tsr-replay-cache",1);r.onupgradeneeded=()=>r.result.createObjectStore("sessions",{keyPath:"key"}),r.onsuccess=()=>n(r.result),r.onerror=r.onblocked=()=>n(null)}catch{n(null)}}))}async function Zg(e){let t=await Ep();if(t)return new Promise(n=>{try{let r=t.transaction("sessions").objectStore("sessions").get(e);r.onsuccess=()=>n(r.result),r.onerror=()=>n(void 0)}catch{n(void 0)}})}function zu(e){co.delete(e.key),co.set(e.key,e);let t=0,n=0;for(let r of[...co.values()].reverse())t+=r.data.messages.length,(t>Iu||n++>=8)&&co.delete(r.key)}async function Xg(e){let t=await Ep();if(!(!t||e.data.messages.length>Iu))try{let n=t.transaction("sessions","readwrite").objectStore("sessions");n.put(e);let r=n.openCursor(),o=[];r.onsuccess=()=>{let l=r.result;if(l)o.push({key:l.primaryKey,savedAt:l.value.savedAt,count:l.value.data.messages.length}),l.continue();else{let i=0;o.sort((s,u)=>u.savedAt-s.savedAt).forEach((s,u)=>{i+=s.count,(u>=8||i>Iu||Date.now()-s.savedAt>7*Lu)&&n.delete(s.key)})}}}catch{}}function Dp(e,t,n){let r=ti.get(e);if(r)return r;let o=(async()=>{let l=co.get(e)??(t?await Zg(e):void 0),i=l?Date.now()-l.savedAt:1/0;if(l&&i>=0&&i<(t?Lu:15e3)&&Array.isArray(l.data?.messages))return zu(l),l.data;let s;try{s=await n()}catch(a){if(t&&l&&i>=0&&i<7*Lu&&Array.isArray(l.data?.messages))return zu(l),l.data;throw a}if(!Array.isArray(s?.messages))throw new Error("Invalid replay response");let u={key:e,savedAt:Date.now(),data:s};return zu(u),t&&Xg(u),s})();return ti.set(e,o),o.finally(()=>{ti.get(e)===o&&ti.delete(e)}).catch(()=>{}),o}function Sp(e,t,n){let r=n?.mediaTimeline?.captureAnchorMs||Date.parse(e.recordingStartedAt||e.startedAt||"");return Number.isFinite(r)&&t>0?(r-t)/1e3:0}function Fp(e,t,n){return{...e,mediaTimeline:null,messages:e.messages.map(r=>{let o=Date.parse(r.messageTimestamp||"");return{...r,relativeTimeSec:n>0&&Number.isFinite(o)?(o-n)/1e3:r.relativeTimeSec+t,deletedAtSec:r.deletedAtSec==null?r.deletedAtSec:r.deletedAtSec+t}})}}function Pp(e){let t=new Map,n=new Map;for(let r of e){for(let o of r.messages){let l=o.id;t.has(l)||t.set(l,o)}for(let o of r.emotes?.emotes??[])n.set(o.name,o)}return{messages:[...t.values()].sort((r,o)=>r.relativeTimeSec-o.relativeTimeSec),emotes:{provider:"7tv",fetchedAt:"",emotes:[...n.values()]},gifAssets:Object.assign({},...e.map(r=>r.gifAssets))}}function Np(e,t,n){let r=o=>o==null?o:o+n;return e.endsWith("/events")?{...t,events:(t.events??[]).map(o=>({...o,startedAtSec:r(o.startedAtSec),lockedAtSec:r(o.lockedAtSec),endedAtSec:r(o.endedAtSec),samples:o.samples.map(l=>({...l,atSec:r(l.atSec)}))}))}:e.endsWith("/timeline")?{...t,points:t.points.map(o=>({...o,relativeTimeSec:r(o.relativeTimeSec)})),segments:t.segments.map(o=>({...o,startSec:r(o.startSec),endSec:r(o.endSec)})),titles:t.titles.map(o=>({...o,atSec:r(o.atSec)}))}:t}var Jt=B(le());function Jg({options:e}){let[t,n]=(0,St.useState)(null),[r,o]=(0,St.useState)(!1),[l,i]=(0,St.useState)(0),[s,u]=(0,St.useState)(""),a=Rp(e),[h,m]=(0,St.useState)({});return(0,St.useEffect)(()=>{let f=!1;if(n(null),o(!1),!!e.sessions.length)return(async()=>{let g={},w=[];for(let v of e.sessions){let E=`public/streams/${v.id}`,d=await Dp(`${new URL(e.server).origin}:${v.id}:${v.recordingEndedAt??"active"}:v1`,!!v.recordingEndedAt,async()=>{let p=y=>e.request(new URL(e.server).origin+"/api/"+y);try{let y=await ei(E+"/chat",()=>!1,D=>p(D));if(y)return y}catch{}return p(E+"/chat-replay")});if(f||!d)return;let c=Sp(v,e.vodStartMs,d);g[v.id]=c,w.push(Fp(d,c,e.vodStartMs))}f||(m(g),n(Pp(w)))})().catch(()=>{f||o(!0)}),()=>{f=!0}},[a,l]),(0,St.useEffect)(()=>{let f=e.video,g=()=>{let w=(f?.currentTime??0)+e.offset,v=e.sessions.slice().sort((d,c)=>(h[d.id]??0)-(h[c.id]??0)),E=v.filter(d=>(h[d.id]??0)<=w).at(-1)??v[0];u(E?.id??"")};return g(),f?.addEventListener("timeupdate",g),f?.addEventListener("seeked",g),()=>{f?.removeEventListener("timeupdate",g),f?.removeEventListener("seeked",g)}},[e.video,e.offset,a,h]),Mf(e.server,e.request,(f,g)=>{let w=f.split("/")[2];return Np(f,g,h[w]??0)}),r?(0,Jt.jsxs)("div",{className:"notice error",children:["\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0447\u0430\u0442. ",(0,Jt.jsx)("button",{onClick:()=>i(f=>f+1),children:"\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C"})]}):t?(0,Jt.jsx)(Kl.Provider,{value:{locale:e.locale??"ru",spoilerFree:e.spoilerFree},children:(0,Jt.jsx)(xp,{staticData:t,archiveId:`twitch:${a}`,historySessionId:s,liveEmotesUrl:s?`public/streams/${s}/emotes/live`:void 0,timelineUrl:s?`public/streams/${s}/timeline`:void 0,eventsUrl:s?`public/streams/${s}/events`:void 0,videoElement:e.video,isLive:!1,externalOffsetSec:-e.offset,onExternalOffsetChange:f=>e.onOffsetChange(-f)})}):(0,Jt.jsx)("div",{className:"notice",children:e.sessions.length?"\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0447\u0430\u0442\u0430\u2026":"\u0418\u0449\u0443 \u0437\u0430\u043F\u0438\u0441\u044C \u044D\u0442\u043E\u0433\u043E \u044D\u0444\u0438\u0440\u0430\u2026"})}function qg(e,t){try{if(!localStorage.getItem("tsr-chat-prefs")){let a=JSON.parse(localStorage.getItem("tsr-chat-view")||"null");a&&localStorage.setItem("tsr-chat-prefs",JSON.stringify({fontPx:a.fontPx,emotePx:(a.emoteScale||1.5)*(a.fontPx||13),showTimestamps:a.showTime,stripes:a.zebra,readableColors:a.readable,showDeleted:a.showDeleted,highlightFirstMessage:a.firstMsg,keywords:a.highlight}))}}catch{}let n=e.attachShadow({mode:"open"});n.addEventListener("keydown",a=>a.stopPropagation()),n.addEventListener("keyup",a=>a.stopPropagation());let r=document.createElement("style");r.textContent=`:host {
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

/* Highlight the entire first-message row, including its time and author.
   Keep the tint above zebra stripes, role highlights and compact spacing. */
.chat-replay .chat-message.is-first,
.chat-replay.has-stripes .chat-message.is-first,
.chat-replay.is-compact .chat-message.is-first {
  background: rgba(34, 197, 94, 0.16);
  box-shadow: inset 3px 0 0 #22c55e, inset 0 0 0 1px rgba(34, 197, 94, 0.45);
  border-radius: 5px;
  padding: 4px 6px;
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
.tsr-shared-chat .chat-bar { padding-left: var(--tsr-chat-header-left, 12px); padding-right: var(--tsr-chat-header-right, 12px); min-height: 42px; flex-shrink: 0; }
.tsr-shared-chat .chat-bar__title { white-space: nowrap; }
`;let o=document.createElement("div");o.className="tsr-shared-chat",n.append(r,o);let l=(0,Tp.createRoot)(o),i,s="",u=a=>{let h=Rp(a),m=i&&s===h&&i.server===a.server&&i.video===a.video&&i.offset===a.offset&&i.spoilerFree===a.spoilerFree&&i.locale===a.locale;i=a,s=h,m||l.render((0,Jt.jsx)(Jg,{options:a},h))};return u(t),{update:u,unmount:()=>l.unmount()}}function Rp(e){return e.sessions.map(t=>`${t.id}:${t.recordingStartedAt??t.startedAt??""}:${t.recordingEndedAt??""}`).sort().join(",")+":"+e.vodStartMs}return Jp(e0);})();
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
