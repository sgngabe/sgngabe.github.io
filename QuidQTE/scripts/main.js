"use strict";window.DOMHandler=class{constructor(a,b){this._iRuntime=a,this._componentId=b,this._hasTickCallback=!1,this._tickCallback=()=>this.Tick()}Attach(){}PostToRuntime(a,b,c,d){this._iRuntime.PostToRuntimeComponent(this._componentId,a,b,!!c,d)}PostToRuntimeAsync(a,b,c,d){return this._iRuntime.PostToRuntimeComponentAsync(this._componentId,a,b,!!c,d)}_PostToRuntimeMaybeSync(a,b,c){this._iRuntime.UsesWorker()?this.PostToRuntime(a,b,c):this._iRuntime._GetLocalRuntime()["_OnMessageFromDOM"]({"type":"event","component":this._componentId,"handler":a,"dispatchRuntimeEvent":c,"data":b,"responseId":null})}AddRuntimeMessageHandler(a,b){this._iRuntime.AddRuntimeComponentMessageHandler(this._componentId,a,b)}AddRuntimeMessageHandlers(a){for(const[b,c]of a)this.AddRuntimeMessageHandler(b,c)}GetRuntimeInterface(){return this._iRuntime}GetComponentID(){return this._componentId}_StartTicking(){this._hasTickCallback||(this._iRuntime._AddRAFCallback(this._tickCallback),this._hasTickCallback=!0)}_StopTicking(){this._hasTickCallback&&(this._iRuntime._RemoveRAFCallback(this._tickCallback),this._hasTickCallback=!1)}Tick(){}};

"use strict";window.DOMElementHandler=class extends DOMHandler{constructor(a,b){super(a,b),this._elementMap=new Map,this._autoAttach=!0,this.AddRuntimeMessageHandler("create",(a)=>this._OnCreate(a)),this.AddRuntimeMessageHandler("destroy",(a)=>this._OnDestroy(a)),this.AddRuntimeMessageHandler("set-visible",(a)=>this._OnSetVisible(a)),this.AddRuntimeMessageHandler("update-position",(a)=>this._OnUpdatePosition(a)),this.AddRuntimeMessageHandler("update-state",(a)=>this._OnUpdateState(a)),this.AddRuntimeMessageHandler("focus",(a)=>this._OnSetFocus(a)),this.AddRuntimeMessageHandler("set-css-style",(a)=>this._OnSetCssStyle(a))}SetAutoAttach(a){this._autoAttach=!!a}AddDOMElementMessageHandler(a,b){this.AddRuntimeMessageHandler(a,(a)=>{const c=a["elementId"],d=this._elementMap.get(c);return b(d,a)})}_OnCreate(a){const b=a["elementId"],c=this.CreateElement(b,a);this._elementMap.set(b,c),this._autoAttach&&document.body.appendChild(c)}CreateElement(){throw new Error("required override")}DestroyElement(){}_OnDestroy(a){const b=a["elementId"],c=this._elementMap.get(b);this.DestroyElement(c),this._autoAttach&&c.parentElement.removeChild(c),this._elementMap.delete(b)}PostToRuntimeElement(a,b,c){c||(c={}),c["elementId"]=b,this.PostToRuntime(a,c)}_PostToRuntimeElementMaybeSync(a,b,c){c||(c={}),c["elementId"]=b,this._PostToRuntimeMaybeSync(a,c)}_OnSetVisible(a){if(this._autoAttach){const b=this._elementMap.get(a["elementId"]);b.style.display=a["isVisible"]?"":"none"}}_OnUpdatePosition(a){if(this._autoAttach){const b=this._elementMap.get(a["elementId"]);b.style.left=a["left"]+"px",b.style.top=a["top"]+"px",b.style.width=a["width"]+"px",b.style.height=a["height"]+"px";const c=a["fontSize"];null!==c&&(b.style.fontSize=c+"em")}}_OnUpdateState(a){const b=this._elementMap.get(a["elementId"]);this.UpdateState(b,a)}UpdateState(){throw new Error("required override")}_OnSetFocus(a){const b=this._elementMap.get(a["elementId"]);a["focus"]?b.focus():b.blur()}_OnSetCssStyle(a){const b=this._elementMap.get(a["elementId"]);b.style[a["prop"]]=a["val"]}GetElementById(a){return this._elementMap.get(a)}};

"use strict";{function a(a){return new Promise((b,c)=>{const d=document.createElement("script");d.onload=b,d.onerror=c,d.async=!1,d.src=a,document.head.appendChild(d)})}async function b(a){const b=await c(a),d=new TextDecoder("utf-8");return d.decode(b)}function c(a){return new Promise((b,c)=>{const d=new FileReader;d.onload=(a)=>b(a.target.result),d.onerror=(a)=>c(a),d.readAsArrayBuffer(a)})}function d(){if(!f)return o;const a=document.createElement("canvas"),b=a.getContext("webgl2",{"alpha":!0,"depth":!1,"antialias":!1,"failIfMajorPerformanceCaveat":!0});if(!b)return o;const c=b.getExtension("WEBGL_debug_renderer_info");if(!c)return o;const d=b.getParameter(c["UNMASKED_RENDERER_WEBGL"]);for(const a of p)if(d.toLowerCase().includes(a.toLowerCase()))return console.warn(`[Construct 3] This device appears to support WebGL 2, but it is disabled due to GPU driver bugs that make it unusable. (Renderer '${d}' matches blacklist entry '${a}'.) See crbug.com/934823`),1;return o}const e=/(iphone|ipod|ipad)/i.test(navigator.userAgent),f=/android/i.test(navigator.userAgent);let g=new Audio;const h={"audio/webm; codecs=opus":!!g.canPlayType("audio/webm; codecs=opus"),"audio/ogg; codecs=opus":!!g.canPlayType("audio/ogg; codecs=opus"),"audio/webm; codecs=vorbis":!!g.canPlayType("audio/webm; codecs=vorbis"),"audio/ogg; codecs=vorbis":!!g.canPlayType("audio/ogg; codecs=vorbis"),"audio/mp4":!!g.canPlayType("audio/mp4"),"audio/mpeg":!!g.canPlayType("audio/mpeg")};g=null;const i=[];let j=0;const k=[],l=new Map,m=new Map;let n=0;const o=2,p=["Mali"];window.RuntimeInterface=class f{constructor(a){this._useWorker=a.useWorker,this._messageChannelPort=null,this._baseUrl="",this._scriptFolder=a.scriptFolder,this._workerScriptBlobURLs={},this._worker=null,this._localRuntime=null,this._domHandlers=[],this._runtimeDomHandler=null,this._canvas=null,this._jobScheduler=null,this._rafId=-1,this._rafFunc=()=>this._OnRAFCallback(),this._rafCallbacks=[],this._exportType=a.exportType,"cordova"===this._exportType&&this._useWorker&&(console.warn("[C3 runtime] Worker mode is enabled and supported, but is disabled in Cordova due to crbug.com/939775. Reverting to DOM mode."),this._useWorker=!1),this._transferablesBroken=!1,this._localFileBlobs=null,("html5"===this._exportType||"playable-ad"===this._exportType)&&"file"===location.protocol.substr(0,4)&&alert("Exported games won't work until you upload them. (When running on the file: protocol, browsers block many features from working for security reasons.)"),this.AddRuntimeComponentMessageHandler("runtime","cordova-fetch-local-file",(a)=>this._OnCordovaFetchLocalFile(a)),this.AddRuntimeComponentMessageHandler("runtime","create-job-worker",(a)=>this._OnCreateJobWorker(a)),"cordova"===this._exportType?document.addEventListener("deviceready",()=>this._Init(a)):this._Init(a)}Release(){this._CancelAnimationFrame(),this._messageChannelPort&&(this._messageChannelPort.onmessage=null,this._messageChannelPort=null),this._worker&&(this._worker.terminate(),this._worker=null),this._localRuntime&&(this._localRuntime.Release(),this._localRuntime=null),this._canvas&&(this._canvas.parentElement.removeChild(this._canvas),this._canvas=null)}GetCanvas(){return this._canvas}GetBaseURL(){return this._baseUrl}UsesWorker(){return this._useWorker}GetExportType(){return this._exportType}IsWKWebView(){return"cordova"===this._exportType&&e}IsiPhoneX(){if(!this.IsWKWebView())return!1;const a=window["devicePixelRatio"],b=window["screen"]["width"]*a,c=window["screen"]["height"]*a;return 1125==b&&2436==c}async _Init(a){if("playable-ad"===this._exportType){this._localFileBlobs=self["c3_base64files"],await this._ConvertDataUrisToBlobs();for(let b=0,c=a.engineScripts.length;b<c;++b){const c=a.engineScripts[b].toLowerCase();this._localFileBlobs.hasOwnProperty(c)&&(a.engineScripts[b]=URL.createObjectURL(this._localFileBlobs[c]))}}if(a.baseUrl)this._baseUrl=a.baseUrl;else{const a=location.origin;this._baseUrl=("null"===a?"file:///":a)+location.pathname;const b=this._baseUrl.lastIndexOf("/");-1!==b&&(this._baseUrl=this._baseUrl.substr(0,b+1))}if(a.workerScripts)for(const[b,c]of Object.entries(a.workerScripts))this._workerScriptBlobURLs[b]=URL.createObjectURL(c);const b=new MessageChannel;this._messageChannelPort=b.port1,this._messageChannelPort.onmessage=(a)=>this["_OnMessageFromRuntime"](a.data),window["c3_addPortMessageHandler"]&&window["c3_addPortMessageHandler"]((a)=>this._OnMessageFromDebugger(a)),this._jobScheduler=new self.JobSchedulerDOM(this),await this._jobScheduler.Init(),this.MaybeForceBodySize(),"object"==typeof window["StatusBar"]&&window["StatusBar"]["hide"](),await this._TestTransferablesWork(),this._useWorker?await this._InitWorker(a,b.port2):await this._InitDOM(a,b.port2)}_GetWorkerURL(a){return this._workerScriptBlobURLs.hasOwnProperty(a)?this._workerScriptBlobURLs[a]:a.endsWith("/workerMain.js")&&this._workerScriptBlobURLs.hasOwnProperty("workerMain.js")?this._workerScriptBlobURLs["workerMain.js"]:"playable-ad"===this._exportType&&this._localFileBlobs.hasOwnProperty(a.toLowerCase())?URL.createObjectURL(this._localFileBlobs[a.toLowerCase()]):a}async CreateWorker(a,b,c){if(a.startsWith("blob:"))return new Worker(a,c);if(this.IsWKWebView()){const b=await this.CordovaFetchLocalFileAsArrayBuffer(this._scriptFolder+a),d=new Blob([b],{type:"application/javascript"});return new Worker(URL.createObjectURL(d),c)}const d=new URL(a,b),e=location.origin!==d.origin;if(e){const a=await fetch(d);if(!a.ok)throw new Error("failed to fetch worker script");const b=await a.blob();return new Worker(URL.createObjectURL(b),c)}return new Worker(d,c)}MaybeForceBodySize(){if(this.IsiPhoneX()){const a=window.innerWidth>window.innerHeight,b=document["documentElement"].style,c=document["body"].style;a?(c["height"]=b["height"]="375px",c["width"]=b["width"]="812px"):(c["width"]=b["width"]="375px",c["height"]=b["height"]="812px")}}_GetCommonRuntimeOptions(a){return{"baseUrl":this._baseUrl,"windowInnerWidth":window.innerWidth,"windowInnerHeight":window.innerHeight,"devicePixelRatio":window.devicePixelRatio,"isFullscreen":f.IsDocumentFullscreen(),"maxWebGLVersion":d(),"projectData":a.projectData,"previewImageBlobs":window["cr_previewImageBlobs"]||this._localFileBlobs,"previewProjectFileBlobs":window["cr_previewProjectFileBlobs"],"shaders":self["C3_Shaders"],"exportType":a.exportType,"isDebug":-1<self.location.search.indexOf("debug"),"ife":!!self.ife,"jobScheduler":this._jobScheduler.GetPortData(),"supportedAudioFormats":h,"opusWasmScriptUrl":window["cr_opusWasmScriptUrl"]||this._scriptFolder+"opus.wasm.js","opusWasmBinaryUrl":window["cr_opusWasmBinaryUrl"]||this._scriptFolder+"opus.wasm.wasm","isWKWebView":this.IsWKWebView(),"isFBInstantAvailable":"undefined"!=typeof self["FBInstant"]}}async _InitWorker(a,b){const c=this._GetWorkerURL(a.workerMainUrl);this._worker=await this.CreateWorker(c,this._baseUrl,{name:"Runtime"}),this._canvas=document.createElement("canvas"),this._canvas.style.display="none";const d=this._canvas["transferControlToOffscreen"]();document.body.appendChild(this._canvas),window["c3canvas"]=this._canvas,this._worker.postMessage(Object.assign(this._GetCommonRuntimeOptions(a),{"type":"init-runtime","isInWorker":!0,"messagePort":b,"canvas":d,"workerDependencyScripts":a.workerDependencyScripts||[],"engineScripts":a.engineScripts}),[b,d,...this._jobScheduler.GetPortTransferables()]),this._domHandlers=k.map((a)=>new a(this)),this._FindRuntimeDOMHandler()}async _InitDOM(b,c){this._canvas=document.createElement("canvas"),this._canvas.style.display="none",document.body.appendChild(this._canvas),window["c3canvas"]=this._canvas,this._domHandlers=k.map((a)=>new a(this)),this._FindRuntimeDOMHandler();const d=b.engineScripts.map((a)=>new URL(a,this._baseUrl).toString());await Promise.all(d.map((b)=>a(b)));const e=Object.assign(this._GetCommonRuntimeOptions(b),{"isInWorker":!1,"messagePort":c,"canvas":this._canvas});this._localRuntime=self["C3_CreateRuntime"](e),await self["C3_InitRuntime"](this._localRuntime,e)}async _OnCreateJobWorker(){const a=await this._jobScheduler._CreateJobWorker();return{"outputPort":a,"transferables":[a]}}_GetLocalRuntime(){if(this._useWorker)throw new Error("not available in worker mode");return this._localRuntime}PostToRuntimeComponent(a,b,c,d,e){this._messageChannelPort.postMessage({"type":"event","component":a,"handler":b,"dispatchRuntimeEvent":d,"data":c,"responseId":null},this._transferablesBroken?void 0:e)}PostToRuntimeComponentAsync(a,b,c,d,e){const f=n++,g=new Promise((a,b)=>{m.set(f,{resolve:a,reject:b})});return this._messageChannelPort.postMessage({"type":"event","component":a,"handler":b,"dispatchRuntimeEvent":d,"data":c,"responseId":f},this._transferablesBroken?void 0:e),g}["_OnMessageFromRuntime"](a){const b=a["type"];if("event"===b)this._OnEventFromRuntime(a);else if("result"===b)this._OnResultFromRuntime(a);else if("runtime-ready"===b)this._OnRuntimeReady();else throw new Error(`unknown message '${b}'`)}_OnEventFromRuntime(a){const b=a["component"],c=a["handler"],d=a["data"],e=a["responseId"],f=l.get(b);if(!f)return void console.warn(`[DOM] No event handlers for component '${b}'`);const g=f.get(c);if(!g)return void console.warn(`[DOM] No handler '${c}' for component '${b}'`);let h=null;try{h=g(d)}catch(a){return console.error(`Exception in '${b}' handler '${c}':`,a),void(null!==e&&this._PostResultToRuntime(e,!1,a.toString()))}null!==e&&(h&&h.then?h.then((a)=>this._PostResultToRuntime(e,!0,a)).catch((a)=>{console.error(`Rejection from '${b}' handler '${c}':`,a),this._PostResultToRuntime(e,!1,a.toString())}):this._PostResultToRuntime(e,!0,h))}_PostResultToRuntime(a,b,c){let d;c&&c["transferables"]&&(d=c["transferables"]),this._messageChannelPort.postMessage({"type":"result","responseId":a,"isOk":b,"result":c},d)}_OnResultFromRuntime(a){const b=a["responseId"],c=a["isOk"],d=a["result"],e=m.get(b);c?e.resolve(d):e.reject(d),m.delete(b)}AddRuntimeComponentMessageHandler(a,b,c){let d=l.get(a);if(d||(d=new Map,l.set(a,d)),d.has(b))throw new Error(`[DOM] Component '${a}' already has handler '${b}'`);d.set(b,c)}static AddDOMHandlerClass(a){if(k.includes(a))throw new Error("DOM handler already added");k.push(a)}_FindRuntimeDOMHandler(){for(const a of this._domHandlers)if("runtime"===a.GetComponentID())return void(this._runtimeDomHandler=a);throw new Error("cannot find runtime DOM handler")}_OnMessageFromDebugger(a){this.PostToRuntimeComponent("debugger","message",a)}_OnRuntimeReady(){for(const a of this._domHandlers)a.Attach()}static IsDocumentFullscreen(){return!!(document["fullscreenElement"]||document["webkitFullscreenElement"]||document["mozFullScreenElement"])}async GetRemotePreviewStatusInfo(){return await this.PostToRuntimeComponentAsync("runtime","get-remote-preview-status-info")}_AddRAFCallback(a){this._rafCallbacks.push(a),this._RequestAnimationFrame()}_RemoveRAFCallback(a){const b=this._rafCallbacks.indexOf(a);if(-1===b)throw new Error("invalid callback");this._rafCallbacks.splice(b,1),this._rafCallbacks.length||this._CancelAnimationFrame()}_RequestAnimationFrame(){-1===this._rafId&&this._rafCallbacks.length&&(this._rafId=requestAnimationFrame(this._rafFunc))}_CancelAnimationFrame(){-1!==this._rafId&&(cancelAnimationFrame(this._rafId),this._rafId=-1)}_OnRAFCallback(){this._rafId=-1;for(const a of this._rafCallbacks)a();this._RequestAnimationFrame()}TryPlayMedia(a){this._runtimeDomHandler.TryPlayMedia(a)}RemovePendingPlay(a){this._runtimeDomHandler.RemovePendingPlay(a)}_PlayPendingMedia(){this._runtimeDomHandler._PlayPendingMedia()}SetSilent(a){this._runtimeDomHandler.SetSilent(a)}IsAudioFormatSupported(a){return!!h[a]}async _WasmDecodeWebMOpus(a){const b=await this.PostToRuntimeComponentAsync("runtime","opus-decode",{"arrayBuffer":a},!1,[a]);return new Float32Array(b)}IsAbsoluteURL(a){return /^(?:[a-z]+:)?\/\//.test(a)||"data:"===a.substr(0,5)||"blob:"===a.substr(0,5)}IsRelativeURL(a){return!this.IsAbsoluteURL(a)}async _OnCordovaFetchLocalFile(a){const b=a["filename"];switch(a["as"]){case"text":return await this.CordovaFetchLocalFileAsText(b);case"buffer":return await this.CordovaFetchLocalFileAsArrayBuffer(b);default:throw new Error("unsupported type");}}CordovaFetchLocalFile(a){const b=window["cordova"]["file"]["applicationDirectory"]+"www/"+a;return new Promise((a,c)=>{window["resolveLocalFileSystemURL"](b,(b)=>{b["file"](a,c)},c)})}async CordovaFetchLocalFileAsText(a){const c=await this.CordovaFetchLocalFile(a);return await b(c)}_CordovaMaybeStartNextArrayBufferRead(){if(i.length&&!(j>=8)){j++;const a=i.shift();this._CordovaDoFetchLocalFileAsAsArrayBuffer(a.filename,a.successCallback,a.errorCallback)}}CordovaFetchLocalFileAsArrayBuffer(a){return new Promise((b,c)=>{i.push({filename:a,successCallback:(a)=>{j--,this._CordovaMaybeStartNextArrayBufferRead(),b(a)},errorCallback:(a)=>{j--,this._CordovaMaybeStartNextArrayBufferRead(),c(a)}}),this._CordovaMaybeStartNextArrayBufferRead()})}async _CordovaDoFetchLocalFileAsAsArrayBuffer(a,b,d){try{const d=await this.CordovaFetchLocalFile(a),e=await c(d);b(e)}catch(a){d(a)}}async _ConvertDataUrisToBlobs(){const a=[];for(const[b,c]of Object.entries(this._localFileBlobs))a.push(this._ConvertDataUriToBlobs(b,c));await Promise.all(a)}async _ConvertDataUriToBlobs(a,b){if("object"==typeof b)this._localFileBlobs[a]=new Blob([b["str"]],{"type":b["type"]});else{const c=await fetch(b),d=await c.blob();this._localFileBlobs[a]=d}}_TestTransferablesWork(){let a=null;const b=new Promise((b)=>a=b),c=new ArrayBuffer(1),d=new MessageChannel;return d.port2.onmessage=(b)=>{b.data&&b.data["arrayBuffer"]||(this._transferablesBroken=!0,console.warn("MessageChannel transfers determined to be broken. Disabling transferables.")),a()},d.port1.postMessage({"arrayBuffer":c},[c]),b}}}

"use strict";{function a(a){return a["sourceCapabilities"]&&a["sourceCapabilities"]["firesTouchEvents"]||a["originalEvent"]&&a["originalEvent"]["sourceCapabilities"]&&a["originalEvent"]["sourceCapabilities"]["firesTouchEvents"]}function b(a){return new Promise((b,c)=>{const d=new Image;d.onload=()=>b(d),d.onerror=(a)=>c(a),d.src=a})}async function c(a){const c=URL.createObjectURL(a);try{return await b(c)}finally{URL.revokeObjectURL(c)}}function d(){try{return window.parent&&window.parent.document.hasFocus()}catch(a){return!1}}self["C3_RasterSvgImage"]=async function(a,b,c){const d=document.createElement("canvas");d.width=b,d.height=c;const e=d.getContext("2d");return e.drawImage(a,0,0,b,c),d};let e=!1;document.addEventListener("pause",()=>e=!0),document.addEventListener("resume",()=>e=!1);const f=class extends DOMHandler{constructor(a){super(a,"runtime"),this._isFirstSizeUpdate=!0,this._targetOrientation="any",this._attachedDeviceOrientationEvent=!1,this._attachedDeviceMotionEvent=!1,this._debugHighlightElem=null,a.AddRuntimeComponentMessageHandler("canvas","update-size",(a)=>this._OnUpdateCanvasSize(a)),a.AddRuntimeComponentMessageHandler("runtime","invoke-download",(a)=>this._OnInvokeDownload(a)),a.AddRuntimeComponentMessageHandler("runtime","raster-svg-image",(a)=>this._OnRasterSvgImage(a)),a.AddRuntimeComponentMessageHandler("runtime","set-target-orientation",(a)=>this._OnSetTargetOrientation(a)),a.AddRuntimeComponentMessageHandler("runtime","register-sw",()=>this._OnRegisterSW()),a.AddRuntimeComponentMessageHandler("runtime","post-to-debugger",(a)=>this._OnPostToDebugger(a)),a.AddRuntimeComponentMessageHandler("runtime","before-start-ticking",()=>this._OnBeforeStartTicking()),a.AddRuntimeComponentMessageHandler("runtime","debug-highlight",(a)=>this._OnDebugHighlight(a)),a.AddRuntimeComponentMessageHandler("runtime","enable-device-orientation",()=>this._AttachDeviceOrientationEvent()),a.AddRuntimeComponentMessageHandler("runtime","enable-device-motion",()=>this._AttachDeviceMotionEvent());const b=a.GetCanvas();b.addEventListener("contextmenu",(a)=>a.preventDefault()),b.addEventListener("selectstart",(a)=>a.preventDefault()),b.addEventListener("gesturehold",(a)=>a.preventDefault()),b.addEventListener("touchstart",(a)=>a.preventDefault()),window.addEventListener("mousedown",(a)=>{1===a.button&&a.preventDefault()}),window.addEventListener("resize",()=>this._OnWindowResize()),this._mediaPendingPlay=new Set,this._mediaRemovedPendingPlay=new WeakSet,this._isSilent=!1}_OnBeforeStartTicking(){return document.addEventListener("visibilitychange",()=>this._OnVisibilityChange(document.hidden)),document.addEventListener("pause",()=>this._OnVisibilityChange(!0)),document.addEventListener("resume",()=>this._OnVisibilityChange(!1)),{"isSuspended":!!(document.hidden||e)}}Attach(){window.addEventListener("focus",()=>this._PostRuntimeEvent("window-focus")),window.addEventListener("blur",()=>this._PostRuntimeEvent("window-blur",{"parentHasFocus":d()})),window.addEventListener("fullscreenchange",()=>this._OnFullscreenChange()),window.addEventListener("webkitfullscreenchange",()=>this._OnFullscreenChange()),window.addEventListener("mozfullscreenchange",()=>this._OnFullscreenChange()),window.addEventListener("fullscreenerror",(a)=>this._OnFullscreenError(a)),window.addEventListener("webkitfullscreenerror",(a)=>this._OnFullscreenError(a)),window.addEventListener("mozfullscreenerror",(a)=>this._OnFullscreenError(a)),window.addEventListener("keydown",(a)=>this._OnKeyEvent("keydown",a)),window.addEventListener("keyup",(a)=>this._OnKeyEvent("keyup",a)),window.addEventListener("mousemove",(a)=>this._OnMouseEvent("mousemove",a)),window.addEventListener("mousedown",(a)=>this._OnMouseEvent("mousedown",a)),window.addEventListener("mouseup",(a)=>this._OnMouseEvent("mouseup",a)),window.addEventListener("dblclick",(a)=>this._OnMouseEvent("dblclick",a)),window.addEventListener("wheel",(a)=>this._OnMouseWheelEvent("wheel",a)),"undefined"==typeof PointerEvent?(window.addEventListener("touchstart",(a)=>this._OnTouchEvent("pointerdown",a)),window.addEventListener("touchmove",(a)=>this._OnTouchEvent("pointermove",a)),window.addEventListener("touchend",(a)=>this._OnTouchEvent("pointerup",a)),window.addEventListener("touchcancel",(a)=>this._OnTouchEvent("pointercancel",a))):(window.addEventListener("pointerdown",(a)=>this._OnPointerEvent("pointerdown",a)),window.addEventListener("pointermove",(a)=>this._OnPointerEvent("pointermove",a)),window.addEventListener("pointerup",(a)=>this._OnPointerEvent("pointerup",a)),window.addEventListener("pointercancel",(a)=>this._OnPointerEvent("pointercancel",a)));const a=()=>this._PlayPendingMedia();window.addEventListener("pointerup",a,!0),window.addEventListener("touchend",a,!0),window.addEventListener("click",a,!0),window.addEventListener("keydown",a,!0),window.addEventListener("gamepadconnected",a,!0)}_AttachDeviceOrientationEvent(){this._attachedDeviceOrientationEvent||(this._attachedDeviceOrientationEvent=!0,window.addEventListener("deviceorientation",(a)=>this._OnDeviceOrientation(a)))}_AttachDeviceMotionEvent(){this._attachedDeviceMotionEvent||(this._attachedDeviceMotionEvent=!0,window.addEventListener("devicemotion",(a)=>this._OnDeviceMotion(a)))}_PostRuntimeEvent(a,b){this.PostToRuntime(a,b||null,!0)}_OnWindowResize(){this.PostToRuntime("window-resize",{"innerWidth":window.innerWidth,"innerHeight":window.innerHeight,"devicePixelRatio":window.devicePixelRatio},!0)}_OnSetTargetOrientation(a){this._targetOrientation=a["targetOrientation"]}_TrySetTargetOrientation(){const a=this._targetOrientation;if(screen["orientation"]&&screen["orientation"]["lock"])screen["orientation"]["lock"](a).catch((a)=>console.warn("[Construct 3] Failed to lock orientation: ",a));else try{let b=!1;screen["lockOrientation"]?b=screen["lockOrientation"](a):screen["webkitLockOrientation"]?b=screen["webkitLockOrientation"](a):screen["mozLockOrientation"]?b=screen["mozLockOrientation"](a):screen["msLockOrientation"]&&(b=screen["msLockOrientation"](a)),b||console.warn("[Construct 3] Failed to lock orientation")}catch(a){console.warn("[Construct 3] Failed to lock orientation: ",a)}}_OnFullscreenChange(){const a=RuntimeInterface.IsDocumentFullscreen();a&&"any"!==this._targetOrientation&&this._TrySetTargetOrientation(),this.PostToRuntime("fullscreenchange",{"isFullscreen":a,"innerWidth":window.innerWidth,"innerHeight":window.innerHeight})}_OnFullscreenError(a){console.warn("[Construct 3] Fullscreen request failed: ",a),this.PostToRuntime("fullscreenerror",{"isFullscreen":RuntimeInterface.IsDocumentFullscreen(),"innerWidth":window.innerWidth,"innerHeight":window.innerHeight})}_OnVisibilityChange(a){a?this._iRuntime._CancelAnimationFrame():this._iRuntime._RequestAnimationFrame(),this.PostToRuntime("visibilitychange",{"hidden":a})}_OnKeyEvent(a,b){this._PostToRuntimeMaybeSync(a,{"code":b.code,"key":b.key,"which":b.which,"repeat":b.repeat,"altKey":b.altKey,"ctrlKey":b.ctrlKey,"metaKey":b.metaKey,"shiftKey":b.shiftKey,"timeStamp":b.timeStamp},!0)}_OnMouseEvent(b,c){a(c)||("mousedown"===b&&window!==window.top&&window.focus(),this._PostToRuntimeMaybeSync(b,{"button":c.button,"clientX":c.clientX,"clientY":c.clientY,"timeStamp":c.timeStamp},!0))}_OnMouseWheelEvent(a,b){this.PostToRuntime(a,{"clientX":b.clientX,"clientY":b.clientY,"deltaX":b.deltaX,"deltaY":b.deltaY,"deltaZ":b.deltaZ,"deltaMode":b.deltaMode,"timeStamp":b.timeStamp},!0)}_OnPointerEvent(a,b){"pointerdown"===a&&window!==window.top&&window.focus(),this._PostToRuntimeMaybeSync(a,{"pointerId":b.pointerId,"pointerType":b.pointerType,"clientX":b.clientX,"clientY":b.clientY,"width":b.width||0,"height":b.height||0,"pressure":b.pressure||0,"tangentialPressure":b["tangentialPressure"]||0,"tiltX":b.tiltX||0,"tiltY":b.tiltY||0,"twist":b["twist"]||0,"timeStamp":b.timeStamp},!0)}_OnTouchEvent(a,b){"pointerdown"===a&&window!==window.top&&window.focus();for(let c=0,d=b.changedTouches.length;c<d;++c){const d=b.changedTouches[c];this._PostToRuntimeMaybeSync(a,{"pointerId":d.identifier,"pointerType":"touch","clientX":d.clientX,"clientY":d.clientY,"width":2*(d["radiusX"]||d["webkitRadiusX"]||d["mozRadiusX"]||d["msRadiusX"]||0),"height":2*(d["radiusY"]||d["webkitRadiusY"]||d["mozRadiusY"]||d["msRadiusY"]||0),"pressure":d["force"]||d["webkitForce"]||d["mozForce"]||d["msForce"]||0,"tangentialPressure":0,"tiltX":0,"tiltY":0,"twist":d["rotationAngle"]||0,"timeStamp":b.timeStamp},!0)}}_OnDeviceOrientation(a){this.PostToRuntime("deviceorientation",{"alpha":a["alpha"]||0,"beta":a["beta"]||0,"gamma":a["gamma"]||0,"timeStamp":a.timeStamp},!0)}_OnDeviceMotion(a){let b=0,c=0,d=0,e=0,f=0,g=0;const h=a["accelerationIncludingGravity"];h&&(b=h["x"]||0,c=h["y"]||0,d=h["z"]||0);const i=a["acceleration"];i&&(e=i["x"]||0,f=i["y"]||0,g=i["z"]||0),this.PostToRuntime("devicemotion",{"acceleration":{"x":e,"y":f,"z":g},"accelerationWithG":{"x":b,"y":c,"z":d},"timeStamp":a.timeStamp},!0)}_OnUpdateCanvasSize(a){const b=this.GetRuntimeInterface(),c=b.GetCanvas();c.style.width=a["styleWidth"]+"px",c.style.height=a["styleHeight"]+"px",c.style.marginLeft=a["marginLeft"]+"px",c.style.marginTop=a["marginTop"]+"px",b.MaybeForceBodySize(),this._isFirstSizeUpdate&&(c.style.display="",this._isFirstSizeUpdate=!1)}_OnInvokeDownload(b){const c=b["url"],d=b["filename"],e=document.createElement("a"),a=document.body;e.textContent=d,e.href=c,e.download=d,a.appendChild(e),e.click(),a.removeChild(e)}async _OnRasterSvgImage(a){const b=a["blob"],d=a["width"],e=a["height"],f=await c(b),g=await self["C3_RasterSvgImage"](f,d,e);return await createImageBitmap(g)}_PlayPendingMedia(){const a=[...this._mediaPendingPlay];if(this._mediaPendingPlay.clear(),!this._isSilent)for(const b of a){const a=b.play();a&&a.catch(()=>{this._mediaRemovedPendingPlay.has(b)||this._mediaPendingPlay.add(b)})}}TryPlayMedia(a){if("function"!=typeof a.play)throw new Error("missing play function");this._mediaRemovedPendingPlay.delete(a);let b;try{b=a.play()}catch(b){return void this._mediaPendingPlay.add(a)}b&&b.catch(()=>{this._mediaRemovedPendingPlay.has(a)||this._mediaPendingPlay.add(a)})}RemovePendingPlay(a){this._mediaPendingPlay.delete(a),this._mediaRemovedPendingPlay.add(a)}SetSilent(a){this._isSilent=!!a}_OnDebugHighlight(a){const b=a["show"];if(!b)return void(this._debugHighlightElem&&(this._debugHighlightElem.style.display="none"));this._debugHighlightElem||(this._debugHighlightElem=document.createElement("div"),this._debugHighlightElem.id="inspectOutline",document.body.appendChild(this._debugHighlightElem));const c=this._debugHighlightElem;c.style.display="",c.style.left=a["left"]-1+"px",c.style.top=a["top"]-1+"px",c.style.width=a["width"]+2+"px",c.style.height=a["height"]+2+"px",c.textContent=a["name"]}_OnRegisterSW(){window["C3_RegisterSW"]&&window["C3_RegisterSW"]()}_OnPostToDebugger(a){window["c3_postToMessagePort"]&&(a["from"]="runtime",window["c3_postToMessagePort"](a))}};RuntimeInterface.AddDOMHandlerClass(f)}

"use strict";{const a=document.currentScript.src;self.JobSchedulerDOM=class{constructor(b){this._runtimeInterface=b,this._baseUrl=a?a.substr(0,a.lastIndexOf("/")+1):b.GetBaseURL(),this._maxNumWorkers=Math.min(navigator.hardwareConcurrency||2,16),this._dispatchWorker=null,this._jobWorkers=[],this._inputPort=null,this._outputPort=null}async Init(){if(this._hasInitialised)throw new Error("already initialised");this._hasInitialised=!0;const a=this._runtimeInterface._GetWorkerURL("dispatchWorker.js");this._dispatchWorker=await this._runtimeInterface.CreateWorker(a,this._baseUrl,{name:"DispatchWorker"});const b=new MessageChannel;this._inputPort=b.port1,this._dispatchWorker.postMessage({"type":"_init","in-port":b.port2},[b.port2]),this._outputPort=await this._CreateJobWorker()}async _CreateJobWorker(){const a=this._jobWorkers.length,b=this._runtimeInterface._GetWorkerURL("jobWorker.js"),c=await this._runtimeInterface.CreateWorker(b,this._baseUrl,{name:"JobWorker"+a}),d=new MessageChannel,e=new MessageChannel;return this._dispatchWorker.postMessage({"type":"_addJobWorker","port":d.port1},[d.port1]),c.postMessage({"type":"init","number":a,"dispatch-port":d.port2,"output-port":e.port2},[d.port2,e.port2]),this._jobWorkers.push(c),e.port1}GetPortData(){return{"inputPort":this._inputPort,"outputPort":this._outputPort,"maxNumWorkers":this._maxNumWorkers}}GetPortTransferables(){return[this._inputPort,this._outputPort]}}}

"use strict";if(window["C3_IsSupported"]){const a=false,b="undefined"!=typeof OffscreenCanvas;window["c3_runtimeInterface"]=new RuntimeInterface({useWorker:a&&b,workerMainUrl:"workerMain.js",engineScripts:["scripts/c3runtime.js"],scriptFolder:"scripts/",exportType:"html5"})}"use strict";{function a(a){a.stopPropagation()}const b=class extends DOMElementHandler{constructor(a){super(a,"progress-bar")}CreateElement(b,c){const d=document.createElement("progress");return d.style.position="absolute",d.style.userSelect="none",d.style.webkitUserSelect="none",d.addEventListener("touchstart",a),d.addEventListener("touchmove",a),d.addEventListener("touchend",a),d.addEventListener("mousedown",a),d.addEventListener("mouseup",a),d.addEventListener("click",()=>this._PostToRuntimeElementMaybeSync("click",b)),this.UpdateState(d,c),d}UpdateState(a,b){a.title=b["title"],a.id=b["id"];const c=b["value"],d=b["max"];0<d&&0<=c?(a.max=d,a.value=c):(a.removeAttribute("value"),a.removeAttribute("max"))}};RuntimeInterface.AddDOMHandlerClass(b)}"use strict";{function a(a){a.stopPropagation()}const b=class extends DOMElementHandler{constructor(a){super(a,"button")}CreateElement(b,c){const d=document.createElement("input"),e=c["isCheckbox"];let f=d;if(e){d.type="checkbox";const a=document.createElement("label");a.appendChild(d),a.appendChild(document.createTextNode("")),a.style.fontFamily="sans-serif",a.style.userSelect="none",a.style.webkitUserSelect="none",a.style.display="inline-block",a.style.color="black",f=a}else d.type="button";return f.style.position="absolute",f.addEventListener("touchstart",a),f.addEventListener("touchmove",a),f.addEventListener("touchend",a),f.addEventListener("mousedown",a),f.addEventListener("mouseup",a),f.addEventListener("keydown",a),f.addEventListener("keyup",a),d.addEventListener("click",()=>this._PostToRuntimeElementMaybeSync("click",b,{"isChecked":d.checked})),this.UpdateState(f,c),f}_GetInputElem(a){return"input"===a.tagName.toLowerCase()?a:a.firstChild}UpdateState(a,b){const c=this._GetInputElem(a);c.id=b["id"],c.checked=b["isChecked"],c.disabled=!b["isEnabled"],a.title=b["title"],a===c?c.value=b["text"]:a.lastChild.textContent=b["text"]}};RuntimeInterface.AddDOMHandlerClass(b)}