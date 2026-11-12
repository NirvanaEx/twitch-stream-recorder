import assert from "node:assert/strict";
import { test } from "node:test";
import { createChatImageWarmer, upcomingChatImages } from "./chat-image-cache";
import type { ChatMessage, EmoteEntry } from "./chat-render";

const emotes = new Map<string, EmoteEntry>([
  ["cat", {id:"cat",name:"cat",url:"https://images.example/cat.webp",animated:true}],
  ["dog", {id:"dog",name:"dog",url:"https://images.example/dog.webp",animated:true}],
]);
const message = (time: number, text = "cat"): ChatMessage => ({
  id:String(time),relativeTimeSec:time,textRaw:text,authorLogin:"viewer",
});

test("image lookahead follows playback speed, skips old messages and deduplicates URLs", () => {
  const rows = [message(99,"dog"),message(105),message(110),message(120,"dog"),message(131,"cat")];
  assert.deepEqual(upcomingChatImages(rows,emotes,100,1).map(i=>i.url),["https://images.example/cat.webp"]);
  assert.deepEqual(upcomingChatImages(rows,emotes,100,2).map(i=>i.url),["https://images.example/cat.webp","https://images.example/dog.webp"]);
  assert.equal(upcomingChatImages([message(161)],emotes,100,10).length,0,"At most 60 seconds ahead");
});

test("lookahead includes native Twitch emotes and bounds work in a flooded chat", () => {
  const rows=Array.from({length:1000},(_,i)=>({...message(101+i/100,"Kappa"),emotes:`${i}:0-4`}));
  assert.equal(upcomingChatImages(rows,emotes,100,2).length,32);
  const repeat=Array.from({length:300},(_,i)=>message(101+i/100));
  assert.equal(upcomingChatImages([...repeat,message(105,"dog")],emotes,100,2).length,1,"Scan at most 300 rows");
});

test("warmup shares downloads, limits concurrency, remembers fallback and evicts old decoded images", () => {
  const timers=new Map<number,()=>void>();let nextTimer=0;
  const oldWindow=globalThis.window;
  Object.assign(globalThis,{window:{setTimeout:(fn:()=>void)=>{timers.set(++nextTimer,fn);return nextTimer;},clearTimeout:(id:number)=>timers.delete(id)}});
  class FakeImage {
    src="";decoding="";loading="";fetchPriority="";
    onload: (()=>void)|null=null;onerror:(()=>void)|null=null;
    removeAttribute(){this.src="";}
  }
  const images:FakeImage[]=[];
  const warmer=createChatImageWarmer(()=>{const i=new FakeImage();images.push(i);return i as unknown as HTMLImageElement;});
  let completed=0;
  const finishAll=()=>{while(completed<images.length) images[completed++].onload?.();};
  try {
    const urls=Array.from({length:8},(_,i)=>({url:`https://images.example/${i}.webp`}));
    warmer.warm([...urls,...urls]); assert.equal(images.length,4);
    assert.ok(images.every(i=>i.loading==="eager"&&i.fetchPriority==="low"));
    finishAll();assert.equal(images.length,8);
    warmer.warm(urls);assert.equal(images.length,8,"Ready images are retained without a new download");
    warmer.warm([{url:"https://images.example/missing",fallbackUrl:"https://cdn.example/fallback"}]);
    const failed=images.at(-1)!; failed.onerror?.();
    assert.equal(failed.src,"https://cdn.example/fallback");
    assert.equal(warmer.source("https://images.example/missing"),"https://cdn.example/fallback");
    finishAll();
    for(let group=0;group<5;group++) {
      warmer.warm(Array.from({length:16},(_,i)=>({url:`https://images.example/bounded-${group*16+i}`})));finishAll();
    }
    const before=images.length;
    warmer.warm([{url:"https://images.example/bounded-79"}]);assert.equal(images.length,before);
    warmer.warm([{url:"https://images.example/bounded-0"}]);assert.equal(images.length,before+1);
    finishAll();assert.equal(timers.size,0,"Completed jobs release their timers");
  } finally {Object.assign(globalThis,{window:oldWindow});}
});
