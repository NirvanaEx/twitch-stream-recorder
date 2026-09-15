import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { buildTwitchNativeChatBridge } from "./twitch-native-chat";
import { buildTwitchAudioPayload } from "./twitch-audio-script";

test("native chat offset never changes media or other Redux reducers, survives updates, and restores", () => {
  const dom = new JSDOM('<!doctype html><video></video>', {url:'https://www.twitch.tv/videos/123',runScripts:'outside-only'});
  try {
    const w = dom.window;
    const root=w.document.documentElement;
    const video=w.document.querySelector('video')!;
    video.currentTime=100;
    const timeType='vodChat.video.CURRENT_VIDEO_TIME_CHANGED';
    const original=(state:any={comments:{currentVideoTime:100}},action:any)=>action.type===timeType?{comments:{currentVideoTime:Math.floor(action.updatedTime)}}:state;
    let state:any={vodChat:original(undefined,{}),otherClock:100};
    const store={reducers:{vodChat:original},dispatch(action:any){state={vodChat:this.reducers.vodChat(state.vodChat,action),otherClock:action.updatedTime??state.otherClock};},getReduxStore(){return this;}};
    const factory=new Function('/* Reducer already registered: getReduxStore */');
    const runtime=Object.assign(()=>({app:{store}}),{m:{store:factory}});
    const chunks:any=[];
    chunks.push=(chunk:any)=>chunk[2](runtime);
    (w as any).webpackChunktwitch_twilight=chunks;
    root.setAttribute('data-tsr-native-chat-mode','twitch');
    root.setAttribute('data-tsr-native-chat-offset','15');
    w.eval(buildTwitchNativeChatBridge());
    assert.equal(root.getAttribute('data-tsr-native-chat-status'),'ready');
    assert.equal(state.vodChat.comments.currentVideoTime,115);
    assert.equal(state.otherClock,100);
    assert.equal(video.currentTime,100);
    store.dispatch({type:timeType,updatedTime:200});
    assert.equal(state.vodChat.comments.currentVideoTime,215);
    assert.equal(state.otherClock,200);
    root.setAttribute('data-tsr-native-chat-offset','-150');
    w.dispatchEvent(new w.Event('tsr-native-chat-update'));
    assert.equal(state.vodChat.comments.currentVideoTime,0);
    root.setAttribute('data-tsr-native-chat-mode','record');
    w.dispatchEvent(new w.Event('tsr-native-chat-update'));
    assert.equal(store.reducers.vodChat,original);
    assert.equal(state.vodChat.comments.currentVideoTime,100);
    assert.equal(video.currentTime,100);
    root.setAttribute('data-tsr-native-chat-mode','twitch');
    root.setAttribute('data-tsr-native-chat-offset','15');
    w.dispatchEvent(new w.Event('tsr-native-chat-update'));
    const firstWrapper=store.reducers.vodChat;
    store.reducers.vodChat=(state:any,action:any)=>firstWrapper(state,action);
    w.dispatchEvent(new w.Event('tsr-native-chat-update'));
    assert.equal(root.getAttribute('data-tsr-native-chat-status'),'unavailable');
    root.setAttribute('data-tsr-native-chat-offset','0');
    w.dispatchEvent(new w.Event('tsr-native-chat-update'));
    root.setAttribute('data-tsr-native-chat-offset','15');
    w.dispatchEvent(new w.Event('tsr-native-chat-update'));
    assert.equal(state.vodChat.comments.currentVideoTime,115,'a replaced reducer must never apply the offset twice');
  } finally {dom.window.close();}
});

test("complete served payload stays syntactically valid with the serialized bridge", () => {
  const payload=buildTwitchAudioPayload('https://stream.neyron.site');
  assert.doesNotThrow(()=>new Function(payload));
  assert.match(payload,/nativeChatOffset: nativeChatOffset/);
  assert.match(payload,/setActiveChatOffset\(activeChatOffset\(\) - 5\)/);
});
